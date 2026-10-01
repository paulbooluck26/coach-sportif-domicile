import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { enregistrerEvenementExecution } from "@/lib/executionEvents";
import {
  FORMULAIRE_TYPE_RETRACTATION,
  TEXTE_BOUTON_CONFIRMER_RETRACTATION,
  TEXTE_POINT_ACCES_RETRACTATION,
} from "@/lib/legalConfig";
import { CheckCircle2, Loader2 } from "lucide-react";

// Distinct de la fonctionnalité "Ne pas renouveler mon abonnement"
// (Profil.jsx) : ceci est l'exercice du droit légal de rétractation
// de 14 jours (cahier des charges §5). Le point d'accès ("Se
// rétracter", dans Profil.jsx) et le bouton de validation finale
// ("Confirmer la rétractation", ci-dessous) portent des libellés
// distincts imposés par le décret d'application — ne jamais les
// confondre ni les uniformiser.
export default function Retractation() {
  const { contratId } = useParams();
  const { user } = useAuth();
  const [contrat, setContrat] = useState(null);
  const [erreurAcces, setErreurAcces] = useState("");
  const [emailAccuse, setEmailAccuse] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [accuse, setAccuse] = useState(null); // { texte, dateReception, dateEnvoi }

  useEffect(() => {
    if (!user || !contratId) return;
    base44.entities.Contrat.get(contratId)
      .then((c) => {
        if (!c || c.client_id !== user.id) {
          setErreurAcces("Cette commande n'existe pas ou ne vous appartient pas.");
          return;
        }
        const eligible =
          ["payee", "en_execution"].includes(c.statut) &&
          c.date_limite_retractation &&
          new Date(c.date_limite_retractation) > new Date();
        if (!eligible) {
          setErreurAcces("Cette commande n'est plus éligible au droit de rétractation.");
          return;
        }
        setContrat(c);
        setEmailAccuse(user.email);
      })
      .catch(() => setErreurAcces("Impossible de charger cette commande."));
  }, [user, contratId]);

  const confirmer = async () => {
    if (!contrat || !emailAccuse.trim()) return;
    setEnvoi(true);
    try {
      const maintenant = new Date().toISOString();
      const texteDeclaration = FORMULAIRE_TYPE_RETRACTATION
        .replace("Commandé le (*) / reçu le (*)", `Commandé le ${new Date(contrat.created_date).toLocaleDateString("fr-FR")}`)
        .replace("Nom du (des) consommateur(s)", `Nom du consommateur : ${contrat.client_nom}`)
        .replace("Adresse du (des) consommateur(s)", `Adresse du consommateur : ${contrat.client_adresse_rue}, ${contrat.client_adresse_code_postal} ${contrat.client_adresse_ville}`)
        .replace("Date", `Date : ${new Date(maintenant).toLocaleString("fr-FR")}`);

      const demande = await base44.entities.DemandeRetractation.create({
        contrat_id: contrat.id,
        client_id: user.id,
        date_reception: maintenant,
        email_accuse_destination: emailAccuse.trim(),
        texte_declaration: texteDeclaration,
        statut: "recue",
      });
      await base44.entities.Contrat.update(contrat.id, { statut: "retractation_demandee" });
      await enregistrerEvenementExecution(contrat.id, "demande_retractation_recue", {
        description: "Reçue via l'espace client",
        creePar: user.id,
      });

      let dateEnvoi = null;
      try {
        const res = await base44.integrations.Core.SendEmail({
          to: emailAccuse.trim(),
          subject: "Accusé de réception de votre demande de rétractation — PHYSIS COACHING",
          body: texteDeclaration,
        });
        if (res?.sent) {
          dateEnvoi = new Date().toISOString();
          await base44.entities.DemandeRetractation.update(demande.id, { date_envoi_accuse: dateEnvoi });
        }
      } catch (_) {}

      setAccuse({ texte: texteDeclaration, dateReception: maintenant, dateEnvoi });
    } finally {
      setEnvoi(false);
    }
  };

  if (erreurAcces) {
    return (
      <div className="max-w-lg mx-auto space-y-4 text-center py-16">
        <p className="text-foreground">{erreurAcces}</p>
        <Link to="/espace-client/profil" className="text-accent text-sm font-medium">Retour à mon profil</Link>
      </div>
    );
  }

  if (accuse) {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5"><CheckCircle2 className="w-8 h-8 text-accent" /></div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Rétractation enregistrée</h1>
          <p className="text-foreground/60 mb-1">Reçue le {new Date(accuse.dateReception).toLocaleString("fr-FR")}.</p>
          <p className="text-foreground/60 mb-6">
            {accuse.dateEnvoi
              ? `Un accusé de réception vous a été envoyé le ${new Date(accuse.dateEnvoi).toLocaleString("fr-FR")}.`
              : "L'envoi de l'accusé par email n'a pas pu être confirmé — conservez cette page comme preuve, le contenu exact de votre déclaration figure ci-dessous."}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Contenu de votre déclaration</p>
          <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{accuse.texte}</p>
        </div>
        <Link to="/espace-client/profil" className="block text-center text-accent text-sm font-medium">Retour à mon profil</Link>
      </div>
    );
  }

  if (!contrat) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-1">{TEXTE_POINT_ACCES_RETRACTATION}</p>
        <h1 className="font-heading text-2xl font-bold text-foreground">Exercer mon droit de rétractation</h1>
        <p className="text-sm text-muted-foreground mt-2">Concernant : {contrat.offre_snapshot?.nom} — commandé le {new Date(contrat.created_date).toLocaleDateString("fr-FR")}.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Formulaire type de rétractation</p>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{FORMULAIRE_TYPE_RETRACTATION}</p>
        <div className="border-t border-border pt-3 text-sm text-foreground space-y-1">
          <p>Nom : {contrat.client_nom}</p>
          <p>Adresse : {contrat.client_adresse_rue}, {contrat.client_adresse_code_postal} {contrat.client_adresse_ville}</p>
          <p>Commandé le : {new Date(contrat.created_date).toLocaleDateString("fr-FR")}</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Adresse email pour recevoir l'accusé de réception</label>
        <input
          value={emailAccuse}
          onChange={(e) => setEmailAccuse(e.target.value)}
          className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
        />
      </div>

      <button
        onClick={confirmer}
        disabled={envoi || !emailAccuse.trim()}
        className="w-full bg-accent text-accent-foreground py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {envoi ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi...</> : TEXTE_BOUTON_CONFIRMER_RETRACTATION}
      </button>
    </div>
  );
}
