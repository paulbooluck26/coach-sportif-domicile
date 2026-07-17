import { CheckCircle2, X } from "lucide-react";

// Écran de saisie des performances affiché à la fin d'un tour (ou d'un bloc
// lorsqu'il n'y a qu'un seul tour), avant le repos. Regroupe tous les exercices
// du tour qui vient d'être réalisé. Les valeurs sont pré-remplies depuis
// perfData (accumulé durant la séance et pré-chargé depuis l'exécution précédente).
export default function ExecutionPerfCapture({ bloc, exercices, perfData, onPerfChange, onValidate, onExit, isLastRound, isLastBloc }) {
  const exos = exercices || [];
  const bouton = isLastBloc ? "Terminer la séance" : "Lancer le repos";

  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-primary-foreground/10">
        <div className="text-sm flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-secondary">{bloc?.titre}</span>
          <span className="text-primary-foreground/30">·</span>
          <span className="text-primary-foreground/60">Performances du tour</span>
        </div>
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md" title="Quitter"><X className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-6 py-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-2">Tour terminé</p>
        <h1 className="font-heading text-3xl font-bold mb-1">Renseigne tes performances</h1>
        <p className="text-primary-foreground/60 mb-8 text-sm">
          Complète si besoin, puis lance le repos. Les valeurs sont pré-remplies — tu peux les laisser telles quelles.
        </p>

        <div className="space-y-4">
          {exos.map((ex, i) => {
            const v = perfData?.[ex.id] || {};
            return (
              <div key={ex.id || i} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <p className="font-semibold">{ex.name}</p>
                  {ex.reps && <span className="text-xs text-primary-foreground/40 ml-auto">Prévu : {ex.reps}</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 pl-8">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-primary-foreground/40 mb-1">Charge (kg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={v.charge ?? ""}
                      onChange={(e) => onPerfChange(ex.id, "charge", e.target.value)}
                      placeholder="—"
                      className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-primary-foreground/40 mb-1">Répétitions réalisées</label>
                    <input
                      type="text"
                      value={v.reps ?? ""}
                      onChange={(e) => onPerfChange(ex.id, "reps", e.target.value)}
                      placeholder="—"
                      className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-3 py-2.5 text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-6 py-6 border-t border-primary-foreground/10 sticky bottom-0 bg-primary">
        <button
          onClick={onValidate}
          className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-4 rounded-full text-lg font-semibold hover:scale-[1.01] transition-transform"
        >
          <CheckCircle2 className="w-5 h-5" /> {bouton}
        </button>
        {!isLastBloc && (
          <p className="text-center text-xs text-primary-foreground/40 mt-3">
            {isLastRound ? "Le repos entre les blocs démarrera automatiquement." : "Le repos entre les tours démarrera automatiquement."}
          </p>
        )}
      </div>
    </div>
  );
}