// Logique métier des cycles client The Lab Forge.
// Pure fonctions + helpers de persistance (base44). Ne modifie aucun flux UI directement.

import { base44 } from "@/api/base44Client";
import {
  OFFRES,
  REGLE_FIN_CYCLE,
  REGLE_CREDIT,
  calculerCredit,
  offreSuivante,
  getOffre,
} from "@/lib/offresCatalog";

// ---------- Helpers de date ----------

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addWeeks(date, weeks) {
  return addDays(date, weeks * 7);
}

// ---------- Calculs purs ----------

// Calcule la date de fin d'un cycle à partir d'une date de début et d'une durée (semaines).
export function calculerDateFin(dateDebutISO, dureeSemaines) {
  if (!dateDebutISO || !dureeSemaines) return null;
  const debut = new Date(dateDebutISO + "T00:00:00");
  return toISODate(addWeeks(debut, dureeSemaines));
}

// Calcule la date d'expiration du crédit (depuis la fin réelle d'un cycle).
export function calculerDateExpirationCredit(dateFinReelleISO) {
  if (!dateFinReelleISO) return null;
  const fin = new Date(dateFinReelleISO + "T00:00:00");
  return toISODate(addDays(fin, REGLE_CREDIT.duree_validite_jours));
}

// Taux de réalisation des séances prévues (0-100).
// `seancesFaaites` et `seancesPrevues` sont des nombres.
export function calculerProgressionPct(seancesFaites, seancesPrevues) {
  if (!seancesPrevues || seancesPrevues === 0) return 0;
  return Math.min(100, Math.round((seancesFaites / seancesPrevues) * 100));
}

// Détermine si un cycle doit être marqué terminé.
// Règle (lancement) : date_fin_calculee atteinte OU 100% des séances réalisées.
export function doitTerminerCycle(cycle, seancesFaites, seancesPrevues) {
  if (cycle.statut === "termine" || cycle.statut === "abandonne") return false;
  const today = toISODate(new Date());
  if (cycle.date_fin_calculee && today >= cycle.date_fin_calculee) return true;
  if (REGLE_FIN_CYCLE.seuil_termine_pct === 100) {
    const pct = calculerProgressionPct(seancesFaites, seancesPrevues);
    if (pct >= 100) return true;
  }
  return false;
}

// ---------- Création d'un cycle ----------

// Crée un nouveau CycleClient à partir d'un achat.
// `params` : { client_id, offre, commande_id?, type_parcours?, cycle_precedent_id? }
// Renvoie le cycle créé (sans programme — statut en_attente_programme).
export async function creerCycle(params) {
  const offre = getOffre(params.offre);
  if (!offre) throw new Error(`Offre inconnue : ${params.offre}`);

  // Détermine le numéro et le crédit éventuel venant du cycle précédent.
  let numero = 1;
  let credit = 0;
  let cyclePrecedentId = null;

  if (params.cycle_precedent_id) {
    const precedent = await base44.entities.CycleClient.get(params.cycle_precedent_id);
    if (precedent) {
      numero = (precedent.numero || 1) + 1;
      cyclePrecedentId = precedent.id;
      credit = calculerCredit(precedent.offre, params.offre);
    }
  } else {
    // Sans cycle précédent explicite : on cherche le dernier cycle terminé du client.
    const cycles = await base44.entities.CycleClient.filter({ client_id: params.client_id }, "-numero");
    const dernier = cycles.find((c) => c.statut === "termine");
    if (dernier) {
      numero = (dernier.numero || 1) + 1;
      cyclePrecedentId = dernier.id;
      credit = calculerCredit(dernier.offre, params.offre);
    }
  }

  const prixOffre = offre.prix;
  const montantPaye = Math.max(0, prixOffre - credit);

  const cycle = await base44.entities.CycleClient.create({
    client_id: params.client_id,
    numero,
    offre: params.offre,
    type_parcours: params.type_parcours || offre.type_parcours_defaut,
    commande_id: params.commande_id || null,
    programme_id: null,
    date_debut: null,
    duree_semaines: offre.duree_semaines,
    date_fin_calculee: null,
    date_fin_reelle: null,
    statut: "en_attente_programme",
    prix_offre: prixOffre,
    credit_cycle_precedent: credit,
    montant_paye: montantPaye,
    cycle_precedent_id: cyclePrecedentId,
    credit_eligible: 0,
    offre_suivante_proposee: null,
    date_expiration_credit: null,
    appel_initial_effectue: false,
    date_appel_initial: null,
    appel_bilan_effectue: false,
    date_appel_bilan: null,
  });

  return cycle;
}

