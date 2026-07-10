import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles } from "@/lib/creneaux";
import CalendrierDispo from "@/components/CalendrierDispo";
import { Link, useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, CreditCard, Lock, Loader2, CheckCircle2, CalendarDays, Clock, MapPin, MessageSquare } from "lucide-react";
import { determinerZone, ZONES } from "@/lib/zones";

const TYPES = [
  { id: "seance_individuelle", nom: "Séance individuelle", desc: "60 min à domicile", prix: 70, duree: 60 },
  { id: "evaluation", nom: "Séance d'évaluation", desc: "Bilan initial 45 min", prix: 50, duree: 45 },
];

export default function Reservation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [type, setType] = useState(null);
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [adresse, setAdresse] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [horsZone, setHorsZone] = useState(false);
  const [zoneErreur, setZoneErreur] = useState("");
  const { recurrentes, blocages, reservees, loading: creneauxLoading } = useCreneaux();

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
        if (profiles.length && profiles[0].adresse) setAdresse(profiles[0].adresse);
      } catch {}
    })();
  }, [user]);

  const slots = date ? creneauxDisponibles(new Date(date + "T00:00:00"), recurrentes, reservees) : [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-3">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">Vous devez créer un compte ou vous connecter pour réserver une séance.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm">Se connecter</Link>
            <Link to="/register" className="border border-border px-6 py-3 rounded-md font-semibold text-sm text-foreground">Créer un compte</Link>
          </div>
        </div>
      </div>
    );
  }

  const handlePay = async () => {
    setPaying(true);
    try {
      const typeData = TYPES.find(t => t.id === type);
      const seance = await base44.entities.Seance.create({
        client_id: user.id,
        client_name: user.full_name || user.email,
        session_type: type,
        date,
        time: heure,
        duration_minutes: typeData.duree,
        price: typeData.prix,
        status: "booked",
        location: adresse || "Domicile",
      });
      await base44.entities.Paiement.create({
        seance_id: seance.id,
        client_id: user.id,
        client_name: user.full_name || user.email,
        amount: typeData.prix,
        method: "stripe",
        status: "paid",
        stripe_ref: "SIM-" + Date.now(),
      });
      // ensure client profile exists
      const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
      if (profiles.length === 0) {
        await base44.entities.ClientProfile.create({ user_id: user.id, nom: user.full_name || "", email: user.email, adresse });
      } else if (adresse) {
        await base44.entities.ClientProfile.update(profiles[0].id, { adresse });
      }
      setConfirmed({ seance, typeData });
    } catch (err) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setPaying(false);
    }
  };

  const handleContinuer = () => {
    const adresseFinale = (adresse || "").trim();
    if (!adresseFinale) {
      setZoneErreur("Renseignez votre adresse pour vérifier la zone de déplacement.");
      return;
    }
    setZoneErreur("");
    const zone = determinerZone(adresseFinale);
    if (zone.autoriseReservation) {
      setHorsZone(false);
      setStep(4);
    } else {
      setHorsZone(true);
    }
  };

  if (confirmed) {
    const { seance, typeData } = confirmed;
    return (
      <div className="min-h-screen bg-secondary/20 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full bg-card border border-border rounded-lg p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Réservation confirmée</h1>
          <p className="text-foreground/60 mb-8">Votre paiement de <strong className="text-foreground">{typeData.prix}€</strong> a été validé. Un email de confirmation vous a été envoyé.</p>
          <div className="bg-secondary/40 rounded-md p-6 text-left mb-8 space-y-3">
            <p className="flex items-center gap-3 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {formatDate(seance.date)}</p>
            <p className="flex items-center gap-3 text-sm text-foreground/80"><Clock className="w-4 h-4 text-accent" /> {seance.time} · {seance.duration_minutes} min</p>
            <p className="flex items-center gap-3 text-sm text-foreground/80"><MapPin className="w-4 h-4 text-accent" /> {seance.location}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate("/espace-client/seances")} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm">Voir mes séances</button>
            <button onClick={() => navigate("/espace-client")} className="flex-1 border border-border py-3 rounded-md font-semibold text-sm text-foreground">Tableau de bord</button>
          </div>
        </div>
      </div>
    );
  }

  const steps = ["Séance", "Date & heure", "Détails", "Paiement"];
  const selectedType = TYPES.find(t => t.id === type);

  return (
    <div className="min-h-screen bg-secondary/20">
      <header className="glass-nav px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/espace-client/reserver" className="flex items-center gap-1.5 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"><ChevronLeft className="w-4 h-4" /> Retour</Link>
            <Link to="/" className="font-heading text-xl font-bold text-primary-foreground">The Lab Forge</Link>
          </div>
          <Link to={user ? "/espace-client" : "/login"} className="text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground border border-primary-foreground/20 px-4 py-1.5 rounded-md hover:bg-primary-foreground/10 transition-colors">Mon espace</Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-12">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i + 1 < step ? "bg-accent text-accent-foreground" : i + 1 === step ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${i + 1 < step ? "bg-accent" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-6">Choisissez votre formule</h2>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setStep(2); }} className={`w-full text-left bg-card border rounded-lg p-6 hover:border-accent transition-colors ${type === t.id ? "border-accent ring-1 ring-accent" : "border-border"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-heading font-semibold text-lg text-foreground">{t.nom}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading text-2xl font-bold text-foreground">{t.prix}€</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto mt-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & time */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Choisissez un créneau</h2>
            {creneauxLoading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>
            ) : (
              <CalendrierDispo
                recurrentes={recurrentes}
                blocages={blocages}
                reservees={reservees}
                value={date}
                onChange={setDate}
              />
            )}
            {date && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Créneaux disponibles le {formatDate(date)}</p>
                {slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour. Choisissez une autre date.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(h => (
                      <button key={h} onClick={() => { setHeure(h); setStep(3); }} className={`py-3 rounded-md text-sm font-medium border transition-colors ${heure === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-accent text-foreground"}`}>
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Retour</button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && !horsZone && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Détails de la séance</h2>
            <div className="bg-card border border-border rounded-lg p-6 space-y-3">
              <p className="flex items-center gap-3 text-sm"><CalendarDays className="w-4 h-4 text-accent" /> {formatDate(date)}</p>
              <p className="flex items-center gap-3 text-sm"><Clock className="w-4 h-4 text-accent" /> {heure} · {selectedType.duree} min</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Adresse de la séance</label>
              <input value={adresse} onChange={e => { setAdresse(e.target.value); setZoneErreur(""); setHorsZone(false); }} placeholder="Ex : 12 rue des Boulangers, 68000 Colmar" className="w-full bg-card border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-accent" />
              <p className="text-xs text-muted-foreground mt-2">Indiquez votre adresse pour vérifier la zone de déplacement. Réservation immédiate pour Colmar intra-muros.</p>
              {zoneErreur && <p className="text-xs text-destructive mt-2">{zoneErreur}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"><ChevronLeft className="w-4 h-4" /> Retour</button>
              <button onClick={handleContinuer} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm">Continuer vers le paiement</button>
            </div>
          </div>
        )}

        {/* Step 3: Hors zone */}
        {step === 3 && horsZone && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Détails de la séance</h2>
            <div className="bg-card border border-accent/30 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-foreground">Adresse en dehors de Colmar</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{adresse}</p>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{ZONES.hors_zone.message}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setHorsZone(false)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"><ChevronLeft className="w-4 h-4" /> Modifier mon adresse</button>
              <Link to="/appel-decouverte" className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
                <MessageSquare className="w-4 h-4" /> Discuter de mon projet avec le coach
              </Link>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold text-foreground">Paiement sécurisé</h2>
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div>
                  <p className="font-heading font-semibold text-foreground">{selectedType.nom}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(date)} · {heure}</p>
                </div>
                <p className="font-heading text-2xl font-bold text-foreground">{selectedType.prix}€</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Nom sur la carte</label>
                  <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="Jean Dupont" className="w-full border border-border rounded-md px-4 py-3 focus:outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Numéro de carte</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full border border-border rounded-md pl-10 pr-4 py-3 focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Expiration</label>
                    <input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="MM/AA" className="w-full border border-border rounded-md px-4 py-3 focus:outline-none focus:border-accent" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">CVC</label>
                    <input value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="w-full border border-border rounded-md px-4 py-3 focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Paiement chiffré · Annulation gratuite jusqu'à 24h avant</div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-4 py-3"><ChevronLeft className="w-4 h-4" /> Retour</button>
              <button onClick={handlePay} disabled={paying} className="flex-1 bg-accent text-accent-foreground py-3.5 rounded-md font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2">
                {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <><Lock className="w-4 h-4" /> Payer {selectedType.prix}€</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}