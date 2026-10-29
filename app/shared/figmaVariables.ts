import type { Tokens } from './model.js';

// Palette → variables Figma (décision du 29/10) : DS-Studio écrit un fichier
// JSON explicite, que le plugin maison (connectors/figma/plugin) lit dans Figma.
// Le plugin montre le diff et n'écrit qu'après validation ; il ne remplace ni
// ne supprime jamais une variable existante.
export const FIGMA_FORMAT = 'ds-studio.figma-variables';
export const FIGMA_VERSION = 1;
export const FIGMA_COLLECTION = 'Primitives';

export interface FigmaVariablesFile {
  format: typeof FIGMA_FORMAT;
  version: typeof FIGMA_VERSION;
  collection: string;
  variables: { name: string; type: 'COLOR'; value: string }[];
}

// color.rougePrimaire.050 → color/rougePrimaire/050 : Figma range les nuances
// dans des dossiers (color › rougePrimaire).
export const figmaName = (key: string) => key.split('.').join('/');

export function figmaVariablesFile(
  colors: Record<string, string>,
): FigmaVariablesFile {
  return {
    format: FIGMA_FORMAT,
    version: FIGMA_VERSION,
    collection: FIGMA_COLLECTION,
    variables: Object.entries(colors).map(([key, hex]) => ({
      name: figmaName(key),
      type: 'COLOR',
      value: hex.toUpperCase(),
    })),
  };
}

// Toutes les primitives couleur déjà enregistrées (color.<nom>.<numéro>).
export function primitiveColors(tokens: Tokens, keys: string[]) {
  return Object.fromEntries(keys.map((k) => [k, String(tokens[k].$value)]));
}

export const figmaFileName = (slug: string) => `${slug}.figma-variables.json`;
