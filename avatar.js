'use strict';

/*
  Coordinate space: viewBox "0 0 328 328"
  Base from assets/avatar/frame-4.svg — exact paths, parameterized fills.

  Head geometry:
    center : (163.5, 172.794)
    radius : 88.172
    top    : y ≈ 84.6
    left   : x ≈ 75.3  (also left ear center)
    right  : x ≈ 251.7 (also right ear center)

  Face landmarks (scaled from original 75×90 design):
    eyes   : (140, 164) and (187, 164)
    mouth  : centered x≈164, y≈189–208
    cheeks : (118, 178) and (210, 178)
    stroke-width : 6
*/

// ── PALETTES ─────────────────────────────────────────────────────────────────

export const SKIN_COLORS = [
  '#FFBABA', // 1 – lightest
  '#F3AC79', // 2
  '#DD9B6C', // 3
  '#AC7752', // 4
  '#996744', // 5
  '#684328', // 6 – darkest
];

export const HAIR_COLORS = [
  '#1A1A1A', // black
  '#2C1810', // very dark brown
  '#6B3A2A', // dark brown
  '#A0522D', // medium brown
  '#D2691E', // caramel
  '#DAA520', // blonde
  '#C0392B', // red
  '#7134D0', // purple
];

export const BG_COLORS = [
  '#E8821E', // orange (default)
  '#1B2A4A', // navy
  '#4B7BE5', // blue
  '#7134D0', // violet
  '#45B8AC', // teal
  '#3A8A3A', // green
  '#E84393', // pink
  '#C0392B', // red
];

export const BODY_COLORS = [
  '#E8821E', '#7134D0', '#4B7BE5',
  '#45B8AC', '#F1C40F', '#E84393',
  '#3A8A3A', '#C0392B',
];

// ── SKIN BASE ─────────────────────────────────────────────────────────────────
// Exact paths from Frame 4.svg — only fills are parameterized.

function skinBase(skin, body, shadowId) {
  return `
  <path d="M236.263 346.937C236.263 327.639 228.597 309.131 214.951 295.485C201.305 281.84 182.798 274.173 163.5 274.173C144.202 274.173 125.694 281.84 112.048 295.485C98.4024 309.131 90.7363 327.639 90.7363 346.937L163.5 346.937H236.263Z" fill="${body}"/>
  <g filter="url(#${shadowId})">
    <circle cx="163.5" cy="172.794" r="88.1719" fill="${skin}"/>
  </g>
  <circle cx="251.672" cy="172.672" r="30.3282" fill="${skin}"/>
  <circle cx="75.3282" cy="172.672" r="30.3282" fill="${skin}"/>
  <path d="M147.235 239.932H180.009V272.706C180.009 281.756 172.673 289.093 163.622 289.093C154.572 289.093 147.235 281.756 147.235 272.706V239.932Z" fill="${skin}"/>`;
}

// ── HAIR STYLES ───────────────────────────────────────────────────────────────
// All coordinates in 328×328 space, scaled from original 75×90 design.
// head center (163.5, 172.794), radius 88.172 → scale ≈ 3.165

const HAIR_DEFS = [
  {
    id: 'curly',
    label: 'Rizado',
    paths: (c) => `
      <circle cx="164" cy="120" r="66"  fill="${c}"/>
      <circle cx="124" cy="113" r="44"  fill="${c}"/>
      <circle cx="203" cy="113" r="44"  fill="${c}"/>
      <circle cx="99"  cy="142" r="51"  fill="${c}"/>
      <circle cx="229" cy="142" r="51"  fill="${c}"/>
      <circle cx="61"  cy="173" r="41"  fill="${c}"/>
      <circle cx="267" cy="173" r="41"  fill="${c}"/>
      <rect   x="105" y="170"  width="117" height="38" fill="${c}"/>`,
  },
  {
    id: 'wavy',
    label: 'Ondulado',
    paths: (c) => `
      <path d="M75.5,172.6 Q75.5,84.7 163.4,84.7 Q251.7,84.7 251.7,172.6
               L251.7,135.3 Q209.6,160.6 177.9,129.0 Q163.4,116.3 148.9,129.0
               Q117.2,160.6 75.5,135.3 Z" fill="${c}"/>
      <path d="M60.9,173.3 Q45.8,135.3 70.2,103.6 Q83.5,84.7 95.9,97.1
               Q63.9,132.1 60.9,173.3 Z" fill="${c}"/>
      <path d="M266.6,173.3 Q282.4,135.3 257.1,103.6 Q244.4,84.7 231.8,97.3
               Q263.3,132.2 266.6,173.3 Z" fill="${c}"/>`,
  },
  {
    id: 'straight',
    label: 'Lacio',
    paths: (c) => `
      <path d="M75.5,172.6 Q75.5,84.7 163.4,84.7 Q251.6,84.7 251.6,172.6
               L251.6,116.3 Q163.4,97.3 75.5,116.3 Z" fill="${c}"/>
      <rect x="60.9"  y="116.3" width="34.8" height="221.6" rx="15.8" fill="${c}"/>
      <rect x="231.8" y="116.3" width="34.8" height="221.6" rx="15.8" fill="${c}"/>`,
  },
  {
    id: 'afro',
    label: 'Afro',
    paths: (c) => `
      <circle cx="164" cy="154" r="108" fill="${c}"/>
      <rect   x="92"  y="173"  width="142" height="38" fill="${c}"/>`,
  },
  {
    id: 'bob',
    label: 'Bob',
    paths: (c) => `
      <path d="M70.4,172.6 Q70.4,84.7 163.4,84.7 Q256.7,84.7 257.0,172.6
               L257.0,154.3 Q219.1,179.6 163.4,173.3 Q107.7,179.6 70.4,154.3 Z" fill="${c}"/>`,
  },
  {
    id: 'bun',
    label: 'Moño',
    paths: (c) => `
      <circle cx="164"   cy="104"   r="44"              fill="${c}"/>
      <rect   x="149.5" y="129.0"  width="28.5" height="25.3" fill="${c}"/>
      <path d="M81.8,172.6 Q79.8,97.3 163.4,91.0 Q246.9,97.3 243.8,172.6
               L243.8,129.0 Q163.4,110.0 81.8,129.0 Z" fill="${c}"/>`,
  },
];

