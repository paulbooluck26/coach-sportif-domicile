import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, Layers, Save, X } from "lucide-react";

export default function BlocsPanel({ seanceId, onOpen }) {
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ titre: "", ordre: 0, repos_entre_exercices: 60 });
  const [editId, setEditId] = useState(null);

  const load = async () => { setItems(await base44.entities.Bloc.filter({ seance_programme_id: seanceId }, "ordre")); };
  useEffect(() => { load().catch(() => {}); }, [seanceId]);

  const submit = async () => {
    if (editId) { await base44.entities.Bloc.update(editId, form); setEditId(null); }
    else { await base44.entities.Bloc.create({ ...form, seance_programme_id: seanceId, ordre: form.ordre || (items?.length || 0) }); }
    setAdding(false); setForm({ titre: "", ordre: 0, repos_entre_exercices: 60 }); load();
  };
  const edit = (b) => { setEditId(b.id); setForm({ titre: b.titre, ordre: b.ordre || 0, repos_entre_exercices: b.repos_entre_exercices || 60 }); setAdding(true); };
  const remove = async (id) => { if (confirm("Supprimer ce bloc et ses exercices ?")) { await base44.entities.Bloc.delete(id); load(); } };

  if (!items) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Blocs de la séance</h2>
        {!adding && <button onClick={() => { setAdding(true); setForm({ titre: "", ordre: items.length || 0, repos_entre_exercices: 60 }); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Bloc</button>}
      </div>

      {adding && (
        <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Titre du bloc</label><input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Échauffement, Circuit principal, Retour au calme" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Repos entre exercices (sec)</label><input type="number" value={form.repos_entre_exercices} onChange={e => setForm({ ...form, repos_entre_exercices: parseInt(e.target.value) || 60 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={!form.titre} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Ajouter"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <Layers className="w-8 h-8 text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun bloc. Les blocs regroupent les exercices (ex: échauffement, circuit principal).</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
              <button onClick={() => onOpen(b)} className="flex-1 text-left">
                <p className="font-heading font-semibold text-foreground">{b.titre}</p>
                <p className="text-sm text-muted-foreground mt-0.5">Repos: {b.repos_entre_exercices || 60}s entre exercices</p>
              </button>
              <div className="flex gap-1.5">
                <button onClick={() => edit(b)} className="p-1.5 text-muted-foreground hover:text-accent"><Edit className="w-4 h-4" /></button>
                <button onClick={() => remove(b.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}