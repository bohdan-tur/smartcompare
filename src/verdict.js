// Висновок по кожному рядку порівняння пари: хто кращий, що уточнити, що однаково.
// Повертає { winner: 0 | 1 | null, unclear: bool, text, tone: 'win' | 'warn' | 'same', note }
const num = (s) => { const m = String(s || '').replace(/\s/g, '').match(/\d+/); return m ? Number(m[0]) : null; };
const money = (n) => n.toLocaleString('uk-UA').replace(/\s/g, ' ') + ' ₴';

export function verdict(key, a, b) {
  const fa = a.fields[key], fb = b.fields[key];
  const L = [a.letter, b.letter];
  const bad = [fa, fb].map((f) => f?.status === 'mismatch' || f?.status === 'missing');
  // Хоч одне значення незрозуміле: уточнювати
  if (bad[0] || bad[1]) {
    const who = bad[0] && bad[1] ? `${L[0]} і ${L[1]}` : bad[0] ? L[0] : L[1];
    const known = bad[0] && !bad[1] ? 1 : !bad[0] && bad[1] ? 0 : null;
    const both = [fa, fb].some((f) => f?.status === 'mismatch');
    if (key === 'battery' && known !== null && !both) return { winner: known, unclear: true, text: `${L[known]} — відомо`, tone: 'win' };
    return { winner: null, unclear: true, text: both ? 'не зрозуміло' : `уточнити в ${who}`, tone: 'warn' };
  }
  if (key === 'price') {
    if (a.price === b.price) return { winner: null, text: 'однаково', tone: 'same' };
    const w = a.price < b.price ? 0 : 1;
    return { winner: w, text: `${L[w]} дешевше на ${money(Math.abs(a.price - b.price))}`, tone: 'win' };
  }
  if (key === 'memory' || key === 'battery') {
    const x = num(fa.value), y = num(fb.value);
    if (x === y) return { winner: null, text: 'однаково', tone: 'same' };
    const w = x > y ? 0 : 1;
    return { winner: w, text: key === 'memory' ? `${L[w]} — більше пам'яті` : `${L[w]} — краще на ${Math.abs(x - y)} %`, tone: 'win' };
  }
  if (key === 'contact') {
    const r = [fa, fb].map((f) => f?.status === 'risk');
    if (r[0] === r[1]) return { winner: null, text: r[0] ? 'обидва ризиковані' : 'однаково', tone: r[0] ? 'warn' : 'same' };
    const w = r[0] ? 1 : 0;
    return { winner: w, text: `${L[w]} — безпечніше`, tone: 'win', note: `${L[1 - w]} переводить розмову за межі сайту` };
  }
  return { winner: null, text: '', tone: 'same' };
}

// «128 / 256 ГБ» → «128 чи 256?»
export const shortMismatch = (v) => String(v).replace(/\s*(ГБ|₴)\s*$/, '').replace(/\s*\/\s*/, ' чи ') + '?';
