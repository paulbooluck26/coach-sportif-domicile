import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Plus, Search, X, Mail, Phone, Target, Dumbbell } from "lucide-react";

export default function AdminClients() {
  const [clients, setClients] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", goal: "", address: "", notes: "" });

  const load = async () => {
    try {
      const data = await base44.entities.Client.list();
      setClients(data);
    } catch (_) { setClients([]); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Client.create(form);
      setForm({ full_name: "", email: "", phone: "", goal: "", address: "", notes: "" });
      setShowForm(false);
      load();
    } catch (_) {}
  };

  const filtered = clients?.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Clients</h1>
          <p className="text-muted-foreground mt-1">{clients?.length || 0} client(s) au total</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-105 transition-transform">
          <Plus className="w-4 h-4" /> Nouveau client
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client…"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm focus:border-secondary focus:outline-none transition-colors"
        />
      </div>

      {!clients ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-muted/30 border border-border rounded-2xl p-12 text-center">
          <p className="text-muted-foreground">Aucun client trouvé.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3">NOM</th>
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3">CONTACT</th>
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3 hidden md:table-cell">OBJECTIF</th>
                <th className="text-left text-xs font-semibold tracking-label text-muted-foreground px-5 py-3 hidden lg:table-cell">ADRESSE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-heading font-bold shrink-0">
                        {c.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-primary">{c.full_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-0.5 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {c.email}</span>
                      {c.phone && <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {c.phone}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Target className="w-3.5 h-3.5" /> {c.goal || "—"}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-sm text-muted-foreground">{c.address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-heading font-semibold text-primary flex items-center gap-2"><Dumbbell className="w-5 h-5 text-secondary" /> Nouveau client</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-primary"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required placeholder="Nom complet *" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <input required type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Objectif" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <input placeholder="Adresse domicile" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none" />
              <textarea placeholder="Notes du coach" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-input text-sm focus:border-secondary focus:outline-none resize-none" />
              <button type="submit" className="w-full py-3 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold hover:scale-[1.01] transition-transform">Créer le client</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}