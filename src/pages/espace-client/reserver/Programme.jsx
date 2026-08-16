import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { finaliserAchatProgramme } from "@/lib/reservationFlow";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, dateStr, parseDateLocal } from "@/lib/creneaux";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Sparkles, Check, Lock, Phone, Video, CalendarPlus } from "lucide-react";
import { downloadICS } from "@/lib/calendarExport";
import { envoyerEmail } from "@/lib/emailSender";

const OFFRES = [
  { id: "forge", nom: "FORGE", duree: 12, prix: 149, recommande: true, desc: "Le parcours idéal pour transformer votre physique et vos habitudes.", inclus: ["Programmation personnalisée", "Progression structurée", "Messagerie avec votre coach", "Appel de bilan"] },
  { id: "start", nom: "START", duree: 4, prix: 49, desc: "Construire de bonnes bases et reprendre une routine efficace.", inclus: ["Programme adapté à votre objectif", "Exercices expliqués en vidéo", "Appel de démarrage"] },
  { id: "legacy", nom: "LEGACY", duree: 24, prix: 299, desc: "Une transformation complète et durable avec un accompagnement longue durée.", inclus: ["Suivi renforcé", "Ajustements réguliers", "Analyse de progression"] },
];

const OBJECTIFS = [
  { emoji: "🔥", titre: "Perte de poids", accroche: "Brûlez, tonifiez, transformez votre silhouette" },
  { emoji: "💪", titre: "Prise de muscle", accroche: "Construisez du volume, sans compromis sur la forme" },
  { emoji: "🏋️", titre: "Force", accroche: "Progressez sur les mouvements fondamentaux" },
  { emoji: "🌿", titre: "Longévité", accroche: "Bougez mieux, plus longtemps, sans douleur" },
  { emoji: "🩹", titre: "Retour / post-blessure", accroche: "Reprenez en confiance, à votre rythme" },
  { emoji: "🏠", titre: "À domicile", accroche: "Sans salle, sans excuse" },
  { emoji: "🏢", titre: "En salle", accroche: "Exploitez tout le matériel à disposition" },
  { emoji: "⚙️", titre: "Sans matériel", accroche: "Le poids du corps suffit" },
];

