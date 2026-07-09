import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CalendarDays, Clock, CheckCircle2, XCircle, Edit3, X } from "lucide-react";

export default function AdminSeances() {
  const [seances, setSeances] = useState(null);
  const [editing, setEditing] = useState(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    try {
      const data = await base44.entities.Seance.list("-date", 100);
      setSeances(data);
    } catch (_) { setSeances([]); }
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try { await base44.entities.Seance.update(id, { status }); load(); } catch (_) {}
  };

  const saveNotes = async () => {
    try { await base44.entities.Seance.update(editing, { notes }); setEditing(null); setNotes(""); load(); } catch (_) {}
  };

  const typeLabel = (t) => ({ seance_individuelle: "Séance", evaluation: "Évaluation", programme_personnalise: "Programme" }[t] || t);

  const upcoming = seances?.filter((s) => s.date >= new Date().toISOString().split("T")[0] && s.status === "booked") || [];
  const past = seances?.filter((s) => s.date < new Date().toISOString().split("T")[0] || s.status !== "booked") || [];

  const SessionRow = ({ s }) => (
    <div className="bg-background border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary flex flex-col items-center justify-center text-primary-foreground shrink-0">
          <span className="text-xs capitalize">{new Date(s.date).toLocaleDateString("fr-FR", { month: "short" })}</span>
          <span className="text-xl font-heading font-bold leading-none">{new Date(s.date).getDate()}</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-primary">{s.client_name || "—"}</p>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.time}</span>
            <span>{typeLabel(s.session_type)}</span>
            <span className="font-medium text-primary">{s.price}€</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          s.status === "booked" ? "bg-secondary/10 text-secondary" :
          s.status === "completed" ? "bg-muted text-muted-foreground" :
          s.status === "cancelled" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
        }`}>
          {s.status === "booked" ? "À venir" : s.status === "completed" ? "Terminée" : s.status === "cancelled" ? "Annulée" : s.status}
        </span>
        {s.status === "booked" && (
          <>
            <button onClick={() => updateStatus(s.id, "completed")} className="p-2 rounded-lg hover:bg-secondary/10 text-secondary transition-colors" title="Marquer terminée">
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button onClick={() => updateStatus(s.id, "cancelled")} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Annuler">
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
        <button onClick={() => { setEditing(s.id); setNotes(s.notes || ""); }} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Notes">
          <Edit3 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-primary mb-1">Séances</h1>
      <p className="text-muted-foreground mb-8">Gérez votre agenda et le statut de vos séances.</p>

      {!seances ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-lg font-heading font-semibold text-primary mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-secondary" /> À venir ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground text-sm bg-muted/30 border border-border rounded-xl p-6">Aucune séance à venir.</p>
            ) : (
              <div className="space-y-3">{upcoming.map((s) => <SessionRow key={s.id} s={s} />)}</div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-heading font-semibold text-primary mb-4">Historique</h2>
            {past.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucune séance passée.</p>
            ) : (
              <div className="space-y-3">{past.map((s) => <SessionRow key={s.id} s={s} />)}</div>
            )}
          </section>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-background rounded-2xl p-8 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-heading font-semibold text-primary">Notes post-séance</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} placeholder="Observations, progression, points à retravailler…" className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none resize-none mb-4" />
            <button onClick={saveNotes} className="w-full py-3 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}