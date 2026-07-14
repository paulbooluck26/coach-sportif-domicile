import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const JOURS_COURTS = ["L", "M", "M", "J", "V", "S", "D"];

const STATUS_CONFIG = {
  faite: { bg: "bg-secondary", text: "text-white" },
  manquee: { bg: "bg-destructive", text: "text-white" },
  a_venir: { bg: "bg-accent", text: "text-accent-foreground" },
};

function dayStatus(projs) {
  if (projs.length === 0) return null;
  if (projs.every(p => p.status === "faite")) return "faite";
  if (projs.some(p => p.status === "manquee")) return "manquee";
  if (projs.some(p => p.status === "a_venir")) return "a_venir";
  return null;
}

export default function ProgrammeCalendar({ projections, onDayClick }) {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = calMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    cellDate.setHours(0, 0, 0, 0);
    const isoDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayProjections = projections.filter(p => p.date === isoDate);
    cells.push({ d, date: isoDate, projections: dayProjections, isToday: cellDate.getTime() === today.getTime() });
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} className="p-2 hover:bg-secondary rounded-md">
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <p className="font-heading font-semibold text-foreground capitalize">{monthName}</p>
        <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} className="p-2 hover:bg-secondary rounded-md">
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {JOURS_COURTS.map((w, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-2">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const st = dayStatus(cell.projections);
          const cfg = st ? STATUS_CONFIG[st] : null;
          const hasSessions = cell.projections.length > 0;
          return (
            <button
              key={i}
              disabled={!hasSessions}
              onClick={() => hasSessions && onDayClick(cell.date, cell.projections)}
              className={`aspect-square rounded-md text-sm font-medium transition-all relative ${
                cell.isToday ? "ring-2 ring-primary" : ""
              } ${hasSessions ? "hover:scale-105 cursor-pointer" : "cursor-default"} ${
                cfg ? `${cfg.bg} ${cfg.text}` : "text-foreground hover:bg-muted"
              }`}
            >
              {cell.d}
              {hasSessions && cell.projections.length > 1 && (
                <span className="absolute top-0.5 right-0.5 text-[9px] font-bold opacity-80">{cell.projections.length}</span>
              )}
              {hasSessions && cell.projections.some(p => p.deplacee) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-500" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary" /> Faite</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-destructive" /> À rattraper</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-accent" /> À venir</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Reportée</span>
      </div>
    </div>
  );
}