import { Flame, Clock, Check, ArrowRight } from "lucide-react";
import { FORGE_OFFRES } from "@/lib/forgeOffres";

export default function DiagnosticSection({ onChoisir }) {
  const o = FORGE_OFFRES.diagnostic;
  return (
    <section id="diagnostic" className="py-20 px-6 scroll-mt-24">
      <div className="mx-auto max-w-3xl text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Point de départ</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Votre première étape</h2>
      </div>

      <div className="mx-auto max-w-2xl relative bg-card rounded-3xl p-8 md:p-12 border-2 border-secondary/40 shadow-xl overflow-hidden">
        <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1.5 rounded-b-xl flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5" /> {o.badge}
        </div>

        <div className="text-center pt-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-6">
            <Flame className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="font-heading text-3xl font-bold text-foreground mb-2">{o.titre}</h3>
          <p className="text-foreground/70 mb-6">{o.accroche}</p>

          <div className="inline-flex items-center gap-6 bg-background/60 rounded-full px-6 py-3 mb-8">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground"><Clock className="w-4 h-4 text-accent" /> {o.duree}</span>
            <span className="w-px h-4 bg-border" />
            <span className="font-heading text-xl font-bold text-foreground">{o.prixLabel}</span>
          </div>

          <ul className="grid sm:grid-cols-2 gap-3 text-left max-w-md mx-auto mb-8">
            {o.inclus.map((i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {i}
              </li>
            ))}
          </ul>

          <button
            onClick={() => onChoisir(o.id)}
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-semibold hover:scale-[1.03] transition-transform"
          >
            {o.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}