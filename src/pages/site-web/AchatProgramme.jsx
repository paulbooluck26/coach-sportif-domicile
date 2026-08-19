import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Sparkles, Check, Loader2 } from "lucide-react";

export default function AchatProgramme() {
  const [produits, setProduits] = useState(null);

  useEffect(() => {
    base44.entities.Produit.filter({ categorie: "programme_ligne", actif: true, visible_public: true }, "ordre_affichage")
      .then(setProduits)
      .catch(() => setProduits([]));
  }, []);

  if (!produits) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="pt-32 pb-24">
      <section className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm md:text-base font-bold tracking-[0.2em] text-secondary mb-4 uppercase">Programmes en ligne</p>
          <h1 className="text-5xl lg:text-7xl font-heading font-bold text-primary leading-tight mb-6">
            Un plan d'entraînement structuré, à votre rythme.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Accessible via l'application Physis, avec un suivi de votre coach. Chaque programme est construit sur mesure après votre appel de bilan.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mb-16">
          {produits.map((p) => {
            const highlight = p.metadata?.recommande;
            const prix = p.prix_promo ?? p.prix_ttc;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] ${
                  highlight ? "bg-primary text-primary-foreground border-primary shadow-xl lg:-translate-y-2" : "bg-background border-accent/30"
                }`}
              >
                {highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-semibold rounded-full tracking-wide flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> RECOMMANDÉ
                  </span>
                )}
                <h3 className={`text-xl font-heading font-bold uppercase ${highlight ? "text-primary-foreground" : "text-primary"}`}>{p.nom}</h3>
                <p className={`text-xs mt-1 mb-4 ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{p.metadata?.duree_semaines} semaines</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-3xl font-heading font-bold ${highlight ? "text-secondary" : "text-primary"}`}>{prix}€</span>
                </div>
                <p className={`text-sm leading-relaxed mb-5 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{p.description}</p>
                <ul className="space-y-2 mb-6">
                  {(p.metadata?.inclus || []).map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                      <Check className="w-4 h-4 text-secondary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/espace-client/reserver/programme"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    highlight ? "bg-secondary text-secondary-foreground hover:scale-105" : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  Choisir {p.nom}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="bg-muted/40 rounded-2xl p-8 text-center max-w-2xl mx-auto">
          <p className="font-heading font-semibold text-primary text-lg mb-1">Vous ne savez pas encore quoi choisir ?</p>
          <p className="text-sm text-muted-foreground mb-5">Répondez à quelques questions, on identifie ensemble ce qui vous correspond.</p>
          <Link to="/diagnostic" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300">
            Faire le diagnostic
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
