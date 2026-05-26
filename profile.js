'use strict';

import {
  buildFrame4Portrait,
  SKIN_COLORS, FACE_STYLES, BG_COLORS, BODY_COLORS,
  DEFAULT_AVATAR, FRAME4_BG, FRAME4_BODY,
} from './avatar.js';
import {
  preloadHairSvgs,
  buildHairStyleSvg,
  getHairStyleColors,
  isHairStyleAsset,
  HAIR_TAB_COLORS,
  HAIR_STYLE_ASSETS,
} from './hair-styles.js';
import { buildAvatarPortrait, buildCreatorPreview } from './creator-preview.js';

const SKIN_PREVIEW_SIZE = 96;
const CREATOR_PREVIEW_SIZE = 168;
const HAIR_THUMB_HEIGHT = 78;
const AVATAR_STORAGE_KEY = 'dialektica_avatar';

// ── STATE ─────────────────────────────────────────────────────────────────────

export let avatarState = { ...DEFAULT_AVATAR };

export function hydrateAvatarState() {
  try {
    const raw = localStorage.getItem(AVATAR_STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(avatarState, { ...DEFAULT_AVATAR, ...saved });
    if (!isHairStyleAsset(avatarState.hairStyle)) {
      avatarState.hairStyle = 'style-0';
    }
  } catch { /* ignore corrupt storage */ }
}

function persistAvatarState() {
  try {
    localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(avatarState));
  } catch { /* ignore quota */ }
}

function avatarPortraitHtml(size) {
  if (avatarState.customized) {
    return buildAvatarPortrait(avatarState, size);
  }
  return buildFrame4Portrait(avatarState, size);
}

// ── PROFILE SCREEN ────────────────────────────────────────────────────────────

export function initProfile({ showScreen }) {
  hydrateAvatarState();
  preloadHairSvgs().catch(() => {});
  renderProfileAvatar();

  document.getElementById('btn-crear-personaje').addEventListener('click', () => {
    openCreator(showScreen);
  });

  document.getElementById('profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('profile saved', {
      avatar: avatarState,
      fields: [...e.target.querySelectorAll('input, select')].map(f => f.value),
    });
    if (typeof window.__onProfileComplete === 'function') {
      window.__onProfileComplete();
    }
  });
}

const PROFILE_AVATAR_SIZE = 176;

export function renderProfileAvatar() {
  const el = document.getElementById('profile-avatar-img');
  if (!el) return;
  el.innerHTML = avatarPortraitHtml(PROFILE_AVATAR_SIZE);
}

// ── CREATOR SCREEN ────────────────────────────────────────────────────────────

const TABS = ['piel', 'cabello', 'rostro', 'color'];
let activeTab = 'piel';

function openCreator(showScreen) {
  activeTab = 'piel';
  preloadHairSvgs().then(() => {
    renderCreatorPreview();
    renderTabContent();
  });
  syncTabBar();
  showScreen('avatar', 'right');
}

export function initCreator({ showScreen }) {
  if (!isHairStyleAsset(avatarState.hairStyle)) {
    avatarState.hairStyle = 'style-0';
  }
  preloadHairSvgs().catch(() => {});

  document.querySelectorAll('.creator-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      syncTabBar();
      renderCreatorPreview();
      renderTabContent();
    });
  });

  document.getElementById('btn-creator-back').addEventListener('click', () => {
    showScreen('profile', 'left');
    renderProfileAvatar();
    if (typeof window.__refreshHome === 'function') window.__refreshHome();
  });
}

function syncTabBar() {
  document.querySelectorAll('.creator-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });
}

function renderCreatorPreview() {
  const el = document.getElementById('creator-preview');
  if (!el) return;
  const headOnly = activeTab === 'piel';
  el.innerHTML = buildCreatorPreview(avatarState, CREATOR_PREVIEW_SIZE, { headOnly });
}

// ── TAB CONTENT RENDERERS ────────────────────────────────────────────────────

function renderTabContent() {
  const container = document.getElementById('creator-content');
  container.innerHTML = '';

  switch (activeTab) {
    case 'piel':    renderSkinTab(container);    break;
    case 'cabello': renderHairTab(container);    break;
    case 'rostro':  renderFaceTab(container);    break;
    case 'color':   renderColorTab(container);   break;
  }
}

function renderSkinTab(c) {
  const bgColor = avatarState.bgColor || FRAME4_BG;
  const bodyColor = avatarState.bodyColor || FRAME4_BODY;
  c.innerHTML = `
    <div class="skin-grid">
      ${SKIN_COLORS.map(hex =>
        `<button type="button" class="skin-option${avatarState.skin === hex ? ' active' : ''}"
                 data-type="skin" data-val="${hex}" aria-label="Tono de piel">
          ${buildFrame4Portrait({ skin: hex, bodyColor, bgColor }, SKIN_PREVIEW_SIZE)}
        </button>`
      ).join('')}
    </div>`;
  bindSwatches(c);
}

function renderHairTab(c) {
  const colors = getHairStyleColors(avatarState);
  const hairColor = avatarState.hairColor || colors.hair;

  c.innerHTML = `
    <div class="hair-color-row">
      ${HAIR_TAB_COLORS.map(hex =>
        `<button type="button" class="hair-color-swatch${hairColor === hex ? ' active' : ''}"
                 data-type="hairColor" data-val="${hex}"
                 style="background:${hex}" aria-label="Color de cabello"></button>`
      ).join('')}
    </div>
    <div class="hair-style-grid">
      ${HAIR_STYLE_ASSETS.map(s => {
        const svg = buildHairStyleSvg(s.id, { ...colors, hair: hairColor }, HAIR_THUMB_HEIGHT);
        return `
        <button type="button" class="hair-style-option${avatarState.hairStyle === s.id ? ' active' : ''}"
                data-type="hairStyle" data-val="${s.id}" aria-label="${s.label}">
          <span class="hair-style-thumb">${svg || ''}</span>
        </button>`;
      }).join('')}
    </div>`;
  bindSwatches(c);
}

function renderFaceTab(c) {
  c.innerHTML = `
    <p class="option-label">Expresión</p>
    <div class="face-grid">
      ${FACE_STYLES.map(f => `
        <button class="face-option${avatarState.face === f.id ? ' active' : ''}"
                data-type="face" data-val="${f.id}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="70 95 60 50" width="48" height="40">
            ${f.paths()}
          </svg>
          <span>${f.label}</span>
        </button>`
      ).join('')}
    </div>`;
  bindSwatches(c);
}

function renderColorTab(c) {
  c.innerHTML = `
    <p class="option-label">Color de fondo</p>
    <div class="swatch-row">
      ${BG_COLORS.map(hex =>
        `<button class="swatch${avatarState.bgColor === hex ? ' active' : ''}"
                 style="background:${hex}" data-type="bgColor" data-val="${hex}"></button>`
      ).join('')}
    </div>
    <p class="option-label" style="margin-top:20px">Color de ropa</p>
    <div class="swatch-row">
      ${BODY_COLORS.map(hex =>
        `<button class="swatch${avatarState.bodyColor === hex ? ' active' : ''}"
                 style="background:${hex}" data-type="bodyColor" data-val="${hex}"></button>`
      ).join('')}
    </div>`;
  bindSwatches(c);
}

function bindSwatches(container) {
  container.querySelectorAll('[data-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { type, val } = btn.dataset;
      avatarState[type] = val;
      avatarState.customized = true;
      persistAvatarState();
      renderCreatorPreview();
      renderTabContent();
    });
  });
}
