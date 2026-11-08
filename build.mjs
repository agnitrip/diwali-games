// Encrypts host-only data (quiz answers, couples questions) with the host PIN
// and inlines it into index.html. private/ is gitignored, so plaintext never ships.
import { readFileSync, writeFileSync } from 'node:fs';

function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const pin = readFileSync('private/pin.txt', 'utf8').trim();
const data = JSON.parse(readFileSync('private/host-data.json', 'utf8'));
const bytes = new TextEncoder().encode(JSON.stringify(data));
const rng = mulberry32(hashStr('diwali|' + pin));
for (let i = 0; i < bytes.length; i++) bytes[i] ^= Math.floor(rng() * 256);
const enc = Buffer.from(bytes).toString('base64');

const html = readFileSync('src/template.html', 'utf8').replace('__HOSTDATA__', enc);
writeFileSync('index.html', html);
console.log('built index.html', html.length, 'bytes');
