import { Link } from "react-router-dom";
import {
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  Target,
  CalendarDays,
  CalendarCheck,
  MessageSquare,
  HeartHandshake,
  ListChecks,
  Smartphone,
  Award,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  { icon: Dumbbell, title: "Programmes personnalisés", desc: "Accédez à votre programme sur mesure, séance par séance, directement dans l'application." },
  { icon: ClipboardCheck, title: "Suivi des séances", desc: "Enregistrez chaque séance réalisée et conservez un historique complet de votre activité." },
  { icon: TrendingUp, title: "Visualisation de la progression", desc: "Suivez l'évolution de vos charges, de vos records et de vos performances." },
  { icon: Target, title: "Objectifs & motivation", desc: "Restez focus grâce au suivi de vos performances et de vos records personnels." },
  { icon: CalendarDays, title: "Calendrier des entraînements", desc: "Visualisez votre planning et vos séances à venir, d'un seul coup d'œil." },
  { icon: CalendarCheck, title: "Réservation de séances", desc: "Réservez vos séances individuelles à domicile en quelques taps." },
  { icon: MessageSquare, title: "Messagerie privée", desc: "Échangez directement avec votre coach, posez vos questions, à tout moment." },
];

const PILLARS = [
  { icon: HeartHandshake, title: "Un accompagnement humain", desc: "Un coach dédié, à votre écoute à chaque étape de votre parcours." },
  { icon: ListChecks, title: "Une méthode structurée", desc: "Des programmes progressifs et pensés spécifiquement pour vous." },
  { icon: Smartphone, title: "Un suivi digital permanent", desc: "Tout votre parcours accessible à tout moment, où que vous soyez." },
  { icon: Award, title: "Une expérience premium", desc: "Le sérieux d'un coach, la fluidité d'une application dédiée." },
];

export default function AppExperience() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-label text-secondary mb-4">L'APPLICATION THE LAB FORGE</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary leading-tight">
              Bien plus qu'un coach :<br />une expérience digitale premium.
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              The Lab Forge ne se résume pas à des séances de coaching. Vous bénéficiez d'une application dédiée à votre suivi, pensée pour un accompagnement structuré, humain et permanent — accessible à tout moment, où que vous soyez.
            </p>
          </div>
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-secondary/20 blur-3xl" />
            </div>
            <img
              src="https://media.base44.com/images/public/6a4fa54adc116f80e1bcc475/3a4202c58_Design_sans_titre__4_-removebg-preview.png"
              alt="Application mobile The Lab Forge sur iPhone"
              className="relative w-[240px] sm:w-[300px] lg:w-[360px] max-w-full h-auto object-contain drop-shadow-2xl animate-fade-up"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="bg-background rounded-2xl border border-accent/20 p-6 hover:border-secondary/50 hover:shadow-md transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-heading font-semibold text-primary mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-primary rounded-3xl p-8 lg:p-14">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold tracking-label text-secondary mb-4">UNE EXPÉRIENCE COMPLÈTE</p>
            <h3 className="text-3xl lg:text-4xl font-heading font-bold text-primary-foreground leading-tight">
              Le sérieux d'un coach,<br />la fluidité d'une application.
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title}>
                  <div className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-secondary" />
                  </div>
                  <h4 className="font-heading font-semibold text-primary-foreground mb-1.5">{p.title}</h4>
                  <p className="text-sm text-primary-foreground/70 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/reserver" className="inline-flex items-center gap-2 px-7 py-3.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform">
            Découvrir nos formules <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}