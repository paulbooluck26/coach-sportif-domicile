import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <h3 className="font-heading text-2xl font-bold mb-4">ELAN</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
              Coach sportif personnel à domicile. Je conçois des programmes de mouvement
              sur mesure, adaptés à votre corps, votre espace et votre vie.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">Navigation</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/reservation" className="text-primary-foreground/80 hover:text-primary-foreground">Réserver une séance</Link></li>
              <li><Link to="/espace-client" className="text-primary-foreground/80 hover:text-primary-foreground">Espace client</Link></li>
              <li><a href="/#services" className="text-primary-foreground/80 hover:text-primary-foreground">Services</a></li>
              <li><a href="/#tarifs" className="text-primary-foreground/80 hover:text-primary-foreground">Tarifs</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50 mb-4">Contact</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-primary-foreground/80"><Phone className="w-4 h-4" /> 06 12 34 56 78</li>
              <li className="flex items-center gap-2 text-primary-foreground/80"><Mail className="w-4 h-4" /> contact@elan-coaching.fr</li>
              <li className="flex items-center gap-2 text-primary-foreground/80"><MapPin className="w-4 h-4" /> Paris & région parisienne</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-primary-foreground/15 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-primary-foreground/50">
          <p>© 2026 ELAN Coaching. Tous droits réservés.</p>
          <div className="flex gap-6">
            <a href="/mentions-legales" className="hover:text-primary-foreground">Mentions légales</a>
            <a href="/cgv" className="hover:text-primary-foreground">CGV</a>
          </div>
        </div>
      </div>
    </footer>
  );
}