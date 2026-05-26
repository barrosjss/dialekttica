'use strict';

import { buildAvatarThumb, buildAvatarSVG } from './avatar.js';
import { buildAvatarPortrait } from './creator-preview.js';
import { preloadHairSvgs } from './hair-styles.js';
import {
  MOCK_USER, FRIENDS, CHATS, ARTICLES,
  FORUM_POSTS, TASK_ROWS, SEG_QUESTIONS, SIM_CHARACTER,
} from './data.js';
import { initNotebook, renderNotebookList } from './notebook.js';
import { avatarState } from './profile.js';
import { isTaskCompleted, toggleTaskCompleted } from './tasks.js';

const TAB_SCREENS = ['ajustes', 'chats', 'home', 'perfil-dash'];

const TAB_ROOT = {
  ajustes: 'ajustes',
  chats: 'chats',
  home: 'home',
  'perfil-dash': 'perfil-dash',
};

/** Pantalla actual → pestaña de la barra inferior */
const SCREEN_TAB = {
  home: 'home',
  tareas: 'home',
  articulos: 'home',
  foro: 'home',
  libreta: 'home',
  articulo: 'home',
  'libreta-detail': 'home',
  simulador: 'home',
  'chat-sim': 'home',
  seguimiento: 'home',
  'seg-test': 'home',
  chats: 'chats',
  chat: 'chats',
  amigos: 'chats',
  ajustes: 'ajustes',
  'perfil-dash': 'perfil-dash',
};

const NAV_SCREENS = [
  ...TAB_SCREENS,
  'tareas', 'articulos', 'libreta', 'foro',
  'articulo', 'libreta-detail', 'chat', 'amigos',
];

let showScreenFn = null;
let activeTab = 'home';
let currentScreen = 'splash';
let currentChatId = null;
let segIndex = 0;
const segAnswers = [];

export function initRouter({ showScreen }) {
  showScreenFn = showScreen;
  renderBottomNav();
  bindNav();
  bindBackButtons();
  renderAllLists();
  initSegTest();
  initChatSim();
  initNotebook({ showScreen: showScreenFn });
}

export function enterApp(tab = 'home') {
  activeTab = tab;
  syncBottomNav();
  showScreenFn(tab, 'right');
}

function screenTab(screenId) {
  return SCREEN_TAB[screenId] ?? null;
}

function bindNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      const root = tab ? TAB_ROOT[tab] : null;
      if (!tab || !root) return;

      if (currentScreen === root && activeTab === tab) return;

      const sameBranch = screenTab(currentScreen) === tab;
      activeTab = tab;
      syncBottomNav();
      showScreenFn(root, sameBranch && currentScreen !== root ? 'left' : 'right');
    });
  });
}

function bindBackButtons() {
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.back;
      showScreenFn(target, 'left');
      if (TAB_SCREENS.includes(target)) activeTab = target;
      syncBottomNav();
    });
  });
}

function syncBottomNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });
}

export function onScreenChange(screenId) {
  currentScreen = screenId;
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  nav.classList.toggle('hidden', !NAV_SCREENS.includes(screenId));
  const tab = screenTab(screenId);
  if (tab) {
    activeTab = tab;
    syncBottomNav();
  }
}

function renderBottomNav() {
  /* nav is static in HTML */
}

// ── RENDER LISTS ─────────────────────────────────────────────────────────────

export function renderAllLists() {
  renderHome();
  renderFriends();
  renderChats();
  renderArticles();
  renderNotebookList();
  renderForum();
  renderTasks();
  renderPerfilDash();
}

export function renderHome() {
  preloadHairSvgs().catch(() => {});
  const streak = document.getElementById('home-streak');
  const posts = document.getElementById('home-posts');
  if (streak) streak.textContent = String(MOCK_USER.streak);
  if (posts) posts.textContent = String(MOCK_USER.posts);
  const avatar = document.getElementById('hub-avatar');
  if (!avatar) return;
  if (avatarState.customized) {
    avatar.innerHTML = buildAvatarPortrait(avatarState, 128);
    return;
  }
  avatar.innerHTML = buildAvatarSVG({
    skin: '#F3AC79',
    hairStyle: 'style-1',
    hairColor: '#1A1A1A',
    face: 'happy',
    bgColor: '#1B2A4A',
    bodyColor: '#E8821E',
  }, 128);
}

