import { Link } from "react-router-dom";
import { ArrowRight, Users, Trophy, Activity, ShieldCheck } from "lucide-react";

const benefices = [
  { icon: Trophy, title: "Performance collective", desc: "Programmes ciblés par sport : explosivité, endurance, prévention des blessures." },
  { icon: Users, title: "Tous les publics", desc: "Jeunes, seniors, compétiteurs ou loisir — chaque groupe progresse à son rythme." },
  { icon: ShieldCheck, title: "Prévention & santé", desc: "Renforcement des chaînes musculaires, proprioception et gestion de la charge." },
  { icon: Activity, title: "Suivi mesuré", desc: "Tests réguliers et ajustements pour une progression visible et durable." },
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
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">PRÉPARATION PHYSIQUE</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
            Pour les clubs,<br />les équipes et les associations.
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed">
            J'accompagne les structures sportives dans la préparation physique de leurs adhérents :
            élaboration de programmes, séances en groupe, suivi collectif et individualisé.
            Une approche adaptée à chaque discipline et à chaque niveau.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefices.map((b, i) => (
            <div key={i} className="bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-6 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-base font-heading font-semibold text-primary-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-primary-foreground/60 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-8">
          <div className="flex-1">
            <h3 className="text-xl font-heading font-semibold text-primary-foreground mb-1">Parlons de votre projet</h3>
            <p className="text-sm text-primary-foreground/60">
              Réservez un appel découverte gratuit de 30 minutes — en visio ou par téléphone.
              Sans engagement, pour évaluer vos besoins et bâtir un plan adapté à votre structure.
            </p>
          </div>
          <Link
            to="/appel-decouverte"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300 whitespace-nowrap"
          >
            Réserver un appel gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}