import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function About() {
  return (
    <section id="coach" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 lg:px-10">
      <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        <div className="relative">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden">
            <img
              src="/coach-paul.png"
              alt="Paul Booluck, coach PHYSIS COACHING"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-background border border-accent/30 rounded-xl px-8 py-6 shadow-xl max-w-[200px]">
            <p className="text-3xl font-heading font-bold text-primary">200+</p>
            <p className="text-xs text-muted-foreground tracking-wide mt-1 uppercase">Clients accompagnés</p>
          </div>
        </div>

        <div>
          <p className="text-sm md:text-base font-bold tracking-[0.2em] text-secondary mb-4 uppercase">Le coach</p>
          <h2 className="text-4xl lg:text-6xl font-heading font-bold text-primary leading-tight mb-8">
            Une expertise construite sur le terrain.
          </h2>
          <div className="space-y-6 text-base text-muted-foreground leading-relaxed">
            <p>
              Je suis Paul Booluck, coach sportif diplômé BPJEPS Activités de la Forme.
            </p>
            <p>
              Mon parcours m'a amené à évoluer dans des environnements différents, en France comme à l'étranger, avec une même conviction : le bon entraînement n'est pas celui qui est le plus compliqué, mais celui qui est adapté à la personne et capable de la faire progresser. Rigueur, préparation et constance sont au cœur de mon approche du coaching.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 pt-8 border-t border-accent/30 max-w-xs">
            <div>
              <p className="text-2xl font-heading font-bold text-primary">200+</p>
              <p className="text-xs text-muted-foreground mt-1">Clients accompagnés</p>
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-primary">6</p>
              <p className="text-xs text-muted-foreground mt-1">Ans d'expérience</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="text-xs font-medium text-primary bg-accent/15 px-4 py-2 rounded-full">BPJEPS Activités de la Forme</span>
            <span className="text-xs font-medium text-primary bg-accent/15 px-4 py-2 rounded-full">Expérience France & international</span>
          </div>
          <Link
            to="/appel-decouverte"
            className="group inline-flex items-center gap-2 mt-8 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
          >
            Discuter avec moi
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-xs text-muted-foreground mt-2.5">30 minutes · Gratuit · Sans engagement</p>
        </div>
      </div>
    </section>
  );
}
