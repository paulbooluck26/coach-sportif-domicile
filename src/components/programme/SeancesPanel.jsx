import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, Dumbbell, Save, X, Copy } from "lucide-react";
import { cloneSeance } from "@/lib/programmeClone";

const TYPES = { force: "Force", cardio: "Cardio", mobilite: "Mobilité", recuperation: "Récupération", mixte: "Mixte" };
const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

export default function SeancesPanel({ semaineId, onOpen }) {
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ titre: "", jour_semaine: 1, type_seance: "force", description: "" });
  const [editId, setEditId] = useState(null);

  const load = async () => { setItems(await base44.entities.SeanceProgramme.filter({ semaine_id: semaineId })); };
  useEffect(() => { load().catch(() => {}); }, [semaineId]);

  const submit = async () => {
    if (editId) { await base44.entities.SeanceProgramme.update(editId, form); setEditId(null); }
    else { await base44.entities.SeanceProgramme.create({ ...form, semaine_id: semaineId }); }
    setAdding(false); setForm({ titre: "", jour_semaine: 1, type_seance: "force", description: "" }); load();
  };
  const edit = (s) => { setEditId(s.id); setForm({ titre: s.titre, jour_semaine: s.jour_semaine ?? 1, type_seance: s.type_seance || "force", description: s.description || "" }); setAdding(true); };
  const remove = async (id) => { if (confirm("Supprimer cette séance et tout son contenu ?")) { await base44.entities.SeanceProgramme.delete(id); load(); } };

  const duplicate = async (s) => { await cloneSeance(s, semaineId); load(); };

  if (!items) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Séances de la semaine</h2>
        {!adding && <button onClick={() => setAdding(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Séance</button>}
      </div>

      {adding && (
        <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Titre de la séance</label><input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Haut du corps - Force" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Jour</label><select value={form.jour_semaine} onChange={e => setForm({ ...form, jour_semaine: parseInt(e.target.value) })} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-card">{JOURS.map((j, i) => <option key={i} value={i}>{j}</option>)}</select></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Type</label><select value={form.type_seance} onChange={e => setForm({ ...form, type_seance: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-card">{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Notes (optionnel)</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none" /></div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={!form.titre} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Ajouter"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <Dumbbell className="w-8 h-8 text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune séance. Ajoutez votre première séance ci-dessus.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
              <button onClick={() => onOpen(s)} className="flex-1 text-left">
                <p className="font-heading font-semibold text-foreground">{s.titre}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{JOURS[s.jour_semaine] || "—"} · <span className="text-accent">{TYPES[s.type_seance] || s.type_seance}</span></p>
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => duplicate(s)} className="p-1.5 text-muted-foreground hover:text-accent" title="Dupliquer"><Copy className="w-4 h-4" /></button>
                <button onClick={() => edit(s)} className="p-1.5 text-muted-foreground hover:text-accent"><Edit className="w-4 h-4" /></button>
                <button onClick={() => remove(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}