// Colores canónicos del asset Frame 4.svg (Figma)
export const FRAME4_BG    = '#E06913';
export const FRAME4_SKIN  = '#FFFFFF';
export const FRAME4_BODY  = '#888888';

/** Centro de cabeza en Frame 4 (328×328) — referencia para escalar el rostro */
export const FRAME4_HEAD_CENTER = { cx: 163.5, cy: 172.794 };
export const FRAME4_HEAD_RADIUS = 88.172;
export const HAIR_HEAD_RADIUS   = 20.7162;
export const HAIR_FACE_SCALE    = HAIR_HEAD_RADIUS / FRAME4_HEAD_RADIUS;

// ── FACE EXPRESSIONS ─────────────────────────────────────────────────────────

const FACE_DEFS = [
  {
    id: 'simple',
    label: 'Simple',
    paths: () => `
      <line x1="125" y1="164" x2="155" y2="164" stroke="#1a1a2e" stroke-width="6" stroke-linecap="round"/>
      <line x1="173" y1="164" x2="203" y2="164" stroke="#1a1a2e" stroke-width="6" stroke-linecap="round"/>
      <path d="M146,190 Q164,206 182,190" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'happy',
    label: 'Feliz',
    paths: () => `
      <circle cx="140" cy="164" r="7" fill="#1a1a2e"/>
      <circle cx="187" cy="164" r="7" fill="#1a1a2e"/>
      <path d="M146,189 Q164,208 181,189" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>
      <ellipse cx="118" cy="178" rx="16" ry="11" fill="rgba(220,110,110,0.4)"/>
      <ellipse cx="210" cy="178" rx="16" ry="11" fill="rgba(220,110,110,0.4)"/>`,
  },
  {
    id: 'chill',
    label: 'Relajado',
    paths: () => `
      <path d="M129.6,160.6 Q140.4,151.1 151.2,160.6" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>
      <path d="M176.5,160.6 Q187.3,151.1 198.1,160.6" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>
      <path d="M146,189 Q164,208 181,189" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>
      <ellipse cx="118" cy="178" rx="16" ry="11" fill="rgba(220,110,110,0.4)"/>
      <ellipse cx="210" cy="178" rx="16" ry="11" fill="rgba(220,110,110,0.4)"/>`,
  },
  {
    id: 'stars',
    label: 'Estrella',
    paths: () => `
      <text x="127" y="176" font-size="25" fill="#1a1a2e" font-family="sans-serif">★</text>
      <text x="174" y="176" font-size="25" fill="#1a1a2e" font-family="sans-serif">★</text>
      <path d="M146,189 Q164,208 181,189" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'squiggly',
    label: 'Travieso',
    paths: () => `
      <path d="M129.6,160.6 Q136.1,151.1 142.6,160.6 Q149.1,170.1 155.6,160.6"
            stroke="#1a1a2e" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M171.1,160.6 Q177.6,151.1 184.1,160.6 Q190.6,170.1 198.1,160.6"
            stroke="#1a1a2e" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M146,189 Q164,208 181,189" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'dots',
    label: 'Neutro',
    paths: () => `
      <circle cx="140" cy="164" r="7" fill="#1a1a2e"/>
      <circle cx="187" cy="164" r="7" fill="#1a1a2e"/>
      <line x1="146" y1="195" x2="181" y2="195" stroke="#1a1a2e"
            stroke-width="6" stroke-linecap="round"/>`,
  },
  {
    id: 'sad',
    label: 'Triste',
    paths: () => `
      <circle cx="140" cy="164" r="7" fill="#1a1a2e"/>
      <circle cx="187" cy="164" r="7" fill="#1a1a2e"/>
      <path d="M146,205 Q164,189 181,205" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'wink',
    label: 'Guiño',
    paths: () => `
      <path d="M129.6,160.6 Q140.4,151.1 151.2,160.6" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>
      <circle cx="187" cy="164" r="7" fill="#1a1a2e"/>
      <path d="M146,189 Q164,208 181,189" stroke="#1a1a2e" stroke-width="6"
            fill="none" stroke-linecap="round"/>
      <ellipse cx="118" cy="178" rx="16" ry="11" fill="rgba(220,110,110,0.4)"/>`,
  },
  {
    id: 'surprised',
    label: 'Sorpresa',
    paths: () => `
      <circle cx="140" cy="164" r="11" fill="none" stroke="#1a1a2e" stroke-width="6"/>
      <circle cx="187" cy="164" r="11" fill="none" stroke="#1a1a2e" stroke-width="6"/>
      <circle cx="164" cy="199" r="10" fill="none" stroke="#1a1a2e" stroke-width="6"/>`,
  },
];

