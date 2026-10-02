// Journal d'événements d'exécution (cahier des charges §3, §9) —
// chaque événement est horodaté et lié à un contrat, et constitue la
// SEULE source de vérité pour calculer la valeur du service fourni
// en cas de rétractation. Convention applicative stricte : ce
// journal est append-only — aucun code ne doit jamais appeler
// EvenementExecution.update()/.delete(). Un événement enregistré par
// erreur s'ANNULE en ajoutant une ligne de correction explicite
// (annulerEvenementExecution), jamais en modifiant/supprimant l'original.
import { base44 } from "@/api/base44Client";
import {
  TYPE_CORRECTION,
  TYPES_NON_ANNULABLES,
  TYPES_NON_PRESTATION,
  debutExecution,
} from "@/lib/journalCorrections";

export async function enregistrerEvenementExecution(
  contratId,
  typeEvenement,
  { valeurAssociee, description, detail, creePar, dateEvenement, corrigeEvenementId } = {}
) {
  const evenement = await base44.entities.EvenementExecution.create({
    contrat_id: contratId,
    type_evenement: typeEvenement,
    date_evenement: dateEvenement || new Date().toISOString(),
    valeur_associee: valeurAssociee,
    description,
    detail,
    cree_par: creePar,
    ...(corrigeEvenementId ? { corrige_evenement_id: corrigeEvenementId } : {}),
  });

  // date_debut_execution est déterminée par le PREMIER événement de
  // prestation réellement enregistré — jamais par la date de commande —
  // car c'est ce moment qui fait juridiquement courir l'exécution
  // (cahier des charges §3). Les événements qui ne sont pas une
  // prestation (demande de rétractation, remboursement, correction) ne
  // la font pas démarrer.
  if (!TYPES_NON_PRESTATION.includes(typeEvenement)) {
    const contrat = await base44.entities.Contrat.get(contratId);
    if (contrat && !contrat.date_debut_execution) {
      await base44.entities.Contrat.update(contratId, { date_debut_execution: evenement.date_evenement });
    }
  }
  return evenement;
}

// Annule une entrée du journal SANS la supprimer : ajoute une ligne de
// correction (motif obligatoire) qui la référence. Option : enregistrer
// dans la foulée l'entrée correcte (même date que l'originale, car c'est
// le type qui était faux, pas le moment).
export async function annulerEvenementExecution(
  contratId,
  evenement,
  { motif, remplacerPar, creePar } = {}
) {
  if (!motif || !motif.trim()) throw new Error("Un motif est obligatoire pour annuler une entrée du journal.");
  if (TYPES_NON_ANNULABLES.includes(evenement.type_evenement)) {
    throw new Error("Cette entrée ne peut pas être annulée.");
  }

  const correction = await enregistrerEvenementExecution(contratId, TYPE_CORRECTION, {
    description: motif.trim(),
    creePar,
    corrigeEvenementId: evenement.id,
    detail: { type_annule: evenement.type_evenement, date_annulee: evenement.date_evenement },
  });

  let remplacante = null;
  if (remplacerPar) {
    remplacante = await enregistrerEvenementExecution(contratId, remplacerPar, {
      description: `Remplace l'entrée « ${evenement.type_evenement} » annulée : ${motif.trim()}`,
      creePar,
      dateEvenement: evenement.date_evenement,
      detail: { remplace_evenement_id: evenement.id, correction_id: correction.id },
    });
  }

  // La date de début d'exécution du contrat suit les seules entrées
  // effectives : si l'entrée annulée était la première, elle est
  // recalculée (ou remise à vide s'il ne reste aucune prestation).
  const tous = await base44.entities.EvenementExecution.filter({ contrat_id: contratId });
  await base44.entities.Contrat.update(contratId, { date_debut_execution: debutExecution(tous) });

  return { correction, remplacante };
}

// À appeler avant tout nouveau point d'exécution (réservation de
// créneau, livraison de programme, etc.) : dès qu'une demande de
// rétractation est reçue, l'exécution doit être suspendue (cahier
// des charges §5.2), sous réserve des seuls traitements nécessaires
// à la clôture du dossier.
export async function contratSuspendu(contratId) {
  const contrat = await base44.entities.Contrat.get(contratId);
  return contrat?.statut === "retractation_demandee" || contrat?.statut === "retractee";
}

export const TYPES_EVENEMENTS = [
  { type: "onboarding_termine", label: "Onboarding terminé (bilan + programme + mise en place app)" },
  { type: "bilan_preparation_faite", label: "Bilan — préparation faite" },
  { type: "bilan_rdv_realise", label: "Bilan — rendez-vous réalisé" },
  { type: "bilan_compte_rendu_transmis", label: "Bilan — compte-rendu transmis" },
  { type: "programme_cree", label: "Programme créé" },
  { type: "programme_livre", label: "Programme livré" },
  { type: "application_configuree", label: "Application configurée" },
  { type: "seance_domicile_realisee", label: "Séance à domicile réalisée" },
  { type: "seance_autonome_suivie", label: "Séance autonome suivie" },
  { type: "suivi_hebdomadaire_effectue", label: "Suivi hebdomadaire effectué" },
  { type: "adaptation_programme_effectuee", label: "Adaptation du programme effectuée" },
  { type: "demande_retractation_recue", label: "Demande de rétractation reçue" },
  { type: "remboursement_effectue", label: "Remboursement effectué" },
];
