const V='gym-v1',SHELL=['./','index.html','manifest.webmanifest','assets/img/poster.jpg','assets/img/rest.jpg','assets/icons/icon-192.png','assets/icons/icon-512.png'];
let timer=null;
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// App shell only. Audio/video are NOT intercepted so the browser's native range requests keep seeking instant.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin||/\/assets\/(audio|video)\//.test(u.pathname)||e.request.headers.has('range'))return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
});
// Rest-over backup alert (fires even if the page timer was throttled while the app is in the background)
self.addEventListener('message',e=>{
  const m=e.data||{};
  if(m.type==='cancel'){clearTimeout(timer);timer=null}
  if(m.type==='rest'){clearTimeout(timer);const ms=Math.max(0,m.at-Date.now());
    timer=setTimeout(()=>{self.registration.showNotification(m.title,{body:m.body,tag:'rest',renotify:true,icon:'assets/icons/icon-192.png',badge:'assets/icons/icon-192.png',vibrate:[300,120,300,120,500],requireInteraction:true})},ms)}
});
self.addEventListener('notificationclick',e=>{e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>l.length?l[0].focus():self.clients.openWindow('./')))});
