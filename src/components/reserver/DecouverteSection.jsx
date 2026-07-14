import { Clock, ArrowRight, Sparkles } from "lucide-react";
import { FORGE_OFFRES } from "@/lib/forgeOffres";

export default function DecouverteSection({ onChoisir }) {
  const o = FORGE_OFFRES.decouverte;
  return (
    <section id="decouverte" className="py-16 px-6 scroll-mt-24">
      <div className="mx-auto max-w-xl">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-6 h-6 text-accent" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-foreground mb-1">{o.titre}</h3>
          <p className="text-foreground/60 mb-5">{o.accroche}</p>
          <div className="inline-flex items-center gap-4 text-sm font-medium text-foreground mb-6">
            <span className="font-heading text-xl font-bold">{o.prixLabel}</span>
            <span className="w-px h-4 bg-border" />
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-accent" /> {o.duree}</span>
          </div>
          <button
            onClick={() => onChoisir(o.id)}
            className="inline-flex items-center gap-2 border border-border text-foreground px-6 py-3 rounded-full font-semibold hover:border-accent hover:text-accent transition-colors"
          >
            {o.cta} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}