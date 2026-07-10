// Zones de déplacement pour les séances de coaching à domicile.
// Évolution future possible : ajouter des zones (périphérie, plus loin)
// avec un prix et autoriseReservation, puis affiner determinerZone
// (ex: via géocodage / distance calculée) quand on activera les zones 2 et 3.

export const ZONES = {
  colmar: {
    id: "colmar",
    label: "Colmar intra-muros",
    autoriseReservation: true,
    prix: 70,
  },
  hors_zone: {
    id: "hors_zone",
    label: "Hors Colmar",
    autoriseReservation: false,
    necessiteContact: true,
    message:
      "Votre localisation nécessite une organisation spécifique. Les séances en dehors de Colmar sont possibles, mais nécessitent un échange préalable afin de définir les modalités adaptées (disponibilités, déplacement et éventuels frais supplémentaires).",
  },
  // --- Zones futures (désactivées pour le moment) ---
  // Zone 2 — proche périphérie (0-15 km) : réservation possible, tarif majoré.
  // peripherie: { id: "peripherie", label: "Proche périphérie", autoriseReservation: true, prix: 80 },
  // Zone 3 — plus loin (15-30 km) : contact préalable, tarif personnalisé.
  // eloigne: { id: "eloigne", label: "Plus loin", autoriseReservation: false, necessiteContact: true, prix: null },
};

// Détection simple basée sur la présence de "colmar" dans l'adresse.
// À remplacer par un vrai géocodage / calcul de distance quand les zones 2 et 3 seront activées.
export function determinerZone(adresse) {
  const a = (adresse || "").trim().toLowerCase();
  if (a.includes("colmar")) return ZONES.colmar;
  return ZONES.hors_zone;
}