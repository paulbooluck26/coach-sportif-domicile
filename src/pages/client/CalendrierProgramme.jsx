import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { loadClientProjection } from "@/lib/projection";
import ProgrammeCalendar from "@/components/programme/ProgrammeCalendar";
import { Link } from "react-router-dom";
import { Calendar, Play, CheckCircle2, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  faite: { icon: CheckCircle2, color: "text-secondary", label: "Faite" },
  manquee: { icon: XCircle, color: "text-destructive", label: "Manquée" },
  a_venir: { icon: Clock, color: "text-accent", label: "À venir" },
};

export default function CalendrierProgramme() {
  const { user } = useAuth();
  const [projections, setProjections] = useState(undefined);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    if (!user) return;
    loadClientProjection(user.id).then(p => setProjections(p)).catch(() => setProjections([]));
  }, [user]);

  if (projections === undefined) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().split("T")[0];
  const stats = {
    faite: projections.filter(p => p.status === "faite").length,
    manquee: projections.filter(p => p.status === "manquee").length,
    a_venir: projections.filter(p => p.status === "a_venir").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Calendrier</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Ma programmation</h1>
        <p className="text-foreground/60 mt-1">Visualisez vos séances programmées et suivez votre assiduité.</p>
      </div>

      {projections.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-secondary mx-auto mb-6" />
          <p className="text-foreground/60 mb-2">Aucune séance programmée pour le moment.</p>
          <p className="text-sm text-muted-foreground">Votre calendrier se remplira dès que votre coach activera un programme avec une date de début.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-5">
              <CheckCircle2 className="w-5 h-5 text-secondary mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">{stats.faite}</p>
              <p className="text-sm text-muted-foreground">séances faites</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <XCircle className="w-5 h-5 text-destructive mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">{stats.manquee}</p>
              <p className="text-sm text-muted-foreground">séances manquées</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-5">
              <Clock className="w-5 h-5 text-accent mb-2" />
              <p className="font-heading text-2xl font-bold text-foreground">{stats.a_venir}</p>
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
                      const cfg = STATUS_CONFIG[p.status];
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm text-foreground">{p.seance.titre}</p>
                            <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                              <Icon className="w-3.5 h-3.5" /> {cfg.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{p.programme.name} · Semaine {p.semaine.numero}</p>
                          {p.status === "a_venir" && p.date === today && (
                            <Link to={`/espace-client/seance/${p.seance.id}`} className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold">
                              <Play className="w-3 h-3" /> Démarrer maintenant
                            </Link>
                          )}
                          {p.status === "a_venir" && p.date !== today && (
                            <p className="text-xs text-muted-foreground">Programmée pour cette date.</p>
                          )}
                          {p.status === "faite" && (
                            <p className="text-xs text-secondary">Séance réalisée ✓</p>
                          )}
                          {p.status === "manquee" && (
                            <Link to={`/espace-client/seance/${p.seance.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-secondary">
                              <Play className="w-3 h-3" /> Rattraper maintenant
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
                  <Calendar className="w-8 h-8 mb-3 opacity-40" />
                  <p className="text-sm">Sélectionnez un jour dans le calendrier pour voir les séances programmées.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}