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
import PublicLayout from '@/components/PublicLayout';
import ClientLayout from '@/components/ClientLayout';
import CoachLayout from '@/components/CoachLayout';
import Home from '@/pages/site-web/Home';
import Login from '@/pages/site-web/Login';
import Register from '@/pages/site-web/Register';
import Reservation from '@/pages/espace-client/Reservation';
import AppelDecouverte from '@/pages/site-web/AppelDecouverte';
import ClientDashboard from '@/pages/espace-client/ClientDashboard';
import Reserver from '@/pages/espace-client/Reserver';
import ReserverDomicile from '@/pages/espace-client/reserver/Domicile';
import ReserverProgramme from '@/pages/espace-client/reserver/Programme';
import ReserverAppel from '@/pages/espace-client/reserver/Appel';
import Messages from '@/pages/espace-client/Messages';
import Profil from '@/pages/espace-client/Profil';
import MonProgramme from '@/pages/espace-client/MonProgramme';
import BilanInitial from '@/pages/espace-client/BilanInitial';
import SessionExecution from '@/pages/espace-client/SessionExecution';
import MesPerformances from '@/pages/espace-client/MesPerformances';
import Seances from '@/pages/espace-client/Seances';
import Bibliotheque from '@/pages/espace-client/Bibliotheque';
import AchatProgramme from '@/pages/site-web/AchatProgramme';
import PublicReserver from '@/pages/site-web/Reserver';
import Offres from '@/pages/site-web/Offres';
import CoachCommandes from '@/pages/admin/CoachCommandes';
import CoachMessages from '@/pages/admin/CoachMessages';
import CoachDashboard from '@/pages/admin/CoachDashboard';
import CoachDemandes from '@/pages/admin/CoachDemandes';
import CoachSeances from '@/pages/admin/CoachSeances';
import CoachClients from '@/pages/admin/CoachClients';
import CoachProgrammes from '@/pages/admin/CoachProgrammes';
import CoachPaiements from '@/pages/admin/CoachPaiements';
import CoachDisponibilites from '@/pages/admin/CoachDisponibilites';
import CoachEmails from '@/pages/admin/CoachEmails';
import CoachBibliotheque from '@/pages/admin/CoachBibliotheque';

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
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/appel-decouverte" element={<AppelDecouverte />} />
        <Route path="/achat-programme" element={<AchatProgramme />} />
        <Route path="/reserver" element={<PublicReserver />} />
        <Route path="/offres" element={<Offres />} />
      </Route>
      <Route path="/reservation" element={<Reservation />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<ClientLayout />}>
          <Route path="/espace-client" element={<ClientDashboard />} />
          <Route path="/espace-client/programme" element={<MonProgramme />} />
          <Route path="/espace-client/bilan-initial" element={<BilanInitial />} />
          <Route path="/espace-client/reserver" element={<Reserver />} />
          <Route path="/espace-client/reserver/domicile" element={<ReserverDomicile />} />
          <Route path="/espace-client/reserver/programme" element={<ReserverProgramme />} />
          <Route path="/espace-client/reserver/appel" element={<ReserverAppel />} />
          <Route path="/espace-client/messages" element={<Messages />} />
          <Route path="/espace-client/profil" element={<Profil />} />
          <Route path="/espace-client/performances" element={<MesPerformances />} />
          <Route path="/espace-client/seances" element={<Seances />} />
          <Route path="/espace-client/bibliotheque" element={<Bibliotheque />} />
        </Route>
        <Route path="/espace-client/seance/:seanceId" element={<SessionExecution />} />
      </Route>

      <Route element={<CoachRoute />}>
        <Route element={<CoachLayout />}>
          <Route path="/admin" element={<CoachDashboard />} />
          <Route path="/admin/demandes" element={<CoachDemandes />} />
          <Route path="/admin/messages" element={<CoachMessages />} />
          <Route path="/admin/seances" element={<CoachSeances />} />
          <Route path="/admin/clients" element={<CoachClients />} />
          <Route path="/admin/programmes" element={<CoachProgrammes />} />
          <Route path="/admin/commandes" element={<CoachCommandes />} />
          <Route path="/admin/paiements" element={<CoachPaiements />} />
          <Route path="/admin/disponibilites" element={<CoachDisponibilites />} />
          <Route path="/admin/emails" element={<CoachEmails />} />
          <Route path="/admin/bibliotheque" element={<CoachBibliotheque />} />
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