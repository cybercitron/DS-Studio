import { z } from 'zod';

// Ce sous-ensemble explicite utilise les noms $type/$value, pas toute la norme DTCG.
const colorValue = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Couleur attendue : #RRGGBB');
const dimensionValue = z.number().finite().min(0).max(128);
// Nom d'une police installée : lettres, chiffres, espaces et tirets, jamais de syntaxe CSS.
const fontValue = z
  .string()
  .max(64)
  .regex(
    /^[\p{L}\p{N}](?:[\p{L}\p{N} -]*[\p{L}\p{N}])?$/u,
    'Police attendue : lettres, chiffres, espaces et tirets',
  );
const color = z
  .object({ $type: z.literal('color'), $value: colorValue })
  .strict();
const dimension = z
  .object({ $type: z.literal('dimension'), $value: dimensionValue })
  .strict();
const font = z
  .object({ $type: z.literal('fontFamily'), $value: fontValue })
  .strict();
export const tokenSchema = z.discriminatedUnion('$type', [
  color,
  dimension,
  font,
]);
export type Token = z.infer<typeof tokenSchema>;
export type TokenType = Token['$type'];
export type TokenKey = string;
export type TokenValue = string | number;

// Nom encadré : une famille, puis des mots en camelCase ou des numéros (color.rouge.500).
export const tokenNamePattern =
  /^(color|space|radius|font)(\.(?:[a-z][a-zA-Z0-9]*|[0-9]+))+$/;
export const maxTokens = 500;
export const familyTypes: Record<string, TokenType[]> = {
  color: ['color'],
  space: ['dimension'],
  radius: ['dimension'],
  font: ['dimension', 'fontFamily'],
};
const tokenName = z
  .string()
  .max(64)
  .regex(
    tokenNamePattern,
    'Nom attendu : famille (color, space, radius, font) puis mots ou numéros séparés par des points',
  );

// Tokens de base lus par les composants. Supprimables, mais remplacés par une valeur
// par défaut volontairement visible tant qu'ils manquent.
export const baseTokenTypes = {
  'color.brand': 'color',
  'color.brandHover': 'color',
  'color.onBrand': 'color',
  'color.surface': 'color',
  'color.canvas': 'color',
  'color.text': 'color',
  'color.muted': 'color',
  'color.border': 'color',
  'color.danger': 'color',
  'color.success': 'color',
  'color.focus': 'color',
  'font.family': 'fontFamily',
  'font.body': 'dimension',
  'font.heading': 'dimension',
  'space.sm': 'dimension',
  'space.md': 'dimension',
  'space.lg': 'dimension',
  'radius.control': 'dimension',
} as const satisfies Record<string, TokenType>;
export type BaseTokenKey = keyof typeof baseTokenTypes;
export const baseTokenKeys = Object.keys(baseTokenTypes) as BaseTokenKey[];
export const isBaseToken = (key: string): key is BaseTokenKey =>
  Object.hasOwn(baseTokenTypes, key);
export const fallbackValues = {
  color: '#FF00FF',
  dimension: 0,
  fontFamily: 'system-ui',
} as const satisfies Record<TokenType, TokenValue>;

export const tokensSchema = z
  .record(z.string(), tokenSchema)
  .superRefine((tokens, ctx) => {
    const keys = Object.keys(tokens);
    if (!keys.length)
      ctx.addIssue({ code: 'custom', message: 'Au moins un token.' });
    if (keys.length > maxTokens)
      ctx.addIssue({
        code: 'custom',
        message: `${maxTokens} tokens au maximum.`,
      });
    const seen = new Set<string>();
    for (const key of keys) {
      const issue = (message: string) =>
        ctx.addIssue({ code: 'custom', path: [key], message });
      if (key.length > 64 || !tokenNamePattern.test(key)) {
        issue(
          `Nom invalide : ${key}. Attendu : famille (color, space, radius, font) puis mots ou numéros séparés par des points.`,
        );
        continue;
      }
      const type = tokens[key].$type;
      if (!familyTypes[key.split('.')[0]].includes(type))
        issue(`${key} : le type ${type} ne correspond pas à sa famille.`);
      if (isBaseToken(key) && baseTokenTypes[key] !== type)
        issue(
          `${key} est lu par les composants : type ${baseTokenTypes[key]} requis.`,
        );
      // Les variables CSS distinguent la casse, pas les personnes qui les lisent.
      if (seen.has(key.toLowerCase()))
        issue(`${key} existe déjà avec une autre casse.`);
      seen.add(key.toLowerCase());
    }
  });
export type Tokens = Record<TokenKey, Token>;

const changeValue = z.union([z.string().max(100), z.number().finite()]);
// Modifier : {key, value} · ajouter : {key, add} · supprimer : {key, remove: true}.
export const changeSchema = z.union([
  z.object({ key: tokenName, value: changeValue }).strict(),
  z.object({ key: tokenName, add: tokenSchema }).strict(),
  z.object({ key: tokenName, remove: z.literal(true) }).strict(),
]);
export type Change = z.infer<typeof changeSchema>;
export const proposeSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    changes: z.array(changeSchema).min(1).max(200),
  })
  .strict();
// before null : ajout · after null : suppression.
export interface Patch {
  key: TokenKey;
  before: Token | null;
  after: Token | null;
}
export interface Revision {
  id: string;
  revision: number;
  date: string;
  source: 'manual' | 'codex' | 'import' | 'undo';
  patches: Patch[];
}
export interface State {
  version: 2;
  revision: number;
  tokens: Tokens;
  history: Revision[];
}
export interface Proposal {
  id: string;
  revision: number;
  source: Revision['source'];
  patches: Patch[];
}
export const patchSchema = z
  .object({
    key: tokenName,
    before: tokenSchema.nullable(),
    after: tokenSchema.nullable(),
  })
  .strict()
  .refine((p) => p.before || p.after, 'Patch vide');
