import { ArrowLeft, Dumbbell, Target, Wrench, AlertTriangle, Lightbulb } from "lucide-react";

const MOUV_CATEG = { push: "Push", jambes: "Jambes", tirage: "Tirage", gainage: "Gainage", dos: "Dos", epaules: "Épaules", cardio: "Cardio", mobilite: "Mobilité", autre: "Autre" };
const NIVEAU = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };

export default function BiblioMouvementFiche({ mouvement, onBack }) {
  const m = mouvement;
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Bibliothèque des mouvements
      </button>

      {m.image_url && <img src={m.image_url} alt="" className="w-full h-52 object-cover rounded-2xl mb-4" />}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">{MOUV_CATEG[m.categorie]}</span>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{NIVEAU[m.niveau]}</span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-4">{m.nom}</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {m.muscles?.length > 0 && <Info icon={Target} label="Muscles travaillés" value={m.muscles.join(", ")} />}
        {m.materiel?.length > 0 && <Info icon={Wrench} label="Matériel nécessaire" value={m.materiel.join(", ")} />}
      </div>

      {m.video_url && <video src={m.video_url} controls className="w-full rounded-2xl mb-6" />}

      {m.description && <Section icon={Dumbbell} title="Description technique">{m.description}</Section>}
      {m.erreurs && <Section icon={AlertTriangle} title="Erreurs fréquentes">{m.erreurs}</Section>}
      {m.conseils && <Section icon={Lightbulb} title="Conseils du coach">{m.conseils}</Section>}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1"><Icon className="w-3 h-3" /> {label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-5">
      <p className="font-heading font-semibold text-foreground mb-1.5 flex items-center gap-2"><Icon className="w-4 h-4 text-secondary" /> {title}</p>
      <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{children}</p>
    </div>
  );
}