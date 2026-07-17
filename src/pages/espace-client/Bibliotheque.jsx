import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, BookOpen, ArrowLeft, FileText, Dumbbell } from "lucide-react";
import BiblioCategoryGrid from "@/components/bibliotheque/BiblioCategoryGrid";
import BiblioRessourceList from "@/components/bibliotheque/BiblioRessourceList";
import BiblioArticle from "@/components/bibliotheque/BiblioArticle";
import BiblioMouvements from "@/components/bibliotheque/BiblioMouvements";
import BiblioMouvementFiche from "@/components/bibliotheque/BiblioMouvementFiche";

export default function Bibliotheque() {
  const [categories, setCategories] = useState(null);
  const [ressources, setRessources] = useState(null);
  const [mouvements, setMouvements] = useState(null);
  const [view, setView] = useState("home");
  const [selCat, setSelCat] = useState(null);
  const [selRess, setSelRess] = useState(null);
  const [selMvt, setSelMvt] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cats, ress, mvt] = await Promise.all([
          base44.entities.RessourceCategorie.list("ordre"),
          base44.entities.Ressource.filter({ statut: "publie" }, "ordre"),
          base44.entities.Mouvement.filter({ statut: "publie" }, "ordre"),
        ]);
        setCategories(cats); setRessources(ress); setMouvements(mvt);
      } catch {
        setCategories([]); setRessources([]); setMouvements([]);
      }
    })();
  }, []);

  const openCategory = (c) => {
    setSelCat(c);
    setView(c.type === "mouvement" ? "mouvements" : "category");
  };

  if (!categories || !ressources || !mouvements) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-secondary border-t-primary rounded-full animate-spin" /></div>;
  }

  const searching = search.trim().length > 1;
  const s = search.trim().toLowerCase();
  const searchRess = searching ? ressources.filter(r => {
    const cat = categories.find(c => c.id === r.categorie_id);
    const hay = [r.titre, r.sous_titre, r.contenu, ...(r.mots_cles || []), cat?.titre].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(s);
  }) : [];
  const searchMvt = searching ? mouvements.filter(m => {
    const hay = [m.nom, m.description, m.objectif, m.famille, m.erreurs, m.conseils, ...(m.mots_cles || []), ...(m.muscles || []), ...(m.points_cles || [])].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(s);
  }) : [];

  return (
    <div className="space-y-5 pb-10">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground flex items-center gap-2"><BookOpen className="w-7 h-7 text-secondary" /> Académie FORGE</h1>
        <p className="text-sm text-muted-foreground mt-1">Guides, vocabulaire, techniques d'exécution et conseils pour progresser.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans toute la bibliothèque..."
          className="w-full pl-11 pr-10 py-3.5 rounded-full border border-input bg-card text-sm focus:border-secondary focus:outline-none"
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="w-5 h-5" /></button>}
      </div>

      {searching ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{searchRess.length + searchMvt.length} résultat(s) pour « {search.trim()} »</p>
          {searchRess.map(r => {
            const cat = categories.find(c => c.id === r.categorie_id);
            return (
              <button key={r.id} onClick={() => { setSelCat(cat); setSelRess(r); setSearch(""); setView("article"); }} className="w-full flex items-start gap-3 bg-card border border-border rounded-2xl p-4 text-left hover:border-secondary/40 transition-colors">
                <FileText className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{r.titre}</p>
                  <p className="text-xs text-muted-foreground">{cat?.titre} · Ressource</p>
                </div>
              </button>
            );
          })}
          {searchMvt.map(m => (
            <button key={m.id} onClick={() => { setSelMvt(m); setSearch(""); setView("fiche"); }} className="w-full flex items-start gap-3 bg-card border border-border rounded-2xl p-4 text-left hover:border-secondary/40 transition-colors">
              <Dumbbell className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{m.nom}</p>
                <p className="text-xs text-muted-foreground">Mouvement</p>
              </div>
            </button>
          ))}
          {searchRess.length + searchMvt.length === 0 && <p className="text-sm text-muted-foreground text-center py-10">Aucun résultat.</p>}
        </div>
      ) : view === "home" ? (
        <>
          <h2 className="font-heading text-lg font-semibold text-foreground">Catégories</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">La bibliothèque est en cours de constitution.</p>
          ) : (
            <BiblioCategoryGrid categories={categories} onSelect={openCategory} />
          )}
        </>
      ) : view === "category" ? (
        <>
          <button onClick={() => setView("home")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><ArrowLeft className="w-4 h-4" /> Catégories</button>
          <h2 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2"><span>{selCat?.emoji}</span> {selCat?.titre}</h2>
          <BiblioRessourceList ressources={ressources.filter(r => r.categorie_id === selCat.id)} onSelect={(r) => { setSelRess(r); setView("article"); }} />
        </>
      ) : view === "article" ? (
        <BiblioArticle ressource={selRess} categorie={selCat} onBack={() => setView("category")} />
      ) : view === "mouvements" ? (
        <BiblioMouvements mouvements={mouvements} onSelect={(m) => { setSelMvt(m); setView("fiche"); }} onBack={() => setView("home")} />
      ) : view === "fiche" ? (
        <BiblioMouvementFiche mouvement={selMvt} mouvements={mouvements} onBack={() => setView("mouvements")} onSelectMouvement={(m) => { setSelMvt(m); setView("fiche"); }} />
      ) : null}
    </div>
  );
}