import React, { useEffect, useRef, useState } from 'react';

// Іконки Lucide (ISC): ті самі, що в бібліотеці Figma
const P = {
  back: <path d="m12 19-7-7 7-7M19 12H5" />,
  more: <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
  missing: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></>,
  mismatch: <><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4M12 17h.01" /></>,
  risk: <><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M12 8v4M12 16h.01" /></>,
  success: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  selected: <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>,
  error: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M5 12h14M12 5v14" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  external: <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  refresh: <><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></>,
  star: <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />,
  smartphone: <><rect width="14" height="20" x="5" y="2" rx="2" /><path d="M12 18h.01" /></>,
  battery: <><rect width="16" height="10" x="2" y="7" rx="2" /><path d="M22 11v2" /></>,
  tag: <><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>,
  hardDrive: <><path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01" /></>,
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  lightbulb: <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  squareCheck: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m9 12 2 2 4-4" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  copy: <><rect width="14" height="14" x="8" y="8" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></>,
  trash: <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />,
};
export function Icon({ name, size = 16, stroke = 2, className = '' }) {
  return (
    <svg className={'ic ' + className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[name]}</svg>
  );
}

export function Button({ type = 'primary', size = 'l', loading, disabled, children, className = '', ...rest }) {
  return (
    <button className={`btn btn-${type} btn-${size} ${loading ? 'is-loading' : ''} ${className}`}
      disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      <span>{loading ? 'Завантаження…' : children}</span>
    </button>
  );
}

export function Badge({ type, children, onClick, active }) {
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag className={`badge badge-${type} ${active ? 'is-active' : ''}`} onClick={onClick}
      aria-label={onClick ? `${children}: пояснення` : undefined}>
      <Icon name={type} size={12} /> <span>{children}</span>
    </Tag>
  );
}

export function Chip({ selected, disabled, children, ...rest }) {
  return (
    <button className={`chip ${selected ? 'is-selected' : ''}`} aria-pressed={!!selected} disabled={disabled} {...rest}>
      {selected && <Icon name="check" size={14} />}<span>{children}</span>
    </button>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className={`toggle ${disabled ? 'is-disabled' : ''}`}>
      <span className="t-body-s">{label}</span>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" aria-hidden="true"><span className="knob" /></span>
    </label>
  );
}

export function Alert({ type = 'warning', children, action }) {
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="alert-ic"><Icon name={type === 'error' ? 'error' : 'mismatch'} size={16} /></span>
      <div className="alert-body t-body-s">{children}{action}</div>
    </div>
  );
}

export function AppBar({ title, onBack, right }) {
  return (
    <header className="appbar">
      {onBack ? <button className="icon-btn" onClick={onBack} aria-label="Назад"><Icon name="back" size={24} /></button> : <span className="appbar-pad" />}
      <h1 className="t-h3 appbar-title">{title}</h1>
      {right || <span className="icon-btn-pad" />}
    </header>
  );
}

