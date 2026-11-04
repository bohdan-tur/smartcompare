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
  error: <><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>,
  check: <path d="M20 6 9 17l-5-5" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  plus: <path d="M5 12h14M12 5v14" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m18 15-6-6-6 6" />,
  smartphone: <><rect width="14" height="20" x="5" y="2" rx="2" /><path d="M12 18h.01" /></>,
  battery: <><rect width="16" height="10" x="2" y="7" rx="2" /><path d="M22 11v2" /></>,
  tag: <><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>,
  hardDrive: <><path d="M22 12H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11zM6 16h.01M10 16h.01" /></>,
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  lightbulb: <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
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

export function ListingCard({ l, letter, selected, onRemove, onSelect, hideTag, inCompare, onToggleCompare, children }) {
  const issues = [...new Map(Object.values(l.fields).filter((f) => f.status).map((f) => [f.status, f])).values()];
  const modelOff = l.model !== 'iPhone 13';
  const cta = typeof onToggleCompare === 'function';
  return (
    <article className={`card ${selected || inCompare ? 'is-selected' : ''} ${onSelect ? 'is-clickable' : ''} ${cta ? 'has-cta' : ''}`}
      {...(onSelect ? { role: 'radio', 'aria-checked': !!selected, tabIndex: 0, onClick: onSelect,
        onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } } } : {})}>
      <div className="card-row">
        <span className="letter" aria-label={`Оголошення ${letter}`}>{letter}</span>
        <h3 className="t-body-strong card-title">{l.title}</h3>
        <span className="t-numeric">{l.fields.price.value}</span>
      </div>
      <p className="t-body-s muted">{l.city} · {l.condition}</p>
      {(issues.length > 0 || modelOff) && (
        <div className="badges">
          {modelOff && <Badge type="mismatch">Інша модель</Badge>}
          {issues.slice(0, 3).map((f, i) => (
            <Badge key={i} type={f.status}>{f.status === 'missing' ? 'Не вказано' : f.status === 'risk' ? 'Пропонує месенджер' : 'Розбіжність'}</Badge>
          ))}
        </div>
      )}
      {selected && !hideTag && <div className="selected-tag"><Badge type="success">Обраний кандидат</Badge></div>}
      {cta && (
        <Button type={inCompare ? 'primary' : 'secondary'} className="card-cta" aria-pressed={!!inCompare} onClick={onToggleCompare}
          aria-label={inCompare ? `Оголошення ${letter} у порівнянні. Натисніть, щоб прибрати з порівняння` : `Додати оголошення ${letter} до порівняння`}>
          {inCompare ? <><Icon name="check" size={18} /> У порівнянні</> : 'Додати до порівняння'}
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

export function Stepper({ current }) {
  const steps = ['Ваші дані', 'Список', 'Порівняння', 'Рішення'];
  return (
    <ol className="stepper" aria-label="Кроки">
      {steps.map((s, i) => (
        <li key={s} className={i + 1 < current ? 'done' : i + 1 === current ? 'cur' : 'next'} aria-current={i + 1 === current ? 'step' : undefined}>
          {i + 1} {s}
        </li>
      ))}
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

export function Metric({ value, label, missing }) {
  return (
    <div className={`metric ${missing ? 'is-missing' : ''}`}>
      <Icon name={missing ? 'missing' : 'battery'} size={16} />
      <span className="t-numeric-l metric-v">{missing ? '?' : value}</span>
      <span className="t-caption muted">{missing ? 'не вказано' : label}</span>
    </div>
  );
}

export function CandidateCard({ l, inPair, chosen, onClick }) {
  const issues = Object.values(l.fields).filter((f) => f.status).length;
  const other = l.model !== 'iPhone 13';
  const badge = chosen ? ['success', 'Обрано'] : other ? ['mismatch', '13 mini'] : issues ? ['mismatch', `${issues} питання`] : ['success', 'Без питань'];
  return (
    <button className={`cand ${inPair ? 'in-pair' : ''} ${chosen ? 'is-chosen' : ''}`} onClick={onClick} aria-pressed={inPair}
      aria-label={`Оголошення ${l.letter}, ${l.city}, ${l.fields.price.value}${inPair ? ', у таблиці' : ''}`}>
      <span className="cand-photo"><Icon name="smartphone" size={24} /></span>
      <span className="cand-dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="cand-row"><span className="letter sm">{l.letter}</span><span className="t-caption muted">{l.city}</span></span>
      <span className="t-numeric">{l.fields.price.value}</span>
      <Badge type={badge[0] === 'success' && chosen ? 'success' : badge[0]}>{badge[1]}</Badge>
    </button>
  );
}

// Картка учасника пари: свайп угору або кнопка «Відкинути» прибирає її, на місце приходить наступний з черги
export function DuelCard({ l, chosen, onDiscard, discardLabel = 'Відкинути' }) {
  const [dy, setDy] = useState(0);
  const start = useRef(null);
  const issues = Object.values(l.fields).filter((f) => f.status).length;
  const other = l.model !== 'iPhone 13';
  const badge = other ? ['mismatch', '13 mini'] : issues ? ['mismatch', `${issues} питання`] : ['success', 'Без питань'];
  const TH = 70;
  const down = (e) => { if (e.target.closest('button')) return; start.current = e.clientY; e.currentTarget.setPointerCapture?.(e.pointerId); };
  const move = (e) => { if (start.current == null) return; setDy(Math.min(0, e.clientY - start.current)); };
  const up = () => { if (start.current == null) return; const d = dy; start.current = null; if (d < -TH) { setDy(-400); setTimeout(() => { setDy(0); onDiscard(); }, 160); } else setDy(0); };
  return (
    <article className={`duel ${chosen ? 'is-chosen' : ''} ${dy ? 'is-dragging' : ''}`}
      style={dy ? { transform: `translateY(${dy}px)`, opacity: Math.max(0.2, 1 + dy / 200) } : undefined}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { start.current = null; setDy(0); }}
      aria-label={`Оголошення ${l.letter}, ${l.city}, ${l.fields.price.value}`}>
      <span className="duel-grip" aria-hidden="true" />
      <span className="cand-photo"><Icon name="smartphone" size={24} /></span>
      <span className="cand-row"><span className="letter sm">{l.letter}</span><span className="t-caption muted">{l.city}</span></span>
      <span className="t-numeric">{l.fields.price.value}</span>
      <Badge type={badge[0]}>{badge[1]}</Badge>
      <Button type="secondary" size="m" className="duel-btn" onClick={onDiscard} aria-label={`Відкинути оголошення ${l.letter}`}>
        <Icon name="x" size={16} /> {discardLabel}
      </Button>
    </article>
  );
}
