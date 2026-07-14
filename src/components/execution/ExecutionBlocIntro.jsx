import { ChevronRight, ChevronLeft, X } from "lucide-react";

export default function ExecutionBlocIntro({ bloc, totalRounds, onContinue, onPrev, onExit }) {
  const exercices = bloc?.exercices || [];
  const restTours = totalRounds > 1 && bloc?.rest_between_rounds
    ? `${bloc.rest_between_rounds} ${bloc.rest_between_rounds_unit === "minutes" ? "min" : "secondes"}`
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col">
      <div className="flex items-center justify-end px-6 py-4">
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-4">Prochain bloc</p>
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-center mb-3">{bloc?.titre}</h1>
        <p className="text-primary-foreground/60 mb-2">{bloc?.nb_series || 1} série{(bloc?.nb_series || 1) > 1 ? "s" : ""}{totalRounds > 1 ? ` · ${totalRounds} tours` : ""}</p>

        {exercices.length > 0 && (
          <div className="w-full max-w-md mb-2 mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/50 mb-3 text-center">Exercices</p>
            <ul className="space-y-2">
              {exercices.map((ex, i) => (
                <li key={ex.id} className="flex items-center gap-3 bg-primary-foreground/5 rounded-lg px-4 py-2.5">
                  <span className="w-6 h-6 rounded bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <span className="font-medium flex-1">{ex.name}</span>
                  <span className="text-sm text-primary-foreground/60 whitespace-nowrap">{ex.reps}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {restTours && (
          <p className="text-primary-foreground/70 mt-4 mb-8 text-center">Repos entre les tours : <span className="font-semibold text-secondary">{restTours}</span></p>
        )}

        <div className="flex items-center gap-4">
          {onPrev && (
            <button onClick={onPrev} className="p-4 rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 transition-colors" title="Bloc précédent">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <button onClick={onContinue} className="bg-secondary text-secondary-foreground px-10 py-4 rounded-full text-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
            Continuer <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}