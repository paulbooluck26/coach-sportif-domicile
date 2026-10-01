// <picture> responsive pour les images locales pré-optimisées dans
// public/img/ (voir scripts/optimize-images.py) : une variante WebP
// par largeur en <source>, avec repli JPEG/PNG pour les navigateurs
// qui ne supportent pas WebP (Safari < 14, très résiduel aujourd'hui,
// mais gratuit à couvrir puisque le fallback existe déjà).
//
// basePath: chemin sans extension ni suffixe de largeur, ex.
// "/img/photo-domicile" — les fichiers réels sont
// "/img/photo-domicile-480w.webp", "-900w.webp", etc.
export default function ResponsivePicture({
  basePath,
  widths,
  fallbackExt = "jpg",
  alt,
  sizes,
  loading = "lazy",
  fetchPriority,
  className,
}) {
  const webpSrcSet = widths.map((w) => `${basePath}-${w}w.webp ${w}w`).join(", ");
  const fallbackSrcSet = widths.map((w) => `${basePath}-${w}w.${fallbackExt} ${w}w`).join(", ");
  const largeur = widths[Math.floor(widths.length / 2)];

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img
        src={`${basePath}-${largeur}w.${fallbackExt}`}
        srcSet={fallbackSrcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={className}
      />
    </picture>
  );
}
