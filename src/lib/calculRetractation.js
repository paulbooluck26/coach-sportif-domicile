// Moteur de calcul de la proposition de remboursement en cas de
// rétractation — fonctions PURES, aucune écriture en base, jamais
// appelées en dehors de l'écran admin. Formules reprises telles
// quelles de la grille de valorisation interne (document source),
// fondées sur la valeur du service effectivement fourni (journal
// d'événements d'exécution), jamais sur un prorata de temps écoulé
// (art. L.221-25 du Code de la consommation).
//
// ⚠ À VALIDER JURIDIQUEMENT AVANT PRODUCTION — la grille source
// documente elle-même deux points encore ouverts (méthode Bilan
// Physis, formulation exacte du principe général). Ce module ne
// produit jamais une décision : uniquement une proposition indicative
// que l'admin valide ou corrige, avec motif conservé.

import { evenementsEffectifs, debutExecution, TYPE_CORRECTION } from "@/lib/journalCorrections";

// --- Bilan Physis — calcul par PALIER, pas une somme pondérée
// d'événements indépendants (grille §Bilan Physis).
export function calculerValeurBilan(prixCatalogue, evenements) {
  const a = (t) => evenements.some((e) => e.type_evenement === t);
  const pourcentage = a("bilan_compte_rendu_transmis")
    ? 1.0
    : a("bilan_rdv_realise")
    ? 0.467
    : a("bilan_preparation_faite")
    ? 0.133
    : 0;
  return { montant: +(prixCatalogue * pourcentage).toFixed(2), pourcentage, formule: "palier_bilan" };
}

// --- Pack Intensif — proportionnel aux séances réalisées, déplacement
// inclus dans chaque séance (grille §Pack Intensif).
export function calculerValeurPackIntensif(prixCatalogue, evenements, nbSeancesTotal = 10) {
  const nb = evenements.filter((e) => e.type_evenement === "seance_domicile_realisee").length;
  const ratio = Math.min(nb / nbSeancesTotal, 1);
  return { montant: +(prixCatalogue * ratio).toFixed(2), nbSeancesRealisees: nb, formule: "proportionnel_seances" };
}

// --- Poids exacts de la grille de valorisation V3, par offre
// d'abonnement composite.
export const CONFIG_COMPOSITE = {
  essentiel: { poidsOnboarding: 0.253, poidsSeances: 0.578, seancesMax: 4, poidsSuivi: 0.096, poidsAdaptation: 0.072 },
  performance: { poidsOnboarding: 0.16, poidsSeances: 0.733, seancesMax: 8, poidsSuivi: 0.061, poidsAdaptation: 0.046 },
  hybrid: { poidsOnboarding: 0.297, poidsSeances: 0.432, seancesMax: 4, poidsAutonome: 0.144, autonomeMax: 8, poidsSuivi: 0.072, poidsAdaptation: 0.054 },
  signature: { poidsOnboarding: 0.219, poidsSeances: 0.636, seancesMax: 8, poidsAutonome: 0.053, autonomeMax: 4, poidsSuivi: 0.053, poidsAdaptation: 0.04 },
};

// Valeur d'UN mois d'abonnement composite (Essentiel/Performance/
// Hybrid/Signature) — n'applique la formule qu'aux événements
// effectivement enregistrés ce mois-là.
export function calculerValeurMoisComposite(offreId, prixMensuel, evenementsDuMois) {
  const cfg = CONFIG_COMPOSITE[offreId];
  if (!cfg) return { montant: 0, detail: {} };
  const a = (t) => evenementsDuMois.some((e) => e.type_evenement === t);
  const n = (t) => evenementsDuMois.filter((e) => e.type_evenement === t).length;

  const onboarding = a("onboarding_termine") ? prixMensuel * cfg.poidsOnboarding : 0;
  const seances = prixMensuel * cfg.poidsSeances * Math.min(n("seance_domicile_realisee") / cfg.seancesMax, 1);
  const autonome = cfg.poidsAutonome
    ? prixMensuel * cfg.poidsAutonome * Math.min(n("seance_autonome_suivie") / cfg.autonomeMax, 1)
    : 0;
  const suivi = prixMensuel * cfg.poidsSuivi * Math.min(n("suivi_hebdomadaire_effectue") / 4, 1);
  const adaptation = a("adaptation_programme_effectuee") ? prixMensuel * cfg.poidsAdaptation : 0;

  return {
    montant: +(onboarding + seances + autonome + suivi + adaptation).toFixed(2),
    detail: { onboarding, seances, autonome, suivi, adaptation },
  };
}

