import { PhoneCall, PhoneForwarded, MessageSquare } from "lucide-react";

const ITEMS = [
  {
    icon: PhoneCall,
    title: "Appel de démarrage",
    desc: "Définition de vos objectifs, analyse de votre profil, explication du programme et personnalisation de votre accompagnement.",
  },
  {
    icon: PhoneForwarded,
    title: "Appel de bilan",
    desc: "Analyse des résultats, retour sur votre progression et définition des prochaines étapes à la fin du programme.",
  },
  {
    icon: MessageSquare,
    title: "Messagerie privée",
    desc: "Posez vos questions, bénéficiez d'un suivi régulier et échangez avec votre coach pendant toute la durée du programme.",
  },
];

export default function ProgrammeAccompagnement({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-accent/20 bg-background p-6 ${className}`}>
      <p className="text-xs font-semibold tracking-label text-secondary mb-5">ACCOMPAGNEMENT HUMAIN INCLUS</p>
      <div className="space-y-5">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.title} className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-primary mb-0.5">{it.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}