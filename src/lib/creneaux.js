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
    return await base44.entities.Seance.filter({ statut: "confirmee" });
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
 * Retourne les créneaux finaux disponibles pour une date :
 * dispo récurrentes - créneaux déjà réservés.
 */
export function creneauxDisponibles(date, recurrentes, reservees) {
  const slots = creneauxPourJour(date, recurrentes);
  const ds = dateStr(date);
  const pris = new Set(
    reservees
      .filter((s) => s.date === ds && s.statut !== "annulee")
      .map((s) => s.heure)
  );
  const now = new Date();
  const isToday = dateStr(now) === ds;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return slots.filter((s) => {
    if (pris.has(s)) return false;
    if (isToday && toMinutes(s) < nowMin) return false;
    return true;
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

export { JOURS, dateStr };