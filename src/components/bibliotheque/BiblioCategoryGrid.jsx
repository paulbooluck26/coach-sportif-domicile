export default function BiblioCategoryGrid({ categories, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c)}
          className="bg-card border border-border rounded-2xl p-5 text-left hover:border-secondary/40 hover:shadow-sm transition-all"
        >
          <span className="text-3xl block mb-3">{c.emoji || "📚"}</span>
          <p className="font-heading font-semibold text-foreground text-sm leading-tight">{c.titre}</p>
          {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
        </button>
      ))}
    </div>
  );
}