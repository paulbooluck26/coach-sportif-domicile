import { supabase } from "@/api/supabaseClient";

/**
 * Crée une session de paiement Stripe côté serveur, puis redirige le
 * navigateur du client vers la page de paiement Stripe hébergée.
 * La réservation/le carnet/la commande ne sera créé QU'UNE FOIS le
 * paiement confirmé (via le webhook Stripe, côté serveur) — jamais avant.
 */
export async function redirigerVersStripe({ nom, montant, metadata, successPath, cancelPath }) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      nom,
      montant,
      metadata,
      success_path: successPath,
      cancel_path: cancelPath || successPath,
      origin: window.location.origin,
    },
  });
  if (error || !data?.url) {
    throw new Error(error?.message || "Impossible de créer la session de paiement.");
  }
  window.location.href = data.url;
}
