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

const TAB_SCREENS = ['ajustes', 'chats', 'home', 'perfil-dash'];
const NAV_SCREENS = [...TAB_SCREENS, 'chat-sim', 'tareas', 'articulos', 'libreta', 'foro'];
const STACK_SCREENS = new Set([
  'articulo', 'chat', 'chat-sim', 'simulador', 'amigos',
  'seguimiento', 'seg-test', 'libreta-detail',
]);

let showScreenFn = null;
let activeTab = 'home';
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

function bindNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (!tab || tab === activeTab) return;
      activeTab = tab;
      syncBottomNav();
      showScreenFn(tab, 'right');
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
  const nav = document.getElementById('bottom-nav');
  if (nav) nav.classList.toggle('hidden', !TAB_SCREENS.includes(activeTab));
}

export function onScreenChange(screenId) {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;
  const showNav = NAV_SCREENS.includes(screenId);
  nav.classList.toggle('hidden', !showNav);
  if (screenId === 'chat-sim') {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === 'chats');
    });
  } else if (['tareas', 'articulos', 'libreta', 'foro'].includes(screenId)) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === 'home');
    });
  } else if (TAB_SCREENS.includes(screenId)) {
    activeTab = screenId;
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

function renderArticles() {
  const el = document.getElementById('articles-list');
  if (!el) return;
  el.innerHTML = ARTICLES.map(a => `
    <button class="carousel-card card-gradient card-carousel" data-go="articulo" data-id="${a.id}">
      <h3>${a.title}</h3>
      <p>${a.subtitle}</p>
      <span class="card-stars">★ ${a.stars}</span>
    </button>`).join('');
  bindCardClicks(el, openArticle);
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
  return `
    <article class="task-card">
      <div class="task-card-visual">
        <p class="task-card-title">${task.title}</p>
      </div>
      <div class="task-card-footer">
        <span class="task-card-date">${formatTaskDate(task.date)}</span>
        <div class="task-card-actions">
          <button type="button" class="task-btn task-btn-dot" aria-label="Estado de tarea"></button>
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

function bindTaskRowButtons(container) {
  container.querySelectorAll('.task-btn').forEach(btn => {
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
  bindTaskRowButtons(el);
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
  el.innerHTML = buildAvatarSVG(state, 140);
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
  const sendBtn = document.getElementById('sim-send');
  if (sendBtn) sendBtn.style.display = 'none';
}

function initChatSim() {
  initSegTestScale();
  const input = document.getElementById('sim-input-field');
  const send = document.getElementById('sim-send');
  const syncSend = () => {
    const has = input.value.trim().length > 0;
    document.getElementById('sim-input')?.classList.toggle('has-text', has);
    if (send) send.style.display = has ? 'flex' : 'none';
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
  document.getElementById('sim-send').style.display = 'none';
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
