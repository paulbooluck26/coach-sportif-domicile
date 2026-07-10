import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Clock, CheckCircle2, Hammer } from "lucide-react";

const OFFRES = { decouverte: "Découverte", transformation: "Transformation", premium: "Premium" };
const STATUTS = {
  en_preparation: { label: "En préparation", color: "bg-accent/15 text-accent", icon: Clock },
  pret: { label: "Prêt", color: "bg-secondary text-secondary-foreground", icon: CheckCircle2 },
};

export default function CoachCommandes() {
  const [commandes, setCommandes] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    const data = await base44.entities.CommandeProgramme.list("-created_date", 200);
    setCommandes(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  if (!commandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const enPrep = commandes.filter(c => c.statut === "en_preparation");
  const prets = commandes.filter(c => c.statut === "pret");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Commandes programmes</h1>
        <p className="text-sm text-muted-foreground mt-1">Achats de programmes en ligne — à préparer puis assigner au client.</p>
      </div>

      {commandes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune commande pour le moment. Les achats de programmes en ligne apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <>
          {enPrep.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">À préparer ({enPrep.length})</h2>
              <div className="space-y-3">
                {enPrep.map(cmd => {
                  const st = STATUTS[cmd.statut];
                  return (
                    <div key={cmd.id} className="bg-card border border-accent/30 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-heading font-semibold text-foreground">{cmd.client_nom || "Client"}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {cmd.client_email && <span>{cmd.client_email}</span>}
                            <span>Offre : <strong className="text-foreground">{OFFRES[cmd.offre] || cmd.offre}</strong></span>
                            <span>{cmd.duree_semaines} semaines</span>
                            <span className="font-semibold text-foreground">{cmd.montant}€</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Acheté le {new Date(cmd.date_achat).toLocaleDateString("fr-FR")}</p>
                        </div>
                        <button onClick={() => navigate(`/admin/programmes?client_id=${cmd.client_id}&duree=${cmd.duree_semaines}&commande_id=${cmd.id}`)} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                          <Hammer className="w-4 h-4" /> Créer le programme
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {prets.length > 0 && (
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground mb-3">Livrés ({prets.length})</h2>
              <div className="space-y-3">
                {prets.map(cmd => {
                  const st = STATUTS[cmd.statut];
                  return (
                    <div key={cmd.id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading font-semibold text-foreground">{cmd.client_nom || "Client"}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {cmd.client_email && <span>{cmd.client_email}</span>}
                        <span>Offre : <strong className="text-foreground">{OFFRES[cmd.offre] || cmd.offre}</strong></span>
                        <span className="font-semibold text-foreground">{cmd.montant}€</span>
                      </div>
                      <button onClick={() => navigate("/admin/programmes")} className="text-sm text-accent hover:text-secondary mt-2">Voir les programmes →</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}