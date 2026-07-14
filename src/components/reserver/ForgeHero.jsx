import { ArrowRight } from "lucide-react";

export default function ForgeHero({ onCommencer, onVoirOffres }) {
  return (
    <section className="relative min-h-[82vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1800&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/75 to-primary/95" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-20 text-center text-primary-foreground">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary mb-6 animate-fade-up">
          Coaching à domicile · The Lab Forge
        </p>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-display mb-6 animate-fade-up">
          Coaching sportif à domicile
        </h1>
        <p className="font-heading text-lg sm:text-xl md:text-2xl font-medium text-primary-foreground/90 mb-10 max-w-2xl mx-auto animate-fade-up">
          Un accompagnement personnalisé pour construire votre meilleure version.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up">
          <button
            onClick={onCommencer}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-semibold text-base hover:scale-[1.03] transition-transform"
          >
            Commencer mon parcours <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onVoirOffres}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary-foreground/25 text-primary-foreground px-8 py-4 rounded-full font-semibold text-base hover:bg-primary-foreground/10 transition-colors"
          >
            Voir les accompagnements
          </button>
        </div>
      </div>
    </section>
  );
}