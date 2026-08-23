import { supabase } from "@/api/supabaseClient";

/**
 * Crée un vrai abonnement Stripe (prélèvement mensuel automatique) et
 * redirige vers la page de paiement Stripe hébergée.
 */
export async function redirigerVersAbonnementStripe({ offreId, successPath, cancelPath }) {
  const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
    body: {
      offre_id: offreId,
      success_path: successPath,
      cancel_path: cancelPath || successPath,
      origin: window.location.origin,
    },
  });
  if (error || !data?.url) {
    throw new Error(data?.error || error?.message || "Impossible de créer l'abonnement.");
  }
  window.location.href = data.url;
}
