// Moteur unique de confirmation légale de commande (cahier des
// charges §4) : un seul point de construction du contenu obligatoire
// (art. L.221-5 du Code de la consommation), commun à toutes les
// offres, plutôt qu'un enrichissement séparé de chaque template
// marketing existant (confirmation_reservation, achat_carnet,
// achat_programme...). Contourne délibérément envoyerEmail()/
// EmailTemplate — système à variables libres pensé pour du contenu
// commercial, pas pour un contenu légal figé dont chaque mention est
// imposée par la loi.
import { base44 } from "@/api/base44Client";
import { DELAI_RETRACTATION_JOURS, IDENTITE_PRO, MEDIATEUR } from "@/lib/legalConfig";

function construireContenu(contrat) {
  const sujet = `Confirmation de votre commande — ${contrat.offre_snapshot?.nom || contrat.produit_sku}`;
  const lignes = [
    `${IDENTITE_PRO.nom} — ${IDENTITE_PRO.adresse} — ${IDENTITE_PRO.email} — ${IDENTITE_PRO.telephone}`,
    `Prestation commandée : ${contrat.offre_snapshot?.nom || ""}${contrat.offre_snapshot?.description ? " — " + contrat.offre_snapshot.description : ""}`,
    `Prix total TTC : ${contrat.prix_detail?.total}€ (${contrat.prix_detail?.mention_tva || IDENTITE_PRO.mentionTva})`,
    contrat.prix_detail?.periodicite ? `Périodicité : ${contrat.prix_detail.periodicite}` : "",
    contrat.prix_detail?.duree_engagement_mois
      ? `Engagement : ${contrat.prix_detail.duree_engagement_mois} mois — montant total minimal engagé : ${contrat.prix_detail.montant_total_engagement_minimal}€`
      : "",
    "Modalités de paiement : carte bancaire, traitement sécurisé par Stripe.",
    `Droit de rétractation : vous disposez de ${DELAI_RETRACTATION_JOURS} jours à compter de ce jour pour vous rétracter, sans avoir à justifier de motif. Vous pouvez exercer ce droit depuis votre espace client, rubrique Profil > Droit de rétractation. Le formulaire type de rétractation est disponible au même endroit.`,
    contrat.commencement_immediat_demande
      ? "Vous avez expressément demandé le commencement immédiat de l'exécution de la prestation avant l'expiration du délai de rétractation, et reconnu qu'en cas d'exécution complète de la prestation avant l'expiration de ce délai, vous perdrez votre droit de rétractation."
      : "",
    `CGV acceptées : version ${contrat.cgv_version}, disponibles à tout moment sur physis-coaching.fr/cgv.`,
    MEDIATEUR.nom
      ? `Médiateur de la consommation : ${MEDIATEUR.nom}${MEDIATEUR.adresse ? " — " + MEDIATEUR.adresse : ""}${MEDIATEUR.siteWeb ? " — " + MEDIATEUR.siteWeb : ""}`
      : "Coordonnées du médiateur de la consommation : à venir.",
  ].filter(Boolean);
  return { sujet, texte: lignes.join("\n\n") };
}

// Envoyée systématiquement AVANT tout début d'exécution (appelée
// depuis marquerContratPaye(), avant toute réservation de créneau ou
// premier événement du journal d'exécution) — jamais simplement
// "après paiement réussi" (cahier des charges §4).
export async function envoyerEmailConfirmationCommande(contrat) {
  const { sujet, texte } = construireContenu(contrat);
  let res;
  try {
    res = await base44.integrations.Core.SendEmail({ to: contrat.client_email, subject: sujet, body: texte });
  } catch (e) {
    res = { sent: false, reason: e?.message };
  }
  await base44.entities.Contrat.update(contrat.id, {
    email_confirmation_envoye: !!res?.sent,
    email_confirmation_date: new Date().toISOString(),
    email_confirmation_contenu: texte,
  });
  return res;
}
