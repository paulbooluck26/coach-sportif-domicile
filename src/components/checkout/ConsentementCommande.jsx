import { Link } from "react-router-dom";
import { CGV_URL, CGV_VERSION, TEXTE_CGV, TEXTE_COMMENCEMENT_IMMEDIAT } from "@/lib/legalConfig";

// Deux cases distinctes, jamais fusionnées, jamais précochées par
// défaut (cahier des charges §2). Le composant ne décide jamais
// lui-même de leur état — il reflète et remonte l'état contrôlé par
// la page appelante, qui doit désactiver le bouton de commande tant
// que les deux ne sont pas cochées.
export default function ConsentementCommande({
  cgvAcceptee,
  onCgvChange,
  commencementImmediat,
  onCommencementChange,
  disabled = false,
}) {
  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2.5 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={cgvAcceptee}
          onChange={(e) => onCgvChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 w-4 h-4 flex-shrink-0"
        />
        <span>
          {TEXTE_CGV}{" "}
          <Link to={CGV_URL} target="_blank" rel="noopener noreferrer" className="underline text-accent">
            Consulter les CGV (version {CGV_VERSION})
          </Link>
        </span>
      </label>

      <label className="flex items-start gap-2.5 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={commencementImmediat}
          onChange={(e) => onCommencementChange(e.target.checked)}
          disabled={disabled}
          className="mt-0.5 w-4 h-4 flex-shrink-0"
        />
        <span>{TEXTE_COMMENCEMENT_IMMEDIAT}</span>
      </label>
    </div>
  );
}