export function Sheet({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const t = setTimeout(() => ref.current?.querySelector('button, [tabindex], input')?.focus(), 30);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open]);
  return (
    <div className={`sheet-wrap ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="sheet-grip" aria-hidden="true" />
        <div className="sheet-head"><h2 className="t-h3">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Закрити"><Icon name="x" size={20} /></button></div>
        {open && children}
      </section>
    </div>
  );
}

export function Toast({ toast, onAction }) {
  if (!toast) return <div className="toast-slot" />;
  return (
    <div className="toast-slot">
      <div key={toast.id} className={`toast toast-${toast.type}`} role="status" aria-live="polite">
        <Icon name={toast.type === 'error' ? 'error' : 'success'} size={16} />
        <span className="t-body-s toast-text">{toast.text}</span>
        {toast.action && <button className="toast-action t-body-s" onClick={onAction}>{toast.action}</button>}
      </div>
    </div>
  );
}

export function ListingCard({ l, letter, selected, onRemove, onSelect, hideTag, inCompare, onToggleCompare, isDiscarded, children }) {
  const issues = [...new Map(Object.values(l.fields).filter((f) => f.status).map((f) => [f.status, f])).values()];
  const modelOff = l.model !== 'iPhone 13';
  const cta = typeof onToggleCompare === 'function';
  return (
    <article className={`card ${selected || inCompare ? 'is-selected' : ''} ${onSelect ? 'is-clickable' : ''} ${cta ? 'has-cta' : ''} ${isDiscarded ? 'is-discarded' : ''}`}
      {...(onSelect ? { role: 'radio', 'aria-checked': !!selected, tabIndex: 0, onClick: onSelect,
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } } } : {})}>
      <div className="card-main">
        <span className="card-photo">{(() => { const src = l.photos?.find((p) => typeof p === 'string'); return src ? <img src={src} alt={`Фото: ${l.title}`} draggable="false" /> : <PhoneImg color={l.color} size={64} angle={-4} />; })()}</span>
        <div className="card-info">
          <div className="card-row">
            <span className="letter" aria-label={`Оголошення ${letter}`}>{String(letter).replace("№", "")}</span>
            <h3 className="t-body-strong card-title">{l.title}</h3>
          </div>
          <span className="t-numeric card-price">{l.fields.price.value}</span>
          <p className="t-body-s muted">{l.city} · {l.condition}</p>
          {l.seller && (
            <div className="card-seller">
              <span className="avatar avatar-s" aria-hidden="true">{l.seller.initials}</span>
              <span className="t-caption card-seller-name">{l.seller.name}</span>
              <Icon name="star" size={12} /><span className="t-caption">{(l.seller.rating ?? 0).toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
      {(issues.length > 0 || modelOff) && (
        <div className="badges">
          {modelOff && <Badge type="mismatch">Інша модель</Badge>}
          {issues.slice(0, 3).map((f, i) => (
            <Badge key={i} type={f.status}>{f.status === 'missing' ? 'Не вказано' : f.status === 'risk' ? 'Пропонує месенджер' : 'Розбіжність'}</Badge>
          ))}
        </div>
      )}
      {selected && !hideTag && <div className="selected-tag"><Badge type="selected">Обраний кандидат</Badge></div>}
      {cta && (
        isDiscarded
          ? <Button type="secondary" size="s" className="card-cta" onClick={onToggleCompare} aria-label={`Оголошення ${letter} відкинуто. Повернути в чергу`}>
              Відкинуто · Повернути
            </Button>
          : <Button type={inCompare ? 'primary' : 'secondary'} size="s" className="card-cta" aria-pressed={!!inCompare} onClick={onToggleCompare}
              aria-label={inCompare ? `Оголошення ${letter} у порівнянні. Натисніть, щоб прибрати з порівняння` : `Додати оголошення ${letter} до порівняння`}>
              {inCompare ? <><Icon name="check" size={16} /> У порівнянні</> : <><Icon name="plus" size={16} /> До порівняння</>}
            </Button>
      )}
      {children}
      {onRemove && (
        <button className="icon-btn card-remove" onClick={onRemove} aria-label={`Прибрати оголошення ${letter}`}><Icon name="x" size={18} /></button>
      )}
    </article>
  );
}

export function Segmented({ value, onChange, options, label }) {
  return (
    <div className="seg-ctl" role="radiogroup" aria-label={label}>
      {options.map(([v, label]) => (
        <button key={v} role="radio" aria-checked={value === v} className={`seg-item ${value === v ? 'is-on' : ''}`} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  );
}

export function Stepper({ current, onStep, enabled }) {
  const steps = ['Ваші дані', 'Список', 'Порівняння', 'Рішення'];
  return (
    <ol className="stepper" aria-label="Кроки">
      {steps.map((s, i) => {
        const n = i + 1, cls = n < current ? 'done' : n === current ? 'cur' : 'next';
        const click = onStep && n !== current && (!enabled || enabled(n)) ? () => onStep(n) : null;
        return (
          <li key={s} className={cls} aria-current={n === current ? 'step' : undefined}>
            {click ? <button type="button" className="stepper-btn" onClick={click}>{n} {s}</button> : <>{n} {s}</>}
          </li>
        );
      })}
    </ol>
  );
}

export function Accordion({ title, open, onToggle, children }) {
  return (
    <section className={`acc ${open ? 'is-open' : ''}`}>
      <button className="acc-head" aria-expanded={open} onClick={onToggle}>
        <span className="t-body-strong">{title}</span>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={20} />
      </button>
      {open && <div className="acc-body">{children}</div>}
    </section>
  );
}

export function Hint({ children }) {
  return (
    <div className="hint" role="note">
      <span className="hint-ic"><Icon name="lightbulb" size={16} /></span>
      <p className="t-body-s">{children}</p>
    </div>
  );
}

// «Фото» з оголошення: намальовані ілюстрації iPhone 13 (задня панель, екран, бік), якщо реальних фото немає
const BODY = { midnight: ['#2B323C', '#1A1F26'], starlight: ['#F4EFE6', '#DCD4C6'], blue: ['#3E6E95', '#24496A'], pink: ['#F7DAD6', '#E6B9B3'], red: ['#C42B33', '#8E1820'], green: ['#4D6B57', '#304538'] };
export function PhoneImg({ color = 'midnight', size = 64, angle = 0, view = 'back' }) {
  const [c1, c2] = BODY[color] || BODY.midnight;
  const id = 'g' + color + view;
  const lens = color === 'starlight' || color === 'pink' ? '#C9C2B6' : '#0E1116';
  const st = { transform: `rotate(${angle}deg)` };
  if (view === 'front') return (
    <svg width={size * 0.62} height={size} viewBox="0 0 62 100" aria-hidden="true" style={st}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3E6E95" /><stop offset=".55" stopColor="#8E6FB0" /><stop offset="1" stopColor="#E6A0A8" /></linearGradient></defs>
      <rect x="2" y="2" width="58" height="96" rx="11" fill="#111418" />
      <rect x="5" y="5" width="52" height="90" rx="8.5" fill={`url(#${id})`} />
      <rect x="22" y="5" width="18" height="5" rx="2.5" fill="#111418" />
      <text x="31" y="30" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff" fontFamily="system-ui">9:41</text>
    </svg>
  );
  if (view === 'side') return (
    <svg width={size * 0.62} height={size} viewBox="0 0 62 100" aria-hidden="true" style={{ transform: `rotate(${angle + 14}deg)` }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={c2} /><stop offset=".5" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect x="25" y="2" width="12" height="96" rx="6" fill={`url(#${id})`} stroke="rgba(0,0,0,.2)" />
      <rect x="23.5" y="22" width="2" height="8" rx="1" fill={c2} /><rect x="23.5" y="33" width="2" height="12" rx="1" fill={c2} /><rect x="23.5" y="48" width="2" height="12" rx="1" fill={c2} />
    </svg>
  );
  return (
    <svg width={size * 0.62} height={size} viewBox="0 0 62 100" aria-hidden="true" style={st}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></linearGradient></defs>
      <rect x="2" y="2" width="58" height="96" rx="11" fill={`url(#${id})`} stroke="rgba(0,0,0,.18)" strokeWidth="1" />
      <rect x="7" y="7" width="24" height="24" rx="7" fill="rgba(255,255,255,.14)" stroke="rgba(0,0,0,.12)" />
      <circle cx="14" cy="14" r="5.2" fill={lens} stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="5.2" fill={lens} stroke="rgba(255,255,255,.35)" strokeWidth="1.2" />
      <circle cx="24.5" cy="12.5" r="1.6" fill="rgba(255,255,255,.55)" />
    </svg>
  );
}

// Список фото оголошення: реальні (src) або 3 ілюстрації
export const photosOf = (l) => (l.photos && l.photos.length
  ? l.photos.map((p) => (typeof p === 'string' ? { src: p } : { ...p, color: l.color }))
  : ['back', 'front', 'side'].map((view) => ({ view, color: l.color })));
function Photo({ p, size, alt }) {
  return p.src ? <img src={p.src} alt={alt} draggable="false" /> : <PhoneImg color={p.color} view={p.view} size={size} angle={p.view === 'back' ? -4 : 0} />;
}

// Галерея в картці: гортається пальцем (scroll-snap), крапки показують номер фото, тап відкриває фото на весь екран
export function Gallery({ l, onOpen, height = 180 }) {
  const ref = useRef(null);
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState(false); // після першого гортання підказку «гортайте» замінює лічильник
  const photos = photosOf(l);
  const go = (n) => { const el = ref.current; if (!el) return; const k = Math.max(0, Math.min(photos.length - 1, n)); el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' }); };
  return (
    <div className="gal-wrap">
      <div className="gal" style={{ height }}>
        <div className="gal-track" ref={ref} onScroll={(e) => { const n = Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)); setI(n); if (n > 0) setSeen(true); }}>
          {photos.map((p, k) => (
            <button key={k} type="button" className="gal-slide" onClick={() => onOpen?.(k)} aria-label={`Фото ${k + 1} з ${photos.length}, ${l.title}. Відкрити на весь екран`}>
              <Photo p={p} size={height - 8} alt="" />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <span className={`gal-pill ${seen ? 'is-seen' : ''}`}>
            <button type="button" className="gal-arrow" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Попереднє фото"><Icon name="chevronLeft" size={14} /></button>
            <span className="gal-pill-text" aria-hidden="true">{seen ? `${i + 1}/${photos.length}` : 'гортайте'}</span>
            <button type="button" className="gal-arrow" onClick={() => go(i + 1)} disabled={i === photos.length - 1} aria-label="Наступне фото"><Icon name="chevronRight" size={14} /></button>
          </span>
        )}
      </div>
      {photos.length > 1 && <span className="gal-dots below" aria-label={`Фото ${i + 1} з ${photos.length}`}>{photos.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</span>}
    </div>
  );
}

// Перегляд фото на весь екран
export function Lightbox({ l, index, onClose }) {
  const ref = useRef(null);
  const photos = l ? photosOf(l) : [];
  const [i, setI] = useState(index || 0);
  useEffect(() => { if (!l) return; setI(index || 0); const el = ref.current; if (el) el.scrollLeft = (index || 0) * el.clientWidth; ref.current?.closest('.lb')?.querySelector('.lb-close')?.focus(); }, [l, index]);
  useEffect(() => {
    if (!l) return;
    const k = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(i + 1); if (e.key === 'ArrowLeft') go(i - 1); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  });
  if (!l) return null;
  const go = (n) => { const el = ref.current; if (!el) return; const k = Math.max(0, Math.min(photos.length - 1, n)); el.scrollTo({ left: k * el.clientWidth, behavior: 'smooth' }); };
  return (
    <div className="lb" role="dialog" aria-modal="true" aria-label={`Фото оголошення ${l.letter}`}>
      <div className="lb-top">
        <span className="t-body-s">{l.letter} · {l.title} · {i + 1} / {photos.length}</span>
        <button className="icon-btn lb-close" onClick={onClose} aria-label="Закрити фото"><Icon name="x" size={22} /></button>
      </div>
      <div className="lb-track" ref={ref} onScroll={(e) => { const n = Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)); setI(n); if (n > 0) setSeen(true); }}>
        {photos.map((p, k) => <div key={k} className="lb-slide"><Photo p={p} size={300} alt={`Фото ${k + 1} з ${photos.length}`} /></div>)}
      </div>
      {photos.length > 1 && (
        <div className="lb-nav">
          <button className="icon-btn" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Попереднє фото"><Icon name="chevronLeft" size={22} /></button>
          <span className="gal-dots static">{photos.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</span>
          <button className="icon-btn" onClick={() => go(i + 1)} disabled={i === photos.length - 1} aria-label="Наступне фото"><Icon name="chevronRight" size={22} /></button>
        </div>
      )}
    </div>
  );
}

// Картка учасника пари. Замінити можна кнопкою ↻ або змахнувши картку вгору.
// Напрям визначаємо з перших 3 px руху: вгору = змах (сторінка не прокручується), вбік = гортання фото, вниз = звичайна прокрутка.
export function DuelCard({ l, chosen, onReplace, onOpenPhoto, nextLetter }) {
  const ref = useRef(null);
  const cb = useRef({}); cb.current = { onReplace };
  const issues = Object.values(l.fields).filter((f) => f.status).length;
  const other = l.model !== 'iPhone 13';
  const badge = other ? ['mismatch', 'Інша модель'] : issues ? ['mismatch', `${issues} питання`] : ['success', 'Без питань'];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const TH = 70; // скільки пікселів треба змахнути
    let x0 = 0, y0 = 0, t0 = 0, mode = null, dy = 0, active = false;
    const set = (y, anim) => {
      el.style.transition = anim ? 'transform .2s ease, opacity .2s ease' : 'none';
      el.style.transform = y ? `translateY(${y}px) rotate(${y / 60}deg)` : '';
      el.style.opacity = y ? String(Math.max(0.35, 1 + y / 260)) : '';
      el.classList.toggle('is-swiping', y < 0);
      el.classList.toggle('is-armed', y <= -TH);
    };
    const start = (x, y, target) => {
      if (target.closest('.gal-arrow, .gal-pill, .duel-replace')) return;
      x0 = x; y0 = y; t0 = performance.now(); mode = null; dy = 0; active = true;
    };
    const move = (x, y, e) => {
      if (!active) return;
      const mx = x - x0, my = y - y0;
      if (!mode && Math.hypot(mx, my) > 3) mode = my < 0 && Math.abs(my) > Math.abs(mx) ? 'swipe' : 'other';
      if (mode !== 'swipe') return;
      if (e.cancelable) e.preventDefault();
      dy = Math.min(0, my);
      set(dy, false);
    };
    const end = () => {
      if (!active) return; active = false;
      if (mode !== 'swipe') return;
      const fast = dy < -30 && dy / (performance.now() - t0) < -0.5;
      el.dataset.justSwiped = '1'; setTimeout(() => { delete el.dataset.justSwiped; }, 60);
      if (dy <= -TH || fast) {
        navigator.vibrate?.(15);
        set(-el.offsetHeight, true);
        setTimeout(() => { set(0, false); cb.current.onReplace?.(); }, 200);
      } else set(0, true);
    };
    let lx = 0, ly = 0;
    const ts = (e) => { const p = e.touches[0]; start(p.clientX, p.clientY, e.target); };
    const tm = (e) => { const p = e.touches[0]; lx = p.clientX; ly = p.clientY; move(lx, ly, e); };
    const te = () => end();
    const tc = () => { active = false; set(0, true); };
    const md = (e) => { if (e.button !== 0) return; start(e.clientX, e.clientY, e.target); window.addEventListener('mousemove', mm); window.addEventListener('mouseup', mu, { once: true }); };
    const mm = (e) => move(e.clientX, e.clientY, e);
    const mu = () => { window.removeEventListener('mousemove', mm); end(); };
    const clickCap = (e) => { if (el.dataset.justSwiped) { e.stopPropagation(); e.preventDefault(); } };
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te); el.addEventListener('touchcancel', tc);
    el.addEventListener('mousedown', md);
    el.addEventListener('click', clickCap, true);
    return () => { el.removeEventListener('touchstart', ts); el.removeEventListener('touchmove', tm); el.removeEventListener('touchend', te); el.removeEventListener('touchcancel', tc); el.removeEventListener('mousedown', md); el.removeEventListener('click', clickCap, true); window.removeEventListener('mousemove', mm); };
  }, []);
  return (
    <article ref={ref} className={`duel ${chosen ? 'is-chosen' : ''}`} aria-label={`Оголошення ${l.letter}, ${l.title}, ${l.city}, ${l.fields.price.value}`}>
      <DuelBody l={l} badge={badge} onOpenPhoto={onOpenPhoto} />
      <button type="button" className="duel-replace" onClick={onReplace} aria-label={`Замінити оголошення ${l.letter} наступним із черги`}><Icon name="refresh" size={16} /></button>
      <span className="swipe-label" aria-hidden="true"><Icon name="refresh" size={16} /> {nextLetter ? `Замінити на ${nextLetter}` : 'Прибрати'}</span>
    </article>
  );
}
export function DuelBody({ l, badge, onOpenPhoto }) {
  if (!badge) { const issues = Object.values(l.fields).filter((f) => f.status).length; badge = l.model !== 'iPhone 13' ? ['mismatch', 'Інша модель'] : issues ? ['mismatch', `${issues} питання`] : ['success', 'Без питань']; }
  return (
    <>
      <Gallery l={l} onOpen={onOpenPhoto} />
      <span className="cand-row"><span className="letter sm">{String(l.letter).replace("№", "")}</span><span className="t-caption muted">{l.city}</span></span>
      <span className="t-body-s-strong duel-title">{l.title}</span>
      <span className="t-numeric">{l.fields.price.value}</span>
      <Badge type={badge[0]}>{badge[1]}</Badge>
    </>
  );
}

const plural = (n, [one, few, many]) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many; };
// Картка продавця
export function SellerCard({ l }) {
  const s = l.seller || {};
  return (
    <div className={`seller ${s.verified ? 'is-verified' : ''}`}>
      <div className="seller-head">
        <span className="avatar" aria-hidden="true">{s.initials}</span>
        <span className="seller-name"><span className="t-body-s-strong">{s.name}</span><span className="t-caption muted">продавець {l.letter}</span></span>
      </div>
      <div className="seller-rate"><Icon name="star" size={14} /><span className="t-numeric">{(s.rating ?? 0).toFixed(1)}</span><span className="t-caption muted">{s.reviews} {plural(s.reviews, ['відгук', 'відгуки', 'відгуків'])}</span></div>
      <Badge type={s.verified ? 'success' : 'missing'}>{s.verified ? 'Перевірений' : 'Новий'}</Badge>
    </div>
  );
}
