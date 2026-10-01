-- ============================================================
-- 001_retractation.sql — Droit de rétractation e-commerce
-- (art. L.221-18 à L.221-25 du Code de la consommation).
--
-- À EXÉCUTER MANUELLEMENT dans l'éditeur SQL Supabase (ou via
-- `supabase db push`) — ce dépôt n'a pas accès à la base et ne peut
-- ni exécuter ni vérifier cette migration.
--
-- Suppose `id uuid default gen_random_uuid()` sur les tables
-- existantes (produit, paiement, commande_programme, carnet_seances,
-- abonnement_client, app_user) — convention Supabase la plus
-- courante, non vérifiable sans accès direct à la base. Ajuster si
-- le schéma réel diffère (ex. id de type bigint/serial).
-- ============================================================

-- 1. Contrat : enregistrement figé de chaque commande (identité
--    client, offre + version, CGV, consentements horodatés, prix
--    détaillé). C'est l'ancre légale de toute la fonctionnalité.
create table if not exists contrat (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),

  client_id uuid not null references app_user(id),
  client_nom text not null,
  client_email text not null,
  client_adresse_rue text not null,
  client_adresse_code_postal text not null,
  client_adresse_ville text not null,
  client_adresse_pays text not null default 'France',

  produit_id uuid references produit(id),
  produit_sku text not null,
  produit_version integer not null default 1,
  offre_snapshot jsonb not null,
  type_contrat text not null check (type_contrat in ('paiement_unique','abonnement')),

  cgv_version text not null,
  cgv_hash text not null,
  cgv_acceptee boolean not null default false,
  cgv_acceptee_horodatage timestamptz,

  commencement_immediat_demande boolean not null default false,
  commencement_immediat_texte text,
  commencement_immediat_horodatage timestamptz,

  -- { base, deplacement, reduction_code_promo, mention_tva, total,
  --   periodicite, duree_engagement_mois, montant_total_engagement_minimal }
  prix_detail jsonb not null,

  stripe_ref text,
  statut text not null default 'initiee' check (statut in (
    'initiee','payee','en_execution','retractation_demandee','retractee','cloturee','annulee'
  )),
  date_debut_execution timestamptz,
  date_limite_retractation timestamptz,

  email_confirmation_envoye boolean not null default false,
  email_confirmation_date timestamptz,
  email_confirmation_contenu text
);
create index if not exists idx_contrat_client on contrat(client_id);
create index if not exists idx_contrat_statut on contrat(statut);

-- 2. Journal d'événements d'exécution : append-only PAR CONVENTION
--    APPLICATIVE (aucun code applicatif ne doit jamais appeler
--    update()/delete() dessus — voir src/lib/executionEvents.js).
--    C'est ce journal, jamais un statut modifiable, qui permet de
--    reconstituer objectivement ce qui a été fourni au Client.
create table if not exists evenement_execution (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  contrat_id uuid not null references contrat(id),
  type_evenement text not null check (type_evenement in (
    'onboarding_termine','bilan_preparation_faite','bilan_rdv_realise','bilan_compte_rendu_transmis',
    'programme_cree','programme_livre','application_configuree',
    'seance_domicile_realisee','seance_autonome_suivie',
    'suivi_hebdomadaire_effectue','adaptation_programme_effectuee',
    'demande_retractation_recue','remboursement_effectue'
  )),
  date_evenement timestamptz not null default now(),
  valeur_associee numeric,
  description text,
  detail jsonb,
  cree_par uuid references app_user(id)
);
create index if not exists idx_evenement_contrat on evenement_execution(contrat_id);

-- 3. Demandes de rétractation — statut, calcul proposé, décision
--    admin avec motif conservé. Aucun remboursement Stripe n'est
--    déclenché depuis cette table dans cette version.
create table if not exists demande_retractation (
  id uuid primary key default gen_random_uuid(),
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now(),
  contrat_id uuid not null references contrat(id),
  client_id uuid not null references app_user(id),
  date_reception timestamptz not null default now(),
  email_accuse_destination text not null,
  date_envoi_accuse timestamptz,
  texte_declaration text not null,
  statut text not null default 'recue' check (statut in ('recue','instruite','remboursement_valide','cloturee')),
  montant_propose numeric,
  montant_valide numeric,
  motif_admin text,
  calcul_detail jsonb,
  cloturee_par uuid references app_user(id),
  date_cloture timestamptz
);
create index if not exists idx_retractation_contrat on demande_retractation(contrat_id);
create index if not exists idx_retractation_statut on demande_retractation(statut);

-- 4. Rattachement progressif et NON BLOQUANT aux tables existantes.
--    Nullable exprès : le webhook Stripe existant (invisible depuis
--    ce dépôt) ne remplira pas contrat_id tant qu'il n'est pas
--    modifié séparément — hors scope de cette version.
alter table produit add column if not exists version integer not null default 1;
alter table paiement add column if not exists contrat_id uuid references contrat(id);
alter table commande_programme add column if not exists contrat_id uuid references contrat(id);
alter table carnet_seances add column if not exists contrat_id uuid references contrat(id);
alter table abonnement_client add column if not exists contrat_id uuid references contrat(id);

-- Suggestion facultative (à activer par l'utilisateur après tests) :
-- interdire toute modification/suppression d'evenement_execution en
-- RLS pour renforcer, au-delà de la convention applicative, la
-- garantie d'un journal réellement append-only.
-- alter table evenement_execution enable row level security;
-- create policy evenement_execution_insert_only on evenement_execution
--   for insert to authenticated with check (true);
-- create policy evenement_execution_select on evenement_execution
--   for select to authenticated using (true);
