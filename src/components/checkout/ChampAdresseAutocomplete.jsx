import { useState, useEffect, useRef, useId } from "react";
import { MapPin } from "lucide-react";
import { chercherAdresses } from "@/lib/adresseBan";

// Champ texte avec propositions d'adresses (API Adresse data.gouv.fr).
// La saisie libre reste toujours possible : le champ ne bloque jamais
// l'utilisateur si l'adresse est hors France ou absente de la base.
export default function ChampAdresseAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Commencez à saisir votre adresse…",
  disabled = false,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(-1);
  const idListe = useId();
  const conteneur = useRef(null);
  const saisieUtilisateur = useRef(false);

  useEffect(() => {
    if (!saisieUtilisateur.current) return;
    if ((value || "").trim().length < 3) {
      setSuggestions([]);
      setOuvert(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await chercherAdresses(value, { signal: ctrl.signal });
        setSuggestions(res);
        setActif(-1);
        setOuvert(res.length > 0);
      } catch (e) {
        if (e.name !== "AbortError") { setSuggestions([]); setOuvert(false); }
      }
    }, 250);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [value]);

  useEffect(() => {
    const fermerSiExterieur = (e) => {
      if (conteneur.current && !conteneur.current.contains(e.target)) setOuvert(false);
    };
    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, []);

  const choisir = (s) => {
    saisieUtilisateur.current = false;
    setOuvert(false);
    setSuggestions([]);
    onSelect(s);
  };

  const onKeyDown = (e) => {
    if (!ouvert || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActif((i) => (i + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActif((i) => (i <= 0 ? suggestions.length - 1 : i - 1)); }
    else if (e.key === "Enter" && actif >= 0) { e.preventDefault(); choisir(suggestions[actif]); }
    else if (e.key === "Escape") setOuvert(false);
  };

  return (
    <div ref={conteneur} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
      <input
        role="combobox"
        aria-expanded={ouvert}
        aria-controls={idListe}
        aria-autocomplete="list"
        aria-activedescendant={actif >= 0 ? `${idListe}-${actif}` : undefined}
        autoComplete="off"
        disabled={disabled}
        value={value}
        onChange={(e) => { saisieUtilisateur.current = true; onChange(e.target.value); }}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOuvert(true)}
        placeholder={placeholder}
        className="w-full border border-border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent"
      />
      {ouvert && suggestions.length > 0 && (
        <ul
          id={idListe}
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.map((s, i) => (
            <li
              key={`${s.label}-${i}`}
              id={`${idListe}-${i}`}
              role="option"
              aria-selected={i === actif}
              onMouseDown={(e) => { e.preventDefault(); choisir(s); }}
              onMouseEnter={() => setActif(i)}
              className={`px-4 py-2.5 text-sm cursor-pointer ${i === actif ? "bg-secondary/20" : ""} text-foreground`}
            >
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
