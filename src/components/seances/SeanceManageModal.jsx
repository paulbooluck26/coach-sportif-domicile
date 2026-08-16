import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useCreneaux } from "@/hooks/useCreneaux";
import { creneauxDisponibles, dateStr, parseDateLocal, typeLabelSeance as typeLabel } from "@/lib/creneaux";
import { annulerSeance, deplacerSeance, peutAnnulerAvecRemboursement, peutDeplacer } from "@/lib/gestionSeance";
import { X, AlertTriangle, CheckCircle2, Loader2, MapPin, Calendar } from "lucide-react";

export default function SeanceManageModal({ seance, onClose, onUpdated }) {
  const { user } = useAuth();
  const { recurrentes, reservees } = useCreneaux();
  const [mode, setMode] = useState("details"); // details | deplacer | confirmAnnuler
  const [nouvelleDate, setNouvelleDate] = useState(null);
  const [nouvelleHeure, setNouvelleHeure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState("");
  const [motif, setMotif] = useState("");

  const remboursable = peutAnnulerAvecRemboursement(seance);
  const deplaçable = peutDeplacer(seance);

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
  const slots = nouvelleDate ? creneauxDisponibles(parseDateLocal(nouvelleDate), recurrentes, reservees) : [];

  const confirmerAnnulation = async () => {
    setLoading(true);
    setErreur("");
    try {
      const res = await annulerSeance({ seance, user, motif: motif.trim() });
      setResultat({ type: "annulation", ...res });
    } catch (e) {
      setErreur(e.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const confirmerDeplacement = async () => {
    setLoading(true);
    setErreur("");
    try {
      await deplacerSeance({ seance, user, nouvelleDate, nouvelleHeure });
      setResultat({ type: "deplacement" });
    } catch (e) {
      setErreur(e.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-xl font-bold text-foreground">
            {resultat ? "C'est fait" : mode === "deplacer" ? "Déplacer ma séance" : "Ma séance"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {resultat ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-accent" />
            </div>
            {resultat.type === "annulation" ? (
              <>
                <p className="font-medium text-foreground mb-1">Séance annulée</p>
                <p className="text-sm text-muted-foreground">
                  {resultat.remboursement && "Remboursement effectué. "}
                  {resultat.creditRendu && "Votre crédit a été recrédité. "}
                  {!resultat.remboursement && !resultat.creditRendu && "Aucun remboursement (annulation à moins de 24h)."}
                </p>
              </>
            ) : (
              <p className="font-medium text-foreground">Séance déplacée avec succès.</p>
            )}
            <button onClick={() => { onUpdated(); onClose(); }} className="mt-6 w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm">Fermer</button>
          </div>
        ) : mode === "details" ? (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <p className="font-heading font-semibold text-foreground">{typeLabel(seance.session_type)}</p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /> {parseDateLocal(seance.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à {seance.time}</p>
              {seance.location && <p className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {seance.location}</p>}
            </div>

            {!deplaçable && (
              <div className="flex items-start gap-2 bg-secondary/10 border border-secondary/30 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">À moins de 24h de la séance, l'annulation ne donne plus droit à un remboursement ou un crédit, et le report n'est plus possible.</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setMode("deplacer")}
                disabled={!deplaçable}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-border text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Déplacer ma séance
              </button>
              <button
                onClick={() => setMode("confirmAnnuler")}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-destructive/10 text-destructive"
              >
                Annuler ma séance
              </button>
            </div>
          </div>
        ) : mode === "confirmAnnuler" ? (
          <div className="space-y-5">
            <p className="text-sm text-foreground/80">
              {remboursable
                ? "Vous annulez à plus de 24h : remboursement intégral, ou crédit recrédité si la séance venait d'un carnet."
                : "Vous annulez à moins de 24h : aucun remboursement ni crédit ne sera rendu."}
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Raison (facultatif)</label>
              <textarea
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Ex : imprévu, contretemps, changement de programme..."
                rows={2}
                className="w-full border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-accent resize-none"
              />
            </div>
            {erreur && <p className="text-sm text-destructive">{erreur}</p>}
            <div className="flex gap-3">
              <button onClick={() => setMode("details")} className="flex-1 py-3 rounded-xl font-medium text-sm border border-border text-muted-foreground">Retour</button>
              <button onClick={confirmerAnnulation} disabled={loading} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-destructive text-destructive-foreground disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer l'annulation"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-2">
              {dates.map((d) => (
                <button
                  key={dateStr(d)}
                  onClick={() => { setNouvelleDate(dateStr(d)); setNouvelleHeure(null); }}
                  className={`p-2.5 rounded-lg text-center transition-all ${nouvelleDate === dateStr(d) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-foreground"}`}
                >
                  <p className="text-[10px] capitalize">{d.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
                  <p className="text-sm font-heading font-bold mt-0.5">{d.getDate()}</p>
                </button>
              ))}
            </div>
            {nouvelleDate && (
              slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun créneau disponible ce jour-là.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((h) => (
                    <button key={h} onClick={() => setNouvelleHeure(h)} className={`py-2.5 rounded-lg text-sm font-medium border ${nouvelleHeure === h ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground"}`}>{h}</button>
                  ))}
                </div>
              )
            )}
            {erreur && <p className="text-sm text-destructive">{erreur}</p>}
            <div className="flex gap-3">
              <button onClick={() => setMode("details")} className="flex-1 py-3 rounded-xl font-medium text-sm border border-border text-muted-foreground">Retour</button>
              <button onClick={confirmerDeplacement} disabled={loading || !nouvelleDate || !nouvelleHeure} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer le nouveau créneau"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
