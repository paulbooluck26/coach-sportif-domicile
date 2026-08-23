// Service worker minimal — sert uniquement à satisfaire les critères
// d'installation PWA de Chrome/Android. Ne met rien en cache : le site
// est dynamique (agenda, paiements...), on ne veut jamais montrer une
// version périmée.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
