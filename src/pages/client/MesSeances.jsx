import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, CheckCircle2, XCircle, RotateCcw, MapPin, Plus } from "lucide-react";

export default function MesSeances() {
  const { user } = useAuth();
  const [seances, setSeances] = useState(null);

  const load = async () => {
    if (!user) return;
    const data = await base44.entities.Seance.filter({ client_user_id: user.id }, "-date");
    setSeances(data);
  };

  useEffect(() => { load().catch(() => {}); }, [user]);

  if (!seances) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0, 10);
  const aVenir = seances.filter(s => s.date >= today && s.statut !== "annulee" && s.statut !== "effectuee");
  const passees = seances.filter(s => s.date < today || s.statut === "effectuee" || s.statut === "annulee");

  const handleCancel = async (s) => {
    const seanceDateTime = new Date(`${s.date}T${s.heure}:00`);
    const diff = seanceDateTime - new Date();
    if (diff < 24 * 60 * 60 * 1000) {
      alert("Annulation impossible : moins de 24h avant la séance. La séance n'est plus remboursable.");
      return;
    }
    if (!confirm("Annuler cette séance ? Un remboursement sera traité.")) return;
    await base44.entities.Seance.update(s.id, { statut: "annulee", paiement_statut: "rembourse" });
    await base44.entities.Paiement.filter({ seance_id: s.id }).then(pays => {
      if (pays[0]) base44.entities.Paiement.update(pays[0].id, { statut: "rembourse" });
    });
    load();
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Mon planning</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Mes séances</h1>
        </div>
        <Link to="/reservation" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm">
          <Plus className="w-4 h-4" /> Réserver
        </Link>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">À venir ({aVenir.length})</h2>
        {aVenir.length === 0 ? (
          <p className="text-muted-foreground text-sm bg-card border border-border rounded-lg p-6">Aucune séance à venir.</p>
        ) : (
          <div className="space-y-3">
            {aVenir.map(s => <SeanceCard key={s.id} seance={s} onCancel={handleCancel} future />)}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Historique ({passees.length})</h2>
        {passees.length === 0 ? (
          <p className="text-muted-foreground text-sm bg-card border border-border rounded-lg p-6">Aucune séance passée.</p>
        ) : (
          <div className="space-y-3">
            {passees.map(s => <SeanceCard key={s.id} seance={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SeanceCard({ seance, onCancel, future }) {
  const statusConfig = {
    confirmee: { icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10", label: "Confirmée" },
    effectuee: { icon: CheckCircle2, color: "text-foreground", bg: "bg-secondary", label: "Effectuée" },
    annulee: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10", label: "Annulée" },
    reportee: { icon: RotateCcw, color: "text-foreground", bg: "bg-secondary", label: "Reportée" },
  };
  const st = statusConfig[seance.statut] || statusConfig.confirmee;
  const Icon = st.icon;
  const canCancel = future && seance.statut === "confirmee";

  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-md bg-secondary flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-foreground uppercase">{new Date(seance.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
          <span className="font-heading text-lg font-bold text-foreground leading-none">{new Date(seance.date).getDate()}</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground">{typeLabel(seance.type_seance)}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {seance.heure} · {seance.duree || 60} min</span>
            {seance.lieu && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {seance.lieu}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${st.bg} ${st.color}`}>
          <Icon className="w-3.5 h-3.5" /> {st.label}
        </span>
        {canCancel && (
          <button onClick={() => onCancel(seance)} className="text-sm text-destructive hover:underline font-medium">
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

function typeLabel(t) {
  return { seance_individuelle: "Séance individuelle", programme_personnalise: "Programme personnalisé", evaluation: "Évaluation" }[t] || "Séance";
}