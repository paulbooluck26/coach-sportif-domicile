import { base44 } from "@/api/base44Client";
import { supabase } from "@/api/supabaseClient";
import { envoyerEmail } from "@/lib/emailSender";
import { parseDateLocal, typeLabelSeance as typeLabel } from "@/lib/creneaux";

/**
 * Règles métier :
 * - Annulation ≥ 24h avant : remboursement complet si payée à l'unité,
 *   crédit recrédité si réservée via un carnet.
 * - Annulation < 24h avant : aucun remboursement, aucun crédit rendu.
 * - Report ≥ 24h avant : gratuit, nouveau créneau au choix.
 * - Report < 24h avant : impossible.
 *
 * Le remboursement passe par l'Edge Function "refund-payment", qui
 * déclenche un vrai remboursement Stripe (pas seulement un changement de
 * statut en base).
 */

function heuresAvantSeance(seance) {
  const debut = new Date(`${seance.date}T${seance.time}:00`);
  return (debut.getTime() - Date.now()) / (1000 * 60 * 60);
}

export function peutAnnulerAvecRemboursement(seance) {
  return heuresAvantSeance(seance) >= 24;
}

export function peutDeplacer(seance) {
  return heuresAvantSeance(seance) >= 24;
}

/**
 * Annule une séance. Retourne { remboursement: boolean, credit_rendu: boolean }.
 */
export async function annulerSeance({ seance, user, motif }) {
  const remboursable = peutAnnulerAvecRemboursement(seance);
  let remboursement = false;
  let creditRendu = false;

  await base44.entities.Seance.update(seance.id, { status: "cancelled", motif_annulation: motif || null });

  if (remboursable) {
    // Séance payée à l'unité (liée à un Paiement direct).
    const paiements = await base44.entities.Paiement.filter({ seance_id: seance.id });
    const paiement = paiements.find((p) => p.status === "paid");
    if (paiement) {
      const { error } = await supabase.functions.invoke("refund-payment", { body: { paiement_id: paiement.id } });
      if (!error) remboursement = true;
    }

    // Séance réservée avec un crédit de carnet : on le recrédite.
    if (seance.carnet_id) {
      const carnet = await base44.entities.CarnetSeances.get(seance.carnet_id);
      if (carnet) {
        await base44.entities.CarnetSeances.update(carnet.id, {
          nb_seances_consommees: Math.max(0, (carnet.nb_seances_consommees || 0) - 1),
          nb_seances_restantes: carnet.nb_seances_restantes + 1,
          statut: "actif",
        });
        creditRendu = true;
      }
    }
  }

  const dateStr = parseDateLocal(seance.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  await envoyerEmail("rdv_annule", user.email, {
    client_prenom: user.full_name?.split(" ")[0] || "",
    prestation: typeLabel(seance.session_type),
    date: dateStr,
    heure: seance.time,
  });

  return { remboursement, creditRendu };
}

/**
 * Déplace une séance vers un nouveau créneau (même jour ou un autre).
 */
export async function deplacerSeance({ seance, user, nouvelleDate, nouvelleHeure }) {
  if (!peutDeplacer(seance)) {
    throw new Error("Le report n'est plus possible moins de 24h avant la séance.");
  }
  const ancienneDateStr = parseDateLocal(seance.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const nouvelleDateStr = parseDateLocal(nouvelleDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  await base44.entities.Seance.update(seance.id, {
    date: nouvelleDate,
    time: nouvelleHeure,
    status: "rescheduled",
  });

  await envoyerEmail("rdv_modifie", user.email, {
    client_prenom: user.full_name?.split(" ")[0] || "",
    prestation: typeLabel(seance.session_type),
    ancienne_date: `${ancienneDateStr} à ${seance.time}`,
    nouvelle_date: nouvelleDateStr,
    heure: nouvelleHeure,
  });
}
