import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, TrendingUp, Filter } from "lucide-react";

export default function CoachPaiements() {
  const [paiements, setPaiements] = useState(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const data = await base44.entities.Paiement.list("-date_paiement", 200);
    setPaiements(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  if (!paiements) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const total = paiements.filter(p => p.statut === "reussi").reduce((s, p) => s + (p.montant || 0), 0);
  const rembourses = paiements.filter(p => p.statut === "rembourse").reduce((s, p) => s + (p.montant || 0), 0);
  const net = total - rembourses;

  const months = [...new Set(paiements.map(p => new Date(p.date_paiement).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })))];
  const filtered = filter === "all" ? paiements : paiements.filter(p => {
    const m = new Date(p.date_paiement).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return m === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Paiements</h1>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6"><TrendingUp className="w-5 h-5 text-accent mb-3" /><p className="font-heading text-2xl font-bold text-foreground">{total}€</p><p className="text-sm text-muted-foreground">Encaissé</p></div>
        <div className="bg-card border border-border rounded-lg p-6"><CreditCard className="w-5 h-5 text-destructive mb-3" /><p className="font-heading text-2xl font-bold text-foreground">{rembourses}€</p><p className="text-sm text-muted-foreground">Remboursé</p></div>
        <div className="bg-primary text-primary-foreground rounded-lg p-6"><TrendingUp className="w-5 h-5 text-accent mb-3" /><p className="font-heading text-2xl font-bold">{net}€</p><p className="text-sm text-primary-foreground/70">Net encaissé</p></div>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent">
          <option value="all">Toutes les périodes</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <CreditCard className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun paiement enregistré.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Méthode</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground">{new Date(p.date_paiement).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{p.client_nom || "—"}</td>
                  <td className="px-6 py-4 font-heading font-semibold text-foreground">{p.montant}€</td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{p.methode || "carte"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.statut === "reussi" ? "bg-accent/15 text-accent" : p.statut === "rembourse" ? "bg-destructive/10 text-destructive" : "bg-secondary text-muted-foreground"}`}>{p.statut}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}