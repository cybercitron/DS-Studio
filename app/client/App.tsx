import { useEffect, useRef, useState } from 'react';
import { Button, DSProvider, Catalogue, Scenario } from './DesignSystem.js';
import Icon from './Icon.js';
import ProjectBrief from './ProjectBrief.js';
import { useTokenDraft } from './useTokenDraft.js';
import {
  bootstrap,
  commit,
  exportTokens,
  getState,
  request,
  type Bootstrap,
} from './api.js';
import {
  applyChanges,
  contrast,
  tokenKeys,
  type Proposal,
  type State,
  type TokenKey,
} from '../shared/model.js';

const devices = [
  { label: 'Compact · 320', width: 320 },
  { label: 'Standard · 375', width: 375 },
  { label: 'Grand · 430', width: 430 },
  { label: 'Desktop · 1024', width: 1024 },
];
function useDesignState() {
  const [state, setState] = useState<State>();
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    let inFlight = false;
    const refresh = async () => {
      if (inFlight || !live) return;
      inFlight = true;
      try {
        const s = await getState();
        if (live) {
          setState((current) =>
            !current || s.revision >= current.revision ? s : current,
          );
          setError('');
        }
      } catch (e) {
        if (live) setError((e as Error).message);
      } finally {
        inFlight = false;
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 1200);
    const channel = new BroadcastChannel('ds-studio');
    channel.onmessage = refresh;
    return () => {
      live = false;
      clearInterval(timer);
      channel.close();
    };
  }, []);
  return { state, setState, error };
}
function announceChange() {
  const c = new BroadcastChannel('ds-studio');
  c.postMessage('updated');
  c.close();
}
export function Preview() {
  const { state, error } = useDesignState();
  const scenario =
    new URLSearchParams(location.search).get('scenario') ?? 'cards';
  return state ? (
    <Scenario tokens={state.tokens} scenario={scenario} />
  ) : (
    <p role="alert">{error || 'Chargement du scénario…'}</p>
  );
}
export default function App() {
  const { state, setState, error: stateError } = useDesignState();
  const [boot, setBoot] = useState<Bootstrap>();
  const [key, setKey] = useState<TokenKey>(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem('ds-studio-token-draft-v2') || 'null',
      );
      if (tokenKeys.includes(saved?.key)) return saved.key;
    } catch {
      /* Facultatif. */
    }
    return 'color.brand';
  });
  const { draft, setDraft, recovered, discard } = useTokenDraft(
    key,
    state?.tokens[key].$value,
  );
  const [search, setSearch] = useState('');
  const [agents, setAgents] = useState<Bootstrap['agents']>([]);
  const [proposal, setProposal] = useState<Proposal>();
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [device, setDevice] = useState(1);
  const [scenario, setScenario] = useState('cards');
  const [agent, setAgent] = useState('manual');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([]);
  const [thinking, setThinking] = useState(false);
  const [saving, setSaving] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('ds');
  const [canvasView, setCanvasView] = useState<'catalogue' | 'preview'>(
    'catalogue',
  );
  const [agentOpen, setAgentOpen] = useState(true);
  const [focusCanvas, setFocusCanvas] = useState(false);
  function navigatePanel(id: string) {
    setActivePanel(id);
    if (id === 'mobile') setCanvasView('preview');
    if (id === 'canvas') setCanvasView('catalogue');
    requestAnimationFrame(() =>
      document.getElementById(`${id}-title`)?.focus(),
    );
  }
  const historyDialog = useRef<HTMLDialogElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    bootstrap()
      .then(setBoot)
      .catch((e) => setError(e.message));
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    if (agent !== 'manual')
      request<Bootstrap['agents']>('agents')
        .then(setAgents)
        .catch((e) => setError(e.message));
  }, [agent]);
  useEffect(() => {
    if (historyOpen && !proposal) historyDialog.current?.showModal();
    else historyDialog.current?.close();
  }, [historyOpen, proposal]);
  const current = state?.tokens[key].$value;

  useEffect(() => {
    if (proposal) {
      dialog.current?.showModal();
      cancelButton.current?.focus();
    } else dialog.current?.close();
  }, [proposal]);
  const clearError = () => {
    setError('');
    setNotice('');
  };
  async function perform(action: () => Promise<void>) {
    clearError();
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function proposeToken() {
    if (!state) return;
    await perform(async () => {
      const token = state.tokens[key];
      const value = token.$type === 'dimension' ? Number(draft) : draft;
      setProposal(
        await request<Proposal>('proposals', {
          revision: state.revision,
          changes: [{ key, value }],
        }),
      );
    });
  }
  async function accept() {
    if (!proposal) return;
    setSaving(true);
    await perform(async () => {
      const next = await commit(proposal);
      try {
        sessionStorage.removeItem('ds-studio-token-draft-v2');
      } catch {
        /* Facultatif. */
      }
      setState(next);
      setProposal(undefined);
      announceChange();
      setNotice(`Révision ${next.revision} enregistrée sur disque.`);
    });
    setSaving(false);
  }
  async function sendMessage() {
    if (!state || !message.trim() || thinking) return;
    const text = message;
    setMessage('');
    setThinking(true);
    clearError();
    const previous = chat.slice(-10);
    setChat([...chat, { role: 'user', text }]);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await request<{
        message: string;
        proposal: Proposal | null;
      }>(
        'agent',
        { agent, message: text, revision: state.revision, history: previous },
        abort.signal,
      );
      setChat((c) => [...c, { role: 'assistant', text: result.message }]);
      if (result.proposal) setProposal(result.proposal);
    } catch (e) {
      setError(
        abort.signal.aborted
          ? 'Demande interrompue. Aucun changement accepté.'
          : (e as Error).message,
      );
    } finally {
      setThinking(false);
      controller.current = null;
    }
  }
  if (!state)
    return (
      <main className="loading">
        <h1>DS-Studio</h1>
        <p role="alert">{stateError || 'Ouverture du Design System…'}</p>
        <p>Lancez le serveur local puis rechargez cette page.</p>
      </main>
    );
  const selectedAgent = agents.find((a) => a.id === agent);
  const staleProposal = !!proposal && proposal.revision !== state.revision;
  const draftContrast =
    /^#[0-9a-fA-F]{6}$/.test(draft) &&
    (key === 'color.brand' || key === 'color.onBrand')
      ? contrast(
          key === 'color.brand' ? draft : state.tokens['color.brand'].$value,
          key === 'color.onBrand'
            ? draft
            : state.tokens['color.onBrand'].$value,
        )
      : undefined;
  const matchingKeys = tokenKeys.filter((k) =>
    k.toLowerCase().includes(search.trim().toLowerCase()),
  );
  return (
    <>
      <a
        className="skip-link"
        href="#ds-title"
        onClick={() => {
          setFocusCanvas(false);
          navigatePanel('ds');
        }}
      >
        Aller aux tokens
      </a>
      <header className="studio-header">
        <div className="wordmark">
          <Icon name="layers" />
          <strong>DS-Studio</strong>
        </div>
        <span className="header-divider" aria-hidden="true" />
        <div className="project-identity">
          <h1>Lisière</h1>
          <span>Design System d’exemple</span>
        </div>
        <div className="intro-actions">
          <button
            aria-label="Exporter les tokens"
            onClick={() => void perform(exportTokens)}
          >
            Exporter
          </button>
          <label className="file-button">
            Importer
            <input
              aria-label="Importer un JSON"
              type="file"
              accept=".json,application/json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (file)
                  void perform(async () => {
                    if (file.size > 128000)
                      throw new Error(
                        'Fichier trop volumineux (128 Ko maximum).',
                      );
                    const tokens = JSON.parse(await file.text());
                    setProposal(
                      await request('import', {
                        revision: state.revision,
                        tokens,
                      }),
                    );
                  });
              }}
            />
          </label>
          <button
            className="history-trigger"
            onClick={() => setHistoryOpen(!historyOpen)}
            aria-expanded={historyOpen}
          >
            <Icon name="history" />
            <span>Historique</span>
            <span className="revision-number">{state.revision}</span>
          </button>
          <button
            className="agent-trigger"
            aria-label="Afficher ou masquer l’agent"
            aria-pressed={agentOpen}
            onClick={() => {
              setAgentOpen(!agentOpen);
              setFocusCanvas(false);
            }}
          >
            <Icon name="chat" />
            <span>Agent</span>
          </button>
        </div>
      </header>
      <div
        className="feedback"
        aria-live="polite"
        data-visible={!!(error || stateError || notice)}
      >
        {(error || stateError) && (
          <p className="error" role="alert">
            {error || stateError}
          </p>
        )}
        {notice && (
          <>
            <p className="notice" role="status">
              {notice}
            </p>
            <button
              className="icon-button"
              aria-label="Fermer le message"
              onClick={() => setNotice('')}
            >
              <Icon name="close" />
            </button>
          </>
        )}
      </div>
      <dialog
        ref={historyDialog}
        className="history"
        aria-labelledby="history-title"
        onCancel={() => setHistoryOpen(false)}
      >
        <div className="history-heading">
          <div>
            <h2 id="history-title">Historique des changements</h2>
          </div>
          <button
            onClick={() => setHistoryOpen(false)}
            aria-label="Fermer l’historique"
          >
            Fermer
          </button>
        </div>
        <p>
          Annulez un changement précis. Les autres tokens restent intacts. Une
          annulation s’enregistre elle aussi.
        </p>
        {!state.history.length && <p>Aucun changement enregistré.</p>}
        <ol>
          {[...state.history].reverse().map((event) => (
            <li key={event.id}>
              <div>
                <strong>Révision {event.revision}</strong> · {event.source} ·{' '}
                <time>{new Date(event.date).toLocaleString('fr-FR')}</time>
                <p>{event.patches.map((p) => p.key).join(', ')}</p>
              </div>
              <button
                onClick={() =>
                  void perform(async () =>
                    setProposal(
                      await request('undo', {
                        revision: state.revision,
                        id: event.id,
                      }),
                    ),
                  )
                }
              >
                Annuler la révision {event.revision}
              </button>
            </li>
          ))}
        </ol>
      </dialog>
      <nav className="panel-nav" aria-label="Panneaux de l’atelier">
        {(
          [
            ['ds', 'Tokens', 'sliders'],
            ['canvas', 'Composants', 'layers'],
            ['mobile', 'Aperçu', 'phone'],
            ['agent', 'Agent', 'chat'],
          ] as const
        ).map(([id, label, icon]) => (
          <button
            key={id}
            aria-pressed={activePanel === id}
            aria-controls={`${id}-panel`}
            onClick={() => navigatePanel(id)}
          >
            <Icon name={icon} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <main
        className="studio-grid"
        data-agent-open={agentOpen}
        data-focus={focusCanvas}
      >
        <section
          id="ds-panel"
          className="panel ds-panel"
          data-active={activePanel === 'ds'}
          aria-labelledby="ds-title"
        >
          <div className="panel-heading">
            <h2 id="ds-title" tabIndex={-1}>
              Design System
            </h2>
            <span className="count">{tokenKeys.length}</span>
          </div>
          <div className="token-browser">
            <div className="inventory-heading">
              <h3>Tokens sémantiques</h3>
            </div>
            <label className="token-search">
              <Icon name="search" />
              <span className="sr-only">Rechercher un token</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un token…"
              />
            </label>
            {search && (
              <p className="search-status" role="status">
                {matchingKeys.length} résultat(s). La sélection courante reste
                accessible.
              </p>
            )}
            <div className="token-list" aria-label="Inventaire des tokens">
              {(
                [
                  ['color.', 'Couleurs'],
                  ['font.', 'Typographie'],
                  ['space.', 'Espacements'],
                  ['radius.', 'Rayons'],
                ] as const
              ).map(([prefix, title]) => {
                const keys = matchingKeys.filter((k) => k.startsWith(prefix));
                return (
                  keys.length > 0 && (
                    <div className="token-group" key={prefix}>
                      <h4>
                        {title}
                        <span>{keys.length}</span>
                      </h4>
                      {keys.map((k) => (
                        <button
                          key={k}
                          className="token-row"
                          aria-label={`Sélectionner ${k}`}
                          aria-pressed={key === k}
                          onClick={() => setKey(k)}
                        >
                          {state.tokens[k].$type === 'color' ? (
                            <span
                              className="token-dot"
                              style={{
                                background: String(state.tokens[k].$value),
                              }}
                            />
                          ) : (
                            <span className="token-unit" aria-hidden="true">
                              {state.tokens[k].$type === 'fontFamily'
                                ? 'Aa'
                                : 'px'}
                            </span>
                          )}
                          <span className="token-name">
                            {k.slice(prefix.length)}
                          </span>
                          <code>{state.tokens[k].$value}</code>
                        </button>
                      ))}
                    </div>
                  )
                );
              })}
              {matchingKeys.length === 0 && (
                <div className="search-empty">
                  <p>Aucun token trouvé.</p>
                  <button onClick={() => setSearch('')}>
                    Effacer la recherche
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="token-editor">
            <div className="editor-title">
              <h3>Propriétés</h3>
              <span>
                {draft === String(current) ? 'Enregistré' : 'Brouillon'}
              </span>
            </div>
            <form
              className="token-form"
              onSubmit={(e) => {
                e.preventDefault();
                void proposeToken();
              }}
            >
              <label className="field">
                Token
                <select
                  value={key}
                  onChange={(e) => setKey(e.target.value as TokenKey)}
                >
                  {[...new Set([key, ...matchingKeys])].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <div className="field">
                <label htmlFor="token-value">Valeur</label>
                <div className="value-control">
                  {state.tokens[key].$type === 'color' && (
                    <input
                      aria-label="Sélecteur de couleur"
                      type="color"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(draft)
                          ? draft
                          : String(current)
                      }
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  )}
                  {state.tokens[key].$type === 'fontFamily' ? (
                    <select
                      id="token-value"
                      aria-label="Valeur du token"
                      aria-describedby="token-format"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    >
                      {['system-ui', 'Arial', 'Georgia', 'Verdana'].map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="token-value"
                      aria-label="Valeur du token"
                      aria-describedby="token-format"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      required
                      type={
                        state.tokens[key].$type === 'dimension'
                          ? 'number'
                          : 'text'
                      }
                      min={
                        state.tokens[key].$type === 'dimension' ? 0 : undefined
                      }
                      max={
                        state.tokens[key].$type === 'dimension'
                          ? 128
                          : undefined
                      }
                      step={
                        state.tokens[key].$type === 'dimension'
                          ? 'any'
                          : undefined
                      }
                      maxLength={20}
                    />
                  )}
                </div>
              </div>
              <button
                className="studio-primary"
                disabled={!boot || draft === String(current)}
              >
                Proposer
              </button>
            </form>
            {draft !== String(current) && (
              <p className="draft-status" role="status">
                {recovered
                  ? 'Brouillon récupéré dans cet onglet.'
                  : 'Brouillon non enregistré.'}{' '}
                <button type="button" onClick={discard}>
                  Abandonner le brouillon
                </button>
              </p>
            )}
            <p className="token-hint" id="token-format">
              {state.tokens[key].$type === 'color'
                ? '#RRGGBB · '
                : state.tokens[key].$type === 'dimension'
                  ? 'Pixels, de 0 à 128 · '
                  : ''}
              Enregistrement après validation.
            </p>
            <p className="contrast" aria-live="polite">
              Marque / texte sur marque :{' '}
              <strong>
                {contrast(
                  state.tokens['color.brand'].$value,
                  state.tokens['color.onBrand'].$value,
                ).toFixed(2)}
                :1
              </strong>{' '}
              ·{' '}
              {contrast(
                state.tokens['color.brand'].$value,
                state.tokens['color.onBrand'].$value,
              ) >= 4.5
                ? 'AA texte courant'
                : 'Contraste à améliorer'}
            </p>
            {draftContrast !== undefined && draft !== String(current) && (
              <p className="contrast" role="status">
                Contraste proposé :{' '}
                <strong>{draftContrast.toFixed(2)}:1</strong> ·{' '}
                {draftContrast >= 4.5
                  ? 'AA texte courant'
                  : 'Contraste à améliorer'}
                . Cette indication ne certifie pas tous les états du composant.
              </p>
            )}
          </div>
        </section>
        <section
          id="canvas-panel"
          className="panel canvas-panel"
          data-active={activePanel === 'canvas' || activePanel === 'mobile'}
          aria-labelledby="canvas-title"
        >
          <div className="canvas-toolbar">
            <h2 id="canvas-title" className="sr-only" tabIndex={-1}>
              Composants
            </h2>
            <div className="canvas-tabs" aria-label="Vue du canevas">
              <button
                aria-pressed={canvasView === 'catalogue'}
                onClick={() => {
                  setCanvasView('catalogue');
                  setActivePanel('canvas');
                }}
              >
                <Icon name="layers" />
                Composants
              </button>
              <button
                aria-pressed={canvasView === 'preview'}
                onClick={() => {
                  setCanvasView('preview');
                  setActivePanel('mobile');
                }}
              >
                <Icon name="phone" />
                Aperçu
              </button>
            </div>
            <span className="canvas-revision">Révision {state.revision}</span>
            <button
              className="icon-button focus-trigger"
              aria-label="Agrandir le canevas"
              title="Agrandir le canevas"
              aria-pressed={focusCanvas}
              onClick={() => setFocusCanvas(!focusCanvas)}
            >
              <Icon name="expand" />
            </button>
          </div>
          <div
            className="ds-scroll canvas-view"
            hidden={canvasView !== 'catalogue'}
          >
            <div className="canvas-document-heading">
              <div>
                <h3>Bibliothèque de composants</h3>
                <p>Lisière · exemple fictif</p>
              </div>
              <span>Valeurs enregistrées</span>
            </div>
            <Catalogue tokens={state.tokens} />
          </div>
          <section
            id="mobile-panel"
            className="mobile-panel canvas-view"
            hidden={canvasView !== 'preview'}
            aria-labelledby="mobile-title"
          >
            <h2 className="sr-only" id="mobile-title" tabIndex={-1}>
              Aperçu responsive
            </h2>
            <div className="preview-controls">
              <label className="field">
                Viewport
                <select
                  value={device}
                  onChange={(e) => setDevice(Number(e.target.value))}
                >
                  {devices.map((d, i) => (
                    <option key={d.width} value={i}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Scénario
                <select
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                >
                  <option value="cards">Découvrir</option>
                  <option value="form">Inscription</option>
                </select>
              </label>
              <span className="preview-scale">
                {devices[device].width} px · 1:1
              </span>
            </div>
            <div
              className="viewport-scroll"
              tabIndex={0}
              role="region"
              aria-label="Zone de prévisualisation, défilement horizontal pour les grands écrans"
            >
              <div className="viewport-label">
                <span>{device === 3 ? 'Desktop' : 'Mobile'}</span>
                <span>{devices[device].width} px · largeur réelle</span>
              </div>
              <iframe
                title="Aperçu responsive"
                src={`/?preview=1&scenario=${scenario}`}
                width={devices[device].width}
                height={760}
              />
            </div>
          </section>
        </section>
        <section
          id="agent-panel"
          className="panel agent-panel"
          data-active={activePanel === 'agent'}
          aria-labelledby="agent-title"
        >
          <div className="panel-heading">
            <h2 id="agent-title" tabIndex={-1}>
              <Icon name="chat" />
              Agent
            </h2>
            <span className="agent-state">
              {agent === 'manual' ? 'Facultatif' : 'Codex'}
            </span>
          </div>
          <div className="panel-body">
            <ProjectBrief />
            <label className="field agent-mode">
              Mode de travail
              <select value={agent} onChange={(e) => setAgent(e.target.value)}>
                <option value="manual">Manuel · sans compte IA</option>
                <option value="codex">Codex · expérimental qualifié</option>
                <option value="claude" disabled>
                  Claude Code · non implémenté
                </option>
                <option value="gemini" disabled>
                  Gemini CLI · non implémenté
                </option>
              </select>
            </label>
            {agent === 'manual' ? (
              <div className="agent-empty">
                <div className="empty-title">
                  <Icon name="sliders" />
                  <h3>Édition manuelle</h3>
                </div>
                <p>
                  Sélectionnez un token. Proposez une valeur, puis examinez le
                  diff avant de l’enregistrer.
                </p>
                <div className="workflow-path">
                  <span>Sélectionner</span>
                  <Icon name="arrow" />
                  <span>Comparer</span>
                  <Icon name="arrow" />
                  <span>Valider</span>
                </div>
                <button
                  className="connect-agent"
                  onClick={() => setAgent('codex')}
                >
                  <Icon name="chat" />
                  Choisir Codex
                  <Icon name="arrow" />
                </button>
                <p className="privacy-note">
                  Le mode manuel fonctionne sans compte IA. Vos changements
                  restent sur ce poste.
                </p>
              </div>
            ) : (
              <>
                <p className="agent-availability">
                  {selectedAgent?.detail ?? 'Détection du CLI…'}
                </p>
                <div
                  className="chat-log"
                  aria-label="Conversation"
                  aria-live="polite"
                >
                  {!chat.length && (
                    <div className="chat-empty">
                      <h3>Qu’allons-nous faire évoluer ?</h3>
                      <p>
                        Décrivez une intention. L’agent proposera des tokens,
                        pas des commandes.
                      </p>
                    </div>
                  )}
                  {chat.map((c, i) => (
                    <article className={`chat-message ${c.role}`} key={i}>
                      <strong>{c.role === 'user' ? 'Vous' : 'Codex'}</strong>
                      <p>{c.text}</p>
                    </article>
                  ))}
                  {thinking && <p role="status">Codex prépare une réponse…</p>}
                </div>
                <form
                  className="chat-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendMessage();
                  }}
                >
                  <label className="field">
                    Votre demande
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={8000}
                      placeholder="Quelle évolution voulez-vous explorer ?"
                      disabled={thinking}
                    />
                  </label>
                  <div className="composer-actions">
                    <span>Aucun outil ni commande</span>
                    <button
                      className="studio-primary"
                      disabled={
                        thinking || !message.trim() || !selectedAgent?.available
                      }
                    >
                      <Icon name="arrow" />
                      {thinking ? 'Réflexion en cours…' : 'Envoyer à Codex'}
                    </button>
                    {thinking && (
                      <button
                        type="button"
                        onClick={() => controller.current?.abort()}
                      >
                        Arrêter
                      </button>
                    )}
                  </div>
                </form>
                <p className="privacy-note cloud-warning">
                  L’envoi à Codex inclut les tokens, workspace/PFE.md, le brief
                  privé, DESIGN_RULES.md et 10 messages récents. Ne transmettez
                  pas de données sensibles.
                </p>
              </>
            )}
          </div>
          <div className="panel-foot">
            <Icon name="check" />
            Aucune écriture sans validation
          </div>
        </section>
      </main>
      <footer className="studio-footer">
        <span className="local-status">
          <span aria-hidden="true" />
          En local<span className="footer-divider">/</span>Révision{' '}
          {state.revision}
        </span>
        <span>{boot?.figma.label ?? 'Figma non connecté'}</span>
      </footer>
      <dialog
        ref={dialog}
        onCancel={(e) => {
          if (saving) e.preventDefault();
          else setProposal(undefined);
        }}
        aria-labelledby="diff-title"
      >
        <h2 id="diff-title">Valider le changement</h2>
        <p>
          Proposition {proposal?.source} · basée sur la révision{' '}
          {proposal?.revision}. Ces valeurs seront enregistrées sur votre
          machine.
        </p>
        {staleProposal && (
          <p role="alert" className="error">
            Une autre validation a modifié le DS. Fermez ce diff et refaites
            votre proposition ; aucun écrasement n’est permis.
          </p>
        )}
        {proposal && !staleProposal && (
          <div
            className="proposal-preview"
            aria-label="Spécimen de la proposition"
          >
            <div>
              <h3>Avant</h3>
              <DSProvider tokens={state.tokens}>
                <Button>Action principale</Button>
              </DSProvider>
            </div>
            <div>
              <h3>Après · non enregistré</h3>
              <DSProvider
                tokens={applyChanges(
                  state.tokens,
                  proposal.patches.map((p) => ({ key: p.key, value: p.after })),
                )}
              >
                <Button>Action principale</Button>
              </DSProvider>
            </div>
          </div>
        )}
        {proposal && !staleProposal && (
          <p className="proposal-caption">
            Spécimen : bouton principal. Le tableau détaille tous les tokens
            proposés.
          </p>
        )}
        <div className="diff-scroll">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Avant</th>
                <th>Après</th>
              </tr>
            </thead>
            <tbody>
              {proposal?.patches.map((p) => (
                <tr key={p.key}>
                  <th>{p.key}</th>
                  <td>
                    {state.tokens[p.key].$type === 'color' && (
                      <span
                        className="diff-swatch"
                        style={{ background: String(p.before) }}
                        aria-hidden="true"
                      />
                    )}
                    <del>{p.before}</del>
                  </td>
                  <td>
                    {state.tokens[p.key].$type === 'color' && (
                      <span
                        className="diff-swatch"
                        style={{ background: String(p.after) }}
                        aria-hidden="true"
                      />
                    )}
                    <ins>{p.after}</ins>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <button
            ref={cancelButton}
            onClick={() => setProposal(undefined)}
            disabled={saving}
          >
            Ne pas appliquer
          </button>
          <button
            className="studio-primary"
            onClick={() => void accept()}
            disabled={saving || staleProposal}
          >
            {saving ? 'Enregistrement…' : 'Valider et enregistrer'}
          </button>
        </div>
      </dialog>
    </>
  );
}
