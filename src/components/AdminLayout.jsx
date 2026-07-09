import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Users, CalendarDays, Dumbbell, CreditCard, Inbox, LogOut, ArrowLeft } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/seances", label: "Séances", icon: CalendarDays },
  { to: "/admin/programmes", label: "Programmes", icon: Dumbbell },
  { to: "/admin/paiements", label: "Paiements", icon: CreditCard },
  { to: "/admin/demandes", label: "Demandes", icon: Inbox },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sidebar flex">
      <aside className="w-64 fixed inset-y-0 left-0 bg-sidebar-background text-sidebar-foreground flex flex-col z-40">
        <div className="px-6 py-7 border-b border-sidebar-border">
          <Link to="/" className="font-heading font-bold text-lg tracking-display text-sidebar-foreground">
            AURÉLIEN<span className="text-sidebar-primary">.</span>
          </Link>
          <p className="text-xs text-sidebar-foreground/50 mt-1 tracking-label">Espace Coach</p>
        </div>

        <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au site
          </Link>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 bg-background">
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}