import { Link } from "react-router-dom";
import { CalendarDays, Dumbbell, Award, MessageCircle, User, X } from "lucide-react";

const ZONES = [
  { icon: CalendarDays, titre: "Réservez vos séances", desc: "À domicile, quand vous voulez.", to: "/espace-client/seances" },
  { icon: Dumbbell, titre: "Suivez votre programme", desc: "Vos séances en ligne, pas à pas.", to: "/espace-client/programme" },
  { icon: Award, titre: "Vos badges de progression", desc: "Chaque effort compte.", to: "/espace-client/badges" },
  { icon: MessageCircle, titre: "Échangez avec moi", desc: "Une question ? Je suis là.", to: "/espace-client/messages" },
  { icon: User, titre: "Votre profil", desc: "Coordonnées, objectif, paiements.", to: "/espace-client/profil" },
];

export default function BienvenueEspaceClient({ prenom, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-primary/50 flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      <div className="bg-card rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>

        <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase mb-2">Bienvenue</p>
        <h2 className="text-2xl font-heading font-bold text-primary mb-2">
          Ravi de vous accompagner{prenom ? `, ${prenom}` : ""} 👋
        </h2>
        <p className="text-sm text-muted-foreground mb-6">Voici un rapide aperçu de votre espace.</p>

        <div className="space-y-2.5 mb-6">
          {ZONES.map((z) => (
            <Link
              key={z.to}
              to={z.to}
              onClick={onClose}
              className="flex items-center gap-3 border border-border rounded-xl p-3.5 hover:border-accent hover:bg-accent/5 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                <z.icon className="w-4.5 h-4.5 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{z.titre}</p>
                <p className="text-xs text-muted-foreground">{z.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-primary text-primary-foreground py-3 rounded-full text-sm font-semibold hover:scale-[1.02] transition-all duration-300"
        >
          Découvrir mon espace
        </button>
      </div>
    </div>
  );
}
