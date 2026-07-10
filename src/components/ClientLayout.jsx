import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { LayoutDashboard, Dumbbell, CalendarClock, LogOut, ArrowLeft, TrendingUp } from "lucide-react";

const navItems = [
  { to: "/espace-client", label: "Mes séances", icon: LayoutDashboard, end: true },
  { to: "/espace-client/programme", label: "Mon programme", icon: Dumbbell },
  { to: "/espace-client/performances", label: "Performances", icon: TrendingUp },
  { to: "/reservation", label: "Nouvelle séance", icon: CalendarClock },
];

export default function ClientLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-heading font-bold text-lg tracking-display">
            AURÉLIEN<span className="text-secondary">.</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive ? "text-secondary" : "text-primary-foreground/70 hover:text-primary-foreground"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden md:flex items-center gap-1.5 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Site
            </Link>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="md:hidden flex items-center justify-around px-6 py-3 border-t border-primary-foreground/10">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${isActive ? "text-secondary" : "text-primary-foreground/50"}`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}