import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, CreditCard, Lock, Loader2, CheckCircle2, ClipboardList, ArrowRight, Target, Dumbbell, MessageSquare, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ProgrammeCallBooking from "@/components/programme/ProgrammeCallBooking";
import { finaliserAchatProgramme } from "@/lib/reservationFlow";

const OFFRES = {
  start: {
    id: "start", nom: "START", duree: 4, prix: 49,
    desc: "Construire de bonnes bases et reprendre une routine efficace.",
    inclus: ["Programme adapté à votre objectif", "Exercices expliqués en vidéo", "Appel de démarrage"],
  },
  forge: {
    id: "forge", nom: "FORGE", duree: 12, prix: 149, recommande: true,
    desc: "Le parcours idéal pour transformer votre physique et vos habitudes.",
    inclus: ["Programmation personnalisée", "Progression structurée", "Messagerie avec votre coach", "Appel de bilan"],
  },
  legacy: {
    id: "legacy", nom: "LEGACY", duree: 24, prix: 299,
    desc: "Une transformation complète et durable avec un accompagnement longue durée.",
    inclus: ["Suivi renforcé", "Ajustements réguliers", "Analyse de progression"],
  },
};

const POURQUOI = [
  { icon: Target, titre: "Adapté à vous", desc: "Pas de programme générique. Votre entraînement est construit selon votre profil et votre objectif." },
  { icon: Dumbbell, titre: "Où vous voulez", desc: "Salle, maison ou extérieur. Avec ou sans matériel, votre programme s'adapte." },
  { icon: MessageSquare, titre: "Accompagné par un coach", desc: "Un suivi humain avec appel de démarrage, bilan et messagerie privée." },
];

const FAQ = [
  { q: "Puis-je suivre le programme chez moi ?", r: "Oui. Les programmes sont adaptés à votre environnement : maison, salle ou extérieur." },
  { q: "Ai-je besoin de matériel ?", r: "Non. Les exercices sont adaptés au matériel disponible." },
  { q: "Est-ce un programme identique pour tout le monde ?", r: "Non. Chaque programmation prend en compte votre objectif, votre niveau et vos contraintes." },
];

