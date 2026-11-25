// Base locale : IndexedDB, une fiche par session. Rien ne quitte l'appareil.
const NAME = 'poker', STORE = 'sessions', LEGACY = 'poker-sessions-v1';
let dbp = null;

function open() {
  if (!dbp) dbp = new Promise((ok, ko) => {
    const r = indexedDB.open(NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
    r.onsuccess = () => ok(r.result);
    r.onerror = () => ko(r.error);
  });
  return dbp;
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((ok, ko) => {
    const t = db.transaction(STORE, mode), req = fn(t.objectStore(STORE));
    t.oncomplete = () => ok(req && req.result);
    t.onerror = () => ko(t.error);
  });
}

export async function all() {
  const rows = await tx('readonly', st => st.getAll());
  if (rows.length) return rows;
  // Reprise des données de l'ancien prototype (localStorage), une seule fois
  try {
    const old = JSON.parse(localStorage.getItem(LEGACY) || '[]');
    if (Array.isArray(old) && old.length) { await replaceAll(old); localStorage.removeItem(LEGACY); return old; }
  } catch (e) { /* rien à reprendre */ }
  return [];
}

export const put = s => tx('readwrite', st => st.put(s));
export const remove = id => tx('readwrite', st => st.delete(id));
export const replaceAll = L => tx('readwrite', st => { st.clear(); L.forEach(s => st.put(s)); });

// Demande au navigateur de ne pas effacer les données en cas de manque de place
export async function persist() {
  try { return navigator.storage?.persist ? await navigator.storage.persist() : false; } catch (e) { return false; }
}
