import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { redirigerVersAbonnementStripe } from "@/lib/abonnementCheckout";
import { Check, ArrowRight, Home, Layers, Sparkles, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";

// Même correspondance que côté serveur.
const OFFRE_ID_PAR_SKU = {
  "coaching-essentiel": "essentiel",
  "coaching-performance-abo": "performance",
  "coaching-hybrid": "hybrid",
  "coaching-signature": "signature",
};

function OffreCard({ p, highlight }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const abonnement = p.type_facturation === "abonnement";

  const sabonner = async () => {
    if (!user) {
      navigate("/login?redirect=/reserver");
      return;
    }
    setLoading(true);
    setErreur("");
    try {
      await redirigerVersAbonnementStripe({
        offreId: OFFRE_ID_PAR_SKU[p.sku],
        successPath: "/espace-client/profil?abonnement=confirme",
        cancelPath: "/reserver",
      });
    } catch (e) {
      setErreur(e.message);
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.02] flex flex-col ${
        highlight ? "bg-primary text-primary-foreground border-primary shadow-xl lg:-translate-y-2" : "bg-background border-accent/30"
      }`}
    >
      {p.metadata?.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-secondary text-secondary-foreground text-[10px] font-semibold rounded-full tracking-wide flex items-center gap-1 whitespace-nowrap">
          <Sparkles className="w-3 h-3" /> {p.metadata.badge}
        </span>
      )}
      <h3 className={`text-xl font-heading font-bold ${highlight ? "text-primary-foreground" : "text-primary"}`}>{p.nom}</h3>
      <div className="flex items-baseline gap-1 my-3">
        <span className={`text-3xl font-heading font-bold ${highlight ? "text-secondary" : "text-primary"}`}>{p.prix_ttc}€</span>
        {abonnement && <span className={`text-sm ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>/mois</span>}
      </div>
      <ul className="space-y-2 mb-6 flex-1">
        {(p.metadata?.inclus || []).map((f, j) => (
          <li key={j} className={`flex items-start gap-2 text-sm ${highlight ? "text-primary-foreground/80" : "text-foreground/80"}`}>
            <Check className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
      {p.engagement_mois && (
        <p className={`text-xs mb-2 ${highlight ? "text-primary-foreground/50" : "text-muted-foreground"}`}>Engagement {p.engagement_mois} mois</p>
      )}
      {erreur && <p className="text-xs text-destructive mb-3">{erreur}</p>}
      <button
        onClick={sabonner}
        disabled={loading}
        className={`flex items-center justify-center gap-2 w-full py-3 rounded-full text-sm font-semibold transition-all duration-300 disabled:opacity-60 ${
          highlight ? "bg-secondary text-secondary-foreground hover:scale-105" : "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>S'abonner <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

export default function Tarifs() {
  const [produits, setProduits] = useState(null);

  useEffect(() => {
    base44.entities.Produit.filter({ categorie: "coaching_domicile", actif: true, visible_public: true }, "ordre_affichage")
      .then(setProduits)
      .catch(() => setProduits([]));
  }, []);

  if (!produits) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  const pur = produits.filter((p) => p.sous_categorie === "pur");
  const hybride = produits.filter((p) => p.sous_categorie === "hybride");
  const bilan = produits.find((p) => p.sku === "coaching-bilan");
  const pack = produits.find((p) => p.sku === "coaching-pack-intensif");

  const comparatif = [...pur, ...hybride].sort((a, b) => a.prix_ttc - b.prix_ttc);

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Tarifs Coaching à Domicile"
        description="Découvrez nos formules de coaching sportif à domicile à Colmar : accompagnement pur ou hybride, du suivi ponctuel à l'engagement complet."
        path="/reserver"
      />

      <section className="max-w-3xl mx-auto px-6 lg:px-10 text-center mb-16">
        <p className="text-sm md:text-base font-bold tracking-[0.2em] text-secondary mb-4 uppercase">Coaching à domicile</p>
        <h1 className="text-4xl lg:text-6xl font-heading font-bold text-primary leading-tight mb-6">
          Un accompagnement qui s'adapte à vous
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          Colmar et alentours. Paiement sécurisé en ligne. Annulation gratuite jusqu'à 24h avant la séance.
        </p>
      </section>

      <p className="text-center text-xs font-bold tracking-[0.25em] text-muted-foreground uppercase mb-12">Choisissez votre niveau d'accompagnement</p>

      {pur.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 lg:px-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0"><Home className="w-5 h-5 text-secondary" /></div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary">Coaching à domicile</h2>
              <p className="text-sm text-muted-foreground">Votre coach est présent à chaque entraînement.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {pur.map((p) => <OffreCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {hybride.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 lg:px-10 mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center shrink-0"><Layers className="w-5 h-5 text-secondary" /></div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-primary">Coaching hybride</h2>
              <p className="text-sm text-muted-foreground">Votre coach vous accompagne, même lorsque vous vous entraînez seul.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {hybride.map((p) => <OffreCard key={p.id} p={p} highlight={!!p.metadata?.dominant} />)}
          </div>
        </section>
      )}

      {comparatif.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 lg:px-10 mb-16">
          <h2 className="text-xl font-heading font-bold text-primary uppercase text-center mb-6">Quelle formule vous correspond ?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <thead>
                <tr>
                  <th className="text-left py-3 pr-4 text-muted-foreground font-medium"></th>
                  {comparatif.map((p) => (
                    <th key={p.id} className="text-center py-3 px-3 font-heading font-bold text-primary">
                      {p.nom.replace("PHYSIS ", "")}
                      {p.metadata?.badge && <span className="block text-[10px] font-semibold text-secondary normal-case mt-0.5">{p.metadata.badge}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 pr-4 text-muted-foreground">Séances à domicile</td>
                  {comparatif.map((p) => <td key={p.id} className="text-center py-3 px-3 text-foreground">{p.sous_categorie === "hybride" ? (p.nb_seances_domicile_mois > 5 ? "2/sem." : "1/sem.") : `${p.nb_seances_domicile_mois}/mois`}</td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-muted-foreground">Séances autonomes</td>
                  {comparatif.map((p) => <td key={p.id} className="text-center py-3 px-3 text-foreground">{p.nb_seances_autonomes_mois ? (p.nb_seances_autonomes_mois > 5 ? "2/sem." : "1/sem.") : "—"}</td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-muted-foreground">Application Physis</td>
                  {comparatif.map((p) => <td key={p.id} className="text-center py-3 px-3"><Check className="w-4 h-4 text-secondary mx-auto" /></td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-muted-foreground">Engagement</td>
                  {comparatif.map((p) => <td key={p.id} className="text-center py-3 px-3 text-foreground">{p.engagement_mois ? `${p.engagement_mois} mois` : "—"}</td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-muted-foreground align-top">Idéal pour...</td>
                  {comparatif.map((p) => <td key={p.id} className="text-center py-3 px-3 text-foreground text-xs leading-snug">{p.ideal_si}</td>)}
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-muted-foreground font-medium">Prix mensuel</td>
                  {comparatif.map((p) => <td key={p.id} className="text-center py-3 px-3 font-heading font-bold text-primary">{p.prix_ttc}€</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="bg-primary py-16 mb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-xl font-heading font-bold text-primary-foreground uppercase mb-8">Pourquoi choisir l'accompagnement hybride ?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
            {["Coaching", "Autonomie", "Suivi", "Progression"].map((etape, i) => (
              <div key={etape} className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary-foreground bg-primary-foreground/10 px-4 py-2 rounded-full">{etape}</span>
                {i < 3 && <ArrowRight className="w-4 h-4 text-accent hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 lg:px-10 grid sm:grid-cols-2 gap-5">
        {bilan && (
          <div className="bg-background border border-accent/30 rounded-2xl p-6">
            <p className="text-xs font-bold tracking-wider text-secondary uppercase mb-1.5">Vous ne savez pas par où commencer ?</p>
            <h3 className="text-lg font-heading font-bold text-primary mb-1">{bilan.nom} — {bilan.prix_ttc}€</h3>
            <p className="text-sm text-muted-foreground mb-1">{bilan.description}</p>
            <p className="text-xs text-secondary mb-5">80€ déduits du premier mois si engagement sous 14 jours.</p>
            <Link to="/espace-client/reserver/domicile" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              Réserver <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
        {pack && (
          <div className="bg-background border border-accent/30 rounded-2xl p-6">
            <p className="text-xs font-bold tracking-wider text-secondary uppercase mb-1.5">Vous préférez rester sans abonnement ?</p>
            <h3 className="text-lg font-heading font-bold text-primary mb-1">{pack.nom} — {pack.prix_ttc}€</h3>
            <p className="text-sm text-muted-foreground mb-5">{pack.description} · {pack.metadata?.nb_seances} séances.</p>
            <Link to="/espace-client/reserver/domicile" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              Acheter <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
