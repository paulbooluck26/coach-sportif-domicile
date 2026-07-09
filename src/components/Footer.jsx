import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <p className="font-heading font-bold text-xl tracking-display mb-4">AURÉLIEN<span className="text-secondary">.</span></p>
            <p className="text-sm text-primary-foreground/60 leading-relaxed max-w-xs">
              Coach sportif à domicile. La performance taillée sur mesure, dans le confort de votre espace.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-label text-secondary mb-4">Navigation</p>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">Accueil</Link>
              <Link to="/reservation" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">Réserver</Link>
              <Link to="/login" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">Espace client</Link>
              <Link to="/admin" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">Espace coach</Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-label text-secondary mb-4">Contact</p>
            <div className="flex flex-col gap-3">
              <a href="tel:+33612345678" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                <Phone className="w-4 h-4" /> 06 12 34 56 78
              </a>
              <a href="mailto:contact@aurelien-coaching.fr" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                <Mail className="w-4 h-4" /> contact@aurelien-coaching.fr
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                <Instagram className="w-4 h-4" /> @aurelien.coaching
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/40">© {new Date().getFullYear()} Aurélien Coaching. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link to="/" className="text-xs text-primary-foreground/40 hover:text-secondary transition-colors">Mentions légales</Link>
            <Link to="/" className="text-xs text-primary-foreground/40 hover:text-secondary transition-colors">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}