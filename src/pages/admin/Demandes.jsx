import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Inbox, Mail, Phone, Target, Trash2 } from "lucide-react";

export default function AdminDemandes() {
  const [demandes, setDemandes] = useState(null);

  const load = async () => {
    try {
      const data = await base44.entities.DemandeContact.list("-created_date", 100);
      setDemandes(data);
    } catch (_) { setDemandes([]); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await base44.entities.DemandeContact.update(id, { status }); load(); } catch (_) {}
  };
  const remove = async (id) => {
    try { await base44.entities.DemandeContact.delete(id); load(); } catch (_) {}
  };

  const statusInfo = (s) => ({
    nouveau: { label: "Nouveau", cls: "bg-secondary/15 text-secondary", dot: "bg-secondary" },
    en_cours: { label: "En cours", cls: "bg-accent/30 text-accent-foreground", dot: "bg-accent-foreground" },
    traite: { label: "Traité", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" },
  }[s] || { label: s, cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground" });

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-primary mb-1">Demandes de contact</h1>
      <p className="text-muted-foreground mb-8">Les demandes reçues via votre site vitrine.</p>

      {!demandes ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : demandes.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center">
          <Inbox className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => {
            const info = statusInfo(d.status);
            return (
              <div key={d.id} className="bg-background border border-border rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading font-semibold text-primary">{d.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${info.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${info.dot}`} />{info.label}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <a href={`mailto:${d.email}`} className="flex items-center gap-1.5 hover:text-secondary transition-colors"><Mail className="w-3.5 h-3.5" /> {d.email}</a>
                      {d.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {d.phone}</span>}
                      {d.goal && <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {d.goal}</span>}
                    </div>
                    <p className="text-sm text-foreground/70 leading-relaxed bg-muted/30 rounded-lg px-4 py-3">{d.message}</p>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {d.status !== "en_cours" && <button onClick={() => updateStatus(d.id, "en_cours")} className="px-3 py-1.5 text-xs font-medium border border-border rounded-full hover:bg-muted transition-colors">Marquer en cours</button>}
                    {d.status !== "traite" && <button onClick={() => updateStatus(d.id, "traite")} className="px-3 py-1.5 text-xs font-medium border border-border rounded-full hover:bg-secondary/10 hover:border-secondary transition-colors">Traiter</button>}
                    <button onClick={() => remove(d.id)} className="px-3 py-1.5 text-xs font-medium border border-destructive/30 text-destructive rounded-full hover:bg-destructive/5 transition-colors flex items-center gap-1"><Trash2 className="w-3 h-3" /> Suppr.</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}