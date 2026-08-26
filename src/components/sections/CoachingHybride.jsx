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
    <section className="pt-10 pb-16 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-10">
          <p className="text-sm font-bold tracking-[0.2em] text-accent uppercase mb-4">Coaching hybride</p>
          <h2 className="text-3xl lg:text-5xl font-heading font-bold leading-tight mb-4">Le meilleur des deux mondes</h2>
          <p className="text-primary-foreground/70 leading-relaxed max-w-xl mx-auto">
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
                  highlight ? "bg-accent text-accent-foreground border-accent shadow-xl" : "bg-primary-foreground/5 border-primary-foreground/15"
                }`}
              >
                {p.metadata?.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-semibold rounded-full tracking-wide flex items-center gap-1 whitespace-nowrap ${highlight ? "bg-secondary text-secondary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <Sparkles className="w-3 h-3" /> {p.metadata.badge}
                  </span>
                )}
                <h3 className="text-xl font-heading font-bold">{p.nom}</h3>
                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-3xl font-heading font-bold">{p.prix_ttc}€</span>
                  <span className={`text-sm ${highlight ? "text-accent-foreground/60" : "text-primary-foreground/50"}`}>/mois</span>
                </div>
                <ul className="space-y-2 mb-2 flex-1">
                  {(p.metadata?.inclus || []).slice(0, 4).map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${highlight ? "text-accent-foreground/80" : "text-primary-foreground/70"}`}>
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {p.engagement_mois && (
                  <p className={`text-xs mt-2 ${highlight ? "text-accent-foreground/50" : "text-primary-foreground/40"}`}>Engagement {p.engagement_mois} mois</p>
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
