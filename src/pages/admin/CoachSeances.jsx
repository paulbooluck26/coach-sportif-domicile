import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Clock, MapPin, X, CheckCircle2, RotateCcw, StickyNote, List, CalendarRange, CalendarClock, Ban, UserX, PhoneCall, Filter } from "lucide-react";
import ClientDetail from "@/components/coach/ClientDetail";
import CoachSeancesCalendar from "@/components/coach/CoachSeancesCalendar";
import CalendarDayView from "@/components/coach/CalendarDayView";
import CalendarWeekView from "@/components/coach/CalendarWeekView";
import { typeLabelSeance as typeLabel, parseDateLocal, dateStr } from "@/lib/creneaux";
import { buildEvents, styleFor, TYPE_STYLES } from "@/lib/agendaEvents";
import DemandeDetailModal from "@/components/coach/DemandeDetailModal";
import { notifierRdv, fmtDate } from "@/lib/rdvNotifications";

const APPELS_CONFIRMES = ["appel_confirme", "appel_realise"];

const STATUTS = {
  booked: { label: "Confirmée", color: "bg-accent/15 text-accent", icon: CheckCircle2 },
  completed: { label: "Effectuée", color: "bg-primary/10 text-primary/70", icon: CheckCircle2 },
  cancelled: { label: "Annulée", color: "bg-destructive/10 text-destructive", icon: X },
  rescheduled: { label: "Reportée", color: "bg-secondary text-foreground", icon: RotateCcw },
  no_show: { label: "Absent", color: "bg-destructive/10 text-destructive", icon: UserX },
};

const VUES = [
  { key: "liste", label: "Liste", icon: List },
  { key: "jour", label: "Jour", icon: CalendarClock },
  { key: "semaine", label: "Semaine", icon: CalendarRange },
  { key: "mois", label: "Mois", icon: CalendarDays },
];

const ONGLETS_LISTE = [
  { key: "avenir", label: "À venir" },
  { key: "passe", label: "Passés" },
  { key: "annules", label: "Annulés" },
];

const emptyFiltres = { type: "", client: "", date: "", heure: "", lieu: "" };

