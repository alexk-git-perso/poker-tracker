import { lang, locale, sym } from './i18n.js';
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Montant : « +1 033 € » en français, « +€1,033 » en anglais (symbole selon la devise choisie)
export const eur = (v, sign) => {
  const s = Math.abs(v).toLocaleString(locale(), { maximumFractionDigits: Math.abs(v) < 100 && v % 1 ? 2 : 0 });
  const sg = v < 0 ? '−' : sign && v > 0 ? '+' : '';
  const c = sym();
  return lang === 'en' ? sg + c + (c.length > 1 && !c.endsWith('$') ? ' ' : '') + s : sg + s + ' ' + c;
};
export const num = v => Number(v).toLocaleString(locale());
export const fmtD = d => new Date(d + 'T12:00').toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtM = m => new Date(m + '-15T12:00').toLocaleDateString(locale(), { month: 'short', year: '2-digit' });
export const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
export const uid = () => (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
export const pct = (x, sign) => (sign && x > 0 ? '+' : '') + Math.round(x * 100) + (lang === 'en' ? '%' : ' %');
