import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SAMPLES, ROWS, MAX_LISTINGS, BASE_MODEL, LETTERS, validate, fetchListing } from './data.js';
import { Icon, Button, Badge, Chip, Toggle, Alert, AppBar, Sheet, Toast, ListingCard, Segmented, Stepper, Accordion, Hint, Metric, DuelCard } from './ui.jsx';

const LOAD_MS = 900;
const statusLabel = { missing: 'Не вказано', mismatch: 'Розбіжність', risk: 'Месенджер' };

export default function App({ mode, setMode, resetKey, onReset }) {
  const [screen, setScreen] = useState('home');
  const [ts, setTsState] = useState(() => { try { return localStorage.getItem('sc-ts') || '1'; } catch { return '1'; } }); // розмір тексту
  const setTs = (v) => { setTsState(v); try { localStorage.setItem('sc-ts', v); } catch { /* приватний режим */ } };
  const [listings, setListings] = useState([]); // {..., letter}
  const [inCmp, setInCmp] = useState(new Set()); // ключі оголошень, позначених «У порівнянні»
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null); // {kind, message}
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [openGroups, setOpenGroups] = useState({ main: true });
  const toggleGroup = (k) => setOpenGroups((g) => ({ ...g, [k]: !g[k] }));
  const [discarded, setDiscarded] = useState([]); // ключі відкинутих у попарному порівнянні
  const [slots, setSlots] = useState([null, null]); // хто зараз у парі (ліва і права колонка)
  const [excluded, setExcluded] = useState(new Set());
  const [sheet, setSheet] = useState(null); // {kind:'issue', ...} | {kind:'choose'} | {kind:'settings'}
  const [chooseIdx, setChooseIdx] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [toast, setToast] = useState(null);
  const [copyFallback, setCopyFallback] = useState(null);
  const [bump, setBump] = useState(0);
  const timer = useRef(null);
  const toastTimer = useRef(null);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);

  // Скидання з бічної панелі
  useEffect(() => {
    if (!resetKey) return;
    clearTimeout(timer.current);
    setScreen('home'); setListings([]); setInCmp(new Set()); setUrl(''); setError(null); setLoadError(null); setLoading(false);
    setOnlyDiff(false); setOpenGroups({ main: true }); setDiscarded([]); setSlots([null, null]); setExcluded(new Set()); setSheet(null); setCandidate(null); setCopyFallback(null);
    showToast(null);
  }, [resetKey]);

  useEffect(() => { bodyRef.current?.scrollTo(0, 0); }, [screen]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(toastTimer.current); }, []);

  function showToast(t) {
    clearTimeout(toastTimer.current);
    if (!t) { setToast(null); return; }
    const id = Date.now();
    setToast({ ...t, id });
    toastTimer.current = setTimeout(() => setToast((cur) => (cur && cur.id === id ? null : cur)), t.ms || 4000);
  }

  function go(next) {
    if (loading) { clearTimeout(timer.current); setLoading(false); } // вихід під час завантаження скасовує запит
    setSheet(null);
    setScreen(next);
  }

  // ---------- Додавання ----------
  const full = listings.length >= MAX_LISTINGS;
  function freeLetter(list) { return LETTERS.find((L) => !list.some((l) => l.letter === L)); }

  function submit(e) {
    e?.preventDefault();
    if (loading || full) return; // повторне натискання під час завантаження ігнорується
    setLoadError(null);
    const v = validate(url, listings);
    if (!v.ok) { setError(v); inputRef.current?.focus(); return; }
    setError(null);
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      const res = fetchListing(v);
      if (!res.ok) { setLoadError(res.message); return; }
      const letter = freeLetter(listings);
      const next = [...listings, { ...res.data, letter }];
      setListings(next);
      // Ту саму модель одразу додаємо до порівняння; іншу модель користувач додає сам (див. попередження)
      if (res.data.model === BASE_MODEL) setInCmp((s) => new Set(s).add(res.data.key));
      setUrl('');
      setScreen('home');
      showToast({ type: 'success', text: `Оголошення ${letter} додано`, action: 'Скасувати', undo: { kind: 'add', key: res.data.key } });
    }, LOAD_MS);
  }

  function removeListing(key) {
    const idx = listings.findIndex((l) => l.key === key);
    const removed = listings[idx];
    setListings(listings.filter((l) => l.key !== key));
    if (candidate === key) setCandidate(null);
    showToast({ type: 'success', text: `Оголошення ${removed.letter} прибрано`, action: 'Скасувати', undo: { kind: 'remove', item: removed, idx } });
  }

  function onToastAction() {
    const t = toast; if (!t) return;
    if (t.undo?.kind === 'add') setListings((ls) => ls.filter((l) => l.key !== t.undo.key));
    if (t.undo?.kind === 'remove') setListings((ls) => { const c = [...ls]; c.splice(t.undo.idx, 0, t.undo.item); return c; });
    if (t.undo?.kind === 'candidate') { setCandidate(t.undo.prev); setScreen('compare'); }
    if (t.undo?.kind === 'discard') { setDiscarded(t.undo.discarded); setSlots(t.undo.slots); setCandidate(t.undo.candidate); setScreen('compare'); }
    if (t.retry) { showToast(null); copyQuestions(); return; }
    showToast(t.undo ? { type: 'success', text: 'Дію скасовано', ms: 2000 } : null);
  }

  // ---------- Порівняння ----------
  const cmp = listings.filter((l) => inCmp.has(l.key));
  function toggleCompare(key) {
    setInCmp((s) => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }
  // Попарне порівняння «переможець лишається»: у таблиці двоє, решта чекає в черзі
  const active = cmp.filter((l) => !discarded.includes(l.key));
  const duelKeys = (() => {
    const keys = active.map((l) => l.key);
    const n = slots.map((k) => (keys.includes(k) ? k : null));
    for (let i = 0; i < 2; i++) if (!n[i]) n[i] = keys.find((k) => !n.includes(k)) || null;
    return n;
  })();
  const visible = duelKeys.map((k) => active.find((l) => l.key === k)).filter(Boolean);
  const queue = active.filter((l) => !duelKeys.includes(l.key));
  const gone = discarded.map((k) => listings.find((l) => l.key === k)).filter(Boolean);
  const otherModel = listings.filter((l) => l.model !== BASE_MODEL);

  function discard(key) {
    const prev = { discarded, slots: duelKeys, candidate };
    const idx = duelKeys.indexOf(key);
    const l = listings.find((x) => x.key === key);
    const nextSlots = [...duelKeys];
    nextSlots[idx] = queue[0]?.key || null;
    setSlots(nextSlots);
    setDiscarded([...discarded, key]);
    if (!queue.length) {
      // Черга порожня: той, хто лишився, і є кандидатом
      const winner = visible.find((x) => x.key !== key);
      if (winner) {
        setCandidate(winner.key);
        setScreen('done');
        showToast({ type: 'success', text: `Лишився ${winner.letter}: це ваш кандидат`, action: 'Скасувати', undo: { kind: 'discard', ...prev }, ms: 6000 });
        return;
      }
    }
    showToast({ type: 'success', text: queue[0] ? `${l.letter} відкинуто, далі ${queue[0].letter}` : `${l.letter} відкинуто`, action: 'Скасувати', undo: { kind: 'discard', ...prev }, ms: 5000 });
  }
  function restore(key) {
    setDiscarded(discarded.filter((k) => k !== key));
    const l = listings.find((x) => x.key === key);
    showToast({ type: 'success', text: `${l.letter} повернуто в чергу`, ms: 2500 });
  }

  const issues = useMemo(() => active.flatMap((l) =>
    ROWS.filter((r) => l.fields[r.key]?.status).map((r) => ({ id: l.key + ':' + r.key, letter: l.letter, row: r.label, ...l.fields[r.key] }))
  ), [listings, inCmp, discarded]);
  const chosenQs = issues.filter((q) => !excluded.has(q.id));

  function toggleQuestion(id) {
    setExcluded((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setBump((b) => b + 1);
  }

  const rows = ROWS.filter((r) => {
    if (!onlyDiff || visible.length < 2) return true;
    return visible[0].fields[r.key]?.value !== visible[1].fields[r.key]?.value;
  });

  // ---------- Питання ----------
  const questionText = () => active.map((l) => {
    const qs = chosenQs.filter((q) => q.letter === l.letter);
    if (!qs.length) return null;
    return `${l.title} (${l.host}):\n` + qs.map((q, i) => `${i + 1}. ${q.question}`).join('\n');
  }).filter(Boolean).join('\n\n');

  async function copyQuestions() {
    const text = questionText();
    try {
      if (!navigator.clipboard) throw new Error('no clipboard');
      await navigator.clipboard.writeText(text);
      setCopyFallback(null);
      showToast({ type: 'success', text: `Скопійовано питань: ${chosenQs.length}` });
    } catch {
      setCopyFallback(text);
      showToast({ type: 'error', text: 'Не вдалося скопіювати', action: 'Повторити', retry: true, ms: 6000 });
    }
  }

  // ---------- Вибір кандидата ----------
  function confirmCandidate() {
    if (chooseIdx == null) return;
    const prev = candidate;
    setCandidate(active[chooseIdx].key);
    setSheet(null);
    setScreen('done');
    showToast({ type: 'success', text: `Кандидата ${active[chooseIdx].letter} обрано`, action: 'Скасувати', undo: { kind: 'candidate', prev } });
  }

  // ---------- Рендер ----------
  const settingsBtn = (
    <button className="icon-btn" onClick={() => setSheet({ kind: 'settings' })} aria-label="Налаштування"><Icon name="settings" size={22} /></button>
  );

  let body, footer, bar;

  if (screen === 'home') {
    bar = <AppBar title="SmartCompare" right={settingsBtn} />;
    if (!listings.length) {
      body = (
        <div className="empty">
          <div className="empty-ic"><Icon name="list" size={28} stroke={1.75} /></div>
          <h2 className="t-h2">Додайте 2–3 оголошення</h2>
          <p className="t-body muted">Вставте посилання на вживаний iPhone з OLX чи Prom. Ми зведемо дані в таблицю і підкажемо, що уточнити в продавця.</p>
          <Button onClick={() => go('add')}><Icon name="plus" size={18} /> Додати оголошення</Button>
        </div>
      );
    } else {
      body = (
        <div className="stack">
          <div className="section-head">
            <h2 className="t-h2">Ваші оголошення</h2>
            <span className="t-caption muted">Додано: {listings.length}</span>
          </div>
          {otherModel.length > 0 && (
            <Alert>У картці {otherModel.map((l) => l.letter).join(', ')} інша модель ({otherModel[0].model}), порівняння з {BASE_MODEL} буде неповним</Alert>
          )}
          {listings.map((l) => (
            <ListingCard key={l.key} l={l} letter={l.letter} hideTag inCompare={inCmp.has(l.key)}
              onToggleCompare={() => toggleCompare(l.key)} onRemove={() => removeListing(l.key)} />
          ))}
          {listings.length < 2 && <p className="t-body-s muted list-hint">Додайте ще одне оголошення, щоб порівняти</p>}
          {listings.length >= 2 && cmp.length < 2 && <p className="t-body-s muted list-hint">Позначте щонайменше два оголошення «Додати до порівняння»</p>}
        </div>
      );
      footer = (
        <>
          <Button type="secondary" onClick={() => go('add')}><Icon name="plus" size={18} /> Додати ще</Button>
          <Button disabled={cmp.length < 2} onClick={() => go('compare')}>Порівняти ({cmp.length})</Button>
        </>
      );
    }
  }

  if (screen === 'add') {
    const state = loading ? 'disabled' : error ? 'error' : focused ? 'focus' : url ? 'filled' : 'default';
    bar = <AppBar title="Нове оголошення" onBack={() => go('home')} />;
    body = (
      <form className="stack" onSubmit={submit} noValidate>
        <div className={`field field-${state}`}>
          <label htmlFor="url" className="t-body-s field-label">Посилання на оголошення</label>
          <input id="url" ref={inputRef} className="t-body field-input" type="url" inputMode="url" autoComplete="off"
            placeholder="Вставте посилання з OLX або Prom" value={url} disabled={loading}
            onChange={(e) => { setUrl(e.target.value); if (error) setError(null); if (loadError) setLoadError(null); }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            aria-invalid={!!error} aria-describedby="url-help" maxLength={2000} />
          {error
            ? <p id="url-help" className="t-caption field-help is-error" role="alert"><Icon name="error" size={12} /> {error.message}</p>
            : <p id="url-help" className="t-caption field-help">Підтримуємо OLX і Prom</p>}
        </div>
        {loadError && (
          <Alert type="error" action={<button type="button" className="link-btn t-body-s" onClick={submit}>Спробувати ще раз</button>}>
            {loadError}.{' '}
          </Alert>
        )}
        {loading && (
          <div className="skeleton" aria-label="Завантажуємо оголошення">
            <span className="sk sk-1" /><span className="sk sk-2" /><span className="sk sk-3" />
          </div>
        )}
        <div className="samples">
          <p className="t-caption muted">Немає посилання під рукою? Вставте приклад</p>
          <div className="chips">
            {[['А: чесне', SAMPLES.a], ['Б: з прогалинами', SAMPLES.b], ['В: інша модель', SAMPLES.c], ['Ще одне з OLX', () => `https://www.olx.ua/d/uk/obyavlenie/iphone-13-128-ID${Math.random().toString(36).slice(2, 7)}.html`], ['Знято з продажу', SAMPLES.removed], ['Інший сайт', SAMPLES.foreign]].map(([t, u]) => (
              <Chip key={t} type="button" disabled={loading} onClick={() => { setUrl(typeof u === 'function' ? u() : u); setError(null); setLoadError(null); }}>{t}</Chip>
            ))}
          </div>
        </div>
        <button type="submit" hidden />
      </form>
    );
    footer = <Button loading={loading} onClick={submit}>Додати до порівняння</Button>;
  }

  if (screen === 'compare') {
    bar = <AppBar title={`Порівняння (${active.length})`} onBack={() => go('home')} />;
    if (active.length < 2) {
      body = (
        <div className="empty">
          <h2 className="t-h2">Замало оголошень</h2>
          <p className="t-body muted">Для порівняння потрібно щонайменше два. Позначте їх у списку.</p>
          <Button onClick={() => go('home')}>До списку оголошень</Button>
        </div>
      );
    } else {
      const [pa, pb] = visible;
      const cheaper = pa.price === pb.price ? null : pa.price < pb.price ? [pa, pb] : [pb, pa];
      const contactText = (l) => l.fields.contact.status === 'risk' ? 'просить перейти в месенджер' : 'листування через чат сайту';
      body = (
        <div className="stack">
          <Stepper current={3} />
          <div className="duels" role="group" aria-label="Пара в таблиці. Свайпніть картку вгору або натисніть «Відкинути»">
            {visible.map((l) => (
              <DuelCard key={l.key} l={l} chosen={candidate === l.key} onDiscard={() => discard(l.key)} />
            ))}
          </div>
          <p className="t-caption muted queue-line" aria-live="polite">
            {queue.length
              ? <>Далі в черзі: <b>{queue.map((l) => l.letter).join(', ')}</b>. Свайпніть слабшу картку вгору, на її місце прийде {queue[0].letter}.</>
              : 'Черга порожня. Відкиньте слабшого, і той, хто лишиться, стане кандидатом.'}
          </p>
          <Segmented value={onlyDiff ? 'diff' : 'all'} onChange={(v) => setOnlyDiff(v === 'diff')} label="Які параметри показати" options={[['all', 'Всі параметри'], ['diff', 'Тільки відмінності']]} />
          {visible.some((l) => l.model !== BASE_MODEL) && (
            <Alert>У картці {visible.filter((l) => l.model !== BASE_MODEL).map((l) => l.letter).join(', ')} інша модель, порівняння неповне</Alert>
          )}
          <div className="metrics">
            <span />
            {visible.map((l) => <Metric key={l.key} value={l.fields.battery.value} label="акумулятор" missing={l.fields.battery.status === 'missing'} />)}
          </div>
          <Accordion title="Основні параметри" open={!!openGroups.main} onToggle={() => toggleGroup('main')}>
          <div className="table" role="table" aria-label="Порівняння оголошень">
            <div className="tr th" role="row">
              <span className="td td-label" role="columnheader" />
              {visible.map((l) => (
                <span key={l.key} className="td th-cell" role="columnheader" aria-label={`Оголошення ${l.letter}, ${l.city}`}>
                  <span className="letter">{l.letter}</span>
                  <span className="t-body-s">{l.city}</span>
                </span>
              ))}
            </div>
            {rows.map((r) => (
              <div className="tr" role="row" key={r.key}>
                <span className="td td-label t-caption" role="rowheader"><span className="label-ic"><Icon name={r.icon} size={12} />{r.label}</span></span>
                {visible.map((l) => {
                  const f = l.fields[r.key];
                  const qid = l.key + ':' + r.key;
                  return (
                    <span key={l.key} role="cell" className={`td t-body-s ${f.status === 'mismatch' ? 'cell-mismatch' : ''} ${f.status === 'missing' ? 'cell-missing' : ''}`}>
                      {f.status === 'risk'
                        ? <Badge type="risk" onClick={() => setSheet({ kind: 'issue', qid, letter: l.letter, row: r.label, ...f })}>{f.value}</Badge>
                        : f.status
                          ? <button className="cell-btn" onClick={() => setSheet({ kind: 'issue', qid, letter: l.letter, row: r.label, ...f })}>
                              <Icon name={f.status} size={12} /> {f.value}</button>
                          : f.value}
                    </span>
                  );
                })}
              </div>
            ))}
            {onlyDiff && rows.length === 0 && <p className="t-body-s muted table-empty">Усі параметри цих оголошень збігаються</p>}
          </div>
          </Accordion>
          <Accordion title="Продавець" open={!!openGroups.seller} onToggle={() => toggleGroup('seller')}>
            <ul className="t-body-s plain-list">
              {visible.map((l) => <li key={l.key}><b>{l.letter}</b>: {contactText(l)}, {l.city}</li>)}
            </ul>
          </Accordion>
          {cheaper && <Hint>Оголошення {cheaper[0].letter} на {(cheaper[1].price - cheaper[0].price).toLocaleString('uk-UA').replace(/\u00a0/g, ' ')} ₴ дешевше за {cheaper[1].letter}. Попросіть у продавця фото IMEI і чек.</Hint>}
          {gone.length > 0 && (
            <Accordion title={`Відкинуті (${gone.length})`} open={!!openGroups.gone} onToggle={() => toggleGroup('gone')}>
              <ul className="gone-list">
                {gone.map((l) => (
                  <li key={l.key} className="gone-item">
                    <span className="letter sm">{l.letter}</span>
                    <span className="t-body-s gone-text">{l.title}, {l.fields.price.value}</span>
                    <button className="link-btn t-body-s" onClick={() => restore(l.key)} aria-label={`Повернути оголошення ${l.letter} в чергу`}>Повернути</button>
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          <Accordion title="Що означають позначки?" open={!!openGroups.faq} onToggle={() => toggleGroup('faq')}>
            <div className="faq">
              <p className="t-body-s"><Badge type="mismatch">Розбіжність</Badge> дані в оголошенні суперечать одне одному.</p>
              <p className="t-body-s"><Badge type="missing">Не вказано</Badge> продавець не написав цей параметр.</p>
              <p className="t-body-s"><Badge type="risk">Месенджер</Badge> продавець кличе поза сайт, де не діє захист покупця.</p>
              <p className="t-caption muted">Натисніть на позначку в таблиці, щоб побачити пояснення й додати питання продавцю.</p>
            </div>
          </Accordion>
        </div>
      );
      footer = (
        <>
          <div className="action-bar">
            <Button type="secondary" onClick={() => go('questions')}>Що уточнити <span key={bump} className="count">{chosenQs.length}</span></Button>
            <Button onClick={() => { const ci = active.findIndex((l) => l.key === candidate); setChooseIdx(ci >= 0 ? ci : null); setSheet({ kind: 'choose' }); }}>Обрати кандидата</Button>
          </div>
        </>
      );
    }
  }

  if (screen === 'questions') {
    bar = <AppBar title="Що уточнити" onBack={() => go('compare')} />;
    if (!issues.length) {
      body = (
        <div className="empty">
          <div className="empty-ic ok"><Icon name="success" size={28} stroke={1.75} /></div>
          <h2 className="t-h2">Зауважень не знайдено</h2>
          <p className="t-body muted">Це не гарантія чесності продавця. Перед оплатою перевірте телефон наживо.</p>
          <Button type="secondary" onClick={() => go('compare')}>Повернутися до порівняння</Button>
        </div>
      );
    } else {
      body = (
        <div className="stack">
          <p className="t-body-s muted">Питання складено з прогалин в оголошеннях. Зніміть позначку з тих, що не потрібні.</p>
          {listings.filter((l) => issues.some((q) => q.letter === l.letter)).map((l) => (
            <section key={l.key} className="q-group">
              <h3 className="t-caption muted q-head">Оголошення {l.letter} · {l.title}</h3>
              {issues.filter((q) => q.letter === l.letter).map((q) => (
                <label key={q.id} className={`q ${excluded.has(q.id) ? 'is-off' : ''}`}>
                  <input type="checkbox" checked={!excluded.has(q.id)} onChange={() => toggleQuestion(q.id)} />
                  <span className="q-box" aria-hidden="true"><Icon name="check" size={14} /></span>
                  <span className="q-text">
                    <Badge type={q.status}>{statusLabel[q.status]} · {q.row}</Badge>
                    <span className="t-body-s">{q.question}</span>
                  </span>
                </label>
              ))}
            </section>
          ))}
          {copyFallback && (
            <div className="fallback">
              <p className="t-caption muted">Браузер не дав доступ до буфера. Виділіть текст і скопіюйте вручну:</p>
              <textarea className="t-body-s" readOnly value={copyFallback} onFocus={(e) => e.target.select()} rows={6} />
            </div>
          )}
        </div>
      );
      footer = (
        <>
          <Button disabled={!chosenQs.length} onClick={copyQuestions}><Icon name="copy" size={18} /> Скопіювати питання ({chosenQs.length})</Button>
          {!chosenQs.length && <p className="t-caption muted center">Позначте хоча б одне питання</p>}
        </>
      );
    }
  }

  if (screen === 'done') {
    const c = listings.find((l) => l.key === candidate);
    bar = <AppBar title="Кандидат" onBack={() => go('compare')} />;
    body = !c ? (
      <div className="empty"><h2 className="t-h2">Кандидата не обрано</h2>
        <Button onClick={() => go('compare')}>До порівняння</Button></div>
    ) : (
      <div className="stack">
        <h2 className="t-h2">Ви обрали оголошення {c.letter}</h2>
        <ListingCard l={c} letter={c.letter} selected />
        {Object.values(c.fields).some((f) => f.status) && (
          <Alert>В оголошенні є невирішені питання. Уточніть їх у продавця до зустрічі</Alert>
        )}
        <section className="checklist">
          <h3 className="t-body-strong">Перед оплатою</h3>
          <ul className="t-body-s">
            <li>Перевірте IMEI в налаштуваннях і на коробці</li>
            <li>Подивіться стан акумулятора в «Параметри → Акумулятор»</li>
            <li>Оплачуйте через безпечну доставку на сайті</li>
          </ul>
        </section>
      </div>
    );
    footer = (
      <>
        {c && Object.values(c.fields).some((f) => f.status) && <Button type="secondary" onClick={() => go('questions')}>Що уточнити</Button>}
        <Button type="secondary" onClick={() => go('compare')}>Повернутися до порівняння</Button>
      </>
    );
  }

  return (
    <div className="app" data-mode={mode} data-ts={ts}>
      {bar}
      <main className="app-body" ref={bodyRef} key={screen}>{body}</main>
      <div className="foot-wrap">
        <Toast toast={toast} onAction={onToastAction} />
        {footer && <footer className="app-foot">{footer}</footer>}
      </div>

      <Sheet open={sheet?.kind === 'issue'} onClose={() => setSheet(null)} title={sheet ? `${sheet.row} · оголошення ${sheet.letter}` : ''}>
        {sheet?.kind === 'issue' && (
          <div className="stack">
            <Badge type={sheet.status}>{statusLabel[sheet.status]}</Badge>
            <p className="t-body">{sheet.note}</p>
            <div className="quote t-body-s"><span className="t-caption muted">Питання продавцю</span>{sheet.question}</div>
            {excluded.has(sheet.qid)
              ? <Button onClick={() => { toggleQuestion(sheet.qid); setSheet(null); showToast({ type: 'success', text: 'Питання додано', ms: 2000 }); }}>Додати в питання</Button>
              : <Button type="secondary" onClick={() => { toggleQuestion(sheet.qid); setSheet(null); showToast({ type: 'success', text: 'Питання прибрано', ms: 2000 }); }}>Прибрати з питань</Button>}
          </div>
        )}
      </Sheet>

      <Sheet open={sheet?.kind === 'choose'} onClose={() => setSheet(null)} title="Обрати кандидата">
        {sheet?.kind === 'choose' && (
          <div className="stack">
            <p className="t-body-s muted">Оберіть оголошення, з яким продовжите. Рішення можна змінити.</p>
            <div className="stack" role="radiogroup" aria-label="Оголошення">
              {active.map((l, i) => (
                <ListingCard key={l.key} l={l} letter={l.letter} selected={chooseIdx === i} hideTag onSelect={() => setChooseIdx(i)} />
              ))}
            </div>
            <Button disabled={chooseIdx == null || !active[chooseIdx]} onClick={confirmCandidate}>{chooseIdx == null || !active[chooseIdx] ? 'Оберіть оголошення' : `Обрати ${active[chooseIdx].letter}`}</Button>
          </div>
        )}
      </Sheet>

      <Sheet open={sheet?.kind === 'settings'} onClose={() => setSheet(null)} title="Налаштування">
        {sheet?.kind === 'settings' && (
          <div className="stack">
            <Toggle label="Темна тема" checked={mode === 'dark'} onChange={(on) => setMode(on ? 'dark' : 'light')} />
            <div className="ts-label">
              <span className="t-body-s" id="ts-title">Розмір тексту</span>
              <Segmented label="Розмір тексту" value={ts} onChange={setTs} options={[['1', '100 %'], ['1.15', '115 %'], ['1.3', '130 %']]} />
              <p className="t-caption ts-preview">Так виглядатиме текст у таблиці й підказках.</p>
            </div>
            <Button type="secondary" onClick={() => { setSheet(null); onReset(); }}>Почати спочатку</Button>
          </div>
        )}
      </Sheet>
    </div>
  );
}
