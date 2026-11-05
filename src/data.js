// Захардкоджений «бекенд»: замість API прототип розпізнає посилання локально.
// Перші три приклади відповідають сценарію Максима з ЛР2: чесне, з прогалинами й ризиком, інша модель.
// Решта додані, щоб показати попарне порівняння з чергою.

import pmBack from './photos/pm-back.jpg';
import pmAbout from './photos/pm-about.jpg';
import pmBattery from './photos/pm-battery.jpg';
import pmSide from './photos/pm-side.jpg';
import pmBottom from './photos/pm-bottom.jpg';
import pmCamera from './photos/pm-camera.jpg';
import pmAboutZoom from './photos/pm-about-zoom.jpg';
import pmBatteryZoom from './photos/pm-battery-zoom.jpg';
import gSide1 from './photos/g-side-1.jpg';
import gSide2 from './photos/g-side-2.jpg';
import gSide3 from './photos/g-side-3.jpg';
import gBottom1 from './photos/g-bottom-1.jpg';
import gBottom2 from './photos/g-bottom-2.jpg';
import gBottom3 from './photos/g-bottom-3.jpg';
// Загальні ракурси (бік, низ) нарізані з фото, які надав автор ЛР; моделі й цифр на них не видно
const GENERIC = [[gSide1, gBottom1], [gSide2, gBottom2], [gSide3, gBottom3], [gSide2, gBottom1], [gSide1, gBottom3], [gSide3, gBottom2]];

export const SUPPORTED = ['olx.ua', 'prom.ua'];
export const MAX_LISTINGS = Infinity; // попарне порівняння: оголошень скільки завгодно, у таблиці завжди двоє
export const BASE_MODEL = 'iPhone 13';

// Рядки таблиці порівняння (порядок = порядок у таблиці)
export const ROWS = [
  { key: 'price', label: 'Ціна', icon: 'tag' },
  { key: 'memory', label: "Пам'ять", icon: 'hardDrive' },
  { key: 'battery', label: 'Акумулятор', icon: 'battery' },
  { key: 'contact', label: "Зв'язок", icon: 'message' },
];

const Q = {
  battery: {
    value: 'Не вказано', status: 'missing',
    note: 'Продавець не вказав стан акумулятора. Для iPhone 13 нормою вважається від 80 %.',
    question: 'Який відсоток ємності акумулятора? Надішліть скриншот з «Параметри → Акумулятор → Стан акумулятора».',
  },
  messenger: {
    value: 'Месенджер', status: 'risk',
    note: 'Продавець просить перейти в месенджер. Поза сайтом не діє захист покупця і безпечна доставка, тож так часто роблять шахраї.',
    question: 'Чи можемо оформити покупку через безпечну доставку на сайті, без передоплати в месенджері?',
  },
};

