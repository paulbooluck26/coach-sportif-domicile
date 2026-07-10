import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dumbbell, Plus, Trash2, Edit, X, Save, Hammer } from "lucide-react";
import ProgrammeBuilder from "@/components/programme/ProgrammeBuilder";

const STATUTS = {
  brouillon: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  actif: { label: "Actif", color: "bg-secondary text-secondary-foreground" },
  termine: { label: "Terminé", color: "bg-primary/10 text-primary/60" },
};

const emptyForm = { name: "", description: "", duration_weeks: 4, objective: "", client_id: "", statut: "brouillon" };

export default function CoachProgrammes() {
  const [programmes, setProgrammes] = useState(null);
  const [clients, setClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [builder, setBuilder] = useState(null);

  const load = async () => {
    const [p, c] = await Promise.all([
      base44.entities.Programme.list("-created_date", 100),
      base44.entities.ClientProfile.list("-created_date", 100),
    ]);
    setProgrammes(p);
    setClients(c);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const startNew = () => { setEditing({ new: true }); setForm(emptyForm); };
  const startEdit = (p) => { setEditing(p); setForm({ name: p.name || "", description: p.description || "", duration_weeks: p.duration_weeks || 4, objective: p.objective || "", client_id: p.client_id || "", statut: p.statut || "brouillon" }); };

  const save = async () => {
    const client = clients.find(c => c.user_id === form.client_id);
    const payload = { ...form, client_name: client?.nom || "" };
    if (editing.id) {
      await base44.entities.Programme.update(editing.id, payload);
    } else {
      await base44.entities.Programme.create(payload);
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce programme et tout son contenu ?")) return;
    await base44.entities.Programme.delete(id);
    load();
  };

  if (builder) return <ProgrammeBuilder programme={builder} onBack={() => { setBuilder(null); load(); }} />;

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
          <p className="text-muted-foreground">Aucun programme créé. Créez un programme puis bâtissez sa structure semaine par semaine.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {programmes.map(p => {
            const st = STATUTS[p.statut] || STATUTS.brouillon;
            return (
              <div key={p.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.client_name || "Non assigné"} · {p.duration_weeks || 4} sem.</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                </div>
                {p.objective && <p className="text-sm text-accent mb-4">Objectif : {p.objective}</p>}
                <div className="flex gap-2">
                  <button onClick={() => setBuilder(p)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold"><Hammer className="w-4 h-4" /> Constructeur</button>
                  <button onClick={() => startEdit(p)} className="p-2 text-muted-foreground hover:text-accent border border-border rounded-md"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => remove(p.id)} className="p-2 text-muted-foreground hover:text-destructive border border-border rounded-md"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau programme" : "Modifier le programme"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Nom du programme</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
                  <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    <option value="">Sélectionner un client</option>
                    {clients.map(c => <option key={c.id} value={c.user_id}>{c.nom || c.email}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Durée (sem.)</label><input type="number" value={form.duration_weeks} onChange={e => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 4 })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Objectif</label><input value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Statut</label>
                  <select value={form.statut} onChange={e => setForm({ ...form, statut: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    <option value="brouillon">Brouillon</option>
                    <option value="actif">Actif</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label><textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-accent" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} disabled={!form.name || !form.client_id} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}