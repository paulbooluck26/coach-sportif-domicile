import { supabase } from './supabaseClient';

// UploadFile : fonctionnel dès maintenant via Supabase Storage.
// Nécessite un bucket "uploads" créé dans Storage (public en lecture).
async function UploadFile({ file }) {
  const path = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('uploads').upload(path, file);
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from('uploads').getPublicUrl(path);
  return { file_url: data.publicUrl };
}

// SendEmail : PAS ENCORE FONCTIONNEL.
// Appelle une Edge Function "send-email" qui n'existe pas encore
// (construite en phase 3, avec un vrai fournisseur transactionnel type
// Resend). Pour l'instant, ça log un avertissement clair au lieu de
// planter silencieusement les parcours qui l'appellent (réservation,
// contact, etc.).
async function SendEmail({ to, subject, body }) {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body },
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn(
      '[SendEmail] Edge Function "send-email" pas encore déployée (phase 3). ' +
      `Email non envoyé — destinataire: ${to}, sujet: ${subject}`
    );
    return { sent: false, reason: 'edge_function_not_deployed' };
  }
}

export const integrationsClient = {
  Core: {
    UploadFile,
    SendEmail,
  },
};
