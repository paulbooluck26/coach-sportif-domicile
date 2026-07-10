import { ChevronRight, X } from "lucide-react";

export default function ExecutionBlocIntro({ bloc, totalRounds, onContinue, onExit }) {
  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground flex flex-col">
      <div className="flex items-center justify-end px-6 py-4">
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/10 rounded-md"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary mb-4">Prochain bloc</p>
        <h1 className="font-heading text-5xl md:text-6xl font-bold text-center mb-6">{bloc?.titre}</h1>
        {totalRounds > 1 && <p className="text-primary-foreground/60 mb-8">Ce bloc est à réaliser {totalRounds} fois.</p>}
        <button onClick={onContinue} className="bg-secondary text-secondary-foreground px-10 py-4 rounded-full text-lg font-semibold flex items-center gap-2 hover:scale-105 transition-transform">
          Continuer <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}