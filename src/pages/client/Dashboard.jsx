import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { CalendarDays, Clock, MapPin, CheckCircle2, XCircle, Loader2, AlertCircle, Dumbbell, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [seances, setSeances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  useEffect(() => {
    if (user) loadSeances();
  }, [user]);

  const loadSeances = async () => {
    try {
      let client = await base44.entities.Client.filter({ email: user.email });
      client = client[0];
      if (!client) { setSeances([]); return; }
      const all = await base44.entities.Seance.filter({ client_id: client.id }, "-date", 50);
      setSeances(all);
    } catch (err) {
      setSeances([]);
    } finally {
      setLoading(false);
    }
  };

  const canCancel = (date, time) => {
    const sessionDateTime = new Date(`${date}T${time}:00`);
    const diff = sessionDateTime.getTime() - Date.now();
    return diff > 24 * 60 * 60 * 1000;
  };

  const handleCancel = async (id) => {
    setCanceling(id);
    try {
      await base44.entities.Seance.update(id, { status: "cancelled" });
      setSeances(seances.map((s) => s.id === id ? { ...s, status: "cancelled" } : s));
    } catch (_) {} finally {
      setCanceling(null);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const today = new Date().toISOString().split("T")[0];
  const upcoming = seances.filter((s) => s.date >= today && s.status === "booked");
  const past = seances.filter((s) => s.date < today || s.status !== "booked").slice(0, 10);

  const statusLabel = (status) => ({
    booked: { label: "À venir", color: "text-secondary", icon: CalendarDays },
    completed: { label: "Terminée", color: "text-foreground/60", icon: CheckCircle2 },
    cancelled: { label: "Annulée", color: "text-destructive", icon: XCircle },
  }[status] || { label: status, color: "text-muted-foreground", icon: AlertCircle });

  return (
    <div>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Bonjour {user?.full_name?.split(" ")[0] || ""}</h1>
          <p className="text-muted-foreground mt-1">Voici vos séances à venir et votre historique.</p>
        </div>
        <Link to="/reservation" className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Réserver
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-heading font-semibold text-primary mb-5">Séances à venir</h2>
        {upcoming.length === 0 ? (
          <div className="bg-muted/30 border border-border rounded-2xl p-10 text-center">
            <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Aucune séance à venir pour le moment.</p>
            <Link to="/reservation" className="inline-flex items-center gap-2 mt-4 text-secondary font-medium text-sm hover:underline">
              <Plus className="w-4 h-4" /> Réserver ma première séance
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((s) => {
              const Status = statusLabel(s.status);
              const cancelable = canCancel(s.date, s.time);
              return (
                <div key={s.id} className="bg-background border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary flex flex-col items-center justify-center text-primary-foreground shrink-0">
                      <span className="text-xs">{new Date(s.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                      <span className="text-xl font-heading font-bold leading-none">{new Date(s.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary capitalize">{new Date(s.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> À domicile</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      <Status.icon className={`w-4 h-4 ${Status.color}`} /> <span className={Status.color}>{Status.label}</span>
                    </span>
                    {cancelable ? (
                      <button
                        onClick={() => handleCancel(s.id)} disabled={canceling === s.id}
                        className="px-4 py-2 border border-destructive/30 text-destructive rounded-full text-xs font-medium hover:bg-destructive/5 transition-colors"
                      >
                        {canceling === s.id ? "…" : "Annuler"}
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Moins de 24h — non annulable</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-heading font-semibold text-primary mb-5 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-secondary" /> Historique
        </h2>
        {past.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune séance passée.</p>
        ) : (
          <div className="bg-background border border-border rounded-2xl divide-y divide-border">
            {past.map((s) => {
              const Status = statusLabel(s.status);
              return (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Status.icon className={`w-4 h-4 ${Status.color}`} />
                    <span className="text-sm font-medium text-primary capitalize">{new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                    <span className="text-sm text-muted-foreground">· {s.time}</span>
                  </div>
                  <span className={`text-sm font-medium ${Status.color}`}>{Status.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}