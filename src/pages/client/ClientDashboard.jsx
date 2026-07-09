import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, Dumbbell, TrendingUp, Plus } from "lucide-react";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [seances, setSeances] = useState(null);
  const [programme, setProgramme] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [allSeances, prog] = await Promise.all([
        base44.entities.Seance.filter({ client_user_id: user.id }, "date"),
        base44.entities.Programme.filter({ client_user_id: user.id, actif: true }).then(r => r[0] || null),
      ]);
      setSeances(allSeances);
      setProgramme(prog);
      // ensure profile
      const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      else {
        const np = await base44.entities.ClientProfile.create({ user_id: user.id, nom: user.full_name || "", email: user.email });
        setProfile(np);
      }
    };
    load().catch(() => {});
  }, [user]);

  if (!user) return null;
  if (!seances) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  }

  const today = new Date().toISOString().slice(0, 10);
  const aVenir = seances.filter(s => s.date >= today && s.statut !== "annulee");
  const passees = seances.filter(s => s.date < today || s.statut === "effectuee");
  const nextSeance = aVenir[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Bienvenue</p>
        <h1 className="font-heading text-3xl lg:text-4xl font-bold text-foreground">Bonjour, {user.full_name || user.email}</h1>
      </div>

      {nextSeance ? (
        <div className="bg-primary text-primary-foreground rounded-lg p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-4">Prochaine séance</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="font-heading text-2xl font-semibold mb-4">{typeLabel(nextSeance.type_seance)}</h2>
              <div className="space-y-2 text-primary-foreground/80">
                <p className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-accent" /> {formatDate(nextSeance.date)}</p>
                <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /> {nextSeance.heure} · {nextSeance.duree || 60} min</p>
                {nextSeance.lieu && <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" /> {nextSeance.lieu}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/50 text-sm mb-1">Statut</p>
              <span className="inline-block bg-accent/20 text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium capitalize">{nextSeance.statut}</span>
            </div>
          </div>
          {canCancel(nextSeance) && (
            <p className="mt-6 pt-6 border-t border-primary-foreground/15 text-sm text-primary-foreground/60">
              Annulation gratuite jusqu'à 24h avant la séance.
            </p>
          )}
        </div>
      ) : (
        <div className="bg-secondary/40 border border-border rounded-lg p-10 text-center">
          <p className="text-foreground/60 mb-6">Aucune séance à venir. Réservez votre prochaine session dès maintenant.</p>
          <Link to="/reservation" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm">
            <Plus className="w-4 h-4" /> Réserver une séance
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <CalendarDays className="w-5 h-5 text-accent mb-3" />
          <p className="font-heading text-3xl font-bold text-foreground">{aVenir.length}</p>
          <p className="text-sm text-muted-foreground">séances à venir</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <TrendingUp className="w-5 h-5 text-accent mb-3" />
          <p className="font-heading text-3xl font-bold text-foreground">{passees.length}</p>
          <p className="text-sm text-muted-foreground">séances effectuées</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <Dumbbell className="w-5 h-5 text-accent mb-3" />
          <p className="font-heading text-3xl font-bold text-foreground">{programme?.exercices?.length || 0}</p>
          <p className="text-sm text-muted-foreground">exercices au programme</p>
        </div>
      </div>

      {programme && (
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">Mon programme</p>
              <h2 className="font-heading text-xl font-semibold text-foreground">{programme.nom}</h2>
            </div>
            <Link to="/espace-client/programme" className="text-sm font-semibold text-accent hover:underline">Voir le détail →</Link>
          </div>
          <p className="text-foreground/60 text-sm">{programme.duree_semaines} semaines · {programme.objectif}</p>
        </div>
      )}
    </div>
  );
}

function typeLabel(t) {
  return { seance_individuelle: "Séance individuelle", programme_personnalise: "Programme personnalisé", evaluation: "Évaluation" }[t] || "Séance";
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function canCancel(seance) {
  const seanceDateTime = new Date(`${seance.date}T${seance.heure}:00`);
  const diff = seanceDateTime - new Date();
  return diff > 24 * 60 * 60 * 1000;
}