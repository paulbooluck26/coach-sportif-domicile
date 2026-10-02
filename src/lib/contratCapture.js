// Capture de la preuve de commande (cahier des charges §3) — écrite
// directement depuis le frontend, en l'absence de fonction Edge
// modifiable depuis ce dépôt (voir le contexte du plan). Le contrat
// est créé AVANT la redirection Stripe (statut "initiee"), au moment
// exact où le Client valide les deux cases à cocher — c'est cet
// instant, et non la confirmation de paiement, qui est légalement
// déterminant pour la preuve du consentement. Il est ensuite marqué
// "payee" par le Client lui-même à son retour de Stripe.
import { base44 } from "@/api/base44Client";
import { CGV_TEXTE } from "@/lib/cgvTexte";
import { hashTexte } from "@/lib/cgvHash";
import { CGV_VERSION, DELAI_RETRACTATION_JOURS, TEXTE_COMMENCEMENT_IMMEDIAT } from "@/lib/legalConfig";
import { envoyerEmailConfirmationCommande } from "@/lib/emailConfirmationCommande";

export async function creerContratAvantPaiement({
  user,
  adresse,
  produit,
  typeContrat,
  prixDetail,
  cgvAcceptee,
  commencementImmediat,
}) {
  const cgvHash = await hashTexte(CGV_TEXTE);
  const maintenant = new Date().toISOString();

  return base44.entities.Contrat.create({
    client_id: user.id,
    client_nom: user.full_name || "",
    client_email: user.email,
    client_adresse_rue: adresse.rue,
    client_adresse_code_postal: adresse.codePostal,
    client_adresse_ville: adresse.ville,
    client_adresse_pays: adresse.pays || "France",

    produit_id: produit.id,
    produit_sku: produit.sku,
    produit_version: produit.version || 1,
    offre_snapshot: {
      nom: produit.nom,
      description: produit.description,
      prix_ttc: produit.prix_ttc,
      unite_recurrence: produit.unite_recurrence,
      duree_semaines: produit.duree_semaines,
      nb_seances_inclus: produit.nb_seances_inclus,
      metadata: produit.metadata,
    },
    type_contrat: typeContrat,

    cgv_version: CGV_VERSION,
    cgv_hash: cgvHash,
    cgv_acceptee: cgvAcceptee,
    cgv_acceptee_horodatage: cgvAcceptee ? maintenant : null,

    commencement_immediat_demande: commencementImmediat,
    commencement_immediat_texte: commencementImmediat ? TEXTE_COMMENCEMENT_IMMEDIAT : null,
    commencement_immediat_horodatage: commencementImmediat ? maintenant : null,

    prix_detail: prixDetail,
    statut: "initiee",
  });
}

// Idempotent : un client qui revient plusieurs fois sur la page de
// succès (rechargement, retour arrière) ne doit ni renvoyer l'email
// légal en double ni écraser un statut déjà avancé.
export async function marquerContratPaye(contratId, stripeSessionId) {
  if (!contratId) return null;
  const contrat = await base44.entities.Contrat.get(contratId);
  if (!contrat || contrat.statut !== "initiee") return contrat;

  const limite = new Date(Date.now() + DELAI_RETRACTATION_JOURS * 86400000).toISOString();
  const maj = await base44.entities.Contrat.update(contratId, {
    statut: "payee",
    stripe_ref: stripeSessionId,
    date_limite_retractation: limite,
  });
  await envoyerEmailConfirmationCommande(maj);
  return maj;
}

// Adresse postale du dernier contrat du Client, pour pré-remplir le
// formulaire de commande (évite de retaper la même adresse à chaque
// achat). Silencieux en cas d'erreur : le formulaire reste simplement vide.
export async function derniereAdressePostale(userId) {
  try {
    const contrats = await base44.entities.Contrat.filter({ client_id: userId }, "-created_date");
    const c = contrats[0];
    if (!c?.client_adresse_rue) return null;
    return {
      rue: c.client_adresse_rue,
      codePostal: c.client_adresse_code_postal,
      ville: c.client_adresse_ville,
      pays: c.client_adresse_pays || "France",
    };
  } catch {
    return null;
  }
}
