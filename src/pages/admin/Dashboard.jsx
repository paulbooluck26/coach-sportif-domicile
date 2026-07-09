import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Users, CalendarDays, CreditCard, Inbox, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [clients, seances, paiements, demandes] = await Promise.all([
          base44.entities.Client.list(),
          base44.entities.Seance.list(),
          base44.entities.Paiement.list(),
          base44.entities.DemandeContact.list(),
        ]);
        const paidPaiements = paiements.filter((p) => p.status === "paid");
        const totalRevenue = paidPaiements.reduce((sum, p) => sum + (p.amount || 0), 0);
        const upcomingSessions = seances.filter((s) => s.date >= new Date().toISOString().split("T")[0] && s.status === "booked");
        const newRequests = demandes.filter((d) => d.status === "nouveau");

        setStats({
          totalClients: clients.length,
          upcomingSessions: upcomingSessions.length,
          totalRevenue,
          newRequests: newRequests.length,
        });

        const months = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const monthKey = d.toISOString().slice(0, 7);
          const monthRevenue = paidPaiements.filter((p) => p.created_date?.startsWith(monthKey)).reduce((sum, p) => sum + (p.amount || 0), 0);
          months.push({ month: d.toLocaleDateString("fr-FR", { month: "short" }), revenue: monthRevenue });
        }
        setRevenueData(months);
      } catch (_) {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const cards = [
    { label: "Clients", value: stats.totalClients, icon: Users, to: "/admin/clients", color: "text-secondary" },
    { label: "Séances à venir", value: stats.upcomingSessions, icon: CalendarDays, to: "/admin/seances", color: "text-secondary" },
    { label: "Revenus (total)", value: `${stats.totalRevenue}€`, icon: CreditCard, to: "/admin/paiements", color: "text-secondary" },
    { label: "Nouvelles demandes", value: stats.newRequests, icon: Inbox, to: "/admin/demandes", color: "text-secondary" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-primary mb-1">Tableau de bord</h1>
      <p className="text-muted-foreground mb-10">Vue d'ensemble de votre activité.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c, i) => (
          <Link key={i} to={c.to} className="bg-background border border-border rounded-2xl p-5 hover:shadow-lg hover:border-secondary/40 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-2xl font-heading font-bold text-primary">{c.value}</p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-background border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-secondary" />
          <h2 className="font-heading font-semibold text-primary">Revenus — 6 derniers mois</h2>
        </div>
        <div className="flex items-end gap-3 h-48">
          {revenueData.map((m, i) => {
            const max = Math.max(...revenueData.map((r) => r.revenue), 1);
            const height = (m.revenue / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-primary">{m.revenue}€</span>
                <div className="w-full bg-secondary rounded-t-lg transition-all duration-500" style={{ height: `${Math.max(height, 2)}%`, minHeight: "8px" }} />
                <span className="text-xs text-muted-foreground capitalize">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}