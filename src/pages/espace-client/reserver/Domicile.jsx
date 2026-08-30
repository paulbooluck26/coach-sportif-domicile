import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, parseDateLocal } from "@/lib/creneaux";
import { estPonctuel, estAbonnement, nbSeancesPourOffre } from "@/lib/carnetSeances";
import { redirigerVersStripe } from "@/lib/stripeCheckout";
import { redirigerVersAbonnementStripe } from "@/lib/abonnementCheckout";
import { suiviEvenement } from "@/lib/analytics";
import { supabase } from "@/api/supabaseClient";
import CalendrierDispo from "@/components/CalendrierDispo";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, MapPin, CreditCard, Lock, Loader2, CheckCircle2, CalendarDays, CalendarPlus, Flame } from "lucide-react";
import { downloadICS } from "@/lib/calendarExport";

const CATALOGUE = ["essentiel", "hybrid", "performance", "signature", "bilan", "pack_intensif"];
const SESSION_TYPE = {
  bilan: "evaluation",
  pack_intensif: "seance_individuelle",
};

// Même correspondance que côté serveur (create-checkout-session /
// create-subscription-checkout) — permet de retrouver la bonne ligne du
// catalogue admin pour chaque offre.
const SKU_PAR_OFFRE = {
  bilan: "coaching-bilan",
  pack_intensif: "coaching-pack-intensif",
  essentiel: "coaching-essentiel",
  performance: "coaching-performance-abo",
  hybrid: "coaching-hybrid",
  signature: "coaching-signature",
};

// Contenu de secours minimal — juste le temps que le vrai catalogue
// admin arrive, pour ne jamais planter ni montrer une ancienne offre.
const CATALOGUE_SECOURS = {
  bilan: { id: "bilan", titre: "Bilan Physis", prix: 80, prixLabel: "80€", duree: "60 min" },
  pack_intensif: { id: "pack_intensif", titre: "Pack Intensif", prix: 790, prixLabel: "790€", duree: "10 séances" },
  essentiel: { id: "essentiel", titre: "PHYSIS Essentiel", prix: 300, prixLabel: "300€/mois", duree: "4 séances/mois" },
  performance: { id: "performance", titre: "PHYSIS Performance", prix: 550, prixLabel: "550€/mois", duree: "8 séances/mois" },
  hybrid: { id: "hybrid", titre: "PHYSIS Hybrid", prix: 430, prixLabel: "430€/mois", duree: "Engagement 3 mois" },
  signature: { id: "signature", titre: "PHYSIS Signature", prix: 650, prixLabel: "650€/mois", duree: "Engagement 3 mois" },
};

function produitVersOffre(id, p) {
  return {
    id,
    titre: p.nom,
    badge: p.metadata?.badge,
    accroche: p.metadata?.accroche,
    description: p.description,
    duree: p.metadata?.duree || (p.metadata?.nb_seances ? `${p.metadata.nb_seances} séances` : ""),
    prix: p.prix_promo ?? p.prix_ttc,
    prixLabel: `${p.prix_promo ?? p.prix_ttc}€`,
    prixUnite: p.metadata?.unite_prix,
    sousTitre: p.metadata?.sousTitre,
    inclus: p.metadata?.inclus,
    cta: p.metadata?.cta,
    dominant: p.metadata?.dominant,
  };
}

