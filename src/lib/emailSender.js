import { base44 } from "@/api/base44Client";

/**
 * Helper central d'envoi d'emails basé sur les templates (entité EmailTemplate).
 *
 * envoyerEmail(evenement, destinataire, variables)
 * - récupère le template actif pour l'événement
 * - remplace les variables {{variable}} dans le sujet et le corps texte
 * - envoie via base44.integrations.Core.SendEmail (users enregistrés uniquement)
 *
 * Évolution future : brancher un vrai service transactionnel (Resend, etc.) ici
 * sans toucher aux appelants.
 */

function interpolate(text, vars) {
  if (!text) return "";
  return text.replace(/{{\s*(\w+)\s*}}/g, (m, key) =>
    vars && vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : m
  );
}

export async function envoyerEmail(evenement, destinataire, variables = {}) {
  if (!destinataire) return { sent: false, reason: "Aucun destinataire" };
  try {
    const templates = await base44.entities.EmailTemplate.filter({ evenement, statut: "actif" });
    const template = templates[0];
    if (!template) return { sent: false, reason: "Aucun template actif pour cet événement" };

    const sujet = interpolate(template.sujet, variables);
    const body = interpolate(template.corps_texte, variables);

    await base44.integrations.Core.SendEmail({ to: destinataire, subject: sujet, body });
    return { sent: true, template, sujet, body };
  } catch (e) {
    return { sent: false, error: e?.message || "Erreur d'envoi" };
  }
}

export async function getTemplateActif(evenement) {
  const templates = await base44.entities.EmailTemplate.filter({ evenement, statut: "actif" });
  return templates[0] || null;
}

export function variablesDisponiblesPour(evenement) {
  const COMMON = ["client_prenom", "client_nom", "client_email"];
  const MAP = {
    bienvenue: [...COMMON, "lien_espace"],
    confirmation_reservation: [...COMMON, "prestation", "date", "heure", "duree", "lieu"],
    rappel_24h: [...COMMON, "prestation", "date", "heure", "lieu"],
    recu_paiement: [...COMMON, "prestation", "date", "heure", "montant"],
    achat_carnet: [...COMMON, "offre", "nb_seances", "montant"],
    achat_programme: [...COMMON, "programme", "duree_semaines", "montant"],
    appel_decouverte: [...COMMON, "date", "heure", "telephone"],
    appel_demarrage: [...COMMON, "programme", "date", "heure", "telephone"],
    programme_disponible: [...COMMON, "programme", "duree_semaines"],
    rdv_modifie: [...COMMON, "prestation", "ancienne_date", "nouvelle_date", "heure"],
    rdv_annule: [...COMMON, "prestation", "date", "heure"],
    bilan_termine: [...COMMON, "programme"],
    etape_forge: [...COMMON, "etape", "offre_suivante"],
  };
  return MAP[evenement] || COMMON;
}