export default function Programme() {
  const { user } = useAuth();
  const { recurrentes, reservees } = useCreneaux();
  const [step, setStep] = useState("catalogue"); // catalogue | detail | paiement | appel
  const [offreId, setOffreId] = useState(null);
  const [objectif, setObjectif] = useState("");
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvc: "" });
  const [paying, setPaying] = useState(false);

  const [canal, setCanal] = useState("telephone");
  const [telephone, setTelephone] = useState("");
  const [dateAppel, setDateAppel] = useState(null);
  const [heureAppel, setHeureAppel] = useState(null);
  const [bookingAppel, setBookingAppel] = useState(false);
  const [appelConfirme, setAppelConfirme] = useState(false);
  const [programmeActif, setProgrammeActif] = useState(null);
  const [activeOfferIndex, setActiveOfferIndex] = useState(0);
  const offersScrollRef = useRef(null);

  const handleOffersScroll = () => {
    const el = offersScrollRef.current;
    if (!el || !el.children[0]) return;
    const cardWidth = el.children[0].offsetWidth + 16; // + gap
    const index = Math.round(el.scrollLeft / cardWidth);
    setActiveOfferIndex(Math.max(0, Math.min(index, OFFRES.length - 1)));
  };

  const scrollToOffer = (i) => {
    const el = offersScrollRef.current;
    if (!el || !el.children[i]) return;
    el.scrollTo({ left: el.children[i].offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  const offre = OFFRES.find((o) => o.id === offreId);

  useEffect(() => {
    if (!user) return;
    base44.entities.ClientProfile.filter({ user_id: user.id }).then((profiles) => {
      const p = profiles[0];
      if (p?.telephone) setTelephone(p.telephone);
      if (p?.objectif) setObjectif(p.objectif);
    }).catch(() => {});
    base44.entities.Programme.filter({ statut: "actif" }).then((progs) => {
      const mien = progs.find((p) => !p.est_modele && (p.client_ids || []).includes(user.id));
      setProgrammeActif(mien || null);
    }).catch(() => {});
  }, [user]);

  const choisir = (id) => { setOffreId(id); setStep("detail"); };

  const acheter = async () => {
    setPaying(true);
    try {
      try {
        const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
        if (profiles[0]) await base44.entities.ClientProfile.update(profiles[0].id, { objectif });
      } catch (_) {}

      await finaliserAchatProgramme({
        user,
        programmeNom: offre.nom,
        prix: offre.prix,
        commandePayload: {
          client_id: user.id,
          client_nom: user.full_name || user.email,
          client_email: user.email,
          offre: offre.id,
          duree_semaines: offre.duree,
          montant: offre.prix,
          date_achat: new Date().toISOString().split("T")[0],
          statut: "en_preparation",
        },
      });
      setStep("appel");
    } catch (e) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setPaying(false);
    }
  };

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
  const slots = dateAppel ? creneauxDisponibles(parseDateLocal(dateAppel), recurrentes, reservees, 60) : [];

  const confirmerAppel = async () => {
    setBookingAppel(true);
    try {
      await base44.entities.Seance.create({
        client_id: user.id,
        client_name: user.full_name || user.email,
        session_type: "appel_bilan",
        date: dateAppel,
        time: heureAppel,
        duration_minutes: 60,
        price: 0,
        status: "booked",
        location: canal === "telephone" ? `Appel téléphonique — ${telephone}` : "Appel visio",
        canal,
      });
      const dateStrFr = parseDateLocal(dateAppel).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
      try {
        await envoyerEmail("confirmation_reservation", user.email, {
          client_prenom: user.full_name?.split(" ")[0] || "",
          prestation: "Appel de bilan — programme " + (offre?.nom || ""),
          date: dateStrFr,
          heure: heureAppel,
          lieu: canal === "telephone" ? `Appel téléphonique au ${telephone}` : "Appel en visio (lien envoyé avant l'appel)",
        });
      } catch (_) {}
      setAppelConfirme(true);
    } catch (e) {
      alert("Erreur lors de la réservation de l'appel. Vous pourrez le faire depuis votre espace.");
    } finally {
      setBookingAppel(false);
    }
  };

  if (step === "appel") {
    if (appelConfirme) {
      return (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Tout est prêt</h2>
            <p className="text-foreground/60 mb-6">Votre appel de bilan est réservé pour le {parseDateLocal(dateAppel).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {heureAppel}. Votre coach l'utilisera pour construire votre programme.</p>
            <button
              onClick={() => downloadICS({
                title: `Appel de bilan PHYSIS COACHING — Programme ${offre?.nom || ""}`,
                start: `${dateAppel}T${heureAppel}:00`,
                durationMin: 60,
                description: `Appel de bilan (${canal === "telephone" ? `téléphonique au ${telephone}` : "en visio"}) avec votre coach pour construire votre programme ${offre?.nom || ""}.\n\nContact : 06 98 18 14 28\n\nPaul BOOLUCK - PHYSIS COACHING`,
                location: canal === "telephone" ? "Appel téléphonique" : "Appel visio",
              }, `appel-bilan-${dateAppel}.ics`)}
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium text-sm w-full mb-3"
            >
              <CalendarPlus className="w-4 h-4" /> Ajouter à mon calendrier
            </button>
            <Link to="/espace-client/programme" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm inline-block">Mon espace</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Dernière étape</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">Réservez votre appel de bilan</h1>
          <p className="text-sm text-muted-foreground mt-2">45 minutes avec votre coach pour construire votre programme {offre?.nom} ensemble.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setCanal("telephone")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm ${canal === "telephone" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
            <Phone className="w-4 h-4" /> Appel téléphonique
          </button>
          <button onClick={() => setCanal("visio")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-medium text-sm ${canal === "visio" ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground"}`}>
            <Video className="w-4 h-4" /> Visio
          </button>
        </div>

        {canal === "telephone" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Numéro à appeler</label>
            <input required value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="06 12 34 56 78" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" />
          </div>
        )}
        {canal === "visio" && (
          <p className="text-sm text-muted-foreground bg-secondary/10 border border-secondary/30 rounded-xl p-3">Un lien de visioconférence vous sera envoyé par email avant l'appel.</p>
        )}

        <div className="grid grid-cols-4 gap-2">
          {dates.map((d) => (
            <button key={dateStr(d)} onClick={() => { setDateAppel(dateStr(d)); setHeureAppel(null); }} className={`p-2.5 rounded-lg text-center transition-all ${dateAppel === dateStr(d) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-foreground"}`}>
              <p className="text-[10px] capitalize">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
              <p className="text-sm font-heading font-bold mt-0.5">{d.getDate()}</p>
            </button>
          ))}
        </div>
        {dateAppel && (
          slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour-là.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((h) => (
                <button key={h} onClick={() => setHeureAppel(h)} className={`py-2.5 rounded-lg text-sm font-medium border ${heureAppel === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>{h}</button>
              ))}
            </div>
          )
        )}

        <button
          onClick={confirmerAppel}
          disabled={bookingAppel || !dateAppel || !heureAppel || (canal === "telephone" && !telephone.trim())}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {bookingAppel ? <><Loader2 className="w-4 h-4 animate-spin" /> Réservation...</> : <>Confirmer l'appel <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    );
  }

  if (step === "paiement" && offre) {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("detail")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Retour</button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Paiement</p>
          <h1 className="font-heading text-2xl font-bold text-foreground">{offre.nom} — {offre.prix}€</h1>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Votre objectif</label>
            <textarea required value={objectif} onChange={(e) => setObjectif(e.target.value)} placeholder="Ex : perdre du poids, reprendre le sport après une pause, me préparer pour un événement..." rows={3} className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent resize-none" />
            <p className="text-xs text-muted-foreground mt-1">Ça aide votre coach à construire un programme adapté dès le départ.</p>
          </div>
          <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Nom sur la carte</label><input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="Jean Dupont" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" /></div>
          <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Numéro de carte</label><input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="4242 4242 4242 4242" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" /></div>
          <div className="flex gap-3">
            <div className="flex-1"><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Expiration</label><input value={card.exp} onChange={e => setCard({ ...card, exp: e.target.value })} placeholder="MM/AA" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" /></div>
            <div className="flex-1"><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">CVC</label><input value={card.cvc} onChange={e => setCard({ ...card, cvc: e.target.value })} placeholder="123" className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent" /></div>
          </div>
        </div>

        <button onClick={acheter} disabled={paying || !objectif.trim()} className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
          {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <><Lock className="w-4 h-4" /> Payer {offre.prix}€</>}
        </button>
      </div>
    );
  }

  if (step === "detail" && offre) {
    return (
      <div className="space-y-5">
        <button onClick={() => setStep("catalogue")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Autres programmes</button>
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {offre.recommande && <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full"><Sparkles className="w-3 h-3" /> Recommandé</span>}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground">{offre.nom}</h2>
              <p className="text-sm text-muted-foreground mt-1">{offre.duree} semaines</p>
            </div>
            <p className="font-heading text-2xl font-bold text-foreground whitespace-nowrap">{offre.prix}€</p>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{offre.desc}</p>
          <ul className="space-y-2">
            {offre.inclus.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground/80"><Check className="w-4 h-4 text-secondary shrink-0" /> {item}</li>
            ))}
          </ul>
        </div>
        <button onClick={() => setStep("paiement")} className="w-full bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
          Choisir {offre.nom} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-2">
      <Link to="/espace-client/programme" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Programmes</Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Programmes en ligne</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Découvrir un programme</h1>
        <p className="text-sm text-muted-foreground mt-2">Chaque programme est préparé sur mesure par votre coach, quel que soit votre point de départ.</p>
      </div>

      {programmeActif && (
        <div className="flex items-start gap-3 bg-secondary/10 border border-secondary/30 rounded-xl p-4">
          <Sparkles className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            Vous suivez déjà <strong>{programmeActif.name}</strong>. Vous pouvez explorer d'autres programmes ci-dessous, mais on vous recommande de vous concentrer sur un seul programme à la fois pour de meilleurs résultats.
          </p>
        </div>
      )}

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Quel que soit votre objectif</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory no-scrollbar">
          {OBJECTIFS.map((obj) => (
            <div
              key={obj.titre}
              className="snap-start shrink-0 w-[168px] rounded-2xl p-4 flex flex-col justify-between"
              style={{ background: "linear-gradient(155deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 55%, hsl(var(--secondary)/0.35) 100%)", minHeight: "132px" }}
            >
              <span className="text-2xl">{obj.emoji}</span>
              <div>
                <p className="font-heading text-sm font-bold text-primary-foreground uppercase tracking-wide leading-tight">{obj.titre}</p>
                <p className="text-[11px] text-primary-foreground/60 mt-1 leading-snug">{obj.accroche}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Nos programmes</h2>
        <div
          ref={offersScrollRef}
          onScroll={handleOffersScroll}
          className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory no-scrollbar"
        >
          {OFFRES.map((o) => (
            <button
              key={o.id}
              onClick={() => choisir(o.id)}
              className={`snap-center shrink-0 w-[82%] sm:w-[320px] text-left bg-card rounded-2xl p-5 transition-all hover:border-accent ${o.recommande ? "border-2 border-secondary" : "border border-border"}`}
            >
              {o.recommande && <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"><Sparkles className="w-3 h-3" /> Recommandé</span>}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">{o.nom}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">{o.duree} semaines</p>
                </div>
                <p className="font-heading text-2xl font-bold text-foreground">{o.prix}€</p>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed mt-3">{o.desc}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {OFFRES.map((o, i) => (
            <button
              key={o.id}
              onClick={() => scrollToOffer(i)}
              aria-label={`Voir ${o.nom}`}
              className={`h-1.5 rounded-full transition-all ${i === activeOfferIndex ? "w-5 bg-accent" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
