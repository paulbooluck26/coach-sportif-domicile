import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, Calendar, Save, X, Copy } from "lucide-react";
import { cloneSemaine } from "@/lib/programmeClone";

export default function SemainesPanel({ programmeId, onOpen }) {
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ numero: 1, titre: "", objectif: "" });
  const [editId, setEditId] = useState(null);

  const load = async () => { setItems(await base44.entities.Semaine.filter({ programme_id: programmeId }, "numero")); };
  useEffect(() => { load().catch(() => {}); }, [programmeId]);

  const submit = async () => {
    if (editId) { await base44.entities.Semaine.update(editId, form); setEditId(null); }
    else { await base44.entities.Semaine.create({ ...form, programme_id: programmeId }); }
    setAdding(false); setForm({ numero: (items?.length || 0) + 1, titre: "", objectif: "" }); load();
  };
  const edit = (s) => { setEditId(s.id); setForm({ numero: s.numero, titre: s.titre || "", objectif: s.objectif || "" }); setAdding(true); };
  const remove = async (id) => { if (confirm("Supprimer cette semaine et tout son contenu ?")) { await base44.entities.Semaine.delete(id); load(); } };

  const duplicate = async (s) => { await cloneSemaine(s, programmeId, (items.length || 0) + 1); load(); };

  if (!items) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Semaines du programme</h2>
        {!adding && <button onClick={() => { setAdding(true); setForm({ numero: (items.length || 0) + 1, titre: "", objectif: "" }); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Semaine</button>}
      </div>

      {adding && (
        <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">N°</label><input type="number" value={form.numero} onChange={e => setForm({ ...form, numero: parseInt(e.target.value) || 1 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-muted-foreground mb-1">Titre</label><input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Semaine d'introduction" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Objectif de la semaine</label><input value={form.objectif} onChange={e => setForm({ ...form, objectif: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div className="flex gap-2">
            <button onClick={submit} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Ajouter"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune semaine. Ajoutez votre première semaine ci-dessus.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
              <button onClick={() => onOpen(s)} className="flex-1 text-left">
                <p className="font-heading font-semibold text-foreground">Semaine {s.numero}{s.titre ? ` — ${s.titre}` : ""}</p>
                {s.objectif && <p className="text-sm text-muted-foreground mt-0.5">{s.objectif}</p>}
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