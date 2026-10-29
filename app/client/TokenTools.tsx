import { useState } from 'react';
import {
  baseTokenTypes,
  fallbackValues,
  isBaseToken,
  maxTokens,
  tokenNamePattern,
  type Change,
  type Patch,
  type Token,
  type Tokens,
  type TokenType,
} from '../shared/model.js';
import { tokenUsage } from './tokenUsage.js';

export const fontSuggestions = [
  'system-ui',
  'Arial',
  'Georgia',
  'Verdana',
  'Helvetica',
  'Times New Roman',
  'Trebuchet MS',
  'Courier New',
];
// Une police absente garde la largeur de la police de repli : on compare les deux.
export function fontInstalled(name: string) {
  if (['system-ui', 'serif', 'sans-serif', 'monospace'].includes(name))
    return true;
  const context = document.createElement('canvas').getContext('2d');
  if (!context) return true;
  const sample = 'mmmmmmmmmmlli1WQ@#';
  return ['monospace', 'serif'].some((base) => {
    context.font = `72px ${base}`;
    const width = context.measureText(sample).width;
    context.font = `72px "${name}", ${base}`;
    return context.measureText(sample).width !== width;
  });
}
export function FontHint({ name }: { name: string }) {
  if (!name.trim()) return null;
  return (
    <p className="token-hint" role="status">
      {fontInstalled(name)
        ? 'Police trouvée sur cet ordinateur.'
        : 'Police introuvable sur cet ordinateur : les composants utiliseront la police système. Installez-la sur chaque poste qui ouvre l’atelier.'}
    </p>
  );
}

const kinds: {
  label: string;
  prefix: string;
  type: TokenType;
  example: string;
  initial: string;
}[] = [
  {
    label: 'Couleur',
    prefix: 'color.',
    type: 'color',
    example: 'rouge.500',
    initial: '#E2001A',
  },
  {
    label: 'Police',
    prefix: 'font.',
    type: 'fontFamily',
    example: 'titre',
    initial: '',
  },
  {
    label: 'Taille de texte',
    prefix: 'font.',
    type: 'dimension',
    example: 'legende',
    initial: '14',
  },
  {
    label: 'Espacement',
    prefix: 'space.',
    type: 'dimension',
    example: 'xl',
    initial: '32',
  },
  {
    label: 'Rayon',
    prefix: 'radius.',
    type: 'dimension',
    example: 'carte',
    initial: '12',
  },
];

export function AddTokenForm({
  tokens,
  disabled,
  onPropose,
}: {
  tokens: Tokens;
  disabled: boolean;
  onPropose: (changes: Change[]) => Promise<void>;
}) {
  const [kindIndex, setKindIndex] = useState(0);
  const [suffix, setSuffix] = useState('');
  const [value, setValue] = useState(kinds[0].initial);
  const kind = kinds[kindIndex];
  const name = kind.prefix + suffix.trim();
  const taken = Object.keys(tokens).some(
    (k) => k.toLowerCase() === name.toLowerCase(),
  );
  const problem = !suffix.trim()
    ? ''
    : !tokenNamePattern.test(name) || name.length > 64
      ? 'Mots en minuscules (une majuscule interne est permise, ex. brandHover) ou numéros, séparés par des points. Pas d’accents, d’espaces ni de tirets.'
      : taken
        ? 'Ce nom existe déjà.'
        : isBaseToken(name) && baseTokenTypes[name] !== kind.type
          ? 'Ce nom est réservé à un token de base d’un autre type.'
          : Object.keys(tokens).length >= maxTokens
            ? `${maxTokens} tokens au maximum.`
            : '';
  return (
    <div className="token-editor add-token">
      <div className="editor-title">
        <h3>Ajouter un token</h3>
        <span>Via le diff</span>
      </div>
      <form
        className="token-form"
        onSubmit={(e) => {
          e.preventDefault();
          void onPropose([
            {
              key: name,
              add: {
                $type: kind.type,
                $value: kind.type === 'dimension' ? Number(value) : value,
              } as Token,
            },
          ]);
        }}
      >
        <label className="field">
          Type
          <select
            value={kindIndex}
            onChange={(e) => {
              const next = Number(e.target.value);
              setKindIndex(next);
              setValue(kinds[next].initial);
            }}
          >
            {kinds.map((k, i) => (
              <option key={k.label} value={i}>
                {k.label} · {k.prefix}…
              </option>
            ))}
          </select>
        </label>
        <div className="field">
          <label htmlFor="new-token-name">Nom</label>
          <div className="value-control name-control">
            <code aria-hidden="true">{kind.prefix}</code>
            <input
              id="new-token-name"
              aria-describedby="new-token-help"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              placeholder={kind.example}
              maxLength={64 - kind.prefix.length}
              required
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="new-token-value">Valeur</label>
          <div className="value-control">
            {kind.type === 'color' && (
              <input
                aria-label="Sélecteur de couleur du nouveau token"
                type="color"
                value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000'}
                onChange={(e) => setValue(e.target.value)}
              />
            )}
            <input
              id="new-token-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
              list={kind.type === 'fontFamily' ? 'font-suggestions' : undefined}
              type={kind.type === 'dimension' ? 'number' : 'text'}
              min={kind.type === 'dimension' ? 0 : undefined}
              max={kind.type === 'dimension' ? 128 : undefined}
              step={kind.type === 'dimension' ? 'any' : undefined}
              maxLength={64}
              placeholder={
                kind.type === 'fontFamily' ? 'Nom de la police' : undefined
              }
            />
          </div>
        </div>
        <button
          className="studio-primary"
          disabled={disabled || !suffix.trim() || !!problem || !value.trim()}
        >
          Proposer l’ajout
        </button>
      </form>
      <p className="token-hint" id="new-token-help">
        {problem ? (
          <span className="error">{problem}</span>
        ) : (
          <>
            Nom complet : <code>{suffix.trim() ? name : '—'}</code>.{' '}
            {kind.type === 'color'
              ? '#RRGGBB · '
              : kind.type === 'dimension'
                ? 'Pixels, de 0 à 128 · '
                : ''}
            Aucun composant ne l’utilise encore.
          </>
        )}
      </p>
      {kind.type === 'fontFamily' && <FontHint name={value} />}
      <datalist id="font-suggestions">
        {fontSuggestions.map((f) => (
          <option key={f} value={f} />
        ))}
      </datalist>
    </div>
  );
}

// Avertit avant validation : composants touchés et valeur par défaut affichée.
export function RemovalWarning({ patches }: { patches: Patch[] }) {
  const removed = patches.filter((p) => !p.after);
  if (!removed.length) return null;
  return (
    <div className="removal-warning" role="note">
      <h3>Suppression</h3>
      <ul>
        {removed.map((p) =>
          isBaseToken(p.key) ? (
            <li key={p.key}>
              <code>{p.key}</code> est utilisé par :{' '}
              {tokenUsage[p.key].join(', ')}. Ils prendront la valeur par défaut{' '}
              {baseTokenTypes[p.key] === 'color' && (
                <span
                  className="diff-swatch"
                  style={{ background: fallbackValues.color }}
                  aria-hidden="true"
                />
              )}
              <strong>
                {baseTokenTypes[p.key] === 'color'
                  ? `${fallbackValues.color} (fuchsia)`
                  : baseTokenTypes[p.key] === 'dimension'
                    ? '0 px'
                    : `${fallbackValues.fontFamily} (police système)`}
              </strong>{' '}
              jusqu’à ce que vous le recréiez ou annuliez la révision.
            </li>
          ) : (
            <li key={p.key}>
              <code>{p.key}</code> n’est utilisé par aucun composant.
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
