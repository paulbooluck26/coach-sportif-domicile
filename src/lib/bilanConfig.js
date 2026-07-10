import { CheckCircle2, Clock, Circle } from "lucide-react";

// Configuration partagée du Bilan initial (questionnaire + affichage admin/client)

export const STEPS = [
  { titre: "Informations personnelles" },
  { titre: "Santé et historique" },
  { titre: "Mode de vie" },
  { titre: "Nutrition" },
  { titre: "Expérience sportive" },
  { titre: "Objectifs et disponibilité" },
  { titre: "Attentes" },
];

export const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export const emptyBilan = {
  prenom: "", nom: "", date_naissance: "", sexe: "", telephone: "", adresse: "", taille_cm: "", poids_kg: "",
  antecedents_medicaux: "", blessures: "", douleurs: "", causes_douleurs: "", operations_restrictions: "", confirmation_exactitude: false,
  metier: "", activite_quotidienne: "", heures_sommeil: "", qualite_sommeil: "", niveau_stress: "",
  alimentation_actuelle: "", regime_particulier: "", objectif_nutritionnel: "", calories_journalieres: "",
  activite_sportive_reguliere: "", activites_pratiquees: "", duree_pratique: "", seances_par_semaine: "", duree_seance: "", intensite_habituelle: "",
  objectifs_principaux: "", pourquoi_accompagnement: "", resultats_souhaites: "", seances_souhaitees_par_semaine: "", jours_disponibles: [], horaires_disponibles: "",
  attentes_accompagnement: "", critere_reussite: "",
};

export const STATUS_BILAN = {
  non_commence: { label: "Non commencé", icon: Circle, color: "text-muted-foreground" },
  en_cours: { label: "En cours", icon: Clock, color: "text-accent" },
  termine: { label: "Terminé", icon: CheckCircle2, color: "text-secondary" },
};

// Sections pour l'affichage (résumé client + fiche admin)
export const SECTIONS = [
  {
    titre: "Informations personnelles",
    fields: [
      { key: "prenom", label: "Prénom" },
      { key: "nom", label: "Nom" },
      { key: "date_naissance", label: "Date de naissance" },
      { key: "sexe", label: "Sexe" },
      { key: "telephone", label: "Téléphone" },
      { key: "adresse", label: "Adresse" },
      { key: "taille_cm", label: "Taille (cm)" },
      { key: "poids_kg", label: "Poids (kg)" },
    ],
  },
  {
    titre: "Santé et historique",
    fields: [
      { key: "antecedents_medicaux", label: "Antécédents médicaux" },
      { key: "blessures", label: "Blessures" },
      { key: "douleurs", label: "Douleurs éventuelles" },
      { key: "causes_douleurs", label: "Causes supposées" },
      { key: "operations_restrictions", label: "Opérations / restrictions" },
      { key: "confirmation_exactitude", label: "Confirmation d'exactitude" },
    ],
  },
  {
    titre: "Mode de vie",
    fields: [
      { key: "metier", label: "Métier" },
      { key: "activite_quotidienne", label: "Activité quotidienne" },
      { key: "heures_sommeil", label: "Heures de sommeil / nuit" },
      { key: "qualite_sommeil", label: "Qualité du sommeil" },
      { key: "niveau_stress", label: "Niveau de stress (1-10)" },
    ],
  },
  {
    titre: "Nutrition",
    fields: [
      { key: "alimentation_actuelle", label: "Alimentation actuelle" },
      { key: "regime_particulier", label: "Régime particulier" },
      { key: "objectif_nutritionnel", label: "Objectif nutritionnel" },
      { key: "calories_journalieres", label: "Calories journalières" },
    ],
  },
  {
    titre: "Expérience sportive",
    fields: [
      { key: "activite_sportive_reguliere", label: "Activité sportive régulière" },
      { key: "activites_pratiquees", label: "Activités pratiquées" },
      { key: "duree_pratique", label: "Depuis combien de temps" },
      { key: "seances_par_semaine", label: "Séances / semaine" },
      { key: "duree_seance", label: "Durée moyenne (min)" },
      { key: "intensite_habituelle", label: "Intensité habituelle" },
    ],
  },
  {
    titre: "Objectifs et disponibilité",
    fields: [
      { key: "objectifs_principaux", label: "Objectifs principaux" },
      { key: "pourquoi_accompagnement", label: "Pourquoi un accompagnement" },
      { key: "resultats_souhaites", label: "Résultats souhaités" },
      { key: "seances_souhaitees_par_semaine", label: "Séances souhaitées / semaine" },
      { key: "jours_disponibles", label: "Jours disponibles" },
      { key: "horaires_disponibles", label: "Horaires disponibles" },
    ],
  },
  {
    titre: "Attentes vis-à-vis du coaching",
    fields: [
      { key: "attentes_accompagnement", label: "Attentes de l'accompagnement" },
      { key: "critere_reussite", label: "Critère de réussite" },
    ],
  },
];

export function formatBilanValue(key, val) {
  if (val === undefined || val === null || val === "") return "—";
  if (key === "confirmation_exactitude") return val ? "Confirmée" : "Non";
  if (key === "activite_sportive_reguliere") return val === "oui" ? "Oui" : val === "non" ? "Non" : String(val);
  if (key === "jours_disponibles") return Array.isArray(val) ? val.join(", ") : String(val);
  return String(val);
}