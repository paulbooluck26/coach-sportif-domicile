import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Users, CalendarDays, Dumbbell, Inbox, CreditCard, LogOut, Home, Clock, ShoppingBag, MessageCircle } from "lucide-react";

const nav = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { to: "/admin/demandes", label: "Demandes", icon: Inbox },
  { to: "/admin/messages", label: "Messages", icon: MessageCircle },
  { to: "/admin/seances", label: "Agenda", icon: CalendarDays },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/programmes", label: "Programmes", icon: Dumbbell },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
  { to: "/admin/disponibilites", label: "Disponibilités", icon: Clock },
  { to: "/admin/paiements", label: "Paiements", icon: CreditCard },
];

export default function CoachLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (item) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  const handleLogout = () => logout("/");

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground fixed inset-y-0 left-0 z-30">
        <div className="px-6 py-8">
          <Link to="/admin" className="font-heading text-xl font-bold tracking-tight">The Lab Forge</Link>
          <p className="text-xs text-primary-foreground/50 mt-1">Espace coach</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(item) ? "bg-accent text-accent-foreground" : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-6 border-t border-primary-foreground/10">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <Home className="w-4 h-4" /> Voir le site
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
          <p className="px-3 mt-4 text-xs text-primary-foreground/40 truncate">{user?.email}</p>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        <header className="md:hidden sticky top-0 z-20 glass-nav px-6 py-4 flex items-center justify-between">
          <Link to="/admin" className="font-heading text-lg font-bold text-primary-foreground">The Lab Forge</Link>
          <button onClick={handleLogout} className="text-primary-foreground/80"><LogOut className="w-5 h-5" /></button>
        </header>
        <nav className="md:hidden sticky top-[57px] z-10 bg-primary/95 backdrop-blur px-3 py-2 flex gap-1 overflow-x-auto no-scrollbar">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap ${isActive(item) ? "bg-accent text-accent-foreground" : "text-primary-foreground/70"}`}>
                <Icon className="w-3.5 h-3.5" /> {item.label}
              </Link>
            );
          })}
        </nav>
        <main className="p-6 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}