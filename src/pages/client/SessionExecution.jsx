import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { playBeep, playDoubleBeep, parseTimeFromReps } from "@/lib/executionAudio";
import ExecutionActive from "@/components/execution/ExecutionActive";
import ExecutionComplete from "@/components/execution/ExecutionComplete";

export default function SessionExecution() {
  const { user } = useAuth();
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState(null);
  const [execState, setExecState] = useState({
    blocIndex: 0, round: 1, exerciseIndex: 0, phase: "loading",
    restRemaining: 0, exerciseTimeRemaining: null, isPaused: false,
  });
  const [executionId, setExecutionId] = useState(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!seanceId) return;
    (async () => {
      try {
        const seance = await base44.entities.SeanceProgramme.get(seanceId);
        const blocs = await base44.entities.Bloc.filter({ seance_programme_id: seanceId }, "ordre");
        const blocsWithEx = await Promise.all(
          blocs.map(async (b) => {
            const exercices = await base44.entities.Exercice.filter({ bloc_id: b.id }, "order");
            return { ...b, exercices };
          })
        );
        setSessionData({ seance, blocs: blocsWithEx });
        const firstTime = parseTimeFromReps(blocsWithEx[0]?.exercices?.[0]?.reps);
        setExecState({
          blocIndex: 0, round: 1, exerciseIndex: 0, phase: "exercise",
          restRemaining: 0, exerciseTimeRemaining: firstTime > 0 ? firstTime : null, isPaused: false,
        });
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

  const handleNext = () => {
    setExecState(prev => {
      if (!sessionData || prev.phase === "complete") return prev;
      const blocs = sessionData.blocs;
      const bloc = blocs[prev.blocIndex];
      const exercises = bloc?.exercices || [];
      const rounds = bloc?.rounds || 1;
      const isLastExercise = prev.exerciseIndex >= exercises.length - 1;
      const isLastRound = prev.round >= rounds;
      const isLastBloc = prev.blocIndex >= blocs.length - 1;

      if (prev.phase === "exercise") {
        if (isLastExercise) {
          if (!isLastRound) {
            const restSecs = bloc.rest_between_rounds_unit === "minutes"
              ? (bloc.rest_between_rounds || 60) * 60
              : (bloc.rest_between_rounds || 60);
            playBeep();
            return { ...prev, phase: "rest_between_rounds", restRemaining: restSecs, exerciseTimeRemaining: null };
          } else if (!isLastBloc) {
            playBeep();
            return { ...prev, blocIndex: prev.blocIndex + 1, round: 1, exerciseIndex: 0, phase: "exercise", restRemaining: 0, exerciseTimeRemaining: computeNextTime(blocs, prev.blocIndex + 1, 0) };
          } else {
            playDoubleBeep();
            return { ...prev, phase: "complete", restRemaining: 0, exerciseTimeRemaining: null };
          }
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
      return prev;
    });
  };

  const handlePrev = () => {
    setExecState(prev => {
      if (!sessionData || prev.phase === "complete") return prev;
      const blocs = sessionData.blocs;
      const bloc = blocs[prev.blocIndex];
      const exercises = bloc?.exercices || [];

      if (prev.phase === "rest" || prev.phase === "rest_between_rounds") {
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
          const ex = prevBloc?.exercices?.[prevExIdx];
          const t = parseTimeFromReps(ex?.reps);
          return { ...prev, blocIndex: prev.blocIndex - 1, round: prevBloc?.rounds || 1, exerciseIndex: prevExIdx, exerciseTimeRemaining: t > 0 ? t : null };
        }
      }
      return prev;
    });
  };

  const togglePause = () => setExecState(prev => ({ ...prev, isPaused: !prev.isPaused }));

  // Countdown timers
  useEffect(() => {
    if (execState.isPaused || !sessionData || execState.phase === "complete") return;

    if ((execState.phase === "rest" || execState.phase === "rest_between_rounds") && execState.restRemaining > 0) {
      const timer = setTimeout(() => {
        setExecState(prev => ({ ...prev, restRemaining: prev.restRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (execState.phase === "exercise" && execState.exerciseTimeRemaining !== null && execState.exerciseTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setExecState(prev => ({ ...prev, exerciseTimeRemaining: prev.exerciseTimeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [execState.phase, execState.isPaused, execState.restRemaining, execState.exerciseTimeRemaining, sessionData]);

  // Auto-advance when timers reach 0
  const autoAdvanceRef = useRef(() => {});
  autoAdvanceRef.current = handleNext;
  useEffect(() => {
    if (execState.isPaused || !sessionData || execState.phase === "complete") return;

    if ((execState.phase === "rest" || execState.phase === "rest_between_rounds") && execState.restRemaining === 0) {
      const t = setTimeout(() => autoAdvanceRef.current(), 100);
      return () => clearTimeout(t);
    }
    if (execState.phase === "exercise" && execState.exerciseTimeRemaining === 0) {
      const t = setTimeout(() => autoAdvanceRef.current(), 100);
      return () => clearTimeout(t);
    }
  }, [execState.phase, execState.restRemaining, execState.exerciseTimeRemaining, execState.isPaused, sessionData]);

  // Create execution record on completion
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
        const exec = await base44.entities.ExecutionSeance.create({
          client_id: user.id,
          client_name: user.full_name || user.email,
          seance_programme_id: seanceId,
          seance_titre: seance?.titre || "",
          programme_id: programmeId,
          programme_name: programmeName,
          date_execution: new Date().toISOString().split("T")[0],
          statut: "termine",
          duree_minutes: duration,
        });
        setExecutionId(exec.id);
      } catch (e) {}
    })();
  }, [execState.phase, executionId, user, sessionData, seanceId]);

  if (!sessionData) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (sessionData.error) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-6">
        <div className="text-center text-primary-foreground">
          <p className="mb-4">Séance introuvable.</p>
          <button onClick={() => navigate("/espace-client/programme")} className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-semibold">Retour</button>
        </div>
      </div>
    );
  }

  if (sessionData.blocs.length === 0 || sessionData.blocs.every(b => b.exercices.length === 0)) {
    return (
      <div className="fixed inset-0 z-50 bg-primary flex items-center justify-center p-6">
        <div className="text-center text-primary-foreground">
          <p className="mb-4">Cette séance ne contient aucun exercice.</p>
          <button onClick={() => navigate("/espace-client/programme")} className="bg-primary-foreground text-primary px-6 py-3 rounded-md font-semibold">Retour au programme</button>
        </div>
      </div>
    );
  }

  if (execState.phase === "complete") {
    return <ExecutionComplete executionId={executionId} sessionData={sessionData} user={user} onDone={() => navigate("/espace-client/programme")} />;
  }

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
    />
  );
}