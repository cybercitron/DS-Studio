# Refonte UI / direction artistique de DS-Studio

27 octobre 2026 — **IMPLEMENTED et TESTED sous Linux / Chromium**.

## 1. Audit de départ

L’interface était fonctionnelle, mais sa composition ressemblait davantage à une
page de présentation qu’à un outil de travail. Le relevé navigateur avant
modification, sur des données fictives, donne **1440 × 1937 px de document pour
une fenêtre de 1440 × 900 px**. Les panneaux commençaient à 279,5 px du haut ;
le catalogue central atteignait 1595 px de hauteur.

Les causes précises de l’impression « interface générée » étaient les suivantes :

- Une introduction promotionnelle, un sous-titre et une seconde navigation
  repoussaient les outils, sans apporter d’action supplémentaire sur desktop.
- Trois grandes cartes arrondies de hauteurs indépendantes produisaient une
  composition flottante et de nombreux espaces sans fonction.
- Bleu de marque, bleu des contrôles, fonds bleutés, pastilles et badges se
  concurrençaient. Le chrome et les composants d’exemple semblaient appartenir
  à la même couche visuelle.
- L’étoile décorative, les slogans et les explications répétées prenaient le pas
  sur les actions d’édition. Recherche, couleur et valeur occupaient trop de lignes.
- Les breakpoints empilaient les panneaux sous la fenêtre. L’historique poussait
  lui aussi la page ; l’iframe de hauteur fixe ajoutait un second défilement vertical.

## 2. Direction retenue

**Un atelier éditorial, calme et précis**, avec les conventions d’une application
professionnelle. L’inspiration minimaliste concerne la hiérarchie, la grille et
la retenue ; aucun site n’a été reproduit.

| Élément     | Choix appliqué au chrome de l’atelier                                     |
| ----------- | ------------------------------------------------------------------------- |
| Fonds       | Craie `#f6f5f2`, surface `#fdfcfb`, scène d’aperçu gris sauge             |
| Texte       | Anthracite `#242723`, secondaire `#72756d`                                |
| Structure   | Traits `#dedfd7`, surfaces jointives plutôt que cartes flottantes         |
| Accent      | Terre cuite `#a7432b`, réservé aux actions et au focus                    |
| Typographie | DM Sans variable embarquée, titres resserrés, repères numérotés monospace |
| Géométrie   | Rayon de contrôle 5 px, dialogues 8 px, écran d’aperçu 16 px              |
| Mouvement   | Transitions de 140 ms, désactivées avec `prefers-reduced-motion`          |

La police est locale : pas d’appel Google Fonts à l’ouverture de l’application.
Son fichier non modifié et sa licence SIL OFL sont dans `app/client/fonts/`.
Source : [Google Fonts / DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans).
Aucune dépendance npm n’a été ajoutée.

Les tokens de Lisière, leurs valeurs initiales et les composants partagés ne sont
pas recolorés par cette direction artistique. Ils restent l’objet éditable ; le
chrome conserve sa propre identité même après un changement de marque.

## 3. Changements ergonomiques

### Fenêtre et panneaux

- La racine occupe `100dvh`, avec repli `100vh`. Le document principal et le corps
  ne défilent pas ; la grille prend toute la hauteur restante.
- À partir de **1100 px**, Agent, Design System et Aperçu sont visibles ensemble,
  séparés par des traits continus. Le panneau central reste prioritaire.
- En dessous de **1100 px**, trois boutons de navigation remplacent l’empilement.
  Un seul panneau est visible à la fois, Design System par défaut. Les composants
  restent montés : changer de panneau ne perd ni brouillon, ni brief en cours,
  ni conversation. Le focus suit le panneau choisi.
- En faible hauteur, les en-têtes deviennent plus compacts. Les longues zones
  restent accessibles par défilement interne, plutôt que coupées définitivement.

### Édition et accompagnement

L’introduction est remplacée par une barre de travail compacte. Import et export
restent immédiatement accessibles. Le panneau Agent explique le parcours en trois
étapes concrètes. Le brief reste repliable et l’IA facultative. La recherche garde
un nom accessible sans ajouter une ligne de libellé visible ; le résultat n’est
annoncé que lorsqu’une recherche est saisie. La couleur visuelle et sa valeur
textuelle sont réunies dans le même groupe. Brouillon, contraste et validation
explicite restent présents.

L’historique s’ouvre maintenant dans un dialogue natif borné à la fenêtre, avec
fermeture explicite et touche Échap. Une annulation passe toujours par le diff ;
les deux dialogues ne restent pas ouverts simultanément. Le dialogue de validation
conserve son focus initial sur « Ne pas appliquer », le refus des propositions
périmées et la gestion des erreurs.

### Aperçu

La scène gris sauge isole visuellement l’écran. Les dimensions affichées et le
repère 1:1 rendent la largeur réelle explicite. L’iframe adapte sa hauteur à la
place disponible, sans réduire sa largeur ni utiliser de transformation de zoom.
Les contenus défilent dans l’écran ; les grandes largeurs utilisent le défilement
horizontal local de la scène. Un débordement de 2 px dû aux bordures de l’iframe a
été mesuré puis corrigé pour éviter une barre verticale de scène inutile.

Le document de prévisualisation conserve intentionnellement son propre scroll :
c’est un document isolé **dans l’iframe**, pas le document principal de l’atelier.

