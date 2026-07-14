import { base44 } from "@/api/base44Client";

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function projectSessionDate(dateDebut, weekNumber, jourSemaine) {
  const start = new Date(dateDebut + "T00:00:00");
  const startDow = start.getDay();
  const daysOffset = (weekNumber - 1) * 7 + ((jourSemaine - startDow + 7) % 7);
  const date = new Date(start);
  date.setDate(start.getDate() + daysOffset);
  return date;
}

export async function loadClientProjection(clientId) {
  const allProgs = await base44.entities.Programme.filter({ statut: "actif" });
  const myProgs = allProgs.filter(p => p.client_ids?.includes(clientId));
  if (myProgs.length === 0) return [];

  const assignations = await base44.entities.ProgrammeAssignation.filter({ client_id: clientId });
  const executions = await base44.entities.ExecutionSeance.filter({ client_id: clientId }, "-date_execution", 100);
  let deplacements = [];
  try {
    deplacements = await base44.entities.SeanceDeplacee.filter({ client_id: clientId });
  } catch {}

  // Chaîne de reports : clé "seanceId|date_prevue" -> nouvelle_date
  const depMap = {};
  deplacements.forEach(d => { if (d.date_prevue && d.nouvelle_date) depMap[`${d.seance_programme_id}|${d.date_prevue}`] = d.nouvelle_date; });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allProjections = [];

  for (const prog of myProgs) {
    const assignation = assignations.find(a => a.programme_id === prog.id);
    if (!assignation || !assignation.date_debut) continue;

    const semaines = await base44.entities.Semaine.filter({ programme_id: prog.id }, "numero");
    const seancesArrays = await Promise.all(semaines.map(s => base44.entities.SeanceProgramme.filter({ semaine_id: s.id })));
    const seances = seancesArrays.flat();

    semaines.forEach(sem => {
      const weekSeances = seances.filter(s => s.semaine_id === sem.id);
      weekSeances.forEach(seance => {
        (seance.jours_semaine || []).forEach(jour => {
          const plannedDate = projectSessionDate(assignation.date_debut, sem.numero || 1, jour);
          const plannedIso = toISODate(plannedDate);

          // Suivre la chaîne de reports éventuelle
          let effectiveIso = plannedIso;
          let deplacee = false;
          let guard = 0;
          while (depMap[`${seance.id}|${effectiveIso}`] && guard < 20) {
            effectiveIso = depMap[`${seance.id}|${effectiveIso}`];
            deplacee = true;
            guard++;
          }
          const effectiveDate = new Date(effectiveIso + "T00:00:00");

          const exec = executions.find(e => {
            if (e.seance_programme_id !== seance.id) return false;
            const ed = new Date(e.date_execution + "T00:00:00");
            return ed >= new Date(effectiveDate.getTime() - 7 * 86400000) && ed <= new Date(effectiveDate.getTime() + 3 * 86400000);
          });

          let status;
          if (exec) status = "faite";
          else if (effectiveDate < today) status = "manquee";
          else status = "a_venir";

          allProjections.push({
            date: effectiveIso,
            seance, programme: prog, semaine: sem, status,
            ...(deplacee ? { deplacee: true, date_prevue: plannedIso } : {}),
          });
        });
      });
    });
  }

  return allProjections;
}