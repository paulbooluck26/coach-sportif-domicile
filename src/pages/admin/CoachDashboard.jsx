import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { CalendarDays, Users, Inbox, CreditCard, TrendingUp, Clock, ArrowRight } from "lucide-react";

export default function CoachDashboard() {
  const [demandes, setDemandes] = useState(null);
  const [seances, setSeances] = useState(null);
  const [paiements, setPaiements] = useState(null);
  const [clients, setClients] = useState(null);
  const [commandes, setCommandes] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [d, s, p, c, cmd] = await Promise.all([
        base44.entities.DemandeContact.list("-created_date", 50),
        base44.entities.Seance.list("date"),
        base44.entities.Paiement.list("-date_paiement", 50),
        base44.entities.ClientProfile.list("-created_date", 50),
        base44.entities.CommandeProgramme.list("-created_date", 50),
      ]);
      setDemandes(d); setSeances(s); setPaiements(p); setClients(c); setCommandes(cmd);
    };
    load().catch(() => {});
  }, []);

  if (!demandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0, 10);
  const aVenir = seances.filter(s => s.date >= today && s.status !== "cancelled" && s.status !== "completed");
  const nouvellesDemandes = demandes.filter(d => d.statut === "nouveau");
  const commandesATraiter = (commandes || []).filter(c => (c.statut || "en_preparation") === "en_preparation");
  const revenuMois = paiements.filter(p => p.status === "paid" && p.date_paiement && new Date(p.date_paiement).getMonth() === new Date().getMonth()).reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    { label: "Séances à venir", value: aVenir.length, icon: CalendarDays, to: "/admin/seances" },
    { label: "Nouvelles demandes", value: nouvellesDemandes.length, icon: Inbox, to: "/admin/demandes" },
    { label: "Clients actifs", value: clients.length, icon: Users, to: "/admin/clients" },
    { label: "Revenu ce mois", value: `${revenuMois}€`, icon: TrendingUp, to: "/admin/paiements" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Tableau de bord</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Vue d'ensemble</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <Link key={s.label} to={s.to} className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <p className="font-heading text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">Prochaines séances</h2>
            <Link to="/admin/seances" className="text-sm text-accent hover:underline">Voir tout →</Link>
          </div>
          {aVenir.slice(0, 5).length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune séance à venir.</p>
          ) : (
            <div className="space-y-3">
              {aVenir.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-md bg-secondary flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] uppercase text-foreground font-semibold">{new Date(s.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
                    <span className="font-heading font-bold text-sm text-foreground leading-none">{new Date(s.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{s.client_name || "Client"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time} · {typeLabel(s.session_type)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">Demandes récentes</h2>
            <Link to="/admin/demandes" className="text-sm text-accent hover:underline">Voir tout →</Link>
          </div>
          {nouvellesDemandes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune nouvelle demande.</p>
          ) : (
            <div className="space-y-3">
              {nouvellesDemandes.slice(0, 5).map(d => (
                <div key={d.id} className="py-2">
                  <p className="font-medium text-foreground text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{d.goal || d.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-foreground">Commandes à traiter</h2>
            <Link to="/admin/commandes" className="text-sm text-accent hover:underline">Voir tout →</Link>
          </div>
          {commandesATraiter.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Aucune commande en attente.</p>
          ) : (
            <div className="space-y-3">
              {commandesATraiter.slice(0, 5).map(c => (
                <Link key={c.id} to={`/admin/programmes?client_id=${c.client_id}&duree=${c.duree_semaines}&commande_id=${c.id}`} className="flex items-center justify-between py-2 hover:opacity-70 transition-opacity">
                  <div>
                    <p className="font-medium text-foreground text-sm">{c.client_nom || "Client"}</p>
                    <p className="text-xs text-muted-foreground">{c.offre?.toUpperCase()} · {c.duree_semaines} semaines</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function typeLabel(t) {
  return { seance_individuelle: "Séance indiv.", programme_personnalise: "Programme", evaluation: "Évaluation" }[t] || "Séance";
}
