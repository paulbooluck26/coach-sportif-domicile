import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Clock, MapPin, X, CheckCircle2, RotateCcw, StickyNote } from "lucide-react";
import ClientDetail from "@/components/coach/ClientDetail";
import { parseDateLocal } from "@/lib/creneaux";

const STATUTS = {
  booked: { label: "Confirmée", color: "bg-accent/15 text-accent", icon: CheckCircle2 },
  completed: { label: "Effectuée", color: "bg-primary/10 text-primary/70", icon: CheckCircle2 },
  cancelled: { label: "Annulée", color: "bg-destructive/10 text-destructive", icon: X },
  rescheduled: { label: "Reportée", color: "bg-secondary text-foreground", icon: RotateCcw },
};

export default function CoachSeances() {
  const [seances, setSeances] = useState(null);
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [detailClient, setDetailClient] = useState(null);

  const load = async () => {
    const data = await base44.entities.Seance.list("date");
    setSeances(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const updateStatut = async (id, status) => {
    await base44.entities.Seance.update(id, { status });
    load();
  };

  const saveNote = async () => {
    await base44.entities.Seance.update(noteModal.id, { notes: noteText });
    setNoteModal(null);
    setNoteText("");
    load();
  };

  const openClient = async (seance) => {
    if (!seance.client_id) return;
    try {
      const profiles = await base44.entities.ClientProfile.filter({ user_id: seance.client_id });
      setDetailClient(profiles[0] || { user_id: seance.client_id, nom: seance.client_name });
    } catch {
      setDetailClient({ user_id: seance.client_id, nom: seance.client_name });
    }
  };

  if (!seances) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0, 10);
  const aVenir = seances.filter(s => s.date >= today && s.status !== "cancelled" && s.status !== "completed").reverse();
  const passees = seances.filter(s => s.date < today || s.status === "completed" || s.status === "cancelled").reverse();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Agenda des séances</h1>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-accent" /> À venir ({aVenir.length})</h2>
        <div className="space-y-3">
          {aVenir.length === 0 && <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-6">Aucune séance à venir.</p>}
          {aVenir.map(s => <SeanceRow key={s.id} seance={s} onStatus={updateStatut} onNote={(seance) => { setNoteModal(seance); setNoteText(seance.notes || ""); }} onOpenClient={openClient} />)}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Passées ({passees.length})</h2>
        <div className="space-y-3">
          {passees.length === 0 && <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-6">Aucune séance passée.</p>}
          {passees.map(s => <SeanceRow key={s.id} seance={s} onStatus={updateStatut} onNote={(seance) => { setNoteModal(seance); setNoteText(seance.notes || ""); }} onOpenClient={openClient} past />)}
        </div>
      </div>

      {noteModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setNoteModal(null)}>
          <div className="bg-card rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-semibold text-foreground">Notes post-séance</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{noteModal.client_name} · {formatDate(noteModal.date)}</p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={5} placeholder="Observations, progression, recommandations..." className="w-full border border-border rounded-md px-4 py-3 resize-none focus:outline-none focus:border-accent mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={saveNote} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {detailClient && <ClientDetail client={detailClient} onClose={() => setDetailClient(null)} />}
    </div>
  );
}

function SeanceRow({ seance, onStatus, onNote, onOpenClient, past }) {
  const st = STATUTS[seance.status] || STATUTS.booked;
  const Icon = st.icon;
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 cursor-pointer hover:bg-secondary/10 -m-2 p-2 rounded-md transition-colors" onClick={() => onOpenClient(seance)}>
        <div className="w-14 h-14 rounded-md bg-secondary flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-semibold text-foreground uppercase">{parseDateLocal(seance.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
          <span className="font-heading text-xl font-bold text-foreground leading-none">{parseDateLocal(seance.date).getDate()}</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground">{seance.client_name || "Client"}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {seance.time}</span>
            <span>{typeLabel(seance.session_type)}</span>
            {seance.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {seance.location}</span>}
          </div>
          {seance.notes && <p className="text-xs text-foreground/50 mt-2 italic">📝 {seance.notes}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${st.color}`}><Icon className="w-3.5 h-3.5" /> {st.label}</span>
        <select value={seance.status} onChange={e => onStatus(seance.id, e.target.value)} className="border border-border rounded-md px-3 py-2 text-sm bg-card text-foreground focus:outline-none focus:border-accent">
          {Object.entries(STATUTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => onNote(seance)} className="p-2 text-muted-foreground hover:text-accent"><StickyNote className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

function typeLabel(t) {
  return { seance_individuelle: "Séance indiv.", programme_personnalise: "Programme", evaluation: "Évaluation", bilan_initial: "Bilan initial" }[t] || "Séance";
}
function formatDate(d) {
  return parseDateLocal(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}