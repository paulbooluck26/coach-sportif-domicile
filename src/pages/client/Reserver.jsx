import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { CalendarPlus, ShoppingBag, Clock, CheckCircle2, XCircle, MapPin } from "lucide-react";

export default function Reserver() {
  const { user } = useAuth();
  const [seances, setSeances] = useState(null);

  const load = async () => {
    if (!user) return;
    try {
      const data = await base44.entities.Seance.filter({ client_user_id: user.id }, "-date");
      setSeances(data);
    } catch { setSeances([]); }
  };
  useEffect(() => { load(); }, [user]);

  if (!seances) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0, 10);
  const aVenir = seances.filter(s => s.date >= today && s.statut !== "annulee" && s.statut !== "effectuee");
  const passees = seances.filter(s => s.date < today || s.statut === "effectuee" || s.statut === "annulee").slice(0, 15);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Réserver</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Réserver & séances</h1>
      </div>

      <div className="space-y-3">
        <Link to="/reservation" className="flex items-center gap-4 bg-primary text-primary-foreground rounded-2xl p-5 hover:opacity-95 transition-opacity">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
            <CalendarPlus className="w-6 h-6 text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-semibold">Séance à domicile</p>
            <p className="text-sm text-primary-foreground/70">Coaching individuel chez vous · 70€</p>
          </div>
        </Link>
        <Link to="/achat-programme" className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 hover:border-accent transition-colors">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-semibold text-foreground">Acheter un programme</p>
            <p className="text-sm text-muted-foreground">En ligne, sans RDV — sur mesure</p>
          </div>
        </Link>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Séances à domicile — à venir ({aVenir.length})</h2>
        {aVenir.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-5 text-center">Aucune séance à venir.</p>
        ) : (
          <div className="space-y-2">
            {aVenir.map(s => <SeanceMiniCard key={s.id} seance={s} />)}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Historique</h2>
        {passees.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-5 text-center">Aucune séance passée.</p>
        ) : (
          <div className="space-y-2">
            {passees.map(s => <SeanceMiniCard key={s.id} seance={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SeanceMiniCard({ seance }) {
  const statusConfig = {
    confirmee: { icon: Clock, color: "text-accent", label: "Confirmée" },
    effectuee: { icon: CheckCircle2, color: "text-secondary", label: "Effectuée" },
    annulee: { icon: XCircle, color: "text-destructive", label: "Annulée" },
    reportee: { icon: XCircle, color: "text-muted-foreground", label: "Reportée" },
  };
  const st = statusConfig[seance.statut] || statusConfig.confirmee;
  const Icon = st.icon;
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-lg bg-secondary/10 flex flex-col items-center justify-center flex-shrink-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase">{new Date(seance.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
        <span className="font-heading text-base font-bold text-foreground leading-none">{new Date(seance.date).getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground truncate">{typeLabel(seance.type_seance)}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          <Clock className="w-3 h-3" /> {seance.heure}
          {seance.lieu && <><MapPin className="w-3 h-3 ml-1" /> <span className="truncate">{seance.lieu}</span></>}
        </div>
      </div>
      <span className={`flex items-center gap-1 text-xs font-medium ${st.color} flex-shrink-0`}>
        <Icon className="w-3.5 h-3.5" /> {st.label}
      </span>
    </div>
  );
}

function typeLabel(t) {
  return { seance_individuelle: "Séance individuelle", programme_personnalise: "Programme personnalisé", evaluation: "Évaluation" }[t] || "Séance";
}