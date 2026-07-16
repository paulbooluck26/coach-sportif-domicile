import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Clock, Circle } from "lucide-react";

function weekStatus(semId, projections) {
  const projs = projections.filter(p => p.semaine?.id === semId);
  if (projs.length === 0) return "todo";
  const faites = projs.filter(p => p.status === "faite").length;
  if (faites === projs.length) return "done";
  if (faites > 0) return "progress";
  return "todo";
}
function phaseStatus(weeks, projections) {
  const statuses = weeks.map(w => weekStatus(w.id, projections));
  if (statuses.length === 0) return "todo";
  if (statuses.every(s => s === "done")) return "done";
  if (statuses.some(s => s === "done" || s === "progress")) return "progress";
  return "todo";
}
const ICONS = {
  done: { icon: CheckCircle2, color: "text-secondary" },
  progress: { icon: Clock, color: "text-accent" },
  todo: { icon: Circle, color: "text-muted-foreground/40" },
};

export default function PhaseProgression({ programmeId, projections = [] }) {
  const [phases, setPhases] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [phs, sems] = await Promise.all([
          base44.entities.Phase.filter({ programme_id: programmeId }, "ordre"),
          base44.entities.Semaine.filter({ programme_id: programmeId }, "numero"),
        ]);
        // Sans phase persistée (programme non migré), on regroupe sous une phase virtuelle
        const orphans = sems.filter(s => !s.phase_id);
        let finalPhases = phs;
        if (orphans.length && !phs.length) finalPhases = [{ id: "__main", nom: "Phase principale", ordre: 0, couleur: "" }];
        const weeksByPhase = {};
        sems.forEach(s => {
          const key = s.phase_id || (finalPhases[0]?.id) || "__main";
          (weeksByPhase[key] = weeksByPhase[key] || []).push(s);
        });
        setPhases(finalPhases.map(p => ({ ...p, weeks: (weeksByPhase[p.id] || []).sort((a, b) => (a.numero || 0) - (b.numero || 0)) })));
      } catch { setPhases([]); }
    })();
  }, [programmeId, projections]);

  if (!phases) return <div className="flex justify-center py-8"><div className="w-7 h-7 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  if (phases.length === 0) return <p className="text-sm text-muted-foreground">Aucune phase définie pour ce programme.</p>;

  return (
    <div className="bg-card border border-border rounded-lg p-5 space-y-4">
      {phases.map((p, i) => {
        const pst = phaseStatus(p.weeks, projections);
        const PIcon = ICONS[pst].icon;
        return (
          <div key={p.id} className={i > 0 ? "pt-4 border-t border-border" : ""}>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.couleur || "#6b7a4f" }} />
              <PIcon className={`w-5 h-5 ${ICONS[pst].color}`} />
              <p className="font-heading font-semibold text-foreground">Phase {i + 1} — {p.nom}</p>
              <span className="text-xs text-muted-foreground ml-auto">{p.weeks.length} semaine{p.weeks.length > 1 ? "s" : ""}</span>
            </div>
            {p.description && <p className="text-xs text-muted-foreground mb-2 ml-9">{p.description}</p>}
            <div className="ml-9 space-y-1.5">
              {p.weeks.length === 0 && <p className="text-xs text-muted-foreground italic">Aucune semaine</p>}
              {p.weeks.map(w => {
                const wst = weekStatus(w.id, projections);
                const WIcon = ICONS[wst].icon;
                return (
                  <div key={w.id} className="flex items-center gap-2.5">
                    <WIcon className={`w-4 h-4 ${ICONS[wst].color}`} />
                    <p className="text-sm text-foreground">Semaine {w.numero}{w.titre ? ` — ${w.titre}` : ""}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}