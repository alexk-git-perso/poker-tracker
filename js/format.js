export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const eur = (v, sign) => {
  const s = Math.abs(v).toLocaleString('fr-FR', { maximumFractionDigits: Math.abs(v) < 100 && v % 1 ? 2 : 0 });
  return (v < 0 ? '−' : sign && v > 0 ? '+' : '') + s + ' €';
};
export const fmtD = d => new Date(d + 'T12:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
export const fmtM = m => new Date(m + '-15T12:00').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
export const today = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
export const uid = () => (crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36));
