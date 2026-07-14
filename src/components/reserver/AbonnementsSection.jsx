import { Check, ArrowRight, CalendarClock } from "lucide-react";
import { FORGE_OFFRES, prixDisplay } from "@/lib/forgeOffres";

export default function AbonnementsSection({ onChoisir }) {
  const items = [FORGE_OFFRES.forge4, FORGE_OFFRES.forge8];
  return (
    <section id="abonnements" className="py-20 px-6 scroll-mt-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Abonnements FORGE</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Votre progression continue</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-3xl p-8 flex flex-col hover:border-accent/50 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <CalendarClock className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground">{o.titre}</h3>
              </div>
              <p className="font-heading text-4xl font-bold text-foreground">{prixDisplay(o)}</p>
              <p className="text-sm text-secondary font-medium mt-1 mb-6">{o.sousTitre}</p>
              <ul className="space-y-3 mb-8 flex-1">
                {o.inclus.map((i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {i}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onChoisir(o.id)}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-full font-semibold hover:scale-[1.02] transition-transform"
              >
                {o.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}