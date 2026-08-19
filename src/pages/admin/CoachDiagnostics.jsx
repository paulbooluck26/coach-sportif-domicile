import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardList, Download, Mail, Home as HomeIcon, Laptop, PhoneCall } from "lucide-react";

const RECO_STYLE = {
  domicile: { label: "Domicile", icon: HomeIcon, color: "bg-secondary/20 text-secondary" },
  programme: { label: "Programme", icon: Laptop, color: "bg-accent/20 text-accent" },
  appel_decouverte: { label: "Appel conseillé", icon: PhoneCall, color: "bg-primary/10 text-primary" },
};

export default function CoachDiagnostics() {
  const [diagnostics, setDiagnostics] = useState(null);
  const [filtreReco, setFiltreReco] = useState("");

  useEffect(() => {
    base44.entities.DiagnosticPhysis.list("-created_date", 500).then(setDiagnostics).catch(() => setDiagnostics([]));
  }, []);

  if (!diagnostics) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const liste = filtreReco ? diagnostics.filter((d) => d.recommandation_finale === filtreReco) : diagnostics;

  const exporterExcel = () => {
    const rows = liste.map((d) => ({
      "Date": new Date(d.created_date).toLocaleDateString("fr-FR"),
      "Prénom": d.prenom || "",
      "Email": d.email || "",
      "Profil": d.profil_attribue || "",
      "Objectif": d.objectif_principal || "",
      "Niveau": d.niveau || "",
      "Frein principal": d.frein_principal || "",
      "Recommandation": RECO_STYLE[d.recommandation_finale]?.label || d.recommandation_finale || "",
      "Score domicile": d.score_domicile,
      "Score programme": d.score_programme,
      "Appel réservé": d.appel_reserve ? "Oui" : "Non",
      "Client converti": d.client_converti ? "Oui" : "Non",
    }));
    const header = Object.keys(rows[0] || {}).join(";");
    const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostics-physis-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = diagnostics.length;
  const parReco = ["domicile", "programme", "appel_decouverte"].map((r) => ({
    key: r,
    count: diagnostics.filter((d) => d.recommandation_finale === r).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Diagnostics Physis</h1>
          <p className="text-sm text-muted-foreground mt-1">Prospects qualifiés depuis le quiz du site — {total} au total.</p>
        </div>
        <button onClick={exporterExcel} disabled={liste.length === 0} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold disabled:opacity-50">
          <Download className="w-4 h-4" /> Exporter en CSV
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltreReco("")} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${!filtreReco ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
          Tous ({total})
        </button>
        {parReco.map(({ key, count }) => (
          <button key={key} onClick={() => setFiltreReco(key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filtreReco === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
            {RECO_STYLE[key].label} ({count})
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ClipboardList className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun diagnostic pour le moment.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Prénom</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Profil</th>
                <th className="px-6 py-4">Recommandation</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {liste.map((d) => {
                const reco = RECO_STYLE[d.recommandation_finale];
                const Icon = reco?.icon;
                return (
                  <tr key={d.id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4 text-foreground whitespace-nowrap">{new Date(d.created_date).toLocaleDateString("fr-FR")}</td>
                    <td className="px-6 py-4 text-foreground font-medium">{d.prenom || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{d.email || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground capitalize">{d.profil_attribue || "—"}</td>
                    <td className="px-6 py-4">
                      {reco && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${reco.color}`}>
                          <Icon className="w-3.5 h-3.5" /> {reco.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {d.email && (
                        <a href={`mailto:${d.email}`} className="text-accent hover:underline text-xs flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Contacter</a>
                      )}
                    </td>
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
