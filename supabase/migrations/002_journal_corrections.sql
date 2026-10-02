-- ============================================================
-- 002_journal_corrections.sql — Corrections explicites du journal
-- d'exécution (evenement_execution).
--
-- Le journal reste append-only : une erreur de saisie ne se supprime
-- pas, elle s'ANNULE en ajoutant une ligne de type
-- 'correction_evenement' qui pointe vers l'entrée annulée
-- (corrige_evenement_id) et porte le motif (description).
--
-- À EXÉCUTER MANUELLEMENT dans l'éditeur SQL Supabase. Idempotente :
-- peut être relancée sans risque.
-- ============================================================

-- 1. Lien explicite vers l'entrée corrigée.
alter table evenement_execution
  add column if not exists corrige_evenement_id uuid references evenement_execution(id);

-- Une entrée ne peut être annulée qu'une seule fois.
create unique index if not exists uniq_evenement_correction_cible
  on evenement_execution (corrige_evenement_id)
  where corrige_evenement_id is not null;

-- 2. Autoriser le nouveau type. On retrouve la contrainte CHECK
--    existante par son contenu (son nom généré peut varier) puis on
--    la remplace par une version qui inclut 'correction_evenement'.
do $$
declare c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.evenement_execution'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type_evenement%'
  loop
    execute format('alter table public.evenement_execution drop constraint %I', c.conname);
  end loop;
end $$;

alter table evenement_execution
  add constraint evenement_execution_type_evenement_check
  check (type_evenement in (
    'onboarding_termine','bilan_preparation_faite','bilan_rdv_realise','bilan_compte_rendu_transmis',
    'programme_cree','programme_livre','application_configuree',
    'seance_domicile_realisee','seance_autonome_suivie',
    'suivi_hebdomadaire_effectue','adaptation_programme_effectuee',
    'demande_retractation_recue','remboursement_effectue',
    'correction_evenement'
  ));
