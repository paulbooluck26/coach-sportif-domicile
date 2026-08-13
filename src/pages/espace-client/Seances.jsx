import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { listerCarnetsActifs, renouvelerAbonnementsSiBesoin } from "@/lib/carnetSeances";
import ProgrammeCalendar from "@/components/programme/ProgrammeCalendar";
import ReservationCredit from "@/components/seances/ReservationCredit";
import SeanceManageModal from "@/components/seances/SeanceManageModal";
import { parseDateLocal } from "@/lib/creneaux";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, CheckCircle2, CalendarPlus, ShoppingBag, X, Flame } from "lucide-react";

const STATUT_BADGE = {
  booked: { label: "Confirmée", cls: "bg-accent/15 text-accent" },
  rescheduled: { label: "Reportée", cls: "bg-secondary text-foreground" },
  completed: { label: "Effectuée", cls: "bg-primary/10 text-primary/70" },
  no_show: { label: "Absent", cls: "bg-destructive/10 text-destructive" },
};

export default function Seances() {
  const { user } = useAuth();
  const [seances, setSeances] = useState(null);
  const [carnets, setCarnets] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showResa, setShowResa] = useState(false);
  const [seanceGeree, setSeanceGeree] = useState(null);

  const load = async () => {
    if (!user) return;
    try {
      await renouvelerAbonnementsSiBesoin(user.id);
      const [allSeances, activeCarnets, profiles] = await Promise.all([
        base44.entities.Seance.filter({ client_id: user.id }, "date"),
        listerCarnetsActifs(user.id),
        base44.entities.ClientProfile.filter({ user_id: user.id }),
      ]);
      setSeances(allSeances);
      setCarnets(activeCarnets);
      setProfile(profiles[0] || null);
    } catch {
      setSeances([]); setCarnets([]); setProfile(null);
    }
  };
  useEffect(() => { load(); }, [user]);

  if (!seances || !carnets) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0, 10);
  const coaching = seances.filter((s) => s.status !== "cancelled");
  const faites = coaching.filter((s) => s.status === "completed");
  const aVenir = coaching.filter((s) => s.date >= today && s.status !== "completed" && s.status !== "no_show");

  const projections = coaching.map((s) => ({
    date: s.date,
    status: s.status === "completed" ? "faite" : s.status === "no_show" ? "manquee" : "a_venir",
    deplacee: s.status === "rescheduled",
    titre: typeLabel(s.session_type),
    time: s.time,
    data: s,
  }));

  const hasCredit = carnets.some((c) => c.nb_seances_restantes > 0);
  const dayEvents = selectedDay ? projections.filter((p) => p.date === selectedDay) : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Coaching à domicile</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Séances</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-secondary mx-auto mb-2" />
          <p className="font-heading text-2xl font-bold text-foreground">{faites.length}</p>
          <p className="text-xs text-muted-foreground">séances faites</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <CalendarDays className="w-6 h-6 text-accent mx-auto mb-2" />
          <p className="font-heading text-2xl font-bold text-foreground">{aVenir.length}</p>
          <p className="text-xs text-muted-foreground">à venir</p>
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Mes crédits</h2>
        {carnets.length === 0 ? (
          <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-5 text-center">
            <p className="font-medium text-foreground mb-1">Aucun crédit de séances</p>
            <p className="text-sm text-muted-foreground">Achetez un pack ou un abonnement pour réserver vos séances à domicile.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {carnets.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-heading font-semibold text-foreground">{c.offre_titre}</p>
                  <p className="text-xs text-muted-foreground">{c.type_carnet === "abonnement" && c.periode ? `Mois de ${formatPeriode(c.periode)}` : "Pack de séances"}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-bold text-secondary">{c.nb_seances_restantes}<span className="text-sm text-muted-foreground font-normal"> / {c.nb_seances_total}</span></p>
                  <p className="text-xs text-muted-foreground">restantes</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setShowResa(true)} disabled={!hasCredit} className="bg-primary text-primary-foreground py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
          <CalendarPlus className="w-4 h-4" /> Réserver une séance
        </button>
        <Link to="/espace-client/reserver/domicile" className="bg-secondary/10 border border-secondary/30 text-foreground py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Acheter d'autres séances
        </Link>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Calendrier des séances</h2>
        <ProgrammeCalendar projections={projections} onDayClick={(d) => setSelectedDay(d)} />
      </div>

      {selectedDay && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground capitalize">{parseDateLocal(selectedDay).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</h3>
            <button onClick={() => setSelectedDay(null)} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune séance ce jour.</p>
          ) : (
            <div className="space-y-2">
              {dayEvents.map((ev) => {
                const badge = STATUT_BADGE[ev.data.status] || STATUT_BADGE.booked;
                const gerable = ev.data.status === "booked" || ev.data.status === "rescheduled";
                return (
                  <button
                    key={ev.data.id}
                    onClick={() => gerable && setSeanceGeree(ev.data)}
                    disabled={!gerable}
                    className={`w-full flex items-center gap-3 p-3 bg-secondary/10 rounded-xl text-left ${gerable ? "hover:bg-secondary/20 transition-colors" : "cursor-default"}`}
                  >
                    <span className="text-xs font-semibold text-muted-foreground w-14">{ev.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{ev.titre}</p>
                      {ev.data.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.data.location}</p>}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showResa && (
        <ReservationCredit
          carnets={carnets.filter((c) => c.nb_seances_restantes > 0)}
          adresse={profile?.adresse}
          onClose={() => setShowResa(false)}
          onReserved={() => { setShowResa(false); load(); }}
        />
      )}

      {seanceGeree && (
        <SeanceManageModal
          seance={seanceGeree}
          onClose={() => setSeanceGeree(null)}
          onUpdated={load}
        />
      )}
    </div>
  );
}

function typeLabel(t) {
  return { seance_individuelle: "Séance individuelle", programme_personnalise: "Programme personnalisé", evaluation: "Diagnostic FORGE", bilan_initial: "Bilan initial" }[t] || "Séance";
}

function formatPeriode(p) {
  const [y, m] = p.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}
