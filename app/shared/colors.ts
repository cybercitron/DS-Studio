import type { TokenKey, Tokens } from './model.js';

// Vue Couleurs (décision du 29/10) : tri par le nom. Un token qui finit par un
// numéro (color.rouge.500) est une primitive ; les autres sont des sémantiques.
export const isPrimitive = (key: TokenKey) => /\.[0-9]+$/.test(key);
const colorKeys = (tokens: Tokens) =>
  Object.keys(tokens).filter(
    (k) => k.startsWith('color.') && tokens[k].$type === 'color',
  );

export interface PrimitivePalette {
  // Nom sans la nuance : color.rouge pour color.rouge.500.
  name: string;
  keys: TokenKey[];
}
// Une rangée par palette, nuances du plus petit au plus grand numéro.
export function primitivePalettes(tokens: Tokens): PrimitivePalette[] {
  const palettes = new Map<string, TokenKey[]>();
  for (const k of colorKeys(tokens).filter(isPrimitive)) {
    const name = k.slice(0, k.lastIndexOf('.'));
    palettes.set(name, [...(palettes.get(name) ?? []), k]);
  }
  const shade = (k: TokenKey) => Number(k.slice(k.lastIndexOf('.') + 1));
  return [...palettes]
    .map(([name, keys]) => ({
      name,
      keys: keys.sort((a, b) => shade(a) - shade(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const semanticGroups = [
  { id: 'marque', label: 'Marque' },
  { id: 'texte', label: 'Texte' },
  { id: 'fonds', label: 'Fonds' },
  { id: 'bordures', label: 'Bordures' },
  { id: 'etats', label: 'États' },
  { id: 'autres', label: 'Autres' },
] as const;
export type SemanticGroupId = (typeof semanticGroups)[number]['id'];
// Table de correspondance des tokens de base, qui n'ont pas de groupe dans leur nom.
export const baseColorGroups: Record<string, SemanticGroupId> = {
  'color.brand': 'marque',
  'color.brandHover': 'marque',
  'color.onBrand': 'marque',
  'color.text': 'texte',
  'color.muted': 'texte',
  'color.surface': 'fonds',
  'color.canvas': 'fonds',
  'color.border': 'bordures',
  'color.focus': 'bordures',
  'color.danger': 'etats',
  'color.success': 'etats',
};
// Un nouveau token color.groupe.nom va dans son groupe (mot français ou anglais).
const groupWords: Record<string, SemanticGroupId> = {
  marque: 'marque',
  brand: 'marque',
  texte: 'texte',
  text: 'texte',
  fond: 'fonds',
  fonds: 'fonds',
  background: 'fonds',
  surface: 'fonds',
  bordure: 'bordures',
  bordures: 'bordures',
  border: 'bordures',
  etat: 'etats',
  etats: 'etats',
  state: 'etats',
  status: 'etats',
};
export function semanticGroupOf(key: TokenKey): SemanticGroupId {
  if (Object.hasOwn(baseColorGroups, key)) return baseColorGroups[key];
  const parts = key.split('.');
  const word = parts[1]?.toLowerCase();
  return parts.length > 2 && Object.hasOwn(groupWords, word)
    ? groupWords[word]
    : 'autres';
}
// Groupes non vides, dans l'ordre fixe ci-dessus.
export function semanticColors(
  tokens: Tokens,
): { id: SemanticGroupId; label: string; keys: TokenKey[] }[] {
  const keys = colorKeys(tokens).filter((k) => !isPrimitive(k));
  return semanticGroups
    .map((g) => ({
      ...g,
      keys: keys.filter((k) => semanticGroupOf(k) === g.id),
    }))
    .filter((g) => g.keys.length);
}
