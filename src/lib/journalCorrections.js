// Logique PURE (sans accès base) sur les corrections du journal
// d'exécution — partagée par le panneau admin et le moteur de calcul.
//
// Principe : une entrée annulée n'est jamais supprimée. Une ligne de
// type "correction_evenement" la référence (corrige_evenement_id) et
// porte le motif. L'entrée annulée reste visible dans le journal mais
// est ignorée par toute valorisation.
export const TYPE_CORRECTION = "correction_evenement";

// Événements qui ne représentent pas une prestation fournie au Client :
// ils ne font jamais courir la date de début d'exécution.
export const TYPES_NON_PRESTATION = [TYPE_CORRECTION, "demande_retractation_recue", "remboursement_effectue"];

// Types qui ne peuvent pas être annulés depuis l'écran (événement
// système, ou ligne de correction elle-même).
export const TYPES_NON_ANNULABLES = [TYPE_CORRECTION, "demande_retractation_recue"];

// Associe chaque entrée annulée à sa ligne de correction.
export function correctionsParCible(evenements) {
  const map = new Map();
  evenements.forEach((e) => {
    if (e.type_evenement === TYPE_CORRECTION && e.corrige_evenement_id) map.set(e.corrige_evenement_id, e);
  });
  return map;
}

// Entrées réellement prises en compte : ni annulées, ni lignes de correction.
export function evenementsEffectifs(evenements) {
  const annulees = correctionsParCible(evenements);
  return evenements.filter((e) => e.type_evenement !== TYPE_CORRECTION && !annulees.has(e.id));
}

// Date de début d'exécution déduite des seules entrées effectives de
// type prestation (null s'il n'y en a aucune).
export function debutExecution(evenements) {
  const dates = evenementsEffectifs(evenements)
    .filter((e) => !TYPES_NON_PRESTATION.includes(e.type_evenement))
    .map((e) => new Date(e.date_evenement).getTime());
  return dates.length ? new Date(Math.min(...dates)).toISOString() : null;
}
