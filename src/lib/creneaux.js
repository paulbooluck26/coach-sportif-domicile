import { base44 } from "@/api/base44Client";

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

const toMinutes = (h) => {
  const [hh, mm] = (h || "0").split(":").map(Number);
  return (hh || 0) * 60 + (mm || 0);
};

const toHHMM = (total) => {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const dateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** Reconstruit une Date locale (minuit) depuis une string "YYYY-MM-DD", sans décalage UTC. */
export const parseDateLocal = (str) => {
  const [y, m, d] = (str || "").split("-").map(Number);
  return new Date(y || 1970, (m || 1) - 1, d || 1);
};

/**
 * Récupère toutes les disponibilités (récurrentes + blocages).
 */
export async function fetchDisponibilites() {
  try {
    return await base44.entities.Disponibilite.list();
  } catch {
    return [];
  }
}

/**
 * Récupère les séances déjà réservées pour vérifier les conflits.
 */
export async function fetchSeancesReservees() {
  try {
    return await base44.entities.Seance.filter({ status: "booked" });
  } catch {
    return [];
  }
}

/**
 * Détermine si une date (objet Date) est bloquée par un blocage ponctuel.
 */
export function dateBloquee(date, blocages) {
  const ds = dateStr(date);
  return blocages.some((b) => {
    if (!b.date_debut) return false;
    if (b.date_fin) {
      return ds >= b.date_debut && ds <= b.date_fin;
    }
    return ds === b.date_debut;
  });
}

/**
 * Calcule les créneaux disponibles pour un jour donné à partir des dispo récurrentes.
 * Retourne une liste de strings "HH:MM".
 */
export function creneauxPourJour(date, recurrentes) {
  const jourIndex = date.getDay();
  const plages = recurrentes.filter((d) => d.jour_semaine === jourIndex);
  if (plages.length === 0) return [];

  const slots = [];
  plages.forEach((p) => {
    const debut = toMinutes(p.heure_debut);
    const fin = toMinutes(p.heure_fin);
    for (let t = debut; t < fin; t += 60) {
      slots.push(toHHMM(t));
    }
  });
  return slots.sort();
}

/**
 * Battement obligatoire entre deux séances (temps de trajet/préparation
 * du coach entre deux domiciles). Modifiable ici si besoin plus tard.
 */
const BUFFER_MIN = 30;

/**
 * Retourne les créneaux finaux disponibles pour une date :
 * dispo récurrentes - créneaux déjà réservés - créneaux trop proches
 * d'une séance existante (moins de BUFFER_MIN minutes d'écart).
 */
export function creneauxDisponibles(date, recurrentes, reservees, dureeMinutes = 60) {
  const slots = creneauxPourJour(date, recurrentes);
  const ds = dateStr(date);
  const now = new Date();
  const isToday = dateStr(now) === ds;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Fenêtres occupées ce jour-là (avec leur propre durée), pour vérifier
  // le battement — pas seulement l'égalité stricte de l'heure de début.
  const occupees = reservees
    .filter((s) => s.date === ds && s.status !== "cancelled")
    .map((s) => {
      const start = toMinutes(s.time);
      const duree = s.duration_minutes || 60;
      return { start, end: start + duree };
    });

  return slots.filter((s) => {
    const start = toMinutes(s);
    const end = start + dureeMinutes;
    if (isToday && start < nowMin) return false;

    // Un créneau candidat est refusé s'il chevauche une séance existante,
    // OU si l'écart avec elle est inférieur au battement requis, dans
    // un sens comme dans l'autre.
    const conflit = occupees.some((o) => {
      const finAvantDebutOK = end + BUFFER_MIN <= o.start;
      const debutApresFinOK = o.end + BUFFER_MIN <= start;
      return !(finAvantDebutOK || debutApresFinOK);
    });
    return !conflit;
  });
}

/**
 * Vérifie si une date est sélectionnable : dans le futur, non bloquée, et
 * a au moins un créneau disponible.
 */
export function dateSelectable(date, recurrentes, blocages, reservees) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d < today) return false;
  if (dateBloquee(d, blocages)) return false;
  return creneauxDisponibles(d, recurrentes, reservees).length > 0;
}

// Traduction du type de séance en libellé lisible — une seule version
// partagée par toute l'app (client, admin), pour éviter les oublis quand
// un nouveau type est ajouté (ex: appel_bilan).
export function typeLabelSeance(t) {
  return {
    seance_individuelle: "Séance individuelle",
    programme_personnalise: "Programme personnalisé",
    evaluation: "Diagnostic FORGE",
    bilan_initial: "Bilan initial",
    appel_bilan: "Appel de bilan",
  }[t] || "Séance";
}

export { JOURS, dateStr };