const revisionFields = {
  id: z.string().uuid(),
  revision: z.number().int().positive(),
  date: z.string().datetime(),
  source: z.enum(['manual', 'codex', 'import', 'undo']),
};
export const stateSchema = z
  .object({
    version: z.literal(2),
    revision: z.number().int().nonnegative(),
    tokens: tokensSchema,
    history: z.array(
      z
        .object({ ...revisionFields, patches: z.array(patchSchema).min(1) })
        .strict(),
    ),
  })
  .strict();

// Format version 1 : 18 clés fixes, valeurs seules dans le journal. Lu uniquement
// pour migrer, jamais réécrit.
const v1Value = z.union([z.string(), z.number()]);
const stateV1Schema = z
  .object({
    version: z.literal(1),
    revision: z.number().int().nonnegative(),
    tokens: z
      .object(
        Object.fromEntries(
          baseTokenKeys.map((key) => [key, tokenSchema]),
        ) as Record<BaseTokenKey, typeof tokenSchema>,
      )
      .strict(),
    history: z.array(
      z
        .object({
          ...revisionFields,
          patches: z
            .array(
              z
                .object({
                  key: z.enum(baseTokenKeys),
                  before: v1Value,
                  after: v1Value,
                })
                .strict(),
            )
            .min(1),
        })
        .strict(),
    ),
  })
  .strict();
// Traduction sans perte : chaque valeur du journal reçoit le type fixe de sa clé.
export function migrateState(input: unknown): {
  state: State;
  from: 1 | 2;
} {
  if ((input as { version?: unknown })?.version !== 1)
    return { state: stateSchema.parse(input) as State, from: 2 };
  const v1 = stateV1Schema.parse(input);
  const typed = (key: BaseTokenKey, value: TokenValue) =>
    tokenSchema.parse({ $type: baseTokenTypes[key], $value: value });
  return {
    from: 1,
    state: stateSchema.parse({
      version: 2,
      revision: v1.revision,
      tokens: v1.tokens,
      history: v1.history.map((r) => ({
        ...r,
        patches: r.patches.map((p) => ({
          key: p.key,
          before: typed(p.key, p.before),
          after: typed(p.key, p.after),
        })),
      })),
    }) as State,
  };
}

export const agentReplySchema = z
  .object({
    message: z.string().max(12000),
    // L'agent modifie des tokens existants ; il n'en crée ni n'en supprime.
    changes: z
      .array(z.object({ key: tokenName, value: changeValue }).strict())
      .max(20),
  })
  .strict();
export type AgentReply = z.infer<typeof agentReplySchema>;

export const sameToken = (a: Token | null, b: Token | null) =>
  a === b || (!!a && !!b && a.$type === b.$type && a.$value === b.$value);
export function applyChanges(tokens: Tokens, changes: Change[]): Tokens {
  const next = structuredClone(tokens);
  if (new Set(changes.map((c) => c.key)).size !== changes.length)
    throw new Error('Un token ne peut apparaître deux fois.');
  for (const change of changes) {
    const exists = Object.hasOwn(next, change.key);
    if ('add' in change) {
      if (exists) throw new Error(`${change.key} existe déjà.`);
      next[change.key] = change.add;
    } else if (!exists) throw new Error(`Token inconnu : ${change.key}.`);
    else if ('remove' in change) delete next[change.key];
    else
      next[change.key] = {
        ...next[change.key],
        $value: change.value,
      } as Token;
  }
  return tokensSchema.parse(next) as Tokens;
}
// Rejoue des patches vers leur état « after » (ou « before » pour revenir en arrière).
export function applyPatches(
  tokens: Tokens,
  patches: Patch[],
  side: 'after' | 'before' = 'after',
): Tokens {
  const next = structuredClone(tokens);
  for (const p of patches) {
    const token = p[side];
    if (token) next[p.key] = token;
    else delete next[p.key];
  }
  return tokensSchema.parse(next) as Tokens;
}
export function diff(before: Tokens, after: Tokens): Patch[] {
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
  return keys
    .map((key) => ({
      key,
      before: before[key] ?? null,
      after: after[key] ?? null,
    }))
    .filter((p) => !sameToken(p.before, p.after));
}
const genericFonts = new Set([
  'system-ui',
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
]);
// Une police absente de la machine retombe sur la police système.
export const fontStack = (name: string) =>
  genericFonts.has(name) ? name : `"${name}", system-ui, sans-serif`;
// Valeur lue par les composants, ou la valeur par défaut visible si le token manque.
export function resolvedValue(tokens: Tokens, key: BaseTokenKey): TokenValue {
  return tokens[key]?.$value ?? fallbackValues[baseTokenTypes[key]];
}
export function tokenCss(tokens: Tokens): Record<string, string> {
  const all: Tokens = Object.fromEntries(
    baseTokenKeys.map((key) => [
      key,
      { $type: baseTokenTypes[key], $value: resolvedValue(tokens, key) },
    ]),
  ) as Tokens;
  Object.assign(all, tokens);
  return Object.fromEntries(
    Object.entries(all).map(([key, t]) => [
      `--${key.replaceAll('.', '-')}`,
      t.$type === 'dimension'
        ? `${t.$value}px`
        : t.$type === 'fontFamily'
          ? fontStack(t.$value)
          : t.$value,
    ]),
  );
}
export function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const rgb = hex
      .slice(1)
      .match(/../g)!
      .map((x) => parseInt(x, 16) / 255)
      .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  };
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
