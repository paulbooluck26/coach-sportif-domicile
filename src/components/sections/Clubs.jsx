import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Monitor, Repeat } from "lucide-react";

const formats = [
  { icon: MapPin, title: "Terrain", desc: "Interventions sur site, séances collectives, tests physiques." },
  { icon: Monitor, title: "En ligne", desc: "Programmation à distance, accès à l'application, suivi régulier." },
  { icon: Repeat, title: "Hybride", desc: "Séances terrain complétées par un programme en ligne entre les interventions." },
];

export default function Clubs() {
  return (
    <section id="clubs" className="py-24 lg:py-32 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-sm md:text-base font-bold tracking-[0.2em] text-accent mb-4 uppercase">Clubs & entreprises</p>
          <h2 className="text-4xl lg:text-6xl font-heading font-bold leading-tight mb-6">
            Interventions pour clubs et entreprises.
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed">
            Préparation physique, prévention des blessures, santé au travail, cohésion d'équipe — des interventions construites selon les objectifs de votre structure.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {formats.map((f) => (
            <div key={f.title} className="bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-8">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-primary-foreground mb-2 uppercase">{f.title}</h3>
              <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4">{f.desc}</p>
              <p className="text-sm font-semibold text-accent">Sur devis</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-8">
          <div className="flex-1">
            <h3 className="text-xl font-heading font-semibold text-primary-foreground mb-1">Échanger sur votre projet</h3>
            <p className="text-sm text-primary-foreground/60">Appel de 30 minutes, sans engagement.</p>
          </div>
          <Link
            to="/appel-decouverte"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300 whitespace-nowrap"
          >
            Parler de votre projet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
