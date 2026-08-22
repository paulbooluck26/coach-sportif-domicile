import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MapPin, Plus, Edit, X, Save, Trash2, Eye, EyeOff } from "lucide-react";

const emptyForm = { distance_min_km: 0, distance_max_km: 10, montant: 0, ordre_affichage: 0, actif: true };

export default function CoachFraisDeplacement() {
  const [paliers, setPaliers] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [adresseDepart, setAdresseDepart] = useState("");
  const [parametreId, setParametreId] = useState(null);
  const [savingAdresse, setSavingAdresse] = useState(false);

  const load = async () => {
    const [p, params] = await Promise.all([
      base44.entities.FraisDeplacement.list("distance_min_km"),
      base44.entities.ParametreCoach.list("-created_date", 1),
    ]);
    setPaliers(p);
    if (params[0]) {
      setAdresseDepart(params[0].adresse_depart || "");
      setParametreId(params[0].id);
    }
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const enregistrerAdresse = async () => {
    setSavingAdresse(true);
    if (parametreId) await base44.entities.ParametreCoach.update(parametreId, { adresse_depart: adresseDepart });
    else await base44.entities.ParametreCoach.create({ adresse_depart: adresseDepart });
    await load();
    setSavingAdresse(false);
  };

  const startNew = () => { setEditing({ new: true }); setForm(emptyForm); };
  const startEdit = (p) => { setEditing(p); setForm({ distance_min_km: p.distance_min_km, distance_max_km: p.distance_max_km, montant: p.montant, ordre_affichage: p.ordre_affichage, actif: p.actif }); };

  const save = async () => {
    const payload = { ...form, distance_min_km: parseFloat(form.distance_min_km) || 0, distance_max_km: parseFloat(form.distance_max_km) || 0, montant: parseFloat(form.montant) || 0, ordre_affichage: parseInt(form.ordre_affichage) || 0 };
    if (editing.id) await base44.entities.FraisDeplacement.update(editing.id, payload);
    else await base44.entities.FraisDeplacement.create(payload);
    setEditing(null);
    load();
  };

  const toggleActif = async (p) => { await base44.entities.FraisDeplacement.update(p.id, { actif: !p.actif }); load(); };
  const supprimer = async (p) => { if (confirm(`Supprimer le palier ${p.distance_min_km}-${p.distance_max_km} km ?`)) { await base44.entities.FraisDeplacement.delete(p.id); load(); } };

  if (!paliers) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const distanceMax = paliers.length > 0 ? Math.max(...paliers.map((p) => p.distance_max_km)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">Frais de déplacement</h1>
        <p className="text-sm text-muted-foreground mt-1">Zone d'intervention pour le coaching à domicile — jusqu'à {distanceMax} km. Au-delà, la réservation est bloquée.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-5">
        <label className="block text-sm font-medium text-foreground mb-1.5 flex items-center gap-2"><MapPin className="w-4 h-4 text-secondary" /> Adresse de départ</label>
        <div className="flex gap-2">
          <input value={adresseDepart} onChange={(e) => setAdresseDepart(e.target.value)} placeholder="Colmar, France" className="flex-1 border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" />
          <button onClick={enregistrerAdresse} disabled={savingAdresse} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-50">Enregistrer</button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">Point de départ utilisé pour calculer la distance réelle jusqu'à chaque client.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-foreground">Paliers tarifaires</h2>
        <button onClick={startNew} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Nouveau palier</button>
      </div>

      <div className="space-y-3">
        {paliers.map((p) => (
          <div key={p.id} className={`bg-card border rounded-lg p-4 flex items-center justify-between gap-4 ${!p.actif ? "opacity-50" : "border-border"}`}>
            <div>
              <p className="font-heading font-semibold text-foreground">{p.distance_min_km} – {p.distance_max_km} km</p>
              <p className="text-sm text-muted-foreground">{p.montant > 0 ? `+${p.montant}€` : "Gratuit"}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => toggleActif(p)} className="text-muted-foreground hover:text-accent p-1.5" title={p.actif ? "Désactiver" : "Activer"}>{p.actif ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
              <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-accent p-1.5"><Edit className="w-4 h-4" /></button>
              <button onClick={() => supprimer(p)} className="text-muted-foreground hover:text-destructive p-1.5"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {paliers.length === 0 && <p className="text-sm text-muted-foreground">Aucun palier configuré — toutes les distances seront hors zone.</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-lg p-8 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading font-semibold text-xl text-foreground">{editing.new ? "Nouveau palier" : "Modifier le palier"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-foreground mb-1.5">De (km)</label><input type="number" step="0.1" value={form.distance_min_km} onChange={(e) => setForm({ ...form, distance_min_km: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-1.5">À (km)</label><input type="number" step="0.1" value={form.distance_max_km} onChange={(e) => setForm({ ...form, distance_max_km: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground mb-1.5">Frais (€)</label><input type="number" step="0.5" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 focus:outline-none focus:border-accent" /></div>
              <label className="flex items-center gap-2 cursor-pointer text-sm"><input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="rounded" /> Actif</label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditing(null)} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={save} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
