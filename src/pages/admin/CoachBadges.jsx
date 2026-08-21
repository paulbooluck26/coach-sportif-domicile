import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Award, Plus, Edit, X, Save, Eye, EyeOff } from "lucide-react";

const CATEGORIES = [
  { value: "demarrage", label: "Démarrage" },
  { value: "engagement_coach", label: "Engagement" },
  { value: "seances_domicile", label: "Séances à domicile" },
  { value: "programmes_ligne", label: "Programmes en ligne" },
  { value: "performances", label: "Performances" },
  { value: "records", label: "Records personnels" },
  { value: "regularite", label: "Régularité" },
  { value: "objectifs", label: "Objectifs" },
];

const CONDITIONS = [
  { value: "profil_complet", label: "Profil complété (1 = complet)" },
  { value: "bilan_termine", label: "Bilan initial terminé (1 = fait)" },
  { value: "premier_message", label: "Premier message envoyé (1 = fait)" },
  { value: "appel_realise", label: "Appel de bilan réalisé (1 = fait)" },
  { value: "seances_domicile_count", label: "Nombre de séances à domicile effectuées" },
  { value: "programmes_ligne_count", label: "Nombre de séances de programme terminées" },
  { value: "performance_count", label: "Nombre de performances enregistrées" },
  { value: "record_count", label: "Nombre de records personnels" },
  { value: "streak_semaines", label: "Semaines consécutives actives" },
  { value: "objectif_atteint_count", label: "Nombre d'objectifs atteints" },
];

const emptyForm = { code: "", categorie: "seances_domicile", nom: "", description: "", icone: "🏅", palier: 1, rare: false, condition_type: "seances_domicile_count", condition_seuil: 5, ordre_affichage: 0, actif: true };

export default function CoachBadges() {
  const [badges, setBadges] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filtreCategorie, setFiltreCategorie] = useState("");

  const load = async () => {
    const data = await base44.entities.Badge.list("ordre_affichage");
    setBadges(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const startNew = () => { setEditing({ new: true }); setForm(emptyForm); };
  const startEdit = (b) => {
    setEditing(b);
    setForm({
      code: b.code, categorie: b.categorie, nom: b.nom, description: b.description || "",
      icone: b.icone || "🏅", palier: b.palier, rare: b.rare, condition_type: b.condition_type,
      condition_seuil: b.condition_seuil, ordre_affichage: b.ordre_affichage, actif: b.actif,
    });
  };

  const save = async () => {
    const payload = { ...form, condition_seuil: parseInt(form.condition_seuil) || 1, ordre_affichage: parseInt(form.ordre_affichage) || 0, palier: parseInt(form.palier) };
    if (editing.id) {
      await base44.entities.Badge.update(editing.id, payload);
    } else {
      await base44.entities.Badge.create(payload);
    }
    setEditing(null);
    load();
  };

  const toggleActif = async (b) => { await base44.entities.Badge.update(b.id, { actif: !b.actif }); load(); };

  if (!badges) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const liste = filtreCategorie ? badges.filter((b) => b.categorie === filtreCategorie) : badges;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Badges</h1>
          <p className="text-sm text-muted-foreground mt-1">Catalogue des récompenses — attribution automatique, aucune action manuelle nécessaire.</p>
        </div>
        <button onClick={startNew} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau badge</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltreCategorie("")} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${!filtreCategorie ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>Toutes</button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setFiltreCategorie(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filtreCategorie === c.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{c.label}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {liste.map((b) => (
          <div key={b.id} className={`bg-card border rounded-lg p-5 flex items-start gap-4 ${!b.actif ? "opacity-50 border-border" : "border-border"}`}>
            <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-2xl shrink-0">{b.icone}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-semibold text-foreground">{b.nom}</h3>
                {b.rare && <span className="text-[10px] font-semibold uppercase tracking-wide bg-accent/20 text-accent px-2 py-0.5 rounded-full">Rare</span>}
                <span className="text-[10px] text-muted-foreground">Palier {b.palier}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{b.description}</p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{CONDITIONS.find((c) => c.value === b.condition_type)?.label} — seuil {b.condition_seuil}</p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => startEdit(b)} className="flex items-center gap-1.5 border border-border text-foreground px-3 py-1.5 rounded-md text-xs font-medium"><Edit className="w-3.5 h-3.5" /> Modifier</button>
                <button onClick={() => toggleActif(b)} className="p-1.5 text-muted-foreground hover:text-accent border border-border rounded-md" title={b.actif ? "Désactiver" : "Activer"}>
                  {b.actif ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau badge" : "Modifier le badge"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_80px] gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Nom</label><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Icône</label><input value={form.icone} onChange={(e) => setForm({ ...form, icone: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-center text-xl focus:outline-none focus:border-accent" /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Référence interne (SKU)</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="ex: domicile_75" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
                <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Condition de déblocage</label>
                <select value={form.condition_type} onChange={(e) => setForm({ ...form, condition_type: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                  {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Seuil</label><input type="number" value={form.condition_seuil} onChange={(e) => setForm({ ...form, condition_seuil: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Palier (1-4)</label>
                  <select value={form.palier} onChange={(e) => setForm({ ...form, palier: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Ordre</label><input type="number" value={form.ordre_affichage} onChange={(e) => setForm({ ...form, ordre_affichage: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="rounded" /> Actif</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.rare} onChange={(e) => setForm({ ...form, rare: e.target.checked })} className="rounded" /> Marquer comme rare</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} disabled={!form.nom || !form.code} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
