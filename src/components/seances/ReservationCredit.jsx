import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, parseDateLocal } from "@/lib/creneaux";
import { reserverSeanceAvecCredit } from "@/lib/carnetSeances";
import CalendrierDispo from "@/components/CalendrierDispo";
import { X, ChevronRight, CheckCircle2, Loader2, Clock, MapPin, CalendarDays } from "lucide-react";

export default function ReservationCredit({ carnets, adresse, onClose, onReserved }) {
  const { user } = useAuth();
  const { recurrentes, blocages, reservees, loading } = useCreneaux();
  const [carnetId, setCarnetId] = useState(carnets[0]?.id || null);
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  const slots = date ? creneauxDisponibles(parseDateLocal(date), recurrentes, reservees) : [];

  const [erreur, setErreur] = useState("");

  const confirmer = async () => {
    if (!carnetId || !date || !heure) return;
    setSubmitting(true);
    setErreur("");
    try {
      const { seance } = await reserverSeanceAvecCredit({ user, carnetId, date, heure, location: adresse || "Domicile" });
      setConfirmed({ seance, date, heure });
    } catch (e) {
      setErreur(e.message || "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="bg-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h3 className="font-heading font-semibold text-foreground">{confirmed ? "Séance réservée" : "Réserver une séance"}</h3>
          <button onClick={() => (confirmed ? onReserved() : onClose())} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {confirmed ? (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7 text-accent" /></div>
            <p className="font-heading text-lg font-bold text-foreground mb-1">Créneau confirmé</p>
            <p className="text-sm text-foreground/60 mb-5">Votre séance a été réservée avec votre crédit.</p>
            <div className="bg-secondary/10 rounded-xl p-4 text-left space-y-2 mb-5">
              <p className="flex items-center gap-2 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {parseDateLocal(confirmed.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
              <p className="flex items-center gap-2 text-sm text-foreground/80"><Clock className="w-4 h-4 text-accent" /> {confirmed.heure} · 60 min</p>
              {adresse && <p className="flex items-center gap-2 text-sm text-foreground/80"><MapPin className="w-4 h-4 text-accent" /> {adresse}</p>}
            </div>
            <button onClick={onReserved} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm">Voir mes séances</button>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {carnets.length > 1 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Utiliser un crédit</p>
                <div className="space-y-2">
                  {carnets.map((c) => (
                    <button key={c.id} onClick={() => setCarnetId(c.id)} className={`w-full text-left border rounded-xl p-3 flex items-center justify-between ${carnetId === c.id ? "border-accent bg-accent/5" : "border-border"}`}>
                      <span className="text-sm font-medium text-foreground">{c.offre_titre}</span>
                      <span className="text-xs text-muted-foreground">{c.nb_seances_restantes}/{c.nb_seances_total} restantes</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
            ) : (
              <CalendrierDispo recurrentes={recurrentes} blocages={blocages} reservees={reservees} value={date} onChange={setDate} />
            )}
            {date && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Créneaux le {parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun créneau disponible. Choisissez une autre date.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((h) => (
                      <button key={h} onClick={() => setHeure(h)} className={`py-2.5 rounded-xl text-sm font-medium border ${heure === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>{h}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {erreur && <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{erreur}</p>}
            <button onClick={confirmer} disabled={!carnetId || !date || !heure || submitting} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Réservation...</> : <>Confirmer le créneau <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
