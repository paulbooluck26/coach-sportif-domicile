// Source de vérité des offres "Coaching à domicile" — The Lab Forge.
// Prépare la future connexion avec les offres commerciales (catalogue backend).
// Champs `categorie` : "diagnostic" | "accompagnement" | "abonnement" | "secondaire".

export const FORGE_OFFRES = {
  diagnostic: {
    id: "diagnostic",
    titre: "Diagnostic FORGE",
    badge: "RECOMMANDÉ",
    accroche: "Votre première étape vers la transformation.",
    duree: "60 min",
    prix: 79,
    prixLabel: "79€",
    inclus: ["Bilan physique", "Objectifs personnalisés", "Tests mobilité & force", "Plan d'action"],
    cta: "Réserver mon diagnostic",
    categorie: "diagnostic",
  },
  transformation: {
    id: "transformation",
    titre: "Transformation FORGE",
    badge: "LE PLUS CHOISI",
    prix: 740,
    sousTitre: "10 séances · 74€/séance",
    description: "Le format idéal pour progresser et obtenir des résultats visibles.",
    inclus: ["10 séances individuelles", "Programme personnalisé", "Suivi progression"],
    cta: "Commencer ma transformation",
    categorie: "accompagnement",
    dominant: true,
  },
  performance: {
    id: "performance",
    titre: "Performance FORGE",
    prix: 1380,
    sousTitre: "20 séances · 69€/séance",
    description: "Un accompagnement complet pour aller plus loin.",
    inclus: ["20 séances individuelles", "Suivi longue durée", "Priorité réservation"],
    cta: "Choisir Performance",
    categorie: "accompagnement",
  },
  forge4: {
    id: "forge4",
    titre: "FORGE 4",
    prix: 299,
    prixUnite: "/mois",
    sousTitre: "1 séance / semaine",
    inclus: ["4 séances / mois", "Créneau réservé", "Suivi progression"],
    cta: "Choisir FORGE 4",
    categorie: "abonnement",
  },
  forge8: {
    id: "forge8",
    titre: "FORGE 8",
    prix: 579,
    prixUnite: "/mois",
    sousTitre: "2 séances / semaine",
    inclus: ["8 séances / mois", "Progression accélérée", "Priorité planning"],
    cta: "Choisir FORGE 8",
    categorie: "abonnement",
  },
  decouverte: {
    id: "decouverte",
    titre: "Séance découverte",
    duree: "60 min",
    prix: 79,
    prixLabel: "79€",
    accroche: "Une séance ponctuelle pour découvrir la méthode.",
    cta: "Réserver",
    categorie: "secondaire",
  },
};

export const TUNNEL_OFFRES = ["diagnostic", "transformation", "performance", "forge4", "forge8", "decouverte"];

export function prixDisplay(o) {
  if (o.prixUnite) return `${o.prix}€${o.prixUnite}`;
  return o.prixLabel || `${o.prix}€`;
}