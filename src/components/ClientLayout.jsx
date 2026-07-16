import { Outlet, NavLink, Link } from "react-router-dom";
import { Home, Dumbbell, CalendarDays, MessageCircle, User } from "lucide-react";
import NotificationsBell from "@/components/NotificationsBell";

const navItems = [
  { to: "/espace-client", label: "Accueil", icon: Home, end: true },
  { to: "/espace-client/programme", label: "Programmes", icon: Dumbbell },
  { to: "/espace-client/seances", label: "Séances", icon: CalendarDays },
  { to: "/espace-client/messages", label: "Messages", icon: MessageCircle },
  { to: "/espace-client/profil", label: "Profil", icon: User },
];

export default function ClientLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground sticky top-0 z-30">
        <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/espace-client" className="font-heading font-bold text-base tracking-tight">
            THE LAB FORGE
          </Link>
          <NotificationsBell />
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 py-6 pb-28">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border">
        <div className="max-w-md mx-auto flex items-stretch justify-around px-1 py-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors flex-1 ${
                  isActive ? "text-secondary" : "text-muted-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}