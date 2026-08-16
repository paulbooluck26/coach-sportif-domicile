import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Package, Plus, Edit, X, Save, Eye, EyeOff, Tag } from "lucide-react";

const CATEGORIES = [
  { value: "coaching_domicile", label: "Coaching à domicile" },
  { value: "programme_ligne", label: "Programme en ligne" },
  { value: "club_sportif", label: "Club sportif" },
  { value: "entreprise", label: "Entreprise" },
  { value: "produit_physique", label: "Produit physique" },
  { value: "service_ponctuel", label: "Service ponctuel" },
];

const emptyForm = {
  sku: "", nom: "", description: "", categorie: "coaching_domicile", type_facturation: "paiement_unique",
  prix_ttc: "", unite_recurrence: "", duree_semaines: "", nb_seances_inclus: "", validite_credit_jours: "",
  actif: true, visible_public: true, ordre_affichage: 0, prix_promo: "",
};

export default function CoachCatalogue() {
  const [produits, setProduits] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filtreCategorie, setFiltreCategorie] = useState("");

  const load = async () => {
    const data = await base44.entities.Produit.list("ordre_affichage");
    setProduits(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const startNew = () => { setEditing({ new: true }); setForm(emptyForm); };
  const startEdit = (p) => {
    setEditing(p);
    setForm({
      sku: p.sku, nom: p.nom, description: p.description || "", categorie: p.categorie, type_facturation: p.type_facturation,
      prix_ttc: p.prix_ttc ?? "", unite_recurrence: p.unite_recurrence || "", duree_semaines: p.duree_semaines ?? "",
      nb_seances_inclus: p.nb_seances_inclus ?? "", validite_credit_jours: p.validite_credit_jours ?? "",
      actif: p.actif, visible_public: p.visible_public, ordre_affichage: p.ordre_affichage ?? 0, prix_promo: p.prix_promo ?? "",
    });
  };

  const save = async () => {
    const payload = {
      ...form,
      prix_ttc: form.type_facturation === "devis_personnalise" ? null : parseFloat(form.prix_ttc) || 0,
      duree_semaines: form.duree_semaines === "" ? null : parseInt(form.duree_semaines),
      nb_seances_inclus: form.nb_seances_inclus === "" ? null : parseInt(form.nb_seances_inclus),
      validite_credit_jours: form.validite_credit_jours === "" ? null : parseInt(form.validite_credit_jours),
      prix_promo: form.prix_promo === "" ? null : parseFloat(form.prix_promo),
      ordre_affichage: parseInt(form.ordre_affichage) || 0,
      unite_recurrence: form.type_facturation === "abonnement" ? (form.unite_recurrence || "mois") : null,
    };
    if (editing.id) {
      await base44.entities.Produit.update(editing.id, payload);
    } else {
      await base44.entities.Produit.create(payload);
    }
    setEditing(null);
    load();
  };

  const toggleActif = async (p) => { await base44.entities.Produit.update(p.id, { actif: !p.actif }); load(); };
  const toggleVisible = async (p) => { await base44.entities.Produit.update(p.id, { visible_public: !p.visible_public }); load(); };

  if (!produits) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const liste = filtreCategorie ? produits.filter((p) => p.categorie === filtreCategorie) : produits;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Catalogue</h1>
          <p className="text-sm text-muted-foreground mt-1">Prix et offres modifiables sans toucher au code.</p>
        </div>
        <button onClick={startNew} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau produit</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFiltreCategorie("")} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${!filtreCategorie ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>Tous</button>
        {CATEGORIES.map((c) => (
          <button key={c.value} onClick={() => setFiltreCategorie(c.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${filtreCategorie === c.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>{c.label}</button>
        ))}
      </div>

      {liste.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Package className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun produit dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {liste.map((p) => (
            <div key={p.id} className={`bg-card border rounded-lg p-6 ${!p.actif ? "opacity-50 border-border" : "border-border"}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">{p.nom}</h3>
                  <p className="text-xs text-muted-foreground">{CATEGORIES.find((c) => c.value === p.categorie)?.label || p.categorie} · {p.sku}</p>
                </div>
                <div className="text-right">
                  {p.prix_promo ? (
                    <>
                      <p className="text-xs text-muted-foreground line-through">{p.prix_ttc}€</p>
                      <p className="font-heading text-xl font-bold text-accent">{p.prix_promo}€</p>
                    </>
                  ) : (
                    <p className="font-heading text-xl font-bold text-foreground">{p.prix_ttc != null ? `${p.prix_ttc}€` : "Sur devis"}{p.unite_recurrence ? `/${p.unite_recurrence}` : ""}</p>
                  )}
                </div>
              </div>
              {p.description && <p className="text-sm text-muted-foreground mb-3">{p.description}</p>}
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                {p.nb_seances_inclus && <span className="bg-secondary/15 px-2 py-1 rounded-full">{p.nb_seances_inclus} séances</span>}
                {p.duree_semaines && <span className="bg-secondary/15 px-2 py-1 rounded-full">{p.duree_semaines} semaines</span>}
                <span className="bg-secondary/15 px-2 py-1 rounded-full">{p.type_facturation === "abonnement" ? "Abonnement" : p.type_facturation === "devis_personnalise" ? "Sur devis" : "Paiement unique"}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={() => startEdit(p)} className="flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-md text-sm font-medium"><Edit className="w-3.5 h-3.5" /> Modifier</button>
                <button onClick={() => toggleActif(p)} className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border ${p.actif ? "border-border text-muted-foreground" : "border-secondary text-secondary bg-secondary/10"}`}>
                  {p.actif ? "Désactiver" : "Activer"}
                </button>
                <button onClick={() => toggleVisible(p)} title={p.visible_public ? "Masquer du site" : "Afficher sur le site"} className="p-2 text-muted-foreground hover:text-accent border border-border rounded-md">
                  {p.visible_public ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau produit" : "Modifier le produit"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Nom</label><input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Référence (SKU)</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="ex: coaching-diagnostic" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:border-accent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Catégorie</label>
                  <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Facturation</label>
                  <select value={form.type_facturation} onChange={(e) => setForm({ ...form, type_facturation: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    <option value="paiement_unique">Paiement unique</option>
                    <option value="abonnement">Abonnement</option>
                    <option value="devis_personnalise">Sur devis</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {form.type_facturation !== "devis_personnalise" && (
                  <div><label className="block text-sm font-medium text-foreground mb-1.5">Prix TTC (€)</label><input type="number" value={form.prix_ttc} onChange={(e) => setForm({ ...form, prix_ttc: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                )}
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Prix promo (€)</label><input type="number" value={form.prix_promo} onChange={(e) => setForm({ ...form, prix_promo: e.target.value })} placeholder="Optionnel" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Ordre d'affichage</label><input type="number" value={form.ordre_affichage} onChange={(e) => setForm({ ...form, ordre_affichage: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Séances incluses</label><input type="number" value={form.nb_seances_inclus} onChange={(e) => setForm({ ...form, nb_seances_inclus: e.target.value })} placeholder="Optionnel" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Durée (semaines)</label><input type="number" value={form.duree_semaines} onChange={(e) => setForm({ ...form, duree_semaines: e.target.value })} placeholder="Optionnel" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Validité crédit (jours)</label><input type="number" value={form.validite_credit_jours} onChange={(e) => setForm({ ...form, validite_credit_jours: e.target.value })} placeholder="Optionnel" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="rounded" /> Actif (vendable)</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.visible_public} onChange={(e) => setForm({ ...form, visible_public: e.target.checked })} className="rounded" /> Visible sur le site</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} disabled={!form.nom || !form.sku} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
