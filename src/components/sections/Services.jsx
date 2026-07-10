import { ArrowRight, Home, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  {
    icon: Home,
    title: "Séances individuelles à domicile",
    desc: "Un coaching complet, chez vous. Renforcement musculaire, cardio, mobilité et posture — adapté à votre espace et votre matériel. Chaque séance dure 60 minutes.",
    features: ["Évaluation posturale initiale", "Matériel fourni si besoin", "Suivi progression séance par séance"],
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
  },
  {
    icon: ClipboardList,
    title: "Programmes personnalisés",
    desc: "Un plan d'entraînement structuré sur plusieurs semaines, conçu pour atteindre un objectif précis. Idéal en complément des séances ou pour s'entraîner en autonomie.",
    features: ["Plan sur 4 à 12 semaines", "Exercices détaillés et vidéos", "Ajustements selon progression"],
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">SERVICES</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight">
            Deux approches,<br />une même exigence.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((s, i) => (
            <div key={i} className="group bg-background rounded-2xl overflow-hidden border border-accent/20 hover:shadow-xl transition-all duration-500">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-primary">{s.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">{s.desc}</p>
                <ul className="space-y-2 mb-6">
                  {s.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="w-1 h-1 rounded-full bg-secondary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/reservation" className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:gap-3 transition-all">
                  Réserver une séance
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}