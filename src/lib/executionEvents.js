// Journal d'événements d'exécution (cahier des charges §3, §9) —
// chaque événement est horodaté et lié à un contrat, et constitue la
// SEULE source de vérité pour calculer la valeur du service fourni
// en cas de rétractation. Convention applicative stricte : ce
// journal est append-only — aucun code ne doit jamais appeler
// EvenementExecution.update()/.delete(). Un événement enregistré par
// erreur se corrige en ajoutant un événement compensatoire, jamais
// en modifiant/supprimant l'original.
import { base44 } from "@/api/base44Client";

export async function enregistrerEvenementExecution(
  contratId,
  typeEvenement,
  { valeurAssociee, description, detail, creePar } = {}
) {
  const evenement = await base44.entities.EvenementExecution.create({
    contrat_id: contratId,
    type_evenement: typeEvenement,
    date_evenement: new Date().toISOString(),
    valeur_associee: valeurAssociee,
    description,
    detail,
    cree_par: creePar,
  });

  // date_debut_execution est déterminée par le PREMIER événement
  // réellement enregistré — jamais par la date de commande — car
  // c'est ce moment qui fait juridiquement courir l'exécution de la
  // prestation (cahier des charges §3 : "Date de début d'exécution —
  // Moment précis où la prestation commence réellement").
  const contrat = await base44.entities.Contrat.get(contratId);
  if (contrat && !contrat.date_debut_execution) {
    await base44.entities.Contrat.update(contratId, { date_debut_execution: new Date().toISOString() });
  }
  return evenement;
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
