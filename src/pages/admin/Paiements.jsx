import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CreditCard, TrendingUp, Search } from "lucide-react";

export default function AdminPaiements() {
  const [paiements, setPaiements] = useState(null);
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const data = await base44.entities.Paiement.list("-created_date", 100);
      setPaiements(data);
    } catch (_) { setPaiements([]); }
  };
  useEffect(() => { load(); }, []);

  const filtered = paiements?.filter((p) => p.client_name?.toLowerCase().includes(search.toLowerCase())) || [];
  const totalRevenue = filtered.filter((p) => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);

  const statusBadge = (s) => ({
    paid: { label: "Payé", cls: "bg-secondary/10 text-secondary" },
    pending: { label: "En attente", cls: "bg-accent/20 text-accent-foreground" },
    refunded: { label: "Remboursé", cls: "bg-muted text-muted-foreground" },
    failed: { label: "Échec", cls: "bg-destructive/10 text-destructive" },
  }[s] || { label: s, cls: "bg-muted text-muted-foreground" });

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-primary mb-1">Paiements</h1>
      <p className="text-muted-foreground mb-8">Suivez les paiements reçus par séance et par client.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-background border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center"><CreditCard className="w-6 h-6 text-secondary" /></div>
          <div><p className="text-2xl font-heading font-bold text-primary">{totalRevenue}€</p><p className="text-sm text-muted-foreground">Revenus filtrés</p></div>
        </div>
        <div className="bg-background border border-border rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-secondary" /></div>
          <div><p className="text-2xl font-heading font-bold text-primary">{filtered.filter((p) => p.status === "paid").length}</p><p className="text-sm text-muted-foreground">Paiements validés</p></div>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par client…" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors" />
      </div>

      {!paiements ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center"><p className="text-muted-foreground">Aucun paiement enregistré.</p></div>
      ) : (
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3">CLIENT</th>
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3">DATE</th>
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3 hidden sm:table-cell">RÉFÉRENCE</th>
                <th className="text-right text-xs font-semibold tracking-label text-muted-foreground px-5 py-3">MONTANT</th>
                <th className="text-right text-xs font-semibold tracking-label text-muted-foreground px-5 py-3">STATUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => {
                const badge = statusBadge(p.status);
                return (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-primary text-sm">{p.client_name || "—"}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{p.created_date ? new Date(p.created_date).toLocaleDateString("fr-FR") : "—"}</td>
                    <td className="px-5 py-4 hidden sm:table-cell text-xs text-muted-foreground font-mono">{p.stripe_ref || "—"}</td>
                    <td className="px-5 py-4 text-right font-heading font-bold text-primary">{p.amount}€</td>
                    <td className="px-5 py-4 text-right"><span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.cls}`}>{badge.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}