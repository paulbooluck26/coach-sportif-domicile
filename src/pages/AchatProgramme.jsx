import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, CreditCard, Lock, Loader2, CheckCircle2 } from "lucide-react";
import ProgrammeAccompagnement from "@/components/programme/ProgrammeAccompagnement";
import ProgrammeCallBooking from "@/components/programme/ProgrammeCallBooking";

const OFFRES = {
  decouverte: { id: "decouverte", nom: "Découverte", duree: 4, prix: 49, desc: "4 semaines pour démarrer et construire de bonnes bases." },
  transformation: { id: "transformation", nom: "Transformation", duree: 8, prix: 89, desc: "8 semaines pour transformer votre physique et vos habitudes.", recommande: true },
  premium: { id: "premium", nom: "Premium", duree: 12, prix: 129, desc: "12 semaines pour une transformation complète et durable." },
};

export default function AchatProgramme() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offreId = searchParams.get("offre");
  const offre = OFFRES[offreId];
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "", name: "" });
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!offreId || !offre) {
    return (
      <div className="min-h-screen bg-secondary/20 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate("/espace-client/reserver")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"><ChevronLeft className="w-4 h-4" /> Retour</button>
          <h1 className="font-heading text-3xl font-bold text-primary mb-2">Programmes en ligne</h1>
          <p className="text-muted-foreground mb-8">Achetez un programme personnalisé, préparé sur mesure par votre coach. Aucun créneau à réserver — entraînez-vous en autonomie. Chaque programme inclut un accompagnement humain complet : un appel de démarrage, un appel de bilan et une messagerie privée avec votre coach.</p>
          <ProgrammeAccompagnement className="mb-10" />
          <div className="grid md:grid-cols-3 gap-6">
            {Object.values(OFFRES).map(o => (
              <div key={o.id} className={`bg-card border rounded-2xl p-8 relative ${o.recommande ? "border-secondary shadow-lg" : "border-border"}`}>
                {o.recommande && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">Recommandé</span>}
                <h3 className="font-heading text-xl font-bold text-primary mb-2">{o.nom}</h3>
                <p className="text-sm text-muted-foreground mb-4">{o.desc}</p>
                <p className="font-heading text-3xl font-bold text-primary mb-1">{o.prix}€</p>
                <p className="text-sm text-muted-foreground mb-6">{o.duree} semaines</p>
                <Link to={`/achat-programme?offre=${o.id}`} className="block text-center bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">{o.recommande ? "Choisir cette offre" : "Choisir"}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  const handlePay = async () => {
    setPaying(true);
    try {
      await base44.entities.CommandeProgramme.create({
        client_id: user.id,
        client_nom: user.full_name || user.email,
        client_email: user.email,
        offre: offre.id,
        duree_semaines: offre.duree,
        montant: offre.prix,
        date_achat: new Date().toISOString().split("T")[0],
        statut: "en_preparation",
      });
      await base44.entities.Paiement.create({
        seance_id: "programme-" + Date.now(),
        client_id: user.id,
        client_name: user.full_name || user.email,
        amount: offre.prix,
        method: "stripe",
        status: "paid",
        stripe_ref: "SIM-" + Date.now(),
      });
      const profiles = await base44.entities.ClientProfile.filter({ user_id: user.id });
      if (profiles.length === 0) {
        await base44.entities.ClientProfile.create({ user_id: user.id, nom: user.full_name || "", email: user.email });
      }
      setConfirmed(true);
    } catch (err) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setPaying(false);
    }
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-secondary/20 pt-32 pb-20 px-6">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/20 pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate("/achat-programme")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"><ChevronLeft className="w-4 h-4" /> Autres offres</button>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Programme {offre.nom}</h1>
        <p className="text-muted-foreground mb-8">{offre.desc} · {offre.duree} semaines</p>

        <ProgrammeAccompagnement className="mb-8" />

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