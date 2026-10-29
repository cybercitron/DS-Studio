import { useState } from 'react';
import {
  Catalogue,
  ComponentPreview,
  type ComponentId,
  type PreviewProps,
} from './DesignSystem.js';
import { componentDocs } from './componentDocs.js';
import Icon from './Icon.js';
import type { Tokens } from '../shared/model.js';

const defaults = (id: ComponentId): PreviewProps =>
  Object.fromEntries(componentDocs[id].props.map((p) => [p.name, p.default]));

// Page d'un composant dans l'onglet Design : sections à lire de haut en bas.
export default function ComponentPage({
  tokens,
  id,
}: {
  tokens: Tokens;
  id: ComponentId;
}) {
  const doc = componentDocs[id];
  const [props, setProps] = useState<PreviewProps>(() => defaults(id));
  const [dark, setDark] = useState(false);
  const set = (name: string, value: string | boolean) =>
    setProps((current) => ({ ...current, [name]: value }));
  return (
    <article className="component-page">
      <section aria-labelledby="section-preview">
        <h4 id="section-preview">Aperçu</h4>
        <div className="playground">
          <div
            className="playground-stage"
            data-theme={dark ? 'dark' : 'light'}
          >
            <button
              type="button"
              role="switch"
              className="theme-switch"
              aria-checked={dark}
              aria-label="Fond sombre"
              title={dark ? 'Revenir au fond clair' : 'Passer au fond sombre'}
              onClick={() => setDark(!dark)}
            >
              <Icon name="sun" />
              <Icon name="moon" />
              <span className="theme-thumb" aria-hidden="true" />
            </button>
            <ComponentPreview tokens={tokens} id={id} props={props} />
          </div>
          {doc.props.length > 0 ? (
            <form
              className="playground-controls"
              aria-label="Réglages de l’aperçu"
              onSubmit={(e) => e.preventDefault()}
            >
              {doc.props.map((p) =>
                p.type === 'boolean' ? (
                  <label key={p.name} className="playground-check">
                    <input
                      type="checkbox"
                      checked={props[p.name] === true}
                      onChange={(e) => set(p.name, e.target.checked)}
                    />
                    <code>{p.name}</code>
                  </label>
                ) : (
                  <label key={p.name} className="field">
                    <code>{p.name}</code>
                    {p.type === 'enum' ? (
                      <select
                        value={String(props[p.name])}
                        onChange={(e) => set(p.name, e.target.value)}
                      >
                        {p.options?.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={String(props[p.name])}
                        maxLength={120}
                        onChange={(e) => set(p.name, e.target.value)}
                      />
                    )}
                  </label>
                ),
              )}
              <button type="button" onClick={() => setProps(defaults(id))}>
                Réinitialiser
              </button>
            </form>
          ) : (
            <p className="playground-empty">
              Aucune propriété réglable pour l’instant. Le composant reste
              interactif dans l’aperçu.
            </p>
          )}
        </div>
        <p className="playground-note">
          Réglages pour essayer : ils ne sont pas enregistrés et ne modifient
          pas le Design System. Le fond sombre change seulement l’arrière-plan :
          le DS n’a pas encore de tokens de thème sombre.
        </p>
      </section>
      <section aria-labelledby="section-anatomy">
        <h4 id="section-anatomy">Anatomie</h4>
        <ol className="anatomy-list">
          {doc.anatomy.map((a) => (
            <li key={a.part}>
              <strong>{a.part}</strong>
              <span>{a.tokens}</span>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="section-props">
        <h4 id="section-props">Propriétés</h4>
        {doc.props.length > 0 ? (
          <div className="props-scroll">
            <table className="props-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Défaut</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((p) => (
                  <tr key={p.name}>
                    <th>
                      <code>{p.name}</code>
                    </th>
                    <td>
                      <code>
                        {p.type === 'enum'
                          ? p.options?.join(' | ')
                          : p.type === 'boolean'
                            ? 'booléen'
                            : 'texte'}
                      </code>
                    </td>
                    <td>
                      <code>{String(p.default)}</code>
                    </td>
                    <td>{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Ce composant n’expose pas encore de propriété.</p>
        )}
      </section>
      <section aria-labelledby="section-variants">
        <h4 id="section-variants">Variantes et états</h4>
        <Catalogue tokens={tokens} only={id} />
      </section>
    </article>
  );
}
