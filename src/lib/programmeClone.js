import { base44 } from "@/api/base44Client";

export async function cloneExercice(exercice, blocId) {
  return base44.entities.Exercice.create({
    bloc_id: blocId,
    name: exercice.name,
    sets: exercice.sets,
    reps: exercice.reps,
    rest_seconds: exercice.rest_seconds,
    intensity: exercice.intensity,
    media_url: exercice.media_url,
    description: exercice.description,
    ordre: exercice.ordre,
  });
}

export async function cloneBloc(bloc, seanceId) {
  const newBloc = await base44.entities.Bloc.create({
    seance_programme_id: seanceId,
    titre: bloc.titre ? `${bloc.titre} (copie)` : "",
    ordre: bloc.ordre,
    repos_entre_exercices: bloc.repos_entre_exercices,
    rounds: bloc.rounds,
    rest_between_rounds: bloc.rest_between_rounds,
    rest_between_rounds_unit: bloc.rest_between_rounds_unit,
  });
  const exos = await base44.entities.Exercice.filter({ bloc_id: bloc.id }, "ordre");
  for (const ex of exos) {
    await cloneExercice(ex, newBloc.id);
  }
  return newBloc;
}

export async function cloneSeance(seance, semaineId) {
  const newSe = await base44.entities.SeanceProgramme.create({
    semaine_id: semaineId,
    titre: seance.titre ? `${seance.titre} (copie)` : "",
    jours_semaine: seance.jours_semaine,
    type_seance: seance.type_seance,
    description: seance.description,
  });
  const blocs = await base44.entities.Bloc.filter({ seance_programme_id: seance.id }, "ordre");
  for (const bl of blocs) {
    await cloneBloc(bl, newSe.id);
  }
  return newSe;
}

export async function cloneSemaine(semaine, programmeId, newNumero, phaseId) {
  const newSem = await base44.entities.Semaine.create({
    programme_id: programmeId,
    phase_id: phaseId || semaine.phase_id,
    numero: newNumero,
    titre: semaine.titre ? `${semaine.titre} (copie)` : "",
    objectif: semaine.objectif,
  });
  const seances = await base44.entities.SeanceProgramme.filter({ semaine_id: semaine.id });
  for (const se of seances) {
    await cloneSeance(se, newSem.id);
  }
  return newSem;
}

/**
 * Duplique un programme entier (phases, semaines, séances, blocs, exercices)
 * vers un nouveau programme — utilisé pour déployer un modèle de
 * bibliothèque vers un client réel.
 */
export async function cloneProgramme(programme, overrides = {}) {
  const newProgramme = await base44.entities.Programme.create({
    name: programme.name,
    duration_weeks: programme.duration_weeks,
    objective: programme.objective,
    description: programme.description,
    offre: programme.offre,
    statut: "brouillon",
    est_modele: false,
    client_ids: [],
    client_names: "",
    ...overrides,
  });

  const phases = await base44.entities.Phase.filter({ programme_id: programme.id }, "ordre");
  if (phases.length > 0) {
    for (const phase of phases) {
      const newPhase = await base44.entities.Phase.create({
        programme_id: newProgramme.id,
        nom: phase.nom,
        description: phase.description,
        ordre: phase.ordre,
        nb_semaines: phase.nb_semaines,
        couleur: phase.couleur,
      });
      const semaines = await base44.entities.Semaine.filter({ programme_id: programme.id, phase_id: phase.id });
      for (const sem of semaines) {
        await cloneSemaine(sem, newProgramme.id, sem.numero, newPhase.id);
      }
    }
  } else {
    // Programme sans phases (semaines directement rattachées au programme).
    const semaines = await base44.entities.Semaine.filter({ programme_id: programme.id });
    for (const sem of semaines) {
      await cloneSemaine(sem, newProgramme.id, sem.numero, null);
    }
  }

  return newProgramme;
}
