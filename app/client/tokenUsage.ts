import type { BaseTokenKey } from '../shared/model.js';

// Relevé à la main dans styles.css (règles .ds) : à tenir à jour avec les composants.
const all = [
  'Bouton',
  'Carte atelier',
  'Formulaire',
  'Navigation',
  'Écrans d’aperçu',
];
export const tokenUsage: Record<BaseTokenKey, string[]> = {
  'color.brand': all,
  'color.brandHover': ['Bouton'],
  'color.onBrand': ['Bouton', 'Navigation'],
  'color.surface': all,
  'color.canvas': ['Bouton', 'Formulaire', 'Écrans d’aperçu'],
  'color.text': all,
  'color.muted': all,
  'color.border': ['Carte atelier', 'Formulaire', 'Écrans d’aperçu'],
  'color.danger': ['Bouton', 'Formulaire'],
  'color.success': ['Carte atelier'],
  'color.focus': all,
  'font.family': all,
  'font.body': all,
  'font.heading': ['Écrans d’aperçu'],
  'space.sm': ['Bouton', 'Carte atelier', 'Formulaire', 'Navigation'],
  'space.md': ['Bouton', 'Carte atelier', 'Formulaire', 'Écrans d’aperçu'],
  'space.lg': ['Carte atelier', 'Écrans d’aperçu'],
  'radius.control': ['Bouton', 'Carte atelier', 'Formulaire', 'Navigation'],
};
