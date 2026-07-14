import { ChevronRight, X } from "lucide-react";

export default function ExecutionBlocIntro({ bloc, totalRounds, onContinue, onExit }) {
  const exercices = bloc?.exercices || [];

  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col">
      <div className="flex items-center justify-end px-6 py-4">
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-4">Prochain bloc</p>
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-center mb-3">{bloc?.titre}</h1>
        {totalRounds > 1 && <p className="text-primary-foreground/60 mb-6">Ce bloc est à réaliser {totalRounds} fois.</p>}

        {exercices.length > 0 && (
          <div className="w-full max-w-md mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50 mb-3 text-center">Exercices</p>
            <ul className="space-y-2">
              {exercices.map((ex, i) => (
                <li key={ex.id} className="flex items-center gap-3 bg-primary-foreground/5 rounded-lg px-4 py-2.5">
                  <span className="w-6 h-6 rounded bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="font-medium flex-1">{ex.name}</span>
                  <span className="text-sm text-primary-foreground/60 whitespace-nowrap">{ex.reps}{ex.sets ? ` × ${ex.sets}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={onContinue} className="bg-secondary text-secondary-foreground px-10 py-4 rounded-full text-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
          Continuer <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}