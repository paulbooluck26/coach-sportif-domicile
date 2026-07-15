import { Link } from "react-router-dom";
import { Home, Dumbbell, PhoneCall, ArrowRight } from "lucide-react";

const OFFRES = [
  {
    titre: "Coaching à domicile",
    description: "Réservez une séance de coaching sportif personnalisée à domicile, à Colmar et alentours.",
    bouton: "Réserver une séance",
    lien: "/reserver",
    icon: Home,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  },
  {
    titre: "Programmes en ligne",
    description: "Choisissez un programme d'entraînement personnalisé, à suivre en autonomie via l'application.",
    bouton: "Découvrir les programmes",
    lien: "/achat-programme",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  },
  {
    titre: "Performance Clubs",
    description: "Préparation physique pour clubs, équipes et associations. Offres sur devis — échangeons de votre projet.",
    bouton: "Réserver un appel gratuit",
    lien: "/appel-decouverte",
    icon: PhoneCall,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80",
  },
];

export default function ReserverHub() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Réserver</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Laissez-moi vous accompagner</h1>
        <p className="text-sm text-muted-foreground mt-2">Choisissez l'accompagnement qui vous convient parmi nos trois formules.</p>
      </div>

      <div className="space-y-4">
        {OFFRES.map((o) => {
          const Icon = o.icon;
          return (
            <Link
              key={o.titre}
              to={o.lien}
              className="group block overflow-hidden rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg bg-card"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={o.image} alt={o.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-heading text-xl font-bold text-primary mb-1">{o.titre}</h2>
                <p className="text-sm text-muted-foreground leading-snug mb-4">{o.description}</p>
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold group-hover:gap-3 transition-all">
                  {o.bouton} <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}