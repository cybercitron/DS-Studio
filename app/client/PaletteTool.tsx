import { useMemo, useState } from 'react';
import {
  MAX_SHADES,
  MIN_SHADES,
  defaultRules,
  generatePalette,
  hueFamily,
  hueStep,
  paletteAdditions,
  paletteSlug,
  paletteTokens,
  shadeNames,
  validatePalette,
  type PaletteRule,
} from '../shared/palette.js';
import type { Change, Tokens } from '../shared/model.js';
import { figmaFileName, figmaVariablesFile } from '../shared/figmaVariables.js';
import { downloadText } from './api.js';
import Icon from './Icon.js';

const HEX = /^#[0-9a-fA-F]{6}$/;
const ratio = (n: number) => `${n.toFixed(2).replace('.', ',')}:1`;

// Générateur de palettes accessibles : la palette s'exporte en JSON ou s'ajoute
// comme tokens primitives, via le même diff que les autres ajouts. Rien n'est
// écrit dans le DS sans validation.
export function PaletteTool({
  initial,
  tokens,
  disabled,
  onPropose,
}: {
  initial: string;
  tokens: Tokens;
  disabled: boolean;
  onPropose: (changes: Change[]) => Promise<void>;
}) {
  const [base, setBase] = useState(initial.toUpperCase());
  const [baseDraft, setBaseDraft] = useState(initial.toUpperCase());
  const [name, setName] = useState('Ma palette');
  const [count, setCount] = useState(10);
  const [rules, setRules] = useState<PaletteRule[]>(() => defaultRules(10));
  const [hueShift, setHueShift] = useState(12);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string>();
  const [editDraft, setEditDraft] = useState('');
  const names = shadeNames(count);
  const family = hueFamily(base);
  // Une règle en cours de saisie (ratio vide, même nuance) est ignorée sans
  // masquer le reste de l'outil.
  const usable = rules.map(
    (r) => r.shade !== r.against && r.min >= 1 && r.min <= 21,
  );
  const options = {
    base,
    count,
    rules: rules.filter((_, i) => usable[i]),
    hueShift,
    overrides,
  };
  const errors = validatePalette(options);
  const palette = useMemo(
    () => (errors.length ? undefined : generatePalette(options)),
    [JSON.stringify(options)],
  );
  const results = rules.map((_, i) =>
    usable[i]
      ? palette?.rules[usable.slice(0, i).filter(Boolean).length]
      : undefined,
  );
  const additions = palette && paletteAdditions(name, palette.shades, tokens);
  const hexOf = (n: string) =>
    palette?.shades.find((s) => s.name === n)?.hex ?? '#FFFFFF';

  function changeBase(value: string) {
    setBaseDraft(value);
    if (HEX.test(value)) {
      setBase(value.toUpperCase());
      setOverrides({});
    }
  }
  function changeCount(next: number) {
    if (!Number.isInteger(next) || next < MIN_SHADES || next > MAX_SHADES)
      return;
    setCount(next);
    setRules(defaultRules(next));
    setOverrides({});
    setEditing(undefined);
  }
  function updateRule(i: number, patch: Partial<PaletteRule>) {
    setRules(rules.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  }
  function setOverride(shade: string, value: string | undefined) {
    const next = { ...overrides };
    if (value === undefined) delete next[shade];
    else next[shade] = value.toUpperCase();
    setOverrides(next);
  }

  return (
    <div className="palette-tool">
      <form className="palette-settings" onSubmit={(e) => e.preventDefault()}>
        <label>
          Nom de la palette
          <input
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />
          <span className="token-hint">
            Tokens créés : color.{paletteSlug(name)}.{names[0]} à .
            {names[count - 1]}
          </span>
        </label>
        <label>
          Couleur de départ
          <span className="value-control">
            <input
              type="color"
              aria-label="Sélecteur de la couleur de départ"
              value={base.toLowerCase()}
              onChange={(e) => changeBase(e.target.value)}
            />
            <input
              aria-label="Couleur de départ en hexadécimal"
              value={baseDraft}
              maxLength={7}
              aria-invalid={!HEX.test(baseDraft)}
              onChange={(e) => changeBase(e.target.value.trim())}
            />
          </span>
          <span className="token-hint">
            Gardée intacte, au {names[Math.floor(count / 2)]}.
          </span>
        </label>
        <label>
          Nombre de nuances
          <input
            type="number"
            min={MIN_SHADES}
            max={MAX_SHADES}
            value={count}
            onChange={(e) => changeCount(Number(e.target.value))}
          />
          <span className="token-hint">
            De {MIN_SHADES} à {MAX_SHADES}.
          </span>
        </label>
        <label>
          Décalage de teinte
          <input
            type="range"
            min={0}
            max={30}
            value={hueShift}
            onChange={(e) => setHueShift(Number(e.target.value))}
          />
          <span className="token-hint">
            {family
              ? `Famille ${family.name.toLowerCase()} : en clair → ${family.lightName}, en foncé → ${family.darkName}.`
              : 'Couleur neutre : pas de décalage de teinte.'}{' '}
            Pas :{' '}
            {[1, 2, 3]
              .map((k) => `${Math.round(hueStep(k, hueShift))}°`)
              .join(', ')}
            .
          </span>
        </label>
      </form>
      {errors.length > 0 && (
        <p className="palette-error" role="alert">
          {errors.join(' ')}
        </p>
      )}

      {palette && (
        <>
          <ol
            className="palette-scale"
            aria-label="Nuances de la palette"
            style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
          >
            {palette.shades.map((s) => (
              <li key={s.name}>
                <button
                  className="palette-swatch"
                  style={{ background: s.hex }}
                  aria-label={`Nuance ${s.name}, ${s.hex}${s.fixed === 'base' ? ', couleur de départ' : s.fixed === 'override' ? ', retouchée' : ''}. Retoucher`}
                  aria-pressed={editing === s.name}
                  onClick={() => {
                    setEditing(editing === s.name ? undefined : s.name);
                    setEditDraft(s.hex);
                  }}
                />
                <strong>{s.name}</strong>
                <code>{s.hex}</code>
                {s.fixed === 'base' && (
                  <span className="palette-tag">départ</span>
                )}
                {s.fixed === 'override' && (
                  <span className="palette-tag">retouchée</span>
                )}
              </li>
            ))}
          </ol>
          {editing && (
            <div
              className="palette-edit"
              role="group"
              aria-label={`Retouche ${editing}`}
            >
              {editing === names[Math.floor(count / 2)] ? (
                <p className="token-hint">
                  La {editing} est la couleur de départ : modifiez-la en haut.
                </p>
              ) : (
                <>
                  <span>Retoucher la {editing}</span>
                  <span className="value-control">
                    <input
                      type="color"
                      aria-label={`Sélecteur de la nuance ${editing}`}
                      value={hexOf(editing).toLowerCase()}
                      onChange={(e) => {
                        setEditDraft(e.target.value.toUpperCase());
                        setOverride(editing, e.target.value);
                      }}
                    />
                    <input
                      aria-label={`Nuance ${editing} en hexadécimal`}
                      value={editDraft}
                      maxLength={7}
                      aria-invalid={!HEX.test(editDraft)}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        setEditDraft(value);
                        if (HEX.test(value)) setOverride(editing, value);
                      }}
                    />
                  </span>
                  {overrides[editing] && (
                    <button
                      type="button"
                      onClick={() => {
                        setOverride(editing, undefined);
                        setEditing(undefined);
                      }}
                    >
                      Revenir au calcul automatique
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          <section
            className="palette-rules"
            aria-labelledby="palette-rules-title"
          >
            <div className="palette-rules-head">
              <h4 id="palette-rules-title">Règles de contraste</h4>
              <button
                type="button"
                onClick={() => setRules(defaultRules(count))}
              >
                Règles par défaut
              </button>
            </div>
            <p className="token-hint">
              Repères : 4,5:1 texte courant · 3:1 grand texte et éléments non
              textuels · 7:1 niveau AAA.
            </p>
            <ul>
              {rules.map((r, i) => {
                const result = results[i];
                // Une nuance retouchée à la main explique l'écart avant la
                // couleur de départ.
                const retouched = [r.shade, r.against].some(
                  (n) => !!overrides[n],
                );
                const impossible =
                  !!result && !result.ok && !retouched && result.best < r.min;
                return (
                  <li key={i} data-ok={result?.ok ?? false}>
                    <span
                      className="palette-sample"
                      style={{
                        color: hexOf(r.shade),
                        background: hexOf(r.against),
                      }}
                      aria-hidden="true"
                    >
                      Aa
                    </span>
                    <label>
                      <span className="sr-only">Nuance testée</span>
                      <select
                        value={r.shade}
                        onChange={(e) =>
                          updateRule(i, { shade: e.target.value })
                        }
                      >
                        {names.map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <span>≥</span>
                    <label>
                      <span className="sr-only">Ratio minimal</span>
                      <input
                        type="number"
                        min={1}
                        max={21}
                        step={0.5}
                        value={Number.isNaN(r.min) ? '' : r.min}
                        onChange={(e) =>
                          updateRule(i, { min: e.target.valueAsNumber })
                        }
                      />
                    </label>
                    <span>:1 sur</span>
                    <label>
                      <span className="sr-only">Nuance de fond</span>
                      <select
                        value={r.against}
                        onChange={(e) =>
                          updateRule(i, { against: e.target.value })
                        }
                      >
                        {names.map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                    </label>
                    <span className="palette-result">
                      {!result ? (
                        <>
                          Règle incomplète : deux nuances différentes, ratio de
                          1 à 21.
                        </>
                      ) : result.ok ? (
                        <>
                          <Icon name="check" /> {ratio(result.ratio)}
                        </>
                      ) : impossible ? (
                        <>
                          ⚠ {ratio(result.ratio)} · impossible avec la couleur
                          de départ (au mieux {ratio(result.best)})
                        </>
                      ) : (
                        <>
                          ⚠ {ratio(result.ratio)} · sous le seuil à cause d’une
                          nuance retouchée
                        </>
                      )}
                    </span>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Supprimer la règle ${r.shade} sur ${r.against}`}
                      title="Supprimer la règle"
                      onClick={() => setRules(rules.filter((_, k) => k !== i))}
                    >
                      <Icon name="close" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() =>
                setRules([
                  ...rules,
                  { shade: names[count - 1], against: names[0], min: 4.5 },
                ])
              }
            >
              <Icon name="plus" /> Ajouter une règle
            </button>
          </section>

          <div className="palette-actions">
            <button
              type="button"
              className="studio-primary"
              aria-describedby="palette-add-help"
              disabled={disabled || !!additions?.problem}
              onClick={() => additions && void onPropose(additions.changes)}
            >
              Ajouter comme tokens primitives
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(
                  `palette-${paletteSlug(name)}.tokens.json`,
                  JSON.stringify(paletteTokens(name, palette.shades), null, 2) +
                    '\n',
                  'application/json',
                )
              }
            >
              Exporter la palette (JSON)
            </button>
            <button
              type="button"
              onClick={() =>
                downloadText(
                  figmaFileName(paletteSlug(name)),
                  JSON.stringify(
                    figmaVariablesFile(
                      Object.fromEntries(
                        Object.entries(paletteTokens(name, palette.shades)).map(
                          ([k, t]) => [k, t.$value],
                        ),
                      ),
                    ),
                    null,
                    2,
                  ) + '\n',
                  'application/json',
                )
              }
            >
              Exporter pour Figma
            </button>
          </div>
          <p className="token-hint" id="palette-add-help">
            {additions?.problem ? (
              <span className="error" role="alert">
                {additions.problem}
              </span>
            ) : (
              <>
                Ajout de {count} tokens <code>color.{paletteSlug(name)}.…</code>{' '}
                : vous relirez le diff avant tout enregistrement. Les exports
                téléchargent un fichier sans modifier le Design System ; «
                Exporter pour Figma » se lit avec le plugin DS-Studio dans
                Figma.
              </>
            )}
          </p>
        </>
      )}
    </div>
  );
}
