import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, Send, ChevronRight, Star, Flame } from "lucide-react";

const RESSENTI_OPTIONS = [
  { value: "plus_energique", label: "Plus énergique", emoji: "💪" },
  { value: "fatigue_satisfait", label: "Fatigué mais satisfait", emoji: "✅" },
  { value: "tres_fatigue", label: "Très fatigué", emoji: "😴" },
  { value: "douleur_inconfort", label: "Douleur / inconfort", emoji: "⚠️" },
];
const NOTE_LABELS = ["", "Très difficile", "Difficile", "Correcte", "Bonne", "Excellente"];
const RPE_LABELS = ["", "Très facile", "Facile", "Modéré", "Difficile", "Maximal"];

export default function ExecutionComplete({ executionId, sessionData, user, onDone, initialPerfData }) {
  const [step, setStep] = useState(1);
  const [noteSeance, setNoteSeance] = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [hoverRpe, setHoverRpe] = useState(0);
  const [douleur, setDouleur] = useState("");
  const [ressenti, setRessenti] = useState("");
  const [messageCoach, setMessageCoach] = useState("");
  const [saving, setSaving] = useState(false);
  const [perfData, setPerfData] = useState(() => {
    const init = {};
    if (initialPerfData) {
      Object.entries(initialPerfData).forEach(([exId, v]) => {
        if (!v) return;
        init[exId] = {
          actual_reps: v.reps ?? "",
          actual_weight: v.charge ?? "",
          notes: v.commentaire ?? "",
        };
      });
    }
    return init;
  });

  const allExercises = sessionData.blocs.flatMap(b => b.exercices.map(ex => ({ ...ex, bloc_titre: b.titre })));

  const submitFeedback = async () => {
    setSaving(true);
    try {
      if (executionId) {
        await base44.entities.ExecutionSeance.update(executionId, {
          note_seance: noteSeance,
          rpe: rpe,
          douleur: douleur,
          ressenti: ressenti,
          feedback: noteSeance ? `Note ${noteSeance}/5${rpe ? `, RPE ${rpe}/5` : ""}${ressenti ? `, ${RESSENTI_OPTIONS.find(r => r.value === ressenti)?.label || ressenti}` : ""}` : "",
          message_coach: messageCoach,
        });
      }
      if (messageCoach.trim()) {
        await base44.entities.DemandeContact.create({
          name: user?.full_name || user?.email || "Client",
          email: user?.email || "",
          goal: sessionData.seance?.titre || "Séance",
          message: messageCoach,
          type_demande: "feedback_seance",
          statut: "nouveau",
        });
      }
    } catch (e) {}
    setSaving(false);
    setStep(2);
  };

  const submitPerformance = async () => {
    setSaving(true);
    try {
      const records = allExercises
        .filter(ex => perfData[ex.id] && (perfData[ex.id].actual_reps || perfData[ex.id].actual_weight))
        .map(ex => ({
          execution_id: executionId, exercice_id: ex.id, exercice_name: ex.name,
          planned_reps: ex.reps, planned_intensity: ex.intensity || "",
          actual_reps: perfData[ex.id]?.actual_reps || "",
          actual_weight: perfData[ex.id]?.actual_weight || 0, notes: perfData[ex.id]?.notes || "",
        }));
      if (records.length > 0 && executionId) {
        await base44.entities.PerformanceExercice.bulkCreate(records);
      }
    } catch (e) {}
    setSaving(false);
    onDone();
  };

  const setPerf = (exId, field, value) => setPerfData(d => ({ ...d, [exId]: { ...d[exId], [field]: value } }));

  return (
    <div className="fixed inset-0 z-50 bg-primary text-primary-foreground overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12 min-h-screen flex flex-col">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="font-heading text-4xl font-bold mb-3">Séance terminée !</h1>
          <p className="text-primary-foreground/60">Félicitations, vous avez complété votre séance.</p>
        </div>

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold mb-3">Comment as-tu trouvé la séance aujourd'hui ?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setNoteSeance(n)} onMouseEnter={() => setHoverNote(n)} onMouseLeave={() => setHoverNote(0)} className="transition-transform hover:scale-110">
                    <Star className={`w-10 h-10 transition-colors ${(hoverNote || noteSeance) >= n ? "fill-secondary text-secondary" : "text-primary-foreground/20"}`} />
                  </button>
                ))}
              </div>
              {noteSeance > 0 && <p className="text-sm text-primary-foreground/50 mt-2">{NOTE_LABELS[noteSeance]}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Quel niveau d'effort as-tu fourni pendant la séance ?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRpe(n)} onMouseEnter={() => setHoverRpe(n)} onMouseLeave={() => setHoverRpe(0)} className="transition-transform hover:scale-110">
                    <Flame className={`w-10 h-10 transition-colors ${(hoverRpe || rpe) >= n ? "fill-destructive text-destructive" : "text-primary-foreground/20"}`} />
                  </button>
                ))}
              </div>
              {rpe > 0 && <p className="text-sm text-primary-foreground/50 mt-2">{RPE_LABELS[rpe]}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">As-tu ressenti une douleur ou une gêne pendant la séance ?</label>
              <textarea value={douleur} onChange={e => setDouleur(e.target.value)} placeholder="Décris la douleur ou la gêne (ou laisse vide si aucune)" rows={2} className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-lg px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary resize-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3">Comment te sens-tu après cette séance ?</label>
              <div className="grid grid-cols-2 gap-2">
                {RESSENTI_OPTIONS.map(r => (
                  <button key={r.value} onClick={() => setRessenti(r.value)} className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors text-sm ${ressenti === r.value ? "border-secondary bg-secondary/15" : "border-primary-foreground/15 hover:border-primary-foreground/30"}`}>
                    <span className="text-xl">{r.emoji}</span>
                    <span className="text-left">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Message au coach (optionnel)</label>
              <textarea value={messageCoach} onChange={e => setMessageCoach(e.target.value)} placeholder="Une question, une difficulté, un retour à partager ?" rows={3} className="w-full bg-primary-foreground/5 border border-primary-foreground/15 rounded-lg px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary resize-none" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-primary-foreground/20 py-3 rounded-md text-sm font-medium hover:bg-primary-foreground/5">Passer</button>
              <button onClick={submitFeedback} disabled={saving} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? "..." : <>Continuer <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-xl font-bold mb-1">Vos performances</h2>
              <p className="text-sm text-primary-foreground/50 mb-4">Renseignez ce que vous avez réellement fait (optionnel — pour le suivi de progression).</p>
            </div>
            {allExercises.map((ex, i) => (
              <div key={ex.id || i} className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                  <p className="font-semibold text-sm">{ex.name}</p>
                </div>
                <p className="text-xs text-primary-foreground/40 mb-3 pl-8">Prévu: {ex.reps || "—"}{ex.intensity ? ` · ${ex.intensity}` : ""}</p>
                <div className="grid grid-cols-2 gap-2 pl-8">
                  <input type="text" placeholder="Reps réelles" value={perfData[ex.id]?.actual_reps || ""} onChange={e => setPerf(ex.id, "actual_reps", e.target.value)} className="bg-primary-foreground/5 border border-primary-foreground/15 rounded px-3 py-2 text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary" />
                  <input type="number" placeholder="Poids (kg)" value={perfData[ex.id]?.actual_weight || ""} onChange={e => setPerf(ex.id, "actual_weight", parseFloat(e.target.value) || 0)} className="bg-primary-foreground/5 border border-primary-foreground/15 rounded px-3 py-2 text-sm placeholder:text-primary-foreground/30 focus:outline-none focus:border-secondary" />
                </div>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={onDone} className="flex-1 border border-primary-foreground/20 py-3 rounded-md text-sm font-medium hover:bg-primary-foreground/5">Plus tard</button>
              <button onClick={submitPerformance} disabled={saving} className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? "..." : <><Send className="w-4 h-4" /> Enregistrer</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}