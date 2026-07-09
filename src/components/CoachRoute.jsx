import { useAuth } from "@/lib/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function CoachRoute() {
  const { user, authChecked, isLoadingAuth } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center max-w-md">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-4">Accès réservé</h1>
          <p className="text-muted-foreground mb-8">Cet espace est réservé au coach. Votre compte n'a pas les permissions nécessaires.</p>
          <a href="/" className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold text-sm">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}