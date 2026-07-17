import { useState } from "react";
import { X, Search } from "lucide-react";
import { MOUV_CATEG } from "@/lib/mouvementReferentiel";

// Sélecteur de références vers d'autres mouvements (variantes faciles/difficiles).
// values : tableau d'IDs. mouvements : liste complète. excludeId : mouvement en cours d'édition.
export default function MouvementPicker({ values = [], mouvements = [], excludeId, onChange }) {
  const [q, setQ] = useState("");

  const available = mouvements.filter(m => m.id !== excludeId && !values.includes(m.id));
  const filtered = q.trim()
    ? available.filter(m => m.nom.toLowerCase().includes(q.toLowerCase()))
    : [];
  const selected = values.map(id => mouvements.find(m => m.id === id)).filter(Boolean);

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(m => (
            <span key={m.id} className="inline-flex items-center gap-1 bg-secondary/10 text-foreground text-xs px-2 py-1 rounded-full">
              <span className="truncate max-w-[220px]">{m.nom}</span>
              <button type="button" onClick={() => onChange(values.filter(v => v !== m.id))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Rechercher un mouvement à lier…"
          className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:border-secondary"
        />
      </div>
      {q.trim() && (
        <div className="mt-2 border border-border rounded-md max-h-44 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-muted-foreground px-3 py-2">Aucun mouvement trouvé.</p>
          ) : filtered.map(m => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onChange([...values, m.id]); setQ(""); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
            >
              <span className="flex-1 truncate text-foreground">{m.nom}</span>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{MOUV_CATEG[m.categorie] || ""}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}