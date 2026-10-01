// Adresse postale structurée du Client, capturée une fois par
// commande et figée sur le contrat (cahier des charges §3 : "Identité
// du Client — Nom, email, adresse postale, identifiant compte").
// Distincte de l'adresse d'intervention à domicile (ClientProfile.adresse,
// ou le champ "Adresse de la séance" du flux Domicile) : cette
// adresse-ci n'est jamais réutilisée pour localiser le coach, elle ne
// sert qu'à identifier le Client dans la preuve de commande.
export default function AdressePostale({ value, onChange, disabled = false }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Adresse postale</label>
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
      <p className="text-xs text-muted-foreground">Utilisée uniquement pour l'identification de votre commande (preuve d'achat) — pas pour localiser vos séances.</p>
    </div>
  );
}

export const adressePostaleVide = () => ({ rue: "", codePostal: "", ville: "", pays: "France" });
export const adressePostaleValide = (v) => !!(v.rue?.trim() && v.codePostal?.trim() && v.ville?.trim());
