import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles } from "@/lib/creneaux";
import CalendrierDispo from "@/components/CalendrierDispo";
import { Loader2, CheckCircle2, CalendarDays, Clock, Phone, ChevronRight } from "lucide-react";

export default function ProgrammeCallBooking({ programmeNom, userEmail, userName }) {
  const { recurrentes, blocages, reservees, loading } = useCreneaux();
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const slots = date ? creneauxDisponibles(new Date(date + "T00:00:00"), recurrentes, reservees) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await base44.entities.DemandeContact.create({
        name: userName,
        email: userEmail,
        phone,
        goal: `Appel de démarrage — Programme ${programmeNom}`,
        message: message || `Appel de démarrage suite à l'achat du programme ${programmeNom}.`,
        statut: "appel_a_passer",
        type_demande: "appel_decouverte",
        date_souhaitee: date,
        heure_souhaitee: heure,
      });
      try {
        await base44.integrations.Core.SendEmail({
          to: userEmail,
          subject: "Confirmation de votre appel de démarrage — PHYSIS COACHING",
          body: `Bonjour,\n\nVotre appel de démarrage pour le programme ${programmeNom} est programmé le ${new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à ${heure}.\n\nVotre coach vous contactera au numéro indiqué.\n\nÀ très vite,\nPHYSIS COACHING`,
        });
      } catch {}
      setDone(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-secondary" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Appel programmé</h3>
        <p className="text-foreground/70 mb-1 capitalize">
          {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <p className="text-foreground/70 mb-4">{heure} · 30 min</p>
        <p className="text-sm text-muted-foreground">Un email de confirmation a été envoyé à {userEmail}. Votre coach vous contactera à l'heure prévue pour démarrer votre programme.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 sm:p-8">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 text-secondary" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold text-foreground">Réservez votre appel de démarrage</h3>
          <p className="text-sm text-muted-foreground mt-0.5">30 min en visio ou par téléphone, pour bien démarrer votre programme {programmeNom}.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="mt-6">
            <CalendrierDispo recurrentes={recurrentes} blocages={blocages} reservees={reservees} value={date} onChange={setDate} />
          </div>

          {date && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-secondary" /> Créneaux disponibles le {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour. Choisissez une autre date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHeure(h)}
                      className={`py-3 rounded-md text-sm font-medium border transition-colors ${heure === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-accent text-foreground"}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {heure && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 animate-fade-in">
              <div className="bg-secondary/20 rounded-md p-4 space-y-1.5">
                <p className="flex items-center gap-2 text-sm text-foreground/80">
                  <CalendarDays className="w-4 h-4 text-secondary" /> {new Date(date + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
                <p className="flex items-center gap-2 text-sm text-foreground/80">
                  <Clock className="w-4 h-4 text-secondary" /> {heure} · 30 min
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-border bg-background focus:border-accent focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Message (optionnel)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Précisez vos objectifs, vos contraintes horaires..."
                  className="w-full px-4 py-3 rounded-md border border-border bg-background focus:border-accent focus:outline-none text-sm resize-none"
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-secondary text-secondary-foreground py-3.5 rounded-md font-semibold text-sm hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : <>Confirmer mon appel de démarrage <ChevronRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Préférez-vous réserver plus tard ?{" "}
            <a href="/appel-decouverte" className="text-secondary font-medium underline-offset-2 hover:underline">Utilisez la page d'appel découverte</a>.
          </p>
        </>
      )}
    </div>
  );
}
