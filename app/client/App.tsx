import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Button,
  DSProvider,
  Scenario,
  Thumbnail,
  components,
  type ComponentId,
} from './DesignSystem.js';
import Icon from './Icon.js';
import ComponentPage from './ComponentPage.js';
import { componentDocs } from './componentDocs.js';
import ProjectBrief from './ProjectBrief.js';
import { ColorsView } from './ColorsView.js';
import { PaletteTool } from './PaletteTool.js';
import { AddTokenForm, FontHint, RemovalWarning } from './TokenTools.js';
import { tokenUsage } from './tokenUsage.js';
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
  applyPatches,
  contrast,
  isBaseToken,
  resolvedValue,
  type Change,
  type Proposal,
  type State,
  type TokenKey,
} from '../shared/model.js';

const families = [
  { prefix: 'color.', name: 'Couleurs' },
  { prefix: 'font.', name: 'Typographie' },
  { prefix: 'space.', name: 'Espacements' },
  { prefix: 'radius.', name: 'Rayons' },
] as const;
type Family = (typeof families)[number];
// Ce que le canevas affiche : une vue d'ensemble (tokens ou composants),
// une famille ou un composant.
type Selection =
  | { kind: 'all' }
  | { kind: 'tokens' }
  | { kind: 'family'; prefix: Family['prefix'] }
  | { kind: 'component'; id: ComponentId };
