import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Séance unique",
    price: 75,
    unit: "/ séance",
    desc: "Pour découvrir ou ponctuellement.",
    features: ["1 séance à domicile de 60 min", "Bilan initial inclus", "Adapté à votre espace"],
    highlight: false,
  },
  {
    name: "Carnet de 5 séances",
    price: 340,
    unit: "/ carnet",
    desc: "Le choix le plus populaire.",
    features: ["5 séances à domicile de 60 min", "Suivi de progression", "Programme d'exercices offert", "Annulation gratuite 24h avant"],
    highlight: true,
  },
  {
    name: "Programme sur mesure",
    price: 290,
    unit: "/ programme",
    desc: "Plan structuré 4 à 12 semaines.",
    features: ["Plan personnalisé complet", "Exercices détaillés", "Ajustements selon progression", "Idéal en autonomie"],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold tracking-label text-secondary mb-4">TARIFS</p>
        <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight mb-6">
          Une transparence totale.
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Paiement sécurisé en ligne au moment de la réservation. Annulation gratuite jusqu'à 24h avant la séance.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`relative rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02] ${
              plan.highlight
                ? "bg-primary text-primary-foreground border-primary shadow-2xl md:-translate-y-4"
                : "bg-background border-accent/30"
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full tracking-label">
                POPULAIRE
              </span>
            )}
            <h3 className={`text-lg font-heading font-semibold ${plan.highlight ? "text-primary-foreground" : "text-primary"}`}>{plan.name}</h3>
            <p className={`text-sm mt-1 mb-6 ${plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{plan.desc}</p>
            <div className="flex items-baseline gap-1 mb-8">
              <span className={`text-4xl font-heading font-bold ${plan.highlight ? "text-secondary" : "text-primary"}`}>{plan.price}€</span>
              <span className={`text-sm ${plan.highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{plan.unit}</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((f, j) => (
                <li key={j} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                  <Check className={`w-4 h-4 ${plan.highlight ? "text-secondary" : "text-secondary"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/reservation"
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                plan.highlight
                  ? "bg-secondary text-secondary-foreground hover:scale-105"
                  : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              Réserver
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}