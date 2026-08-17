import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <p className="font-heading font-bold text-xl tracking-wide uppercase mb-4">PHYSIS COACHING</p>
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
              Coaching sportif à domicile — Colmar et alentours.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent mb-4 uppercase">Navigation</p>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Accueil</Link>
              <a href="/#accompagnements" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Services</a>
              <Link to="/reserver" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Tarifs</Link>
              <a href="/#application" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">App</a>
              <a href="/#contact" className="text-sm text-primary-foreground/70 hover:text-accent transition-colors">Contact</a>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-accent mb-4 uppercase">Contact</p>
            <div className="flex flex-col gap-3">
              <a href="tel:+33698181428" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Phone className="w-4 h-4" /> 06 98 18 14 28
              </a>
              <a href="mailto:contact@physis-coaching.fr" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" /> contact@physis-coaching.fr
              </a>
              <a href="https://instagram.com/physiscoachingcolmar" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent transition-colors">
                <Instagram className="w-4 h-4" /> @physiscoachingcolmar
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/40 text-center sm:text-left">
            © {new Date().getFullYear()} Physis Coaching. Auto-entrepreneur — TVA non applicable, art. 293B CGI. Tous droits réservés.
          </p>
          <div className="flex gap-6 shrink-0">
            <Link to="/mentions-legales" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Mentions légales</Link>
            <Link to="/confidentialite" className="text-xs text-primary-foreground/40 hover:text-accent transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
