import { supabase } from './supabaseClient';

// Reproduit la surface de base44.auth utilisée dans le code existant :
// me, logout, redirectToLogin, resetPasswordRequest, resetPassword,
// loginViaEmailPassword, loginWithProvider, register, verifyOtp,
// setToken, resendOtp.
//
// ATTENTION (à valider en test réel, phase 3) : les flux OTP et
// réinitialisation de mot de passe de Supabase ont des détails différents
// de Base44 (types d'OTP, format des liens de redirection). Cette version
// est une première traduction fonctionnelle, à vérifier page par page
// (Login, Register, ForgotPassword, ResetPassword) avant mise en prod.

async function me() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  // On enrichit avec le rôle stocké dans app_user (admin/coach vs client).
  const { data: profile } = await supabase
    .from('app_user')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // On récupère aussi prénom/nom depuis client_profile pour reconstituer
  // full_name — plusieurs pages existantes (avatar, salutation d'accueil)
  // s'appuient sur ce champ, présent automatiquement chez Base44 mais
  // absent chez Supabase.
  const { data: clientProfile } = await supabase
    .from('client_profile')
    .select('prenom, nom')
    .eq('user_id', user.id)
    .maybeSingle();

  const full_name = [clientProfile?.prenom, clientProfile?.nom].filter(Boolean).join(' ') || undefined;

  return {
    id: user.id,
    email: user.email,
    full_name,
    role: profile?.role || 'user',
    ...profile,
  };
}

async function logout(redirectUrl) {
  await supabase.auth.signOut();
  if (redirectUrl) window.location.href = redirectUrl;
}

function redirectToLogin(returnUrl) {
  const target = returnUrl ? `/login?redirect=${encodeURIComponent(returnUrl)}` : '/login';
  window.location.href = target;
}

async function resetPasswordRequest(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
  return { sent: true };
}

async function resetPassword({ newPassword }) {
  // Suppose qu'une session valide existe déjà (l'utilisateur a cliqué le
  // lien reçu par email, Supabase l'a authentifié temporairement).
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
  return data;
}

async function loginViaEmailPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

async function loginWithProvider(provider, redirectTo) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTo ? `${window.location.origin}${redirectTo}` : undefined },
  });
  if (error) throw new Error(error.message);
  return data;
}

async function register({ email, password, prenom, nom, telephone }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { prenom, nom, telephone } },
  });
  if (error) throw new Error(error.message);
  return data;
}

async function verifyOtp({ email, otpCode }) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otpCode,
    type: 'signup',
  });
  if (error) throw new Error(error.message);
  return { ...data, access_token: data?.session?.access_token };
}

function setToken() {
  // No-op : Supabase gère lui-même la persistance de session (localStorage
  // interne au SDK). Conservé pour compatibilité d'appel uniquement.
}

async function resendOtp(email) {
  const { error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw new Error(error.message);
  return { sent: true };
}

// Supabase renvoie ses messages d'erreur en anglais — on les traduit ici
// pour les messages les plus courants rencontrés par les clients.
const MESSAGES_FR = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'User already registered': 'Un compte existe déjà avec cet email.',
  'Email not confirmed': "Veuillez confirmer votre email avant de vous connecter.",
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'Unable to validate email address: invalid format': 'Adresse email invalide.',
  'New password should be different from the old password.': "Le nouveau mot de passe doit être différent de l'ancien.",
};

export function translateAuthError(message) {
  if (!message) return "Une erreur est survenue. Veuillez réessayer.";
  if (MESSAGES_FR[message]) return MESSAGES_FR[message];
  const rateLimit = message.match(/after (\d+) seconds/);
  if (rateLimit) return `Merci de patienter ${rateLimit[1]} secondes avant de réessayer.`;
  return message;
}

export const authClient = {
  me,
  logout,
  redirectToLogin,
  resetPasswordRequest,
  resetPassword,
  loginViaEmailPassword,
  loginWithProvider,
  register,
  verifyOtp,
  setToken,
  resendOtp,
};
