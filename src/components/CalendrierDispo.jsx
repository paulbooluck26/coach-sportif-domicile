import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateStr, dateBloquee } from "@/lib/creneaux";

const JOURS_COURTS = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * Calendrier mensuel réutilisable.
 * Props: recurrentes, blocages, reservees (disponibilités + séances),
 * value (date sélectionnée au format ISO), onChange, minDate (optionnel).
 */
export default function CalendrierDispo({ recurrentes = [], blocages = [], reservees = [], value, onChange }) {
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
    const isPast = cellDate < today;
    const isBlocked = dateBloquee(cellDate, blocages);
    const dispo = recurrentes.filter((r) => r.jour_semaine === cellDate.getDay());
    const hasDispo = dispo.length > 0;
    const isDisabled = isPast || isBlocked || !hasDispo;
    cells.push({ d, date: dateStr(cellDate), isPast, isBlocked, hasDispo, isDisabled });
  }

  const isSelected = (date) => date === value;

  const canGoPrev = new Date(year, month - 1, 1) >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={() => setCalMonth(new Date(year, month - 1, 1))}
          className="p-2 hover:bg-secondary rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <p className="font-heading font-semibold text-foreground capitalize">{monthName}</p>
        <button
          type="button"
          onClick={() => setCalMonth(new Date(year, month + 1, 1))}
          className="p-2 hover:bg-secondary rounded-md"
        >
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
          const selected = isSelected(cell.date);
          return (
            <button
              key={i}
              type="button"
              disabled={cell.isDisabled}
              onClick={() => onChange(cell.date)}
              className={`aspect-square rounded-md text-sm font-medium transition-colors ${
                selected ? "bg-primary text-primary-foreground" : cell.isDisabled ? "cal-day-disabled" : "hover:bg-secondary text-foreground"
              }`}
            >
              {cell.d}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Les dates grisées sont indisponibles : passées, bloquées ou sans créneaux définis.
      </p>
    </div>
  );
}