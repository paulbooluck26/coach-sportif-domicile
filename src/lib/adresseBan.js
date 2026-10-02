// Autocomplétion d'adresse via l'API Adresse de data.gouv.fr (Base
// Adresse Nationale) : service public, gratuit, sans clé d'API. Ne
// couvre que la France — la saisie manuelle reste donc toujours
// possible dans les composants qui l'utilisent.
const BAN_URL = "https://api-adresse.data.gouv.fr/search/";

function versSuggestion(feature) {
  const p = feature.properties || {};
  return {
    label: p.label,
    rue: p.type === "municipality" ? "" : p.name || "",
    codePostal: p.postcode || "",
    ville: p.city || "",
    score: p.score ?? 0,
  };
}

export async function chercherAdresses(texte, { signal, limite = 5 } = {}) {
  const q = (texte || "").trim();
  if (q.length < 3) return [];
  const url = `${BAN_URL}?q=${encodeURIComponent(q)}&limit=${limite}&autocomplete=1`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`BAN ${res.status}`);
  const json = await res.json();
  return (json.features || []).map(versSuggestion).filter((s) => s.label);
}

// Meilleure correspondance pour un texte libre déjà enregistré (ex.
// ancienne adresse de profil) — renvoie null si la confiance est faible.
export async function geocoderTexte(texte, { scoreMin = 0.6 } = {}) {
  try {
    const [premier] = await chercherAdresses(texte, { limite: 1 });
    return premier && premier.score >= scoreMin && premier.rue ? premier : null;
  } catch {
    return null;
  }
}

export function formaterAdresse({ rue, codePostal, ville } = {}) {
  const fin = [codePostal, ville].filter(Boolean).join(" ");
  return [rue, fin].filter((x) => x && x.trim()).join(", ");
}
