// Zone de saisie des performances affichée pendant les temps de repos du lecteur immersif.
// Champs : charge utilisée (kg), répétitions réalisées, commentaire / ressenti.
// Non obligatoire. Sombre pour s'intégrer au lecteur.
export default function PerformanceCapture({ exercise, perf, onChange }) {
  if (!exercise) return null;
  const v = perf || {};

  return (
    <div className="w-full max-w-md mt-6 bg-primary-foreground/5 border border-primary-foreground/15 rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-1">Noter ma performance</p>
      <p className="text-sm font-medium text-primary-foreground/90 mb-3">{exercise.name}</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-primary-foreground/40 mb-1">Charge (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            value={v.charge ?? ""}
            onChange={(e) => onChange("charge", e.target.value)}
            placeholder="—"
            className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-primary-foreground/40 mb-1">Reps réalisées</label>
          <input
            type="text"
            value={v.reps ?? ""}
            onChange={(e) => onChange("reps", e.target.value)}
            placeholder="—"
            className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary"
          />
        </div>
      </div>
      <input
        type="text"
        value={v.commentaire ?? ""}
        onChange={(e) => onChange("commentaire", e.target.value)}
        placeholder="Commentaire / ressenti (optionnel)"
        className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-md px-3 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary"
      />
    </div>
  );
}