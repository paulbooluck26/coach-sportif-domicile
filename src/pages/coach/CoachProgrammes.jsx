import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dumbbell, Plus, Trash2, Edit, X, Save, GripVertical } from "lucide-react";

const emptyForm = { nom: "", description: "", duree_semaines: 4, objectif: "", client_user_id: "", exercices: [] };

export default function CoachProgrammes() {
  const [programmes, setProgrammes] = useState(null);
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [p, c] = await Promise.all([
      base44.entities.Programme.list("-created_date", 100),
      base44.entities.ClientProfile.list("-created_date", 100),
    ]);
    setProgrammes(p);
    setClients(c);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const startNew = () => { setEditing({ new: true }); setForm({ ...emptyForm, exercices: [] }); };
  const startEdit = (p) => { setEditing(p); setForm({ ...p, exercices: p.exercices || [] }); };

  const save = async () => {
    const client = clients.find(c => c.user_id === form.client_user_id);
    const payload = { ...form, client_nom: client?.nom || "", exercices: form.exercices };
    if (editing.id) {
      await base44.entities.Programme.update(editing.id, payload);
    } else {
      await base44.entities.Programme.create(payload);
    }
    setEditing(null);
    setForm(emptyForm);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce programme ?")) return;
    await base44.entities.Programme.delete(id);
    load();
  };

  const addExercice = () => setForm(f => ({ ...f, exercices: [...f.exercices, { nom: "", description: "", series: 3, repetitions: "12", repos: "60s" }] }));
  const updateExercice = (i, field, val) => setForm(f => ({ ...f, exercices: f.exercices.map((ex, idx) => idx === i ? { ...ex, [field]: val } : ex) }));
  const removeExercice = (i) => setForm(f => ({ ...f, exercices: f.exercices.filter((_, idx) => idx !== i) }));
  const moveExercice = (i, dir) => setForm(f => {
    const exs = [...f.exercices];
    const j = i + dir;
    if (j < 0 || j >= exs.length) return f;
    [exs[i], exs[j]] = [exs[j], exs[i]];
    return { ...f, exercices: exs };
  });

  if (!programmes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Programmes</h1>
        </div>
        <button onClick={startNew} disabled={clients.length === 0} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm disabled:opacity-50">{clients.length === 0 ? "Ajoutez d'abord un client" : "+ Nouveau programme"}</button>
      </div>

      {programmes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Dumbbell className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun programme créé. Créez un programme et assignez-le à un client.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {programmes.map(p => (
            <div key={p.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">{p.nom}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.client_nom || "Non assigné"} · {p.duree_semaines} sem.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-accent p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {p.objectif && <p className="text-sm text-accent mb-3">Objectif : {p.objectif}</p>}
              <div className="text-sm text-muted-foreground">
                {p.exercices?.length || 0} exercice{(p.exercices?.length || 0) > 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau programme" : "Modifier le programme"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Nom du programme</label><input value={form.nom || ""} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
                  <select value={form.client_user_id || ""} onChange={e => setForm({ ...form, client_user_id: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.user_id}>{c.nom || c.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Durée (semaines)</label><input type="number" value={form.duree_semaines || 4} onChange={e => setForm({ ...form, duree_semaines: parseInt(e.target.value) || 4 })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Objectif</label><input value={form.objectif || ""} onChange={e => setForm({ ...form, objectif: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label><textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-accent" /></div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-foreground">Exercices</label>
                  <button onClick={addExercice} className="flex items-center gap-1 text-sm text-accent font-medium"><Plus className="w-4 h-4" /> Ajouter</button>
                </div>
                <div className="space-y-3">
                  {form.exercices.map((ex, i) => (
                    <div key={i} className="bg-secondary/30 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Exercice {i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveExercice(i, -1)} disabled={i === 0} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><GripVertical className="w-4 h-4 rotate-180" /></button>
                          <button onClick={() => moveExercice(i, 1)} disabled={i === form.exercices.length - 1} className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"><GripVertical className="w-4 h-4" /></button>
                          <button onClick={() => removeExercice(i)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <input value={ex.nom} onChange={e => updateExercice(i, "nom", e.target.value)} placeholder="Nom de l'exercice" className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                        <input value={ex.description || ""} onChange={e => updateExercice(i, "description", e.target.value)} placeholder="Description (optionnel)" className="w-full border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                        <div className="grid grid-cols-3 gap-2">
                          <input type="number" value={ex.series || ""} onChange={e => updateExercice(i, "series", parseInt(e.target.value) || 0)} placeholder="Séries" className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                          <input value={ex.repetitions || ""} onChange={e => updateExercice(i, "repetitions", e.target.value)} placeholder="Répétitions" className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                          <input value={ex.repos || ""} onChange={e => updateExercice(i, "repos", e.target.value)} placeholder="Repos" className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {form.exercices.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Aucun exercice. Cliquez sur "Ajouter".</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} disabled={!form.nom || !form.client_user_id} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}