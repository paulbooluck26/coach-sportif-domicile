import { CheckCircle2, XCircle, Clock, Ban, Package, Repeat } from "lucide-react";

const STATUT_CFG = {
  actif: { label: "Actif", icon: CheckCircle2, color: "text-secondary", bg: "bg-secondary/10" },
  epuise: { label: "Épuisé", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
  expire: { label: "Expiré", icon: Clock, color: "text-accent", bg: "bg-accent/10" },
  resilie: { label: "Résilié", icon: Ban, color: "text-destructive", bg: "bg-destructive/10" },
};

const STATUT_ORDRE = { actif: 0, epuise: 1, expire: 2, resilie: 3 };

function periodeLabel(periode) {
  if (!periode) return "—";
  const [y, m] = periode.split("-");
  if (!y || !m) return periode;
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

export default function CreditsTab({ credits }) {
  const sorted = [...credits].sort((a, b) => {
    const sa = STATUT_ORDRE[a.statut] ?? 9;
    const sb = STATUT_ORDRE[b.statut] ?? 9;
    if (sa !== sb) return sa - sb;
    return new Date(b.date_achat || 0) - new Date(a.date_achat || 0);
  });

  if (sorted.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Aucun crédit de séances pour ce client.</p>;
  }

  return (
    <div className="space-y-3">
      {sorted.map(c => {
        const cfg = STATUT_CFG[c.statut] || STATUT_CFG.epuise;
        const Icon = cfg.icon;
        const TypeIcon = c.type_carnet === "abonnement" ? Repeat : Package;
        return (
          <div key={c.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-4 h-4 text-secondary shrink-0" />
                  <p className="font-heading font-semibold text-foreground truncate">{c.offre_titre || c.offre_id}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.type_carnet === "abonnement" ? "Abonnement" : "Pack"}
                  {c.type_carnet === "abonnement" && c.periode ? ` · ${periodeLabel(c.periode)}` : ""}
                  {c.date_achat ? ` · Acheté le ${new Date(c.date_achat + "T00:00:00").toLocaleDateString("fr-FR")}` : ""}
                </p>
              </div>
              <span className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${cfg.bg} ${cfg.color}`}>
                <Icon className="w-3.5 h-3.5" /> {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Séances restantes</span>
                  <span className="text-sm font-semibold text-foreground">
                    {c.nb_seances_restantes ?? 0} / {c.nb_seances_total ?? 0}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full"
                    style={{ width: `${c.nb_seances_total ? Math.min(100, ((c.nb_seances_restantes || 0) / c.nb_seances_total) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}