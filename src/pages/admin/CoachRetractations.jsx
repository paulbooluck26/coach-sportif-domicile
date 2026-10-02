import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { RotateCcw, Loader2, Info } from "lucide-react";
import { calculerPropositionRemboursement } from "@/lib/calculRetractation";
import JournalExecutionContrat from "@/components/admin/JournalExecutionContrat";

const STATUTS = {
  recue: { label: "En attente", cls: "bg-accent/15 text-accent" },
  instruite: { label: "Instruite", cls: "bg-secondary text-secondary-foreground" },
  remboursement_valide: { label: "Montant validé", cls: "bg-secondary/15 text-secondary" },
  cloturee: { label: "Clôturée", cls: "bg-muted text-muted-foreground" },
};

const ONGLETS = [
  { key: "recue", label: "En attente" },
  { key: "instruite", label: "Instruites" },
  { key: "cloturee", label: "Clôturées" },
];

export default function CoachRetractations() {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState(null);
  const [onglet, setOnglet] = useState("recue");
  const [detail, setDetail] = useState(null); // { demande, contrat, evenements, proposition }
  const [chargementDetail, setChargementDetail] = useState(false);
  const [montantSaisi, setMontantSaisi] = useState("");
  const [motif, setMotif] = useState("");
  const [enregistrement, setEnregistrement] = useState(false);

  const load = async () => {
    const data = await base44.entities.DemandeRetractation.list("-date_reception", 200);
    setDemandes(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  if (!demandes) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const parOnglet = {
    recue: demandes.filter((d) => d.statut === "recue"),
    instruite: demandes.filter((d) => ["instruite", "remboursement_valide"].includes(d.statut)),
    cloturee: demandes.filter((d) => d.statut === "cloturee"),
  };
  const liste = parOnglet[onglet] || [];

  const ouvrir = async (demande) => {
    setChargementDetail(true);
    setDetail({ demande });
    try {
      const [contrat, evenements] = await Promise.all([
        base44.entities.Contrat.get(demande.contrat_id),
        base44.entities.EvenementExecution.filter({ contrat_id: demande.contrat_id }),
      ]);
      const proposition = calculerPropositionRemboursement(contrat, evenements);
      setDetail({ demande, contrat, evenements, proposition });
      setMontantSaisi(String(demande.montant_valide ?? proposition.montantRembourseProposePar));
      setMotif(demande.motif_admin || "");
    } finally {
      setChargementDetail(false);
    }
  };

  // Après une modification du journal (ajout ou annulation d'une entrée),
  // la proposition est recalculée ; un montant déjà modifié à la main
  // par l'admin n'est pas écrasé.
  const recalculer = async () => {
    if (!detail?.demande) return;
    const [contrat, evenements] = await Promise.all([
      base44.entities.Contrat.get(detail.demande.contrat_id),
      base44.entities.EvenementExecution.filter({ contrat_id: detail.demande.contrat_id }),
    ]);
    const proposition = calculerPropositionRemboursement(contrat, evenements);
    const ancienne = detail.proposition?.montantRembourseProposePar;
    setDetail((d) => ({ ...d, contrat, evenements, proposition }));
    if (Number(montantSaisi) === ancienne) setMontantSaisi(String(proposition.montantRembourseProposePar));
  };

  const fermer = () => { setDetail(null); setMontantSaisi(""); setMotif(""); };

  const valider = async () => {
    if (!detail?.demande || !motif.trim()) return;
    setEnregistrement(true);
    try {
      await base44.entities.DemandeRetractation.update(detail.demande.id, {
        statut: "remboursement_valide",
        montant_propose: detail.proposition.montantRembourseProposePar,
        montant_valide: Number(montantSaisi),
        motif_admin: motif.trim(),
        calcul_detail: detail.proposition,
      });
      fermer();
      load();
    } finally {
      setEnregistrement(false);
    }
  };

  const cloturer = async () => {
    if (!detail?.demande) return;
    setEnregistrement(true);
    try {
      await base44.entities.DemandeRetractation.update(detail.demande.id, {
        statut: "cloturee",
        date_cloture: new Date().toISOString(),
        cloturee_par: user?.id,
      });
      fermer();
      load();
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Rétractations</h1>
        <p className="text-sm text-muted-foreground mt-1">Demandes de rétractation légale — calcul indicatif, validation manuelle obligatoire. Aucun remboursement Stripe n'est déclenché depuis cet écran.</p>
      </div>

      <details className="group bg-secondary/10 border border-secondary/30 rounded-lg px-5 py-3 text-sm">
        <summary className="flex items-center gap-2 cursor-pointer font-medium text-foreground select-none">
          <Info className="w-4 h-4 text-secondary" /> Comment fonctionne cet écran ?
        </summary>
        <ul className="mt-3 space-y-2 text-foreground/80 leading-relaxed list-disc pl-5">
          <li><strong>Statut du contrat</strong> : « payée » après le paiement ; dès qu'un client confirme sa rétractation, il passe en « rétractation demandée » et l'exécution est suspendue. Le dossier n'est clôturé qu'après votre instruction ici, jamais automatiquement.</li>
          <li><strong>Journal d'exécution</strong> : liste datée de ce qui a réellement été fourni (bilan, séances, suivi...). Vous la complétez avec « Marquer un événement ». Elle n'est jamais effacée : une erreur se corrige avec « Annuler / corriger », qui ajoute une ligne de correction avec motif ; l'entrée annulée reste visible mais n'est plus valorisée.</li>
          <li><strong>Grille de valorisation</strong> : le calcul applique la grille interne (poids par offre) aux seules entrées valides du journal, jamais un prorata de temps. C'est une proposition indicative, à faire valider par un juriste avant mise en production.</li>
          <li><strong>Validation manuelle</strong> : vous fixez le montant retenu (la proposition peut être corrigée) avec un motif obligatoire, conservé dans l'historique, puis vous clôturez le dossier.</li>
          <li><strong>Aucun remboursement Stripe automatique</strong> : cet écran n'envoie rien à Stripe ni au client ; un remboursement éventuel se fait à la main dans Stripe.</li>
        </ul>
      </details>

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
          <RotateCcw className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune demande dans cet onglet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reçue le</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Montant validé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {liste.map((d) => {
                const st = STATUTS[d.statut] || STATUTS.recue;
                return (
                  <tr key={d.id} onClick={() => ouvrir(d)} className="hover:bg-secondary/20 cursor-pointer">
                    <td className="px-6 py-4">{new Date(d.date_reception).toLocaleString("fr-FR")}</td>
                    <td className="px-6 py-4">{d.email_accuse_destination}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span></td>
                    <td className="px-6 py-4 font-semibold text-foreground">{d.montant_valide != null ? `${d.montant_valide}€` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={fermer}>
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {chargementDetail || !detail.contrat ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground mb-1">{detail.contrat.offre_snapshot?.nom}</h2>
                  <p className="text-xs text-muted-foreground">Contrat {detail.contrat.id} — payé {detail.contrat.prix_detail?.total}€</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Déclaration du client</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-secondary/10 rounded-lg p-4">{detail.demande.texte_declaration}</p>
                </div>

                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Proposition indicative — pas une décision</p>
                  <p className="text-sm text-foreground">Montant payé : <strong>{detail.proposition.montantPaye}€</strong></p>
                  <p className="text-sm text-foreground">Valeur du service fourni (estimée) : <strong>{detail.proposition.montantConsomme}€</strong></p>
                  <p className="text-sm text-foreground">Remboursement proposé : <strong>{detail.proposition.montantRembourseProposePar}€</strong></p>
                  {detail.proposition.nbEvenementsAnnules > 0 && (
                    <p className="text-xs text-muted-foreground">{detail.proposition.nbEvenementsAnnules} entrée(s) annulée(s) du journal ignorée(s) dans ce calcul.</p>
                  )}
                  <p className="text-xs text-muted-foreground">{detail.proposition.avertissement}</p>
                  <pre className="text-xs text-muted-foreground bg-card rounded p-3 overflow-x-auto">{JSON.stringify(detail.proposition.detail, null, 2)}</pre>
                </div>

                <JournalExecutionContrat contratId={detail.contrat.id} onChange={recalculer} />

                {detail.demande.statut === "recue" || detail.demande.statut === "instruite" ? (
                  <div className="space-y-3 border-t border-border pt-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Montant validé (€)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={montantSaisi}
                        onChange={(e) => setMontantSaisi(e.target.value)}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Motif (obligatoire, conservé pour audit)</label>
                      <textarea
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                        rows={3}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent resize-none"
                      />
                    </div>
                    <button
                      onClick={valider}
                      disabled={enregistrement || !motif.trim() || montantSaisi === ""}
                      className="w-full bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50"
                    >
                      {enregistrement ? "Enregistrement..." : "Valider ce montant"}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-border pt-4 text-sm text-foreground">
                    <p>Montant validé : <strong>{detail.demande.montant_valide}€</strong></p>
                    <p className="text-muted-foreground mt-1">Motif : {detail.demande.motif_admin}</p>
                  </div>
                )}

                {detail.demande.statut === "remboursement_valide" && (
                  <button
                    onClick={cloturer}
                    disabled={enregistrement}
                    className="w-full border border-border text-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50"
                  >
                    Clôturer le dossier
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
