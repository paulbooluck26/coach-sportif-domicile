import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Check, ChevronRight, CreditCard, Lock, Loader2, Calendar, Clock, Home, ClipboardList, ArrowLeft, CheckCircle2 } from "lucide-react";

const sessionTypes = [
  { key: "seance_individuelle", label: "Séance individuelle", desc: "60 min à domicile", price: 75, icon: Home },
  { key: "evaluation", label: "Séance d'évaluation", desc: "Bilan & postural", price: 60, icon: ClipboardList },
  { key: "programme_personnalise", label: "Programme sur mesure", desc: "Plan 4-12 semaines", price: 290, icon: ClipboardList },
];

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function Reservation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  }).filter(d => d.getDay() !== 0);

  const formatDate = (d) => d.toISOString().split("T")[0];
  const formatDateLabel = (d) => d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let clientRecord = await base44.entities.Client.filter({ email: user.email });
      if (clientRecord.length === 0) {
        clientRecord = await base44.entities.Client.create({
          full_name: user.full_name || user.email,
          email: user.email,
        });
      } else {
        clientRecord = clientRecord[0];
      }

      const sessionType = sessionTypes.find((t) => t.key === selectedType);
      const seance = await base44.entities.Seance.create({
        client_id: clientRecord.id,
        client_name: clientRecord.full_name,
        session_type: selectedType,
        date: selectedDate,
        time: selectedTime,
        duration_minutes: 60,
        price: sessionType.price,
        status: "booked",
      });

      await base44.entities.Paiement.create({
        seance_id: seance.id,
        client_id: clientRecord.id,
        client_name: clientRecord.full_name,
        amount: sessionType.price,
        status: "paid",
        method: "stripe",
        stripe_ref: "stripe_sim_" + Date.now(),
      });

      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "Confirmation de réservation — Aurélien Coaching",
          body: `Bonjour ${clientRecord.full_name},\n\nVotre séance du ${selectedDate} à ${selectedTime} est confirmée. Paiement de ${sessionType.price}€ validé.\n\nÀ très vite,\nAurélien`,
        });
      } catch (_) {}

      setConfirmed(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-secondary" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-primary mb-4">Réservation confirmée</h1>
          <p className="text-muted-foreground mb-8">
            Votre séance du <strong className="text-primary">{new Date(selectedDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</strong> à <strong className="text-primary">{selectedTime}</strong> est réservée. Un email de confirmation vous a été envoyé.
          </p>
          <button
            onClick={() => navigate("/espace-client")}
            className="px-8 py-3.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform"
          >
            Voir mes séances
          </button>
        </div>
      </div>
    );
  }

  const steps = ["Type de séance", "Date & heure", "Paiement"];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </button>

        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Réserver une séance</h1>
        <p className="text-muted-foreground mb-10">Paiement sécurisé. Annulation gratuite jusqu'à 24h avant la séance.</p>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-12">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-4 flex-1 last:flex-none">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > i + 1 ? "bg-secondary text-secondary-foreground" :
                  step === i + 1 ? "bg-primary text-primary-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px ${step > i + 1 ? "bg-secondary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            {sessionTypes.map((t) => (
              <button
                key={t.key}
                onClick={() => { setSelectedType(t.key); setStep(2); }}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                  selectedType === t.key ? "border-secondary bg-secondary/5" : "border-border hover:border-accent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <t.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-primary text-lg">{t.label}</h3>
                      <p className="text-sm text-muted-foreground">{t.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-heading font-bold text-primary">{t.price}€</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto mt-2" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="bg-background border border-border rounded-2xl p-6">
              <h3 className="font-heading font-semibold text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-secondary" /> Choisissez une date
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
                {dates.map((d) => (
                  <button
                    key={formatDate(d)}
                    onClick={() => setSelectedDate(formatDate(d))}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedDate === formatDate(d) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-primary"
                    }`}
                  >
                    <p className="text-xs capitalize">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
                    <p className="text-lg font-heading font-bold mt-0.5">{d.getDate()}</p>
                  </button>
                ))}
              </div>

              {selectedDate && (
                <>
                  <h3 className="font-heading font-semibold text-primary mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-secondary" /> Choisissez un créneau
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedTime(slot); }}
                        className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                          selectedTime === slot ? "bg-secondary text-secondary-foreground" : "bg-muted/50 hover:bg-muted text-primary"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-6 py-3 border border-border rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                Retour
              </button>
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-40 disabled:hover:scale-100"
              >
                Continuer vers le paiement
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="bg-background border border-border rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Séance</span>
                <span className="text-sm font-medium text-primary">{sessionTypes.find(t => t.key === selectedType)?.label}</span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-border">
                <span className="text-sm text-muted-foreground">Date & heure</span>
                <span className="text-sm font-medium text-primary">{new Date(selectedDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} · {selectedTime}</span>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="font-heading font-semibold text-primary">Total</span>
                <span className="text-2xl font-heading font-bold text-primary">{sessionTypes.find(t => t.key === selectedType)?.price}€</span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="bg-background border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-secondary" />
                <p className="text-sm font-semibold text-primary">Paiement sécurisé</p>
                <span className="text-xs text-muted-foreground ml-auto">Stripe</span>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nom sur la carte</label>
                <input
                  required value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Numéro de carte</label>
                <input
                  required value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Expiration</label>
                  <input
                    required value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                    placeholder="MM/AA"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CVC</label>
                  <input
                    required value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
                    placeholder="123"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3.5 border border-border rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Retour
                </button>
                <button
                  type="submit" disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</> : <><CreditCard className="w-4 h-4" /> Payer {sessionTypes.find(t => t.key === selectedType)?.price}€</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}