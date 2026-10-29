import { useState, type CSSProperties, type ReactNode } from 'react';
import { tokenCss, type Tokens } from '../shared/model.js';

export function DSProvider({
  tokens,
  children,
}: {
  tokens: Tokens;
  children: ReactNode;
}) {
  return (
    <div className="ds" style={tokenCss(tokens) as CSSProperties}>
      {children}
    </div>
  );
}
export function Button({
  variant = 'primary',
  children,
  disabled = false,
  onClick,
}: {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className={`ds-button ${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function BookingCard({
  title = 'Faire moins, mais mieux.',
  duration = 'Atelier · 45 min',
  description = 'Un atelier pour imaginer des services plus attentifs au quotidien.',
  places = '6',
  price = 'Gratuit',
}: {
  title?: string;
  duration?: string;
  description?: string;
  places?: string;
  price?: string;
}) {
  const [booked, setBooked] = useState(false);
  return (
    <article className="ds-card">
      <h3>{title}</h3>
      <p className="workshop-duration">{duration}</p>
      <p>{description}</p>
      <div className="card-meta">
        <span className="ds-badge">{places} places disponibles</span>
        <span>{price}</span>
      </div>
      <Button onClick={() => setBooked(!booked)}>
        {booked ? 'Réservation confirmée ✓' : 'Réserver une place'}
      </Button>
      <span role="status" className="ds-feedback">
        {booked ? 'Inscription de démonstration, aucune donnée envoyée.' : ''}
      </span>
    </article>
  );
}
export function ExampleForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="ds-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <label>
        Votre prénom
        <input placeholder="Camille" required onChange={() => setSent(false)} />
      </label>
      <label>
        Adresse e-mail
        <input
          type="email"
          placeholder="camille@example.com"
          required
          onChange={() => setSent(false)}
        />
      </label>
      <label>
        Champ désactivé
        <input placeholder="Non disponible" disabled />
      </label>
      <label className="ds-check">
        <input type="checkbox" required /> J’accepte les conditions de
        démonstration
      </label>
      <button className="ds-button primary" type="submit">
        S’inscrire
      </button>
      <p role="status">
        {sent ? 'Merci ! Démonstration locale, aucune inscription réelle.' : ''}
      </p>
    </form>
  );
}
export function Navigation() {
  const [tab, setTab] = useState('Découvrir');
  return (
    <nav aria-label="Navigation du scénario" className="ds-nav">
      {['Découvrir', 'Favoris', 'Profil'].map((t) => (
        <button
          key={t}
          aria-current={tab === t ? 'page' : undefined}
          onClick={() => setTab(t)}
        >
          {t}
        </button>
      ))}
      <p className="nav-context" aria-live="polite">
        {tab === 'Favoris'
          ? 'Vos ateliers favoris apparaîtront ici.'
          : tab === 'Profil'
            ? 'Votre espace personnel de démonstration.'
            : 'Des idées à explorer près de chez vous.'}
      </p>
    </nav>
  );
}
// Inventaire des composants, par ordre alphabétique, pour la navigation de l'atelier.
export const components = [
  { id: 'button', name: 'Bouton' },
  { id: 'card', name: 'Carte atelier' },
  { id: 'form', name: 'Formulaire' },
  { id: 'nav', name: 'Navigation' },
] as const;
export type ComponentId = (typeof components)[number]['id'];
// Spécimen de chaque composant, partagé par le catalogue et les cards de la vue d'ensemble.
function Specimen({ id }: { id: ComponentId }) {
  if (id === 'button')
    return (
      <>
        <div className="button-row">
          <Button>Action principale</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="danger">Supprimer</Button>
          <Button disabled>Indisponible</Button>
        </div>
        <p className="ds-caption">
          Survolez, utilisez Tab et activez les boutons. Focus et états natifs
          inclus.
        </p>
      </>
    );
  if (id === 'card') return <BookingCard />;
  if (id === 'form') return <ExampleForm />;
  return <Navigation />;
}
const specimenTitles: Record<ComponentId, string> = {
  button: 'Boutons',
  card: 'Carte atelier',
  form: 'Formulaire',
  nav: 'Navigation',
};
export function Catalogue({
  tokens,
  only,
}: {
  tokens: Tokens;
  only?: ComponentId;
}) {
  return (
    <DSProvider tokens={tokens}>
      <div className="catalogue" data-single={!!only}>
        {components
          .filter((c) => !only || only === c.id)
          .map((c) => (
            <section key={c.id}>
              <h3 className="specimen-heading">{specimenTitles[c.id]}</h3>
              <Specimen id={c.id} />
            </section>
          ))}
      </div>
    </DSProvider>
  );
}
// Aperçu interactif de l'onglet Design : les réglages ne sont jamais enregistrés.
export type PreviewProps = Record<string, string | boolean>;
export function ComponentPreview({
  tokens,
  id,
  props,
}: {
  tokens: Tokens;
  id: ComponentId;
  props: PreviewProps;
}) {
  const text = (name: string) => String(props[name] ?? '');
  return (
    <DSProvider tokens={tokens}>
      <div className={`component-preview ${id}`}>
        {id === 'button' ? (
          <Button
            variant={text('variant') as 'primary' | 'secondary' | 'danger'}
            disabled={props.disabled === true}
          >
            {text('label')}
          </Button>
        ) : id === 'card' ? (
          <BookingCard
            title={text('title')}
            duration={text('duration')}
            description={text('description')}
            places={text('places')}
            price={text('price')}
          />
        ) : (
          <Specimen id={id} />
        )}
      </div>
    </DSProvider>
  );
}
// Vignette inerte : un vrai rendu avec les tokens enregistrés, non interactif.
export function Thumbnail({ tokens, id }: { tokens: Tokens; id: ComponentId }) {
  return (
    <DSProvider tokens={tokens}>
      <div className="thumbnail" aria-hidden="true" inert>
        <div className={`thumbnail-inner ${id}`}>
          <Specimen id={id} />
        </div>
      </div>
    </DSProvider>
  );
}
export function Scenario({
  tokens,
  scenario,
}: {
  tokens: Tokens;
  scenario: string;
}) {
  return (
    <DSProvider tokens={tokens}>
      <div className="scenario">
        <header className="scenario-head">
          <strong>cartel</strong>
          <span className="ds-badge">Bordeaux</span>
        </header>
        <Navigation />
        <main>
          <h1>
            De petites idées.
            <br />
            De vrais liens.
          </h1>
          <p>Des ateliers pour apprendre, partager et se rencontrer.</p>
          {scenario === 'form' ? (
            <div className="ds-card">
              <h2>Rejoignez le mouvement.</h2>
              <ExampleForm />
            </div>
          ) : (
            <div className="scenario-grid">
              <BookingCard />
              <article className="ds-card">
                <h3>Un quartier qui inspire.</h3>
                <p>Explorez vos prochaines rencontres.</p>
                <Button variant="secondary">Voir les ateliers</Button>
              </article>
            </div>
          )}
        </main>
        <footer>cartel · Design System du Capc</footer>
      </div>
    </DSProvider>
  );
}