function renderFriends() {
  const el = document.getElementById('friends-list');
  if (!el) return;
  el.innerHTML = FRIENDS.map(f => listRow(f.id, f.username, f.avatar, 'chat', '💬')).join('');
  bindListClicks(el, openChatFromFriend);
}

function renderChats() {
  const el = document.getElementById('chats-list');
  if (!el) return;
  el.innerHTML = CHATS.map(c => listRow(c.id, c.username, c.avatar, 'chat', '💬')).join('');
  bindListClicks(el, openChat);
}

function articleGradient(a) {
  return a.gradient || 'linear-gradient(135deg, #7134D0 0%, #E8821E 100%)';
}

function articleCarouselCard(a) {
  return `
    <button type="button" class="carousel-card card-gradient card-carousel articulos-card" data-id="${a.id}" style="--article-gradient: ${articleGradient(a)}">
      <h3>${a.title}</h3>
      <p>${a.subtitle}</p>
      <span class="card-stars">★ ${a.stars}</span>
    </button>`;
}

function articleListItem(a) {
  return `
    <button type="button" class="article-list-item" data-id="${a.id}">
      <div class="article-list-thumb" style="background: ${articleGradient(a)}"></div>
      <div class="article-list-meta">
        <h3>${a.title}</h3>
        <p>${a.subtitle}</p>
        <span class="article-list-stars">★ ${a.stars}</span>
      </div>
    </button>`;
}

function renderArticles() {
  const carousel = document.getElementById('articles-carousel');
  const list = document.getElementById('articles-list');
  if (carousel) {
    carousel.innerHTML = ARTICLES.map(articleCarouselCard).join('');
    bindCardClicks(carousel, openArticle);
  }
  if (list) {
    list.innerHTML = ARTICLES.map(articleListItem).join('');
    bindCardClicks(list, openArticle);
  }
}

function renderForum() {
  const el = document.getElementById('forum-feed');
  if (!el) return;
  el.innerHTML = FORUM_POSTS.map(p => `
    <article class="forum-post">
      <div class="forum-post-head">
        <div class="forum-avatar-sm"></div>
        <strong>${p.username}</strong>
        <span class="forum-mood">${p.mood}</span>
      </div>
      <p>${p.text}</p>
      <div class="forum-actions">
        <button type="button">♥ ${p.likes}</button>
        <button type="button">💬</button>
        <button type="button">↗</button>
      </div>
    </article>`).join('');
}

function formatTaskDate(date) {
  const [mm, yyyy] = date.split('-');
  return `${mm}- ${yyyy}`;
}

function taskCardHtml(task) {
  const done = isTaskCompleted(task.id);
  return `
    <article class="task-card${done ? ' task-card--done' : ''}" data-task-id="${task.id}">
      <div class="task-card-visual">
        <p class="task-card-title">${task.title}</p>
      </div>
      <div class="task-card-footer">
        <span class="task-card-date">${formatTaskDate(task.date)}</span>
        <div class="task-card-actions">
          <button type="button" class="task-btn task-btn-check${done ? ' is-done' : ''}" data-task-id="${task.id}" role="checkbox" aria-checked="${done}" aria-label="${done ? 'Reto completado' : 'Marcar reto como completado'}">
            <svg class="task-check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l5 5L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button type="button" class="task-btn task-btn-speaker" aria-label="Escuchar tarea">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>
              <path d="M15.5 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </article>`;
}

function bindTaskActions(container) {
  container.querySelectorAll('.task-btn-check').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.taskId;
      if (!id) return;
      const done = toggleTaskCompleted(id);
      btn.classList.toggle('is-done', done);
      btn.setAttribute('aria-checked', String(done));
      btn.setAttribute('aria-label', done ? 'Reto completado' : 'Marcar reto como completado');
      const card = btn.closest('.task-card');
      if (card) card.classList.toggle('task-card--done', done);
    });
  });
  container.querySelectorAll('.task-btn-speaker').forEach(btn => {
    btn.addEventListener('click', (e) => e.stopPropagation());
  });
}

