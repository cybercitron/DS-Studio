import type { ComponentId } from './DesignSystem.js';

// Documentation affichée dans l'onglet Design. Ces textes décrivent les
// composants d'exemple hérités du starter : réécrivez-les pour Cartel.
// Les noms de propriétés sont à aligner sur ceux du composant Figma.

export type PropDoc = {
  name: string;
  type: 'enum' | 'boolean' | 'text';
  options?: readonly string[];
  default: string | boolean;
  description: string;
};
export type ComponentDoc = {
  definition: string;
  usage: string;
  anatomy: { part: string; tokens: string }[];
  props: PropDoc[];
};

export const componentDocs: Record<ComponentId, ComponentDoc> = {
  button: {
    definition:
      'Déclenche une action immédiate : valider, réserver, supprimer. Le libellé dit ce qui va se passer.',
    usage:
      'Une seule action principale par zone. La variante danger est réservée aux actions destructives.',
    anatomy: [
      {
        part: 'Conteneur',
        tokens:
          'color.brand (fond), radius.control, space.sm / space.md (marges internes), hauteur minimale 44 px',
      },
      { part: 'Libellé', tokens: 'color.onBrand, font.family, font.body' },
      { part: 'Survol', tokens: 'color.brandHover (variante principale)' },
      { part: 'Focus', tokens: 'contour 3 px color.focus' },
    ],
    props: [
      {
        name: 'label',
        type: 'text',
        default: 'Action principale',
        description: 'Texte du bouton.',
      },
      {
        name: 'variant',
        type: 'enum',
        options: ['primary', 'secondary', 'danger'],
        default: 'primary',
        description: 'Importance et nature de l’action.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: false,
        description: 'Action momentanément indisponible.',
      },
    ],
  },
  card: {
    definition:
      'Résume un atelier et permet de le réserver sans quitter la liste.',
    usage:
      'Une carte par atelier. Le titre reste court ; le bouton porte l’action de réservation.',
    anatomy: [
      {
        part: 'Conteneur',
        tokens: 'color.surface, color.border, radius.control, space.lg',
      },
      { part: 'Titre', tokens: 'color.text, font.body × 1,2' },
      { part: 'Durée et description', tokens: 'color.muted' },
      { part: 'Badge de places', tokens: 'color.brand, color.border' },
      { part: 'Bouton de réservation', tokens: 'composant Bouton' },
      { part: 'Message de confirmation', tokens: 'color.success' },
    ],
    props: [
      {
        name: 'title',
        type: 'text',
        default: 'Faire moins, mais mieux.',
        description: 'Nom de l’atelier.',
      },
      {
        name: 'duration',
        type: 'text',
        default: 'Atelier · 45 min',
        description: 'Format et durée.',
      },
      {
        name: 'description',
        type: 'text',
        default:
          'Un atelier pour imaginer des services plus attentifs au quotidien.',
        description: 'Résumé en une phrase.',
      },
      {
        name: 'places',
        type: 'text',
        default: '6',
        description: 'Nombre de places affiché dans le badge.',
      },
      {
        name: 'price',
        type: 'text',
        default: 'Gratuit',
        description: 'Prix affiché à droite du badge.',
      },
    ],
  },
  form: {
    definition:
      'Recueille quelques informations pour une inscription, avec validation native du navigateur.',
    usage:
      'Chaque champ a un libellé visible. Les champs obligatoires bloquent l’envoi tant qu’ils sont vides.',
    anatomy: [
      {
        part: 'Libellé',
        tokens: 'color.text, font.body × 0,8, space.sm (écart avec le champ)',
      },
      {
        part: 'Champ',
        tokens:
          'color.surface, color.border, radius.control, space.sm / space.md, hauteur minimale 44 px',
      },
      { part: 'Champ désactivé', tokens: 'color.canvas, opacité 0,6' },
      { part: 'Case à cocher', tokens: 'color.brand (accent)' },
      { part: 'Bouton d’envoi', tokens: 'composant Bouton' },
    ],
    props: [],
  },
  nav: {
    definition:
      'Permet de passer d’une section à l’autre du scénario : Découvrir, Favoris, Profil.',
    usage:
      'Trois à cinq entrées courtes. L’entrée active est signalée par la couleur et par aria-current.',
    anatomy: [
      { part: 'Entrée', tokens: 'color.muted, space.sm, radius.control' },
      { part: 'Entrée active', tokens: 'color.brand (fond), color.onBrand' },
      { part: 'Phrase de contexte', tokens: 'color.muted' },
    ],
    props: [],
  },
};
