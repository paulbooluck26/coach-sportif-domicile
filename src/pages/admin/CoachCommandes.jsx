import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Clock, CheckCircle2, Hammer, Trash2, RotateCcw } from "lucide-react";

const OFFRES = { start: "START", forge: "FORGE", legacy: "LEGACY" };
const STATUTS = {
  en_preparation: { label: "En préparation", color: "bg-accent/15 text-accent", icon: Clock },
  pret: { label: "Prêt", color: "bg-secondary text-secondary-foreground", icon: CheckCircle2 },
  supprime: { label: "Supprimé", color: "bg-muted text-muted-foreground", icon: Trash2 },
};

const ONGLETS = [
  { key: "en_preparation", label: "À traiter" },
  { key: "pret", label: "Traités" },
  { key: "supprime", label: "Supprimés" },
];

export default function CoachCommandes() {
  const [commandes, setCommandes] = useState(null);
  const [onglet, setOnglet] = useState("en_preparation");
  const navigate = useNavigate();

  const load = async () => {
    const data = await base44.entities.CommandeProgramme.list("-created_date", 200);
    setCommandes(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const supprimer = async (cmd) => {
    await base44.entities.CommandeProgramme.update(cmd.id, { statut: "supprime" });
    load();
  };
  const restaurer = async (cmd) => {
    await base44.entities.CommandeProgramme.update(cmd.id, { statut: "en_preparation" });
    load();
  };

  if (!commandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const parOnglet = ONGLETS.reduce((acc, o) => {
    acc[o.key] = commandes.filter(c => (c.statut || "en_preparation") === o.key);
    return acc;
  }, {});
  const liste = parOnglet[onglet] || [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Commandes programmes</h1>
        <p className="text-sm text-muted-foreground mt-1">Achats de programmes en ligne — à préparer puis assigner au client.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {ONGLETS.map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${onglet === o.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {o.label} {parOnglet[o.key]?.length > 0 && <span className="ml-1 text-xs">({parOnglet[o.key].length})</span>}
          </button>
        ))}
      </div>

      {liste.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ShoppingBag className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {onglet === "en_preparation" && "Aucune commande à traiter pour le moment."}
            {onglet === "pret" && "Aucune commande traitée pour le moment."}
            {onglet === "supprime" && "Aucune commande supprimée."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {liste.map(cmd => {
            const st = STATUTS[cmd.statut || "en_preparation"];
            return (
              <div key={cmd.id} className={`bg-card border rounded-lg p-6 ${onglet === "en_preparation" ? "border-accent/30" : "border-border"} ${onglet === "supprime" ? "opacity-60" : ""}`}>
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

                  <div className="flex items-center gap-2 whitespace-nowrap">
                    {onglet === "en_preparation" && (
                      <>
                        <button onClick={() => navigate(`/admin/programmes?client_id=${cmd.client_id}&duree=${cmd.duree_semaines}&commande_id=${cmd.id}`)} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2">
                          <Hammer className="w-4 h-4" /> Créer le programme
                        </button>
                        <button onClick={() => supprimer(cmd)} title="Supprimer" className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {onglet === "pret" && (
                      <>
                        <button onClick={() => navigate("/admin/programmes")} className="text-sm text-accent hover:text-secondary">Voir les programmes →</button>
                        <button onClick={() => supprimer(cmd)} title="Supprimer" className="p-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {onglet === "supprime" && (
                      <button onClick={() => restaurer(cmd)} title="Restaurer" className="flex items-center gap-2 text-sm text-accent hover:text-secondary px-3 py-2">
                        <RotateCcw className="w-4 h-4" /> Restaurer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
