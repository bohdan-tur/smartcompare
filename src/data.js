// Захардкоджений «бекенд»: замість API прототип розпізнає посилання локально.
// Три приклади відповідають сценарію Максима з ЛР2: А чесне, Б з прогалинами й ризиком, В інша модель.

export const SUPPORTED = ['olx.ua', 'prom.ua'];
export const MAX_LISTINGS = Infinity; // попарне порівняння: оголошень скільки завгодно, у таблиці завжди двоє
export const BASE_MODEL = 'iPhone 13';

export const SAMPLES = {
  a: 'https://www.olx.ua/d/uk/obyavlenie/iphone-13-128gb-midnight-IDa1kP.html',
  b: 'https://prom.ua/ua/p2048813-iphone-13-256gb.html',
  c: 'https://www.olx.ua/d/uk/obyavlenie/iphone-13-mini-128-IDc7Zt.html',
  removed: 'https://www.olx.ua/d/uk/obyavlenie/iphone-13-pro-IDdeleted.html',
  foreign: 'https://rozetka.com.ua/apple-iphone-13-128gb/p324523/',
};

// Рядки таблиці порівняння (порядок = порядок у таблиці)
export const ROWS = [
  { key: 'price', label: 'Ціна', icon: 'tag' },
  { key: 'memory', label: "Пам'ять", icon: 'hardDrive' },
  { key: 'battery', label: 'Акумулятор', icon: 'battery' },
  { key: 'contact', label: "Зв'язок", icon: 'message' },
];

// value: що показати; status: null | 'missing' | 'mismatch' | 'risk'; note: пояснення для шторки; question: питання продавцю
const LISTINGS = {
  a: {
    model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price: 14500, city: 'Київ', condition: 'стан добрий',
    fields: {
      price: { value: '14 500 ₴' },
      memory: { value: '128 ГБ' },
      battery: { value: '87 %' },
      contact: { value: 'Чат сайту' },
    },
  },
  b: {
    model: 'iPhone 13', title: 'iPhone 13, 256 ГБ', price: 13900, city: 'Львів', condition: 'стан відмінний',
    fields: {
      price: { value: '13 900 ₴' },
      memory: {
        value: '128 / 256 ГБ', status: 'mismatch',
        note: 'У заголовку вказано 256 ГБ, а в описі 128 ГБ. Ціна схожа на модель зі 128 ГБ.',
        question: "Скільки пам'яті в телефоні: 128 чи 256 ГБ? Надішліть, будь ласка, скриншот з «Параметри → Загальні → Про пристрій».",
      },
      battery: {
        value: 'Не вказано', status: 'missing',
        note: 'Продавець не вказав стан акумулятора. Для iPhone 13 нормою вважається від 80 %.',
        question: 'Який відсоток ємності акумулятора? Надішліть скриншот з «Параметри → Акумулятор → Стан акумулятора».',
      },
      contact: {
        value: 'Месенджер', status: 'risk',
        note: 'Продавець просить перейти в месенджер. Поза сайтом не діє захист покупця і безпечна доставка, тож так часто роблять шахраї.',
        question: 'Чи можемо оформити покупку через безпечну доставку на сайті, без передоплати в месенджері?',
      },
    },
  },
  c: {
    model: 'iPhone 13 mini', title: 'iPhone 13 mini, 128 ГБ', price: 11900, city: 'Одеса', condition: 'стан добрий',
    fields: {
      price: { value: '11 900 ₴' },
      memory: { value: '128 ГБ' },
      battery: { value: '91 %' },
      contact: { value: 'Чат сайту' },
    },
  },
};

const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const fmt = (n) => n.toLocaleString('uk-UA').replace(/ /g, ' ') + ' ₴';

// Нормалізує введений текст: прибирає пробіли, додає https://
export function normalize(raw) {
  let s = (raw || '').trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  return s;
}

// Повертає { ok:true, id, data } або { ok:false, field:'…', kind, message }
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
  let base;
  if (path.includes('ida1kp')) base = LISTINGS.a;
  else if (path.includes('p2048813')) base = LISTINGS.b;
  else if (path.includes('mini')) base = LISTINGS.c;
  if (base) return { ok: true, data: { ...base, key, host } };
  // Невідоме, але коректне посилання: формуємо типове оголошення з частково відсутніми даними
  const h = hash(key);
  const price = 12000 + (h % 30) * 100;
  const battery = h % 3 === 0 ? null : 80 + (h % 15);
  return {
    ok: true,
    data: {
      model: 'iPhone 13', title: 'iPhone 13, 128 ГБ', price, city: ['Харків', 'Дніпро', 'Вінниця', 'Полтава'][h % 4], condition: 'стан добрий', key, host,
      fields: {
        price: { value: fmt(price) },
        memory: { value: '128 ГБ' },
        battery: battery
          ? { value: battery + ' %' }
          : { value: 'Не вказано', status: 'missing', note: LISTINGS.b.fields.battery.note, question: LISTINGS.b.fields.battery.question },
        contact: { value: 'Чат сайту' },
      },
    },
  };
}

export const LETTERS = [...'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЮЯ'];