// ── EXPORTS ───────────────────────────────────────────────────────────────────

export const HAIR_STYLES = HAIR_DEFS;
export const FACE_STYLES = FACE_DEFS;

/** Valores por defecto = Frame 4.svg tal cual en Figma (editar perfil) */
export const DEFAULT_AVATAR = {
  skin:      FRAME4_SKIN,
  hairStyle: 'style-0',
  hairColor: '#721F1F',
  face:      'simple',
  bgColor:   FRAME4_BG,
  bodyColor: FRAME4_BODY,
  customized: false,
};

export const FRAME4_ASSET = 'assets/avatar/frame-4.svg';

/** Retrato base de editar perfil: círculo naranja, cabeza blanca, torso gris */
export function buildFrame4Portrait(
  { skin = FRAME4_SKIN, bodyColor = FRAME4_BODY, bgColor = FRAME4_BG } = {},
  size = 168,
) {
  const uid = Math.random().toString(36).slice(2, 7);
  const clipId = `clip-${uid}`;
  const shadowId = `shadow-${uid}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328 328" width="${size}" height="${size}">
  <defs>
    <clipPath id="${clipId}"><rect width="328" height="328" rx="164"/></clipPath>
    <filter id="${shadowId}" x="71.3281" y="84.6223" width="184.344" height="184.344"
            filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix"
        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/><feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="shadow-result"/>
      <feBlend mode="normal" in="SourceGraphic" in2="shadow-result" result="shape"/>
    </filter>
  </defs>
  <g clip-path="url(#${clipId})">
    <rect width="328" height="328" fill="${bgColor}"/>
    ${skinBase(skin, bodyColor, shadowId)}
  </g>
</svg>`;
}

// ── BUILDERS ──────────────────────────────────────────────────────────────────

export function buildAvatarSVG(
  { skin, hairStyle, hairColor, face, bgColor, bodyColor },
  size = 160,
) {
  const hair     = HAIR_DEFS.find(h => h.id === hairStyle) || HAIR_DEFS[0];
  const faceEl   = FACE_DEFS.find(f => f.id === face)      || FACE_DEFS[0];
  const uid      = Math.random().toString(36).slice(2, 7);
  const clipId   = `clip-${uid}`;
  const fgId     = `fg-${uid}`;
  const shadowId = `shadow-${uid}`;

  return `<svg xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 328 328" width="${size}" height="${size}">
  <defs>
    <clipPath id="${clipId}">
      <rect width="328" height="328" rx="164"/>
    </clipPath>
    <clipPath id="${fgId}">
      <rect width="328" height="175"/>
    </clipPath>
    <filter id="${shadowId}" x="71.3281" y="84.6223" width="184.344" height="184.344"
            filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feColorMatrix in="SourceAlpha" type="matrix"
                     values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
      <feOffset dy="4"/>
      <feGaussianBlur stdDeviation="2"/>
      <feComposite in2="hardAlpha" operator="out"/>
      <feColorMatrix type="matrix"
                     values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
      <feBlend mode="normal" in2="BackgroundImageFix" result="shadow-result"/>
      <feBlend mode="normal" in="SourceGraphic" in2="shadow-result" result="shape"/>
    </filter>
  </defs>

  <g clip-path="url(#${clipId})">
    <rect width="328" height="328" fill="${bgColor}"/>

    <g>${hair.paths(hairColor)}</g>

    ${skinBase(skin, bodyColor, shadowId)}

    ${faceEl.paths()}

    <g clip-path="url(#${fgId})">${hair.paths(hairColor)}</g>
  </g>
</svg>`;
}

export function buildAvatarThumb(
  { skin, hairStyle, hairColor, face, bgColor, bodyColor },
  size = 60,
) {
  return buildAvatarSVG(
    { skin, hairStyle, hairColor, face, bgColor, bodyColor: bodyColor || bgColor },
    size,
  );
}
