import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { enregistrerEvenementExecution, annulerEvenementExecution, TYPES_EVENEMENTS } from "@/lib/executionEvents";
import { correctionsParCible, TYPES_NON_ANNULABLES, TYPE_CORRECTION } from "@/lib/journalCorrections";
import { CheckCircle2, Plus, Undo2 } from "lucide-react";

const libelle = (type) => TYPES_EVENEMENTS.find((t) => t.type === type)?.label || type;

// Panneau réutilisable (détail client, écran rétractations) — filet
// de sécurité fiable pour alimenter le journal d'exécution tant que
// les hooks automatiques ne sont pas câblés dans les flux existants.
// Le journal est append-only : une erreur de saisie ne se supprime
// pas, elle s'ANNULE (ligne de correction horodatée avec motif) et
// peut être remplacée par l'entrée correcte. onChange est appelé
// après chaque modification pour que l'écran parent recalcule.
export default function JournalExecutionContrat({ contratId, onChange }) {
  const { user } = useAuth();
  const [evenements, setEvenements] = useState(null);
  const [enCours, setEnCours] = useState(null);
  const [annulation, setAnnulation] = useState(null); // { evenement, motif, remplacerPar }
  const [erreur, setErreur] = useState("");

  const charger = () =>
    base44.entities.EvenementExecution.filter({ contrat_id: contratId }, "-date_evenement")
      .then(setEvenements)
      .catch(() => setEvenements([]));
  useEffect(() => { if (contratId) charger(); }, [contratId]);

  const apresModification = async () => {
    await charger();
    onChange?.();
  };

  const marquer = async (type) => {
    setEnCours(type);
    setErreur("");
    try {
      await enregistrerEvenementExecution(contratId, type, { creePar: user?.id, description: "Saisi manuellement depuis l'admin" });
      await apresModification();
    } catch (e) {
      setErreur(e.message);
    } finally {
      setEnCours(null);
    }
  };

  const confirmerAnnulation = async () => {
    setEnCours("annulation");
    setErreur("");
    try {
      await annulerEvenementExecution(contratId, annulation.evenement, {
        motif: annulation.motif,
        remplacerPar: annulation.remplacerPar || undefined,
        creePar: user?.id,
      });
      setAnnulation(null);
      await apresModification();
    } catch (e) {
      setErreur(
        /constraint|corrige_evenement_id|schema cache|column/i.test(e.message)
          ? `${e.message} — la migration 002_journal_corrections.sql a-t-elle été exécutée sur Supabase ?`
          : e.message
      );
    } finally {
      setEnCours(null);
    }
  };

  if (!evenements) return <div className="text-xs text-muted-foreground">Chargement du journal...</div>;

  const corrections = correctionsParCible(evenements);
  const entrees = evenements.filter((e) => e.type_evenement !== TYPE_CORRECTION);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Journal d'exécution {entrees.length > 0 && <span className="normal-case font-normal">— {entrees.length} entrée{entrees.length > 1 ? "s" : ""}{corrections.size > 0 ? `, dont ${corrections.size} annulée${corrections.size > 1 ? "s" : ""}` : ""}</span>}
        </p>
        {entrees.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun événement enregistré pour ce contrat.</p>
        ) : (
          <ul className="space-y-2">
            {entrees.map((e) => {
              const correction = corrections.get(e.id);
              const annulable = !correction && !TYPES_NON_ANNULABLES.includes(e.type_evenement);
              const ouvert = annulation?.evenement.id === e.id;
              return (
                <li key={e.id} className="text-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${correction ? "text-muted-foreground" : "text-accent"}`} />
                    <span className={correction ? "line-through text-muted-foreground" : "text-foreground"}>{libelle(e.type_evenement)}</span>
                    <span className="text-xs text-muted-foreground">— {new Date(e.date_evenement).toLocaleString("fr-FR")}</span>
                    {annulable && !ouvert && (
                      <button
                        onClick={() => { setErreur(""); setAnnulation({ evenement: e, motif: "", remplacerPar: "" }); }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive underline"
                      >
                        <Undo2 className="w-3 h-3" /> Annuler / corriger
                      </button>
                    )}
                  </div>
                  {correction && (
                    <p className="ml-5 text-xs text-destructive/80">
                      Annulée le {new Date(correction.date_evenement).toLocaleString("fr-FR")} — motif : {correction.description}
                    </p>
                  )}
                  {ouvert && (
                    <div className="ml-5 mt-2 border border-border rounded-lg p-3 space-y-2 bg-secondary/10">
                      <p className="text-xs text-muted-foreground">L'entrée n'est pas supprimée : une ligne de correction horodatée, avec votre motif, est ajoutée au journal. Cette entrée ne sera plus valorisée.</p>
                      <textarea
                        value={annulation.motif}
                        onChange={(ev) => setAnnulation({ ...annulation, motif: ev.target.value })}
                        rows={2}
                        placeholder="Motif de l'annulation (obligatoire)"
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent resize-none"
                      />
                      <select
                        value={annulation.remplacerPar}
                        onChange={(ev) => setAnnulation({ ...annulation, remplacerPar: ev.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent"
                      >
                        <option value="">Ne pas la remplacer</option>
                        {TYPES_EVENEMENTS.filter((t) => t.type !== e.type_evenement && !TYPES_NON_ANNULABLES.includes(t.type)).map((t) => (
                          <option key={t.type} value={t.type}>Remplacer par : {t.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={confirmerAnnulation}
                          disabled={enCours === "annulation" || !annulation.motif.trim()}
                          className="bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-xs font-semibold disabled:opacity-50"
                        >
                          {enCours === "annulation" ? "Enregistrement..." : "Confirmer l'annulation"}
                        </button>
                        <button onClick={() => setAnnulation(null)} className="border border-border text-foreground px-3 py-1.5 rounded-md text-xs font-medium">Fermer</button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {erreur && <p className="text-xs text-destructive mt-2">{erreur}</p>}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Marquer un événement</p>
        <div className="flex flex-wrap gap-2">
          {TYPES_EVENEMENTS.map((t) => (
            <button
              key={t.type}
              onClick={() => marquer(t.type)}
              disabled={enCours === t.type}
              className="inline-flex items-center gap-1.5 border border-border text-foreground px-3 py-1.5 rounded-full text-xs font-medium hover:border-accent transition-colors disabled:opacity-50"
            >
              <Plus className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
