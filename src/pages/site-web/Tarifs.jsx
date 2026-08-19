import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Check, ArrowRight, Flame, Crown, CalendarClock, Dumbbell, Sparkles, Loader2 } from "lucide-react";

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {ponctuels.map((plan) => {
            const Icon = ICONES[plan.sku] || Dumbbell;
            const highlight = plan.metadata?.dominant;
            const prix = plan.prix_promo ?? plan.prix_ttc;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02] ${
                  highlight ? "bg-primary text-primary-foreground border-primary shadow-2xl lg:-translate-y-4" : "bg-background border-accent/30"
                }`}
              >
                {(plan.metadata?.badge || highlight) && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full tracking-wide flex items-center gap-1.5 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" /> {plan.metadata?.badge || "RECOMMANDÉ"}
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${highlight ? "bg-primary-foreground/10" : "bg-secondary/10"}`}>
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className={`text-lg font-heading font-semibold ${highlight ? "text-primary-foreground" : "text-primary"}`}>{plan.nom}</h3>
                <p className={`text-sm mt-1 mb-6 ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  {plan.prix_promo != null && <span className="text-lg line-through opacity-50 mr-1">{plan.prix_ttc}€</span>}
                  <span className={`text-4xl font-heading font-bold ${highlight ? "text-secondary" : "text-primary"}`}>{prix}€</span>
                  {plan.nb_seances_inclus && <span className={`text-sm ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>/ {plan.nb_seances_inclus} séances</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {(plan.metadata?.inclus || []).map((f, j) => (
                    <li key={j} className={`flex items-center gap-3 text-sm ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                      <Check className="w-4 h-4 text-secondary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/reserver"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                    highlight ? "bg-secondary text-secondary-foreground hover:scale-105" : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {plan.metadata?.cta || "Réserver"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {abonnements.map((plan) => {
            const Icon = ICONES[plan.sku] || CalendarClock;
            return (
              <div key={plan.id} className="bg-background border border-accent/30 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-primary">{plan.nom}</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-3">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-heading font-bold text-primary">{plan.prix_promo ?? plan.prix_ttc}€</span>
                      <span className="text-sm text-muted-foreground">/ mois</span>
                    </div>
                  </div>
                </div>
                <Link
                  to="/reserver"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 whitespace-nowrap"
                >
                  Réserver
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