function GroupeCarrousel({ titre, sousTitre, ids, catalogue, onChoisir }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const offres = ids.map((id) => catalogue[id]).filter(Boolean);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || !el.children[0]) return;
    const cardWidth = el.children[0].offsetWidth + 16;
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(index, offres.length - 1)));
  };
  const scrollToOffer = (i) => {
    const el = scrollRef.current;
    if (!el || !el.children[i]) return;
    el.scrollTo({ left: el.children[i].offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  if (offres.length === 0) return null;

  return (
    <div>
      <h2 className="font-heading text-lg font-semibold text-foreground mb-0.5">{titre}</h2>
      <p className="text-xs text-muted-foreground mb-3">{sousTitre}</p>
      <div ref={scrollRef} onScroll={handleScroll} className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
        {offres.map((o) => {
          const dominant = !!o.dominant;
          return (
            <button
              key={o.id}
              onClick={() => onChoisir(o.id)}
              className={`snap-center shrink-0 w-[82%] sm:w-[320px] text-left rounded-2xl p-5 transition-all ${
                dominant ? "bg-primary text-primary-foreground border-2 border-secondary" : "bg-card border border-border hover:border-accent"
              }`}
            >
              {o.badge && (
                <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3">
                  {o.badge}
                </span>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className={`font-heading text-xl font-bold ${dominant ? "text-primary-foreground" : "text-foreground"}`}>{o.titre}</h3>
                  {(o.sousTitre || o.duree) && <p className={`text-xs mt-0.5 ${dominant ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{o.sousTitre || o.duree}</p>}
                </div>
                <p className={`font-heading text-2xl font-bold whitespace-nowrap ${dominant ? "text-secondary" : "text-foreground"}`}>{o.prixLabel}</p>
              </div>
              {o.description && <p className={`text-sm leading-relaxed mt-3 ${dominant ? "text-primary-foreground/70" : "text-foreground/70"}`}>{o.description}</p>}
            </button>
          );
        })}
      </div>
      {offres.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {offres.map((o, i) => (
            <button key={o.id} onClick={() => scrollToOffer(i)} aria-label={`Voir ${o.titre}`} className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-5 bg-accent" : "w-1.5 bg-border"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Domicile() {
  const { user } = useAuth();
  const { recurrentes, blocages, reservees, loading, reload: reloadCreneaux } = useCreneaux();
  const [diagDone, setDiagDone] = useState(null);
  const [adresse, setAdresse] = useState("");
  const [deplacement, setDeplacement] = useState(null);
  const [deplacementErreur, setDeplacementErreur] = useState("");
  const [verifDeplacement, setVerifDeplacement] = useState(false);

  const verifierDeplacement = async () => {
    if (!adresse.trim()) return;
    setVerifDeplacement(true);
    setDeplacementErreur("");
    try {
      const { data } = await supabase.functions.invoke("calculer-frais-deplacement", { body: { adresse } });
      if (data?.error) setDeplacementErreur(data.error);
      else setDeplacement(data);
    } catch {
      setDeplacementErreur("Impossible de calculer les frais de déplacement pour le moment.");
    }
    setVerifDeplacement(false);
  };
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
    if (stripeSessionId) suiviEvenement("purchase", { transaction_id: stripeSessionId });
  }, [stripeSessionId]);

  // Démarre avec le contenu codé en dur (pas d'écran de chargement), puis
  // se met à jour silencieusement avec le vrai catalogue admin dès qu'il
  // arrive — si la requête échoue pour une raison ou une autre, on garde
  // simplement l'affichage de secours.
  const [catalogue, setCatalogue] = useState(CATALOGUE_SECOURS);

  useEffect(() => {
    base44.entities.Produit.filter({ categorie: "coaching_domicile", actif: true })
      .then((rows) => {
        const parSku = {};
        rows.forEach((p) => { parSku[p.sku] = p; });
        const nouveauCatalogue = {};
        Object.entries(SKU_PAR_OFFRE).forEach(([id, sku]) => {
          if (parSku[sku]) nouveauCatalogue[id] = produitVersOffre(id, parSku[sku]);
        });
        setCatalogue((prev) => ({ ...prev, ...nouveauCatalogue }));
      })
      .catch(() => {});
  }, []);

  // Recharge les créneaux déjà pris juste avant d'afficher le calendrier
  // — la liste chargée à l'ouverture de la page peut être périmée si
  // quelqu'un a réservé entre-temps (risque de double réservation sinon).
  useEffect(() => {
    if (step === "detail") reloadCreneaux();
  }, [step]);

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

  const offre = offreId ? catalogue[offreId] : null;
  const ponctuel = offreId ? estPonctuel(offreId) : false;
  const slots = date ? creneauxDisponibles(parseDateLocal(date), recurrentes, reservees) : [];

  const choisir = (id) => {
    setOffreId(id);
    setDate(null);
    setHeure(null);
    setStep("detail");
  };

  const [codePromo, setCodePromo] = useState("");
  const [promoAppliquee, setPromoAppliquee] = useState(null); // { reduction, montantFinal }
  const [promoErreur, setPromoErreur] = useState("");
  const [verifPromo, setVerifPromo] = useState(false);

  const verifierPromo = async () => {
    if (!codePromo.trim() || !offre) return;
    setVerifPromo(true);
    setPromoErreur("");
    try {
      const { data } = await supabase.functions.invoke("validate-promo-code", {
        body: { code: codePromo, montant: offre.prix, client_id: user.id },
      });
      if (data?.valide) setPromoAppliquee(data);
      else { setPromoAppliquee(null); setPromoErreur(data?.erreur || "Code invalide."); }
    } catch {
      setPromoErreur("Erreur de vérification. Réessayez.");
    }
    setVerifPromo(false);
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

      if (estAbonnement(offreId)) {
        await redirigerVersAbonnementStripe({
          offreId,
          adresse,
          successPath: "/espace-client/reserver/programme?appel_abonnement=1",
        });
      } else if (ponctuel) {
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
          codePromo: promoAppliquee ? codePromo : undefined,
        });
      } else {
        const total = nbSeancesPourOffre(offreId);
        await redirigerVersStripe({
          nom: offre.titre,
          montant: offre.prix,
          metadata: {
            type: "carnet",
            client_id: user.id,
            offre_id: offreId,
            offre_titre: offre.titre,
            type_carnet: "pack",
            nb_seances_total: String(total),
          },
          successPath: "/espace-client/reserver/domicile",
          codePromo: promoAppliquee ? codePromo : undefined,
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
              <p className="flex items-center gap-2 text-sm text-foreground/80"><Flame className="w-4 h-4 text-accent" /> {offre.titre} — {offre.prixLabel}</p>
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
            <p className="flex items-center gap-2 text-sm text-foreground/80"><Flame className="w-4 h-4 text-accent" /> {offre.titre} — {offre.prixLabel}</p>
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
        <p className="text-sm text-muted-foreground mt-2">Votre coach se déplace chez vous, à Colmar et alentours. Choisissez la formule qui correspond à votre rythme.</p>
      </div>

      {step === "catalogue" && (
        <div className="space-y-8">
          <GroupeCarrousel
            titre="Coaching à domicile"
            sousTitre="Votre coach est présent à chaque entraînement."
            ids={["essentiel", "performance"]}
            catalogue={catalogue}
            onChoisir={choisir}
          />
          <GroupeCarrousel
            titre="Coaching hybride"
            sousTitre="Votre coach vous accompagne, même lorsque vous vous entraînez seul."
            ids={["hybrid", "signature"]}
            catalogue={catalogue}
            onChoisir={choisir}
          />
          <GroupeCarrousel
            titre="Autres formules"
            sousTitre="Sans abonnement."
            ids={["bilan", "pack_intensif"]}
            catalogue={catalogue}
            onChoisir={choisir}
          />
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
              <p className="font-heading text-2xl font-bold text-foreground whitespace-nowrap">{offre.prixLabel}</p>
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
            <p className="font-heading text-xl font-bold text-foreground">{offre.prixLabel}</p>
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
              <p className="font-heading text-2xl font-bold text-foreground">{offre.prix}€{estAbonnement(offreId) ? "/mois" : ""}</p>
            </div>
            {(
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Adresse de la séance</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    required
                    value={adresse}
                    onChange={(e) => { setAdresse(e.target.value); setDeplacement(null); setDeplacementErreur(""); }}
                    placeholder="12 rue Exemple, 68000 Colmar"
                    className="w-full border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent"
                  />
                </div>
                <button
                  onClick={verifierDeplacement}
                  disabled={!adresse.trim() || verifDeplacement}
                  className="mt-2 inline-flex items-center gap-1.5 border border-secondary text-secondary px-4 py-2 rounded-full text-xs font-semibold hover:bg-secondary hover:text-secondary-foreground transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-secondary"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {verifDeplacement ? "Calcul en cours..." : "Vérifier les frais de déplacement"}
                </button>
                {deplacement && !deplacement.horsZone && (
                  <div className="mt-2 bg-secondary/10 border border-secondary/30 rounded-xl px-4 py-3 text-sm">
                    <p className="text-foreground">Distance : <strong>{deplacement.distanceKm} km</strong></p>
                    <p className="text-foreground">
                      Frais de déplacement : <strong>{deplacement.frais > 0 ? `+${deplacement.frais}€` : "Gratuit"}</strong>
                    </p>
                  </div>
                )}
                {deplacement?.horsZone && (
                  <p className="mt-2 text-xs text-destructive">Cette adresse est en dehors de notre zone d'intervention (au-delà de {deplacement.distanceMax} km).</p>
                )}
                {deplacementErreur && <p className="mt-2 text-xs text-destructive">{deplacementErreur}</p>}
                <p className="text-xs text-muted-foreground mt-2">Les séances à domicile sont disponibles dans un rayon défini autour de Colmar. Les frais de déplacement sont calculés automatiquement selon la distance réelle jusqu'à votre adresse.</p>
              </div>

            </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Code promo (facultatif)</label>
            {promoAppliquee ? (
              <div className="flex items-center justify-between bg-secondary/10 border border-secondary rounded-xl px-4 py-3">
                <p className="text-sm text-foreground">
                  <strong>{codePromo.toUpperCase()}</strong> appliqué — <span className="text-secondary font-semibold">-{promoAppliquee.reduction}€</span>
                </p>
                <button onClick={() => { setPromoAppliquee(null); setCodePromo(""); }} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={codePromo}
                  onChange={(e) => setCodePromo(e.target.value)}
                  placeholder="Ex : BIENVENUE10"
                  className="flex-1 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent uppercase"
                />
                <button onClick={verifierPromo} disabled={!codePromo.trim() || verifPromo} className="border border-border text-foreground px-5 rounded-xl text-sm font-medium disabled:opacity-50">
                  {verifPromo ? "..." : "Appliquer"}
                </button>
              </div>
            )}
            {promoErreur && <p className="text-xs text-destructive mt-1.5">{promoErreur}</p>}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="w-3.5 h-3.5" /> Paiement sécurisé via Stripe · Annulation gratuite jusqu'à 24h avant</div>
          <button onClick={payer} disabled={paying || !adresse.trim() || deplacement?.horsZone} className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">{paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirection vers le paiement...</> : <><Lock className="w-4 h-4" /> {estAbonnement(offreId) ? `S'abonner ${offre.prix}€/mois` : `Payer ${(promoAppliquee ? promoAppliquee.montantFinal : offre.prix) + (deplacement && !deplacement.horsZone ? deplacement.frais : 0)}€`}</>}</button>
        </div>
      )}
    </div>
  );
}
