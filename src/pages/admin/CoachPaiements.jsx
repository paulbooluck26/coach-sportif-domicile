import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CreditCard, TrendingUp, Filter, Search, Download } from "lucide-react";
import * as XLSX from "xlsx";

const STATUTS = {
  paid: { label: "Payé", cls: "bg-accent/15 text-accent" },
  refunded: { label: "Remboursé", cls: "bg-destructive/10 text-destructive" },
  pending: { label: "En attente", cls: "bg-secondary text-muted-foreground" },
  failed: { label: "Échoué", cls: "bg-destructive/10 text-destructive" },
};

export default function CoachPaiements() {
  const [paiements, setPaiements] = useState(null);
  const [statutFiltre, setStatutFiltre] = useState("all");
  const [recherche, setRecherche] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const load = async () => {
    const data = await base44.entities.Paiement.list("-date_paiement", 500);
    setPaiements(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  if (!paiements) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const total = paiements.filter(p => p.status === "paid").reduce((s, p) => s + (p.amount || 0), 0);
  const rembourses = paiements.filter(p => p.status === "refunded").reduce((s, p) => s + (p.amount || 0), 0);
  const net = total - rembourses;

  const filtered = paiements.filter(p => {
    if (statutFiltre !== "all" && p.status !== statutFiltre) return false;
    if (dateDebut && (!p.date_paiement || p.date_paiement < dateDebut)) return false;
    if (dateFin && (!p.date_paiement || p.date_paiement > dateFin)) return false;
    if (recherche.trim()) {
      const q = recherche.toLowerCase();
      const matchClient = (p.client_name || "").toLowerCase().includes(q);
      const matchProduit = (p.libelle || "").toLowerCase().includes(q);
      if (!matchClient && !matchProduit) return false;
    }
    return true;
  });

  const resetFiltres = () => { setStatutFiltre("all"); setRecherche(""); setDateDebut(""); setDateFin(""); };

  const exporterExcel = () => {
    const rows = filtered.map(p => ({
      "Date": p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR") : "",
      "Client": p.client_name || "",
      "Produit": p.libelle || "",
      "Montant (€)": p.amount || 0,
      "Méthode": p.method || "carte",
      "Statut": STATUTS[p.status]?.label || p.status || "",
      "Référence": p.stripe_ref || "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [{ wch: 12 }, { wch: 22 }, { wch: 26 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Paiements");
    const dateLabel = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `paiements-physis-coaching-${dateLabel}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Paiements</h1>
        </div>
        <button onClick={exporterExcel} disabled={filtered.length === 0} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50">
          <Download className="w-4 h-4" /> Exporter en Excel
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6"><TrendingUp className="w-5 h-5 text-accent mb-3" /><p className="font-heading text-2xl font-bold text-foreground">{total}€</p><p className="text-sm text-muted-foreground">Encaissé</p></div>
        <div className="bg-card border border-border rounded-lg p-6"><CreditCard className="w-5 h-5 text-destructive mb-3" /><p className="font-heading text-2xl font-bold text-foreground">{rembourses}€</p><p className="text-sm text-muted-foreground">Remboursé</p></div>
        <div className="bg-primary text-primary-foreground rounded-lg p-6"><TrendingUp className="w-5 h-5 text-accent mb-3" /><p className="font-heading text-2xl font-bold">{net}€</p><p className="text-sm text-primary-foreground/70">Net encaissé</p></div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1">Client ou produit</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={recherche} onChange={e => setRecherche(e.target.value)} placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-border bg-background focus:outline-none focus:border-accent" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Statut</label>
          <select value={statutFiltre} onChange={e => setStatutFiltre(e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent">
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Du</label>
          <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Au</label>
          <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:border-accent" />
        </div>
        {(statutFiltre !== "all" || recherche || dateDebut || dateFin) && (
          <button onClick={resetFiltres} className="text-sm text-accent hover:underline px-2 py-2">Réinitialiser</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <CreditCard className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">{paiements.length === 0 ? "Aucun paiement enregistré." : "Aucun paiement ne correspond à ces filtres."}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Produit</th>
                <th className="px-6 py-4">Montant</th>
                <th className="px-6 py-4">Méthode</th>
                <th className="px-6 py-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 text-foreground whitespace-nowrap">{p.date_paiement ? new Date(p.date_paiement).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—"}</td>
                  <td className="px-6 py-4 text-foreground font-medium">{p.client_name || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{p.libelle || "—"}</td>
                  <td className="px-6 py-4 font-heading font-semibold text-foreground whitespace-nowrap">{p.amount}€</td>
                  <td className="px-6 py-4 text-muted-foreground capitalize">{p.method || "carte"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUTS[p.status]?.cls || "bg-secondary text-muted-foreground"}`}>{STATUTS[p.status]?.label || p.status}</span>
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
