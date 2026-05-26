'use strict';

import {
  buildFrame4Portrait,
  FRAME4_BG,
  FRAME4_BODY,
  FRAME4_SKIN,
} from './avatar.js';
import {
  buildHairFigureHtml,
  getHairStyleColors,
  isHairStyleAsset,
} from './hair-styles.js';

function buildCircleBackgroundSvg(bgColor, size) {
  const uid = Math.random().toString(36).slice(2, 7);
  const clipId = `clip-${uid}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328 328" width="${size}" height="${size}" class="creator-preview-bg" aria-hidden="true">
  <defs><clipPath id="${clipId}"><rect width="328" height="328" rx="164"/></clipPath></defs>
  <g clip-path="url(#${clipId})"><rect width="328" height="328" fill="${bgColor}"/></g>
</svg>`;
}

/**
 * Vista previa del creador: acumula piel, círculo de fondo, ropa, peinado y rostro.
 */
export function buildCreatorPreview(state, size, { headOnly = false } = {}) {
  const bgColor = state.bgColor || FRAME4_BG;
  const bodyColor = state.bodyColor || FRAME4_BODY;
  const skin = state.skin || FRAME4_SKIN;

  if (headOnly) {
    return buildFrame4Portrait({ skin, bodyColor, bgColor }, size);
  }

  const figureH = Math.round(size * 0.88);
  let figureHtml = '';
  if (isHairStyleAsset(state.hairStyle)) {
    figureHtml = buildHairFigureHtml(
      state.hairStyle,
      getHairStyleColors(state),
      figureH,
      state.face || 'simple',
    );
  }

  if (!figureHtml) {
    return buildFrame4Portrait({ skin, bodyColor, bgColor }, size);
  }

  return `<div class="creator-preview-stack" style="width:${size}px;height:${size}px">
    ${buildCircleBackgroundSvg(bgColor, size)}
    <div class="creator-preview-figure">${figureHtml}</div>
  </div>`;
}

/** Retrato completo para home, perfil, etc. */
export function buildAvatarPortrait(state, size) {
  return buildCreatorPreview(state, size, { headOnly: false });
}
