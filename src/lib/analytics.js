// Petit module central pour Google Analytics 4.
// Rien ne se charge tant que le consentement cookies n'a pas été donné
// explicitement — voir CookieConsent.jsx.

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let dejaInitialise = false;

export function chargerGA() {
  if (dejaInitialise || !GA_ID) return;
  dejaInitialise = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID, { send_page_view: false }); // les pages sont suivies manuellement, une par changement de route
}

export function suiviPage(cheminComplet) {
  if (!window.gtag) return;
  window.gtag("event", "page_view", { page_path: cheminComplet });
}

export function suiviEvenement(nom, params = {}) {
  if (!window.gtag) return;
  window.gtag("event", nom, params);
}
