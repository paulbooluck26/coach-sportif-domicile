import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { TrendingUp, Dumbbell, Plus, Trash2, Edit, X, Save, Award, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const UNITES = ["kg", "reps", "sec", "min", "km"];

export default function MesPerformances() {
  const { user } = useAuth();
  const [tab, setTab] = useState("perf");
  const [perfData, setPerfData] = useState(undefined);
  const [records, setRecords] = useState(undefined);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mouvement: "", valeur: "", unite: "kg", date_record: new Date().toISOString().split("T")[0], notes: "" });
  const [editId, setEditId] = useState(null);

  const loadPerf = async () => {
    if (!user) return;
    try {
      const execs = await base44.entities.ExecutionSeance.filter({ client_id: user.id }, "-date_execution", 50);
      const perfsArrays = await Promise.all(execs.map(ex => base44.entities.PerformanceExercice.filter({ execution_id: ex.id })));
      const flat = perfsArrays.flatMap((perfs, i) => perfs.map(p => ({ ...p, date: execs[i].date_execution, seance_titre: execs[i].seance_titre })));
      const byExercise = {};
      flat.forEach(p => {
        if (!byExercise[p.exercice_name]) byExercise[p.exercice_name] = [];
        byExercise[p.exercice_name].push(p);
      });
      Object.keys(byExercise).forEach(k => byExercise[k].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setPerfData(byExercise);
    } catch { setPerfData({}); }
  };

  const loadRecords = async () => {
    if (!user) return;
    try {
      const recs = await base44.entities.RecordPerso.filter({ client_id: user.id }, "-date_record");
      setRecords(recs);
    } catch { setRecords([]); }
  };

  useEffect(() => { loadPerf(); loadRecords(); }, [user]);

  const submitRecord = async () => {
    if (editId) {
      await base44.entities.RecordPerso.update(editId, { ...form, valeur: parseFloat(form.valeur) || 0 });
    } else {
      await base44.entities.RecordPerso.create({ ...form, client_id: user.id, valeur: parseFloat(form.valeur) || 0 });
    }
    setShowForm(false); setEditId(null);
    setForm({ mouvement: "", valeur: "", unite: "kg", date_record: new Date().toISOString().split("T")[0], notes: "" });
    loadRecords();
  };

  const editRecord = (r) => {
    setEditId(r.id);
    setForm({ mouvement: r.mouvement, valeur: String(r.valeur), unite: r.unite || "kg", date_record: r.date_record, notes: r.notes || "" });
    setShowForm(true);
  };

  const deleteRecord = async (id) => {
    if (!confirm("Supprimer ce record ?")) return;
    await base44.entities.RecordPerso.delete(id);
    loadRecords();
  };

  const recordsByMouvement = {};
  (records || []).forEach(r => {
    if (!recordsByMouvement[r.mouvement]) recordsByMouvement[r.mouvement] = [];
    recordsByMouvement[r.mouvement].push(r);
  });
  Object.keys(recordsByMouvement).forEach(k => recordsByMouvement[k].sort((a, b) => new Date(b.date_record) - new Date(a.date_record)));
  const existingMouvements = Object.keys(recordsByMouvement);

  if (perfData === undefined || records === undefined) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Suivi</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Mes performances</h1>
        <p className="text-foreground/60 mt-1">Suivez votre progression et vos records personnels dans le temps.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setTab("perf")} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === "perf" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>
          <Activity className="w-4 h-4 inline mr-1.5" /> Performances par séance
        </button>
        <button onClick={() => setTab("rm")} className={`px-4 py-2.5 text-sm font-medium border-b-2 ${tab === "rm" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>
          <Award className="w-4 h-4 inline mr-1.5" /> Records personnels (RM)
        </button>
      </div>

      {tab === "perf" && (
        <div className="space-y-6">
          {Object.keys(perfData).length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <TrendingUp className="w-10 h-10 text-secondary mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune performance enregistrée pour le moment. Les données de vos séances apparaîtront ici automatiquement.</p>
            </div>
          ) : (
            Object.entries(perfData).map(([name, recs]) => {
              const weightData = recs.filter(r => r.actual_weight > 0).map(r => ({ date: r.date, label: new Date(r.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), poids: r.actual_weight }));
              return (
                <div key={name} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Dumbbell className="w-5 h-5 text-secondary" />
                    <h3 className="font-heading text-lg font-semibold text-foreground">{name}</h3>
                    <span className="text-xs text-muted-foreground ml-auto">{recs.length} séances</span>
                  </div>
                  {weightData.length >= 2 && (
                    <div className="mb-4 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={weightData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                          <Line type="monotone" dataKey="poids" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary))", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground border-b border-border">
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Séance</th>
                          <th className="py-2 pr-4">Séries</th>
                          <th className="py-2 pr-4">Reps</th>
                          <th className="py-2">Poids</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...recs].reverse().map((r, i) => (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2 pr-4 text-foreground">{new Date(r.date).toLocaleDateString("fr-FR")}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{r.seance_titre || "—"}</td>
                            <td className="py-2 pr-4 text-foreground">{r.actual_sets || "—"}</td>
                            <td className="py-2 pr-4 text-foreground">{r.actual_reps || "—"}</td>
                            <td className="py-2 text-foreground font-medium">{r.actual_weight ? `${r.actual_weight} kg` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {tab === "rm" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Enregistrez vos records personnels et suivez leur évolution.</p>
            <button onClick={() => { setShowForm(true); setEditId(null); setForm({ mouvement: "", valeur: "", unite: "kg", date_record: new Date().toISOString().split("T")[0], notes: "" }); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Nouveau record</button>
          </div>

          {showForm && (
            <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Mouvement</label>
                  <input list="mouvements-list" value={form.mouvement} onChange={e => setForm({ ...form, mouvement: e.target.value })} placeholder="Ex: Squat, Développé couché..." className="w-full border border-border rounded-md px-3 py-2 text-sm" />
                  <datalist id="mouvements-list">{existingMouvements.map(m => <option key={m} value={m} />)}</datalist>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                  <input type="date" value={form.date_record} onChange={e => setForm({ ...form, date_record: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Valeur</label>
                  <input type="number" step="0.5" value={form.valeur} onChange={e => setForm({ ...form, valeur: e.target.value })} placeholder="Ex: 120" className="w-full border border-border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Unité</label>
                  <select value={form.unite} onChange={e => setForm({ ...form, unite: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-card">
                    {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Notes (optionnel)</label>
                <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Ex: 1RM estimé, série de 5..." className="w-full border border-border rounded-md px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-2">
                <button onClick={submitRecord} disabled={!form.mouvement || !form.valeur} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Enregistrer"}</button>
                <button onClick={() => { setShowForm(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
              </div>
            </div>
          )}

          {Object.keys(recordsByMouvement).length === 0 && !showForm ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Award className="w-10 h-10 text-secondary mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun record enregistré. Ajoutez votre premier record personnel pour suivre vos performances.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(recordsByMouvement).map(([mouvement, recs]) => {
                const best = recs.reduce((max, r) => r.valeur > max.valeur ? r : max, recs[0]);
                const chartData = [...recs].reverse().map(r => ({ date: r.date_record, label: new Date(r.date_record).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), valeur: r.valeur }));
                return (
                  <div key={mouvement} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-accent" />
                      <h3 className="font-heading text-lg font-semibold text-foreground">{mouvement}</h3>
                      <div className="ml-auto text-right">
                        <p className="font-heading text-2xl font-bold text-secondary">{best.valeur}<span className="text-sm text-muted-foreground ml-1">{best.unite}</span></p>
                        <p className="text-xs text-muted-foreground">Record actuel</p>
                      </div>
                    </div>
                    {chartData.length >= 2 && (
                      <div className="mb-4 h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
                            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                            <Line type="monotone" dataKey="valeur" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary))", r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {recs.map(r => (
                        <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                          <span className="text-sm text-muted-foreground w-24">{new Date(r.date_record).toLocaleDateString("fr-FR")}</span>
                          <span className="text-sm font-medium text-foreground">{r.valeur} {r.unite}</span>
                          {r.id === best.id && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">Meilleur</span>}
                          {r.notes && <span className="text-sm text-muted-foreground flex-1 truncate">· {r.notes}</span>}
                          <div className="flex gap-1 ml-auto">
                            <button onClick={() => editRecord(r)} className="p-1 text-muted-foreground hover:text-accent"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteRecord(r.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}