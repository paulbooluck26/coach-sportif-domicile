import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, Dumbbell, Save, X, Copy } from "lucide-react";
import { cloneExercice } from "@/lib/programmeClone";

export default function ExercicesPanel({ blocId }) {
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", sets: 3, reps: "12", rest_seconds: 60, intensity: "", media_url: "", description: "" });
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => { setItems(await base44.entities.Exercice.filter({ bloc_id: blocId }, "order")); };
  useEffect(() => { load().catch(() => {}); }, [blocId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, media_url: file_url }));
    } catch (err) {}
    setUploading(false);
  };

  const submit = async () => {
    if (editId) { await base44.entities.Exercice.update(editId, form); setEditId(null); }
    else { await base44.entities.Exercice.create({ ...form, bloc_id: blocId, order: items?.length || 0 }); }
    setAdding(false); setForm({ name: "", sets: 3, reps: "12", rest_seconds: 60, intensity: "", media_url: "", description: "" }); load();
  };
  const edit = (ex) => { setEditId(ex.id); setForm({ name: ex.name, sets: ex.sets || 3, reps: ex.reps || "", rest_seconds: ex.rest_seconds || 60, intensity: ex.intensity || "", media_url: ex.media_url || "", description: ex.description || "" }); setAdding(true); };
  const remove = async (id) => { await base44.entities.Exercice.delete(id); load(); };
  const duplicate = async (ex) => { await cloneExercice(ex, blocId); load(); };

  if (!items) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Exercices du bloc</h2>
        {!adding && <button onClick={() => setAdding(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Exercice</button>}
      </div>

      {adding && (
        <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nom de l'exercice</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Squat, Pompes, Gainage" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Séries</label><input type="number" value={form.sets} onChange={e => setForm({ ...form, sets: parseInt(e.target.value) || 0 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Répétitions</label><input value={form.reps} onChange={e => setForm({ ...form, reps: e.target.value })} placeholder="12 ou 30s" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Repos (sec)</label><input type="number" value={form.rest_seconds} onChange={e => setForm({ ...form, rest_seconds: parseInt(e.target.value) || 60 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Intensité (optionnel)</label><input value={form.intensity} onChange={e => setForm({ ...form, intensity: e.target.value })} placeholder={`Ex: "à 100%", "2 RIR", "à l'échec"`} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Image / GIF (optionnel)</label>
            {form.media_url ? (
              <div className="relative inline-block">
                <img src={form.media_url} alt="Aperçu" className="h-28 w-auto rounded-md" />
                <button onClick={() => setForm(f => ({ ...f, media_url: "" }))} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <input type="file" accept="image/*,image/gif" onChange={handleFileUpload} disabled={uploading} className="text-sm" />
            )}
            {uploading && <p className="text-xs text-muted-foreground mt-1">Upload en cours...</p>}
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Instructions (optionnel)</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border border-border rounded-md px-3 py-2 text-sm resize-none" /></div>
          <div className="flex gap-2">
            <button onClick={submit} disabled={!form.name} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Ajouter"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <Dumbbell className="w-8 h-8 text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun exercice. Ajoutez les exercices de ce bloc ci-dessus.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ex, i) => (
            <div key={ex.id} className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-sm flex-shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-foreground">{ex.name}</p>
                    <p className="text-sm text-muted-foreground">{ex.sets} séries × {ex.reps} · {ex.rest_seconds}s repos{ex.intensity ? ` · ${ex.intensity}` : ""}</p>
                    {ex.description && <p className="text-sm text-foreground/60 mt-1">{ex.description}</p>}
                    {ex.media_url && <img src={ex.media_url} alt={ex.name} className="h-20 w-auto rounded-md mt-2" />}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => duplicate(ex)} className="p-1.5 text-muted-foreground hover:text-accent" title="Dupliquer"><Copy className="w-4 h-4" /></button>
                  <button onClick={() => edit(ex)} className="p-1.5 text-muted-foreground hover:text-accent"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => remove(ex.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}