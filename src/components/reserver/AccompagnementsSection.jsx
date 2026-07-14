import { Star, Check, ArrowRight, Crown } from "lucide-react";
import { FORGE_OFFRES, prixDisplay } from "@/lib/forgeOffres";

export default function AccompagnementsSection({ onChoisir }) {
  const items = [FORGE_OFFRES.transformation, FORGE_OFFRES.performance];
  return (
    <section id="accompagnements" className="py-20 px-6 bg-secondary/5 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Accompagnements FORGE</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Choisissez votre transformation</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-start">
          {items.map((o) => {
            const dominant = o.dominant;
            return (
              <div
                key={o.id}
                className={`relative bg-card rounded-3xl p-8 md:p-10 flex flex-col ${
                  dominant ? "border-2 border-secondary shadow-2xl md:scale-[1.03]" : "border border-border"
                }`}
              >
                {o.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                    {dominant ? <Star className="w-3.5 h-3.5" /> : <Crown className="w-3.5 h-3.5" />} {o.badge}
                  </span>
                )}
                <h3 className="font-heading text-2xl font-bold text-foreground mt-2">{o.titre}</h3>
                <p className="font-heading text-4xl font-bold text-foreground mt-4">{prixDisplay(o)}</p>
                <p className="text-sm text-secondary font-medium mt-1">{o.sousTitre}</p>
                <p className="text-sm text-foreground/70 leading-relaxed mt-4 mb-6">{o.description}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {o.inclus.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {i}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onChoisir(o.id)}
                  className={`w-full inline-flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-transform hover:scale-[1.02] ${
                    dominant ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {o.cta} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}