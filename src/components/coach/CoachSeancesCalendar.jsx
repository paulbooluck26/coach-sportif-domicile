import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, PhoneCall, Dumbbell } from "lucide-react";
import { parseDateLocal, dateStr } from "@/lib/creneaux";
import { styleFor } from "@/lib/agendaEvents";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function CoachSeancesCalendar({ seances = [], appels = [], onOpenClient, onOpenDemande }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(() => dateStr(new Date()));

  // Un rendez-vous annulé n'a plus sa place dans le calendrier — seule la
  // vue Liste (onglet "Annulés") continue de le montrer.
  const seancesActives = seances.filter((s) => s.status !== "cancelled");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const todayKey = dateStr(new Date());

  const seancesByDate = {};
  seancesActives.forEach(s => { if (s.date) (seancesByDate[s.date] ||= []).push(s); });
  const appelsByDate = {};
  appels.forEach(d => { if (d.date_souhaitee) (appelsByDate[d.date_souhaitee] ||= []).push(d); });

  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = cursor.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateStr(new Date(year, month, d));
    cells.push({ d, key, isToday: key === todayKey, nbSeances: (seancesByDate[key] || []).length, nbAppels: (appelsByDate[key] || []).length });
  }

  const events = [
    ...(seancesByDate[selected] || []).map(s => ({ type: "seance", sessionType: s.session_type, time: s.time || "", label: s.client_name || "Client", data: s })),
    ...(appelsByDate[selected] || []).map(a => ({ type: "appel", sessionType: "appel_decouverte", time: a.heure_souhaitee || "", label: a.name || "Client", data: a })),
  ].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 hover:bg-secondary rounded-md"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
          <p className="font-heading font-semibold text-foreground capitalize text-lg">{monthName}</p>
          <button type="button" onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 hover:bg-secondary rounded-md"><ChevronRight className="w-5 h-5 text-foreground" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {JOURS.map((j, i) => <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-2">{j}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />;
            const sel = selected === cell.key;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(cell.key)}
                className={`aspect-square rounded-lg p-1.5 flex flex-col items-start justify-start text-sm font-medium transition-colors border ${sel ? "bg-primary text-primary-foreground border-primary" : cell.isToday ? "bg-secondary/10 border-secondary text-foreground" : "bg-background border-border hover:border-accent/50 text-foreground"}`}
              >
                <span>{cell.d}</span>
                <div className="flex gap-1 mt-auto">
                  {cell.nbSeances > 0 && <span className={`w-2 h-2 rounded-full ${sel ? "bg-primary-foreground" : "bg-secondary"}`} title={`${cell.nbSeances} séance(s)`} />}
                  {cell.nbAppels > 0 && <span className={`w-2 h-2 rounded-full ${sel ? "bg-primary-foreground/70" : "bg-accent"}`} title={`${cell.nbAppels} appel(s)`} />}
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-5 mt-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Séance à domicile</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Appel découverte</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading font-semibold text-foreground mb-4 capitalize">{parseDateLocal(selected).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</h3>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun événement ce jour.</p>
        ) : (
          <div className="space-y-2">
            {events.map((ev, idx) => {
              const st = styleFor(ev.sessionType);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => ev.type === "seance" ? onOpenClient(ev.data) : onOpenDemande(ev.data)}
                  className={`w-full flex items-center gap-3 border rounded-lg p-3 text-left hover:brightness-95 transition-all ${st.bg} ${st.border}`}
                >
                  <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${st.dot} text-white`}>
                    {ev.type === "seance" ? <Dumbbell className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ev.label}</p>
                    <p className="text-xs text-muted-foreground">{st.label}</p>
                  </div>
                  {ev.time && <span className="flex items-center gap-1 text-sm text-foreground/70 shrink-0"><Clock className="w-3.5 h-3.5" /> {ev.time}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