export default function AchatProgramme() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offreId = searchParams.get("offre");
  const offre = OFFRES[offreId];
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // --- Landing (no offre selected) ---
  if (!offreId || !offre) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="absolute top-0 inset-x-0 z-20 px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-heading text-xl font-bold text-white">The Lab Forge</Link>
          <button onClick={() => navigate("/")} className="text-sm font-medium text-white/70 hover:text-white border border-white/20 px-4 py-1.5 rounded-md hover:bg-white/10 transition-colors">Retour à l'accueil</button>
        </header>

        {/* Hero */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1800&q=80" alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/80" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/70 to-primary/90" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto px-6 text-center text-primary-foreground pt-24 pb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary mb-5 animate-fade-up">Coaching personnalisé en autonomie</p>
            <h1 className="font-heading text-5xl md:text-6xl font-bold tracking-display mb-5 animate-fade-up">Programmes en ligne</h1>
            <p className="font-heading text-xl md:text-2xl font-medium text-primary-foreground/90 mb-5 animate-fade-up">Un entraînement conçu pour votre objectif, votre niveau et votre environnement.</p>
            <p className="text-primary-foreground/70 max-w-xl mx-auto mb-10 animate-fade-up">Que vous vous entraîniez en salle, chez vous ou en extérieur, j'adapte votre programme selon votre matériel, vos contraintes et vos objectifs.</p>
            <a href="#offres" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-semibold text-base hover:scale-105 transition-transform animate-fade-up">
              Trouver mon programme <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>

        {/* Pourquoi The Lab Forge */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">La méthode The Lab Forge</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Pourquoi The Lab Forge ?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {POURQUOI.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.titre} className="bg-card border border-border rounded-2xl p-8 text-center hover:border-accent/40 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-secondary" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-foreground mb-3">{p.titre}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Offres */}
        <section id="offres" className="py-20 px-6 bg-secondary/10 scroll-mt-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Les programmes</p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Choisissez votre parcours</h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Chaque programme est préparé sur mesure par votre coach après votre achat.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 items-start">
              {Object.values(OFFRES).map((o) => (
                <div key={o.id} className={`relative bg-card rounded-2xl p-8 flex flex-col ${o.recommande ? "border-2 border-secondary shadow-xl md:scale-105" : "border border-border"}`}>
                  {o.recommande && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommandé
                    </span>
                  )}
                  <h3 className="font-heading text-2xl font-bold text-foreground">{o.nom}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">{o.duree} semaines</p>
                  <p className="font-heading text-4xl font-bold text-foreground mb-1">{o.prix}€</p>
                  <p className="text-sm text-muted-foreground mb-6">Paiement unique</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-6">{o.desc}</p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {o.inclus.map((inc) => (
                      <li key={inc} className="flex items-start gap-2.5 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {inc}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/achat-programme?offre=${o.id}`} className={`block text-center py-3.5 rounded-md font-semibold text-sm transition-colors ${o.recommande ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    Choisir {o.nom}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Questions fréquentes</p>
              <h2 className="font-heading text-3xl font-bold text-foreground">FAQ</h2>
            </div>
            <Accordion type="single" collapsible className="border border-border rounded-2xl bg-card px-2 divide-y divide-border">
              {FAQ.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="px-4 border-0">
                  <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:no-underline">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">{f.r}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-16 px-6 bg-primary text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-4">Prêt à transformer votre entraînement ?</h2>
            <p className="text-primary-foreground/70 mb-8">Rejoignez The Lab Forge et bénéficiez d'un accompagnement humain, où que vous soyez.</p>
            <a href="#offres" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform">
              Voir les programmes <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </div>
    );
  }

  // --- Auth gate ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-3">Connexion requise</h1>
          <p className="text-muted-foreground mb-8">Créez un compte ou connectez-vous pour acheter le programme {offre.nom}.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm">Se connecter</Link>
            <Link to="/register" className="border border-border px-6 py-3 rounded-md font-semibold text-sm text-foreground">Créer un compte</Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Payment ---
  const handlePay = async () => {
    setPaying(true);
    try {
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
      setConfirmed(true);
    } catch (err) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setPaying(false);
    }
  };

  // --- Confirmation ---
  if (confirmed) {
    return (
      <div className="min-h-screen bg-secondary/10 pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Commande confirmée</h1>
            <p className="text-foreground/60 mb-8">Votre achat du programme <strong className="text-foreground">{offre.nom}</strong> ({offre.prix}€) a été validé. Votre coach prépare votre programme personnalisé. Vous serez notifié dès qu'il sera disponible dans votre espace.</p>
            <div className="flex gap-3">
              <button onClick={() => navigate("/espace-client")} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm">Mon espace</button>
              <button onClick={() => navigate("/")} className="flex-1 border border-border py-3 rounded-md font-semibold text-sm text-foreground">Accueil</button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Prochaine étape</p>
            </div>
            <ProgrammeCallBooking programmeNom={offre.nom} userEmail={user.email} userName={user.full_name || user.email} />
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start gap-3 mb-3">
                <ClipboardList className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-semibold text-foreground">Préparez votre accompagnement</p>
                  <p className="text-sm text-muted-foreground mt-1">Pour préparer au mieux votre accompagnement, complétez votre Bilan initial avant votre rendez-vous avec votre coach.</p>
                </div>
              </div>
              <Link to="/espace-client/bilan-initial" className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-md text-sm font-semibold">Remplir mon bilan initial</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Payment form ---
  return (
    <div className="min-h-screen bg-secondary/10 pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/achat-programme")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"><ChevronLeft className="w-4 h-4" /> Autres offres</button>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Programme {offre.nom}</h1>
        <p className="text-muted-foreground mb-8">{offre.desc} · {offre.duree} semaines</p>

        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
            <div>
              <p className="font-heading font-semibold text-foreground">Programme {offre.nom}</p>
              <p className="text-sm text-muted-foreground">{offre.duree} semaines de coaching personnalisé</p>
            </div>
            <p className="font-heading text-2xl font-bold text-foreground">{offre.prix}€</p>
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6"><Lock className="w-3.5 h-3.5" /> Paiement chiffré · Programme préparé sur mesure par votre coach</div>
        <button onClick={handlePay} disabled={paying} className="w-full bg-accent text-accent-foreground py-3.5 rounded-md font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 flex items-center justify-center gap-2">
          {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <><Lock className="w-4 h-4" /> Payer {offre.prix}€</>}
        </button>
      </div>
    </div>
  );
}