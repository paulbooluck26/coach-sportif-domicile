import { useState } from "react";
import ChampAdresseAutocomplete from "@/components/checkout/ChampAdresseAutocomplete";

// Adresse postale structurée du Client, capturée une fois par
// commande et figée sur le contrat (cahier des charges §3 : "Identité
// du Client — Nom, email, adresse postale, identifiant compte").
// Une recherche avec propositions (API Adresse data.gouv.fr) remplit
// les trois champs ; ils restent modifiables à la main (adresse hors
// France, numéro absent de la base...).
//
// onChange(valeur, depuisSuggestion) : le second argument vaut true
// quand l'adresse vient d'une proposition sélectionnée (donc fiable),
// false quand elle a été tapée/corrigée à la main.
export default function AdressePostale({
  value,
  onChange,
  disabled = false,
  titre = "Votre adresse",
  aide = "Utilisée pour identifier votre commande (preuve d'achat).",
}) {
  const [recherche, setRecherche] = useState("");
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value }, false);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{titre}</label>
        <ChampAdresseAutocomplete
          value={recherche}
          onChange={setRecherche}
          disabled={disabled}
          onSelect={(s) => {
            setRecherche(s.label);
            onChange({ ...value, rue: s.rue, codePostal: s.codePostal, ville: s.ville, pays: "France" }, true);
          }}
        />
        <p className="text-xs text-muted-foreground mt-1.5">Tapez votre adresse puis choisissez une proposition : les champs ci-dessous se remplissent automatiquement.</p>
      </div>
      <div>
        <input
          required
          disabled={disabled}
          value={value.rue}
          onChange={set("rue")}
          placeholder="Numéro et rue"
          className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input
          required
          disabled={disabled}
          value={value.codePostal}
          onChange={set("codePostal")}
          placeholder="Code postal"
          className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
        />
        <input
          required
          disabled={disabled}
          value={value.ville}
          onChange={set("ville")}
          placeholder="Ville"
          className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
        />
      </div>
      {aide && <p className="text-xs text-muted-foreground">{aide}</p>}
    </div>
  );
}

export const adressePostaleVide = () => ({ rue: "", codePostal: "", ville: "", pays: "France" });
export const adressePostaleValide = (v) => !!(v.rue?.trim() && v.codePostal?.trim() && v.ville?.trim());
