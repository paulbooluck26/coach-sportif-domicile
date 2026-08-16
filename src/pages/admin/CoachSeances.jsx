import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Clock, MapPin, X, CheckCircle2, RotateCcw, StickyNote, List, CalendarRange, CalendarClock, Ban, UserX, PhoneCall } from "lucide-react";
import ClientDetail from "@/components/coach/ClientDetail";
import CoachSeancesCalendar from "@/components/coach/CoachSeancesCalendar";
import { typeLabelSeance as typeLabel } from "@/lib/creneaux";
import DemandeDetailModal from "@/components/coach/DemandeDetailModal";
import { parseDateLocal } from "@/lib/creneaux";
import { notifierRdv, fmtDate } from "@/lib/rdvNotifications";

const APPELS_CONFIRMES = ["appel_confirme", "appel_realise"];

const STATUTS = {
  booked: { label: "Confirmée", color: "bg-accent/15 text-accent", icon: CheckCircle2 },
  completed: { label: "Effectuée", color: "bg-primary/10 text-primary/70", icon: CheckCircle2 },
  cancelled: { label: "Annulée", color: "bg-destructive/10 text-destructive", icon: X },
  rescheduled: { label: "Reportée", color: "bg-secondary text-foreground", icon: RotateCcw },
  no_show: { label: "Absent", color: "bg-destructive/10 text-destructive", icon: UserX },
};

