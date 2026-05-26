'use strict';

/** Retos completados solo en esta sesión (el usuario marca con el checkbox). */
/** @type {Set<string>} */
const completed = new Set();

export function isTaskCompleted(taskId) {
  return completed.has(taskId);
}

/** @returns {boolean} nuevo estado (true = completado) */
export function toggleTaskCompleted(taskId) {
  if (completed.has(taskId)) completed.delete(taskId);
  else completed.add(taskId);
  return completed.has(taskId);
}
