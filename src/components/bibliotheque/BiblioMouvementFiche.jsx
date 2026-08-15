import { ArrowLeft, Dumbbell, Target, Wrench, AlertTriangle, Lightbulb, Star, Layers, ChevronRight } from "lucide-react";
import { MOUV_CATEG, NIVEAU, TYPES_MOUVEMENT } from "@/lib/mouvementReferentiel";

function toHtml(html) {
  if (!html) return "";
  const isHtml = /<[a-z][\s\S]*>/i.test(html);
  return isHtml ? html : html.replace(/\n/g, "<br/>");
}

// Convertit un lien YouTube/Vimeo classique en URL "embed" utilisable dans
// un iframe. Retourne null si ce n'est pas reconnu (dans ce cas on tente
// une lecture directe via <video>, pour les fichiers mp4/webm par exemple).
function toEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export default function BiblioMouvementFiche({ mouvement, mouvements = [], onBack, onSelectMouvement }) {
  const m = mouvement;

  const familleMembres = m.famille ? mouvements.filter(x => x.famille === m.famille && x.id !== m.id) : [];
  const faciles = (m.variantes_faciles || []).map(id => mouvements.find(x => x.id === id)).filter(Boolean);
  const difficiles = (m.variantes_difficiles || []).map(id => mouvements.find(x => x.id === id)).filter(Boolean);

  const go = (mvt) => { onSelectMouvement?.(mvt); window.scrollTo({ top: 0 }); };

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Bibliothèque des mouvements
      </button>

      {m.image_url && <img src={m.image_url} alt="" className="w-full h-52 object-cover rounded-2xl mb-4" />}

      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">{MOUV_CATEG[m.categorie]}</span>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{NIVEAU[m.niveau]}</span>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{TYPES_MOUVEMENT[m.type_mouvement] || "Polyarticulaire"}</span>
        {m.famille && <span className="text-xs font-medium text-secondary bg-secondary/5 px-2.5 py-1 rounded-full inline-flex items-center gap-1"><Layers className="w-3 h-3" /> {m.famille}</span>}
      </div>
      <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{m.nom}</h1>

      {m.difficulte_technique ? (
        <div className="flex items-center gap-1 mb-4">
          <span className="text-xs text-muted-foreground mr-1">Difficulté technique</span>
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} className={`w-4 h-4 ${n <= m.difficulte_technique ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
          ))}
        </div>
      ) : <div className="mb-4" />}

      {m.objectif && (
        <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-secondary font-semibold mb-1">Objectif</p>
          <p className="text-sm text-foreground leading-relaxed">{m.objectif}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        {m.muscles?.length > 0 && <Info icon={Target} label="Muscles principaux" value={m.muscles.join(", ")} />}
        {m.muscles_secondaires?.length > 0 && <Info icon={Target} label="Muscles secondaires" value={m.muscles_secondaires.join(", ")} />}
        {m.materiel?.length > 0 && <Info icon={Wrench} label="Matériel nécessaire" value={m.materiel.join(", ")} />}
      </div>

      {m.video_url && (
        toEmbedUrl(m.video_url) ? (
          <div className="w-full rounded-2xl overflow-hidden mb-6" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={toEmbedUrl(m.video_url)}
              title={m.nom}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <video src={m.video_url} controls className="w-full rounded-2xl mb-6" />
        )
      )}

      {m.description && (
        <Section icon={Dumbbell} title="Exécution">
          <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed [&_a]:text-secondary" dangerouslySetInnerHTML={{ __html: toHtml(m.description) }} />
        </Section>
      )}

      {m.points_cles?.length > 0 && (
        <Section icon={Dumbbell} title="Points clés">
          <ul className="space-y-1.5">
            {m.points_cles.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />{p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {m.erreurs && <Section icon={AlertTriangle} title="Erreurs fréquentes">{m.erreurs}</Section>}
      {m.conseils && <Section icon={Lightbulb} title="Conseils du coach">{m.conseils}</Section>}

      {(faciles.length > 0 || difficiles.length > 0) && (
        <div className="mb-5 space-y-3">
          {faciles.length > 0 && <VarianteBlock label="Variantes plus faciles" items={faciles} onSelect={go} />}
          {difficiles.length > 0 && <VarianteBlock label="Variantes plus difficiles" items={difficiles} onSelect={go} />}
        </div>
      )}

      {familleMembres.length > 0 && (
        <div className="mb-5">
          <p className="font-heading font-semibold text-foreground mb-2 flex items-center gap-2"><Layers className="w-4 h-4 text-secondary" /> Autres mouvements de la famille « {m.famille} »</p>
          <div className="grid grid-cols-1 gap-2">
            {familleMembres.map(x => (
              <button key={x.id} onClick={() => go(x)} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3 text-left hover:border-secondary/40 transition-colors">
                {x.image_url ? <img src={x.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-xl flex-shrink-0">🏋️</div>}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{x.nom}</p>
                  <p className="text-xs text-muted-foreground">{MOUV_CATEG[x.categorie]} · {NIVEAU[x.niveau]}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1"><Icon className="w-3 h-3" /> {label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mb-5">
      <p className="font-heading font-semibold text-foreground mb-1.5 flex items-center gap-2"><Icon className="w-4 h-4 text-secondary" /> {title}</p>
      {typeof children === "string"
        ? <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{children}</p>
        : children}
    </div>
  );
}

function VarianteBlock({ label, items, onSelect }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(x => (
          <button key={x.id} onClick={() => onSelect(x)} className="inline-flex items-center gap-2 bg-card border border-border rounded-full pl-1.5 pr-3 py-1 hover:border-secondary/40 transition-colors">
            {x.image_url ? <img src={x.image_url} alt="" className="w-6 h-6 rounded-full object-cover" /> : <span className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-xs">🏋️</span>}
            <span className="text-sm font-medium text-foreground">{x.nom}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
