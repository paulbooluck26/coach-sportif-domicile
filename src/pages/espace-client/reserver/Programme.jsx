import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { finaliserAchatProgramme } from "@/lib/reservationFlow";
import { Link } from "react-router-dom";
import { ChevronLeft, CheckCircle2, Loader2, Sparkles, Check } from "lucide-react";

const OFFRES = [
  { id: "start", nom: "START", duree: 4, prix: 49, desc: "Construire de bonnes bases et reprendre une routine efficace.", inclus: ["Programme adapté à votre objectif", "Exercices expliqués en vidéo", "Appel de démarrage"] },
  { id: "forge", nom: "FORGE", duree: 12, prix: 149, recommande: true, desc: "Le parcours idéal pour transformer votre physique et vos habitudes.", inclus: ["Programmation personnalisée", "Progression structurée", "Messagerie avec votre coach", "Appel de bilan"] },
  { id: "legacy", nom: "LEGACY", duree: 24, prix: 299, desc: "Une transformation complète et durable avec un accompagnement longue durée.", inclus: ["Suivi renforcé", "Ajustements réguliers", "Analyse de progression"] },
];

export default function Programme() {
  const { user } = useAuth();
  const [paying, setPaying] = useState(null);
  const [done, setDone] = useState(null);

  const acheter = async (o) => {
    setPaying(o.id);
    try {
      await finaliserAchatProgramme({
        user,
        programmeNom: o.nom,
        prix: o.prix,
        commandePayload: {
          client_id: user.id,
          client_nom: user.full_name || user.email,
          client_email: user.email,
          offre: o.id,
          duree_semaines: o.duree,
          montant: o.prix,
          date_achat: new Date().toISOString().split("T")[0],
          statut: "en_preparation",
        },
      });
      setDone(o);
    } catch (e) {
      alert("Erreur lors du paiement. Veuillez réessayer.");
    } finally {
      setPaying(null);
    }
  };

  if (done) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Commande confirmée</h2>
          <p className="text-foreground/60 mb-6">Votre achat du programme <strong className="text-foreground">{done.nom}</strong> ({done.prix}€) a été validé. Un email de confirmation vous a été envoyé. Votre coach prépare votre programme personnalisé.</p>
          <div className="flex flex-col gap-2">
            <Link to="/espace-client/bilan-initial" className="bg-secondary text-secondary-foreground px-6 py-3 rounded-xl font-semibold text-sm text-center">Remplir mon bilan initial</Link>
            <Link to="/espace-client" className="border border-border px-6 py-3 rounded-xl font-semibold text-sm text-foreground text-center">Mon espace</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/espace-client/reserver" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /> Réserver</Link>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">Programmes en ligne</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Choisir un programme</h1>
        <p className="text-sm text-muted-foreground mt-2">Chaque programme est préparé sur mesure par votre coach après votre achat.</p>
      </div>

      <div className="space-y-4">
        {OFFRES.map(o => (
          <div key={o.id} className={`bg-card rounded-2xl p-5 ${o.recommande ? "border-2 border-secondary" : "border border-border"}`}>
            {o.recommande && <span className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full mb-3"><Sparkles className="w-3 h-3" /> Recommandé</span>}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground">{o.nom}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{o.duree} semaines</p>
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">{o.prix}€</p>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed mt-3 mb-4">{o.desc}</p>
            <ul className="space-y-2 mb-5">
              {o.inclus.map(inc => <li key={inc} className="flex items-start gap-2 text-sm text-foreground/80"><Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" /> {inc}</li>)}
            </ul>
            <button onClick={() => acheter(o)} disabled={paying === o.id} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {paying === o.id ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</> : <>Acheter {o.nom} — {o.prix}€</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}