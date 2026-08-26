import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, ArrowRight, Sparkles } from "lucide-react";

export default function CoachingHybride() {
  const [produits, setProduits] = useState(null);

  useEffect(() => {
    base44.entities.Produit.filter({ categorie: "coaching_domicile", sous_categorie: "hybride", actif: true, visible_public: true }, "ordre_affichage")
      .then(setProduits)
      .catch(() => setProduits([]));
  }, []);

  if (!produits || produits.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <p className="text-sm font-bold tracking-[0.2em] text-secondary uppercase mb-4">Coaching hybride</p>
          <h2 className="text-3xl lg:text-5xl font-heading font-bold text-primary leading-tight mb-4">Le meilleur des deux mondes</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Votre coach vous accompagne à domicile, et vous suit même lorsque vous vous entraînez seul, via l'application.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 mb-8">
          {produits.map((p) => {
            const highlight = !!p.metadata?.dominant;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col ${
                  highlight ? "bg-primary text-primary-foreground border-primary shadow-xl" : "bg-card border-accent/30"
                }`}
              >
                {p.metadata?.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-semibold rounded-full tracking-wide flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {p.metadata.badge}
                  </span>
                )}
                <h3 className={`text-xl font-heading font-bold ${highlight ? "text-primary-foreground" : "text-primary"}`}>{p.nom}</h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className={`text-3xl font-heading font-bold ${highlight ? "text-secondary" : "text-primary"}`}>{p.prix_ttc}€</span>
                  <span className={`text-sm ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>/mois</span>
                </div>
                <ul className="space-y-2 mb-2 flex-1">
                  {(p.metadata?.inclus || []).slice(0, 4).map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                      <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.engagement_mois && (
                  <p className={`text-xs mt-2 ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>Engagement {p.engagement_mois} mois</p>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link to="/reserver" className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300">
            Découvrir les offres hybrides
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
