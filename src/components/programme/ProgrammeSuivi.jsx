import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { loadClientProjection } from "@/lib/projection";
import { X, Star, Flame, Loader2 } from "lucide-react";

const RESSENTI_LABELS = { facile: "Facile", correct: "Correct", difficile: "Difficile", tres_difficile: "Très difficile" };

function statutCellule(p) {
  if (!p) return { label: "—", classe: "bg-transparent border-transparent text-muted-foreground/30" };
  if (p.deplacee) return { label: "Reportée", classe: "bg-accent/15 text-accent-foreground border-accent/30" };
  if (p.status === "faite") return { label: "Faite", classe: "bg-secondary/15 text-secondary border-secondary/30", clickable: true };
  if (p.status === "manquee") return { label: "À rattraper", classe: "bg-destructive/10 text-destructive border-destructive/30" };
  return { label: "À venir", classe: "bg-muted text-muted-foreground border-border" };
}

export default function ProgrammeSuivi({ programme, onClose }) {
  const [colonnes, setColonnes] = useState(undefined); // [{ seanceId, semaineNumero, titre }]
  const [lignes, setLignes] = useState(undefined); // [{ clientId, clientNom, parSeanceId: { [seanceId]: {...p, executions} } }]
  const [feedbackOuvert, setFeedbackOuvert] = useState(null);

  useEffect(() => {
    const clientIds = programme.client_ids || [];
    if (clientIds.length === 0) { setColonnes([]); setLignes([]); return; }

    (async () => {
      const profils = await base44.entities.ClientProfile.filter({}, "-created_date", 500).catch(() => []);
      const nomParId = {};
      profils.forEach((p) => { nomParId[p.user_id] = p.nom || p.email || "Client"; });

      const parClient = await Promise.all(
        clientIds.map(async (clientId) => {
          const [projections, executions] = await Promise.all([
            loadClientProjection(clientId),
            base44.entities.ExecutionSeance.filter({ client_id: clientId }, "-date_execution", 300).catch(() => []),
          ]);

          const projsProgramme = projections.filter((p) => p.programme.id === programme.id);

          const parSeanceId = {};
          projsProgramme.forEach((p) => {
            const effectiveDate = new Date(p.date + "T00:00:00");
            const execsCorrespondants = executions.filter((e) => {
              if (e.seance_programme_id !== p.seance.id) return false;
              const ed = new Date(e.date_execution + "T00:00:00");
              return ed >= new Date(effectiveDate.getTime() - 7 * 86400000) && ed <= new Date(effectiveDate.getTime() + 3 * 86400000);
            });
            parSeanceId[p.seance.id] = { ...p, executions: execsCorrespondants };
          });

          return {
            clientId,
            clientNom: nomParId[clientId] || "Client",
            parSeanceId,
            projsProgramme,
          };
        })
      );

      // Colonnes = toutes les séances rencontrées chez n'importe quel
      // client, dans l'ordre (semaine, puis ordre d'origine).
      const colMap = new Map();
      parClient.forEach((ligne) => {
        ligne.projsProgramme.forEach((p) => {
          if (!colMap.has(p.seance.id)) {
            colMap.set(p.seance.id, { seanceId: p.seance.id, semaineNumero: p.semaine.numero || 0, titre: p.seance.titre });
          }
        });
      });
      const cols = Array.from(colMap.values()).sort((a, b) => a.semaineNumero - b.semaineNumero);

      setColonnes(cols);
      setLignes(parClient.sort((a, b) => a.clientNom.localeCompare(b.clientNom)));
    })();
  }, [programme.id]);

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl p-6 max-w-6xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-bold text-xl text-foreground">Suivi de progression</h3>
            <p className="text-sm text-muted-foreground">{programme.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {colonnes === undefined ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : colonnes.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Aucune séance programmée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="border-collapse w-full">
              <thead>
                <tr>
                  <th className="text-left pr-4 pb-3 text-sm font-semibold text-foreground sticky left-0 bg-card z-10">Client</th>
                  {colonnes.map((c) => (
                    <th key={c.seanceId} className="px-1.5 pb-3 text-xs text-muted-foreground font-normal whitespace-nowrap">
                      S{c.semaineNumero}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lignes.map((ligne) => (
                  <tr key={ligne.clientId}>
                    <td className="pr-4 py-2 font-medium text-foreground text-sm whitespace-nowrap sticky left-0 bg-card">{ligne.clientNom}</td>
                    {colonnes.map((c) => {
                      const p = ligne.parSeanceId[c.seanceId];
                      const { label, classe, clickable } = statutCellule(p);
                      const nbExec = p?.executions?.length || 0;
                      return (
                        <td key={c.seanceId} className="px-1 py-2">
                          <button
                            onClick={() => clickable && nbExec > 0 && setFeedbackOuvert({ ...p, clientNom: ligne.clientNom })}
                            className={`w-full text-[10px] font-medium border rounded-lg px-1.5 py-2 whitespace-nowrap ${classe} ${clickable && nbExec > 0 ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
                          >
                            {label}{label === "Faite" && nbExec > 1 ? ` (${nbExec}x)` : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {feedbackOuvert && (
        <div className="fixed inset-0 z-[60] bg-primary/40 flex items-center justify-center p-4" onClick={() => setFeedbackOuvert(null)}>
          <div className="bg-card rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-heading font-bold text-lg text-foreground">{feedbackOuvert.seance.titre || "Séance"}</h4>
              <button onClick={() => setFeedbackOuvert(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{feedbackOuvert.clientNom}</p>
            <div className="space-y-3">
              {feedbackOuvert.executions.map((f) => (
                <div key={f.id} className="bg-background border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">{f.date_execution ? new Date(f.date_execution).toLocaleDateString("fr-FR") : "—"}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {f.note_seance > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Note:</span>
                        <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`w-3.5 h-3.5 ${n <= f.note_seance ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />)}</div>
                      </div>
                    )}
                    {f.rpe > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Effort:</span>
                        <div className="flex">{[1, 2, 3, 4, 5].map((n) => <Flame key={n} className={`w-3.5 h-3.5 ${n <= f.rpe ? "fill-destructive text-destructive" : "text-muted-foreground/30"}`} />)}</div>
                      </div>
                    )}
                    {f.ressenti && <span className="text-sm text-foreground/80">{RESSENTI_LABELS[f.ressenti] || f.ressenti}</span>}
                  </div>
                  {f.douleur && <p className="text-sm text-foreground/60 mt-2"><span className="text-muted-foreground">Douleur: </span>{f.douleur}</p>}
                  {f.message_coach && <p className="text-sm text-foreground/60 mt-2 bg-secondary/10 rounded p-2"><span className="text-muted-foreground">Message: </span>{f.message_coach}</p>}
                  {!f.note_seance && !f.rpe && !f.ressenti && !f.douleur && !f.message_coach && (
                    <p className="text-sm text-muted-foreground">Séance faite, sans feedback laissé.</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
