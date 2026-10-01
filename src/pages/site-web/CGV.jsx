import { Download } from "lucide-react";
import { CGV_ARTICLES, CGV_TEXTE } from "@/lib/cgvTexte";
import { CGV_VERSION } from "@/lib/legalConfig";

function telecharger() {
  const blob = new Blob([CGV_TEXTE], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `physis-coaching-cgv-${CGV_VERSION}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CGV() {
  return (
    <div className="pt-32 pb-24 max-w-3xl mx-auto px-6 lg:px-10">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
        <div>
          <h1 className="text-4xl font-heading font-bold text-primary uppercase mb-2">Conditions Générales de Vente</h1>
          <p className="text-xs text-muted-foreground">Version {CGV_VERSION}</p>
        </div>
        <button
          onClick={telecharger}
          className="inline-flex items-center gap-2 border border-border text-foreground px-4 py-2.5 rounded-md text-sm font-medium hover:border-accent transition-colors"
        >
          <Download className="w-4 h-4" /> Télécharger
        </button>
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
