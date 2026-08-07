import { base44 } from "@/api/base44Client";
import { parseDateLocal } from "@/lib/creneaux";
import { envoyerEmail } from "@/lib/emailSender";

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

// Envoie l'email de confirmation (réservation, carnet ou programme) au
// client, via le template configuré dans l'admin (EmailTemplate).
export async function envoyerRecuPaiement({ email, prenom, prestation, date, heure, montant, evenement = "confirmation_reservation" }) {
  if (!email) return;
  const dateStr = date ? parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "";
  await envoyerEmail(evenement, email, {
    client_prenom: prenom || "",
    prestation,
    date: dateStr,
    heure: heure || "",
    montant,
  });
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
  await envoyerRecuPaiement({ email: user.email, prenom: user.full_name?.split(" ")[0] || "", prestation: prestationLabel, date, heure, montant: prix });
  return { seance, paiement };
}

// Finalise un achat de programme : Paiement + ClientProfile + email reçu (+ CommandeProgramme si fourni).
export async function finaliserAchatProgramme({ user, programmeNom, prix, commandePayload }) {
  let commande = null;
  if (commandePayload) {
    commande = await base44.entities.CommandeProgramme.create(commandePayload);
  }
  await base44.entities.Paiement.create({
    commande_id: commande?.id || null,
    client_id: user.id,
    client_name: user.full_name || user.email,
    amount: prix,
    method: "stripe",
    status: "paid",
    stripe_ref: "SIM-" + Date.now(),
    date_paiement: todayStr(),
  });
  await upsertClientProfile(user);
  await envoyerRecuPaiement({ email: user.email, prenom: user.full_name?.split(" ")[0] || "", prestation: programmeNom, montant: prix, evenement: "achat_programme" });
}
