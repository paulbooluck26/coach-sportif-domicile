import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import CoachRoute from '@/components/CoachRoute';
import ClientLayout from '@/components/ClientLayout';
import CoachLayout from '@/components/CoachLayout';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Reservation from '@/pages/client/Reservation';
import AppelDecouverte from '@/pages/AppelDecouverte';
import ClientDashboard from '@/pages/client/ClientDashboard';
import MesSeances from '@/pages/client/MesSeances';
import MonProgramme from '@/pages/client/MonProgramme';
import SessionExecution from '@/pages/client/SessionExecution';
import MesPerformances from '@/pages/client/MesPerformances';
import AchatProgramme from '@/pages/AchatProgramme';
import CoachCommandes from '@/pages/coach/CoachCommandes';
import CoachDashboard from '@/pages/coach/CoachDashboard';
import CoachDemandes from '@/pages/coach/CoachDemandes';
import CoachSeances from '@/pages/coach/CoachSeances';
import CoachClients from '@/pages/coach/CoachClients';
import CoachProgrammes from '@/pages/coach/CoachProgrammes';
import CoachPaiements from '@/pages/coach/CoachPaiements';
import CoachDisponibilites from '@/pages/coach/CoachDisponibilites';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/reservation" element={<Reservation />} />
      <Route path="/appel-decouverte" element={<AppelDecouverte />} />
      <Route path="/achat-programme" element={<AchatProgramme />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<ClientLayout />}>
          <Route path="/espace-client" element={<ClientDashboard />} />
          <Route path="/espace-client/seances" element={<MesSeances />} />
          <Route path="/espace-client/programme" element={<MonProgramme />} />
          <Route path="/espace-client/seance/:seanceId" element={<SessionExecution />} />
          <Route path="/espace-client/performances" element={<MesPerformances />} />
        </Route>
      </Route>

      <Route element={<CoachRoute />}>
        <Route element={<CoachLayout />}>
          <Route path="/admin" element={<CoachDashboard />} />
          <Route path="/admin/demandes" element={<CoachDemandes />} />
          <Route path="/admin/seances" element={<CoachSeances />} />
          <Route path="/admin/clients" element={<CoachClients />} />
          <Route path="/admin/programmes" element={<CoachProgrammes />} />
          <Route path="/admin/commandes" element={<CoachCommandes />} />
          <Route path="/admin/paiements" element={<CoachPaiements />} />
          <Route path="/admin/disponibilites" element={<CoachDisponibilites />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App