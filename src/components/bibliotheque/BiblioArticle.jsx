import { ArrowLeft, ExternalLink, Download } from "lucide-react";

export default function BiblioArticle({ ressource, categorie, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {categorie?.titre || "Retour"}
      </button>

      <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-2">{categorie?.titre}</p>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{ressource.titre}</h1>
      {ressource.sous_titre && <p className="text-muted-foreground mb-6">{ressource.sous_titre}</p>}

      {ressource.images?.map((url, i) => (
        <img key={i} src={url} alt="" className="w-full rounded-xl mb-4" />
      ))}

      {ressource.contenu && (
        <div
          className="prose prose-sm max-w-none text-foreground/90 [&_p]:leading-relaxed [&_p]:mb-3 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-heading [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-secondary [&_a]:underline [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: ressource.contenu }}
        />
      )}

      {ressource.videos?.length > 0 && (
        <div className="space-y-3 mt-6">
          {ressource.videos.map((url, i) => (
            <video key={i} src={url} controls className="w-full rounded-xl" />
          ))}
        </div>
      )}

      {ressource.fichiers?.length > 0 && (
        <div className="mt-6 space-y-2">
          {ressource.fichiers.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-secondary hover:underline">
              <Download className="w-4 h-4" /> Pièce jointe {i + 1}
            </a>
          ))}
        </div>
      )}

      {ressource.liens?.length > 0 && (
        <div className="mt-6 space-y-2">
          {ressource.liens.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-secondary hover:underline break-all">
              <ExternalLink className="w-4 h-4 flex-shrink-0" /> {url}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}