// Empreinte du texte des CGV, conservée sur chaque contrat au moment
// de la commande (cahier des charges §3 : "idéalement empreinte
// (hash) du document"). Utilise l'API Web Crypto native — aucune
// dépendance supplémentaire nécessaire.
export async function hashTexte(texte) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
