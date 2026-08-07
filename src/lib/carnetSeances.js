import { base44 } from "@/api/base44Client";
import { FORGE_OFFRES } from "@/lib/forgeOffres";
import { upsertClientProfile, envoyerRecuPaiement } from "@/lib/reservationFlow";

const todayStr = () => new Date().toISOString().split("T")[0];

export const OFFRES_PONCTUELLES = ["diagnostic", "decouverte"];
export const OFFRES_PACK = ["transformation", "performance"];
export const OFFRES_ABONNEMENT = ["forge4", "forge8"];

export const estPonctuel = (id) => OFFRES_PONCTUELLES.includes(id);
export const estPack = (id) => OFFRES_PACK.includes(id);
export const estAbonnement = (id) => OFFRES_ABONNEMENT.includes(id);

export function nbSeancesPourOffre(offreId) {
  return { transformation: 10, performance: 20, forge4: 4, forge8: 8 }[offreId] || 1;
}

function periodeCourante() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function finDeMois() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
}

// Achat d'un pack ou abonnement : crée un CarnetSeances + paiement + reçu.
// Aucune séance n'est réservée à ce moment — le client puisera dans son crédit.
export async function acheterCarnet({ user, offreId }) {
  const o = FORGE_OFFRES[offreId];
  const type = estAbonnement(offreId) ? "abonnement" : "pack";
  const total = nbSeancesPourOffre(offreId);
  const carnet = await base44.entities.CarnetSeances.create({
    client_id: user.id,
    offre_id: offreId,
    offre_titre: o.titre,
    type_carnet: type,
    nb_seances_total: total,
    nb_seances_consommees: 0,
    nb_seances_restantes: total,
    prix: o.prix,
    date_achat: todayStr(),
    statut: "actif",
    periode: estAbonnement(offreId) ? periodeCourante() : null,
    date_fin: estAbonnement(offreId) ? finDeMois() : null,
  });
  await base44.entities.Paiement.create({
    carnet_id: carnet.id,
    client_id: user.id,
    client_name: user.full_name || user.email,
    amount: o.prix,
    method: "stripe",
    status: "paid",
    stripe_ref: "SIM-" + Date.now(),
    date_paiement: todayStr(),
  });
  await upsertClientProfile(user);
  await envoyerRecuPaiement({ email: user.email, prenom: user.full_name?.split(" ")[0] || "", prestation: o.titre, montant: o.prix, evenement: "achat_carnet" });
  return carnet;
}

// Réserve une séance en consommant un crédit d'un carnet actif (sans paiement).
export async function reserverSeanceAvecCredit({ user, carnetId, date, heure, location }) {
  const carnet = await base44.entities.CarnetSeances.get(carnetId);
  if (!carnet || carnet.nb_seances_restantes <= 0) throw new Error("Aucun crédit disponible");
  const seance = await base44.entities.Seance.create({
    client_id: user.id,
    client_name: user.full_name || user.email,
    session_type: "seance_individuelle",
    date,
    time: heure,
    duration_minutes: 60,
    price: 0,
    status: "booked",
    location: location || "Domicile",
  });
  const consommees = (carnet.nb_seances_consommees || 0) + 1;
  const restantes = Math.max(0, carnet.nb_seances_restantes - 1);
  await base44.entities.CarnetSeances.update(carnet.id, {
    nb_seances_consommees: consommees,
    nb_seances_restantes: restantes,
    statut: restantes === 0 ? "epuise" : carnet.statut,
  });
  await upsertClientProfile(user, location ? { adresse: location } : {});
  return { seance, carnet };
}

// Carnets actifs avec crédit restant (source du solde affiché au client).
export async function listerCarnetsActifs(clientId) {
  const all = await base44.entities.CarnetSeances.filter({ client_id: clientId });
  return all.filter((c) => c.statut === "actif" && c.nb_seances_restantes > 0);
}

// Renouvellement mensuel des abonnements : si un abonnement actif a une période
// dépassée et qu'aucun carnet n'existe pour le mois courant, on crée le nouveau
// crédit mensuel et on expire les anciens. (Renouvellement de crédit — la facturation
// récurrente Stripe restera à brancher côté backend.)
export async function renouvelerAbonnementsSiBesoin(clientId) {
  const all = await base44.entities.CarnetSeances.filter({ client_id: clientId });
  const abonnementsActifs = all.filter((c) => c.type_carnet === "abonnement" && c.statut === "actif");
  if (abonnementsActifs.length === 0) return;
  const courant = periodeCourante();
  const aCourant = all.some((c) => c.periode === courant && c.type_carnet === "abonnement");
  if (aCourant) return;
  const modele = abonnementsActifs[0];
  for (const ancien of abonnementsActifs) {
    await base44.entities.CarnetSeances.update(ancien.id, { statut: "expire" });
  }
  await base44.entities.CarnetSeances.create({
    client_id: clientId,
    offre_id: modele.offre_id,
    offre_titre: modele.offre_titre,
    type_carnet: "abonnement",
    nb_seances_total: modele.nb_seances_total,
    nb_seances_consommees: 0,
    nb_seances_restantes: modele.nb_seances_total,
    prix: modele.prix,
    date_achat: todayStr(),
    statut: "actif",
    periode: courant,
    date_fin: finDeMois(),
  });
}
