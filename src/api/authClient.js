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

  return {
    id: user.id,
    email: user.email,
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

async function register({ email, password }) {
  const { data, error } = await supabase.auth.signUp({ email, password });
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
