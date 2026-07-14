// Catalogue des offres The Lab Forge — source de vérité unique pour les règles commerciales.
// Modifier ce fichier pour faire évoluer les règles sans toucher au code métier.

export const OFFRES = {
  start: {
    id: "start",
    ordre: 1,
    nom: "START",
    duree_semaines: 4,
    prix: 49,
    credit_vers_suivant: 49,
    activer_credit_vers: "forge", // le crédit START n'est valable que pour FORGE
    type_parcours_defaut: "transformation",
  },
  forge: {
    id: "forge",
    ordre: 2,
    nom: "FORGE",
    duree_semaines: 12,
    prix: 149,
    credit_vers_suivant: 0,
    activer_credit_vers: null,
    type_parcours_defaut: "transformation",
  },
  legacy: {
    id: "legacy",
    ordre: 3,
    nom: "LEGACY",
    duree_semaines: 24,
    prix: 299,
    credit_vers_suivant: 0,
    activer_credit_vers: null,
    type_parcours_defaut: "transformation",
  },
};

// Types de parcours The Lab Forge (extensible).
export const TYPES_PARCOURS = [
  { id: "transformation", label: "Transformation" },
  { id: "performance", label: "Performance" },
  { id: "retour_blessure", label: "Retour après blessure" },
];

// Règle de fin de cycle (lancement simplifié).
// Fin = date_fin_calculee atteinte OU 100% des séances prévues réalisées.
export const REGLE_FIN_CYCLE = {
  activer_seuils_assiduite: false, // placeholder pour activation future
  seuil_termine_pct: 100,           // 100% des séances = terminé (sans attendre la date)
  seuil_interrompu_pct: null,       // inactif au lancement
  seuil_abandon_pct: null,          // inactif au lancement
};

// Crédit de parcours.
export const REGLE_CREDIT = {
  duree_validite_jours: 180, // durée de vie du crédit (configurable)
  applique_si_offre_immédiate: true, // crédit uniquement vers le niveau immédiatement supérieur
};

// Étiquettes de statut de cycle (pour l'affichage "Parcours The Lab Forge").
export const STATUT_CYCLE = {
  en_attente_programme: { label: "En attente de programme", couleur: "muted" },
  a_venir: { label: "À venir", couleur: "accent" },
  en_cours: { label: "En cours", couleur: "secondary" },
  termine: { label: "Terminé", couleur: "secondary" },
  interrompu: { label: "Interrompu", couleur: "muted" },
  abandonne: { label: "Abandonné", couleur: "destructive" },
};

export const STATUT_PAIEMENT = {
  en_attente: "en_attente",
  paye: "paye",
  rembourse: "rembourse",
  echec: "echec",
};

// Helpers
export function getOffre(id) {
  return OFFRES[id] || null;
}

export function offreSuivante(offreId) {
  const o = OFFRES[offreId];
  if (!o) return null;
  const next = Object.values(OFFRES).find((x) => x.ordre === o.ordre + 1);
  return next || null;
}

// Calcule le crédit applicable pour passer de `offreId` vers `versOffreId`.
// Retourne 0 si la règle ne s'applique pas.
export function calculerCredit(offreId, versOffreId) {
  const o = OFFRES[offreId];
  if (!o || !o.activer_credit_vers) return 0;
  if (o.activer_credit_vers !== versOffreId) return 0;
  return o.credit_vers_suivant || 0;
}