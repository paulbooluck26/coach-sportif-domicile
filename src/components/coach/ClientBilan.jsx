import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { SECTIONS, formatBilanValue, STATUS_BILAN } from "@/lib/bilanConfig";

export default function ClientBilan({ user_id }) {
  const [bilan, setBilan] = useState(undefined);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const list = await base44.entities.BilanInitial.filter({ created_by_id: user_id });
        if (active) setBilan(list[0] || null);
      } catch {
        if (active) setBilan(null);
      }
    })();
    return () => { active = false; };
  }, [user_id]);

  if (bilan === undefined) {
    return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!bilan) {
    return <p className="text-muted-foreground text-center py-8">Aucun bilan initial renseigné pour le moment.</p>;
  }

  const cfg = STATUS_BILAN[bilan.statut] || STATUS_BILAN.non_commence;
  const Icon = cfg.icon;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 bg-secondary/10 border border-secondary/20 rounded-lg p-4">
        <Icon className={`w-5 h-5 ${cfg.color}`} />
        <div>
          <p className="font-heading font-semibold text-foreground">Bilan initial — {cfg.label}</p>
          <p className="text-xs text-muted-foreground">
            {bilan.statut === "termine" && bilan.date_remplissage
              ? `Complété le ${new Date(bilan.date_remplissage).toLocaleDateString("fr-FR")}`
              : bilan.statut === "en_cours"
              ? `En cours — étape ${bilan.etape_actuelle || 1} / 7`
              : "À remplir par le client"}
          </p>
        </div>
      </div>

      {SECTIONS.map((sec) => (
        <div key={sec.titre} className="bg-card border border-border rounded-lg p-4">
          <h4 className="font-heading font-semibold text-foreground mb-3 text-sm">{sec.titre}</h4>
          <dl className="space-y-2">
            {sec.fields.map((f) => (
              <div key={f.key} className="grid grid-cols-3 gap-2 text-sm">
                <dt className="text-muted-foreground">{f.label}</dt>
                <dd className="col-span-2 text-foreground whitespace-pre-wrap break-words">{formatBilanValue(f.key, bilan[f.key])}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}