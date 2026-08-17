import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, parseDateLocal } from "@/lib/creneaux";
import { estPonctuel, nbSeancesPourOffre } from "@/lib/carnetSeances";
import { redirigerVersStripe } from "@/lib/stripeCheckout";
import CalendrierDispo from "@/components/CalendrierDispo";
import { FORGE_OFFRES, prixDisplay } from "@/lib/forgeOffres";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin, CreditCard, Lock, Loader2, CheckCircle2, CalendarDays, CalendarPlus, Flame } from "lucide-react";
import { downloadICS } from "@/lib/calendarExport";

const CATALOGUE = ["diagnostic", "transformation", "performance", "forge4", "forge8", "decouverte"];
const SESSION_TYPE = {
  diagnostic: "evaluation",
  decouverte: "seance_individuelle",
  transformation: "seance_individuelle",
  performance: "seance_individuelle",
  forge4: "seance_individuelle",
  forge8: "seance_individuelle",
};

export default function Domicile() {
  const { user } = useAuth();
  const { recurrentes, blocages, reservees, loading } = useCreneaux();
  const [diagDone, setDiagDone] = useState(null);
  const [adresse, setAdresse] = useState("");
  const [step, setStep] = useState("catalogue");
  const [offreId, setOffreId] = useState(null);
  const [date, setDate] = useState(null);
  const [heure, setHeure] = useState(null);
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const [searchParams] = useSearchParams();
  const stripeSessionId = searchParams.get("stripe_session_id");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [seances, profiles] = await Promise.all([
          base44.entities.Seance.filter({ client_id: user.id }, "date"),
          base44.entities.ClientProfile.filter({ user_id: user.id }),
        ]);
        setDiagDone(seances.some(s => s.session_type === "evaluation" && s.status !== "cancelled"));
        if (profiles[0]?.adresse) setAdresse(profiles[0].adresse);
      } catch {
        setDiagDone(false);
      }
    })();
  }, [user]);

  const offre = offreId ? FORGE_OFFRES[offreId] : null;
  const ponctuel = offreId ? estPonctuel(offreId) : false;
  const slots = date ? creneauxDisponibles(parseDateLocal(date), recurrentes, reservees) : [];

  const choisir = (id) => {
    setOffreId(id);
    setDate(null);
    setHeure(null);
    setStep("detail");
  };

  const payer = async () => {
    setPaying(true);
    try {
      // Sauvegarde l'adresse dans le profil avant de partir sur Stripe.
      try {
        const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
        if (profiles[0] && profiles[0].adresse !== adresse) {
          await base44.entities.ClientProfile.update(profiles[0].id, { adresse });
        }
      } catch (_) {}

      if (ponctuel) {
        await redirigerVersStripe({
          nom: offre.titre,
          montant: offre.prix,
          metadata: {
            type: "seance",
            client_id: user.id,
            offre_id: offreId,
            session_type: SESSION_TYPE[offreId],
            date,
            time: heure,
            duration_minutes: "60",
            location: adresse || "Domicile",
            prestation_label: offre.titre,
          },
          successPath: "/espace-client/reserver/domicile",
        });
      } else {
        const total = nbSeancesPourOffre(offreId);
        const abonnement = offreId === "forge4" || offreId === "forge8";
        await redirigerVersStripe({
          nom: offre.titre,
          montant: offre.prix,
          metadata: {
            type: "carnet",
            client_id: user.id,
            offre_id: offreId,
            offre_titre: offre.titre,
            type_carnet: abonnement ? "abonnement" : "pack",
            nb_seances_total: String(total),
          },
          successPath: "/espace-client/reserver/domicile",
        });
      }
    } catch (e) {
      alert("Erreur lors de la préparation du paiement. Veuillez réessayer.");
      setPaying(false);
    }
  };

  if (stripeSessionId) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Paiement confirmé</h2>
          <p className="text-foreground/60 mb-6">Merci ! Votre réservation est en cours de finalisation — retrouvez-la dans quelques instants dans votre espace.</p>
          <Link to="/espace-client/seances" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm inline-block">Voir mes séances</Link>
        </div>
      </div>
    );
  }

  if (diagDone === null) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  if (done) {
    if (done.type === "carnet") {
      const { offre, carnet } = done;
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Crédit de séances activé</h2>
            <p className="text-foreground/60 mb-6">Paiement de <strong className="text-foreground">{offre.prix}€</strong> validé. <strong className="text-foreground">{carnet.nb_seances_total} séances</strong> sont désormais disponibles dans votre espace.</p>
            <div className="bg-secondary/10 rounded-xl p-5 text-left space-y-2 mb-6">
              <p className="flex items-center gap-2 text-sm text-foreground/80"><Flame className="w-4 h-4 text-accent" /> {offre.titre} — {prixDisplay(offre)}</p>
              <p className="flex items-center gap-2 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {carnet.nb_seances_total} séances à réserver à votre rythme</p>
              {adresse && <p className="flex items-center gap-2 text-sm text-foreground/80"><MapPin className="w-4 h-4 text-accent" /> {adresse}</p>}
            </div>
            <Link to="/espace-client/seances" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm w-full">Réserver mes séances</Link>
          </div>
        </div>
      );
    }
    const { offre, date, heure } = done;
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Réservation confirmée</h2>
          <p className="text-foreground/60 mb-6">Paiement de <strong className="text-foreground">{offre.prix}€</strong> validé. Un email de confirmation vous a été envoyé.</p>
          <div className="bg-secondary/10 rounded-xl p-5 text-left space-y-2 mb-6">
            <p className="flex items-center gap-2 text-sm text-foreground/80"><CalendarDays className="w-4 h-4 text-accent" /> {parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="flex items-center gap-2 text-sm text-foreground/80"><Clock className="w-4 h-4 text-accent" /> {heure} · 60 min</p>
            <p className="flex items-center gap-2 text-sm text-foreground/80"><Flame className="w-4 h-4 text-accent" /> {offre.titre} — {prixDisplay(offre)}</p>
            {adresse && <p className="flex items-center gap-2 text-sm text-foreground/80"><MapPin className="w-4 h-4 text-accent" /> {adresse}</p>}
          </div>
          <button
            onClick={() => downloadICS({
              title: `Séance PHYSIS COACHING — ${offre.titre}`,
              start: `${date}T${heure}:00`,
              durationMin: 60,
              description: `🔥 Séance PHYSIS COACHING — Coaching à domicile
Préparez-vous à donner le meilleur de vous-même 💪

Avant la séance :
• Prévoyez une tenue de sport confortable.
• Préparez un espace suffisant pour bouger librement.
• Gardez une bouteille d'eau à proximité.
• Soyez prêt(e) quelques minutes avant le début de la séance.

La régularité fait la progression : chaque séance est une étape de plus vers vos objectifs.

Besoin d'annuler ou de reporter ?
Merci de prévenir au minimum 24h à l'avance.

📱 Contact :
• Via votre espace client / application PHYSIS COACHING
• Par téléphone ou SMS : 06 98 18 14 28

À très bientôt pour votre séance 🔥
Paul BOOLUCK - PHYSIS COACHING`,
              location: adresse || "Domicile",
            }, `seance-${date}.ics`)}
            className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium text-sm w-full mb-3"
          >
            <CalendarPlus className="w-4 h-4" /> Ajouter à mon calendrier
          </button>
          <Link to="/espace-client/seances" className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm w-full">Mon espace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/espace-client/seances" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Séances</Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Coaching à domicile</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Réserver une séance</h1>
      </div>

      {step === "catalogue" && (
        <div className="space-y-3">
          {CATALOGUE.map(id => {
            const o = FORGE_OFFRES[id];
            return (
              <button key={id} onClick={() => choisir(id)}
                className="w-full text-left bg-card border rounded-2xl p-5 transition-all border-border hover:border-accent">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-semibold text-foreground">{o.titre}</p>
                    </div>
                    {(o.sousTitre || o.duree) && <p className="text-xs text-muted-foreground mt-0.5">{o.sousTitre || o.duree}</p>}
                    {o.inclus && <p className="text-xs text-muted-foreground mt-1 truncate">{o.inclus.join(" · ")}</p>}
                  </div>
                  <p className="font-heading text-lg font-bold text-foreground whitespace-nowrap">{prixDisplay(o)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {step === "detail" && offre && (
        <div className="space-y-5">
          <button onClick={() => setStep("catalogue")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Autres offres</button>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                {offre.badge && <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">{offre.badge}</p>}
                <h2 className="font-heading text-2xl font-bold text-foreground">{offre.titre}</h2>
                <p className="text-sm text-muted-foreground mt-1">{offre.sousTitre || offre.duree || "60 min"}</p>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground whitespace-nowrap">{prixDisplay(offre)}</p>
            </div>
            {(offre.accroche || offre.description) && (
              <p className="text-sm text-foreground/80 leading-relaxed">{offre.accroche || offre.description}</p>
            )}
            {offre.inclus && (
              <ul className="space-y-2">
                {offre.inclus.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={() => setStep(estPonctuel(offreId) ? "creneau" : "paiement")}
            className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2"
          >
            {offre.cta || "Continuer"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === "creneau" && offre && (
        <div className="space-y-5">
          <button onClick={() => setStep("catalogue")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Autres offres</button>
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between">
            <div><p className="font-heading font-semibold text-foreground">{offre.titre}</p><p className="text-xs text-muted-foreground">{offre.sousTitre || offre.duree || "60 min"}</p></div>
            <p className="font-heading text-xl font-bold text-foreground">{prixDisplay(offre)}</p>
          </div>
          {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div> : (
            <CalendrierDispo recurrentes={recurrentes} blocages={blocages} reservees={reservees} value={date} onChange={setDate} />
          )}
          {date && (
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
            <button onClick={() => setStep("paiement")} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">Continuer vers le paiement <ChevronRight className="w-4 h-4" /></button>
          )}
        </div>
      )}

      {step === "paiement" && offre && (
        <div className="space-y-5">
          <button onClick={() => setStep(ponctuel ? "creneau" : "catalogue")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Retour</button>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <p className="font-heading font-semibold text-foreground">{offre.titre}</p>
                {ponctuel
                  ? <p className="text-xs text-muted-foreground">{parseDateLocal(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} · {heure}</p>
                  : <p className="text-xs text-muted-foreground">{nbSeancesPourOffre(offreId)} séances · à réserver dans votre espace</p>}
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{offre.prix}€</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Adresse de la séance</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    required
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder="12 rue Exemple, 68000 Colmar"
                    className="w-full border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Paiement sécurisé via Stripe · Annulation gratuite jusqu'à 24h avant</div>
          <button onClick={payer} disabled={paying || !adresse.trim()} className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">{paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection vers le paiement...</> : <><Lock className="w-4 h-4" /> Payer {offre.prix}€</>}</button>
        </div>
      )}
    </div>
  );
}