// Nombre de mois calendaires entiers écoulés entre deux dates
// (utilisé uniquement pour REGROUPER les événements par mois
// d'exécution — jamais pour calculer un ratio de durée écoulée).
function moisDepuis(dateDebut, dateEvenement) {
  const d0 = new Date(dateDebut);
  const d1 = new Date(dateEvenement);
  return (d1.getFullYear() - d0.getFullYear()) * 12 + (d1.getMonth() - d0.getMonth());
}

// Regroupe les événements par mois calendaire depuis
// date_debut_execution ; applique la formule mensuelle UNIQUEMENT aux
// mois où un événement existe réellement — jamais un ratio
// "mois écoulés / durée d'engagement" (grille §Hybrid, note ⚖).
export function calculerValeurAbonnement(offreId, prixMensuel, dateDebutExecution, tousLesEvenements) {
  if (!dateDebutExecution) return { montant: 0, detailParMois: [] };
  const parMois = {};
  tousLesEvenements.forEach((e) => {
    const idx = moisDepuis(dateDebutExecution, e.date_evenement);
    (parMois[idx] ||= []).push(e);
  });
  const detailParMois = Object.entries(parMois).map(([idx, evs]) => ({
    mois: +idx,
    ...calculerValeurMoisComposite(offreId, prixMensuel, evs),
  }));
  return {
    montant: +detailParMois.reduce((s, m) => s + m.montant, 0).toFixed(2),
    detailParMois,
  };
}

// --- PHYSIS 4/12/24 (programmes en ligne) — poids calculés selon la
// durée (grille §PHYSIS 4/12/24).
export const CONFIG_PROGRAMME_LIGNE = {
  4: { poidsOnboarding: 0.771, poidsSuivi: 0.229 },
  12: { poidsOnboarding: 0.529, poidsSuivi: 0.471 },
  24: { poidsOnboarding: 0.36, poidsSuivi: 0.64 },
};
export function calculerValeurProgrammeLigne(prixCatalogue, dureeSemaines, evenements) {
  const cfg = CONFIG_PROGRAMME_LIGNE[dureeSemaines];
  if (!cfg) return { montant: 0, detail: {} };
  const onboarding = evenements.some((e) => e.type_evenement === "programme_livre") ? prixCatalogue * cfg.poidsOnboarding : 0;
  const semainesSuivi = evenements.filter((e) => e.type_evenement === "suivi_hebdomadaire_effectue").length;
  const suivi = prixCatalogue * cfg.poidsSuivi * Math.min(semainesSuivi / dureeSemaines, 1);
  return { montant: +(onboarding + suivi).toFixed(2), detail: { onboarding, suivi, semainesSuivi } };
}

const SKUS_ABONNEMENT = ["coaching-essentiel", "coaching-performance-abo", "coaching-hybrid", "coaching-signature"];
const SKUS_PROGRAMME = ["programme-forge", "programme-start", "programme-legacy"];

// Point d'entrée UNIQUE utilisé par l'écran admin (étape 6). Ne fait
// JAMAIS de choix définitif — retourne toujours une proposition
// indicative que l'admin valide ou corrige.
export function calculerPropositionRemboursement(contrat, evenementsBruts) {
  // Les entrées annulées par une ligne de correction (et les lignes de
  // correction elles-mêmes) ne sont jamais valorisées.
  const evenements = evenementsEffectifs(evenementsBruts);
  const nbEvenementsAnnules = evenementsBruts.filter((e) => e.type_evenement === TYPE_CORRECTION).length;
  const montantPaye = contrat.prix_detail?.total ?? 0;
  const sku = contrat.produit_sku;
  let resultat;

  if (sku === "coaching-bilan") {
    resultat = calculerValeurBilan(montantPaye, evenements);
  } else if (sku === "coaching-pack-intensif") {
    resultat = calculerValeurPackIntensif(montantPaye, evenements);
  } else if (SKUS_ABONNEMENT.includes(sku)) {
    const offreId = sku.replace("coaching-", "").replace("-abo", "");
    resultat = calculerValeurAbonnement(offreId, montantPaye, contrat.date_debut_execution || debutExecution(evenements), evenements);
  } else if (SKUS_PROGRAMME.includes(sku)) {
    resultat = calculerValeurProgrammeLigne(montantPaye, contrat.offre_snapshot?.duree_semaines, evenements);
  } else {
    resultat = { montant: 0, detail: {} };
  }

  return {
    montantPaye,
    montantConsomme: resultat.montant,
    montantRembourseProposePar: Math.max(0, +(montantPaye - resultat.montant).toFixed(2)),
    detail: resultat,
    nbEvenementsAnnules,
    avertissement:
      "Proposition indicative calculée à partir du journal d'exécution — à valider par un professionnel du droit avant mise en production. Ne constitue jamais une décision automatique.",
  };
}
