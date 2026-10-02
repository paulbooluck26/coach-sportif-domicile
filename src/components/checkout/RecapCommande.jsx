import { IDENTITE_PRO } from "@/lib/legalConfig";

// Récapitulatif affiché juste avant les cases de consentement et le
// bouton de commande : prestation, prix détaillé, total, durée /
// engagement (art. L.221-14 du Code de la consommation : ces
// informations doivent être communiquées de façon claire et apparente
// immédiatement avant la commande ; CGV Article 4).
export default function RecapCommande({ lignes, total, suffixeTotal = "", notes = [] }) {
  return (
    <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Récapitulatif de votre commande</p>
      <div className="space-y-1">
        {lignes.map((l) => (
          <div key={l.label} className="flex justify-between gap-3 text-sm text-foreground/80">
            <span>{l.label}</span>
            <span className="whitespace-nowrap">{l.valeur}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between gap-3 border-t border-secondary/30 pt-2 text-foreground">
        <span className="font-semibold">Total à payer</span>
        <span className="font-heading font-bold text-lg whitespace-nowrap">{total}€{suffixeTotal}</span>
      </div>
      <p className="text-xs text-muted-foreground">{IDENTITE_PRO.mentionTva}.</p>
      {notes.map((n) => <p key={n} className="text-xs text-foreground/70">{n}</p>)}
    </div>
  );
}
