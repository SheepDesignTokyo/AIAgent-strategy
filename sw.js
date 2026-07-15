/* AIX 即答ナビ Service Worker
   ゼロトラスト方針:
   - 同一オリジンのGETリクエストのみ処理(クロスオリジンは一切キャッシュ・仲介しない)
   - キャッシュ対象は自アプリの2ファイルのみ
   - バージョン更新時に旧キャッシュを完全削除                                  */
"use strict";
const CACHE = "aicxnav-v1.8.0";
const ASSETS = ["./", "./index.html", "./sw.js"];

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
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return; // 同一オリジン限定
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }))
  );
});
