// Constantes légales du parcours de rétractation — textes imposés à
// reproduire verbatim (cahier des charges §2.2, §5.2 ; CGV Article 7).
// Ne jamais reformuler ces textes sans revalidation juridique.

export const IDENTITE_PRO = {
  nom: "Physis Coaching — Paul Booluck",
  forme: "Entrepreneur individuel",
  mentionTva: "TVA non applicable, article 293 B du CGI",
  siret: "985 245 752 00011",
  adresse: "Colmar, Haut-Rhin, France",
  email: "contact@physis-coaching.fr",
  telephone: "06 98 18 14 28",
};

// Aucun médiateur de la consommation référencé CECMC choisi à ce
// jour (CGV Article 13) — à compléter avant mise en production.
export const MEDIATEUR = { nom: null, adresse: null, siteWeb: null };

export const DELAI_RETRACTATION_JOURS = 14;

// Identifiant de version des CGV actuellement en vigueur — à
// incrémenter à chaque publication d'une nouvelle version du texte
// dans src/lib/cgvTexte.js (voir CGV_VERSION utilisée dans le hash
// et figée sur chaque contrat au moment de la commande).
export const CGV_VERSION = "CGV_v1_2026-09-01";
export const CGV_URL = "/cgv";

// Case de commencement immédiat — texte exact imposé par le cahier
// des charges §2.2, applicable à l'ensemble du catalogue (régime
// prestation de services, art. L.221-25 du Code de la consommation).
export const TEXTE_COMMENCEMENT_IMMEDIAT =
  "Je demande expressément à PHYSIS COACHING de commencer l'exécution de la prestation avant l'expiration du délai légal de rétractation de 14 jours. Je reconnais qu'en cas d'exécution complète de la prestation avant l'expiration de ce délai, je perdrai mon droit de rétractation.";

// Case CGV — texte exact imposé (cahier des charges §2.1).
export const TEXTE_CGV = "J'ai lu et j'accepte les Conditions Générales de Vente.";

// Bouton final — texte exact imposé, aucune variante autorisée
// (cahier des charges §2.3 ; CGV Article 7 ; art. L.221-14 C. conso).
export const TEXTE_BOUTON_COMMANDE = "Commander avec obligation de paiement";

// Point d'accès à la rétractation — libellé non ambigu (cahier des
// charges §5.2), distinct du bouton de validation finale.
export const TEXTE_POINT_ACCES_RETRACTATION = "Se rétracter";

// Bouton de validation finale de la déclaration — texte exact
// imposé par le décret d'application (cahier des charges §5.2),
// jamais confondu avec le point d'accès ci-dessus.
export const TEXTE_BOUTON_CONFIRMER_RETRACTATION = "Confirmer la rétractation";

// Formulaire type réglementaire (annexe de l'article L.221-5 du Code
// de la consommation) — à utiliser tel quel, jamais reformulé
// (cahier des charges §6).
export const FORMULAIRE_TYPE_RETRACTATION = `À l'attention de [${IDENTITE_PRO.nom}, ${IDENTITE_PRO.adresse}, ${IDENTITE_PRO.telephone}, ${IDENTITE_PRO.email}] — Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*) / pour la prestation de service (*) ci-dessous : Commandé le (*) / reçu le (*) — Nom du (des) consommateur(s) — Adresse du (des) consommateur(s) — Signature du (des) consommateur(s) (uniquement en cas de notification du présent formulaire sur papier) — Date`;