function renderTasks() {
  const el = document.getElementById('tasks-list');
  const levelEl = document.getElementById('tareas-level');
  if (!el) return;
  const level = TASK_ROWS[0]?.level ?? 1;
  if (levelEl) levelEl.textContent = `Nivel ${level}`;
  el.innerHTML = TASK_ROWS.map((row, i) => `
    <section class="task-row" data-row="${i}">
      <div class="h-carousel task-carousel" tabindex="0">
        ${row.tasks.map(taskCardHtml).join('')}
      </div>
    </section>`).join('');
  bindTaskActions(el);
}

function renderPerfilDash() {
  const img = document.getElementById('dash-avatar');
  if (img) {
    if (avatarState.customized) {
      img.innerHTML = buildAvatarPortrait(avatarState, 80);
    } else {
      img.innerHTML = buildAvatarThumb(avatarState);
    }
  }
  const user = document.getElementById('dash-username');
  if (user) user.textContent = MOCK_USER.username;
}

function listRow(id, username, avatar, action, icon) {
  return `
    <button class="list-row" data-id="${id}" data-action="${action}">
      <div class="list-avatar">${buildAvatarThumb(avatar)}</div>
      <span class="list-name">${username}</span>
      <span class="list-action">${icon}</span>
    </button>`;
}

function bindListClicks(container, handler) {
  container.querySelectorAll('.list-row').forEach(row => {
    row.addEventListener('click', () => handler(row.dataset.id));
  });
}

function bindCardClicks(container, handler) {
  container.querySelectorAll('[data-id]').forEach(card => {
    card.addEventListener('click', () => handler(card.dataset.id));
  });
}

// ── NAVIGATION HELPERS ───────────────────────────────────────────────────────

function openChatFromFriend(friendId) {
  let chat = CHATS.find(c => c.id === friendId);
  if (!chat) {
    const friend = FRIENDS.find(f => f.id === friendId);
    if (!friend) return;
    chat = { id: friendId, username: friend.username, avatar: friend.avatar,
      messages: [{ from: 'them', text: '¡Hola! ¿Cómo estás?' }] };
  }
  openChatWithData(chat);
}

function openChat(id) {
  currentChatId = id;
  const chat = CHATS.find(c => c.id === id);
  if (!chat) return;
  openChatWithData(chat);
}

function openChatWithData(chat) {
  const header = document.getElementById('chat-header-avatar');
  if (header) header.innerHTML = buildAvatarThumb(chat.avatar);
  document.getElementById('chat-title').textContent = chat.username;
  const msgs = document.getElementById('chat-messages');
  if (msgs) {
    msgs.innerHTML = chat.messages.map(m => `
      <div class="bubble ${m.from === 'me' ? 'bubble-me' : 'bubble-them'}">
        ${m.text}${m.read ? '<span class="read">✓✓</span>' : ''}
      </div>`).join('');
    msgs.scrollTop = msgs.scrollHeight;
  }
  showScreenFn('chat', 'right');
}

function openArticle(id) {
  const article = ARTICLES.find(a => a.id === id);
  if (!article) return;
  document.getElementById('article-title').textContent = article.title;
  document.getElementById('article-body').innerHTML = article.sections.map(s =>
    `<h3>${s.heading}</h3><p>${s.body}</p>`).join('');
  document.getElementById('article-stars').textContent = `★ ${article.stars}`;
  const link = document.getElementById('article-link');
  if (link) { link.href = article.link; link.style.display = article.link === '#' ? 'none' : ''; }
  showScreenFn('articulo', 'right');
}

export function bindHubCards() {
  document.querySelectorAll('[data-hub]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.hub;
      showScreenFn(target, 'right');
    });
  });

  document.getElementById('go-amigos')?.addEventListener('click', (e) => {
    e.preventDefault();
    showScreenFn('amigos', 'right');
  });

  document.getElementById('pick-andrew')?.addEventListener('click', () => {
    resetSimChat();
    showScreenFn('chat-sim', 'right');
  });

  document.getElementById('go-seg-test')?.addEventListener('click', () => {
    segIndex = 0;
    segAnswers.length = 0;
    renderSegQuestion();
    showScreenFn('seg-test', 'right');
  });
}

// ── SEG TEST ─────────────────────────────────────────────────────────────────

function initSegTest() {
  document.getElementById('btn-seg-next')?.addEventListener('click', onSegNext);
}

