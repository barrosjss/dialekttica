'use strict';
/* DEV OVERLAY — only active on ?dev param. Never ships to prod. */

export function initDevOverlay({ showScreen, startTest, jumpTestTo, enterApp }) {
  // ── inject styles ──
  const s = document.createElement('style');
  s.textContent = `
#dev-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 10px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace;
}
#dev-toggle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #1a1a2e;
  border: 2px solid rgba(255,255,255,0.15);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: transform 0.2s;
  flex-shrink: 0;
}
#dev-toggle:hover { transform: scale(1.08); }
#dev-toggle.open  { transform: rotate(45deg) scale(1.08); }
#dev-panel {
  background: rgba(20,20,35,0.96);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 12px 10px;
  display: none;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
}
#dev-panel.open { display: flex; }
.dev-label {
  color: rgba(255,255,255,0.35);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 2px 8px;
  margin-top: 4px;
}
.dev-label:first-child { margin-top: 0; }
.dev-btn {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  padding: 7px 12px;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  white-space: nowrap;
}
.dev-btn:hover { background: rgba(113,52,208,0.5); border-color: #7134D0; }
.dev-badge {
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: 9999;
  background: #7134D0;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 3px 7px;
  border-radius: 4px;
  font-family: monospace;
  pointer-events: none;
}`;
  document.head.appendChild(s);

  // ── inject DOM ──
  document.body.insertAdjacentHTML('beforeend', `
<div class="dev-badge">DEV</div>
<div id="dev-fab">
  <button id="dev-toggle" title="Dev menu">＋</button>
  <div id="dev-panel">
    <div class="dev-label">Auth</div>
    <button class="dev-btn" data-action="screen" data-screen="splash">Splash</button>
    <button class="dev-btn" data-action="screen" data-screen="login">Login</button>
    <button class="dev-btn" data-action="screen" data-screen="register">Register</button>
    <div class="dev-label">Profile</div>
    <button class="dev-btn" data-action="screen" data-screen="profile">Editar perfil</button>
    <button class="dev-btn" data-action="screen" data-screen="avatar">Crear personaje</button>
    <div class="dev-label">Test</div>
    <button class="dev-btn" data-action="test" data-q="0">Test — Q1</button>
    <button class="dev-btn" data-action="test" data-q="1">Test — Q2</button>
    <button class="dev-btn" data-action="test" data-q="2">Test — Q3</button>
    <button class="dev-btn" data-action="test" data-q="3">Test — Q4</button>
    <button class="dev-btn" data-action="test" data-q="4">Test — Q5</button>
    <div class="dev-label">App</div>
    <button class="dev-btn" data-action="screen" data-screen="home">Home</button>
    <button class="dev-btn" data-action="screen" data-screen="tareas">Tareas</button>
    <button class="dev-btn" data-action="screen" data-screen="libreta">Libreta</button>
    <button class="dev-btn" data-action="screen" data-screen="foro">Foro</button>
    <button class="dev-btn" data-action="screen" data-screen="articulos">Artículos</button>
    <button class="dev-btn" data-action="screen" data-screen="chats">Chats</button>
    <button class="dev-btn" data-action="screen" data-screen="perfil-dash">Perfil</button>
    <button class="dev-btn" data-action="screen" data-screen="ajustes">Ajustes</button>
    <button class="dev-btn" data-action="screen" data-screen="seguimiento">Seguimiento</button>
    <button class="dev-btn" data-action="screen" data-screen="simulador">Simulador</button>
  </div>
</div>`);

  const toggle = document.getElementById('dev-toggle');
  const panel  = document.getElementById('dev-panel');

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.classList.toggle('open', open);
  });

  document.getElementById('dev-fab').addEventListener('click', (e) => {
    const btn = e.target.closest('.dev-btn');
    if (!btn) return;

    panel.classList.remove('open');
    toggle.classList.remove('open');

    if (btn.dataset.action === 'screen') {
      const id = btn.dataset.screen;
      if (['home','chats','perfil-dash','ajustes'].includes(id) && enterApp) {
        enterApp(id);
      } else {
        showScreen(id, 'right');
      }
    } else if (btn.dataset.action === 'test') {
      startTest();
      jumpTestTo(Number(btn.dataset.q));
      showScreen('test', 'right');
    }
    // 'screen' action handles profile/avatar directly via data-screen
  });
}
