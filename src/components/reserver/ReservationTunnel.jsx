import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, parseDateLocal } from "@/lib/creneaux";
import { determinerZone, ZONES } from "@/lib/zones";
import { finaliserSeancePayante } from "@/lib/reservationFlow";
import CalendrierDispo from "@/components/CalendrierDispo";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, CalendarDays, Clock, MapPin, User, Mail, Phone, Loader2, CheckCircle2, Sparkles, CreditCard, Lock } from "lucide-react";
import { FORGE_OFFRES, TUNNEL_OFFRES, prixDisplay } from "@/lib/forgeOffres";

const SESSION_TYPES = { diagnostic: "evaluation", decouverte: "seance_individuelle" };
const PONCTUEL = ["diagnostic", "decouverte"];

export default function ReservationTunnel({ preselect }) {
  const { user } = useAuth();
  const { recurrentes, blocages, reservees, loading: creneauxLoading } = useCreneaux();
  const [step, setStep] = useState(1);
  const [offreId, setOffreId] = useState(null);
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", adresse: "" });
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [zoneNote, setZoneNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: f.name || user.full_name || "",
        email: f.email || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (preselect?.offreId) {
      setOffreId(preselect.offreId);
      setStep(2);
      setDate(null);
      setHeure(null);
    }
  }, [preselect?.key]);

  const offre = offreId ? FORGE_OFFRES[offreId] : null;
  const ponctuel = offre ? PONCTUEL.includes(offre.id) : false;
  const sessionType = offre ? SESSION_TYPES[offre.id] : null;
  const slots = date ? creneauxDisponibles(parseDateLocal(date), recurrentes, reservees) : [];

  const STEPS = ponctuel ? ["Offre", "Créneau", "Coordonnées", "Paiement"] : ["Offre", "Créneau", "Confirmation"];

  const verifierAdresse = (val) => {
    setForm((f) => ({ ...f, adresse: val }));
    if (val && val.trim().length > 4) {
      const zone = determinerZone(val);
      setZoneNote(zone.autoriseReservation ? "" : ZONES.hors_zone.message);
    } else {
      setZoneNote("");
    }
  };

  const envoyerDemande = async () => {
    setSubmitting(true);
    try {
      const message = `Demande — ${offre.titre} (${prixDisplay(offre)}). Date souhaitée : ${formatDate(date)} à ${heure}. Adresse : ${form.adresse || "non renseignée"}.`;
      await base44.entities.DemandeContact.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        goal: offre.titre,
        message,
        type_demande: "contact",
        statut: "nouveau",
        date_souhaitee: date,
        heure_souhaitee: heure,
      });
      setDone({ type: "demande", offre, date, heure });
    } catch (e) {
      alert("Erreur lors de l'envoi de votre demande. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const payer = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const { seance } = await finaliserSeancePayante({
        user,
        sessionType,
        date,
        heure,
        duree: 60,
        prix: offre.prix,
        location: form.adresse || "Domicile",
        prestationLabel: offre.titre,
      });
      setDone({ type: "seance", offre, date, heure, seance });
    } catch (e) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const { offre, date, heure } = done;
    if (done.type === "seance") {
      return (
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Réservation confirmée</h3>
          <p className="text-foreground/60 mb-8">Votre paiement de <strong className="text-foreground">{offre.prix}€</strong> a été validé. Un email de confirmation vous a été envoyé.</p>
          <div className="bg-secondary/10 rounded-xl p-6 text-left space-y-3 mb-8">
            <p className="flex items-center gap-3 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {formatDate(date)}</p>
            <p className="flex items-center gap-3 text-sm text-foreground/80"><Clock className="w-4 h-4 text-accent" /> {heure} · 60 min</p>
            <p className="flex items-center gap-3 text-sm text-foreground/80"><Sparkles className="w-4 h-4 text-accent" /> {offre.titre} — {prixDisplay(offre)}</p>
            {form.adresse && <p className="flex items-center gap-3 text-sm text-foreground/80"><MapPin className="w-4 h-4 text-accent" /> {form.adresse}</p>}
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/espace-client" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm">Mon espace</Link>
            <a href="/" className="inline-flex items-center gap-2 border border-border px-6 py-3 rounded-full font-semibold text-sm text-foreground">Accueil</a>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-accent" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Demande envoyée</h3>
        <p className="text-foreground/60 mb-8">Votre coach vous recontacte très vite pour confirmer votre <strong className="text-foreground">{offre.titre}</strong>.</p>
        <div className="bg-secondary/10 rounded-xl p-6 text-left space-y-3 mb-8">
          <p className="flex items-center gap-3 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {formatDate(date)}</p>
          <p className="flex items-center gap-3 text-sm text-foreground/80"><Clock className="w-4 h-4 text-accent" /> {heure}</p>
          <p className="flex items-center gap-3 text-sm text-foreground/80"><Sparkles className="w-4 h-4 text-accent" /> {offre.titre} — {prixDisplay(offre)}</p>
        </div>
        <a href="/" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm">Retour à l'accueil</a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold ${i + 1 < step ? "bg-accent text-accent-foreground" : i + 1 === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? "bg-accent" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      {/* Étape 1 — Offre */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Choisissez votre offre</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {TUNNEL_OFFRES.map((id) => {
              const o = FORGE_OFFRES[id];
              const selected = offreId === id;
              return (
                <button
                  key={id}
                  onClick={() => setOffreId(id)}
                  className={`text-left bg-card rounded-2xl p-5 border-2 transition-all ${selected ? "border-secondary ring-1 ring-secondary" : "border-border hover:border-accent/50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading font-semibold text-foreground">{o.titre}</p>
                      {o.sousTitre && <p className="text-xs text-muted-foreground mt-0.5">{o.sousTitre}</p>}
                      {o.duree && <p className="text-xs text-muted-foreground mt-0.5">{o.duree}</p>}
                    </div>
                    <p className="font-heading text-lg font-bold text-foreground whitespace-nowrap">{prixDisplay(o)}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            disabled={!offreId}
            onClick={() => setStep(2)}
            className="w-full mt-2 bg-primary text-primary-foreground py-4 rounded-full font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
          >
            Continuer <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Étape 2 — Créneau */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-foreground">Choisissez un créneau</h2>
            <span className="text-sm font-medium text-muted-foreground">{offre?.titre} — {prixDisplay(offre)}</span>
          </div>
          {creneauxLoading ? (
            <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
          ) : (
            <CalendrierDispo recurrentes={recurrentes} blocages={blocages} reservees={reservees} value={date} onChange={setDate} />
          )}
          {date && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Créneaux disponibles le {formatDate(date)}</p>
              {slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour. Choisissez une autre date.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHeure(h)}
                      className={`py-3 rounded-xl text-sm font-medium border transition-colors ${heure === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-accent text-foreground"}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"><ChevronLeft className="w-4 h-4" /> Retour</button>
            <button
              disabled={!date || !heure}
              onClick={() => setStep(3)}
              className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-full font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Continuer <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Étape 3 — Coordonnées / Confirmation */}
      {step === 3 && offre && (
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">{ponctuel ? "Vos coordonnées" : "Confirmation"}</h2>

          {ponctuel && !user ? (
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-foreground/80 mb-2 font-medium">Connexion requise</p>
              <p className="text-sm text-muted-foreground mb-6">Créez un compte ou connectez-vous pour réserver et payer votre {offre.titre}.</p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold text-sm">Se connecter</Link>
                <Link to="/register" className="border border-border px-6 py-3 rounded-full font-semibold text-sm text-foreground">Créer un compte</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <p className="font-heading font-semibold text-foreground">{offre.titre}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(date)} · {heure}</p>
                  </div>
                  <p className="font-heading text-2xl font-bold text-foreground">{prixDisplay(offre)}</p>
                </div>
                <div className="space-y-3 pt-2">
                  <Field icon={User} label="Nom complet" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Jean Dupont" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field icon={Mail} label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} placeholder="jean@email.com" />
                    <Field icon={Phone} label="Téléphone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} placeholder="06 12 34 56 78" />
                  </div>
                  <Field icon={MapPin} label="Adresse de la séance" value={form.adresse} onChange={verifierAdresse} placeholder="12 rue des Boulangers, 68000 Colmar" />
                </div>
                {zoneNote && (
                  <div className="bg-accent/10 border border-accent/30 rounded-xl p-4 text-sm text-foreground/80 leading-relaxed">{zoneNote}</div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"><ChevronLeft className="w-4 h-4" /> Retour</button>
                {ponctuel ? (
                  <button
                    disabled={!form.name || !form.email}
                    onClick={() => setStep(4)}
                    className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-full font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    Continuer vers le paiement <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    disabled={submitting || !form.name || !form.email}
                    onClick={envoyerDemande}
                    className="flex-1 bg-secondary text-secondary-foreground py-3.5 rounded-full font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : <>Confirmer ma demande</>}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Étape 4 — Paiement (offres ponctuelles) */}
      {step === 4 && ponctuel && offre && user && (
        <div className="space-y-6">
          <h2 className="font-heading text-2xl font-bold text-foreground">Paiement sécurisé</h2>
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <p className="font-heading font-semibold text-foreground">{offre.titre}</p>
                <p className="text-sm text-muted-foreground">{formatDate(date)} · {heure}</p>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{offre.prix}€</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nom sur la carte</label>
                <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="Jean Dupont" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Numéro de carte</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Expiration</label>
                  <input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="MM/AA" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">CVC</label>
                  <input value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Paiement chiffré · Annulation gratuite jusqu'à 24h avant</div>
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"><ChevronLeft className="w-4 h-4" /> Retour</button>
            <button
              disabled={submitting}
              onClick={payer}
              className="flex-1 bg-accent text-accent-foreground py-3.5 rounded-full font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <><Lock className="w-4 h-4" /> Payer {offre.prix}€</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-border rounded-xl pl-10 pr-4 py-3 text-sm bg-background focus:outline-none focus:border-accent"
        />
      </div>
    </div>
  );
}

function formatDate(d) {
  return parseDateLocal(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}