function renderSegQuestion() {
  const q = SEG_QUESTIONS[segIndex];
  const fill = document.getElementById('seg-progress-fill');
  if (fill) fill.style.width = `${((segIndex + 1) / SEG_QUESTIONS.length) * 100}%`;
  document.getElementById('seg-question').textContent = q.q;
  const scale = document.getElementById('seg-scale');
  const textarea = document.getElementById('seg-textarea');
  const btn = document.getElementById('btn-seg-next');
  if (scale) scale.style.display = q.scale ? 'flex' : 'none';
  if (textarea) textarea.style.display = q.scale ? 'none' : 'block';
  if (btn) btn.textContent = segIndex === SEG_QUESTIONS.length - 1 ? 'VER RESULTADOS' : 'SIGUIENTE';
  scale?.querySelectorAll('.scale-dot').forEach(d => d.classList.remove('selected'));
}

function onSegNext() {
  if (segIndex < SEG_QUESTIONS.length - 1) {
    segIndex++;
    renderSegQuestion();
  } else {
    showScreenFn('seguimiento', 'right');
  }
}

function initSegTestScale() {
  document.getElementById('seg-scale')?.addEventListener('click', (e) => {
    const dot = e.target.closest('.scale-dot');
    if (!dot) return;
    e.currentTarget.querySelectorAll('.scale-dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
  });
}

// ── CHAT SIMULATOR ───────────────────────────────────────────────────────────

let simUserTurn = 0;

function renderSimAvatar(face) {
  const el = document.getElementById('sim-avatar-lg');
  if (!el) return;
  const state = { ...SIM_CHARACTER.avatar, face: face || SIM_CHARACTER.avatar.face };
  el.innerHTML = buildAvatarSVG(state, 132);
}

function appendSimBubbles(container, lines) {
  lines.forEach((text, i) => {
    setTimeout(() => {
      container.insertAdjacentHTML('beforeend',
        `<div class="bubble bubble-them">${text}</div>`);
      container.scrollTop = container.scrollHeight;
    }, i * 450);
  });
}

function setSimPlaceholder(text) {
  const input = document.getElementById('sim-input-field');
  if (input) input.placeholder = text || 'Escribe un mensaje…';
}

function resetSimChat() {
  simUserTurn = 0;
  renderSimAvatar(SIM_CHARACTER.intro.face);
  const msgs = document.getElementById('sim-messages');
  if (msgs) {
    msgs.innerHTML = SIM_CHARACTER.intro.messages
      .map(t => `<div class="bubble bubble-them">${t}</div>`).join('');
    msgs.scrollTop = msgs.scrollHeight;
  }
  const input = document.getElementById('sim-input-field');
  if (input) input.value = '';
  setSimPlaceholder(SIM_CHARACTER.placeholders[0] || 'Escribe un mensaje…');
  document.getElementById('sim-input')?.classList.remove('has-text');
}

function initChatSim() {
  initSegTestScale();
  const input = document.getElementById('sim-input-field');
  const send = document.getElementById('sim-send');
  const syncSend = () => {
    const has = input.value.trim().length > 0;
    document.getElementById('sim-input')?.classList.toggle('has-text', has);
  };
  input?.addEventListener('input', syncSend);
  send?.addEventListener('click', () => sendSimMessage(input));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendSimMessage(input); }
  });
}

function sendSimMessage(input) {
  const text = input?.value.trim();
  if (!text) return;
  const msgs = document.getElementById('sim-messages');
  msgs.insertAdjacentHTML('beforeend', `<div class="bubble bubble-me">${text}</div>`);
  input.value = '';
  document.getElementById('sim-input')?.classList.remove('has-text');
  msgs.scrollTop = msgs.scrollHeight;

  const reply = SIM_CHARACTER.replies[simUserTurn];
  simUserTurn++;
  if (!reply) return;

  setTimeout(() => {
    if (reply.face) renderSimAvatar(reply.face);
    if (reply.messages?.length) {
      appendSimBubbles(msgs, reply.messages);
      const doneMs = reply.messages.length * 450 + 300;
      if (reply.afterFace) {
        setTimeout(() => renderSimAvatar(reply.afterFace), doneMs);
      }
    }
    setSimPlaceholder(SIM_CHARACTER.placeholders[simUserTurn] || 'Escribe un mensaje…');
  }, 500);
}
