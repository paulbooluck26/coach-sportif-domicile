import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { dateStr } from "@/lib/creneaux";
import { styleFor, timeToMinutes } from "@/lib/agendaEvents";

const HEURE_DEBUT = 6; // 06:00
const HEURE_FIN = 22; // 22:00
const PX_PAR_HEURE = 64;

export default function CalendarDayView({ date, onDateChange, events, onOpenEvent }) {
  const dayEvents = events
    .filter((e) => e.date === dateStr(date))
    .sort((a, b) => a.time.localeCompare(b.time));

  const heures = [];
  for (let h = HEURE_DEBUT; h <= HEURE_FIN; h++) heures.push(h);

  const changeDay = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    onDateChange(d);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => changeDay(-1)} className="p-2 hover:bg-secondary rounded-md"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
        <div className="text-center">
          <p className="font-heading font-semibold text-foreground capitalize">{date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          <button onClick={() => onDateChange(new Date())} className="text-xs text-accent hover:underline">Aujourd'hui</button>
        </div>
        <button onClick={() => changeDay(1)} className="p-2 hover:bg-secondary rounded-md"><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      {dayEvents.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-10">Aucun rendez-vous ce jour-là.</p>
      )}

      <div className="relative overflow-x-auto">
        <div className="relative" style={{ height: `${(HEURE_FIN - HEURE_DEBUT + 1) * PX_PAR_HEURE}px`, minWidth: "320px" }}>
          {heures.map((h) => (
            <div
              key={h}
              className="absolute left-0 right-0 flex items-start border-t border-border"
              style={{ top: `${(h - HEURE_DEBUT) * PX_PAR_HEURE}px` }}
            >
              <span className="text-xs text-muted-foreground w-14 pl-2 -mt-2 bg-card">{String(h).padStart(2, "0")}:00</span>
            </div>
          ))}

          {dayEvents.map((ev) => {
            const startMin = timeToMinutes(ev.time) - HEURE_DEBUT * 60;
            const top = (startMin / 60) * PX_PAR_HEURE;
            const height = Math.max((ev.duree / 60) * PX_PAR_HEURE - 4, 28);
            const st = styleFor(ev.type);
            return (
              <button
                key={`${ev.kind}-${ev.id}`}
                onClick={() => onOpenEvent(ev)}
                className={`absolute left-16 right-2 rounded-lg border-l-4 px-3 py-1.5 text-left overflow-hidden hover:brightness-95 transition-all ${st.bg} ${st.border} ${st.text}`}
                style={{ top: `${top}px`, height: `${height}px` }}
              >
                <p className="text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> {ev.time}</p>
                <p className="text-sm font-medium truncate">{ev.label}</p>
                {height > 44 && <p className="text-xs text-foreground/60 truncate">{st.label}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
