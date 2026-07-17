// Référentiel partagé pour la bibliothèque des mouvements.
// Centralise les listes contrôlées et libellés afin de garantir des filtres propres
// et d'éviter la duplication des constantes entre le back-office et l'espace client.

export const MOUV_CATEG = {
  push: "Push",
  jambes: "Jambes",
  tirage: "Tirage",
  gainage: "Gainage",
  dos: "Dos",
  epaules: "Épaules",
  cardio: "Cardio",
  mobilite: "Mobilité",
  autre: "Autre",
};

export const NIVEAU = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export const TYPES_MOUVEMENT = {
  polyarticulaire: "Polyarticulaire",
  isolation: "Isolation",
  gainage: "Gainage",
  plyometrie: "Plyométrie",
  mobilite: "Mobilité",
  cardio: "Cardio",
  halterophilie: "Haltérophilie",
  autre: "Autre",
};

// Listes contrôlées proposées en autocomplétion (datalist) dans l'éditeur.
// L'utilisateur peut compléter la liste, mais les valeurs suggérées assurent
// la cohérence des filtres côté client.
export const MATERIEL_REF = [
  "Haltères",
  "Barre",
  "Kettlebell",
  "Élastique",
  "Poids du corps",
  "Médicine ball",
  "Bande de suspension",
  "Banc",
  "Barre de traction",
  "Box",
  "Step",
  "Tapis",
  "Sangle",
  "Aucun",
];

export const MUSCLES_REF = [
  "Quadriceps",
  "Ischio-jambiers",
  "Fessiers",
  "Mollets",
  "Adducteurs",
  "Abducteurs",
  "Pectoraux",
  "Grand dorsal",
  "Trapèzes",
  "Deltoïdes",
  "Biceps",
  "Triceps",
  "Avant-bras",
  "Abdominaux",
  "Lombaires",
  "Obliques",
  "Grand dentelé",
];