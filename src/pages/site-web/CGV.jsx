import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { CGV_ARTICLES } from "@/lib/cgvTexte";
import { CGV_VERSION } from "@/lib/legalConfig";

export default function CGV() {
  const [generation, setGeneration] = useState(false);
  const [erreur, setErreur] = useState(false);

  // Le PDF est généré dans le navigateur à partir du même texte que celui
  // affiché ci-dessous ; la librairie jsPDF n'est chargée qu'au clic.
  const telecharger = async () => {
    setGeneration(true);
    setErreur(false);
    try {
      const { genererCgvPdf, nomFichierCgv } = await import("@/lib/cgvPdf");
      const doc = await genererCgvPdf();
      doc.save(nomFichierCgv());
    } catch {
      setErreur(true);
    } finally {
      setGeneration(false);
    }
  };

  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6 lg:px-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary uppercase mb-2">Conditions Générales de Vente</h1>
          <p className="text-xs text-muted-foreground">Version {CGV_VERSION}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={telecharger}
            disabled={generation}
            className="inline-flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:border-accent transition-colors disabled:opacity-60"
          >
            {generation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Télécharger (PDF)
          </button>
          {erreur && <p className="text-xs text-destructive">Le PDF n'a pas pu être généré. Réessayez ou imprimez cette page.</p>}
        </div>
      </div>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        {CGV_ARTICLES.map((article) => (
          <section key={article.titre}>
            <h2 className="font-heading font-semibold text-primary text-lg mb-2">{article.titre}</h2>
            <div className="space-y-3">
              {article.paragraphes.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
