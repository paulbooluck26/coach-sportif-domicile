import { useState } from "react";
import { ArrowLeft, ChevronRight, Eye } from "lucide-react";
import PhasesPanel from "./PhasesPanel";
import SemainesPanel from "./SemainesPanel";
import SeancesPanel from "./SeancesPanel";
import BlocsPanel from "./BlocsPanel";
import ExercicesPanel from "./ExercicesPanel";

export default function ProgrammeBuilder({ programme, onBack }) {
  const [nav, setNav] = useState({ level: 0, phase: null, semaine: null, seance: null, bloc: null });

  const crumbs = [{ label: programme.name, go: () => setNav({ level: 0, phase: null, semaine: null, seance: null, bloc: null }) }];
  if (nav.level >= 1 && nav.phase) crumbs.push({ label: nav.phase.nom, go: () => setNav(n => ({ ...n, level: 1, semaine: null, seance: null, bloc: null })) });
  if (nav.level >= 2 && nav.semaine) crumbs.push({ label: `Semaine ${nav.semaine.numero}`, go: () => setNav(n => ({ ...n, level: 2, seance: null, bloc: null })) });
  if (nav.level >= 3 && nav.seance) crumbs.push({ label: nav.seance.titre, go: () => setNav(n => ({ ...n, level: 3, bloc: null })) });
  if (nav.level >= 4 && nav.bloc) crumbs.push({ label: nav.bloc.titre });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-md"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div className="flex items-center gap-1.5 text-sm flex-wrap">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <button onClick={c.go} className={i === crumbs.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"}>{c.label}</button>
              </span>
            ))}
          </div>
        </div>
        {nav.level >= 3 && nav.seance && (
          <a
            href={`/espace-client/seance/${nav.seance.id}?preview=1`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-md text-sm font-medium hover:border-accent hover:text-accent transition-colors shrink-0"
            title="Voir cette séance comme le client la verra, sans rien enregistrer"
          >
            <Eye className="w-4 h-4" /> Aperçu
          </a>
        )}
      </div>

      {nav.level === 0 && <PhasesPanel programmeId={programme.id} onOpen={(p) => setNav({ level: 1, phase: p, semaine: null, seance: null, bloc: null })} />}
      {nav.level === 1 && nav.phase && <SemainesPanel programmeId={programme.id} phase={nav.phase} onOpen={(s) => setNav({ level: 2, phase: nav.phase, semaine: s, seance: null, bloc: null })} />}
      {nav.level === 2 && nav.semaine && <SeancesPanel semaineId={nav.semaine.id} onOpen={(s) => setNav({ level: 3, phase: nav.phase, semaine: nav.semaine, seance: s, bloc: null })} />}
      {nav.level === 3 && nav.seance && <BlocsPanel seanceId={nav.seance.id} onOpen={(b) => setNav({ level: 4, phase: nav.phase, semaine: nav.semaine, seance: nav.seance, bloc: b })} />}
      {nav.level === 4 && nav.bloc && <ExercicesPanel blocId={nav.bloc.id} />}
    </div>
  );
}
