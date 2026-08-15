import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { playBeep, playDoubleBeep, parseTimeFromReps } from "@/lib/executionAudio";
import ExecutionActive from "@/components/execution/ExecutionActive";
import ExecutionComplete from "@/components/execution/ExecutionComplete";
import ExecutionWelcome from "@/components/execution/ExecutionWelcome";
import ExecutionBlocIntro from "@/components/execution/ExecutionBlocIntro";
import ExecutionPerfCapture from "@/components/execution/ExecutionPerfCapture";

export default function SessionExecution() {
  const { user } = useAuth();
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const plannedDate = new URLSearchParams(window.location.search).get("date");
  const [sessionData, setSessionData] = useState(null);
  const [execState, setExecState] = useState({
    blocIndex: 0, round: 1, exerciseIndex: 0, phase: "loading",
    restRemaining: 0, exerciseTimeRemaining: null, isPaused: false,
  });
  const [executionId, setExecutionId] = useState(null);
  const [perfData, setPerfData] = useState({});
  const startTimeRef = useRef(Date.now());
  const perfSavedRef = useRef(false);

  const setPerf = (exId, field, value) => setPerfData(d => ({ ...d, [exId]: { ...d[exId], [field]: value } }));

  useEffect(() => {
    if (!seanceId) return;
    (async () => {
      try {
        const seance = await base44.entities.SeanceProgramme.get(seanceId);
        const blocs = await base44.entities.Bloc.filter({ seance_programme_id: seanceId }, "ordre");
        const blocsWithEx = await Promise.all(
          blocs.map(async (b) => {
            const exercices = await base44.entities.Exercice.filter({ bloc_id: b.id }, "ordre");
            return { ...b, exercices };
          })
        );
        let initPerf = {};
        try {
          const prevExecs = await base44.entities.ExecutionSeance.filter({ seance_programme_id: seanceId, statut: "termine" }, "-date_execution", 1);
          if (prevExecs.length > 0) {
            const prevPerf = await base44.entities.PerformanceExercice.filter({ execution_id: prevExecs[0].id });
            prevPerf.forEach(p => {
              if (p.exercice_id) initPerf[p.exercice_id] = { charge: p.actual_weight ? String(p.actual_weight) : "", reps: p.actual_reps || "" };
            });
          }
        } catch (e) {}
        setPerfData(initPerf);
        setSessionData({ seance, blocs: blocsWithEx });
        setExecState({ blocIndex: 0, round: 1, exerciseIndex: 0, phase: "welcome", restRemaining: 0, exerciseTimeRemaining: null, isPaused: false });
      } catch (e) {
        setSessionData({ error: true });
      }
    })();
  }, [seanceId]);

  const currentBloc = sessionData?.blocs?.[execState.blocIndex];
  const currentExercise = currentBloc?.exercices?.[execState.exerciseIndex];
  const totalRounds = currentBloc?.rounds || 1;
  const restBetweenRoundsSecs = currentBloc?.rest_between_rounds_unit === "minutes"
    ? (currentBloc?.rest_between_rounds || 60) * 60
    : (currentBloc?.rest_between_rounds || 60);

  const computeNextTime = (blocs, bi, ei) => {
    const ex = blocs[bi]?.exercices?.[ei];
    if (!ex) return null;
    const t = parseTimeFromReps(ex.reps);
    return t > 0 ? t : null;
  };

  const handleStart = () => {
    startTimeRef.current = Date.now();
    setExecState(prev => ({ ...prev, phase: "bloc_intro" }));
  };

  const handleContinueBloc = () => {
    setExecState(prev => {
      const bloc = sessionData?.blocs?.[prev.blocIndex];
      const firstEx = bloc?.exercices?.[0];
      const firstTime = firstEx ? parseTimeFromReps(firstEx.reps) : 0;
      return { ...prev, phase: "exercise", exerciseTimeRemaining: firstTime > 0 ? firstTime : null, restRemaining: 0 };
    });
  };

  const handleNext = () => {
    setExecState(prev => {
      if (!sessionData || prev.phase === "complete" || prev.phase === "welcome" || prev.phase === "bloc_intro" || prev.phase === "perf_capture") return prev;
      const blocs = sessionData.blocs;
      const bloc = blocs[prev.blocIndex];
      const exercises = bloc?.exercices || [];
      const rounds = bloc?.rounds || 1;
      const isLastExercise = prev.exerciseIndex >= exercises.length - 1;
      const isLastRound = prev.round >= rounds;
      const isLastBloc = prev.blocIndex >= blocs.length - 1;

      if (prev.phase === "exercise") {
        if (isLastExercise) {
          playBeep();
          return { ...prev, phase: "perf_capture", restRemaining: 0, exerciseTimeRemaining: null };
        } else {
          const exercise = exercises[prev.exerciseIndex];
          const restSecs = exercise?.rest_seconds || bloc.repos_entre_exercices || 60;
          playBeep();
          return { ...prev, phase: "rest", restRemaining: restSecs, exerciseTimeRemaining: null };
        }
      }
      if (prev.phase === "rest") {
        playBeep();
        return { ...prev, exerciseIndex: prev.exerciseIndex + 1, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: computeNextTime(blocs, prev.blocIndex, prev.exerciseIndex + 1) };
      }
      if (prev.phase === "rest_between_rounds") {
        playBeep();
        return { ...prev, round: prev.round + 1, exerciseIndex: 0, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: computeNextTime(blocs, prev.blocIndex, 0) };
      }
      if (prev.phase === "rest_between_blocs") {
        playBeep();
        return { ...prev, blocIndex: prev.blocIndex + 1, round: 1, exerciseIndex: 0, phase: "bloc_intro", restRemaining: 0, exerciseTimeRemaining: null };
      }
      return prev;
    });
  };

  const handlePerfValidate = () => {
    setExecState(prev => {
      if (!sessionData || prev.phase !== "perf_capture") return prev;
      const blocs = sessionData.blocs;
      const bloc = blocs[prev.blocIndex];
      const rounds = bloc?.rounds || 1;
      const isLastRound = prev.round >= rounds;
      const isLastBloc = prev.blocIndex >= blocs.length - 1;
      const restSecs = bloc.rest_between_rounds_unit === "minutes" ? (bloc.rest_between_rounds || 60) * 60 : (bloc.rest_between_rounds || 60);
      if (!isLastRound) {
        playBeep();
        return { ...prev, phase: "rest_between_rounds", restRemaining: restSecs, exerciseTimeRemaining: null };
      }
      if (!isLastBloc) {
        playBeep();
        return { ...prev, phase: "rest_between_blocs", restRemaining: restSecs, exerciseTimeRemaining: null };
      }
      playDoubleBeep();
      return { ...prev, phase: "complete", restRemaining: 0, exerciseTimeRemaining: null };
    });
  };

  const handlePrev = () => {
    setExecState(prev => {
      if (!sessionData || prev.phase === "complete" || prev.phase === "welcome") return prev;
      const blocs = sessionData.blocs;
      const bloc = blocs[prev.blocIndex];
      const exercises = bloc?.exercices || [];

      if (prev.phase === "bloc_intro") {
        if (prev.blocIndex === 0) return prev;
        const prevBloc = blocs[prev.blocIndex - 1];
        const prevExIdx = (prevBloc?.exercices?.length || 1) - 1;
        const prevRound = prevBloc?.rounds || 1;
        const ex = prevBloc?.exercices?.[prevExIdx];
        const t = parseTimeFromReps(ex?.reps);
        return { ...prev, blocIndex: prev.blocIndex - 1, round: prevRound, exerciseIndex: prevExIdx, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: t > 0 ? t : null };
      }

      if (prev.phase === "rest") {
        const ex = exercises[prev.exerciseIndex];
        const t = parseTimeFromReps(ex?.reps);
        return { ...prev, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: t > 0 ? t : null };
      }
      if (prev.phase === "rest_between_rounds" || prev.phase === "rest_between_blocs") {
        return { ...prev, phase: "perf_capture", restRemaining: 0, exerciseTimeRemaining: null };
      }
      if (prev.phase === "perf_capture") {
        const ex = exercises[prev.exerciseIndex];
        const t = parseTimeFromReps(ex?.reps);
        return { ...prev, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: t > 0 ? t : null };
      }
      if (prev.phase === "exercise") {
        if (prev.exerciseIndex > 0) {
          const ex = exercises[prev.exerciseIndex - 1];
          const t = parseTimeFromReps(ex?.reps);
          return { ...prev, exerciseIndex: prev.exerciseIndex - 1, exerciseTimeRemaining: t > 0 ? t : null };
        }
        if (prev.round > 1) {
          const ex = exercises[exercises.length - 1];
          const t = parseTimeFromReps(ex?.reps);
          return { ...prev, round: prev.round - 1, exerciseIndex: exercises.length - 1, exerciseTimeRemaining: t > 0 ? t : null };
        }
        if (prev.blocIndex > 0) {
          const prevBloc = blocs[prev.blocIndex - 1];
          const prevExIdx = (prevBloc?.exercices?.length || 1) - 1;
          const prevRound = prevBloc?.rounds || 1;
          const ex = prevBloc?.exercices?.[prevExIdx];
          const t = parseTimeFromReps(ex?.reps);
          return { ...prev, blocIndex: prev.blocIndex - 1, round: prevRound, exerciseIndex: prevExIdx, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: t > 0 ? t : null };
        }
      }
      return prev;
    });
  };

  const togglePause = () => setExecState(prev => ({ ...prev, isPaused: !prev.isPaused }));

  useEffect(() => {
    if (execState.isPaused || !sessionData || execState.phase === "complete" || execState.phase === "welcome" || execState.phase === "bloc_intro") return;
    if ((execState.phase === "rest" || execState.phase === "rest_between_rounds" || execState.phase === "rest_between_blocs") && execState.restRemaining > 0) {
      const timer = setTimeout(() => setExecState(prev => ({ ...prev, restRemaining: prev.restRemaining - 1 })), 1000);
      return () => clearTimeout(timer);
    }
    if (execState.phase === "exercise" && execState.exerciseTimeRemaining !== null && execState.exerciseTimeRemaining > 0) {
      const timer = setTimeout(() => setExecState(prev => ({ ...prev, exerciseTimeRemaining: prev.exerciseTimeRemaining - 1 })), 1000);
      return () => clearTimeout(timer);
    }
  }, [execState.phase, execState.isPaused, execState.restRemaining, execState.exerciseTimeRemaining, sessionData]);

  const autoAdvanceRef = useRef(() => {});
  autoAdvanceRef.current = handleNext;
  useEffect(() => {
    if (execState.isPaused || !sessionData || execState.phase === "complete" || execState.phase === "welcome" || execState.phase === "bloc_intro") return;
    if ((execState.phase === "rest" || execState.phase === "rest_between_rounds" || execState.phase === "rest_between_blocs") && execState.restRemaining === 0) {
      const t = setTimeout(() => autoAdvanceRef.current(), 100);
      return () => clearTimeout(t);
    }
    if (execState.phase === "exercise" && execState.exerciseTimeRemaining === 0) {
      const t = setTimeout(() => autoAdvanceRef.current(), 100);
      return () => clearTimeout(t);
    }
  }, [execState.phase, execState.restRemaining, execState.exerciseTimeRemaining, execState.isPaused, sessionData]);

  useEffect(() => {
    if (execState.phase !== "complete" || executionId || !user || !sessionData) return;
    (async () => {
      try {
        const seance = sessionData.seance;
        let programmeId = "", programmeName = "";
        try {
          if (seance?.semaine_id) {
            const semaine = await base44.entities.Semaine.get(seance.semaine_id);
            programmeId = semaine?.programme_id || "";
            if (programmeId) {
              const programme = await base44.entities.Programme.get(programmeId);
              programmeName = programme?.name || "";
            }
          }
        } catch (e) {}
        const duration = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));
        let mode = "planning";
        try {
          const existing = await base44.entities.ExecutionSeance.filter({ client_id: user.id, seance_programme_id: seanceId });
          if (existing.length > 0) mode = "repetition";
          else if (plannedDate) {
            const pd = new Date(plannedDate + "T00:00:00");
            const t0 = new Date(); t0.setHours(0, 0, 0, 0);
            if (pd > t0 && (pd - t0) > 3 * 86400000) mode = "avance";
          }
        } catch (e) {}
        const exec = await base44.entities.ExecutionSeance.create({
          client_id: user.id, client_name: user.full_name || user.email,
          seance_programme_id: seanceId, seance_titre: seance?.titre || "",
          programme_id: programmeId, programme_name: programmeName,
          date_execution: new Date().toISOString().split("T")[0],
          statut: "termine", duree_minutes: duration, mode,
        });
        setExecutionId(exec.id);
      } catch (e) {}
    })();
  }, [execState.phase, executionId, user, sessionData, seanceId]);

  useEffect(() => {
    if (execState.phase !== "complete" || !executionId || !sessionData || perfSavedRef.current) return;
    perfSavedRef.current = true;
    (async () => {
      try {
        const records = sessionData.blocs.flatMap(b => (b.exercices || []).map(ex => {
          const v = perfData[ex.id];
          if (!v || (!v.reps && !v.charge)) return null;
          return {
            execution_id: executionId, exercice_id: ex.id, exercice_name: ex.name,
            planned_reps: ex.reps, planned_intensity: ex.intensity || "",
            actual_reps: v.reps || "", actual_weight: v.charge ? parseFloat(v.charge) || 0 : 0, notes: "",
          };
        }).filter(Boolean));
        if (records.length > 0) await base44.entities.PerformanceExercice.bulkCreate(records);
      } catch (e) {}
    })();
  }, [execState.phase, executionId, sessionData, perfData]);

  if (!sessionData) return <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /></div>;

  if (sessionData.error) return <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-6"><div className="text-center text-primary-foreground"><p className="mb-4">Séance introuvable.</p><button onClick={() => navigate("/espace-client/programme")} className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-semibold">Retour</button></div></div>;

  if (sessionData.blocs.length === 0 || sessionData.blocs.every(b => b.exercices.length === 0)) return <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-6"><div className="text-center text-primary-foreground"><p className="mb-4">Cette séance ne contient aucun exercice.</p><button onClick={() => navigate("/espace-client/programme")} className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-semibold">Retour au programme</button></div></div>;

  if (execState.phase === "welcome") return <ExecutionWelcome sessionData={sessionData} plannedDate={plannedDate} onStart={handleStart} onExit={() => navigate("/espace-client/programme")} />;
  if (execState.phase === "bloc_intro") return <ExecutionBlocIntro bloc={currentBloc} totalRounds={totalRounds} onContinue={handleContinueBloc} onPrev={execState.blocIndex > 0 ? handlePrev : undefined} onExit={() => navigate("/espace-client/programme")} />;
  if (execState.phase === "perf_capture") {
    const blocs = sessionData.blocs;
    const isLastRound = execState.round >= (currentBloc?.rounds || 1);
    const isLastBloc = execState.blocIndex >= blocs.length - 1;
    return <ExecutionPerfCapture bloc={currentBloc} exercices={currentBloc?.exercices} perfData={perfData} onPerfChange={setPerf} onValidate={handlePerfValidate} onExit={() => navigate("/espace-client/programme")} isLastRound={isLastRound} isLastBloc={isLastBloc} />;
  }
  if (execState.phase === "complete") return <ExecutionComplete executionId={executionId} sessionData={sessionData} user={user} onDone={() => navigate("/espace-client/programme")} />;

  return (
    <ExecutionActive
      execState={execState}
      currentBloc={currentBloc}
      currentExercise={currentExercise}
      totalRounds={totalRounds}
      totalBlocs={sessionData.blocs.length}
      totalExercises={currentBloc?.exercices?.length || 0}
      restBetweenRoundsSecs={restBetweenRoundsSecs}
      onNext={handleNext}
      onPrev={handlePrev}
      onTogglePause={togglePause}
      onExit={() => navigate("/espace-client/programme")}
      perfData={perfData}
      onPerfChange={setPerf}
    />
  );
}