## 4. Fichiers principaux

| Fichier                                   | Responsabilité                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| `app/client/App.tsx`                      | Hiérarchie, navigation compacte, historique modal, éditeur et scène d’aperçu |
| `app/client/styles.css`                   | Nouveau chrome, grille plein écran, défilements locaux, responsive et états  |
| `app/client/main.tsx`                     | Séparation explicite du document principal et de la prévisualisation         |
| `app/client/fonts/DM-Sans.ttf`, `OFL.txt` | Police embarquée et licence                                                  |
| `tests/e2e/studio.spec.ts`                | Parcours existants conservés, titre adapté, indépendance du chrome vérifiée  |
| `tests/e2e/workspace.spec.ts`             | Contrôles de fenêtre, responsive, défilement local, clavier et états         |

Aucun changement au backend, au schéma des tokens, aux dépendances npm ou aux
lanceurs. Aucun état étudiant n’est réinitialisé. Les essais utilisent des dossiers
temporaires et des données fictives. MARC n’a pas été modifié. Aucun commit,
push ou déploiement n’a été effectué.

## 5. Vérifications exécutées

| Contrôle                | Résultat et portée                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `npm run check`         | Réussi : TypeScript, application et tests                                                     |
| `npm run build`         | Réussi : compilation de production, police locale incluse                                     |
| `npm test`              | **29/29** : store, API, agents hors ligne, brief, conflits et crash                           |
| `npm run test:e2e`      | **14/14** sous Chromium : 10 parcours existants et 4 contrôles d’interface                    |
| `npm run test:launcher` | **22/22** : installation/compilation isolées, vrais processus, arrêt, reprise et restauration |
| `npm run qualify`       | Réussi : vrai lanceur, verrou, disque, redémarrage et annulation                              |
| `npm run scan`          | Réussi, aucune alerte ; contrôle heuristique, pas certification                               |

### Plein écran mesuré

Les assertions portent sur la largeur et la hauteur réelles du document, du corps
et de la racine, ainsi que sur l’impossibilité de déplacer la fenêtre par
`window.scrollTo`. Les panneaux visibles restent dans la fenêtre. Le bas du
catalogue reste accessible et interactif par scroll local : le contrôle ne se
limite donc pas à masquer du contenu avec `overflow: hidden`.

| Fenêtre CSS                          | Document principal     | Présentation            |
| ------------------------------------ | ---------------------- | ----------------------- |
| 1920 × 1080, 1600 × 1100, 1440 × 900 | Identique à la fenêtre | Trois panneaux          |
| 1366 × 768, 1280 × 720, 1100 × 700   | Identique à la fenêtre | Trois panneaux          |
| 1099 × 800, 1024 × 768, 700 × 900    | Identique à la fenêtre | Panneaux commutables    |
| 375 × 812, 320 × 568                 | Identique à la fenêtre | Panneaux commutables    |
| 844 × 390                            | Identique à la fenêtre | Mode compact en paysage |

À **1440 × 900**, le document passe donc de **1937 à 900 px** de hauteur, sans
perdre l’accès au catalogue. Les viewports internes **320, 375, 430 et 1024 px**
restent vérifiés à largeur réelle, avec contrôle du débordement horizontal de leur
contenu et de la grille responsive.

Les tests couvrent également proposition/refus/validation, persistance après
recharge, annulation sélective, import/export, contraste, récupération du brouillon,
brief privé, conflit multi-onglets, capacité de session renouvelée, navigation,
formulaire, focus, hover et désactivé. Le chrome ne se recolore pas après validation
d’une nouvelle couleur de marque. Le passage entre panneaux et les dialogues sont
testés à 375 px, y compris le lien d’accès direct depuis le panneau Agent.

### Preuves locales

Les captures ont été réellement ouvertes et examinées ; elles ne remplacent pas
les assertions de comportement. Les artefacts sont ignorés par Git et ne
contiennent que les fixtures des tests :

- `test-results/ui/before.png`, `desktop.png`, `mobile.png` et `landscape.png`.
- `test-results/ui/diff.png`, `codex-panel.png` et `fullscreen.json`.
- `test-results/e2e.json` et captures des scénarios Playwright.

Une nouvelle exécution Playwright peut remplacer `test-results/`.

## 6. Points encore perfectibles et limites

- Cette livraison ne vaut pas audit WCAG complet. Les focus, noms accessibles,
  contrastes indiqués, états et parcours clavier concernés ont été contrôlés ;
  une revue complète avec technologies d’assistance reste distincte.
- La refonte est qualifiée sur Chromium/Linux, pas sur Safari, Firefox ou des
  appareils mobiles physiques. Les lanceurs natifs macOS/Windows n’ont pas été
  requalifiés sur leurs systèmes pendant cette intervention.
- Le panneau Codex a été inspecté, sans envoi cloud ni consommation volontaire de
  quota. Son contrat reste inchangé. Claude, Gemini et la connexion Figma ne sont
  pas implémentés par cette refonte.
- Les très petits écrans demandent un changement de panneau et du scroll local.
  La largeur de prévisualisation reste volontairement réelle : une vue de 1024 px
  dans une petite fenêtre nécessite un déplacement horizontal, pas un zoom réduit.
- Une session d’usage avec des étudiants reste utile pour évaluer la compréhension
  et la densité. La validation esthétique finale appartient à Max.
