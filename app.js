'use strict';

import { initProfile, initCreator, renderProfileAvatar } from './profile.js';
import { preloadHairSvgs } from './hair-styles.js';
import { buildAvatarThumb } from './avatar.js';
import { initRouter, enterApp, bindHubCards, renderAllLists, renderHome, onScreenChange } from './router.js';
import { SIM_CHARACTER } from './data.js';
import { avatarState } from './profile.js';

const screens = {
  splash:         document.getElementById('screen-splash'),
  login:          document.getElementById('screen-login'),
  register:       document.getElementById('screen-register'),
  profile:        document.getElementById('screen-profile'),
  avatar:         document.getElementById('screen-avatar'),
  test:           document.getElementById('screen-test'),
  home:           document.getElementById('screen-home'),
  tareas:         document.getElementById('screen-tareas'),
  libreta:        document.getElementById('screen-libreta'),
  'libreta-detail': document.getElementById('screen-libreta-detail'),
  foro:           document.getElementById('screen-foro'),
  articulos:      document.getElementById('screen-articulos'),
  articulo:       document.getElementById('screen-articulo'),
  simulador:      document.getElementById('screen-simulador'),
  'chat-sim':     document.getElementById('screen-chat-sim'),
  seguimiento:    document.getElementById('screen-seguimiento'),
  'seg-test':     document.getElementById('screen-seg-test'),
  chats:          document.getElementById('screen-chats'),
  amigos:         document.getElementById('screen-amigos'),
  chat:           document.getElementById('screen-chat'),
  'perfil-dash':  document.getElementById('screen-perfil-dash'),
  ajustes:        document.getElementById('screen-ajustes'),
};

let current = 'splash';

function showScreen(next, direction = 'right') {
  const prev   = screens[current];
  const nextEl = screens[next];

  if (!nextEl || next === current) return;

  const inClass  = direction === 'right' ? 'slide-in-right' : 'slide-in-left';
  const outClass = direction === 'right' ? 'slide-out-left' : 'slide-out-right';

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(guard);
    nextEl.removeEventListener('animationend', onEnd);
    prev.classList.remove('active', 'slide-out-left', 'slide-out-right');
    nextEl.classList.remove('slide-in-right', 'slide-in-left');
    nextEl.classList.add('active');
    current = next;
    onScreenChange(next);
  };

  const onEnd = (e) => { if (e.target === nextEl) finish(); };
  const guard = setTimeout(finish, 420);

  nextEl.addEventListener('animationend', onEnd);
  nextEl.offsetHeight; // force reflow so animation starts from correct state
  nextEl.classList.add(inClass);
  prev.classList.add(outClass);
}

// ── SPLASH ──
function runSplash() {
  screens.splash.classList.add('active', 'animate');
  setTimeout(() => showScreen('login', 'right'), 2000);
}

// ── NAV ──
document.getElementById('go-register').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen('register', 'right');
});

document.getElementById('go-login').addEventListener('click', (e) => {
  e.preventDefault();
  showScreen('login', 'left');
});

document.getElementById('forgot-password').addEventListener('click', (e) => {
  e.preventDefault();
  alert('Funcionalidad de recuperación de contraseña próximamente.');
});

// ── FORMS ──
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const [userField, passField] = e.target.querySelectorAll('.field');
  if (!userField.value.trim() || !passField.value.trim()) {
    shakeForm(e.target);
    return;
  }
  console.log('login', { user: userField.value });
  renderProfileAvatar();
  renderHubAvatars();
  enterApp('home');
});

document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const fields = [...e.target.querySelectorAll('.field')];
  if (fields.some(f => !f.value.trim())) { shakeForm(e.target); return; }

  const [,,,, pass, confirm] = fields;
  if (pass.value !== confirm.value) {
    confirm.style.borderColor = 'rgba(255,80,80,0.8)';
    setTimeout(() => confirm.style.borderColor = '', 1200);
    return;
  }
  console.log('register');
  testOrigin = 'register';
  startTest();
  showScreen('test', 'right');
});

// ── PROFILE / AVATAR INIT ──
initProfile({ showScreen });
initCreator({ showScreen });
initRouter({ showScreen });
bindHubCards();

document.getElementById('go-edit-profile')?.addEventListener('click', () => {
  renderProfileAvatar();
  showScreen('profile', 'right');
});

window.__onProfileComplete = () => {
  renderHubAvatars();
  enterApp('home');
};

document.getElementById('btn-logout')?.addEventListener('click', () => {
  showScreen('login', 'left');
});

