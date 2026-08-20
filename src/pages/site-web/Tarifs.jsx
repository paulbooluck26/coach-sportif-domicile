import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, ArrowRight, Flame, Crown, CalendarClock, Dumbbell, Sparkles, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";

const ICONES = {
  "coaching-diagnostic": Flame,
  "coaching-transformation": Crown,
  "coaching-performance": Crown,
  "coaching-decouverte": Dumbbell,
  "coaching-forge4": CalendarClock,
  "coaching-forge8": CalendarClock,
};

export default function Tarifs() {
  const [produits, setProduits] = useState(null);

  useEffect(() => {
    base44.entities.Produit.filter({ categorie: "coaching_domicile", actif: true, visible_public: true }, "ordre_affichage")
      .then(setProduits)
      .catch(() => setProduits([]));
  }, []);

  if (!produits) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const ponctuels = produits.filter((p) => p.type_facturation === "paiement_unique");
  const abonnements = produits.filter((p) => p.type_facturation === "abonnement");

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Tarifs Coaching à Domicile"
        description="Découvrez nos tarifs de coaching sportif à domicile à Colmar : diagnostic, packs de séances, abonnements FORGE. Paiement sécurisé, annulation gratuite."
        path="/reserver"
      />
      <section id="pricing" className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm md:text-base font-bold tracking-[0.2em] text-secondary mb-4 uppercase">Coaching à domicile</p>
          <h1 className="text-5xl lg:text-7xl font-heading font-bold text-primary leading-tight mb-6">
            Une transparence totale.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Colmar et alentours. Paiement sécurisé en ligne, annulation gratuite jusqu'à 24h avant la séance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {ponctuels.map((plan) => {
            const Icon = ICONES[plan.sku] || Dumbbell;
            const highlight = plan.metadata?.dominant;
            const prix = plan.prix_promo ?? plan.prix_ttc;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.02] ${
                  highlight ? "bg-primary text-primary-foreground border-primary shadow-xl lg:-translate-y-2" : "bg-background border-accent/30"
                }`}
              >
                {(plan.metadata?.badge || highlight) && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-semibold rounded-full tracking-wide flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {plan.metadata?.badge || "RECOMMANDÉ"}
                  </span>
                )}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${highlight ? "bg-primary-foreground/10" : "bg-secondary/10"}`}>
                  <Icon className="w-4 h-4 text-secondary" />
                </div>
                <h3 className={`text-base font-heading font-semibold ${highlight ? "text-primary-foreground" : "text-primary"}`}>{plan.nom}</h3>
                <p className={`text-xs mt-1 mb-4 leading-snug ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  {plan.prix_promo != null && <span className="text-sm line-through opacity-50 mr-1">{plan.prix_ttc}€</span>}
                  <span className={`text-2xl font-heading font-bold ${highlight ? "text-secondary" : "text-primary"}`}>{prix}€</span>
                  {plan.nb_seances_inclus && <span className={`text-xs ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>/ {plan.nb_seances_inclus} séances</span>}
                </div>
                <ul className="space-y-1.5 mb-5">
                  {(plan.metadata?.inclus || []).slice(0, 3).map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-xs ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                      <Check className="w-3.5 h-3.5 text-secondary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/espace-client/reserver/domicile"
                  className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    highlight ? "bg-secondary text-secondary-foreground hover:scale-105" : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {plan.metadata?.cta || "Réserver"}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {abonnements.map((plan) => {
            const Icon = ICONES[plan.sku] || CalendarClock;
            return (
              <div key={plan.id} className="bg-background border border-accent/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-base font-heading font-semibold text-primary">{plan.nom}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-2 leading-snug">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-heading font-bold text-primary">{plan.prix_promo ?? plan.prix_ttc}€</span>
                      <span className="text-xs text-muted-foreground">/ mois</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/espace-client/reserver/domicile"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 whitespace-nowrap"
                >
                  Réserver
                  <ArrowRight className="w-3.5 h-3.5" />
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
