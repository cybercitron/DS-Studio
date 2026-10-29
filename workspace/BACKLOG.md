# Backlog

Idées de features et tâches à venir. Les décisions tranchées vont dans DECISIONS.md.

## Idées de features

### Priorité haute

- **Réorganiser l'interface** (voir la décision du 28/10), par étapes :
  1) bouton flottant et panneau Modifier ; 2) barre de gauche façon Storybook ;
  3) onglet Design avec une page par composant ; 4) onglet Accessibilité.

- **Refonte de l'atelier** (décisions du 29/10 : barre latérale et style Playbook).
  1) [x] Nouvelle barre latérale, déjà dans le nouveau style (fait le 29/10) :
     barre foncée, sections Tokens et Composants repliables (la flèche replie,
     le titre ouvre la vue d'ensemble), choix retenu sur ce poste, Boîte à outils
     (Créateur de palettes ; Générateur de composants WIP, inactif). Testé à la
     souris et au clavier ; textes de la barre entre 6:1 et 13,5:1.
     Police Poppins (OFL, `app/client/fonts/`) à la place de Geist : validée sur
     capture le 29/10 ; Geist retirée du dossier.
  2) [x] Reste de l'atelier dans le même style (fait le 29/10) : boutons et
     onglets en pilule, champs à 12 px, cartes à 20 px avec ombre légère,
     dialogues à 28 px, titres de page à 30 px. Composants du DS inchangés.
     Testé : 4 vérifications, focus clavier visible sur les pilules.
     Limite : les bordures fines des boutons secondaires restent pâles (1,3:1),
     comme avant ; leur libellé suffit à les identifier.
  3) [ ] Illustrations libres de droits (états vides, vues d'ensemble, Boîte à
     outils), licence de chacune vérifiée et notée. Mises de côté le 29/10.

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

- **Générateur de palettes accessibles** (voir les décisions du 28/10 et du 29/10).
  1) [x] Générer, ajuster et exporter une palette à partir d'une teinte hex
     (fait le 29/10, testé ; ouvert depuis la Boîte à outils) ;
  2) [ ] bouton « Ajouter comme tokens primitives », via le diff ;
  3) [ ] mode sombre : seconde échelle avec les mêmes règles.
  L'ajout de tokens est fait (29/10) : l'étape 2 est débloquée.
  Emplacement : Boîte à outils de la barre latérale (le bouton de la barre du
  haut a été retiré le 29/10).

### Priorité moyenne

- **Liste des templates** : écrans types assemblés à partir des composants.
  Dépend de la réflexion sur les composants (voir To do).

- **Alias** : relier un token sémantique à une primitive (ex. « texte » pointe
  vers « rouge 700 »). Nécessaire pour profiter des palettes générées.

- **Modes clair et sombre** des tokens sémantiques. Obligatoires pour la web app
  du CAPC. Dépend des alias.

### Priorité basse — pistes d'amélioration

- **Générateur de composants** : choisir un type (bouton, select, card…), cocher
  ses propriétés d'après les bonnes pratiques et l'anatomie courante, avec les
  tokens de DS-Studio ; puis export vers Figma et retour des modifications.
  Pistes : étapes (recettes, configurateur pour un seul type, test d'un plugin
  Figma sur le fichier de test, retour limité aux modifications prévues).
  Question ouverte : qui est la source de vérité, DS-Studio ou Figma ?
  Visible dans la Boîte à outils avec un badge WIP.

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

## Fait

- **Ajout et suppression de tokens**, polices comprises (29/10, voir DECISIONS.md).
