import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  // Retient toujours où l'utilisateur essayait d'aller — pour qu'il y
  // atterrisse une fois connecté, plutôt que sur l'accueil par défaut.
  const destinationApresConnexion = location.pathname + location.search;
  const redirectionParDefaut = <Navigate to={`/login?redirect=${encodeURIComponent(destinationApresConnexion)}`} replace />;

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return unauthenticatedElement || redirectionParDefaut;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement || redirectionParDefaut;
  }

  return <Outlet />;
}
