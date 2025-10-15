const CACHE_NAME = "pomodoro-cache-v1";
const CORE = [
	"./",
	"./index.html", // If you name the page index.html
	"./manifest.json",
	"./sw.js",
	"./icons/icon-192.png",
	"./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(CORE))
			.then(() => self.skipWaiting())
	);
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", (event) => {
	const req = event.request;
	const url = new URL(req.url);

	// Cache-first for same-origin GET requests
	if (req.method === "GET" && url.origin === location.origin) {
		event.respondWith(
			caches.match(req).then(
				(cached) =>
					cached ||
					fetch(req)
						.then((res) => {
							const copy = res.clone();
							caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
							return res;
						})
						.catch(() => caches.match("./"))
			)
		);
	}
});
