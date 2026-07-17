import { FileText } from "lucide-react";

export default function BiblioRessourceList({ ressources, onSelect }) {
  if (!ressources || ressources.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">Aucune ressource publiée dans cette catégorie pour le moment.</p>;
  }
  return (
    <div className="space-y-3">
      {ressources.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r)}
          className="w-full flex items-start gap-4 bg-card border border-border rounded-2xl p-4 text-left hover:border-secondary/40 transition-colors"
        >
          {r.images?.[0] ? (
            <img src={r.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-secondary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">{r.titre}</p>
            {r.sous_titre && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.sous_titre}</p>}
          </div>
        </button>
      ))}
    </div>
  );
}