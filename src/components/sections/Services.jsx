import { ArrowRight, Home, Laptop, Users } from "lucide-react";
import { Link } from "react-router-dom";

const accompagnements = [
  {
    icon: Home,
    title: "Coaching à domicile",
    desc: "Séances individuelles chez vous ou en extérieur. Matériel fourni.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
    cta: "Voir les tarifs",
    link: "/reserver",
  },
  {
    icon: Laptop,
    title: "Programmes en ligne",
    desc: "Un plan d'entraînement structuré, à suivre en autonomie via l'application, avec un suivi de votre coach.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    cta: "Voir les programmes",
    link: "/achat-programme",
  },
  {
    icon: Users,
    title: "Clubs & entreprises",
    desc: "Préparation physique et interventions collectives pour les structures qui veulent un accompagnement sur mesure.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    cta: "En savoir plus",
    link: "#clubs",
  },
];

export default function Services() {
  return (
    <section id="accompagnements" className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-semibold tracking-[0.25em] text-secondary mb-4 uppercase">Les accompagnements</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight uppercase">
            Un accompagnement adapté à votre objectif.
          </h2>
          <p className="text-muted-foreground mt-4">La même expertise, adaptée à votre situation.</p>
        </div>

        <div className="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 -mx-6 px-6 lg:mx-0 lg:px-0 snap-x snap-mandatory no-scrollbar">
          {accompagnements.map((s, i) => (
            <div key={i} className="group bg-background rounded-2xl overflow-hidden border border-accent/20 hover:shadow-xl transition-all duration-500 shrink-0 w-[82%] sm:w-[380px] lg:w-auto snap-start">
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
                <Link to={s.link} className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:gap-3 transition-all">
                  {s.cta}
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
