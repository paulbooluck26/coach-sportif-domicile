import { Link } from "react-router-dom";
import { ArrowRight, Dumbbell, HeartPulse, Users, Activity, Monitor, Building2 } from "lucide-react";

const benefices = [
  { icon: Dumbbell, title: "Préparation physique", desc: "Programmes spécifiques, développement des qualités physiques, prévention des blessures et optimisation des performances." },
  { icon: HeartPulse, title: "Santé & Bien-être", desc: "Séances favorisant la mobilité, le renforcement, la prévention des troubles musculo-squelettiques et le bien-être des collaborateurs ou adhérents." },
  { icon: Users, title: "Cohésion d'équipe", desc: "Des séances dynamiques pour renforcer l'esprit d'équipe, la motivation et l'engagement collectif." },
  { icon: Activity, title: "Suivi personnalisé", desc: "Évaluation, tests, ajustements réguliers et accompagnement dans la durée." },
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
          <p className="text-xs font-semibold tracking-label text-secondary mb-4">PERFORMANCE COLLECTIVE</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold leading-tight mb-6">
            Pour les clubs,<br />les entreprises et les organisations.
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed mb-4">
            J'accompagne les structures qui souhaitent améliorer la santé, la performance et la cohésion de leurs équipes grâce à des interventions sur mesure.
          </p>
          <p className="text-lg text-primary-foreground/70 leading-relaxed">
            Que vous soyez un club sportif, une entreprise, une association ou une collectivité, chaque accompagnement est conçu selon vos objectifs et votre public.
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

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-8">
            <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
              <Monitor className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary-foreground mb-2">Performance Online</h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4">
              Programmation personnalisée à distance, accès à l'application The Lab Forge, suivi des performances et ajustements réguliers.
            </p>
            <p className="text-sm font-semibold text-secondary">Sur devis</p>
          </div>
          <div className="bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-8">
            <div className="w-11 h-11 rounded-xl bg-secondary/20 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5 text-secondary" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-primary-foreground mb-2">Performance Terrain</h3>
            <p className="text-sm text-primary-foreground/60 leading-relaxed mb-4">
              Interventions sur site : séances collectives, préparation physique, ateliers santé, tests physiques et accompagnement directement dans votre structure.
            </p>
            <p className="text-sm font-semibold text-secondary">Sur devis</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-primary-foreground/5 border border-primary-foreground/15 rounded-2xl p-8">
          <div className="flex-1">
            <h3 className="text-xl font-heading font-semibold text-primary-foreground mb-1">Construisons votre projet</h3>
            <p className="text-sm text-primary-foreground/60 mb-2">
              Chaque structure est différente. Réservons un échange de 30 minutes pour comprendre vos besoins et construire une intervention adaptée.
            </p>
            <p className="text-xs text-secondary/80 font-medium">Appel découverte gratuit • Sans engagement</p>
          </div>
          <Link
            to="/appel-decouverte"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform duration-300 whitespace-nowrap"
          >
            Parler de votre projet
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}