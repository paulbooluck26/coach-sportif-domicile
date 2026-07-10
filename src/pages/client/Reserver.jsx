import { Link } from "react-router-dom";
import { Home, Dumbbell, PhoneCall, ArrowRight } from "lucide-react";

const OFFRES = [
  {
    titre: "Coaching à domicile",
    description: "Réservez une séance de coaching sportif personnalisée à domicile.",
    bouton: "Réserver une séance",
    lien: "/reservation",
    icon: Home,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    accent: "bg-primary text-primary-foreground",
  },
  {
    titre: "Programmes personnalisés",
    description: "Choisissez un programme d'entraînement adapté à vos objectifs.",
    bouton: "Découvrir les programmes",
    lien: "/achat-programme",
    icon: Dumbbell,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3aad?w=800&q=80",
    accent: "bg-secondary text-secondary-foreground",
  },
  {
    titre: "Parler de votre projet",
    description: "Réservez un appel découverte gratuit afin d'échanger sur vos objectifs et déterminer l'accompagnement le plus adapté.",
    bouton: "Réserver un appel gratuit",
    lien: "/appel-decouverte",
    icon: PhoneCall,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800&q=80",
    accent: "bg-accent text-accent-foreground",
  },
];

export default function Reserver() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Réserver</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Que souhaitez-vous faire ?</h1>
        <p className="text-sm text-muted-foreground mt-2">Choisissez l'accompagnement qui vous convient parmi nos trois formules.</p>
      </div>

      <div className="space-y-4">
        {OFFRES.map((o) => {
          const Icon = o.icon;
          return (
            <Link
              key={o.titre}
              to={o.lien}
              className="group block relative overflow-hidden rounded-2xl border border-border hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={o.image} alt={o.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
                <div className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-accent/20 backdrop-blur flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
                <h2 className="font-heading text-xl font-bold mb-1">{o.titre}</h2>
                <p className="text-sm text-primary-foreground/75 leading-snug mb-4">{o.description}</p>
                <span className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-sm font-semibold group-hover:gap-3 transition-all">
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