export default function CoachSeances() {
  const [seances, setSeances] = useState(null);
  const [demandes, setDemandes] = useState(null);
  const [view, setView] = useState("liste");
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [moveModal, setMoveModal] = useState(null);
  const [moveDate, setMoveDate] = useState("");
  const [moveTime, setMoveTime] = useState("");
  const [detailClient, setDetailClient] = useState(null);
  const [selectedDemande, setSelectedDemande] = useState(null);

  const load = async () => {
    const [data, dems] = await Promise.all([
      base44.entities.Seance.list("date"),
      base44.entities.DemandeContact.list("-created_date", 200),
    ]);
    setSeances(data);
    setDemandes(dems);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const appels = (demandes || []).filter((d) => d.type_demande === "appel_decouverte" && APPELS_CONFIRMES.includes(d.statut));

  const updateStatut = async (id, status) => {
    await base44.entities.Seance.update(id, { status });
    load();
  };

  const annuler = async (seance) => {
    if (!confirm("Annuler ce rendez-vous ? Le client sera notifié.")) return;
    const ancienne = `${fmtDate(seance.date)}${seance.time ? " à " + seance.time : ""}`;
    await updateStatut(seance.id, "cancelled");
    await notifierRdv({
      client_id: seance.client_id,
      titre: "Rendez-vous annulé",
      message: `Votre rendez-vous du ${ancienne} a été annulé par votre coach.`,
    });
  };
  const marquerRealise = async (seance) => { await updateStatut(seance.id, "completed"); };
  const marquerAbsent = async (seance) => { await updateStatut(seance.id, "no_show"); };

  const openMove = (seance) => {
    setMoveModal(seance);
    setMoveDate(seance.date || "");
    setMoveTime(seance.time || "");
  };
  const confirmerDeplacement = async () => {
    if (!moveDate || !moveTime) return;
    const ancienne = `${fmtDate(moveModal.date)}${moveModal.time ? " à " + moveModal.time : ""}`;
    await base44.entities.Seance.update(moveModal.id, { date: moveDate, time: moveTime, status: "rescheduled" });
    await notifierRdv({
      client_id: moveModal.client_id,
      titre: "Rendez-vous déplacé",
      message: `Votre rendez-vous du ${ancienne} a été déplacé au ${fmtDate(moveDate)} à ${moveTime}.`,
    });
    setMoveModal(null);
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

  if (!seances || !demandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().slice(0, 10);
  const PASSES = ["cancelled", "completed", "no_show"];

  // Événements unifiés : séances de coaching + appels découverte confirmés
  const events = [
    ...seances.map(s => ({ kind: "seance", id: s.id, date: s.date || "", time: s.time || "", data: s })),
    ...appels.map(a => ({ kind: "appel", id: a.id, date: a.date_souhaitee || "", time: a.heure_souhaitee || "", data: a })),
  ];
  const isAVenir = (e) => {
    if (e.kind === "seance") return e.date >= today && !PASSES.includes(e.data.status);
    return e.data.statut === "appel_confirme" && e.date >= today;
  };
  const byDate = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
  const aVenir = events.filter(isAVenir).sort(byDate);
  const passees = events.filter(e => !isAVenir(e)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Agenda</h1>
        </div>
        <div className="inline-flex bg-card border border-border rounded-lg p-1">
          <button onClick={() => setView("liste")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "liste" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="w-4 h-4" /> Liste</button>
          <button onClick={() => setView("calendrier")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === "calendrier" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}><CalendarRange className="w-4 h-4" /> Calendrier</button>
        </div>
      </div>

      {view === "liste" ? (
        <>
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-accent" /> À venir ({aVenir.length})</h2>
            <div className="space-y-3">
              {aVenir.length === 0 && <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-6">Aucun rendez-vous à venir.</p>}
              {aVenir.map(e => <RdvRow key={`${e.kind}-${e.id}`} rdv={e} onMove={openMove} onCancel={annuler} onComplete={marquerRealise} onNoShow={marquerAbsent} onNote={(s) => { setNoteModal(s); setNoteText(s.notes || ""); }} onOpenClient={openClient} onOpenDemande={setSelectedDemande} />)}
            </div>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground mb-4">Passés ({passees.length})</h2>
            <div className="space-y-3">
              {passees.length === 0 && <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-6">Aucun rendez-vous passé.</p>}
              {passees.map(e => <RdvRow key={`${e.kind}-${e.id}`} rdv={e} onMove={openMove} onCancel={annuler} onComplete={marquerRealise} onNoShow={marquerAbsent} onNote={(s) => { setNoteModal(s); setNoteText(s.notes || ""); }} onOpenClient={openClient} onOpenDemande={setSelectedDemande} past />)}
            </div>
          </div>
        </>
      ) : (
        <CoachSeancesCalendar seances={seances} appels={appels} onOpenClient={openClient} onOpenDemande={setSelectedDemande} />
      )}

      {noteModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setNoteModal(null)}>
          <div className="bg-card rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-semibold text-foreground">Note interne</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{noteModal.client_name} · {fmtDate(noteModal.date)}</p>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={5} placeholder="Visible uniquement par le coach..." className="w-full border border-border rounded-md px-4 py-3 resize-none focus:outline-none focus:border-accent mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setNoteModal(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={saveNote} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {moveModal && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setMoveModal(null)}>
          <div className="bg-card rounded-lg p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-semibold text-foreground">Déplacer le rendez-vous</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{moveModal.client_name} · {fmtDate(moveModal.date)}{moveModal.time ? ` à ${moveModal.time}` : ""}</p>
            <div className="space-y-3 mb-4">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nouvelle date</label><input type="date" value={moveDate} onChange={e => setMoveDate(e.target.value)} className="w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nouvelle heure</label><input type="time" value={moveTime} onChange={e => setMoveTime(e.target.value)} className="w-full border border-border rounded-md px-3 py-2.5 focus:outline-none focus:border-accent" /></div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Le client sera notifié du nouveau créneau.</p>
            <div className="flex gap-3">
              <button onClick={() => setMoveModal(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={confirmerDeplacement} disabled={!moveDate || !moveTime} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50">Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {detailClient && <ClientDetail client={detailClient} onClose={() => setDetailClient(null)} />}
      {selectedDemande && <DemandeDetailModal demande={selectedDemande} onClose={() => setSelectedDemande(null)} />}
    </div>
  );
}

function RdvRow({ rdv, onMove, onCancel, onComplete, onNoShow, onNote, onOpenClient, onOpenDemande, past }) {
  if (rdv.kind === "appel") {
    const a = rdv.data;
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button className="flex items-center gap-4 text-left hover:bg-secondary/10 -m-2 p-2 rounded-md transition-colors" onClick={() => onOpenDemande(a)}>
          <div className="w-14 h-14 rounded-md bg-accent flex flex-col items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-accent-foreground uppercase">{parseDateLocal(rdv.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
            <span className="font-heading text-xl font-bold text-accent-foreground leading-none">{parseDateLocal(rdv.date).getDate()}</span>
          </div>
          <div>
            <p className="font-heading font-semibold text-foreground">{a.name || "Client"}</p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              {rdv.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {rdv.time}</span>}
              <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5" /> Appel découverte</span>
            </div>
          </div>
        </button>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/15 text-accent self-start md:self-auto"><PhoneCall className="w-3.5 h-3.5" /> Confirmé</span>
      </div>
    );
  }

  const seance = rdv.data;
  const st = STATUTS[seance.status] || STATUTS.booked;
  const Icon = st.icon;
  const done = seance.status === "completed" || seance.status === "cancelled";
  const replanifiable = past && (seance.status === "completed" || seance.status === "no_show");
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 cursor-pointer hover:bg-secondary/10 -m-2 p-2 rounded-md transition-colors" onClick={() => onOpenClient(seance)}>
        <div className="w-14 h-14 rounded-md bg-secondary flex flex-col items-center justify-center flex-shrink-0">
          <span className="text-[10px] font-semibold text-foreground uppercase">{parseDateLocal(rdv.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
          <span className="font-heading text-xl font-bold text-foreground leading-none">{parseDateLocal(rdv.date).getDate()}</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground">{seance.client_name || "Client"}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
            {rdv.time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {rdv.time}</span>}
            <span>{typeLabel(seance.session_type)}</span>
            {seance.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {seance.location}</span>}
          </div>
          {seance.notes && <p className="text-xs text-foreground/50 mt-2 italic">📝 {seance.notes}</p>}
          {seance.status === "cancelled" && seance.motif_annulation && <p className="text-xs text-destructive/70 mt-2 italic">Motif : {seance.motif_annulation}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${st.color}`}><Icon className="w-3.5 h-3.5" /> {st.label}</span>
        {!past && !done && (
          <>
            <button onClick={() => onMove(seance)} className="p-2 text-muted-foreground hover:text-accent border border-border rounded-md" title="Déplacer"><CalendarClock className="w-4 h-4" /></button>
            <button onClick={() => onComplete(seance)} className="p-2 text-muted-foreground hover:text-secondary border border-border rounded-md" title="Marquer réalisé"><CheckCircle2 className="w-4 h-4" /></button>
            <button onClick={() => onNoShow(seance)} className="p-2 text-muted-foreground hover:text-destructive border border-border rounded-md" title="Marquer absent"><UserX className="w-4 h-4" /></button>
            <button onClick={() => onCancel(seance)} className="p-2 text-muted-foreground hover:text-destructive border border-border rounded-md" title="Annuler"><Ban className="w-4 h-4" /></button>
          </>
        )}
        {replanifiable && (
          <button onClick={() => onMove(seance)} className="p-2 text-muted-foreground hover:text-accent border border-border rounded-md" title="Replanifier"><CalendarClock className="w-4 h-4" /></button>
        )}
        <button onClick={() => onNote(seance)} className="p-2 text-muted-foreground hover:text-accent border border-border rounded-md" title="Note interne"><StickyNote className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
