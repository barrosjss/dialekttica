'use strict';

import { NOTEBOOK_SEED } from './data.js';

const STORAGE_KEY = 'dialektica-notebook';
let notes = [];
let searchQuery = '';
let editingId = null;

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      notes = JSON.parse(raw);
      return;
    }
  } catch { /* ignore */ }
  notes = NOTEBOOK_SEED.map(n => ({ ...n }));
  saveNotes();
}

function saveNotes() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch { /* ignore */ }
}

export function getNotes() {
  return notes;
}

export function addNote({ title, body = '' }) {
  const t = title?.trim() || 'Titulo';
  const note = {
    id: `n-${Date.now()}`,
    title: t,
    body: body.trim(),
    createdAt: Date.now(),
  };
  notes.unshift(note);
  saveNotes();
  return note;
}

export function updateNote(id, { title, body }) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  if (title !== undefined) note.title = title.trim() || 'Titulo';
  if (body !== undefined) note.body = body;
  saveNotes();
}

export function getNote(id) {
  return notes.find(n => n.id === id);
}

function filteredNotes() {
  const q = searchQuery.trim().toLowerCase();
  const list = [...notes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (!q) return list;
  return list.filter(n =>
    n.title.toLowerCase().includes(q) ||
    (n.body && n.body.toLowerCase().includes(q)),
  );
}

export function renderNotebookList() {
  const el = document.getElementById('notebook-list');
  if (!el) return;
  const list = filteredNotes();
  if (!list.length) {
    el.innerHTML = `
      <p class="notebook-empty">Aún no hay notas. Pulsa + para crear la primera.</p>`;
    return;
  }
  el.innerHTML = list.map(n => {
    const body = (n.body || '').trim();
    const bodyHtml = body
      ? `<p class="note-card-body">${escapeHtml(body)}</p>`
      : '';
    return `
    <button type="button" class="note-card" data-note-id="${n.id}">
      <div class="note-card-inner">
        <span class="note-card-title">${escapeHtml(n.title)}</span>
        ${bodyHtml}
      </div>
    </button>`;
  }).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function openNoteDetail(id, showScreen) {
  const note = getNote(id);
  if (!note) return;
  editingId = id;
  document.getElementById('libreta-detail-title').textContent = note.title;
  const bodyEl = document.getElementById('libreta-detail-body');
  if (bodyEl) bodyEl.value = note.body || '';
  showScreen('libreta-detail', 'right');
}

export function saveDetailNote() {
  if (!editingId) return;
  const bodyEl = document.getElementById('libreta-detail-body');
  updateNote(editingId, { body: bodyEl?.value ?? '' });
}

export function initNotebook({ showScreen }) {
  loadNotes();
  renderNotebookList();

  document.getElementById('libreta-search')?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderNotebookList();
  });

  document.getElementById('notebook-list')?.addEventListener('click', (e) => {
    const card = e.target.closest('[data-note-id]');
    if (!card) return;
    openNoteDetail(card.dataset.noteId, showScreen);
  });

  document.getElementById('libreta-fab')?.addEventListener('click', () => {
    document.getElementById('note-modal')?.classList.add('open');
    const titleInput = document.getElementById('note-title-input');
    const bodyInput = document.getElementById('note-body-input');
    if (titleInput) { titleInput.value = ''; titleInput.focus(); }
    if (bodyInput) bodyInput.value = '';
  });

  document.getElementById('note-cancel')?.addEventListener('click', closeNoteModal);
  document.getElementById('note-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'note-modal') closeNoteModal();
  });

  document.getElementById('note-save')?.addEventListener('click', () => {
    const title = document.getElementById('note-title-input')?.value;
    const body = document.getElementById('note-body-input')?.value;
    const note = addNote({ title, body });
    closeNoteModal();
    renderNotebookList();
    openNoteDetail(note.id, showScreen);
  });

  document.getElementById('libreta-detail-body')?.addEventListener('blur', saveDetailNote);

  document.querySelector('[data-back="libreta"]')?.addEventListener('click', () => {
    saveDetailNote();
    editingId = null;
    renderNotebookList();
  });
}

function closeNoteModal() {
  document.getElementById('note-modal')?.classList.remove('open');
}
