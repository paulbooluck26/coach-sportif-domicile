import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Mail, Phone, MapPin, Target, Edit, X, Save, TrendingUp, List, Table2, Download, Archive, RotateCcw } from "lucide-react";
import ClientDetail from "@/components/coach/ClientDetail";
import ClientAvatar from "@/components/ClientAvatar";

const ONGLETS = [
  { key: "actifs", label: "Actifs" },
  { key: "anciens", label: "Anciens clients" },
  { key: "prospects", label: "Prospects" },
  { key: "archives", label: "Archivés" },
];

export default function CoachClients() {
  const [clients, setClients] = useState(null);
  const [seances, setSeances] = useState(null);
  const [paiements, setPaiements] = useState(null);
  const [editing, setEditing] = useState(null);
  const [detailClient, setDetailClient] = useState(null);
  const [form, setForm] = useState({});
  const [onglet, setOnglet] = useState("actifs");
  const [vue, setVue] = useState("cartes"); // cartes | tableau

  const load = async () => {
    const [c, s, p] = await Promise.all([
      base44.entities.ClientProfile.list("-created_date", 300),
      base44.entities.Seance.list("-date"),
      base44.entities.Paiement.list("-date_paiement", 500),
    ]);
    setClients(c);
    setSeances(s);
    setPaiements(p);
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

  const toggleArchive = async (c) => {
    await base44.entities.ClientProfile.update(c.id, { archive: !c.archive });
    load();
  };

  if (!clients || !seances || !paiements) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date().toISOString().split("T")[0];

  const enrichis = clients.map((c) => {
    const clientSeances = seances.filter((s) => s.client_id === c.user_id);
    const clientPaiements = paiements.filter((p) => p.client_id === c.user_id && p.status === "paid");
    const aVenir = clientSeances.some((s) => s.date >= today && s.status !== "cancelled");
    const dejaEuActivite = clientSeances.length > 0 || clientPaiements.length > 0;
    let categorie;
    if (c.archive) categorie = "archives";
    else if (aVenir) categorie = "actifs";
    else if (dejaEuActivite) categorie = "anciens";
    else categorie = "prospects";
    const totalDepense = clientPaiements.reduce((sum, p) => sum + (p.amount || 0), 0);
    return { ...c, _seances: clientSeances, _totalDepense: totalDepense, _categorie: categorie };
  });

  const parOnglet = ONGLETS.reduce((acc, o) => {
    acc[o.key] = enrichis.filter((c) => c._categorie === o.key);
    return acc;
  }, {});
  const liste = parOnglet[onglet] || [];

  const exporterExcel = () => {
    const rows = liste.map((c) => ({
      "Nom": c.nom || "",
      "Email": c.email || "",
      "Téléphone": c.telephone || "",
      "Adresse": c.adresse || "",
      "Objectif": c.objectif || "",
      "Catégorie": ONGLETS.find((o) => o.key === c._categorie)?.label || "",
      "Inscrit le": c.created_date ? new Date(c.created_date).toLocaleDateString("fr-FR") : "",
      "Séances": c._seances.length,
    }));
    const header = Object.keys(rows[0] || {}).join(";");
    const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clients-${onglet}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Clients</h1>
        </div>
        <button onClick={() => { setEditing({ new: true }); setForm({ nom: "", email: "", telephone: "", adresse: "", objectif: "", notes: "" }); }} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm">+ Ajouter un client</button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 border-b border-border">
          {ONGLETS.map((o) => (
            <button
              key={o.key}
              onClick={() => setOnglet(o.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${onglet === o.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {o.label} <span className="text-xs">({parOnglet[o.key]?.length || 0})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-card border border-border rounded-lg p-1">
            <button onClick={() => setVue("cartes")} className={`p-1.5 rounded-md ${vue === "cartes" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setVue("tableau")} className={`p-1.5 rounded-md ${vue === "tableau" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}><Table2 className="w-4 h-4" /></button>
          </div>
          <button onClick={exporterExcel} disabled={liste.length === 0} className="inline-flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50">
            <Download className="w-4 h-4" /> Exporter
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Actifs</strong> — séance à venir, programme en cours, ou carnet actif ·{" "}
        <strong className="text-foreground">Anciens clients</strong> — ont déjà acheté, plus rien en cours ·{" "}
        <strong className="text-foreground">Prospects</strong> — compte créé, jamais rien acheté ·{" "}
        <strong className="text-foreground">Archivés</strong> — masqués manuellement par vous, sans supprimer le compte (réversible)
      </p>

      {liste.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun client ici pour le moment.</p>
        </div>
      ) : vue === "tableau" ? (
        <div className="bg-card border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Téléphone</th>
                <th className="px-6 py-4">Objectif</th>
                <th className="px-6 py-4">Séances</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {liste.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/20 cursor-pointer" onClick={() => setDetailClient(c)}>
                  <td className="px-6 py-4 text-foreground font-medium whitespace-nowrap">{c.nom || "Sans nom"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.email || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.telephone || "—"}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.objectif || "—"}</td>
                  <td className="px-6 py-4 text-foreground">{c._seances.length}</td>
                  <td className="px-6 py-4 text-foreground font-semibold">{c._totalDepense}€</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => toggleArchive(c)} className="text-muted-foreground hover:text-accent p-1" title={c.archive ? "Restaurer" : "Archiver"}>
                      {c.archive ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {liste.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <ClientAvatar name={c.nom} photoUrl={c.photo_url} size={48} />
                  <div>
                    <h3 className="font-heading font-semibold text-lg text-foreground">{c.nom || "Sans nom"}</h3>
                    {c.objectif && <p className="text-sm text-accent mt-1 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> {c.objectif}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleArchive(c)} className="text-muted-foreground hover:text-accent p-1" title={c.archive ? "Restaurer" : "Archiver"}>
                    {c.archive ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </button>
                  <button onClick={() => { setEditing(c); setForm({ nom: c.nom, email: c.email, telephone: c.telephone, adresse: c.adresse, objectif: c.objectif, notes: c.notes }); }} className="text-muted-foreground hover:text-accent p-1"><Edit className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {c.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email}</p>}
                {c.telephone && <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.telephone}</p>}
                {c.adresse && <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {c.adresse}</p>}
              </div>
              <div className="flex gap-6 mt-4 pt-4 border-t border-border text-sm">
                <div><p className="font-heading text-xl font-bold text-foreground">{c._seances.length}</p><p className="text-xs text-muted-foreground">séances</p></div>
                <div><p className="font-heading text-xl font-bold text-foreground">{c._totalDepense}€</p><p className="text-xs text-muted-foreground">total</p></div>
                <button onClick={() => setDetailClient(c)} className="ml-auto flex items-center gap-1.5 text-sm font-medium text-accent hover:text-secondary transition-colors"><TrendingUp className="w-4 h-4" /> Suivi détaillé</button>
              </div>
            </div>
          ))}
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
