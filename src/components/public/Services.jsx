import { Link } from "react-router-dom";
import { Dumbbell, ClipboardList, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Dumbbell,
    title: "Séance individuelle à domicile",
    desc: "Un accompagnement en face à face, chez vous. Chaque séance est construite autour de votre forme du jour, de votre espace et de votre objectif immédiat.",
    points: ["60 minutes de pratique guidée", "Matériel fourni", "Adapté à votre espace"],
  },
  {
    icon: ClipboardList,
    title: "Programme personnalisé",
    desc: "Un plan d'entraînement structuré sur plusieurs semaines, conçu pour vous accompagner entre les séances et accélérer votre progression de façon autonome.",
    points: ["Plan sur 4 à 12 semaines", "Exercices détaillés et filmés", "Suivi et ajustements continus"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 lg:py-36 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">Services</p>
          <h2 className="font-heading font-bold text-4xl lg:text-5xl text-foreground leading-tight text-balance">
            Deux façons de travailler ensemble.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="group bg-card border border-border rounded-lg p-10 hover:border-accent transition-colors duration-300">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-8">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-2xl text-foreground mb-4">{s.title}</h3>
                <p className="text-foreground/60 leading-relaxed mb-8">{s.desc}</p>
                <ul className="space-y-3 mb-8">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-3 text-sm text-foreground/80">
                      <span className="w-1 h-1 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to="/reservation" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:gap-3 transition-all">
                  Réserver <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}