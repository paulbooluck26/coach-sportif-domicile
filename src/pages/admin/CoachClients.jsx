import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Mail, Phone, MapPin, Target, Edit, X, Save, TrendingUp } from "lucide-react";
import ClientDetail from "@/components/coach/ClientDetail";
import ClientAvatar from "@/components/ClientAvatar";

export default function CoachClients() {
  const [clients, setClients] = useState(null);
  const [seances, setSeances] = useState(null);
  const [editing, setEditing] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    const [c, s] = await Promise.all([
      base44.entities.ClientProfile.list("-created_date", 100),
      base44.entities.Seance.list("-date"),
    ]);
    setClients(c);
    setSeances(s);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const saveClient = async () => {
    if (editing.id) {
      await base44.entities.ClientProfile.update(editing.id, form);
    } else {
      await base44.entities.ClientProfile.create(form);
    }
    setEditing(null);
    setForm({});
    load();
  };

  if (!clients) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Clients</h1>
        </div>
        <button onClick={() => { setEditing({ new: true }); setForm({ nom: "", email: "", telephone: "", adresse: "", objectif: "", notes: "" }); }} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm">+ Ajouter un client</button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun client pour le moment. Les clients qui réservent en ligne apparaîtront ici automatiquement.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {clients.map(c => {
            const clientSeances = seances.filter(s => s.client_id === c.user_id);
            const totalDepense = clientSeances.reduce((sum, s) => sum + (s.status !== "cancelled" ? (s.price || 0) : 0), 0);
            return (
              <div key={c.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ClientAvatar name={c.nom} photoUrl={c.photo_url} size={48} />
                    <div>
                      <h3 className="font-heading font-semibold text-lg text-foreground">{c.nom || "Sans nom"}</h3>
                      {c.objectif && <p className="text-sm text-accent mt-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {c.objectif}</p>}
                    </div>
                  </div>
                  <button onClick={() => { setEditing(c); setForm({ nom: c.nom, email: c.email, telephone: c.telephone, adresse: c.adresse, objectif: c.objectif, notes: c.notes }); }} className="text-muted-foreground hover:text-accent p-1"><Edit className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {c.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</p>}
                  {c.telephone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.telephone}</p>}
                  {c.adresse && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {c.adresse}</p>}
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-border text-sm">
                  <div><p className="font-heading text-xl font-bold text-foreground">{clientSeances.length}</p><p className="text-xs text-muted-foreground">séances</p></div>
                  <div><p className="font-heading text-xl font-bold text-foreground">{totalDepense}€</p><p className="text-xs text-muted-foreground">total</p></div>
                  <button onClick={() => setDetailClient(c)} className="ml-auto flex items-center gap-1.5 text-sm font-medium text-accent hover:text-secondary transition-colors"><TrendingUp className="w-4 h-4" /> Suivi détaillé</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau client" : "Modifier le client"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Nom complet</label><input value={form.nom || ""} onChange={e => setForm({ ...form, nom: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Téléphone</label><input value={form.telephone || ""} onChange={e => setForm({ ...form, telephone: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Email</label><input type="email" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Adresse</label><input value={form.adresse || ""} onChange={e => setForm({ ...form, adresse: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Objectif</label><input value={form.objectif || ""} onChange={e => setForm({ ...form, objectif: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Notes internes</label><textarea value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-accent" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={saveClient} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
      {detailClient && <ClientDetail client={detailClient} onClose={() => setDetailClient(null)} />}
    </div>
  );
}