/* Hermes Service Worker.
   Strategie:
   - Die App-Seite (HTML) = "Netzwerk zuerst": mit Internet immer die NEUESTE Version,
     ohne Netz die zuletzt gespeicherte. So kommen Updates automatisch beim Öffnen an.
   - Übrige Dateien (manifest, icon, Fonts) = "Cache zuerst", im Hintergrund nachgeladen.
   CACHE-Version bei größeren Änderungen erhöhen (v2 -> v3 …), damit alte Caches weichen. */
const CACHE = "hermes-v3";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  // App-Seite: Netzwerk zuerst, damit immer die neueste Version geladen wird.
  const isDoc = req.mode === "navigate" || req.destination === "document";
  if (isDoc) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then(hit => hit || caches.match("./")))
    );
    return;
  }

  // Restliche Dateien: Cache zuerst, sonst laden (und für offline cachen).
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => undefined))
  );
});
