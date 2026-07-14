import { Play, X, Clock } from "lucide-react";
import { parseTimeFromReps } from "@/lib/executionAudio";

function estimateDuration(blocs) {
  let sec = 0;
  blocs.forEach((b) => {
    const rounds = b.rounds || 1;
    let perRound = 0;
    (b.exercices || []).forEach((ex) => {
      const t = parseTimeFromReps(ex.reps);
      const sets = ex.sets || 1;
      perRound += (t > 0 ? t : 45) * sets;
      perRound += ex.rest_seconds || b.repos_entre_exercices || 60;
    });
    sec += perRound * rounds;
    if (rounds > 1) {
      sec += (rounds - 1) * (b.rest_between_rounds_unit === "minutes" ? (b.rest_between_rounds || 60) * 60 : (b.rest_between_rounds || 60));
    }
  });
  return Math.max(1, Math.round(sec / 60));
}

export default function ExecutionWelcome({ sessionData, onStart, onExit }) {
  const duree = estimateDuration(sessionData.blocs);
  const totalEx = sessionData.blocs.reduce((acc, b) => acc + (b.exercices?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col">
      <div className="flex items-center justify-end px-6 py-4">
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full pb-10 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-3">Prêt à démarrer ?</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-4">{sessionData.seance?.titre}</h1>
        {sessionData.seance?.description && <p className="text-primary-foreground/60 text-center mb-6">{sessionData.seance.description}</p>}

        <div className="flex items-center gap-3 text-sm text-primary-foreground/70 mb-8">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-secondary" /> ~{duree} min</span>
          <span className="opacity-40">·</span>
          <span>{sessionData.blocs.length} blocs</span>
          <span className="opacity-40">·</span>
          <span>{totalEx} exercices</span>
        </div>

        <div className="w-full mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50 mb-3 text-center">Aperçu de la séance</p>
          <div className="space-y-3">
            {sessionData.blocs.map((b, i) => (
              <div key={b.id} className="bg-primary-foreground/5 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded bg-secondary/20 text-secondary flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                  <span className="font-medium">{b.titre}</span>
                  {b.rounds > 1 && <span className="text-xs text-primary-foreground/40 ml-auto">{b.rounds} tours</span>}
                </div>
                {b.exercices?.length > 0 && (
                  <ul className="mt-2 ml-10 space-y-1">
                    {b.exercices.map((ex) => (
                      <li key={ex.id} className="text-sm flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-secondary/60 shrink-0" />
                        <span className="font-medium text-primary-foreground/90">{ex.name}</span>
                        <span className="text-primary-foreground/40">· {ex.reps}{ex.sets ? ` × ${ex.sets}` : ""}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        <button onClick={onStart} className="bg-secondary text-secondary-foreground px-10 py-4 rounded-full text-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
          <Play className="w-5 h-5" /> Démarrer
        </button>
      </div>
    </div>
  );
}