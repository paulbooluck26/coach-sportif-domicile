import { base44 } from "@/api/base44Client";

export async function cloneExercice(exercice, blocId) {
  return base44.entities.Exercice.create({
    bloc_id: blocId,
    name: exercice.name,
    sets: exercice.sets,
    reps: exercice.reps,
    rest_seconds: exercice.rest_seconds,
    intensity: exercice.intensity,
    description: exercice.description,
    order: exercice.order,
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
  const exos = await base44.entities.Exercice.filter({ bloc_id: bloc.id }, "order");
  for (const ex of exos) {
    await cloneExercice(ex, newBloc.id);
  }
  return newBloc;
}

export async function cloneSeance(seance, semaineId) {
  const newSe = await base44.entities.SeanceProgramme.create({
    semaine_id: semaineId,
    titre: seance.titre ? `${seance.titre} (copie)` : "",
    jour_semaine: seance.jour_semaine,
    type_seance: seance.type_seance,
    description: seance.description,
  });
  const blocs = await base44.entities.Bloc.filter({ seance_programme_id: seance.id }, "ordre");
  for (const bl of blocs) {
    await cloneBloc(bl, newSe.id);
  }
  return newSe;
}

export async function cloneSemaine(semaine, programmeId, newNumero) {
  const newSem = await base44.entities.Semaine.create({
    programme_id: programmeId,
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