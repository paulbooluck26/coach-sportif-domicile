import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Dumbbell, Target, Calendar, Play, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { loadClientProjection } from "@/lib/projection";
import ProgrammeCalendar from "@/components/programme/ProgrammeCalendar";
import RescheduleSession from "@/components/programme/RescheduleSession";

const STATUS_CFG = { faite: { icon: CheckCircle2, color: "text-secondary", label: "Faite" }, manquee: { icon: XCircle, color: "text-destructive", label: "À rattraper" }, a_venir: { icon: Clock, color: "text-accent", label: "À venir" } };

export default function MonProgramme() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState(undefined);
  const [selectedId, setSelectedId] = useState(null);
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
          return { programme: prog, semaines, seances };
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

  const reloadProjections = () => loadClientProjection(user.id).then(p => { setProjections(p); setSelectedDay(null); }).catch(() => setProjections([]));

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
  const { programme, semaines, seances } = tree;
  const totalSeances = seances.length;
  const today = new Date().toISOString().split("T")[0];
  const calStats = projections ? { faite: projections.filter(p => p.status === "faite").length, manquee: projections.filter(p => p.status === "manquee").length, a_venir: projections.filter(p => p.status === "a_venir").length } : { faite: 0, manquee: 0, a_venir: 0 };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Mes programmes</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="font-heading text-3xl font-bold text-foreground">{programme.name}</h1>
          <Link to="/espace-client/performances" className="text-sm font-medium text-accent hover:text-secondary flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Progression</Link>
        </div>
        {programme.description && <p className="text-foreground/60 mt-2">{programme.description}</p>}
      </div>

      {programs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {programs.map((p) => (
            <button key={p.programme.id} onClick={() => setSelectedId(p.programme.id)} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${p.programme.id === selectedId ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:border-accent"}`}>
              {p.programme.name}
            </button>
          ))}
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-foreground flex items-center gap-2"><Calendar className="w-5 h-5 text-secondary" /> Calendrier</h2>
        {projections === undefined ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
        ) : projections.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-10 text-center">
            <Calendar className="w-10 h-10 text-secondary mx-auto mb-4" />
            <p className="text-foreground/60 mb-1">Aucune séance programmée dans le calendrier.</p>
            <p className="text-sm text-muted-foreground">Les séances apparaîtront dès que votre coach aura défini les jours et la date de début.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <ProgrammeCalendar projections={projections} onDayClick={(date, dayProjs) => setSelectedDay({ date, projections: dayProjs })} />
            <div>
              {selectedDay ? (
                <div className="bg-card border border-border rounded-lg p-6">
                  <p className="font-heading font-semibold text-foreground mb-4 capitalize">
                    {new Date(selectedDay.date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                  <div className="space-y-3">
                    {selectedDay.projections.map((p, i) => {
                      const cfg = STATUS_CFG[p.status];
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2 gap-2">
                            <p className="font-semibold text-sm text-foreground">{p.seance.titre}</p>
                            <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color} shrink-0`}><Icon className="w-3.5 h-3.5" /> {cfg.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{p.programme.name} · Semaine {p.semaine.numero}{p.deplacee ? ` · Reportée du ${new Date(p.date_prevue + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}` : ""}</p>
                          {p.status === "a_venir" && p.date === today && (
                            <Link to={`/espace-client/seance/${p.seance.id}`} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold"><Play className="w-3 h-3" /> Démarrer maintenant</Link>
                          )}
                          {p.status === "a_venir" && p.date !== today && <p className="text-xs text-muted-foreground">Programmée pour cette date.</p>}
                          {p.status === "faite" && <p className="text-xs text-secondary">Séance réalisée ✓</p>}
                          {p.status === "manquee" && <RescheduleSession projection={p} onRescheduled={reloadProjections} />}
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
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-foreground">Résumé du programme</h2>
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
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl font-bold text-foreground">Suivi du programme</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <CheckCircle2 className="w-5 h-5 text-secondary mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{calStats.faite}</p>
            <p className="text-sm text-muted-foreground">séances faites</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <XCircle className="w-5 h-5 text-destructive mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{calStats.manquee}</p>
            <p className="text-sm text-muted-foreground">à rattraper</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-5">
            <Clock className="w-5 h-5 text-accent mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{calStats.a_venir}</p>
            <p className="text-sm text-muted-foreground">à venir</p>
          </div>
        </div>
      </section>
    </div>
  );
}