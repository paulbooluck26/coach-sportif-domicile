import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { enregistrerEvenementExecution, TYPES_EVENEMENTS } from "@/lib/executionEvents";
import { CheckCircle2, Plus } from "lucide-react";

// Panneau réutilisable (détail client, écran rétractations) — filet
// de sécurité fiable pour alimenter le journal d'exécution tant que
// les hooks automatiques ne sont pas câblés dans les flux existants
// (réservation de séance, création de programme, etc.). Chaque clic
// crée une ligne horodatée et traçable (cree_par renseigné) — jamais
// un statut modifiable sans laisser de trace.
export default function JournalExecutionContrat({ contratId }) {
  const { user } = useAuth();
  const [evenements, setEvenements] = useState(null);
  const [enCours, setEnCours] = useState(null);

  const charger = () => {
    base44.entities.EvenementExecution.filter({ contrat_id: contratId }, "-date_evenement")
      .then(setEvenements)
      .catch(() => setEvenements([]));
  };
  useEffect(() => { if (contratId) charger(); }, [contratId]);

  const marquer = async (type) => {
    setEnCours(type);
    try {
      await enregistrerEvenementExecution(contratId, type, { creePar: user?.id, description: "Saisi manuellement depuis l'admin" });
      charger();
    } finally {
      setEnCours(null);
    }
  };

  if (!evenements) return <div className="text-xs text-muted-foreground">Chargement du journal...</div>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Journal d'exécution</p>
        {evenements.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun événement enregistré pour ce contrat.</p>
        ) : (
          <ul className="space-y-1.5">
            {evenements.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span>{TYPES_EVENEMENTS.find((t) => t.type === e.type_evenement)?.label || e.type_evenement}</span>
                <span className="text-xs text-muted-foreground">— {new Date(e.date_evenement).toLocaleString("fr-FR")}</span>
              </li>
            ))}
          </ul>
        )}
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
