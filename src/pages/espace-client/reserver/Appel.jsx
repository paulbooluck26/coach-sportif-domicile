import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, parseDateLocal } from "@/lib/creneaux";
import CalendrierDispo from "@/components/CalendrierDispo";
import { Link } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Clock, CalendarDays, Loader2, PhoneCall } from "lucide-react";

export default function Appel() {
  const { user } = useAuth();
  const { recurrentes, blocages, reservees, loading } = useCreneaux();
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const slots = date ? creneauxDisponibles(parseDateLocal(date), recurrentes, reservees) : [];

  const confirmer = async () => {
    setSubmitting(true);
    try {
      await base44.entities.DemandeContact.create({
        name: user.full_name || user.email,
        email: user.email,
        type_demande: "appel_decouverte",
        statut: "appel_confirme",
        message: "Appel découverte réservé depuis l'espace client.",
        date_souhaitee: date,
        heure_souhaitee: heure,
      });
      setDone({ date, heure });
    } catch (e) {
      alert("Erreur lors de la réservation. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Appel réservé</h2>
          <p className="text-foreground/60 mb-6">Votre coach vous contactera au créneau choisi pour un échange de 30 minutes.</p>
          <div className="bg-secondary/10 rounded-xl p-5 text-left space-y-2 mb-6">
            <p className="flex items-center gap-2 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {parseDateLocal(done.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="flex items-center gap-2 text-sm text-foreground/80"><Clock className="w-4 h-4 text-accent" /> {done.heure}</p>
            <p className="flex items-center gap-2 text-sm text-foreground/80"><PhoneCall className="w-4 h-4 text-accent" /> Appel découverte gratuit</p>
          </div>
          <Link to="/espace-client" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm w-full">Mon espace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/espace-client/reserver" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Réserver</Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Appel découverte</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Réserver un appel gratuit</h1>
        <p className="text-sm text-muted-foreground mt-2">Un échange de 30 minutes pour discuter de votre projet et définir l'accompagnement adapté.</p>
      </div>

      {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div> : (
        <CalendrierDispo recurrentes={recurrentes} blocages={blocages} reservees={reservees} value={date} onChange={setDate} />
      )}
      {date && !loading && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Créneaux le {parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          {slots.length === 0 ? <p className="text-sm text-muted-foreground">Aucun créneau disponible. Choisissez une autre date.</p> : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(h => <button key={h} onClick={() => setHeure(h)} className={`py-3 rounded-xl text-sm font-medium border ${heure === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-accent text-foreground"}`}>{h}</button>)}
            </div>
          )}
        </div>
      )}
      {date && heure && (
        <button onClick={confirmer} disabled={submitting} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Réservation...</> : "Confirmer mon appel"}
        </button>
      )}
    </div>
  );
}