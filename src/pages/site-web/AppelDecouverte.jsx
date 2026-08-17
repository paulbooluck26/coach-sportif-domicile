import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, parseDateLocal } from "@/lib/creneaux";
import CalendrierDispo from "@/components/CalendrierDispo";
import { ArrowLeft, CheckCircle2, Loader2, Phone, Clock, CalendarDays, User, Mail, MessageSquare } from "lucide-react";
import { envoyerEmail } from "@/lib/emailSender";

export default function AppelDecouverte() {
  const navigate = useNavigate();
  const { recurrentes, blocages, reservees, loading } = useCreneaux();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [form, setForm] = useState({ nom: "", email: "", phone: "", goal: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const slots = date ? creneauxDisponibles(parseDateLocal(date), recurrentes, reservees) : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await base44.entities.DemandeContact.create({
        name: form.nom,
        email: form.email,
        phone: form.phone,
        goal: form.goal,
        message: form.message,
        statut: "appel_a_passer",
        type_demande: "appel_decouverte",
        date_souhaitee: date,
        heure_souhaitee: heure,
      });

      try {
        await envoyerEmail("appel_decouverte", form.email, {
          client_prenom: form.nom,
          date: parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }),
          heure,
          telephone: form.phone,
        });
      } catch {}

      setConfirmed(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">Appel programmé</h1>
          <p className="text-muted-foreground mb-8">
            Votre appel découverte de 30 minutes est prévu le{" "}
            <strong className="text-primary">{parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</strong>{" "}
            à <strong className="text-primary">{heure}</strong>. Un email de confirmation vous a été envoyé.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Phone className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">Appel découverte gratuit</h1>
            <p className="text-sm text-muted-foreground">30 minutes, sans engagement, en visio ou par téléphone.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 my-10">
          {["Créneau", "Vos coordonnées"].map((label, i) => (
            <div key={i} className="flex items-center gap-4 flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > i + 1 ? "bg-secondary text-secondary-foreground" :
                  step === i + 1 ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < 1 && <div className={`flex-1 h-px ${step > i + 1 ? "bg-secondary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <CalendrierDispo
                  recurrentes={recurrentes}
                  blocages={blocages}
                  reservees={reservees}
                  value={date}
                  onChange={setDate}
                />
                {date && (
                  <div>
                    <p className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary" /> Créneaux disponibles le {parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                    {slots.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {slots.map((h) => (
                          <button
                            key={h}
                            onClick={() => { setHeure(h); setStep(2); }}
                            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                              heure === h ? "bg-secondary text-secondary-foreground" : "bg-muted/50 hover:bg-muted text-primary"
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
            <div className="bg-background border border-border rounded-2xl p-6 space-y-3">
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4 text-secondary" />
                {parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <p className="flex items-center gap-3 text-sm text-muted-foreground">
                <Clock className="w-4 h-4 text-secondary" /> {heure} · 30 min
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field icon={User} label="Nom complet" value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} required />
              <Field icon={Phone} label="Téléphone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            </div>
            <Field icon={Mail} label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            <Field icon={MessageSquare} label="Votre objectif / votre structure" value={form.goal} onChange={(v) => setForm({ ...form, goal: v })} placeholder="Ex : club de rugby, reprise du sport, préparation semi-marathon..." />
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message (optionnel)</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={3}
                placeholder="Précisez vos questions ou besoins..."
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors resize-none"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="px-6 py-3 border border-border rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                Retour
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50"
              >
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi…</> : "Confirmer l'appel gratuit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}{required && " *"}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
        />
      </div>
    </div>
  );
}
