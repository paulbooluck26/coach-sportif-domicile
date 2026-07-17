import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategorieEditor from "@/components/bibliotheque/admin/CategorieEditor";
import RessourceEditor from "@/components/bibliotheque/admin/RessourceEditor";
import MouvementEditor from "@/components/bibliotheque/admin/MouvementEditor";

const MOUV_CATEG = { push: "Push", jambes: "Jambes", tirage: "Tirage", gainage: "Gainage", dos: "Dos", epaules: "Épaules", cardio: "Cardio", mobilite: "Mobilité", autre: "Autre" };
const NIVEAU = { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé" };
const ENTITY = { categories: "RessourceCategorie", ressources: "Ressource", mouvements: "Mouvement" };

export default function CoachBibliotheque() {
  const [tab, setTab] = useState("categories");
  const [data, setData] = useState({ categories: [], ressources: [], mouvements: [] });
  const [loading, setLoading] = useState(true);
  const [editor, setEditor] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const [cats, ress, mvt] = await Promise.all([
        base44.entities.RessourceCategorie.list("ordre"),
        base44.entities.Ressource.list("ordre"),
        base44.entities.Mouvement.list("ordre"),
      ]);
      setData({ categories: cats, ressources: ress, mouvements: mvt });
    } catch {}
    setLoading(false);
  };
  useEffect(() => { reload(); }, []);

  const move = async (key, index, dir) => {
    const list = data[key];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const copy = [...list];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setData({ ...data, [key]: copy });
    try {
      await base44.entities[ENTITY[key]].bulkUpdate(copy.map((it, i) => ({ id: it.id, ordre: i })));
    } catch { reload(); }
  };

  const remove = async (key, id) => {
    if (!window.confirm("Supprimer définitivement cet élément ?")) return;
    try { await base44.entities[ENTITY[key]].delete(id); reload(); } catch {}
  };

  const save = async (key, payload) => {
    try {
      if (payload.id) await base44.entities[ENTITY[key]].update(payload.id, payload);
      else await base44.entities[ENTITY[key]].create(payload);
      setEditor(null);
      reload();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Bibliothèque</h1>
        <p className="text-sm text-muted-foreground">Gérez les catégories, ressources et mouvements de l'Académie FORGE.</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {[{ id: "categories", label: "Catégories" }, { id: "ressources", label: "Ressources" }, { id: "mouvements", label: "Mouvements" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? "border-secondary text-secondary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : tab === "categories" ? (
        <ListSection
          items={data.categories}
          onNew={() => setEditor({ key: "categories", initial: null })}
          onEdit={(c) => setEditor({ key: "categories", initial: c })}
          onDelete={(id) => remove("categories", id)}
          onMove={(i, d) => move("categories", i, d)}
          renderTitle={(c) => (<><span className="text-2xl mr-1">{c.emoji || "📚"}</span> {c.titre}</>)}
          renderSub={(c) => `${c.type === "mouvement" ? "Bibliothèque des mouvements" : "Articles"}${c.description ? ` · ${c.description}` : ""}`}
        />
      ) : tab === "ressources" ? (
        <ListSection
          items={data.ressources}
          onNew={() => setEditor({ key: "ressources", initial: null })}
          onEdit={(r) => setEditor({ key: "ressources", initial: r })}
          onDelete={(id) => remove("ressources", id)}
          onMove={(i, d) => move("ressources", i, d)}
          renderTitle={(r) => r.titre}
          renderSub={(r) => {
            const cat = data.categories.find(c => c.id === r.categorie_id);
            return `${cat ? `${cat.emoji} ${cat.titre}` : "Sans catégorie"} · ${r.statut === "publie" ? "Publié" : "Brouillon"}`;
          }}
          newLabel="Nouvelle ressource"
        />
      ) : (
        <ListSection
          items={data.mouvements}
          onNew={() => setEditor({ key: "mouvements", initial: null })}
          onEdit={(m) => setEditor({ key: "mouvements", initial: m })}
          onDelete={(id) => remove("mouvements", id)}
          onMove={(i, d) => move("mouvements", i, d)}
          renderTitle={(m) => m.nom}
          renderSub={(m) => `${MOUV_CATEG[m.categorie]} · ${NIVEAU[m.niveau]} · ${m.statut === "publie" ? "Publié" : "Brouillon"}`}
          newLabel="Nouveau mouvement"
        />
      )}

      {editor?.key === "categories" && <CategorieEditor open initial={editor.initial} onClose={() => setEditor(null)} onSave={(d) => save("categories", d)} />}
      {editor?.key === "ressources" && <RessourceEditor open initial={editor.initial} categories={data.categories} onClose={() => setEditor(null)} onSave={(d) => save("ressources", d)} />}
      {editor?.key === "mouvements" && <MouvementEditor open initial={editor.initial} mouvements={data.mouvements} onClose={() => setEditor(null)} onSave={(d) => save("mouvements", d)} />}
    </div>
  );
}

function ListSection({ items, onNew, onEdit, onDelete, onMove, renderTitle, renderSub, newLabel }) {
  return (
    <div className="space-y-3">
      <Button onClick={onNew} className="w-fit"><Plus className="w-4 h-4" /> {newLabel || "Nouvel élément"}</Button>
      {items.length === 0 && <p className="text-sm text-muted-foreground py-4">Aucun élément pour le moment.</p>}
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
          <div className="flex flex-col">
            <button onClick={() => onMove(i, -1)} disabled={i === 0} className="text-muted-foreground disabled:opacity-30 hover:text-foreground"><ArrowUp className="w-4 h-4" /></button>
            <button onClick={() => onMove(i, 1)} disabled={i === items.length - 1} className="text-muted-foreground disabled:opacity-30 hover:text-foreground"><ArrowDown className="w-4 h-4" /></button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{renderTitle(item)}</p>
            <p className="text-xs text-muted-foreground truncate">{renderSub(item)}</p>
          </div>
          <button onClick={() => onEdit(item)} className="p-2 hover:bg-muted rounded-md"><Pencil className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={() => onDelete(item.id)} className="p-2 hover:bg-muted rounded-md"><Trash2 className="w-4 h-4 text-destructive" /></button>
        </div>
      ))}
    </div>
  );
}