// ---------- Assignation du programme (coach a construit) ----------

// Rattache un programme au cycle et passe le statut en a_venir.
// La source principale reste CycleClient.programme_id.
export async function assignerProgramme(cycleId, programmeId, dateDebutISO) {
  const cycle = await base44.entities.CycleClient.get(cycleId);
  if (!cycle) throw new Error("Cycle introuvable");
  const dateDebut = dateDebutISO || toISODate(new Date());
  const dateFin = calculerDateFin(dateDebut, cycle.duree_semaines);
  return base44.entities.CycleClient.update(cycleId, {
    programme_id: programmeId,
    date_debut: dateDebut,
    date_fin_calculee: dateFin,
    statut: "a_venir",
  });
}

// ---------- Démarrage ----------

// Marque le cycle comme en_cours (1ʳᵉ exécution ou date de début atteinte).
export async function demarrerCycle(cycleId) {
  const cycle = await base44.entities.CycleClient.get(cycleId);
  if (!cycle) return null;
  if (cycle.statut === "en_cours") return cycle;
  if (!cycle.date_debut) {
    // Démarrage anticipé : on pose la date de début à aujourd'hui.
    const dateDebut = toISODate(new Date());
    const dateFin = calculerDateFin(dateDebut, cycle.duree_semaines);
    return base44.entities.CycleClient.update(cycleId, {
      statut: "en_cours",
      date_debut: dateDebut,
      date_fin_calculee: dateFin,
    });
  }
  return base44.entities.CycleClient.update(cycleId, { statut: "en_cours" });
}

// ---------- Fin de cycle ----------

// Tente de terminer un cycle selon la règle courante.
// `seancesFaites` / `seancesPrevues` optionnels (passés par l'appelant).
// Renvoie le cycle mis à jour, ou le cycle inchangé si la condition n'est pas remplie.
export async function tenterTerminerCycle(cycleId, seancesFaites = 0, seancesPrevues = 0) {
  const cycle = await base44.entities.CycleClient.get(cycleId);
  if (!cycle) return null;
  if (!doitTerminerCycle(cycle, seancesFaites, seancesPrevues)) return cycle;

  const dateFinReelle = toISODate(new Date());
  const updated = await base44.entities.CycleClient.update(cycleId, {
    statut: "termine",
    date_fin_reelle: dateFinReelle,
  });

  // Proposition de l'offre suivante + crédit (si applicable).
  await proposerOffreSuivante(cycleId);
  return base44.entities.CycleClient.get(cycleId);
}

// ---------- Proposition offre suivante ----------

// Après un cycle terminé, calcule le crédit proposé pour l'offre immédiatement supérieure
// et pose la date d'expiration du crédit.
export async function proposerOffreSuivante(cycleId) {
  const cycle = await base44.entities.CycleClient.get(cycleId);
  if (!cycle || cycle.statut !== "termine") return null;

  const suivante = offreSuivante(cycle.offre);
  if (!suivante) {
    // Dernier niveau : pas de proposition.
    return base44.entities.CycleClient.update(cycleId, {
      offre_suivante_proposee: null,
      credit_eligible: 0,
      date_expiration_credit: null,
    });
  }

  const credit = calculerCredit(cycle.offre, suivante.id);
  const dateFinReelle = cycle.date_fin_reelle || toISODate(new Date());
  const dateExpiration = credit > 0 ? calculerDateExpirationCredit(dateFinReelle) : null;

  return base44.entities.CycleClient.update(cycleId, {
    offre_suivante_proposee: suivante.id,
    credit_eligible: credit,
    date_expiration_credit: dateExpiration,
  });
}

// ---------- Lecture ----------

// Renvoie tous les cycles d'un client, triés par numéro (pour la frise parcours).
export async function chargerParcours(clientId) {
  const cycles = await base44.entities.CycleClient.filter({ client_id: clientId }, "numero");
  return cycles;
}

// Renvoie le cycle actif (en_cours ou a_venir) d'un client, ou null.
export async function cycleActif(clientId) {
  const cycles = await base44.entities.CycleClient.filter({ client_id: clientId }, "-numero");
  return cycles.find((c) => c.statut === "en_cours" || c.statut === "a_venir" || c.statut === "en_attente_programme") || null;
}