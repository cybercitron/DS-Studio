# Backlog

Idées de features et tâches à venir. Les décisions tranchées vont dans DECISIONS.md.
Tri du 29/10 selon la promesse de DS-Studio (voir « Recadrage » dans DECISIONS.md) :
fabriquer et vérifier les briques longues à produire, puis les livrer dans Figma.

## Idées de features

### Priorité haute

1. **Palette → variables Figma** (nouveau, 29/10). Livrer une palette générée
   dans Figma sous forme de variables, via un plugin Figma que je lance moi-même.
   [x] Fait le 29/10, testé : bouton « Exporter pour Figma » (Créateur de
   palettes et Couleurs › Primitives) et plugin maison
   (`connectors/figma/plugin/`, mode d'emploi dans son README). Collection
   « Primitives », rien n'est écrasé ni supprimé. Essai réel sur le fichier
   de test : refus avec Annuler, 24 primitives créées après validation, relues
   conformes.
   Suites possibles : mode sombre, autres types de variables (espacements,
   rayons), alias des sémantiques vers les primitives.

2. **Générateur de composants** : choisir un type (bouton, select, card…), cocher
   ses propriétés d'après les bonnes pratiques et l'anatomie courante, avec les
   tokens de DS-Studio ; puis export vers Figma et retour des modifications.
   Pistes : étapes (recettes, configurateur pour un seul type, test d'un plugin
   Figma sur le fichier de test, retour limité aux modifications prévues).
   Source de vérité : Figma (décision de recadrage du 29/10).
   Visible dans la Boîte à outils avec un badge WIP.
   Absorbe les deux features suivantes (fusion du 29/10) :
   - **Panneau de propriétés des composants** : choisir un composant et modifier
     ses propriétés (ex. `showIconLeft`, `size`) pour voir l'aperçu changer en
     direct. Mêmes noms de propriétés que dans Figma. Les réglages servent à
     jouer : ils ne sont pas enregistrés et ne modifient pas le DS.
     Limite : survol et focus restent à tester à la souris et au clavier.
   - **Affichage de tous les états** des composants (normal, survol, focus,
     désactivé, erreur).
     Pourquoi : appliquer la règle « distinguer les états » de DESIGN_RULES.md.

3. **Générateur de palettes accessibles** (voir les décisions du 28/10 et du 29/10).
   1) [x] Générer, ajuster et exporter une palette à partir d'une teinte hex
      (fait le 29/10, testé ; ouvert depuis la Boîte à outils) ;
   2) [x] bouton « Ajouter comme tokens primitives », via le diff (fait le
      29/10, testé) : « Rouge primaire » donne `color.rougePrimaire.050` à
      `.900` ; un nom déjà pris est signalé et le bouton se bloque, rien n'est
      écrasé ; annulable dans l'Historique. Essai réel : ajout, rechargement,
      annulation ;
   3) [ ] **mode sombre** : seconde échelle avec les mêmes règles.
   Emplacement : Boîte à outils de la barre latérale (le bouton de la barre du
   haut a été retiré le 29/10).

4. **Vérificateur de contrastes** : tableau qui teste toutes les paires de couleurs
   du DS (texte, boutons, états survol, focus, désactivé, erreur) et signale celles
   sous 4,5:1 (texte courant) ou 3:1 (grand texte).
   Pourquoi : accessibilité exigeante et lumière variable en salle d'exposition ;
   Figma ne le fait pas facilement.
   Preuve attendue : une paire insuffisante détectée, corrigée, puis revérifiée.
   Emplacement prévu : onglet Accessibilité.

- **Réorganiser l'interface** (voir la décision du 28/10), par étapes :
  1) bouton flottant et panneau Modifier ; 2) barre de gauche façon Storybook ;
  3) onglet Design avec une page par composant ; 4) onglet Accessibilité.

### Priorité moyenne

- **Documentation du DS**, générée vers Figma : pour chaque token et composant,
  ses règles d'utilisation et des DOs / DON'Ts.
  Pourquoi : mon livrable est dans Figma ; elle servira aussi au futur site de
  présentation. Dépend des composants.

- **Prototypes à partir de mes maquettes Figma** (nouveau, 29/10) : l'agent lit
  un écran Figma et l'assemble avec les composants codés, pour voir le vrai
  rendu mobile et les vraies interactions. Dépend des composants.

### Priorité basse — pistes d'amélioration

- **Illustrations de l'atelier**, libres de droits (états vides, vues
  d'ensemble, Boîte à outils, état vide de l'onglet Primitives), licence de
  chacune vérifiée et notée. Mises de côté le 29/10.

## En pause

- **Alias** : relier un token sémantique à une primitive (ex. « texte » pointe
  vers « rouge 700 »). En pause le 29/10 : les variables Figma le font.
  Inclut la colonne « pointe vers » de la vue Couleurs.

- **Modes clair et sombre** des tokens sémantiques. Obligatoires pour la web app
  du CAPC, mais gérés par les variables Figma. Dépend des alias.

- **Liste des templates** : écrans types assemblés à partir des composants.
  En pause le 29/10 : le maquettage reste dans Figma.

- **Mode « salle d'exposition »** : une seconde palette pour les salles sombres ou
  très éclairées, avec un bouton pour basculer.
  Limites : demande de faire évoluer le modèle de tokens (migration prudente) ;
  besoin à confirmer d'abord par observation en salle.

## Abandonné

- **Remplacer l'agent intégré (Codex) par Claude** (29/10) : je travaille déjà
  avec Claude dans le terminal.

## Projet à part

- **Site de présentation du DS**, plus soigné qu'une page de documentation dans
  Figma. À créer une fois le DS finalisé.

## To do

- [ ] Réfléchir aux composants à intégrer dans le DS de la web app CAPC, à partir
      des maquettes (pistes : carte d'œuvre, bloc « pour aller plus loin »).
- [ ] Vérifier quels états des composants sont déjà visibles dans DS-Studio.
- [ ] À l'import de la charte CAPC : revoir `color.brandHover` (bleu d'origine,
      ne va plus avec le violet de `color.brand`) et choisir comment relier les
      variables Figma à DS-Studio.

## Fait

- **Ajout et suppression de tokens**, polices comprises (29/10, voir DECISIONS.md).

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
  Les illustrations sont passées en priorité basse.

- **Vue Couleurs : onglets Primitives et Semantic** (voir la décision du 29/10).
  [x] Les deux onglets (fait le 29/10, testé) : Primitives = une rangée de
  pastilles par palette, état vide avec « Créer une palette » ; Semantic =
  groupes repliables Marque, Texte, Fonds, Bordures, États (+ Autres), avec
  les composants qui utilisent chaque token. Clic → panneau Modifier.
  Testé à la souris et au clavier, en grand écran et à 375 px.
  Reste : l'illustration de l'état vide (priorité basse) ; la colonne « pointe
  vers » et les colonnes par mode sont en pause avec les alias.
