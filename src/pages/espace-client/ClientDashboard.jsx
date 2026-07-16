import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { loadClientProjection } from "@/lib/projection";
import { parseDateLocal } from "@/lib/creneaux";
import { Play, CalendarDays, Clock, MapPin, Flame, Trophy, TrendingUp, ChevronRight, Dumbbell, CalendarPlus } from "lucide-react";
import ClientAvatar from "@/components/ClientAvatar";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [seances, setSeances] = useState(null);
  const [executions, setExecutions] = useState(null);
  const [projections, setProjections] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [allSeances, execs, profiles] = await Promise.all([
          base44.entities.Seance.filter({ client_id: user.id }, "date"),
          base44.entities.ExecutionSeance.filter({ client_id: user.id }, "-date_execution", 100),
          base44.entities.ClientProfile.filter({ user_id: user.id }),
        ]);
        setSeances(allSeances);
        setExecutions(execs);
        setProfile(profiles[0] || null);
        const projs = await loadClientProjection(user.id);
        setProjections(projs);
      } catch {
        setSeances([]); setExecutions([]); setProjections([]); setProfile(null);
      }
    })();
  }, [user]);

  if (!seances || !executions || !projections) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  }

  const today = new Date().toISOString().split("T")[0];
  const prenom = (user.full_name || user.email || "").split(" ")[0];

  const todayHomeSeance = seances.find(s => s.date === today && s.status !== "cancelled" && s.status !== "completed");
  const todayProgSeances = projections.filter(p => p.date === today && p.status !== "faite");
  const hasTodaySession = todayHomeSeance || todayProgSeances.length > 0;

  const futureHomeSeances = seances.filter(s => s.date >= today && s.status !== "cancelled" && s.status !== "completed");
  const futureProgSeances = projections.filter(p => p.date > today && p.status === "a_venir");
  const allFuture = [
    ...futureHomeSeances.map(s => ({ type: "home", date: s.date, titre: typeLabel(s.type_seance), lieu: s.lieu })),
    ...futureProgSeances.map(p => ({ type: "prog", date: p.date, titre: p.seance.titre, lieu: "Autonomie" })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const nextSession = allFuture[0];

  const completedCount = executions.filter(e => e.statut === "termine").length;
  const completedDates = executions.filter(e => e.statut === "termine").map(e => e.date_execution);
  const streak = computeStreak(completedDates);
  const badges = Math.floor(completedCount / 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <ClientAvatar name={user.full_name} photoUrl={profile?.photo_url} size={56} />
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">{getGreeting()} {prenom} 👋</h1>
        </div>
      </div>

      {hasTodaySession ? (
        <div className="bg-primary text-primary-foreground rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-3">Séance du jour</p>
          {todayProgSeances.length > 0 && (
            <>
              <h2 className="font-heading text-xl font-semibold mb-1">{todayProgSeances[0].seance.titre}</h2>
              <p className="text-sm text-primary-foreground/60 mb-4">{todayProgSeances[0].programme.name}</p>
              <Link to={`/espace-client/seance/${todayProgSeances[0].seance.id}`} className="flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3.5 rounded-xl font-semibold text-sm w-full hover:opacity-90 transition-opacity">
                <Play className="w-4 h-4" /> Commencer la séance
              </Link>
            </>
          )}
          {todayHomeSeance && !todayProgSeances.length && (
            <>
              <h2 className="font-heading text-xl font-semibold mb-3">{typeLabel(todayHomeSeance.type_seance)}</h2>
              <div className="space-y-1.5 text-sm text-primary-foreground/80 mb-4">
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {todayHomeSeance.time} · {todayHomeSeance.duration_minutes || 60} min</p>
                {todayHomeSeance.location && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {todayHomeSeance.location}</p>}
              </div>
              <p className="text-xs text-primary-foreground/50">Votre coach arrive à domicile à l'heure prévue.</p>
            </>
          )}
          {todayHomeSeance && todayProgSeances.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary-foreground/15 text-sm text-primary-foreground/70">
              <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> Coach à domicile : {todayHomeSeance.time}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center">
          <Dumbbell className="w-10 h-10 text-secondary mx-auto mb-3" />
          <p className="text-foreground/70 mb-1 font-medium">Pas de séance aujourd'hui</p>
          <p className="text-sm text-muted-foreground">Profitez-en pour vous reposer ou planifier la suite.</p>
        </div>
      )}

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Votre progression</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <Flame className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{streak}</p>
            <p className="text-xs text-muted-foreground">jours de suite</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <Trophy className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">séances faites</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4 text-center">
            <TrendingUp className="w-6 h-6 text-secondary mx-auto mb-2" />
            <p className="font-heading text-2xl font-bold text-foreground">{badges}</p>
            <p className="text-xs text-muted-foreground">badges</p>
          </div>
        </div>
      </div>

      {nextSession && (
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Prochaine séance</h2>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-6 h-6 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{nextSession.titre}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {parseDateLocal(nextSession.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  {nextSession.lieu && ` · ${nextSession.lieu}`}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Link to="/espace-client/seances" className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 text-center hover:border-secondary/40 transition-colors">
          <CalendarDays className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Séances</p>
        </Link>
        <Link to="/espace-client/programme" className="bg-secondary/10 border border-secondary/20 rounded-2xl p-4 text-center hover:border-secondary/40 transition-colors">
          <Dumbbell className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="text-sm font-semibold text-foreground">Mes programmes</p>
        </Link>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

function typeLabel(t) {
  return { seance_individuelle: "Séance individuelle", programme_personnalise: "Programme personnalisé", evaluation: "Évaluation" }[t] || "Séance";
}

function computeStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const unique = [...new Set(dates)];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];
  const yesterdayStr = new Date(today.getTime() - 86400000).toISOString().split("T")[0];

  let checkDate;
  if (unique.includes(todayStr)) checkDate = today;
  else if (unique.includes(yesterdayStr)) checkDate = new Date(today.getTime() - 86400000);
  else return 0;

  let streak = 0;
  while (unique.includes(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate = new Date(checkDate.getTime() - 86400000);
  }
  return streak;
}