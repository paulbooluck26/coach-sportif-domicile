import { Link } from "react-router-dom";
import { Check } from "lucide-react";

const tarifs = [
  {
    nom: "Séance unique",
    prix: 70,
    duree: "60 min",
    desc: "L'essentiel : une séance complète à domicile pour découvrir ma méthode.",
    features: ["Séance individuelle", "À votre domicile", "Matériel inclus", "Bilan post-séance"],
    cta: "Réserver",
    type: "seance_individuelle",
  },
  {
    nom: "Carnet de 5 séances",
    prix: 320,
    duree: "5 × 60 min",
    desc: "Un rythme régulier pour installer des bases solides et des résultats durables.",
    features: ["5 séances à domicile", "Programme de progression", "Suivi entre séances", "Tarif préférentiel"],
    cta: "Choisir ce forfait",
    type: "seance_individuelle",
    highlight: true,
  },
  {
    nom: "Programme complet",
    prix: 450,
    duree: "8 semaines",
    desc: "L'accompagnement intégral : séances + programme personnalisé pour une transformation profonde.",
    features: ["8 séances à domicile", "Programme 8 semaines", "Exercices détaillés", "Suivi hebdomadaire"],
    cta: "Démarrer",
    type: "programme_personnalise",
  },
];

export default function Tarifs() {
  return (
    <section id="tarifs" className="py-28 lg:py-36 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Tarifs</p>
          <h2 className="font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight text-balance">
            Un investissement dans votre corps.
          </h2>
          <p className="text-foreground/60 mt-6 text-lg">
            Des forfaits clairs, sans surprise. Paiement en ligne sécurisé au moment de la réservation.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tarifs.map((t) => (
            <div
              key={t.nom}
              className={`relative rounded-lg p-10 flex flex-col ${t.highlight ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}
            >
              {t.highlight && (
                <span className="absolute top-6 right-6 text-xs font-semibold uppercase tracking-wider bg-accent text-accent-foreground px-3 py-1 rounded-full">
                  Populaire
                </span>
              )}
              <h3 className="font-heading font-semibold text-xl mb-2">{t.nom}</h3>
              <p className={`text-sm mb-6 ${t.highlight ? "text-primary-foreground/70" : "text-foreground/50"}`}>{t.duree}</p>
              <div className="mb-6">
                <span className="font-heading font-bold text-4xl">{t.prix}€</span>
              </div>
              <p className={`text-sm mb-8 leading-relaxed ${t.highlight ? "text-primary-foreground/80" : "text-foreground/60"}`}>{t.desc}</p>
              <ul className="space-y-3 mb-10 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${t.highlight ? "text-accent" : "text-accent"}`} />
                    <span className={t.highlight ? "text-primary-foreground/90" : "text-foreground/80"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/reservation"
                className={`text-center py-3.5 rounded-md font-semibold text-sm transition-all ${
                  t.highlight
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}