import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80"
          alt="Coach sportif à domicile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-label text-secondary mb-6 animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            COACHING SPORTIF À DOMICILE
          </p>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold text-primary-foreground leading-[1.05] animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            Votre corps.<br />
            Votre espace.<br />
            <span className="text-secondary">Votre transformation.</span>
          </h1>
          <p className="mt-8 text-lg text-primary-foreground/80 leading-relaxed max-w-lg animate-fade-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
            Un coaching personnel sur mesure, directement chez vous. Méthode, rigueur et élégance —
            pour des résultats durables sans contrainte de salle.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
            <a
              href="#services"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              Commencer ma transformation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}