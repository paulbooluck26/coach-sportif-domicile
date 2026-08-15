import { CalendarPlus } from "lucide-react";
import { downloadICS } from "@/lib/calendarExport";

// Bouton "Ajouter à mon agenda" — génère un .ics universel (Google, Apple, Outlook).
// Props: `seance` ({ titre, objectif/description }), `date` (ISO yyyy-mm-dd),
//        `dureeMin` (optionnel), `programmeName` (optionnel), `url` (lien direct séance).
export default function AddToCalendarButton({ seance, date, dureeMin, programmeName, url, className }) {
  if (!seance || !date) return null;

  const handleAdd = () => {
    const titre = `PHYSIS COACHING - ${seance.titre || "Séance"}`;
    const parts = [];
    if (programmeName) parts.push(`Programme : ${programmeName}`);
    if (seance.objectif || seance.description) parts.push(`Objectif : ${seance.objectif || seance.description}`);
    parts.push(`Durée prévue : ${dureeMin || 45} min`);
    if (url) parts.push(`Lien vers la séance : ${url}`);
    downloadICS(
      { title: titre, start: new Date(date + "T09:00:00"), durationMin: dureeMin || 45, description: parts.join("\n"), url },
      `seance-${date}.ics`
    );
  };

  return (
    <button onClick={handleAdd} type="button" className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${className || "border-border text-foreground hover:border-accent"}`}>
      <CalendarPlus className="w-3.5 h-3.5" /> Ajouter à mon agenda
    </button>
  );
}
