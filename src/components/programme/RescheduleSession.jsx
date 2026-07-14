import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { CalendarClock, Loader2 } from "lucide-react";

export default function RescheduleSession({ projection, onRescheduled }) {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!user || !date) return;
    setSaving(true);
    try {
      await base44.entities.SeanceDeplacee.create({
        client_id: user.id,
        seance_programme_id: projection.seance.id,
        seance_titre: projection.seance.titre,
        date_prevue: projection.date,
        nouvelle_date: date,
      });
      onRescheduled?.();
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="mt-1">
      <p className="text-xs text-muted-foreground mb-2">Vous avez raté cette séance ? Déplacez-la à une autre date pour la rattraper.</p>
      <div className="flex flex-col sm:flex-row sm:items-end gap-2">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Nouvelle date</label>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          />
        </div>
        <button
          onClick={handle}
          disabled={saving || !date}
          className="bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />} Déplacer la séance
        </button>
      </div>
    </div>
  );
}