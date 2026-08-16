import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tag, Plus, Edit, X, Save, TrendingUp } from "lucide-react";

const emptyForm = {
  code: "", description_admin: "", type_reduction: "pourcentage", valeur: "",
  date_debut: new Date().toISOString().split("T")[0], date_fin: "",
  utilisation_max: "", utilisation_max_par_client: 1, montant_minimum: "", cumulable: false, actif: true,
};

export default function CoachPromotions() {
  const [codes, setCodes] = useState(null);
  const [utilisations, setUtilisations] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const [c, u] = await Promise.all([
      base44.entities.CodePromo.list("-created_date"),
      base44.entities.UtilisationCodePromo.list("-date_utilisation"),
    ]);
    setCodes(c);
    setUtilisations(u);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const startNew = () => { setEditing({ new: true }); setForm(emptyForm); };
  const startEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code, description_admin: c.description_admin || "", type_reduction: c.type_reduction, valeur: c.valeur,
      date_debut: (c.date_debut || "").split("T")[0], date_fin: c.date_fin ? c.date_fin.split("T")[0] : "",
      utilisation_max: c.utilisation_max ?? "", utilisation_max_par_client: c.utilisation_max_par_client ?? 1,
      montant_minimum: c.montant_minimum ?? "", cumulable: c.cumulable, actif: c.actif,
    });
  };

  const save = async () => {
    const payload = {
      ...form,
      code: form.code.toUpperCase().trim(),
      valeur: parseFloat(form.valeur) || 0,
      date_debut: form.date_debut ? new Date(form.date_debut).toISOString() : new Date().toISOString(),
      date_fin: form.date_fin ? new Date(form.date_fin).toISOString() : null,
      utilisation_max: form.utilisation_max === "" ? null : parseInt(form.utilisation_max),
      utilisation_max_par_client: form.utilisation_max_par_client === "" ? null : parseInt(form.utilisation_max_par_client),
      montant_minimum: form.montant_minimum === "" ? null : parseFloat(form.montant_minimum),
    };
    if (editing.id) {
      await base44.entities.CodePromo.update(editing.id, payload);
    } else {
      await base44.entities.CodePromo.create(payload);
    }
    setEditing(null);
    load();
  };

  const toggleActif = async (c) => { await base44.entities.CodePromo.update(c.id, { actif: !c.actif }); load(); };

  const nbUtilisations = (codeId) => (utilisations || []).filter((u) => u.code_promo_id === codeId).length;

  if (!codes || !utilisations) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Promotions</h1>
          <p className="text-sm text-muted-foreground mt-1">Codes promo et réductions, comme sur Wix.</p>
        </div>
        <button onClick={startNew} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau code</button>
      </div>

      {codes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Tag className="w-10 h-10 text-secondary mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun code promo créé pour le moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {codes.map((c) => {
            const expire = c.date_fin && new Date(c.date_fin) < today;
            const epuise = c.utilisation_max != null && nbUtilisations(c.id) >= c.utilisation_max;
            const inactif = !c.actif || expire || epuise;
            return (
              <div key={c.id} className={`bg-card border rounded-lg p-6 ${inactif ? "opacity-50 border-border" : "border-border"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-heading font-mono font-bold text-lg text-foreground tracking-wide">{c.code}</h3>
                    {c.description_admin && <p className="text-xs text-muted-foreground mt-0.5">{c.description_admin}</p>}
                  </div>
                  <p className="font-heading text-xl font-bold text-accent">
                    {c.type_reduction === "pourcentage" ? `-${c.valeur}%` : `-${c.valeur}€`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                  <span className="bg-secondary/15 px-2 py-1 rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {nbUtilisations(c.id)}{c.utilisation_max ? ` / ${c.utilisation_max}` : ""} utilisations</span>
                  {c.date_fin && <span className="bg-secondary/15 px-2 py-1 rounded-full">Jusqu'au {new Date(c.date_fin).toLocaleDateString("fr-FR")}</span>}
                  {c.montant_minimum && <span className="bg-secondary/15 px-2 py-1 rounded-full">Dès {c.montant_minimum}€</span>}
                  {expire && <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full">Expiré</span>}
                  {epuise && <span className="bg-destructive/10 text-destructive px-2 py-1 rounded-full">Épuisé</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(c)} className="flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-md text-sm font-medium"><Edit className="w-3.5 h-3.5" /> Modifier</button>
                  <button onClick={() => toggleActif(c)} className={`px-3 py-2 rounded-md text-sm font-medium border ${c.actif ? "border-border text-muted-foreground" : "border-secondary text-secondary bg-secondary/10"}`}>
                    {c.actif ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau code promo" : "Modifier le code"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Code</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BIENVENUE10" className="w-full border border-border rounded-md px-3 py-2 font-mono focus:outline-none focus:border-accent" /></div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Note interne</label><input value={form.description_admin} onChange={(e) => setForm({ ...form, description_admin: e.target.value })} placeholder="Non visible du client" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                  <select value={form.type_reduction} onChange={(e) => setForm({ ...form, type_reduction: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 bg-card focus:outline-none focus:border-accent">
                    <option value="pourcentage">Pourcentage</option>
                    <option value="montant_fixe">Montant fixe</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Valeur</label><input type="number" value={form.valeur} onChange={(e) => setForm({ ...form, valeur: e.target.value })} placeholder={form.type_reduction === "pourcentage" ? "10 (%)" : "10 (€)"} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Date de début</label><input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Date de fin</label><input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} placeholder="Optionnel" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Utilisations max.</label><input type="number" value={form.utilisation_max} onChange={(e) => setForm({ ...form, utilisation_max: e.target.value })} placeholder="Illimité" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Max / client</label><input type="number" value={form.utilisation_max_par_client} onChange={(e) => setForm({ ...form, utilisation_max_par_client: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">Panier min. (€)</label><input type="number" value={form.montant_minimum} onChange={(e) => setForm({ ...form, montant_minimum: e.target.value })} placeholder="Aucun" className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="rounded" /> Actif</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.cumulable} onChange={(e) => setForm({ ...form, cumulable: e.target.checked })} className="rounded" /> Cumulable avec une autre promo</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} disabled={!form.code || !form.valeur} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
