import { parseTimeFromReps } from "@/lib/executionAudio";
import PerformanceCapture from "./PerformanceCapture";
import { Pause, Play, SkipForward, SkipBack, X, Clock } from "lucide-react";

export default function ExecutionActive({
  execState, currentBloc, currentExercise, totalRounds, totalBlocs, totalExercises,
  restBetweenRoundsSecs, onNext, onPrev, onTogglePause, onExit,
  perfData, onPerfChange
}) {
  const { phase, round, exerciseIndex, restRemaining, exerciseTimeRemaining, isPaused } = execState;
  const blocTitle = currentBloc?.titre || `Bloc ${execState.blocIndex + 1}`;
  const nbSeries = currentBloc?.nb_series || currentExercise?.sets || null;

  const restTotal = phase === "rest"
    ? (currentExercise?.rest_seconds || currentBloc?.repos_entre_exercices || 60)
    : restBetweenRoundsSecs;
  const exerciseTotal = currentExercise ? parseTimeFromReps(currentExercise.reps) : 0;
  const isRest = phase === "rest" || phase === "rest_between_rounds";

  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary-foreground/10">
        <div className="text-sm flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-secondary">{blocTitle}</span>
          <span className="text-primary-foreground/30">·</span>
          <span className="text-primary-foreground/60">Exercice {exerciseIndex + 1}/{totalExercises}</span>
          {totalRounds > 1 && <>
            <span className="text-primary-foreground/30">·</span>
            <span className="text-secondary font-semibold">Tour {round}/{totalRounds}</span>
          </>}
        </div>
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md" title="Quitter"><X className="w-5 h-5" /></button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {phase === "exercise" && (
          <div className="text-center max-w-lg">
            {currentExercise?.media_url && <img src={currentExercise.media_url} alt={currentExercise?.name} className="w-full max-w-sm h-48 object-cover rounded-xl mb-6" />}
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-3">Exercice en cours</p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">{currentExercise?.name}</h1>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div>
                <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mb-1">Séries</p>
                <p className="font-heading text-4xl font-bold">{nbSeries || "—"}</p>
              </div>
              <div className="text-primary-foreground/20 text-4xl font-heading">×</div>
              <div>
                <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mb-1">Répétitions</p>
                <p className="font-heading text-4xl font-bold">{currentExercise?.reps || "—"}</p>
              </div>
            </div>
            {currentExercise?.intensity && (
              <div className="inline-block bg-secondary/20 px-4 py-2 rounded-full mb-4">
                <p className="text-sm font-semibold text-secondary">{currentExercise.intensity}</p>
              </div>
            )}
            {currentExercise?.description && (
              <p className="text-primary-foreground/60 mb-6">{currentExercise.description}</p>
            )}
            {exerciseTimeRemaining !== null && exerciseTimeRemaining > 0 && (
              <CountdownRing remaining={exerciseTimeRemaining} total={exerciseTotal} label="Minuteur" />
            )}
          </div>
        )}

        {phase === "rest" && (
          <div className="flex flex-col items-center w-full">
            <CountdownRing remaining={restRemaining} total={restTotal} label="Repos" large />
            <PerformanceCapture exercise={currentExercise} perf={perfData?.[currentExercise?.id]} onChange={(f, val) => onPerfChange(currentExercise?.id, f, val)} />
          </div>
        )}

        {phase === "rest_between_rounds" && (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-secondary mb-5">Récupération</p>
            <h2 className="font-heading text-2xl md:text-4xl font-bold text-primary-foreground mb-10">Début du prochain tour dans</h2>
            <div className="relative w-64 h-64 md:w-72 md:h-72 mb-2">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary-foreground/10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-secondary transition-all duration-1000 ease-linear" strokeDasharray={282.7} strokeDashoffset={282.7 * (1 - restRemaining / (restBetweenRoundsSecs || 1))} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-heading text-8xl md:text-9xl font-bold leading-none">{restRemaining}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50 mt-3">secondes</span>
              </div>
            </div>
            <PerformanceCapture exercise={currentExercise} perf={perfData?.[currentExercise?.id]} onChange={(f, val) => onPerfChange(currentExercise?.id, f, val)} />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-6 border-t border-primary-foreground/10">
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          <button onClick={onPrev} className="p-3.5 hover:bg-primary-foreground/10 rounded-full transition-colors" title="Précédent">
            <SkipBack className="w-6 h-6" />
          </button>
          <button onClick={onTogglePause} className="p-5 bg-primary-foreground text-primary rounded-full transition-colors hover:scale-105" title={isPaused ? "Reprendre" : "Pause"}>
            {isPaused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
          </button>
          <button onClick={onNext} className="p-3.5 bg-secondary text-secondary-foreground rounded-full transition-colors hover:scale-105" title="Suivant">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        {isPaused && <p className="text-center text-sm text-primary-foreground/50 mt-3">En pause</p>}
        {!isPaused && isRest && <p className="text-center text-sm text-primary-foreground/40 mt-3">Suivant pour passer le repos</p>}
      </div>
    </div>
  );
}

function CountdownRing({ remaining, total, label, large }) {
  const circumference = 282.7;
  const offset = circumference * (1 - remaining / (total || 1));
  const size = large ? "w-52 h-52" : "w-36 h-36";
  const fontSize = large ? "text-7xl" : "text-4xl";

  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-5">{label}</p>
      <div className={`relative ${size} mb-3`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-primary-foreground/10" />
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary transition-all duration-1000 ease-linear" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-heading font-bold ${fontSize}`}>{remaining}</span>
        </div>
      </div>
      <p className="text-sm text-primary-foreground/50 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> secondes
      </p>
    </div>
  );
}