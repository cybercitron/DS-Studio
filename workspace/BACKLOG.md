# Backlog

Idées de features et tâches à venir. Les décisions tranchées vont dans DECISIONS.md.

## Idées de features

### Priorité haute

- **Réorganiser l'interface** (voir la décision du 28/10), par étapes :
  1) bouton flottant et panneau Modifier ; 2) barre de gauche façon Storybook ;
  3) onglet Design avec une page par composant ; 4) onglet Accessibilité.

- **Vérificateur de contrastes** : tableau qui teste toutes les paires de couleurs
  du DS (texte, boutons, états survol, focus, désactivé, erreur) et signale celles
  sous 4,5:1 (texte courant) ou 3:1 (grand texte).
  Pourquoi : accessibilité exigeante et lumière variable en salle d'exposition.
  Preuve attendue : une paire insuffisante détectée, corrigée, puis revérifiée.
  Emplacement prévu : onglet Accessibilité.

- **Documentation du DS** : pour chaque token et composant, ses règles
  d'utilisation et des DOs / DON'Ts.
  Pourquoi : transformer une palette en vrai DS, consultable par d'autres.
  Emplacement prévu : onglet Design (définition, anatomie, propriétés).

- **Affichage de tous les états** des composants (normal, survol, focus,
  désactivé, erreur).
  Pourquoi : appliquer la règle « distinguer les états » de DESIGN_RULES.md.
  Emplacement prévu : onglet Design.

- **Panneau de propriétés des composants** : choisir un composant et modifier ses
  propriétés (ex. `showIconLeft`, `size`) pour voir l'aperçu changer en direct.
  Mêmes noms de propriétés que dans Figma. Les réglages servent à jouer : ils ne
  sont pas enregistrés et ne modifient pas le DS.
  Limite : survol et focus restent à tester à la souris et au clavier.
  Emplacement prévu : aperçu interactif de l'onglet Design.

- **Ajout et suppression de tokens**, polices comprises.
  Pourquoi : la liste actuelle est figée (18 tokens, 4 polices) et la charte du
  CAPC risque de ne pas y entrer. À préparer avant l'import de la charte.
  Limite : demande une migration prudente, sans perte de données.

- **Générateur de palettes accessibles** (voir la décision du 28/10).
  1) Générer, ajuster et exporter une palette à partir d'une teinte hex ;
  2) bouton « Ajouter comme tokens primitives », via le diff.
  Emplacement prévu : bouton d'outil dans la barre de navigation.
  Dépend de : « Ajout et suppression de tokens » pour l'étape 2.

### Priorité moyenne

- **Liste des templates** : écrans types assemblés à partir des composants.
  Dépend de la réflexion sur les composants (voir To do).

- **Alias** : relier un token sémantique à une primitive (ex. « texte » pointe
  vers « rouge 700 »). Nécessaire pour profiter des palettes générées.

- **Modes clair et sombre** des tokens sémantiques. Obligatoires pour la web app
  du CAPC. Dépend des alias.

### Priorité basse — pistes d'amélioration

- **Remplacer l'agent intégré (Codex) par Claude**.
  Limite : à tester avant de l'annoncer, Claude est aujourd'hui marqué non implémenté.

- **Mode « salle d'exposition »** : une seconde palette pour les salles sombres ou
  très éclairées, avec un bouton pour basculer.
  Limites : demande de faire évoluer le modèle de tokens (migration prudente) ;
  besoin à confirmer d'abord par observation en salle.

## To do

- [ ] Réfléchir aux composants à intégrer dans le DS de la web app CAPC, à partir
      des maquettes (pistes : carte d'œuvre, bloc « pour aller plus loin »).
- [ ] Vérifier quels états des composants sont déjà visibles dans DS-Studio.
- [ ] À l'import de la charte CAPC : revoir `color.brandHover` (bleu d'origine,
      ne va plus avec le violet de `color.brand`) et choisir comment relier les
      variables Figma à DS-Studio.
