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

// Photo : recadrée au carré et réduite à 320 px (JPEG) pour rester légère dans la base locale.
export async function photoFromFile(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = url; });
    const s = Math.min(img.naturalWidth, img.naturalHeight), N = 320;
    const c = document.createElement('canvas'); c.width = c.height = N;
    c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, N, N);
    return c.toDataURL('image/jpeg', 0.85);
  } finally { URL.revokeObjectURL(url); }
}

export const loadImage = src => new Promise(ok => { if (!src) return ok(null); const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
