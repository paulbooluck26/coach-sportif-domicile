import { useEffect } from "react";

/**
 * Ajuste le titre de l'onglet et la meta-description pour la page en
 * cours — nécessaire car toutes les pages du site partagent le même
 * index.html de base (application React "une seule page").
 */
export default function Seo({ title, description, path = "" }) {
  useEffect(() => {
    const fullTitle = title ? `${title} · PHYSIS COACHING` : "PHYSIS COACHING · Coach Sportif à Domicile Colmar";
    document.title = fullTitle;

    const setMeta = (selector, attr, value) => {
      let tag = document.querySelector(selector);
      if (!tag) return;
      tag.setAttribute(attr, value);
    };

    if (description) {
      setMeta('meta[name="description"]', "content", description);
      setMeta('meta[property="og:description"]', "content", description);
    }
    setMeta('meta[property="og:title"]', "content", fullTitle);

    const canonicalUrl = `https://physis-coaching.fr${path}`;
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);

    return () => {
      document.title = "PHYSIS COACHING · Coach Sportif à Domicile Colmar";
    };
  }, [title, description, path]);

  return null;
}
