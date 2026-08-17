import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const REPERES = ["Programmes", "Séances", "Réservations", "Suivi"];

export default function AppExperience() {
  return (
    <section id="application" className="py-24 lg:py-32 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="max-w-xl">
          <p className="text-xs font-semibold tracking-[0.25em] text-accent mb-4 uppercase">L'application</p>
          <h2 className="text-4xl lg:text-5xl font-heading font-bold text-primary-foreground leading-tight uppercase">
            Une application pensée pour votre progression.
          </h2>
          <p className="text-primary-foreground/70 mt-6 leading-relaxed">
            L'application Physis permet de retrouver vos programmes, suivre vos séances, réserver vos rendez-vous et garder le lien avec votre coach.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            {REPERES.map((r) => (
              <span key={r} className="text-xs font-medium text-primary-foreground bg-primary-foreground/10 px-4 py-2 rounded-full">{r}</span>
            ))}
          </div>
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 mt-10 px-8 py-4 bg-accent text-accent-foreground rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300"
          >
            Découvrir l'application
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="absolute inset-0 flex items-center justify-center lg:justify-end">
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-accent/20 blur-3xl" />
          </div>
          <img
            src="https://media.base44.com/images/public/6a4fa54adc116f80e1bcc475/3a4202c58_Design_sans_titre__4_-removebg-preview.png"
            alt="Application PHYSIS COACHING"
            className="relative w-[240px] sm:w-[300px] lg:w-[360px] max-w-full h-auto object-contain drop-shadow-2xl"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
