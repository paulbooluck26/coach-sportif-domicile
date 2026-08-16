import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { translateAuthError } from "@/api/authClient";
import { supabase } from "@/api/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  // Supabase transmet la validité du lien via une session temporaire
  // établie automatiquement à l'ouverture de la page (pas un ?token=
  // dans l'adresse, contrairement à l'ancienne convention Base44).
  const [checkingLink, setCheckingLink] = useState(true);
  const [linkValide, setLinkValide] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLinkValide(!!data?.session);
      setCheckingLink(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(translateAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  if (checkingLink) {
    return (
      <AuthLayout icon={Lock} title="Vérification du lien" subtitle="Un instant...">
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AuthLayout>
    );
  }

  if (!linkValide) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Lien invalide"
        subtitle="Ce lien de réinitialisation est manquant, invalide ou expiré"
        footer={
          <Link to="/forgot-password" className="text-primary font-medium hover:underline">
            Demander un nouveau lien
          </Link>
        }
      >
        <p className="text-sm text-foreground text-center">
          Le lien que vous avez utilisé n'est plus valable (il expire après un certain temps, ou a peut-être déjà été utilisé). Veuillez demander un nouvel email de réinitialisation.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="Nouveau mot de passe"
      subtitle="Saisissez votre nouveau mot de passe ci-dessous"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmer le mot de passe</Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Réinitialisation…
            </>
            ) : (
            "Réinitialiser"
            )}
        </Button>
      </form>
    </AuthLayout>
  );
}
