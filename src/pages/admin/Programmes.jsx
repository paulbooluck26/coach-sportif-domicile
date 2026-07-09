import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, X, Dumbbell, Trash2, ChevronDown, ChevronUp, Target } from "lucide-react";

export default function AdminProgrammes() {
  const [programmes, setProgrammes] = useState(null);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [exercices, setExercices] = useState({});
  const [newExo, setNewExo] = useState({ name: "", sets: "", reps: "", rest_seconds: 60, description: "" });
  const [form, setForm] = useState({ client_id: "", name: "", duration_weeks: 4, objective: "", description: "" });

  const load = async () => {
    try {
      const [progs, cls] = await Promise.all([base44.entities.Programme.list("-created_date"), base44.entities.Client.list()]);
      setProgrammes(progs);
      setClients(cls);
      for (const p of progs) {
        const exos = await base44.entities.Exercice.filter({ programme_id: p.id }, "order", 50);
        setExercices((prev) => ({ ...prev, [p.id]: exos }));
      }
    } catch (_) { setProgrammes([]); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === form.client_id);
    try {
      await base44.entities.Programme.create({ ...form, client_name: client?.full_name || "" });
      setForm({ client_id: "", name: "", duration_weeks: 4, objective: "", description: "" });
      setShowForm(false);
      load();
    } catch (_) {}
  };

  const addExercice = async (progId) => {
    if (!newExo.name) return;
    try {
      const order = (exercices[progId]?.length || 0);
      await base44.entities.Exercice.create({ ...newExo, programme_id: progId, order, sets: newExo.sets ? Number(newExo.sets) : null, rest_seconds: Number(newExo.rest_seconds) });
      setNewExo({ name: "", sets: "", reps: "", rest_seconds: 60, description: "" });
      const exos = await base44.entities.Exercice.filter({ programme_id: progId }, "order", 50);
      setExercices((prev) => ({ ...prev, [progId]: exos }));
    } catch (_) {}
  };

  const deleteExo = async (exoId, progId) => {
    try {
      await base44.entities.Exercice.delete(exoId);
      const exos = await base44.entities.Exercice.filter({ programme_id: progId }, "order", 50);
      setExercices((prev) => ({ ...prev, [progId]: exos }));
    } catch (_) {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Programmes</h1>
          <p className="text-muted-foreground mt-1">Créez et assignez des programmes personnalisés.</p>
        </div>
        <button onClick={() => setShowForm(true)} disabled={clients.length === 0} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform disabled:opacity-40">
          <Plus className="w-4 h-4" /> Nouveau programme
        </button>
      </div>

      {!programmes ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : programmes.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun programme créé. {clients.length === 0 && "Ajoutez d'abord un client."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {programmes.map((p) => (
            <div key={p.id} className="bg-background border border-border rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === p.id ? null : p.id)} className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Dumbbell className="w-5 h-5 text-secondary" /></div>
                  <div className="text-left">
                    <h3 className="font-heading font-semibold text-primary">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.client_name} · {p.duration_weeks} semaines · {p.objective || "—"}</p>
                  </div>
                </div>
                {expanded === p.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
              </button>

              {expanded === p.id && (
                <div className="px-5 pb-5 border-t border-border">
                  <div className="space-y-2 mt-4">
                    {(exercices[p.id] || []).map((ex, i) => (
                      <div key={ex.id} className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs font-heading font-bold text-secondary">{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-primary">{ex.name}</p>
                            <p className="text-xs text-muted-foreground">{ex.sets ? `${ex.sets} séries · ` : ""}{ex.reps ? `${ex.reps} reps · ` : ""}{ex.rest_seconds}s repos</p>
                          </div>
                        </div>
                        <button onClick={() => deleteExo(ex.id, p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <input placeholder="Nom exercice" value={newExo.name} onChange={(e) => setNewExo({ ...newExo, name: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
                    <input placeholder="Séries" type="number" value={newExo.sets} onChange={(e) => setNewExo({ ...newExo, sets: e.target.value })} className="w-20 px-3 py-2 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
                    <input placeholder="Reps" value={newExo.reps} onChange={(e) => setNewExo({ ...newExo, reps: e.target.value })} className="w-20 px-3 py-2 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
                    <button onClick={() => addExercice(p.id)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:scale-105 transition-transform"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-2xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary flex items-center gap-2"><Target className="w-5 h-5 text-secondary" /> Nouveau programme</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none bg-background">
                <option value="">Sélectionner un client…</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              <input required placeholder="Nom du programme *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <input type="number" placeholder="Durée (semaines)" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: Number(e.target.value) })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Objectif" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none resize-none" />
              <button type="submit" className="w-full py-3 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform">Créer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}