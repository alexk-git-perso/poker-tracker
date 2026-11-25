// Incrémente la version (majeur.AAAAMMJJ.mineur) : nouveau jour → mineur 1, même jour → mineur + 1.
// Usage : node tools/bump.mjs [--major]
import fs from 'node:fs';
const file = new URL('../js/version.js', import.meta.url);
const src = fs.readFileSync(file, 'utf8');
const [maj, date, min] = src.match(/'(\d+)\.(\d{8})\.(\d+)'/).slice(1).map(Number);
const d = new Date(), today = Number(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`);
const major = process.argv.includes('--major') ? maj + 1 : maj;
const next = `${major}.${today}.${date === today && major === maj ? min + 1 : 1}`;
fs.writeFileSync(file, src.replace(/'\d+\.\d{8}\.\d+'/, `'${next}'`));
console.log(next);
