import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './tokens.css';
import './styles.css';

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* приватний режим */ } },
};

function Shell() {
  const sys = typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const [mode, setModeState] = useState(() => store.get('sc-mode') || sys);
  const [resetKey, setResetKey] = useState(0);
  const setMode = (m) => { setModeState(m); store.set('sc-mode', m); };

  return (
    <div className="shell">

      <div className="stage">
        <div className="phone" data-mode={mode}>
          <App mode={mode} setMode={setMode} resetKey={resetKey} onReset={() => setResetKey((k) => k + 1)} />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Shell />);
