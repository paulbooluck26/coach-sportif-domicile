import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80"
          alt="Coaching sportif à domicile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full">
        <div className="max-w-2xl">
          <p className="text-sm md:text-base font-bold tracking-[0.2em] text-accent mb-6 animate-fade-up uppercase" style={{ animationDelay: "0.1s", opacity: 0 }}>
            PHYSIS COACHING
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground leading-[1.05] uppercase animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            L'expertise au service de votre progression
          </h1>
          <p className="mt-8 text-lg text-primary-foreground/80 leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
            Coaching sportif personnalisé à Colmar et alentours, à domicile, en ligne ou dans le cadre de votre club ou entreprise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
            <Link
              to="/reserver"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-accent-foreground rounded-full text-sm font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Réserver mon diagnostic
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#accompagnements"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary-foreground/30 text-primary-foreground rounded-full text-sm font-semibold hover:bg-primary-foreground/10 transition-all duration-300"
            >
              Découvrir les accompagnements
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
