import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Trash2, Edit, Layers, Save, X, GripVertical, ChevronRight } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const COULEURS = ["#6b7a4f", "#b8945a", "#3a5a40", "#a4633a", "#5b6b5b", "#8a6d3b", "#4a6d8a", "#7a5c8a"];
const empty = { nom: "", description: "", nb_semaines: "", couleur: "" };

export default function PhasesPanel({ programmeId, onOpen }) {
  const [phases, setPhases] = useState(null);
  const [counts, setCounts] = useState({});
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(empty);
  const [del, setDel] = useState(null);

  const load = async () => {
    let phs = await base44.entities.Phase.filter({ programme_id: programmeId }, "ordre");
    let sems = await base44.entities.Semaine.filter({ programme_id: programmeId }, "numero");
    // Migration : placer les semaines orphelines dans une phase par défaut
    const orphans = sems.filter(s => !s.phase_id);
    if (orphans.length) {
      let first = phs[0];
      if (!first) {
        first = await base44.entities.Phase.create({ programme_id: programmeId, nom: "Phase principale", ordre: 0 });
        phs = [first];
      }
      for (const s of orphans) await base44.entities.Semaine.update(s.id, { phase_id: first.id });
      sems = sems.map(s => (s.phase_id ? s : { ...s, phase_id: first.id }));
    }
    setPhases(phs);
    const c = {};
    phs.forEach(p => { c[p.id] = sems.filter(s => s.phase_id === p.id).length; });
    setCounts(c);
  };
  useEffect(() => { load().catch(() => {}); }, [programmeId]);

  const submit = async () => {
    if (!form.nom) return;
    if (editId) {
      await base44.entities.Phase.update(editId, form);
      setEditId(null);
    } else {
      await base44.entities.Phase.create({ ...form, programme_id: programmeId, ordre: phases?.length || 0 });
    }
    setAdding(false); setForm(empty); load();
  };
  const edit = (p) => { setEditId(p.id); setForm({ nom: p.nom || "", description: p.description || "", nb_semaines: p.nb_semaines || "", couleur: p.couleur || "" }); setAdding(true); };

  const onDragEnd = async (res) => {
    if (!res.destination || res.destination.index === res.source.index) return;
    const reordered = Array.from(phases);
    const [moved] = reordered.splice(res.source.index, 1);
    reordered.splice(res.destination.index, 0, moved);
    setPhases(reordered);
    for (let i = 0; i < reordered.length; i++) await base44.entities.Phase.update(reordered[i].id, { ordre: i });
  };

  const confirmDelete = async () => {
    const { phaseId, targetId } = del;
    const weeks = await base44.entities.Semaine.filter({ programme_id: programmeId, phase_id: phaseId });
    for (const w of weeks) await base44.entities.Semaine.update(w.id, { phase_id: targetId });
    await base44.entities.Phase.delete(phaseId);
    setDel(null); load();
  };

  if (!phases) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  const otherPhases = del ? phases.filter(p => p.id !== del.phaseId) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Phases du programme</h2>
        {!adding && <button onClick={() => { setAdding(true); setForm(empty); setEditId(null); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Phase</button>}
      </div>

      {adding && (
        <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nom de la phase</label><input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} placeholder="Ex: Adaptation" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Semaines prévues</label><input type="number" value={form.nb_semaines} onChange={e => setForm({ ...form, nb_semaines: e.target.value ? parseInt(e.target.value) : "" })} placeholder="Ex: 4" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          </div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Description (facultatif)</label><input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Couleur (facultatif)</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COULEURS.map(c => <button key={c} type="button" onClick={() => setForm({ ...form, couleur: c })} className={`w-7 h-7 rounded-full border-2 ${form.couleur === c ? "border-foreground" : "border-transparent"}`} style={{ backgroundColor: c }} />)}
              <input type="color" value={form.couleur || "#6b7a4f"} onChange={e => setForm({ ...form, couleur: e.target.value })} className="w-8 h-7 rounded border border-border bg-card" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Ajouter"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {phases.length === 0 && !adding ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <Layers className="w-8 h-8 text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucune phase. Ajoutez votre première phase ci-dessus pour structurer votre macrocycle.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="phases">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {phases.map((p, i) => (
                  <Draggable key={p.id} draggableId={p.id} index={i}>
                    {(prov, snap) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} className={`bg-card border rounded-lg p-4 ${snap.isDragging ? "border-accent shadow-lg" : "border-border"}`}>
                        <div className="flex items-center gap-3">
                          <span {...prov.dragHandleProps} className="cursor-grab text-muted-foreground hover:text-foreground"><GripVertical className="w-5 h-5" /></span>
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.couleur || "#6b7a4f" }} />
                          <button onClick={() => onOpen(p)} className="flex-1 text-left">
                            <p className="font-heading font-semibold text-foreground flex items-center gap-1.5">Phase {i + 1} — {p.nom} <ChevronRight className="w-4 h-4 text-muted-foreground" /></p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {counts[p.id] || 0} semaine{(counts[p.id] || 0) > 1 ? "s" : ""}{p.nb_semaines ? ` / ${p.nb_semaines} prévues` : ""}
                              {p.description ? ` · ${p.description}` : ""}
                            </p>
                          </button>
                          <div className="flex gap-1.5">
                            <button onClick={() => edit(p)} className="p-1.5 text-muted-foreground hover:text-accent"><Edit className="w-4 h-4" /></button>
                            {phases.length > 1 && <button onClick={() => setDel({ phaseId: p.id, targetId: phases.find(x => x.id !== p.id)?.id })} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {del && (
        <div className="fixed inset-0 z-50 bg-primary/40 flex items-center justify-center p-6" onClick={() => setDel(null)}>
          <div className="bg-card rounded-lg p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Supprimer la phase</h3>
            <p className="text-sm text-muted-foreground mb-4">Ses semaines seront déplacées vers :</p>
            <select value={del.targetId} onChange={e => setDel(d => ({ ...d, targetId: e.target.value }))} className="w-full border border-border rounded-md px-3 py-2 mb-4 bg-background">
              {otherPhases.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setDel(null)} className="flex-1 border border-border py-2.5 rounded-md text-sm font-medium text-foreground">Annuler</button>
              <button onClick={confirmDelete} className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-md text-sm font-semibold">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}