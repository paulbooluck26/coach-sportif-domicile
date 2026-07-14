import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, Edit, Layers, Save, X, Copy, GripVertical } from "lucide-react";
import { cloneBloc } from "@/lib/programmeClone";

export default function BlocsPanel({ seanceId, onOpen }) {
  const [items, setItems] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ titre: "", ordre: 0, nb_series: 1, rounds: 1, rest_between_rounds: 60, rest_between_rounds_unit: "secondes" });
  const [editId, setEditId] = useState(null);

  const load = async () => { setItems(await base44.entities.Bloc.filter({ seance_programme_id: seanceId }, "ordre")); };
  useEffect(() => { load().catch(() => {}); }, [seanceId]);

  const submit = async () => {
    if (editId) { await base44.entities.Bloc.update(editId, form); setEditId(null); }
    else { await base44.entities.Bloc.create({ ...form, seance_programme_id: seanceId, ordre: form.ordre || (items?.length || 0) }); }
    setAdding(false); setForm({ titre: "", ordre: 0, nb_series: 1, rounds: 1, rest_between_rounds: 60, rest_between_rounds_unit: "secondes" }); load();
  };
  const edit = (b) => { setEditId(b.id); setForm({ titre: b.titre, ordre: b.ordre || 0, nb_series: b.nb_series || 1, rounds: b.rounds || 1, rest_between_rounds: b.rest_between_rounds || 60, rest_between_rounds_unit: b.rest_between_rounds_unit || "secondes" }); setAdding(true); };
  const remove = async (id) => { if (confirm("Supprimer ce bloc et ses exercices ?")) { await base44.entities.Bloc.delete(id); load(); } };
  const duplicate = async (b) => { await cloneBloc(b, seanceId); load(); };

  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
    try { await base44.entities.Bloc.bulkUpdate(reordered.map((b, i) => ({ id: b.id, ordre: i }))); }
    catch { load(); }
  };

  if (!items) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-foreground">Blocs de la séance</h2>
        {!adding && <button onClick={() => { setAdding(true); setForm({ titre: "", ordre: items.length || 0, nb_series: 1, rounds: 1, rest_between_rounds: 60, rest_between_rounds_unit: "secondes" }); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5"><Plus className="w-4 h-4" /> Bloc</button>}
      </div>

      {adding && (
        <div className="bg-card border border-accent/40 rounded-lg p-5 space-y-3">
          <div><label className="block text-xs font-medium text-muted-foreground mb-1">Titre du bloc</label><input value={form.titre} onChange={e => setForm({ ...form, titre: e.target.value })} placeholder="Ex: Échauffement, Circuit principal, Retour au calme" className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nombre de séries</label><input type="number" value={form.nb_series} onChange={e => setForm({ ...form, nb_series: parseInt(e.target.value) || 1 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
            <div><label className="block text-xs font-medium text-muted-foreground mb-1">Nombre de tours (rounds)</label><input type="number" value={form.rounds} onChange={e => setForm({ ...form, rounds: parseInt(e.target.value) || 1 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
          </div>
          {form.rounds > 1 && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Repos entre tours</label><input type="number" value={form.rest_between_rounds} onChange={e => setForm({ ...form, rest_between_rounds: parseInt(e.target.value) || 60 })} className="w-full border border-border rounded-md px-3 py-2 text-sm" /></div>
              <div><label className="block text-xs font-medium text-muted-foreground mb-1">Unité</label><select value={form.rest_between_rounds_unit} onChange={e => setForm({ ...form, rest_between_rounds_unit: e.target.value })} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-card"><option value="secondes">Secondes</option><option value="minutes">Minutes</option></select></div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={submit} disabled={!form.titre} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"><Save className="w-4 h-4" /> {editId ? "Modifier" : "Ajouter"}</button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="border border-border px-4 py-2 rounded-md text-sm"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {items.length === 0 && !adding ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center">
          <Layers className="w-8 h-8 text-secondary mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Aucun bloc. Les blocs regroupent les exercices (ex: échauffement, circuit principal).</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="blocs">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {items.map((b, index) => (
                  <Draggable key={b.id} draggableId={b.id} index={index}>
                    {(prov) => (
                      <div ref={prov.innerRef} {...prov.draggableProps} className="bg-card border border-border rounded-lg p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span {...prov.dragHandleProps} className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"><GripVertical className="w-5 h-5" /></span>
                          <button onClick={() => onOpen(b)} className="flex-1 text-left min-w-0">
                            <p className="font-heading font-semibold text-foreground truncate">{b.titre}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {b.nb_series || 1} série{(b.nb_series || 1) > 1 ? "s" : ""}{b.rounds && b.rounds > 1 ? ` · ${b.rounds} tours · ${b.rest_between_rounds || 60}${b.rest_between_rounds_unit === "minutes" ? "min" : "s"} entre tours` : ""}
                            </p>
                          </button>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button onClick={() => duplicate(b)} className="p-1.5 text-muted-foreground hover:text-accent" title="Dupliquer"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => edit(b)} className="p-1.5 text-muted-foreground hover:text-accent"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => remove(b.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
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
    </div>
  );
}