// Sections repliables de la barre latérale : ouvertes au premier lancement,
// puis le choix est retenu sur ce poste.
type NavSection = 'tokens' | 'components';
const navStorageKey = 'ds-studio-sidebar-v1';
function useNavSections() {
  const [open, setOpen] = useState<Record<NavSection, boolean>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(navStorageKey) || 'null');
      return {
        tokens: saved?.tokens !== false,
        components: saved?.components !== false,
      };
    } catch {
      return { tokens: true, components: true };
    }
  });
  function toggle(section: NavSection) {
    setOpen((current) => {
      const next = { ...current, [section]: !current[section] };
      try {
        localStorage.setItem(navStorageKey, JSON.stringify(next));
      } catch {
        /* Facultatif. */
      }
      return next;
    });
  }
  return { open, toggle };
}
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
      if (typeof saved?.key === 'string') return saved.key;
    } catch {
      /* Facultatif. */
    }
    return 'color.brand';
  });
  const { draft, setDraft, recovered, discard } = useTokenDraft(
    key,
    state?.tokens[key]?.$value,
  );
  const [search, setSearch] = useState('');
  const [selection, setSelection] = useState<Selection>({ kind: 'all' });
  const nav = useNavSections();
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
  const [canvasView, setCanvasView] = useState<
    'catalogue' | 'preview' | 'palette'
  >('catalogue');
  const [agentOpen, setAgentOpen] = useState(false);
  // Panneau de création : même colonne que Modifier, un seul ouvert à la fois.
  const [createOpen, setCreateOpen] = useState(false);
  const [focusCanvas, setFocusCanvas] = useState(false);
  function navigatePanel(id: string) {
    setActivePanel(id);
    if (id === 'mobile') setCanvasView('preview');
    if (id === 'canvas') setCanvasView('catalogue');
    requestAnimationFrame(() =>
      document.getElementById(`${id}-title`)?.focus(),
    );
  }
  function openEditor(k?: TokenKey) {
    if (k) setKey(k);
    setFocusCanvas(false);
    if (matchMedia('(max-width: 1099px)').matches) navigatePanel('agent');
    else {
      setCreateOpen(false);
      setAgentOpen(true);
      if (!k)
        requestAnimationFrame(() =>
          document.getElementById('agent-title')?.focus(),
        );
    }
  }
  function select(next: Selection) {
    setSelection(next);
    setCanvasView('catalogue');
    if (matchMedia('(max-width: 1099px)').matches) navigatePanel('canvas');
    else setActivePanel('canvas');
  }
  function openPalette() {
    setFocusCanvas(false);
    navigatePanel('canvas');
    setCanvasView('palette');
    requestAnimationFrame(() =>
      document.getElementById('palette-title')?.focus(),
    );
  }
  function closeEditor() {
    setAgentOpen(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('.edit-fab')?.focus(),
    );
  }
  function openCreator() {
    setFocusCanvas(false);
    if (matchMedia('(max-width: 1099px)').matches) navigatePanel('create');
    else {
      setAgentOpen(false);
      setCreateOpen(true);
      requestAnimationFrame(() =>
        document.getElementById('create-title')?.focus(),
      );
    }
  }
  function closeCreator() {
    setCreateOpen(false);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>('.create-fab')?.focus(),
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
  const current = state?.tokens[key]?.$value;
  // Token supprimé (ici, par import ou dans un autre onglet) : revenir au premier.
  useEffect(() => {
    if (state && !state.tokens[key]) setKey(Object.keys(state.tokens)[0]);
  }, [state, key]);

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
  async function proposeChanges(changes: Change[]) {
    if (!state) return;
    await perform(async () => {
      setProposal(
        await request<Proposal>('proposals', {
          revision: state.revision,
          changes,
        }),
      );
    });
  }
  async function proposeToken() {
    const token = state?.tokens[key];
    if (!token) return;
    const value = token.$type === 'dimension' ? Number(draft) : draft;
    await proposeChanges([{ key, value }]);
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
  const tokenKeys = Object.keys(state.tokens);
  const editType = state.tokens[key]?.$type;
  const brand = String(resolvedValue(state.tokens, 'color.brand'));
  const onBrand = String(resolvedValue(state.tokens, 'color.onBrand'));
  const selectedAgent = agents.find((a) => a.id === agent);
  const staleProposal = !!proposal && proposal.revision !== state.revision;
  const draftContrast =
    /^#[0-9a-fA-F]{6}$/.test(draft) &&
    (key === 'color.brand' || key === 'color.onBrand')
      ? contrast(
          key === 'color.brand' ? draft : brand,
          key === 'color.onBrand' ? draft : onBrand,
        )
      : undefined;
  const query = search.trim().toLowerCase();
  const matchingKeys = tokenKeys.filter((k) => k.toLowerCase().includes(query));
  const matchingComponents = components.filter((c) =>
    c.name.toLowerCase().includes(query),
  );
  const familyOf = (k: TokenKey) =>
    families.find((f) => k.startsWith(f.prefix))!;
  const tokenRow = (k: TokenKey, label: string) => (
    <button
      key={k}
      className="token-row"
      aria-label={`Sélectionner ${k}`}
      aria-pressed={key === k}
      onClick={() => {
        select({ kind: 'family', prefix: familyOf(k).prefix });
        openEditor(k);
      }}
    >
      {state.tokens[k].$type === 'color' ? (
        <span
          className="token-dot"
          style={{ background: String(state.tokens[k].$value) }}
        />
      ) : (
        <span className="token-unit" aria-hidden="true">
          {state.tokens[k].$type === 'fontFamily' ? 'Aa' : 'px'}
        </span>
      )}
      <span className="token-name">{label}</span>
      <code>{state.tokens[k].$value}</code>
    </button>
  );
  const onCatalogue = canvasView === 'catalogue';
  // Option A de la décision du 29/10 : la flèche replie, le titre ouvre la
  // vue d'ensemble. Un clic ne fait qu'une chose.
  const navSection = (
    id: NavSection,
    label: string,
    icon: 'sliders' | 'components',
    count: number,
    overview: Selection,
    items: ReactNode,
  ) => (
    <div className="nav-section" data-open={nav.open[id]}>
      <div className="nav-section-head">
        <button
          className="nav-toggle"
          aria-expanded={nav.open[id]}
          aria-controls={`nav-${id}`}
          aria-label={`Liste ${label}`}
          title={nav.open[id] ? `Replier ${label}` : `Déplier ${label}`}
          onClick={() => nav.toggle(id)}
        >
          <Icon name="chevron" />
        </button>
        <button
          className="nav-section-title"
          aria-pressed={onCatalogue && selection.kind === overview.kind}
          onClick={() => select(overview)}
        >
          <Icon name={icon} />
          {label}
          <span className="sr-only"> · vue d’ensemble</span>
          <span className="nav-count">{count}</span>
        </button>
      </div>
      <div
        id={`nav-${id}`}
        className="nav-section-items"
        hidden={!nav.open[id]}
      >
        {items}
      </div>
    </div>
  );
  const familyRow = (k: TokenKey, prefix: Family['prefix']) => {
    const t = state.tokens[k];
    return (
      <button
        key={k}
        className="family-row"
        aria-label={`Sélectionner ${k}`}
        aria-pressed={key === k}
        onClick={() => openEditor(k)}
      >
        <span className="family-sample" aria-hidden="true">
          {t.$type === 'color' ? (
            <span
              className="sample-color"
              style={{ background: String(t.$value) }}
            />
          ) : t.$type === 'fontFamily' ? (
            <span style={{ fontFamily: String(t.$value) }}>Aa</span>
          ) : k.startsWith('font.') ? (
            <span style={{ fontSize: `${t.$value}px` }}>Aa</span>
          ) : k.startsWith('radius.') ? (
            <span
              className="sample-radius"
              style={{ borderRadius: `${t.$value}px` }}
            />
          ) : (
            <span className="sample-space" style={{ width: `${t.$value}px` }} />
          )}
        </span>
        <span className="family-name">
          <strong>{k.slice(prefix.length)}</strong>
          <code>{k}</code>
        </span>
        <code className="family-value">
          {t.$value}
          {t.$type === 'dimension' ? ' px' : ''}
        </code>
      </button>
    );
  };
  const selectedFamily =
    selection.kind === 'family'
      ? families.find((f) => f.prefix === selection.prefix)!
      : undefined;
  const selectedComponent =
    selection.kind === 'component'
      ? components.find((c) => c.id === selection.id)!
      : undefined;
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
          <h1>Cartel</h1>
          <span>Design System du Capc</span>
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
                <p>
                  {event.patches
                    .map((p) =>
                      !p.before
                        ? `${p.key} (ajout)`
                        : !p.after
                          ? `${p.key} (suppression)`
                          : p.key,
                    )
                    .join(', ')}
                </p>
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
            ['canvas', 'Design', 'layers'],
            ['mobile', 'Aperçu', 'phone'],
            ['agent', 'Modifier', 'edit'],
            ['create', 'Créer', 'plus'],
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
        data-agent-open={agentOpen || createOpen}
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
          </div>
          <div className="token-browser">
            <label className="token-search">
              <Icon name="search" />
              <span className="sr-only">
                Rechercher un composant ou un token
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher…"
              />
            </label>
            {query && (
              <p className="search-status" role="status">
                {matchingComponents.length + matchingKeys.length} résultat(s).
              </p>
            )}
            <div
              className="token-list"
              aria-label="Navigation du Design System"
            >
              {query ? (
                <>
                  {matchingComponents.length > 0 && (
                    <div className="token-group">
                      <h3>Composants</h3>
                      {matchingComponents.map((c) => (
                        <button
                          key={c.id}
                          className="nav-item"
                          aria-pressed={
                            selection.kind === 'component' &&
                            selection.id === c.id
                          }
                          onClick={() =>
                            select({ kind: 'component', id: c.id })
                          }
                        >
                          <Icon name="layers" />
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {matchingKeys.length > 0 && (
                    <div className="token-group">
                      <h3>Tokens</h3>
                      {matchingKeys.map((k) => tokenRow(k, k))}
                    </div>
                  )}
                  {matchingComponents.length + matchingKeys.length === 0 && (
                    <div className="search-empty">
                      <p>Aucun résultat.</p>
                      <button onClick={() => setSearch('')}>
                        Effacer la recherche
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {navSection(
                    'tokens',
                    'Tokens',
                    'sliders',
                    tokenKeys.length,
                    { kind: 'tokens' },
                    families.map((f) => (
                      <button
                        key={f.prefix}
                        className="nav-item"
                        aria-pressed={
                          onCatalogue &&
                          selection.kind === 'family' &&
                          selection.prefix === f.prefix
                        }
                        onClick={() =>
                          select({ kind: 'family', prefix: f.prefix })
                        }
                      >
                        {f.name}
                        <span className="nav-count">
                          {
                            tokenKeys.filter((k) => k.startsWith(f.prefix))
                              .length
                          }
                        </span>
                      </button>
                    )),
                  )}
                  {navSection(
                    'components',
                    'Composants',
                    'components',
                    components.length,
                    { kind: 'all' },
                    components.map((c) => (
                      <button
                        key={c.id}
                        className="nav-item"
                        aria-pressed={
                          onCatalogue &&
                          selection.kind === 'component' &&
                          selection.id === c.id
                        }
                        onClick={() => select({ kind: 'component', id: c.id })}
                      >
                        {c.name}
                      </button>
                    )),
                  )}
                </>
              )}
            </div>
            <div
              className="toolbox"
              role="group"
              aria-labelledby="toolbox-title"
            >
              <h3 id="toolbox-title">Boîte à outils</h3>
              <button
                className="nav-item tool-item"
                aria-pressed={canvasView === 'palette'}
                aria-controls="palette-view"
                onClick={openPalette}
              >
                <Icon name="palette" />
                Créateur de palettes
              </button>
              {/* Annoncé mais pas encore construit : focusable, sans action. */}
              <div className="tool-wip-wrap">
                <button
                  className="nav-item tool-item tool-wip"
                  aria-disabled="true"
                  aria-describedby="wip-hint"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon name="components" />
                  Générateur de composants
                  <span className="wip-badge">WIP</span>
                </button>
                <span id="wip-hint" className="tool-tooltip" role="tooltip">
                  Bientôt disponible
                </span>
              </div>
            </div>
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
              Design
            </h2>
            {/* Design / Aperçu : seulement sur la page d'un composant (29/10). */}
            {selectedComponent && canvasView !== 'palette' && (
              <div className="canvas-tabs" aria-label="Vue du canevas">
                <button
                  aria-pressed={canvasView === 'catalogue'}
                  onClick={() => {
                    setCanvasView('catalogue');
                    setActivePanel('canvas');
                  }}
                >
                  <Icon name="layers" />
                  Design
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
            )}
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
                <h3>
                  {selectedFamily?.name ??
                    selectedComponent?.name ??
                    (selection.kind === 'tokens' ? 'Tokens' : 'Composants')}
                </h3>
                {selectedComponent ? (
                  <>
                    <p className="component-definition">
                      {componentDocs[selectedComponent.id].definition}
                    </p>
                    <p className="component-usage">
                      <strong>Quand l’utiliser.</strong>{' '}
                      {componentDocs[selectedComponent.id].usage}
                    </p>
                  </>
                ) : (
                  <p>
                    {selectedFamily?.prefix === 'color.'
                      ? 'Primitives : les couleurs brutes des palettes · Semantic : leur rôle · cliquez un token pour le modifier'
                      : selectedFamily
                        ? 'Famille de tokens · cliquez un token pour le modifier'
                        : selection.kind === 'tokens'
                          ? `${tokenKeys.length} tokens · ${families.length} familles · cliquez un token pour le modifier`
                          : `${components.length} composants · Cartel`}
                  </p>
                )}
              </div>
              <span>Valeurs enregistrées</span>
            </div>
            {selectedFamily?.prefix === 'color.' ? (
              <ColorsView
                tokens={state.tokens}
                selected={key}
                onSelect={openEditor}
                onCreatePalette={openPalette}
              />
            ) : selectedFamily ? (
              <div className="family-view">
                {tokenKeys
                  .filter((k) => k.startsWith(selectedFamily.prefix))
                  .map((k) => familyRow(k, selectedFamily.prefix))}
              </div>
            ) : selection.kind === 'tokens' ? (
              <div className="tokens-overview">
                {families.map((f) => (
                  <section
                    key={f.prefix}
                    className="overview-family"
                    aria-labelledby={`overview-${f.prefix}`}
                  >
                    <h4 id={`overview-${f.prefix}`}>
                      <button
                        className="overview-family-link"
                        onClick={() =>
                          select({ kind: 'family', prefix: f.prefix })
                        }
                      >
                        {f.name}
                        <Icon name="arrow" />
                      </button>
                    </h4>
                    <div className="family-view">
                      {tokenKeys
                        .filter((k) => k.startsWith(f.prefix))
                        .map((k) => familyRow(k, f.prefix))}
                    </div>
                  </section>
                ))}
              </div>
            ) : selectedComponent ? (
              <ComponentPage
                key={selectedComponent.id}
                tokens={state.tokens}
                id={selectedComponent.id}
              />
            ) : (
              <ul className="component-gallery" aria-label="Composants">
                {components.map((c) => (
                  <li key={c.id} className="gallery-card">
                    <Thumbnail tokens={state.tokens} id={c.id} />
                    <button
                      className="gallery-link"
                      onClick={() => select({ kind: 'component', id: c.id })}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <section
            id="palette-view"
            className="palette-scroll canvas-view"
            hidden={canvasView !== 'palette'}
            aria-labelledby="palette-title"
          >
            <div className="canvas-document-heading">
              <div>
                <h3 id="palette-title" tabIndex={-1}>
                  Générateur de palettes accessibles
                </h3>
                <p>
                  Une couleur de départ, un nombre de nuances et vos règles de
                  contraste.
                </p>
              </div>
              <span>Brouillon non enregistré</span>
            </div>
            <PaletteTool
              initial={brand}
              tokens={state.tokens}
              disabled={!boot}
              onPropose={proposeChanges}
            />
          </section>
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
          data-open={agentOpen}
          aria-labelledby="agent-title"
        >
          <div className="panel-heading">
            <h2 id="agent-title" tabIndex={-1}>
              <Icon name="edit" />
              Modifier
            </h2>
            <button
              className="icon-button close-editor"
              aria-label="Fermer le panneau Modifier"
              title="Fermer le panneau Modifier"
              onClick={closeEditor}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="panel-body">
            <div className="token-editor">
              <div className="editor-title">
                <h3>Modifier un token</h3>
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
                    {tokenKeys.map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                </label>
                <div className="field">
                  <label htmlFor="token-value">Valeur</label>
                  <div className="value-control">
                    {editType === 'color' && (
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
                    {editType === 'fontFamily' ? (
                      <input
                        id="token-value"
                        aria-label="Valeur du token"
                        aria-describedby="token-format"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        list="font-suggestions"
                        required
                        maxLength={64}
                      />
                    ) : (
                      <input
                        id="token-value"
                        aria-label="Valeur du token"
                        aria-describedby="token-format"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        required
                        type={editType === 'dimension' ? 'number' : 'text'}
                        min={editType === 'dimension' ? 0 : undefined}
                        max={editType === 'dimension' ? 128 : undefined}
                        step={editType === 'dimension' ? 'any' : undefined}
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
                {editType === 'color'
                  ? '#RRGGBB · '
                  : editType === 'dimension'
                    ? 'Pixels, de 0 à 128 · '
                    : ''}
                Enregistrement après validation.
              </p>
              {editType === 'fontFamily' && <FontHint name={draft} />}
              <button
                type="button"
                className="remove-token"
                disabled={!boot || !editType}
                onClick={() => void proposeChanges([{ key, remove: true }])}
              >
                Supprimer {key}…
              </button>
              <p className="token-hint">
                {isBaseToken(key)
                  ? `Utilisé par ${tokenUsage[key].length > 4 ? 'tous les composants' : tokenUsage[key].join(', ')}. Le diff détaille l’effet avant validation.`
                  : 'Aucun composant ne l’utilise. Suppression annulable dans l’historique.'}
              </p>
              <p className="contrast" aria-live="polite">
                Marque / texte sur marque :{' '}
                <strong>
                  {contrast(brand, onBrand).toFixed(2)}
                  :1
                </strong>{' '}
                ·{' '}
                {contrast(brand, onBrand) >= 4.5
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
                  . Cette indication ne certifie pas tous les états du
                  composant.
                </p>
              )}
            </div>
            <div className="agent-section">
              <h3>
                <Icon name="chat" />
                Agent
                <span className="agent-state">
                  {agent === 'manual' ? 'Facultatif' : 'Codex'}
                </span>
              </h3>
              <ProjectBrief />
              <label className="field agent-mode">
                Mode de travail
                <select
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                >
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
                <>
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
                </>
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
                    {thinking && (
                      <p role="status">Codex prépare une réponse…</p>
                    )}
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
                          thinking ||
                          !message.trim() ||
                          !selectedAgent?.available
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
                    L’envoi à Codex inclut les tokens, workspace/PFE.md, le
                    brief privé, DESIGN_RULES.md et 10 messages récents. Ne
                    transmettez pas de données sensibles.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="panel-foot">
            <Icon name="check" />
            Aucune écriture sans validation
          </div>
        </section>
        <section
          id="create-panel"
          className="panel agent-panel create-panel"
          data-active={activePanel === 'create'}
          data-open={createOpen}
          aria-labelledby="create-title"
        >
          <div className="panel-heading">
            <h2 id="create-title" tabIndex={-1}>
              <Icon name="plus" />
              Créer un token
            </h2>
            <button
              className="icon-button close-editor"
              aria-label="Fermer le panneau Créer token"
              title="Fermer le panneau Créer token"
              onClick={closeCreator}
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="panel-body">
            <AddTokenForm
              tokens={state.tokens}
              disabled={!boot}
              onPropose={proposeChanges}
            />
          </div>
          <div className="panel-foot">
            <Icon name="check" />
            Aucune écriture sans validation
          </div>
        </section>
      </main>
      {!agentOpen && !createOpen && (
        <div className="fab-group">
          <button
            className="create-fab"
            aria-controls="create-panel"
            aria-expanded={false}
            onClick={openCreator}
          >
            <Icon name="plus" />
            Créer token
          </button>
          <button
            className="edit-fab"
            aria-controls="agent-panel"
            aria-expanded={false}
            onClick={() => openEditor()}
          >
            <Icon name="edit" />
            Modifier
          </button>
        </div>
      )}
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
              <DSProvider tokens={applyPatches(state.tokens, proposal.patches)}>
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
        {proposal && <RemovalWarning patches={proposal.patches} />}
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
                    {p.before ? (
                      <>
                        {p.before.$type === 'color' && (
                          <span
                            className="diff-swatch"
                            style={{ background: p.before.$value }}
                            aria-hidden="true"
                          />
                        )}
                        <del>{p.before.$value}</del>
                      </>
                    ) : (
                      <span className="diff-absent">Nouveau token</span>
                    )}
                  </td>
                  <td>
                    {p.after ? (
                      <>
                        {p.after.$type === 'color' && (
                          <span
                            className="diff-swatch"
                            style={{ background: p.after.$value }}
                            aria-hidden="true"
                          />
                        )}
                        <ins>{p.after.$value}</ins>
                      </>
                    ) : (
                      <del className="diff-absent">Supprimé</del>
                    )}
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