export default function CoachSeances() {
  const [seances, setSeances] = useState(null);
  const [demandes, setDemandes] = useState(null);
  const [vue, setVue] = useState("liste");
  const [ongletListe, setOngletListe] = useState("avenir");
  const [filtres, setFiltres] = useState(emptyFiltres);
  const [showFiltres, setShowFiltres] = useState(false);
  const [jourAffiche, setJourAffiche] = useState(new Date());

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

  const openEvent = (ev) => {
    if (ev.kind === "seance") openClient(ev.data);
    else setSelectedDemande(ev.data);
  };

  // Événements pour les vues calendrier (jour/semaine/mois) — annulés exclus.
  const calendarEvents = useMemo(() => {
    if (!seances || !demandes) return [];
    return buildEvents(seances, appels);
  }, [seances, demandes]);

  if (!seances || !demandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = dateStr(new Date());

  // Tous les événements (y compris annulés) pour la vue Liste — les
  // onglets et filtres décident lesquels s'affichent.
  const allEvents = buildEvents(seances, appels, { includeCancelled: true });

  const matchFiltres = (e) => {
    if (filtres.type && e.type !== filtres.type) return false;
    if (filtres.client && !e.label.toLowerCase().includes(filtres.client.toLowerCase())) return false;
    if (filtres.date && e.date !== filtres.date) return false;
    if (filtres.heure && e.time.slice(0, 2) !== filtres.heure) return false;
    if (filtres.lieu) {
      const lieu = (e.data.location || "").toLowerCase();
      if (!lieu.includes(filtres.lieu.toLowerCase())) return false;
    }
    return true;
  };

  const isAnnule = (e) => e.kind === "seance" && e.status === "cancelled";
  const isAVenir = (e) => {
    if (isAnnule(e)) return false;
    if (e.kind === "seance") return e.date >= today && e.status !== "completed" && e.status !== "no_show";
    return e.date >= today;
  };
  const byDate = (a, b) => (a.date + a.time).localeCompare(b.date + b.time);
  const byDateDesc = (a, b) => (b.date + b.time).localeCompare(a.date + a.time);

  const filtered = allEvents.filter(matchFiltres);
  const listesParOnglet = {
    avenir: filtered.filter(isAVenir).sort(byDate),
    passe: filtered.filter((e) => !isAVenir(e) && !isAnnule(e)).sort(byDateDesc),
    annules: filtered.filter(isAnnule).sort(byDateDesc),
  };
  const listeActive = listesParOnglet[ongletListe];

  const filtresActifs = Object.values(filtres).some(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Agenda</h1>
        </div>
        <div className="inline-flex bg-card border border-border rounded-lg p-1 flex-wrap">
          {VUES.map((v) => {
            const Icon = v.icon;
            return (
              <button key={v.key} onClick={() => setVue(v.key)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vue === v.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-4 h-4" /> {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Légende couleurs, visible sur toutes les vues */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {Object.entries(TYPE_STYLES).map(([key, st]) => (
          <span key={key} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} /> {st.label}</span>
        ))}
      </div>

      {vue === "liste" && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex gap-1 border-b border-border sm:border-0">
              {ONGLETS_LISTE.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setOngletListe(o.key)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 sm:border sm:rounded-lg transition-colors ${ongletListe === o.key ? "border-primary text-foreground sm:bg-primary sm:text-primary-foreground" : "border-transparent text-muted-foreground hover:text-foreground sm:border-border"}`}
                >
                  {o.label} <span className="text-xs">({listesParOnglet[o.key].length})</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowFiltres((v) => !v)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border ${filtresActifs ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}>
              <Filter className="w-4 h-4" /> Filtres {filtresActifs && `(${Object.values(filtres).filter(Boolean).length})`}
            </button>
          </div>

          {showFiltres && (
            <div className="bg-card border border-border rounded-lg p-4 grid sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
                <select value={filtres.type} onChange={(e) => setFiltres({ ...filtres, type: e.target.value })} className="w-full border border-border rounded-md px-2 py-2 text-sm bg-card text-foreground">
                  <option value="">Tous</option>
                  {Object.entries(TYPE_STYLES).map(([key, st]) => <option key={key} value={key}>{st.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Client</label>
                <input value={filtres.client} onChange={(e) => setFiltres({ ...filtres, client: e.target.value })} placeholder="Nom..." className="w-full border border-border rounded-md px-2 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <input type="date" value={filtres.date} onChange={(e) => setFiltres({ ...filtres, date: e.target.value })} className="w-full border border-border rounded-md px-2 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Heure</label>
                <select value={filtres.heure} onChange={(e) => setFiltres({ ...filtres, heure: e.target.value })} className="w-full border border-border rounded-md px-2 py-2 text-sm bg-card text-foreground">
                  <option value="">Toutes</option>
                  {Array.from({ length: 17 }, (_, i) => i + 6).map((h) => <option key={h} value={String(h).padStart(2, "0")}>{String(h).padStart(2, "0")}h</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Lieu</label>
                <input value={filtres.lieu} onChange={(e) => setFiltres({ ...filtres, lieu: e.target.value })} placeholder="Adresse..." className="w-full border border-border rounded-md px-2 py-2 text-sm" />
              </div>
              {filtresActifs && (
                <button onClick={() => setFiltres(emptyFiltres)} className="sm:col-span-5 text-xs text-accent hover:underline text-left">Réinitialiser les filtres</button>
              )}
            </div>
          )}

          <div className="space-y-3">
            {listeActive.length === 0 && <p className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-6">Aucun rendez-vous ici.</p>}
            {listeActive.map(e => (
              <RdvRow
                key={`${e.kind}-${e.id}`}
                rdv={e}
                onMove={openMove}
                onCancel={annuler}
                onComplete={marquerRealise}
                onNoShow={marquerAbsent}
                onNote={(s) => { setNoteModal(s); setNoteText(s.notes || ""); }}
                onOpenClient={openClient}
                onOpenDemande={setSelectedDemande}
                past={ongletListe === "passe"}
              />
            ))}
          </div>
        </>
      )}

      {vue === "jour" && (
        <CalendarDayView date={jourAffiche} onDateChange={setJourAffiche} events={calendarEvents.filter(matchFiltres)} onOpenEvent={openEvent} />
      )}

      {vue === "semaine" && (
        <CalendarWeekView date={jourAffiche} onDateChange={setJourAffiche} events={calendarEvents.filter(matchFiltres)} onOpenEvent={openEvent} />
      )}

      {vue === "mois" && (
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
  const st = styleFor(rdv.type);

  if (rdv.kind === "appel") {
    const a = rdv.data;
    return (
      <div className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button className="flex items-center gap-4 text-left hover:bg-secondary/10 -m-2 p-2 rounded-md transition-colors" onClick={() => onOpenDemande(a)}>
          <div className={`w-14 h-14 rounded-md flex flex-col items-center justify-center flex-shrink-0 ${st.dot}`}>
            <span className="text-[10px] font-semibold text-white uppercase">{parseDateLocal(rdv.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
            <span className="font-heading text-xl font-bold text-white leading-none">{parseDateLocal(rdv.date).getDate()}</span>
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
  const statutStyle = STATUTS[seance.status] || STATUTS.booked;
  const Icon = statutStyle.icon;
  const done = seance.status === "completed" || seance.status === "cancelled";
  const replanifiable = past && (seance.status === "completed" || seance.status === "no_show");
  return (
    <div className="bg-card border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4 cursor-pointer hover:bg-secondary/10 -m-2 p-2 rounded-md transition-colors" onClick={() => onOpenClient(seance)}>
        <div className={`w-14 h-14 rounded-md flex flex-col items-center justify-center flex-shrink-0 ${st.dot}`}>
          <span className="text-[10px] font-semibold text-white uppercase">{parseDateLocal(rdv.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
          <span className="font-heading text-xl font-bold text-white leading-none">{parseDateLocal(rdv.date).getDate()}</span>
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
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statutStyle.color}`}><Icon className="w-3.5 h-3.5" /> {statutStyle.label}</span>
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
