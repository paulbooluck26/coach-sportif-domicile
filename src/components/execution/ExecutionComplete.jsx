import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, ChevronRight, Star, Flame } from "lucide-react";

const RESSENTI_OPTIONS = [
  { value: "plus_energique", label: "Plus énergique", emoji: "💪" },
  { value: "fatigue_satisfait", label: "Fatigué mais satisfait", emoji: "✅" },
  { value: "tres_fatigue", label: "Très fatigué", emoji: "😴" },
  { value: "douleur_inconfort", label: "Douleur / inconfort", emoji: "⚠️" },
];
const NOTE_LABELS = ["", "Très difficile", "Difficile", "Correcte", "Bonne", "Excellente"];
const RPE_LABELS = ["", "Très facile", "Facile", "Modéré", "Difficile", "Maximal"];

// Écran de fin de séance : ressenti uniquement. Les performances sont désormais
// saisies à la fin de chaque tour pendant la séance (voir ExecutionPerfCapture).
export default function ExecutionComplete({ executionId, sessionData, user, onDone }) {
  const [noteSeance, setNoteSeance] = useState(0);
  const [hoverNote, setHoverNote] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [hoverRpe, setHoverRpe] = useState(0);
  const [douleur, setDouleur] = useState("");
  const [ressenti, setRessenti] = useState("");
  const [messageCoach, setMessageCoach] = useState("");
  const [saving, setSaving] = useState(false);

  const submitFeedback = async () => {
    setSaving(true);
    try {
      if (executionId) {
        await base44.entities.ExecutionSeance.update(executionId, {
          note_seance: noteSeance,
          rpe,
          douleur,
          ressenti,
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
    onDone();
  };

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

          <button onClick={submitFeedback} disabled={saving} className="w-full bg-secondary text-secondary-foreground py-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? "..." : <>Terminer <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}