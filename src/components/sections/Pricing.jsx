import { Link } from "react-router-dom";
import { Check, ArrowRight, Flame, Crown, CalendarClock, Dumbbell, Sparkles } from "lucide-react";

const ACCOMPAGNEMENTS = [
  {
    id: "diagnostic",
    name: "Diagnostic FORGE",
    price: 79,
    unit: "/ séance",
    desc: "Bilan physique, analyse des objectifs, tests mobilité & force, plan d'action personnalisé.",
    features: ["60 minutes", "Tests mobilité & force", "Plan d'action personnalisé"],
    icon: Flame,
    highlight: false,
  },
  {
    id: "transformation",
    name: "Transformation FORGE",
    price: 740,
    unit: "/ 10 séances",
    desc: "Progression structurée, suivi des résultats et adaptation du programme.",
    features: ["10 séances à domicile", "74€ / séance", "Suivi des résultats", "Adaptation du programme"],
    icon: Crown,
    highlight: true,
  },
  {
    id: "performance",
    name: "Performance FORGE",
    price: 1380,
    unit: "/ 20 séances",
    desc: "Accompagnement longue durée, suivi renforcé et priorité de réservation.",
    features: ["20 séances à domicile", "69€ / séance", "Suivi renforcé", "Priorité de réservation"],
    icon: Crown,
    highlight: false,
  },
  {
    id: "individuelle",
    name: "Séance individuelle",
    price: 79,
    unit: "/ séance",
    desc: "Une séance ponctuelle ou de découverte, 60 minutes à domicile.",
    features: ["60 minutes", "Ponctuel ou découverte", "À domicile"],
    icon: Dumbbell,
    highlight: false,
  },
];

const ABONNEMENTS = [
  {
    id: "forge4",
    name: "FORGE 4",
    price: 299,
    unit: "/ mois",
    desc: "4 séances par mois, créneau réservé, suivi de progression.",
    features: ["4 séances / mois", "Créneau réservé", "Suivi progression"],
    icon: CalendarClock,
  },
  {
    id: "forge8",
    name: "FORGE 8",
    price: 579,
    unit: "/ mois",
    desc: "8 séances par mois, progression accélérée et priorité planning.",
    features: ["8 séances / mois", "Progression accélérée", "Priorité planning"],
    icon: CalendarClock,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs font-semibold tracking-label text-secondary mb-4">COACHING À DOMICILE</p>
        <h2 className="text-6xl lg:text-8xl font-heading font-bold text-primary leading-tight mb-6">
          Une transparence totale.
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Colmar et alentours. Paiement sécurisé en ligne, annulation gratuite jusqu'à 24h avant la séance.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {ACCOMPAGNEMENTS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 border transition-all duration-300 hover:scale-[1.02] ${
                plan.highlight
                  ? "bg-primary text-primary-foreground border-primary shadow-2xl lg:-translate-y-4"
                  : "bg-background border-accent/30"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full tracking-label flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> RECOMMANDÉ
                </span>
              )}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5 ${plan.highlight ? "bg-primary-foreground/10" : "bg-secondary/10"}`}>
                <Icon className={`w-5 h-5 ${plan.highlight ? "text-secondary" : "text-secondary"}`} />
              </div>
              <h3 className={`text-lg font-heading font-semibold ${plan.highlight ? "text-primary-foreground" : "text-primary"}`}>{plan.name}</h3>
              <p className={`text-sm mt-1 mb-6 ${plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-4xl font-heading font-bold ${plan.highlight ? "text-secondary" : "text-primary"}`}>{plan.price}€</span>
                <span className={`text-sm ${plan.highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>{plan.unit}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className={`flex items-center gap-3 text-sm ${plan.highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                    <Check className="w-4 h-4 text-secondary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/reserver"
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
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {ABONNEMENTS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className="bg-background border border-accent/30 rounded-2xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-primary">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-3">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-heading font-bold text-primary">{plan.price}€</span>
                    <span className="text-sm text-muted-foreground">{plan.unit}</span>
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
  );
}