// value: що показати; status: null | 'missing' | 'mismatch' | 'risk';
// detail: коротко, у чому розбіжність (видно прямо в таблиці); note: пояснення для шторки; question: питання продавцю
// color: колір корпусу для ілюстрації телефона
const LISTINGS = [
  {
    id: 'ida1kp', seller: { name: 'Олег К.', initials: 'ОК', rating: 4.9, reviews: 128, verified: true, since: 'з 2019', sold: 54, reply: '~15 хв', phone: true }, label: 'Київ, без питань', color: 'midnight',
    model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price: 14500, city: 'Київ', condition: 'стан добрий',
    fields: { price: { value: '14 500 ₴' }, memory: { value: '128 ГБ' }, battery: { value: '87 %' }, contact: { value: 'Чат сайту' } },
  },
  {
    id: 'p2048813', seller: { name: 'Марта', initials: 'М', rating: 4.2, reviews: 3, verified: false, since: '2 місяці', sold: 2, reply: '~1 день', phone: false }, host: 'prom.ua', label: 'Львів, розбіжність', color: 'blue',
    model: 'iPhone 13', title: 'iPhone 13, 256 ГБ', price: 13900, city: 'Львів', condition: 'стан відмінний',
    fields: {
      price: { value: '13 900 ₴' },
      memory: {
        value: '128 / 256 ГБ', status: 'mismatch', detail: 'заголовок 256 · опис 128',
        note: 'У заголовку вказано 256 ГБ, а в описі 128 ГБ. Ціна схожа на модель зі 128 ГБ.',
        question: "Скільки пам'яті в телефоні: 128 чи 256 ГБ? Надішліть, будь ласка, скриншот з «Параметри → Загальні → Про пристрій».",
      },
      battery: Q.battery,
      contact: Q.messenger,
    },
  },
  {
    id: 'mini-idc7zt', seller: { name: 'Ірина С.', initials: 'ІС', rating: 4.8, reviews: 41, verified: true, since: 'з 2021', sold: 19, reply: '~1 год', phone: true }, label: 'Одеса, 13 mini', color: 'pink',
    model: 'iPhone 13 mini', title: 'iPhone 13 mini, 128 ГБ', price: 11900, city: 'Одеса', condition: 'стан добрий',
    fields: { price: { value: '11 900 ₴' }, memory: { value: '128 ГБ' }, battery: { value: '91 %' }, contact: { value: 'Чат сайту' } },
  },
  {
    id: 'idh4rk', seller: { name: 'Андрій П.', initials: 'АП', rating: 4.7, reviews: 63, verified: true, since: 'з 2020', sold: 37, reply: '~30 хв', phone: true }, label: 'Харків, без питань', color: 'starlight',
    model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price: 13200, city: 'Харків', condition: 'стан добрий',
    fields: { price: { value: '13 200 ₴' }, memory: { value: '128 ГБ' }, battery: { value: '84 %' }, contact: { value: 'Чат сайту' } },
  },
  {
    id: 'iddn9p', seller: { name: 'Дмитро', initials: 'Д', rating: 3.9, reviews: 5, verified: false, since: '3 тижні', sold: 1, reply: '~2 дні', phone: false }, label: 'Дніпро, месенджер', color: 'red',
    model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price: 12800, city: 'Дніпро', condition: 'є подряпини',
    fields: { price: { value: '12 800 ₴' }, memory: { value: '128 ГБ' }, battery: Q.battery, contact: Q.messenger },
  },
  {
    id: 'p3310544', seller: { name: 'iStore Вінниця', initials: 'iS', rating: 4.9, reviews: 412, verified: true, since: 'з 2016', sold: 980, reply: '~10 хв', phone: true }, host: 'prom.ua', label: 'Вінниця, 256 ГБ', color: 'green',
    model: 'iPhone 13', title: 'iPhone 13, 256 ГБ', price: 15900, city: 'Вінниця', condition: 'як новий',
    fields: { price: { value: '15 900 ₴' }, memory: { value: '256 ГБ' }, battery: { value: '92 %' }, contact: { value: 'Чат сайту' } },
  },
  {
    id: 'idpl2v', seller: { name: 'Вікторія', initials: 'В', rating: 4.5, reviews: 12, verified: false, since: 'з 2023', sold: 6, reply: '~3 год', phone: true }, label: 'Полтава, ціна', color: 'midnight',
    model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price: 11500, city: 'Полтава', condition: 'стан добрий',
    fields: {
      price: {
        value: '11 500 / 12 500 ₴', status: 'mismatch', detail: 'ціна 11 500 · опис 12 500',
        note: 'У полі ціни 11 500 ₴, а в описі продавець пише 12 500 ₴. Можлива приманка низькою ціною.',
        question: 'Яка остаточна ціна: 11 500 чи 12 500 ₴? У полі ціни і в описі різні суми.',
      },
      memory: { value: '128 ГБ' }, battery: { value: '81 %' }, contact: { value: 'Чат сайту' },
    },
  },
  {
    id: 'idzp7m', seller: { name: 'Сергій Л.', initials: 'СЛ', rating: 4.6, reviews: 29, verified: true, since: 'з 2022', sold: 14, reply: '~1 год', phone: true }, label: 'Запоріжжя, без питань', color: 'blue',
    model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price: 13700, city: 'Запоріжжя', condition: 'стан добрий',
    fields: { price: { value: '13 700 ₴' }, memory: { value: '128 ГБ' }, battery: { value: '88 %' }, contact: { value: 'Чат сайту' } },
  },
];

// Оголошення з реальними фото (знімки екрана оголошення, надані автором ЛР): галерея з 5 фото
LISTINGS.push({
  id: 'idzcwbp', label: 'Кам\'янець, Pro Max (фото)', color: 'starlight',
  photos: [pmBack, pmCamera, pmAbout, pmAboutZoom, pmBattery, pmBatteryZoom, pmSide, pmBottom],
  seller: { name: 'Роман Т.', initials: 'РТ', rating: 4.8, reviews: 76, verified: true, since: 'з 2020', sold: 88, reply: '~20 хв', phone: true },
  model: 'iPhone 13 Pro Max', title: 'iPhone 13 Pro Max, 256 ГБ', price: 17700, city: 'Кам\'янець-Подільський', condition: 'ідеальний стан',
  fields: { price: { value: '17 700 ₴' }, memory: { value: '256 ГБ' }, battery: { value: '96 %' }, contact: { value: 'Чат сайту' } },
});

// Решта оголошень: 2 намальовані ракурси + 2 реальні загальні кадри
LISTINGS.forEach((l, i) => { if (!l.photos) l.photos = [{ view: 'back' }, { view: 'front' }, ...GENERIC[i % GENERIC.length]]; });

