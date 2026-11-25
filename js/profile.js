// Couleurs proposées : tapis (deux tons) et accent (boutons, jetons).
export const THEMES = {
  vert: { name: 'Tapis vert', felt: '#0d4a33', felt2: '#13704c', accent: '#c8202f' },
  bleu: { name: 'Bleu nuit', felt: '#13294f', felt2: '#1f4380', accent: '#d8402c' },
  bordeaux: { name: 'Bordeaux', felt: '#4a1020', felt2: '#7a1a33', accent: '#2f6fb0' },
  petrole: { name: 'Pétrole', felt: '#0b4650', felt2: '#11707e', accent: '#d8402c' },
  noir: { name: 'Noir', felt: '#141618', felt2: '#2c3035', accent: '#c8202f' },
};
export const theme = p => THEMES[p?.theme] || THEMES.vert;

export function applyTheme(p) {
  const t = theme(p), r = document.documentElement.style;
  r.setProperty('--felt', t.felt); r.setProperty('--felt2', t.felt2); r.setProperty('--chip', t.accent);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', t.felt);
}

export const initials = name => (name || '').trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');

// Photo : on garde l'original réduit (pour pouvoir recadrer plus tard) et la version recadrée 320 px.
export async function sourceFromFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
    const k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.88);
  } finally { URL.revokeObjectURL(url); }
}

// Cadrage : { cx, cy } point de l'image au centre du cercle, zoom ≥ 1 (1 = le petit côté remplit le cercle)
export const defaultCrop = img => ({ cx: img.naturalWidth / 2, cy: img.naturalHeight / 2, zoom: 1 });
export function clampCrop(img, c) {
  const zoom = Math.min(5, Math.max(1, c.zoom)), half = Math.min(img.naturalWidth, img.naturalHeight) / zoom / 2;
  return { zoom, cx: Math.min(img.naturalWidth - half, Math.max(half, c.cx)), cy: Math.min(img.naturalHeight - half, Math.max(half, c.cy)) };
}
export function drawCrop(ctx, img, c, N) {
  const side = Math.min(img.naturalWidth, img.naturalHeight) / c.zoom;
  ctx.drawImage(img, c.cx - side / 2, c.cy - side / 2, side, side, 0, 0, N, N);
}
export function cropToPhoto(img, c) {
  const N = 512, cv = document.createElement('canvas'); cv.width = cv.height = N;
  drawCrop(cv.getContext('2d'), img, c, N);
  return cv.toDataURL('image/jpeg', 0.85);
}

// Photo de session : réduite à 1600 px de côté au plus, JPEG ~0,82 (quelques centaines de Ko)
export async function sessionPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
    const k = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return await new Promise(ok => c.toBlob(ok, 'image/jpeg', 0.82));
  } finally { URL.revokeObjectURL(url); }
}

export const loadImage = src => new Promise(ok => { if (!src) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
