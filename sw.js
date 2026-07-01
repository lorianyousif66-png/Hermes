/* Hermes Service Worker — App-Shell offline cachen.
   Bei jeder Änderung an index.html die CACHE-Version erhöhen (v1 -> v2 …),
   damit Updates auf dem Gerät ankommen. */
const CACHE = "hermes-v2";
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
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      // Erfolgreiche Antworten (App + Google Fonts) fürs Offline-Nutzen cachen.
      if (res && res.ok && (req.url.startsWith(self.location.origin) || req.url.includes("fonts.g"))) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => {
      // Offline und nicht im Cache: bei Navigation die App-Shell liefern.
      if (req.mode === "navigate") return caches.match("./index.html");
    }))
  );
});
