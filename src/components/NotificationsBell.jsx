import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

export default function NotificationsBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    if (!user) return;
    try {
      const notifs = await base44.entities.Notification.filter({ client_id: user.id }, "-created_date", 20);
      setNotifications(notifs);
    } catch {}
  };

  useEffect(() => { load(); }, [user]);

  const unreadCount = notifications.filter(n => !n.lu).length;

  const handleClick = async (n) => {
    if (!n.lu) await base44.entities.Notification.update(n.id, { lu: true });
    if (n.lien) navigate(n.lien);
    setOpen(false);
    load();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-primary-foreground/70 hover:text-primary-foreground transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune notification</p>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(n => (
                  <button key={n.id} onClick={() => handleClick(n)} className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${!n.lu ? "bg-accent/5" : ""}`}>
                    <p className="font-semibold text-sm text-foreground">{n.titre}</p>
                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.created_date).toLocaleDateString("fr-FR")}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}