function renderHubAvatars() {
  renderAllLists();
  const sim = document.getElementById('sim-pick-avatar');
  if (sim) sim.innerHTML = buildAvatarThumb(SIM_CHARACTER.avatar);
}

window.__refreshHome = renderHome;

// "realizar test" link on profile → go to test, come back with checkmark
document.getElementById('test-toggle-row').addEventListener('click', () => {
  testOrigin = 'profile';
  startTest();
  showScreen('test', 'right');
});

function shakeForm(form) {
  form.style.animation = 'none';
  form.offsetHeight;
  form.style.animation = 'shake 0.35s ease';
  setTimeout(() => form.style.animation = '', 400);
}

// ── TEST ──
const QUESTIONS = [
  {
    q: '¿Qué haces en un grupo grande?',
    opts: ['Hablo con todos.', 'Solo con conocidos.', 'Escucho más que hablo.', 'Prefiero estar solo/a.'],
  },
  {
    q: '¿Te cuesta empezar una conversación?',
    opts: ['No, se me da fácil.', 'A veces sí.', 'Solo con gente nueva.', 'Sí, casi siempre.'],
  },
  {
    q: '¿Qué haces en tu tiempo libre?',
    opts: ['Salgo con amigos.', 'Miro redes o juego.', 'Creo cosas.', 'Descanso solo/a.'],
  },
  {
    q: 'Cuando estás triste, tú...',
    opts: ['Lo digo.', 'Lo escribo o dibujo.', 'Me aíslo.', 'Espero sentirme mejor.'],
  },
  {
    q: 'Si alguien te trata mal...',
    opts: ['Lo enfrento.', 'Me alejo.', 'Me lo guardo.', 'Lo cuento a alguien.'],
  },
];

const testAnswers = new Array(QUESTIONS.length).fill(null);
let testIndex  = 0;
let testOrigin = 'register'; // 'register' | 'profile'

const progressFill = document.getElementById('test-progress-fill');
const questionEl   = document.getElementById('test-question');
const optionsEl    = document.getElementById('test-options');
const btnNext      = document.getElementById('btn-next');
const testBody     = document.querySelector('.test-body');

function startTest() {
  testIndex = 0;
  testAnswers.fill(null);
  renderQuestion(false);
}

function renderQuestion(animate = true) {
  const { q, opts } = QUESTIONS[testIndex];
  const isLast = testIndex === QUESTIONS.length - 1;

  // progress
  progressFill.style.width = `${((testIndex + 1) / QUESTIONS.length) * 100}%`;

  // content
  questionEl.textContent = q;
  optionsEl.innerHTML = opts.map((opt, i) =>
    `<button class="test-option${testAnswers[testIndex] === i ? ' selected' : ''}"
             data-idx="${i}">${opt}</button>`
  ).join('');

  // button
  btnNext.textContent = isLast ? 'FINALIZAR' : 'SIGUIENTE';
  btnNext.disabled = testAnswers[testIndex] === null;

  // option click
  optionsEl.querySelectorAll('.test-option').forEach(btn => {
    btn.addEventListener('click', () => {
      optionsEl.querySelectorAll('.test-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      testAnswers[testIndex] = Number(btn.dataset.idx);
      btnNext.disabled = false;
    });
  });

  // animate in
  if (animate) {
    testBody.classList.remove('animate-in');
    testBody.offsetHeight;
    testBody.classList.add('animate-in');
  }
}

btnNext.addEventListener('click', () => {
  if (btnNext.disabled) return;

  if (testIndex < QUESTIONS.length - 1) {
    testIndex++;
    renderQuestion(true);
  } else {
    console.log('test complete', testAnswers);
    const dot = document.getElementById('test-dot');
    if (dot) dot.classList.add('done');

    if (testOrigin === 'register') {
      renderProfileAvatar();
      renderHubAvatars();
      showScreen('profile', 'right');
    } else {
      // re-doing from profile: go back
      showScreen('profile', 'left');
    }
  }
});

// ── SERVICE WORKER ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// inject shake keyframe
const style = document.createElement('style');
style.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`;
document.head.appendChild(style);

// ── DEV OVERLAY ──
// Activate by visiting index.html?dev
if (new URLSearchParams(location.search).has('dev')) {
  import('./dev.js').then(({ initDevOverlay }) => {
    initDevOverlay({
      showScreen,
      enterApp,
      startTest,
      jumpTestTo(q) {
        testIndex = q;
        renderQuestion(false);
      },
    });
    renderHubAvatars();
  });
}

preloadHairSvgs().catch(() => {});

// ── START ──
runSplash();
