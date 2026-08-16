import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateStr } from "@/lib/creneaux";
import { styleFor, timeToMinutes } from "@/lib/agendaEvents";

const HEURE_DEBUT = 6;
const HEURE_FIN = 22;
const PX_PAR_HEURE = 56;

function debutSemaine(date) {
  const d = new Date(date);
  const jour = (d.getDay() + 6) % 7; // lundi = 0
  d.setDate(d.getDate() - jour);
  return d;
}

export default function CalendarWeekView({ date, onDateChange, events, onOpenEvent }) {
  const lundi = debutSemaine(date);
  const jours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lundi);
    d.setDate(lundi.getDate() + i);
    return d;
  });
  const todayKey = dateStr(new Date());

  const heures = [];
  for (let h = HEURE_DEBUT; h <= HEURE_FIN; h++) heures.push(h);

  const changeWeek = (delta) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta * 7);
    onDateChange(d);
  };

  const eventsByDay = {};
  jours.forEach((j) => { eventsByDay[dateStr(j)] = events.filter((e) => e.date === dateStr(j)); });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-secondary rounded-md"><ChevronLeft className="w-5 h-5 text-foreground" /></button>
        <div className="text-center">
          <p className="font-heading font-semibold text-foreground capitalize">
            {jours[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} – {jours[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          <button onClick={() => onDateChange(new Date())} className="text-xs text-accent hover:underline">Cette semaine</button>
        </div>
        <button onClick={() => changeWeek(1)} className="p-2 hover:bg-secondary rounded-md"><ChevronRight className="w-5 h-5 text-foreground" /></button>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: "760px" }}>
          {/* En-têtes des jours */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border">
            <div />
            {jours.map((j) => (
              <div key={dateStr(j)} className={`text-center py-2.5 ${dateStr(j) === todayKey ? "bg-secondary/10" : ""}`}>
                <p className="text-[10px] uppercase text-muted-foreground">{j.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
                <p className={`font-heading font-bold text-sm ${dateStr(j) === todayKey ? "text-accent" : "text-foreground"}`}>{j.getDate()}</p>
              </div>
            ))}
          </div>

          {/* Grille avec créneaux */}
          <div className="relative grid grid-cols-[56px_repeat(7,1fr)]" style={{ height: `${(HEURE_FIN - HEURE_DEBUT + 1) * PX_PAR_HEURE}px` }}>
            {/* Colonne des heures */}
            <div className="relative">
              {heures.map((h) => (
                <div key={h} className="absolute left-0 right-0 border-t border-border" style={{ top: `${(h - HEURE_DEBUT) * PX_PAR_HEURE}px` }}>
                  <span className="text-[10px] text-muted-foreground pl-1 -mt-1.5 block">{String(h).padStart(2, "0")}h</span>
                </div>
              ))}
            </div>

            {/* Colonnes des jours */}
            {jours.map((j) => {
              const key = dateStr(j);
              return (
                <div key={key} className={`relative border-l border-border ${key === todayKey ? "bg-secondary/5" : ""}`}>
                  {heures.map((h) => (
                    <div key={h} className="absolute left-0 right-0 border-t border-border" style={{ top: `${(h - HEURE_DEBUT) * PX_PAR_HEURE}px` }} />
                  ))}
                  {(eventsByDay[key] || []).map((ev) => {
                    const startMin = timeToMinutes(ev.time) - HEURE_DEBUT * 60;
                    const top = (startMin / 60) * PX_PAR_HEURE;
                    const height = Math.max((ev.duree / 60) * PX_PAR_HEURE - 2, 24);
                    const st = styleFor(ev.type);
                    return (
                      <button
                        key={`${ev.kind}-${ev.id}`}
                        onClick={() => onOpenEvent(ev)}
                        className={`absolute left-0.5 right-0.5 rounded-md border-l-2 px-1.5 py-0.5 text-left overflow-hidden hover:brightness-95 transition-all ${st.bg} ${st.border} ${st.text}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        title={`${ev.time} · ${ev.label}`}
                      >
                        <p className="text-[10px] font-semibold leading-tight">{ev.time}</p>
                        <p className="text-[11px] font-medium truncate leading-tight">{ev.label}</p>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