const urlOf = (l) => l.host === 'prom.ua'
  ? `https://prom.ua/ua/${l.id}-iphone-13.html`
  : `https://www.olx.ua/d/uk/obyavlenie/iphone-13-${l.id}.html`;

// Чипи-приклади на екрані «Нове оголошення»
export const SAMPLE_LIST = [
  ...LISTINGS.map((l) => ({ label: l.label, url: urlOf(l) })),
  { label: 'Знято з продажу', url: 'https://www.olx.ua/d/uk/obyavlenie/iphone-13-pro-IDdeleted.html' },
  { label: 'Інший сайт', url: 'https://rozetka.com.ua/apple-iphone-13-128gb/p324523/' },
];
export const ALL_SAMPLE_URLS = LISTINGS.map(urlOf);
export const SAMPLES = { a: urlOf(LISTINGS[0]), b: urlOf(LISTINGS[1]), c: urlOf(LISTINGS[2]) };

const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const fmt = (n) => n.toLocaleString('uk-UA').replace(/\s/g, ' ') + ' ₴';
const COLORS = ['midnight', 'starlight', 'blue', 'pink', 'red', 'green'];

// Нормалізує введений текст: прибирає пробіли, додає https://
export function normalize(raw) {
  let s = (raw || '').trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  return s;
}

// Повертає { ok:true, key, host, path } або { ok:false, kind, message }
export function validate(raw, existing) {
  const trimmed = (raw || '').trim();
  if (!trimmed) return { ok: false, kind: 'empty', message: 'Вставте посилання на оголошення' };
  if (/\s/.test(trimmed)) return { ok: false, kind: 'format', message: 'Це не схоже на посилання. Скопіюйте адресу з рядка браузера' };
  let url;
  try { url = new URL(normalize(trimmed)); } catch { return { ok: false, kind: 'format', message: 'Це не схоже на посилання. Скопіюйте адресу з рядка браузера' }; }
  const host = url.hostname.replace(/^www\.|^m\./, '').toLowerCase();
  if (!host.includes('.')) return { ok: false, kind: 'format', message: 'Це не схоже на посилання. Скопіюйте адресу з рядка браузера' };
  if (!SUPPORTED.includes(host)) return { ok: false, kind: 'domain', message: `Поки що підтримуємо OLX і Prom. Посилання з ${host} не розпізнаємо` };
  if (url.pathname.length < 3) return { ok: false, kind: 'format', message: 'Це головна сторінка сайту. Відкрийте оголошення і скопіюйте його адресу' };
  const key = (host + url.pathname).toLowerCase().replace(/\/+$/, '');
  if (existing.some((l) => l.key === key)) return { ok: false, kind: 'duplicate', message: 'Це оголошення вже додано до порівняння' };
  return { ok: true, key, host, path: url.pathname.toLowerCase() };
}

// «Сервер»: повертає оголошення або помилку завантаження
export function fetchListing({ key, host, path }) {
  if (path.includes('deleted')) return { ok: false, message: 'Оголошення не знайдено: можливо, продавець його вже зняв' };
  const base = LISTINGS.find((l) => path.includes(l.id));
  if (base) return { ok: true, data: { ...base, key, host } };
  // Невідоме, але коректне посилання: формуємо типове оголошення з частково відсутніми даними
  const h = hash(key);
  const price = 12000 + (h % 30) * 100;
  const battery = h % 3 === 0 ? null : 80 + (h % 15);
  return {
    ok: true,
    data: {
      model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price, color: COLORS[h % COLORS.length], photos: [{ view: 'back' }, { view: 'front' }, ...GENERIC[h % GENERIC.length]],
      seller: { name: ['Ольга', 'Тарас', 'Наталія', 'Максим'][h % 4], initials: ['О', 'Т', 'Н', 'М'][h % 4], rating: 4 + (h % 10) / 10, reviews: 4 + (h % 60), verified: h % 2 === 0, since: 'з ' + (2018 + (h % 6)), sold: 2 + (h % 40), reply: ['~30 хв', '~2 год', '~1 день'][h % 3], phone: h % 3 !== 0 },
      city: ['Чернігів', 'Суми', 'Житомир', 'Рівне', 'Луцьк', 'Ужгород'][h % 6], condition: 'стан добрий', key, host,
      fields: {
        price: { value: fmt(price) },
        memory: { value: '128 ГБ' },
        battery: battery ? { value: battery + ' %' } : Q.battery,
        contact: { value: 'Чат сайту' },
      },
    },
  };
}

export const LETTERS = Array.from({ length: 200 }, (_, i) => '№' + (i + 1));
