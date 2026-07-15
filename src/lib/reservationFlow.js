import { base44 } from "@/api/base44Client";
import { parseDateLocal } from "@/lib/creneaux";

const todayStr = () => new Date().toISOString().split("T")[0];

// Crée ou met à jour le ClientProfile du user connecté (upsert par user_id).
export async function upsertClientProfile(user, extra = {}) {
  if (!user) return null;
  const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
  if (profiles.length === 0) {
    return await base44.entities.ClientProfile.create({
      user_id: user.id,
      nom: user.full_name || "",
      email: user.email,
      ...extra,
    });
  }
  const existing = profiles[0];
  const update = { ...extra };
  delete update.email;
  const hasChanges = Object.keys(update).some((k) => update[k] && update[k] !== existing[k]);
  if (hasChanges) {
    return await base44.entities.ClientProfile.update(existing.id, update);
  }
  return existing;
}

// Envoie un email de reçu (prestation, date, montant) au client.
export async function envoyerRecuPaiement({ email, prestation, date, heure, montant, isProgramme = false }) {
  if (!email) return;
  const dateStr = date ? parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  const body = isProgramme
    ? `Bonjour,\n\nVotre commande "${prestation}" a bien été validée. Montant payé : ${montant}€.\n\nVotre coach prépare votre programme personnalisé. Vous serez notifié dès qu'il sera disponible dans votre espace.\n\nMerci de votre confiance,\nThe Lab Forge`
    : `Bonjour,\n\nVotre réservation a bien été confirmée.\n\nPrestation : ${prestation}\nDate : ${dateStr}${heure ? ` à ${heure}` : ""}\nMontant payé : ${montant}€\n\nMerci de votre confiance,\nThe Lab Forge`;
  try {
    await base44.integrations.Core.SendEmail({
      to: email,
      subject: "Confirmation de paiement — The Lab Forge",
      body,
    });
  } catch {}
}

// Finalise une réservation de séance payante : Seance + Paiement + ClientProfile + email reçu.
export async function finaliserSeancePayante({ user, sessionType, date, heure, duree, prix, location, prestationLabel }) {
  const seance = await base44.entities.Seance.create({
    client_id: user.id,
    client_name: user.full_name || user.email,
    session_type: sessionType,
    date,
    time: heure,
    duration_minutes: duree,
    price: prix,
    status: "booked",
    location: location || "Domicile",
  });
  const paiement = await base44.entities.Paiement.create({
    seance_id: seance.id,
    client_id: user.id,
    client_name: user.full_name || user.email,
    amount: prix,
    method: "stripe",
    status: "paid",
    stripe_ref: "SIM-" + Date.now(),
    date_paiement: todayStr(),
  });
  await upsertClientProfile(user, location ? { adresse: location } : {});
  await envoyerRecuPaiement({ email: user.email, prestation: prestationLabel, date, heure, montant: prix });
  return { seance, paiement };
}

// Finalise un achat de programme : Paiement + ClientProfile + email reçu (+ CommandeProgramme si fourni).
export async function finaliserAchatProgramme({ user, programmeNom, prix, commandePayload }) {
  if (commandePayload) {
    await base44.entities.CommandeProgramme.create(commandePayload);
  }
  await base44.entities.Paiement.create({
    seance_id: "programme-" + Date.now(),
    client_id: user.id,
    client_name: user.full_name || user.email,
    amount: prix,
    method: "stripe",
    status: "paid",
    stripe_ref: "SIM-" + Date.now(),
    date_paiement: todayStr(),
  });
  await upsertClientProfile(user);
  await envoyerRecuPaiement({ email: user.email, prestation: programmeNom, montant: prix, isProgramme: true });
}