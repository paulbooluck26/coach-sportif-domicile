import { base44 } from "@/api/base44Client";

/**
 * Architecture de notification client lors d'un changement de rendez-vous.
 *
 * Canal implémenté : notification in-app (entité Notification).
 * Canal email : préparé et désactivé par défaut — à activer quand le canal
 * (email / SMS) sera défini. Il suffit de décommenter l'envoi ci-dessous.
 */
export async function notifierRdv({ client_id, titre, message }) {
  if (!client_id) return;
  try {
    await base44.entities.Notification.create({
      client_id,
      titre,
      message,
      type: "rappel",
      lu: false,
    });
    // Canal email (préparé, désactivé par défaut) :
    // await base44.integrations.Core.SendEmail({ to: email, subject: titre, body: message });
  } catch {
    // ne pas bloquer l'action du coach si la notification échoue
  }
}

export function fmtDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}