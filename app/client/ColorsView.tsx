import { useState, type KeyboardEvent } from 'react';
import {
  isPrimitive,
  primitivePalettes,
  semanticColors,
  type SemanticGroupId,
} from '../shared/colors.js';
import { isBaseToken, type TokenKey, type Tokens } from '../shared/model.js';
import Icon from './Icon.js';
import { tokenUsage } from './tokenUsage.js';

type Tab = 'primitives' | 'semantic';
const tabs: { id: Tab; label: string }[] = [
  { id: 'primitives', label: 'Primitives' },
  { id: 'semantic', label: 'Semantic' },
];

// Page Couleurs (décision du 29/10) : « quelle couleur » d'un côté, « à quoi
// elle sert » de l'autre. Un clic sur un token ouvre le panneau Modifier.
export function ColorsView({
  tokens,
  selected,
  onSelect,
  onCreatePalette,
}: {
  tokens: Tokens;
  selected: TokenKey;
  onSelect: (key: TokenKey) => void;
  onCreatePalette: () => void;
}) {
  // Ouvert sur l'onglet du token choisi (depuis la recherche, par exemple).
  const [tab, setTab] = useState<Tab>(() =>
    isPrimitive(selected) ? 'primitives' : 'semantic',
  );
  const [closed, setClosed] = useState<SemanticGroupId[]>([]);
  const palettes = primitivePalettes(tokens);
  const groups = semanticColors(tokens);

  // Onglets au clavier : flèches gauche et droite, Début et Fin.
  function onTabKey(e: KeyboardEvent) {
    const i = tabs.findIndex((t) => t.id === tab);
    const next =
      e.key === 'ArrowRight'
        ? (i + 1) % tabs.length
        : e.key === 'ArrowLeft'
          ? (i + tabs.length - 1) % tabs.length
          : e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? tabs.length - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    setTab(tabs[next].id);
    document.getElementById(`colors-tab-${tabs[next].id}`)?.focus();
  }

  return (
    <div className="colors-view">
      <div
        className="colors-tabs"
        role="tablist"
        aria-label="Types de couleurs"
        onKeyDown={onTabKey}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`colors-tab-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`colors-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="nav-count">
              {t.id === 'primitives'
                ? palettes.reduce((n, p) => n + p.keys.length, 0)
                : groups.reduce((n, g) => n + g.keys.length, 0)}
            </span>
          </button>
        ))}
      </div>

      <div
        id="colors-panel-primitives"
        role="tabpanel"
        aria-labelledby="colors-tab-primitives"
        hidden={tab !== 'primitives'}
      >
        {palettes.length ? (
          <div className="primitive-list">
            {palettes.map((p) => (
              <section
                key={p.name}
                className="primitive-palette"
                aria-label={`Palette ${p.name}`}
              >
                <h4>
                  {p.name.slice('color.'.length)} <code>{p.name}</code>
                </h4>
                <ol
                  className="primitive-scale"
                  style={{
                    gridTemplateColumns: `repeat(${p.keys.length}, minmax(0, 1fr))`,
                  }}
                >
                  {p.keys.map((k) => (
                    <li key={k}>
                      <button
                        className="primitive-swatch"
                        aria-label={`Sélectionner ${k}`}
                        aria-pressed={selected === k}
                        onClick={() => onSelect(k)}
                      >
                        <span
                          className="sample-color"
                          style={{ background: String(tokens[k].$value) }}
                          aria-hidden="true"
                        />
                        <strong>{k.slice(p.name.length + 1)}</strong>
                        <code>{tokens[k].$value}</code>
                      </button>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            <button type="button" onClick={onCreatePalette}>
              <Icon name="palette" /> Créer une palette
            </button>
          </div>
        ) : (
          <div className="colors-empty">
            <Icon name="palette" />
            <h4>Aucune palette pour l’instant</h4>
            <p>
              Les primitives sont les couleurs brutes, numérotées de 050 à 900.
              Créez-en une avec le générateur de palettes accessibles.
            </p>
            <button
              type="button"
              className="studio-primary"
              onClick={onCreatePalette}
            >
              Créer une palette
            </button>
          </div>
        )}
      </div>

      <div
        id="colors-panel-semantic"
        role="tabpanel"
        aria-labelledby="colors-tab-semantic"
        hidden={tab !== 'semantic'}
      >
        {groups.map((g) => {
          const open = !closed.includes(g.id);
          return (
            <section key={g.id} className="semantic-group" data-open={open}>
              <h4>
                <button
                  className="semantic-toggle"
                  aria-expanded={open}
                  aria-controls={`semantic-${g.id}`}
                  onClick={() =>
                    setClosed(
                      open
                        ? [...closed, g.id]
                        : closed.filter((id) => id !== g.id),
                    )
                  }
                >
                  <Icon name="chevron" />
                  {g.label}
                  <span className="nav-count">{g.keys.length}</span>
                </button>
              </h4>
              <div
                id={`semantic-${g.id}`}
                className="family-view"
                hidden={!open}
              >
                {g.keys.map((k) => (
                  <button
                    key={k}
                    className="family-row"
                    aria-label={`Sélectionner ${k}`}
                    aria-pressed={selected === k}
                    onClick={() => onSelect(k)}
                  >
                    <span className="family-sample" aria-hidden="true">
                      <span
                        className="sample-color"
                        style={{ background: String(tokens[k].$value) }}
                      />
                    </span>
                    <span className="family-name">
                      <strong>{k.slice('color.'.length)}</strong>
                      <code>{k}</code>
                    </span>
                    <span className="semantic-usage">
                      {isBaseToken(k)
                        ? tokenUsage[k].join(', ')
                        : 'Aucun composant'}
                    </span>
                    <code className="family-value">{tokens[k].$value}</code>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!groups.length && (
          <p className="colors-empty">Aucune couleur sémantique.</p>
        )}
      </div>
    </div>
  );
}
