import { contrast } from './model.js';

// Générateur de palettes accessibles (décision du 28/10, revue le 29/10) :
// une couleur de départ intacte, un nombre de nuances choisi, et des règles
// « nuance A ≥ ratio sur nuance B » que le moteur cherche à respecter.

export interface PaletteRule {
  shade: string;
  against: string;
  min: number;
}
export interface PaletteOptions {
  base: string;
  count: number;
  rules?: PaletteRule[];
  // Décalage de teinte au plus loin de la couleur de départ, en degrés
  // (12 par défaut, soit 5°, 8° puis 12° ; 0 pour l'ignorer).
  hueShift?: number;
  // Nuances retouchées à la main : gardées telles quelles, comme la couleur de départ.
  overrides?: Record<string, string>;
}
export interface PaletteShade {
  name: string;
  hex: string;
  fixed: 'base' | 'override' | null;
}
export interface RuleResult extends PaletteRule {
  ratio: number;
  ok: boolean;
  // Meilleur ratio possible sans toucher aux couleurs fixées ni inverser l'ordre.
  best: number;
}
export interface Palette {
  shades: PaletteShade[];
  rules: RuleResult[];
}

export const MIN_SHADES = 3;
export const MAX_SHADES = 12;
const HEX = /^#[0-9a-fA-F]{6}$/;

export function shadeNames(count: number): string[] {
  if (count === 10)
    return ['050', ...Array.from({ length: 9 }, (_, i) => `${(i + 1) * 100}`)];
  return Array.from({ length: count }, (_, i) => `${(i + 1) * 100}`);
}
// La couleur de départ est au milieu : le 500 dans une palette de 10 nuances.
export function baseIndex(count: number): number {
  return Math.floor(count / 2);
}
export function defaultRules(count: number): PaletteRule[] {
  const names = shadeNames(count);
  const b = baseIndex(count);
  const first = names[0];
  const rules: PaletteRule[] = [];
  if (b - 1 > 0) rules.push({ shade: names[b - 1], against: first, min: 3 });
  rules.push({ shade: names[b], against: first, min: 3 });
  const t = Math.min(b + 2, count - 2);
  if (t > b) {
    rules.push({ shade: names[t], against: first, min: 4.5 });
    if (b > 1) rules.push({ shade: names[t], against: names[1], min: 4.5 });
  }
  rules.push({ shade: names[count - 1], against: first, min: 7 });
  return rules;
}

// OKLCH : clarté perçue régulière, pratique pour échelonner des nuances.
type Lch = [number, number, number];
const toLinear = (x: number) =>
  x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
