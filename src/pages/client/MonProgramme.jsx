import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Dumbbell, Target, Calendar, ChevronDown, ChevronRight, Layers, Play, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { loadClientProjection } from "@/lib/projection";
import ProgrammeCalendar from "@/components/programme/ProgrammeCalendar";

const TYPES = { force: "Force", cardio: "Cardio", mobilite: "Mobilité", recuperation: "Récupération", mixte: "Mixte" };
const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const STATUS_CFG = { faite: { icon: CheckCircle2, color: "text-secondary", label: "Faite" }, manquee: { icon: XCircle, color: "text-destructive", label: "Manquée" }, a_venir: { icon: Clock, color: "text-accent", label: "À venir" } };

export default function MonProgramme() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState(undefined);
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [view, setView] = useState("liste");
  const [projections, setProjections] = useState(undefined);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const allProgs = await base44.entities.Programme.filter({ statut: "actif" });
        const myProgs = allProgs.filter(p => p.client_ids?.includes(user.id));
        if (myProgs.length === 0) { setPrograms(null); return; }
        const trees = await Promise.all(myProgs.map(async (prog) => {
          const semaines = await base44.entities.Semaine.filter({ programme_id: prog.id }, "numero");
          const seancesArrays = await Promise.all(semaines.map(s => base44.entities.SeanceProgramme.filter({ semaine_id: s.id })));
          const seances = seancesArrays.flat();
          const blocsArrays = await Promise.all(seances.map(se => base44.entities.Bloc.filter({ seance_programme_id: se.id }, "ordre")));
          const blocs = blocsArrays.flat();
          const exosArrays = await Promise.all(blocs.map(b => base44.entities.Exercice.filter({ bloc_id: b.id }, "order")));
          const exercices = exosArrays.flat();
          const fullTree = semaines.map(s => ({
            ...s,
            seances: seances.filter(se => se.semaine_id === s.id).map(se => ({
              ...se,
              blocs: blocs.filter(b => b.seance_programme_id === se.id).map(b => ({
                ...b,
                exercices: exercices.filter(ex => ex.bloc_id === b.id),
              })),
            })),
          }));
          return { programme: prog, semaines: fullTree };
        }));
        setPrograms(trees);
        setSelectedId(trees[0].programme.id);
      } catch { setPrograms(null); }
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadClientProjection(user.id).then(p => setProjections(p)).catch(() => setProjections([]));
  }, [user]);

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  if (programs === undefined) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  if (!programs) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Mes programmes</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Programme personnalisé</h1>
        </div>
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Dumbbell className="w-12 h-12 text-secondary mx-auto mb-6" />
          <p className="text-foreground/60 mb-2">Votre coach n'a pas encore activé de programme.</p>
          <p className="text-sm text-muted-foreground">Il apparaîtra ici dès qu'il sera prêt.</p>
        </div>
      </div>
    );
  }

  const tree = programs.find(p => p.programme.id === selectedId) || programs[0];
  const { programme, semaines } = tree;
  const totalSeances = semaines.reduce((acc, s) => acc + s.seances.length, 0);
  const today = new Date().toISOString().split("T")[0];
  const calStats = projections ? { faite: projections.filter(p => p.status === "faite").length, manquee: projections.filter(p => p.status === "manquee").length, a_venir: projections.filter(p => p.status === "a_venir").length } : { faite: 0, manquee: 0, a_venir: 0 };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Mes programmes</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-heading text-3xl font-bold text-foreground">{programme.name}</h1>
          <div className="inline-flex bg-card border border-border rounded-md p-1">
            <button onClick={() => setView("liste")} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${view === "liste" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Liste</button>
            <button onClick={() => setView("calendrier")} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${view === "calendrier" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Calendrier</button>
          </div>
        </div>
        {view === "liste" && programme.description && <p className="text-foreground/60 mt-2">{programme.description}</p>}
      </div>

      {view === "liste" && (
        <>
          {programs.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {programs.map((p) => (
                <button key={p.programme.id} onClick={() => setSelectedId(p.programme.id)} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${p.programme.id === selectedId ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-accent"}`}>
                  {p.programme.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <Calendar className="w-5 h-5 text-accent mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">{semaines.length}</p>
              <p className="text-sm text-muted-foreground">semaines</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <Dumbbell className="w-5 h-5 text-accent mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">{totalSeances}</p>
              <p className="text-sm text-muted-foreground">séances</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <Target className="w-5 h-5 text-accent mb-2" />
              <p className="font-heading text-sm font-semibold text-foreground leading-tight">{programme.objective || "Progression globale"}</p>
              <p className="text-sm text-muted-foreground mt-1">objectif</p>
            </div>
          </div>

          <div className="space-y-3">
            {semaines.map((sem) => (
              <div key={sem.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <button onClick={() => toggle(sem.id)} className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                  <div className="text-left">
                    <p className="font-heading font-semibold text-foreground">Semaine {sem.numero}{sem.titre ? ` — ${sem.titre}` : ""}</p>
                    {sem.objectif && <p className="text-sm text-muted-foreground">{sem.objectif}</p>}
                  </div>
                  {expanded[sem.id] ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                </button>
                {expanded[sem.id] && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                    {sem.seances.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">Aucune séance définie.</p>
                    ) : (
                      sem.seances.map((se) => (
                        <div key={se.id} className="bg-secondary/10 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <Dumbbell className="w-4 h-4 text-secondary" />
                            <p className="font-heading font-semibold text-foreground text-sm">{se.titre}</p>
                            <span className="text-xs text-muted-foreground">· {se.jours_semaine?.map(j => JOURS[j]).join(", ") || "—"}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary font-medium">{TYPES[se.type_seance] || se.type_seance}</span>
                            <Link to={`/espace-client/seance/${se.id}`} className="ml-auto bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> Démarrer</Link>
                          </div>
                          {se.description && <p className="text-sm text-foreground/60 mb-3">{se.description}</p>}
                          <div className="space-y-2">
                            {se.blocs.map((bl) => (
                              <div key={bl.id} className="bg-background rounded-lg p-3">
                                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-2 flex items-center gap-1.5"><Layers className="w-3 h-3" /> {bl.titre}{bl.rounds > 1 && <span className="text-muted-foreground font-normal normal-case tracking-normal"> · {bl.rounds} tours</span>}</p>
                                <div className="space-y-1.5">
                                  {bl.exercices.map((ex, i) => (
                                    <div key={ex.id} className="flex items-start gap-2 text-sm">
                                      <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                      <div className="flex-1">
                                        <p className="text-foreground font-medium">{ex.name}</p>
                                        <p className="text-muted-foreground text-xs">{ex.sets} séries × {ex.reps} · {ex.rest_seconds}s repos{ex.intensity ? ` · ${ex.intensity}` : ""}</p>
                                        {ex.description && <p className="text-foreground/50 text-xs mt-0.5">{ex.description}</p>}
                                      </div>
                                    </div>
                                  ))}
                                  {bl.exercices.length === 0 && <p className="text-xs text-muted-foreground">Aucun exercice.</p>}
                                </div>
                              </div>
                            ))}
                            {se.blocs.length === 0 && <p className="text-xs text-muted-foreground">Aucun bloc défini.</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
            {semaines.length === 0 && <p className="text-muted-foreground text-sm bg-card border border-border rounded-lg p-6">Votre coach n'a pas encore défini le contenu de ce programme.</p>}
          </div>
        </>
      )}

      {view === "calendrier" && (
        <>
          {projections === undefined ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
          ) : projections.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Calendar className="w-12 h-12 text-secondary mx-auto mb-6" />
              <p className="text-foreground/60 mb-2">Aucune séance programmée dans le calendrier.</p>
              <p className="text-sm text-muted-foreground">Les séances apparaîtront ici dès que votre coach aura défini les jours de séance et la date de début de votre programme.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-card border border-border rounded-lg p-5">
                  <CheckCircle2 className="w-5 h-5 text-secondary mb-2" />
                  <p className="font-heading text-2xl font-bold text-foreground">{calStats.faite}</p>
                  <p className="text-sm text-muted-foreground">séances faites</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <XCircle className="w-5 h-5 text-destructive mb-2" />
                  <p className="font-heading text-2xl font-bold text-foreground">{calStats.manquee}</p>
                  <p className="text-sm text-muted-foreground">séances manquées</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-5">
                  <Clock className="w-5 h-5 text-accent mb-2" />
                  <p className="font-heading text-2xl font-bold text-foreground">{calStats.a_venir}</p>
                  <p className="text-sm text-muted-foreground">à venir</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <ProgrammeCalendar projections={projections} onDayClick={(date, dayProjs) => setSelectedDay({ date, projections: dayProjs })} />
                <div>
                  {selectedDay ? (
                    <div className="bg-card border border-border rounded-lg p-6">
                      <p className="font-heading font-semibold text-foreground mb-4">
                        {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                      <div className="space-y-3">
                        {selectedDay.projections.map((p, i) => {
                          const cfg = STATUS_CFG[p.status];
                          const Icon = cfg.icon;
                          return (
                            <div key={i} className="border border-border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-sm text-foreground">{p.seance.titre}</p>
                                <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}><Icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">{p.programme.name} · Semaine {p.semaine.numero}</p>
                              {p.status === "a_venir" && p.date === today && (
                                <Link to={`/espace-client/seance/${p.seance.id}`} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold"><Play className="w-3 h-3" /> Démarrer maintenant</Link>
                              )}
                              {p.status === "a_venir" && p.date !== today && <p className="text-xs text-muted-foreground">Programmée pour cette date.</p>}
                              {p.status === "faite" && <p className="text-xs text-secondary">Séance réalisée ✓</p>}
                              {p.status === "manquee" && (
                                <Link to={`/espace-client/seance/${p.seance.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-secondary"><Play className="w-3 h-3" /> Rattraper maintenant</Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                      <Calendar className="w-8 h-8 mb-3 opacity-40" />
                      <p className="text-sm">Sélectionnez un jour pour voir les séances programmées.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}