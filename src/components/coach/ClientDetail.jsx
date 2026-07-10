import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Star, Flame, Award, Activity, X } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const RESSENTI_LABELS = { plus_energique: "Plus énergique 💪", fatigue_satisfait: "Fatigué mais satisfait ✅", tres_fatigue: "Très fatigué 😴", douleur_inconfort: "Douleur / inconfort ⚠️" };

export default function ClientDetail({ client, onClose }) {
  const [tab, setTab] = useState("feedback");
  const [feedbacks, setFeedbacks] = useState(undefined);
  const [perfByExercise, setPerfByExercise] = useState(undefined);
  const [records, setRecords] = useState(undefined);

  useEffect(() => {
    if (!client?.user_id) return;
    (async () => {
      try {
        const execs = await base44.entities.ExecutionSeance.filter({ client_id: client.user_id }, "-date_execution", 50);
        setFeedbacks(execs.filter(e => e.note_seance || e.rpe || e.ressenti || e.feedback || e.message_coach));
        const perfsArrays = await Promise.all(execs.map(ex => base44.entities.PerformanceExercice.filter({ execution_id: ex.id })));
        const flat = perfsArrays.flatMap((perfs, i) => perfs.map(p => ({ ...p, date: execs[i].date_execution, seance_titre: execs[i].seance_titre })));
        const byExercise = {};
        flat.forEach(p => {
          if (!byExercise[p.exercice_name]) byExercise[p.exercice_name] = [];
          byExercise[p.exercice_name].push(p);
        });
        Object.keys(byExercise).forEach(k => byExercise[k].sort((a, b) => new Date(a.date) - new Date(b.date)));
        setPerfByExercise(byExercise);
        const recs = await base44.entities.RecordPerso.filter({ client_id: client.user_id }, "-date_record");
        setRecords(recs);
      } catch (e) {
        setFeedbacks([]); setPerfByExercise({}); setRecords([]);
      }
    })();
  }, [client]);

  const recordsByMouvement = {};
  (records || []).forEach(r => {
    if (!recordsByMouvement[r.mouvement]) recordsByMouvement[r.mouvement] = [];
    recordsByMouvement[r.mouvement].push(r);
  });
  Object.keys(recordsByMouvement).forEach(k => recordsByMouvement[k].sort((a, b) => new Date(b.date_record) - new Date(a.date_record)));

  const isLoading = feedbacks === undefined || perfByExercise === undefined || records === undefined;

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="font-heading text-xl font-bold text-foreground">{client?.nom}</h3>
            <p className="text-sm text-muted-foreground">Suivi détaillé</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-2 border-b border-border">
            <button onClick={() => setTab("feedback")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "feedback" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>Feedbacks</button>
            <button onClick={() => setTab("perf")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "perf" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>Performances</button>
            <button onClick={() => setTab("rm")} className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === "rm" ? "border-accent text-foreground" : "border-transparent text-muted-foreground"}`}>Records (RM)</button>
          </div>
        </div>

        <div className="px-6 py-6">
          {isLoading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <>
              {tab === "feedback" && (
                <div className="space-y-3">
                  {feedbacks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucun feedback pour le moment.</p>
                  ) : (
                    feedbacks.map(f => (
                      <div key={f.id} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-semibold text-sm text-foreground">{f.seance_titre || "Séance"}</p>
                          <span className="text-xs text-muted-foreground">{f.date_execution ? new Date(f.date_execution).toLocaleDateString("fr-FR") : "—"}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {f.note_seance > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Note:</span>
                              <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= f.note_seance ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />)}</div>
                            </div>
                          )}
                          {f.rpe > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Effort:</span>
                              <div className="flex">{[1,2,3,4,5].map(n => <Flame key={n} className={`w-3.5 h-3.5 ${n <= f.rpe ? "fill-destructive text-destructive" : "text-muted-foreground/30"}`} />)}</div>
                            </div>
                          )}
                          {f.ressenti && <span className="text-sm text-foreground/80">{RESSENTI_LABELS[f.ressenti] || f.ressenti}</span>}
                        </div>
                        {f.douleur && <p className="text-sm text-foreground/60 mt-2"><span className="text-muted-foreground">Douleur: </span>{f.douleur}</p>}
                        {f.message_coach && <p className="text-sm text-foreground/60 mt-2 bg-secondary/10 rounded p-2"><span className="text-muted-foreground">Message: </span>{f.message_coach}</p>}
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "perf" && (
                <div className="space-y-4">
                  {Object.keys(perfByExercise).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucune performance enregistrée.</p>
                  ) : (
                    Object.entries(perfByExercise).map(([name, recs]) => {
                      const weightData = recs.filter(r => r.actual_weight > 0).map(r => ({ date: r.date, label: new Date(r.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), poids: r.actual_weight }));
                      return (
                        <div key={name} className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Activity className="w-4 h-4 text-secondary" />
                            <h4 className="font-heading font-semibold text-foreground">{name}</h4>
                            <span className="text-xs text-muted-foreground ml-auto">{recs.length} enregistrements</span>
                          </div>
                          {weightData.length >= 2 && (
                            <div className="mb-3 h-36">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weightData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                                  <Line type="monotone" dataKey="poids" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary))", r: 3 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                          <div className="space-y-1">
                            {[...recs].reverse().slice(0, 5).map((r, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm py-1 border-b border-border/30 last:border-0">
                                <span className="text-muted-foreground w-20">{new Date(r.date).toLocaleDateString("fr-FR")}</span>
                                <span className="text-foreground">{r.actual_sets || "—"} × {r.actual_reps || "—"}</span>
                                <span className="text-foreground font-medium ml-auto">{r.actual_weight ? `${r.actual_weight} kg` : "—"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === "rm" && (
                <div className="space-y-4">
                  {records.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Aucun record personnel enregistré.</p>
                  ) : (
                    Object.entries(recordsByMouvement).map(([mouvement, recs]) => {
                      const best = recs.reduce((max, r) => r.valeur > max.valeur ? r : max, recs[0]);
                      const chartData = [...recs].reverse().map(r => ({ date: r.date_record, label: new Date(r.date_record).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }), valeur: r.valeur }));
                      return (
                        <div key={mouvement} className="bg-card border border-border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Award className="w-4 h-4 text-accent" />
                            <h4 className="font-heading font-semibold text-foreground">{mouvement}</h4>
                            <div className="ml-auto text-right">
                              <span className="font-heading text-lg font-bold text-secondary">{best.valeur} {best.unite}</span>
                              <span className="text-xs text-muted-foreground ml-2">meilleur</span>
                            </div>
                          </div>
                          {chartData.length >= 2 && (
                            <div className="mb-3 h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} domain={["auto", "auto"]} />
                                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                                  <Line type="monotone" dataKey="valeur" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary))", r: 3 }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                          <div className="space-y-1">
                            {recs.map(r => (
                              <div key={r.id} className="flex items-center gap-3 text-sm py-1 border-b border-border/30 last:border-0">
                                <span className="text-muted-foreground w-20">{new Date(r.date_record).toLocaleDateString("fr-FR")}</span>
                                <span className="text-foreground font-medium">{r.valeur} {r.unite}</span>
                                {r.id === best.id && <span className="text-xs px-1.5 py-0.5 rounded bg-secondary/20 text-secondary">Best</span>}
                                {r.notes && <span className="text-muted-foreground text-xs flex-1 truncate">· {r.notes}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}