// Traduit le nom d'entité Base44 (ex: "ClientProfile") vers le nom de table
// Postgres réel (ex: "client_profile"). Doit rester synchronisé avec
// 001_init_schema.sql. Les cas particuliers (mots réservés SQL, etc.)
// sont listés explicitement dans OVERRIDES.

const OVERRIDES = {
  User: 'app_user', // "user" est un mot réservé en PostgreSQL
};

function toSnakeCase(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function tableNameFor(entityName) {
  if (OVERRIDES[entityName]) return OVERRIDES[entityName];
  return toSnakeCase(entityName);
}

// Liste des entités Base44/PHYSIS COACHING connues, pour validation / autocomplétion.
export const KNOWN_ENTITIES = [
  'BilanInitial', 'Bloc', 'CarnetSeances', 'ClientProfile',
  'CommandeProgramme', 'CycleClient', 'DemandeContact', 'Disponibilite',
  'EmailTemplate', 'ExecutionSeance', 'Exercice', 'Message', 'Mouvement',
  'Notification', 'Paiement', 'PerformanceExercice',
  'Phase', 'Programme', 'ProgrammeAssignation', 'RecordPerso', 'Ressource',
  'RessourceCategorie', 'Seance', 'SeanceDeplacee', 'SeanceProgramme',
  'Semaine', 'User', 'Produit', 'CodePromo', 'UtilisationCodePromo', 'DiagnosticPhysis',
  'Badge', 'BadgeClient', 'ObjectifClient', 'FraisDeplacement', 'ParametreCoach',
];
