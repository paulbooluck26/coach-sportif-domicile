import { useState, useMemo } from "react";
import { ArrowLeft, Search } from "lucide-react";

const MOUV_CATEG = { push: "Push", jambes: "Jambes", tirage: "Tirage", gainage: "Gainage", dos: "Dos", epaules: "Épaules", cardio: "Cardio", mobilite: "Mobilité", autre: "Autre" };
const NIVEAU = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };

export default function BiblioMouvements({ mouvements, onSelect, onBack }) {
  const [q, setQ] = useState("");
  const [fCateg, setFCateg] = useState("");
  const [fMateriel, setFMateriel] = useState("");
  const [fMuscle, setFMuscle] = useState("");

  const materiels = useMemo(() => [...new Set(mouvements.flatMap(m => m.materiel || []))].sort(), [mouvements]);
  const muscles = useMemo(() => [...new Set(mouvements.flatMap(m => m.muscles || []))].sort(), [mouvements]);
  const categories = useMemo(() => [...new Set(mouvements.map(m => m.categorie))], [mouvements]);

  const filtered = mouvements.filter(m => {
    if (fCateg && m.categorie !== fCateg) return false;
    if (fMateriel && !(m.materiel || []).includes(fMateriel)) return false;
    if (fMuscle && !(m.muscles || []).includes(fMuscle)) return false;
    if (q.trim()) {
      const s = q.toLowerCase();
      const hay = [m.nom, m.description, ...(m.mots_cles || []), ...(m.muscles || [])].join(" ").toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Bibliothèque
      </button>
      <h1 className="font-heading text-2xl font-bold text-foreground mb-1">Bibliothèque des mouvements</h1>
      <p className="text-sm text-muted-foreground mb-5">Apprends les exercices : technique, erreurs et conseils.</p>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un mouvement..." className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none" />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4">
        <FilterSelect label="Catégorie" value={fCateg} onChange={setFCateg} options={categories.map(c => ({ value: c, label: MOUV_CATEG[c] || c }))} />
        <FilterSelect label="Matériel" value={fMateriel} onChange={setFMateriel} options={materiels.map(m => ({ value: m, label: m }))} />
        <FilterSelect label="Muscle" value={fMuscle} onChange={setFMuscle} options={muscles.map(m => ({ value: m, label: m }))} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">Aucun mouvement ne correspond à vos filtres.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(m => (
            <button key={m.id} onClick={() => onSelect(m)} className="bg-card border border-border rounded-2xl overflow-hidden text-left hover:border-secondary/40 transition-colors">
              {m.image_url ? <img src={m.image_url} alt="" className="w-full h-28 object-cover" /> : <div className="w-full h-28 bg-secondary/10 flex items-center justify-center"><span className="text-3xl">{m.video_url ? "🎥" : "🏋️"}</span></div>}
              <div className="p-3">
                <p className="font-semibold text-foreground text-sm leading-tight">{m.nom}</p>
                <p className="text-xs text-muted-foreground mt-1">{MOUV_CATEG[m.categorie] || m.categorie} · {NIVEAU[m.niveau]}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className="text-xs bg-card border border-border rounded-full px-3 py-1.5 focus:outline-none focus:border-secondary whitespace-nowrap">
      <option value="">{label} : tous</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}