import { Play, X } from "lucide-react";

export default function ExecutionWelcome({ sessionData, onStart, onExit }) {
  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col">
      <div className="flex items-center justify-end px-6 py-4">
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-lg mx-auto w-full pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-3">Prêt à démarrer ?</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-center mb-4">{sessionData.seance?.titre}</h1>
        {sessionData.seance?.description && <p className="text-primary-foreground/60 text-center mb-8">{sessionData.seance.description}</p>}
        <div className="w-full mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50 mb-3 text-center">Aperçu des blocs</p>
          <div className="space-y-2">
            {sessionData.blocs.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 bg-primary-foreground/5 rounded-lg px-4 py-3">
                <span className="w-7 h-7 rounded bg-secondary/20 text-secondary flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <span className="font-medium">{b.titre}</span>
                {b.rounds > 1 && <span className="text-xs text-primary-foreground/40 ml-auto">{b.rounds} tours</span>}
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