const fromLinear = (x: number) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
function hexToOklch(hex: string): Lch {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((x) => toLinear(parseInt(x, 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [
    L,
    Math.hypot(A, B),
    ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360,
  ];
}
function oklchToRgb([L, C, H]: Lch): [number, number, number] {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}
// Hors des couleurs affichables, on réduit la saturation en gardant clarté et teinte.
function oklchToHex([L, C, H]: Lch): string {
  const inGamut = (c: number) =>
    oklchToRgb([L, c, H]).every((v) => v >= -1e-4 && v <= 1 + 1e-4);
  let c = C;
  if (!inGamut(c)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(mid)) lo = mid;
      else hi = mid;
    }
    c = lo;
  }
  return (
    '#' +
    oklchToRgb([L, c, H])
      .map((v) =>
        Math.round(Math.min(1, Math.max(0, fromLinear(Math.max(0, v)))) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  );
}
const hueDistance = (from: number, to: number) =>
  ((to - from + 540) % 360) - 180;

// Décalage de teinte par famille, sur le cercle chromatique classique (TSL) :
// chaque famille a sa direction en éclaircissant et en fonçant.
// Source : « Principles of creating a color palette in interface design »,
// Design Systems Collective.
const families: [number, string, number, string, number, string][] = [
  [0, 'Rouge', 30, 'orange', 330, 'pourpre'],
  [30, 'Orange', 60, 'jaune', 0, 'rouge'],
  [60, 'Jaune', 90, 'vert', 30, 'orange'],
  [90, 'Jaune-vert', 120, 'vert', 60, 'jaune'],
  [120, 'Vert', 150, 'bleu-vert', 90, 'jaune-vert'],
  [150, 'Bleu-vert', 180, 'cyan', 120, 'vert'],
  [180, 'Cyan', 210, 'bleu clair', 150, 'bleu-vert'],
  [210, 'Bleu clair', 240, 'bleu', 180, 'cyan'],
  [240, 'Bleu', 210, 'bleu clair', 270, 'violet'],
  [270, 'Violet', 300, 'magenta', 240, 'bleu'],
  [300, 'Magenta', 330, 'rose', 270, 'violet'],
  [330, 'Rose', 0, 'rouge', 300, 'pourpre'],
];
export interface HueFamily {
  hue: number;
  name: string;
  light: number;
  lightName: string;
  dark: number;
  darkName: string;
}
function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h =
    max === r
      ? ((g - b) / d + 6) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return [h * 60, s, l];
}
function hslToHex([h, s, l]: [number, number, number]): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.round((v + m) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase()
  );
}
// Famille la plus proche ; un gris (presque sans saturation) n'en a pas.
export function hueFamily(hex: string): HueFamily | null {
  const [h, s, l] = hexToHsl(hex);
  if (s * (1 - Math.abs(2 * l - 1)) < 0.06) return null;
  const f = families[Math.round(h / 30) % 12];
  return {
    hue: f[0],
    name: f[1],
    light: f[2],
    lightName: f[3],
    dark: f[4],
    darkName: f[5],
  };
}
// Pas par défaut autour de la couleur de départ : 5°, 8° puis 12° (le maximum).
export function hueStep(distance: number, max = 12): number {
  if (distance <= 0) return 0;
  return distance === 1
    ? (max * 5) / 12
    : distance === 2
      ? (max * 8) / 12
      : max;
}

export function validatePalette(options: PaletteOptions): string[] {
  const errors: string[] = [];
  if (!HEX.test(options.base)) errors.push('Couleur attendue : #RRGGBB.');
  if (
    !Number.isInteger(options.count) ||
    options.count < MIN_SHADES ||
    options.count > MAX_SHADES
  )
    errors.push(`Entre ${MIN_SHADES} et ${MAX_SHADES} nuances.`);
  else {
    const names = shadeNames(options.count);
    for (const r of options.rules ?? []) {
      if (!names.includes(r.shade) || !names.includes(r.against))
        errors.push(`Règle ${r.shade} / ${r.against} : nuance inconnue.`);
      else if (r.shade === r.against)
        errors.push(`Règle ${r.shade} : choisir deux nuances différentes.`);
      if (!(r.min >= 1 && r.min <= 21))
        errors.push(`Règle ${r.shade} : ratio entre 1 et 21.`);
    }
    for (const [k, v] of Object.entries(options.overrides ?? {}))
      if (!names.includes(k) || !HEX.test(v))
        errors.push(`Retouche ${k} : couleur attendue #RRGGBB.`);
  }
  return errors;
}

export function generatePalette(options: PaletteOptions): Palette {
  const errors = validatePalette(options);
  if (errors.length) throw new Error(errors.join(' '));
  const { count } = options;
  const names = shadeNames(count);
  const b = baseIndex(count);
  const rules = options.rules ?? defaultRules(count);
  const maxShift = options.hueShift ?? 12;
  const [L0, C0, H0] = hexToOklch(options.base.toUpperCase());
  const lightest = Math.max(0.985, L0);
  const darkest = Math.min(0.25, L0 * 0.6);
  const family = hueFamily(options.base);
  // La teinte tourne sur le cercle classique, puis est relue en OKLCH.
  const hueAt = (distance: number, toward: 'light' | 'dark') => {
    if (!family) return H0;
    const [h, s, l] = hexToHsl(options.base);
    const sign = Math.sign(hueDistance(family.hue, family[toward]));
    const rotated = (h + sign * hueStep(distance, maxShift) + 360) % 360;
    return hexToOklch(hslToHex([rotated, s, l]))[2];
  };

  // Échelle de départ : clarté régulière de part et d'autre de la couleur.
  const lch: Lch[] = names.map((_, i) => {
    if (i < b) {
      const t = (b - i) / b;
      // Les nuances claires se resserrent près du blanc, comme dans Scale ou Radix.
      return [
        L0 + (lightest - L0) * t ** 0.7,
        C0 * (1 - 0.85 * t),
        hueAt(b - i, 'light'),
      ];
    }
    if (i > b) {
      const t = (i - b) / (count - 1 - b);
      return [
        L0 - (L0 - darkest) * t,
        C0 * (1 - 0.3 * t),
        hueAt(i - b, 'dark'),
      ];
    }
    return [L0, C0, H0];
  });
  const fixed = names.map((n, i) =>
    i === b ? 'base' : options.overrides?.[n] ? 'override' : null,
  );
  const hex = names.map((n, i) =>
    i === b
      ? options.base.toUpperCase()
      : (options.overrides?.[n]?.toUpperCase() ?? oklchToHex(lch[i])),
  );
  names.forEach((n, i) => {
    if (fixed[i] === 'override') lch[i] = hexToOklch(hex[i]);
  });
  const withL = (i: number, L: number) => oklchToHex([L, lch[i][1], lch[i][2]]);

  // Une nuance ne peut pas dépasser les couleurs fixées voisines : l'ordre
  // clair → foncé reste celui de l'échelle.
  const bounds = (i: number): [number, number] => {
    let lo = 0;
    let hi = 1;
    for (let k = i + 1; k < count; k++)
      if (fixed[k]) {
        lo = lch[k][0] + 0.005;
        break;
      }
    for (let k = i - 1; k >= 0; k--)
      if (fixed[k]) {
        hi = lch[k][0] - 0.005;
        break;
      }
    return [lo, hi];
  };
  const setL = (i: number, L: number) => {
    lch[i] = [L, lch[i][1], lch[i][2]];
    hex[i] = withL(i, L);
    // Les nuances libres voisines suivent pour garder l'ordre.
    for (let k = i + 1; k < count && !fixed[k] && lch[k][0] > L - 0.005; k++) {
      lch[k] = [L - 0.005, lch[k][1], lch[k][2]];
      hex[k] = withL(k, lch[k][0]);
    }
    for (let k = i - 1; k >= 0 && !fixed[k] && lch[k][0] < L + 0.005; k--) {
      lch[k] = [L + 0.005, lch[k][1], lch[k][2]];
      hex[k] = withL(k, lch[k][0]);
    }
  };
  // Cherche la plus petite retouche de clarté de la nuance i qui atteint min.
  const reach = (i: number, other: number, min: number): boolean => {
    if (fixed[i]) return false;
    const darker = i > other;
    const [lo, hi] = bounds(i);
    const limit = darker ? lo : hi;
    if (darker ? limit >= lch[i][0] : limit <= lch[i][0]) return false;
    if (contrast(withL(i, limit), hex[other]) < min) return false;
    let near = lch[i][0];
    let far = limit;
    for (let step = 0; step < 30; step++) {
      const mid = (near + far) / 2;
      if (contrast(withL(i, mid), hex[other]) >= min) far = mid;
      else near = mid;
    }
    setL(i, far);
    return true;
  };
  const extreme = (i: number, darker: boolean) => {
    if (fixed[i]) return hex[i];
    const [lo, hi] = bounds(i);
    return withL(i, darker ? lo : hi);
  };
  const index = (n: string) => names.indexOf(n);
  for (let pass = 0; pass < 4; pass++)
    for (const r of rules) {
      const a = index(r.shade);
      const o = index(r.against);
      if (contrast(hex[a], hex[o]) >= r.min) continue;
      if (reach(a, o, r.min) || reach(o, a, r.min)) continue;
      // Ni l'une ni l'autre ne suffit seule : on pousse la référence au bout.
      if (
        !fixed[o] &&
        contrast(extreme(a, a > o), extreme(o, a < o)) >= r.min
      ) {
        setL(o, bounds(o)[a > o ? 1 : 0]);
        reach(a, o, r.min);
      }
    }

  return {
    shades: names.map((name, i) => ({
      name,
      hex: hex[i],
      fixed: fixed[i] as PaletteShade['fixed'],
    })),
    rules: rules.map((r) => {
      const a = index(r.shade);
      const o = index(r.against);
      const ratio = contrast(hex[a], hex[o]);
      const aDarker = a > o;
      const best = Math.max(
        ratio,
        contrast(extreme(a, aDarker), extreme(o, !aDarker)),
      );
      return { ...r, ratio, ok: ratio >= r.min, best };
    }),
  };
}

// « Rouge primaire » → color.rougePrimaire.050 : noms acceptés par les tokens.
export function paletteSlug(name: string): string {
  const words = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  const slug = words
    .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1) : w))
    .join('');
  return /^[a-z]/.test(slug) ? slug : `palette${slug}`;
}
export function paletteTokens(
  name: string,
  shades: PaletteShade[],
): Record<string, { $type: 'color'; $value: string }> {
  const slug = paletteSlug(name);
  return Object.fromEntries(
    shades.map((s) => [
      `color.${slug}.${s.name}`,
      { $type: 'color' as const, $value: s.hex },
    ]),
  );
}
