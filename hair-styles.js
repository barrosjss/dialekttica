'use strict';

import {
  FACE_STYLES,
  FRAME4_HEAD_CENTER,
  HAIR_FACE_SCALE,
} from './avatar.js';

/** Colores originales embebidos en los SVG de Figma */
export const SVG_SKIN_DEFAULT = '#FFBABA';
export const SVG_BODY_DEFAULT = '#D9D9D9';
export const SVG_HAIR_DEFAULT = '#721F1F';

/** Paleta de la pestaña Cabello (5 tonos del diseño) */
export const HAIR_TAB_COLORS = [
  '#1A1A1A',
  '#721F1F',
  '#1B2A4A',
  '#3A8A3A',
  '#E8821E',
];

/**
 * viewBox centrado en anchorX (eje del cuerpo/cabeza), no en el bbox del pelo.
 */
export const HAIR_STYLE_ASSETS = [
  { id: 'style-0', file: 'assets/hair/hair-01.svg', viewBox: '-0.50 -1.23 56.68 72.82',  anchorX: 27.8422, headCy: 30.1701, label: 'Estilo 1' },
  { id: 'style-1', file: 'assets/hair/hair-02.svg', viewBox: '-0.50 -0.50 74.38 73.53',  anchorX: 36.6918, headCy: 31.6152, label: 'Estilo 2' },
  { id: 'style-2', file: 'assets/hair/hair-03.svg', viewBox: '-11.82 -1.23 79.32 68.74', anchorX: 27.8422, headCy: 26.09,   label: 'Estilo 3' },
  { id: 'style-3', file: 'assets/hair/hair-04.svg', viewBox: '2.24 -1.23 59.36 77.26',   anchorX: 31.9223, headCy: 34.6074, label: 'Estilo 4' },
  { id: 'style-4', file: 'assets/hair/hair-05.svg', viewBox: '3.58 -1.23 56.68 78.22',   anchorX: 31.9233, headCy: 35.5754, label: 'Estilo 5' },
  { id: 'style-5', file: 'assets/hair/hair-06.svg', viewBox: '-0.50 -1.23 64.85 76.14',  anchorX: 31.9233, headCy: 33.4949, label: 'Estilo 6' },
  { id: 'style-6', file: 'assets/hair/hair-07.svg', viewBox: '-0.50 -1.23 64.85 79.22', anchorX: 31.9233, headCy: 36.5754, label: 'Estilo 7' },
  { id: 'style-7', file: 'assets/hair/hair-08.svg', viewBox: '-0.50 -1.23 56.68 80.50',  anchorX: 27.8422, headCy: 38.5879, label: 'Estilo 8' },
];

const rawCache = new Map();
let preloadPromise = null;

export function preloadHairSvgs() {
  if (!preloadPromise) {
    preloadPromise = Promise.all(
      HAIR_STYLE_ASSETS.map(async (asset) => {
        const res = await fetch(asset.file);
        if (!res.ok) throw new Error(`No se pudo cargar ${asset.file}`);
        rawCache.set(asset.id, await res.text());
      }),
    );
  }
  return preloadPromise;
}

export function isHairStyleAsset(id) {
  return HAIR_STYLE_ASSETS.some(s => s.id === id);
}

function parseViewBox(viewBox) {
  const p = viewBox.split(/\s+/).map(Number);
  return { x: p[0], y: p[1], w: p[2], h: p[3] };
}

/** Asegura que el eje del cuerpo (anchorX) quede en el centro del viewBox */
function getRenderViewBox(asset) {
  const { y, w, h } = parseViewBox(asset.viewBox);
  const x = asset.anchorX - w / 2;
  return `${x} ${y} ${w} ${h}`;
}

function colorizeSvg(svg, { skin, body, hair }) {
  return svg
    .replaceAll(SVG_SKIN_DEFAULT, skin)
    .replaceAll(SVG_BODY_DEFAULT, body)
    .replaceAll(SVG_HAIR_DEFAULT, hair)
    .replace(/#721F1F/gi, hair);
}

function hairSvgOpenTag(viewBox, width, height, className) {
  return `<svg xmlns="http://www.w3.org/2000/svg" class="${className}" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="xMidYMax meet" fill="none">`;
}

/**
 * Rostro escalado al espacio del peinado (misma cabeza que Frame 4).
 */
export function buildHairFaceSvg(faceId, asset, width, height) {
  const faceEl = FACE_STYLES.find(f => f.id === faceId) || FACE_STYLES[0];
  const { cx: fcx, cy: fcy } = FRAME4_HEAD_CENTER;
  const s = HAIR_FACE_SCALE;

  const viewBox = getRenderViewBox(asset);
  return `${hairSvgOpenTag(viewBox, width, height, 'hair-figure-face')}
  <g transform="translate(${asset.anchorX} ${asset.headCy}) scale(${s}) translate(${-fcx} ${-fcy})">
    ${faceEl.paths()}
  </g>
</svg>`;
}

/**
 * Renderiza un peinado completo (base + cabello) con colores personalizados.
 */
export function buildHairStyleSvg(
  styleId,
  { skin = SVG_SKIN_DEFAULT, body = SVG_BODY_DEFAULT, hair = SVG_HAIR_DEFAULT },
  height = 90,
) {
  const raw = rawCache.get(styleId);
  const asset = HAIR_STYLE_ASSETS.find(s => s.id === styleId);
  if (!raw || !asset) return '';

  const colored = colorizeSvg(raw, { skin, body, hair });
  const viewBox = getRenderViewBox(asset);
  const { w: vbW, h: vbH } = parseViewBox(viewBox);
  const width = Math.round(height * (vbW / vbH));

  return colored.replace(
    /<svg[^>]*>/,
    hairSvgOpenTag(viewBox, width, height, 'hair-figure-base'),
  );
}

/**
 * Busto + rostro alineados (mismo viewBox y tamaño; centrado por anchorX).
 */
export function buildHairFigureHtml(
  styleId,
  colors,
  height,
  faceId = 'simple',
) {
  const asset = HAIR_STYLE_ASSETS.find(s => s.id === styleId);
  if (!asset) return '';

  const hairSvg = buildHairStyleSvg(styleId, colors, height);
  if (!hairSvg) return '';

  const viewBox = getRenderViewBox(asset);
  const { w: vbW, h: vbH } = parseViewBox(viewBox);
  const width = Math.round(height * (vbW / vbH));
  const faceSvg = buildHairFaceSvg(faceId, asset, width, height);

  return `<div class="hair-figure-bundle">${hairSvg}${faceSvg}</div>`;
}

export function getHairStyleColors(avatarState) {
  return {
    skin: avatarState.skin || SVG_SKIN_DEFAULT,
    body: avatarState.bodyColor || SVG_BODY_DEFAULT,
    hair: avatarState.hairColor || SVG_HAIR_DEFAULT,
  };
}
