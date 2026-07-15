import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Plus, Trash2, Repeat, Ban, Loader2, X } from "lucide-react";
import { JOURS } from "@/lib/creneaux";

const HEURES = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"];

export default function CoachDisponibilites() {
  const [dispos, setDispos] = useState(null);
  const [modal, setModal] = useState(null);

  const load = async () => {
    const data = await base44.entities.Disponibilite.list();
    setDispos(data);
  };
  useEffect(() => { load().catch(() => {}); }, []);

  const remove = async (id) => {
    if (!confirm("Supprimer cette disponibilité ?")) return;
    await base44.entities.Disponibilite.delete(id);
    load();
  };

  if (!dispos) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const recurrentes = dispos.filter((d) => d.type === "recurrent").sort((a, b) => (a.jour_semaine || 0) - (b.jour_semaine || 0));
  const blocages = dispos.filter((d) => d.type === "blocage");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-2">Back-office</p>
          <h1 className="font-heading text-3xl font-bold text-foreground">Disponibilités</h1>
          <p className="text-sm text-muted-foreground mt-1">Définissez vos plages récurrentes et bloquez des dates ponctuelles.</p>
        </div>
      </div>

      {/* Récurrentes */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold text-foreground flex items-center gap-2"><Repeat className="w-5 h-5 text-accent" /> Plages récurrentes</h2>
          <button onClick={() => setModal({ type: "recurrent" })} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Ajouter une plage
          </button>
        </div>
        {recurrentes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucune plage récurrente définie. Les clients ne verront aucun créneau disponible tant que vous n'en ajoutez pas.</p>
        ) : (
          <div className="space-y-2">
            {recurrentes.map((d) => (
              <div key={d.id} className="flex items-center justify-between border border-border rounded-md px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="w-28 text-sm font-medium text-foreground capitalize">{JOURS[d.jour_semaine]}</span>
                  <span className="text-sm text-muted-foreground">{d.heure_debut} – {d.heure_fin}</span>
                  {d.libelle && <span className="text-xs text-foreground/50">· {d.libelle}</span>}
                </div>
                <button onClick={() => remove(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blocages */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold text-foreground flex items-center gap-2"><Ban className="w-5 h-5 text-accent" /> Dates bloquées (vacances, imprévus)</h2>
          <button onClick={() => setModal({ type: "blocage" })} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
            <Plus className="w-4 h-4" /> Bloquer une date
          </button>
        </div>
        {blocages.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucune date bloquée. Les clients peuvent réserver selon vos plages récurrentes.</p>
        ) : (
          <div className="space-y-2">
            {blocages.map((d) => (
              <div key={d.id} className="flex items-center justify-between border border-border rounded-md px-4 py-3">
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {new Date(d.date_debut + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                    {d.date_fin && d.date_fin !== d.date_debut && (
                      <> → {new Date(d.date_fin + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}</>
                    )}
                  </span>
                  {d.libelle && <span className="text-xs text-foreground/50">· {d.libelle}</span>}
                </div>
                <button onClick={() => remove(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && <DispoModal kind={modal.type} onClose={() => setModal(null)} onSaved={load} />}
    </div>
  );
}

function DispoModal({ kind, onClose, onSaved }) {
  const [form, setForm] = useState({
    jour_semaine: 1,
    heure_debut: "09:00",
    heure_fin: "12:00",
    date_debut: "",
    date_fin: "",
    libelle: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (kind === "recurrent") {
      if (form.heure_debut >= form.heure_fin) {
        setError("L'heure de fin doit être après l'heure de début.");
        return;
      }
    } else {
      if (!form.date_debut) {
        setError("Veuillez indiquer une date de début.");
        return;
      }
    }
    setSaving(true);
    try {
      const payload = { type: kind, libelle: form.libelle || undefined };
      if (kind === "recurrent") {
        payload.jour_semaine = Number(form.jour_semaine);
        payload.heure_debut = form.heure_debut;
        payload.heure_fin = form.heure_fin;
      } else {
        payload.date_debut = form.date_debut;
        if (form.date_fin) payload.date_fin = form.date_fin;
      }
      await base44.entities.Disponibilite.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Erreur");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-card rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-heading font-semibold text-foreground">
            {kind === "recurrent" ? "Nouvelle plage récurrente" : "Bloquer une date"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {kind === "recurrent" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Jour de la semaine</label>
                <select value={form.jour_semaine} onChange={(e) => setForm({ ...form, jour_semaine: e.target.value })} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:border-accent">
                  {JOURS.map((j, i) => <option key={i} value={i} className="capitalize">{j}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">De</label>
                  <select value={form.heure_debut} onChange={(e) => setForm({ ...form, heure_debut: e.target.value })} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:border-accent">
                    {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">À</label>
                  <select value={form.heure_fin} onChange={(e) => setForm({ ...form, heure_fin: e.target.value })} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:border-accent">
                    {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date de début</label>
                <input type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date de fin (optionnel)</label>
                <input type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:border-accent" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Libellé (optionnel)</label>
            <input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} placeholder="Ex : Vacances, Matinées, Formation..." className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:border-accent" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-border py-3 rounded-md text-sm font-medium text-foreground">Annuler</button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground py-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}