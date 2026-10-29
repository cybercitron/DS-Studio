# Journal de décisions du projet

## V1 — Starter

React permet d’employer exactement les mêmes composants dans le catalogue et
le viewport isolé. Le backend HTTP Node utilise la bibliothèque standard ; Zod
valide les entrées et les fichiers. Vite compile le frontend. Pas d’Electron,
base distante, Figma ou LLM obligatoire.

Codex propose du JSON sans outils ; le contrôleur est l’unique auteur des changements
locaux validés. Claude et Gemini ne sont pas activés sans qualification.

## 2026-10-28 — Tailles pensées pour un usage à une main

- **Problème** : la web app est consultée sur mobile, à une main, debout, en salle
  à lumière variable.
- **Options explorées** : (1) créer des tokens dédiés « une main » ; (2) choisir
  les tokens de taille existants en gardant cette contrainte en tête.
- **Décision** : option 2.
- **Raison** : la contrainte concerne toutes les tailles, pas une famille à part ;
  ajouter des tokens exigerait une migration du modèle.
- **Preuve attendue** : chaque choix de taille vérifié dans l'aperçu 320 à 430 px ;
  règle ajoutée dans DESIGN_RULES.md.
- **Limite connue** : aucune vérification automatique, cela repose sur la rigueur
  des choix.

## 2026-10-28 — Séparer backlog et décisions

- **Problème** : idées de features et to do se mélangeaient aux décisions.
- **Options explorées** : (1) tout dans DECISIONS.md ; (2) un fichier BACKLOG.md
  séparé.
- **Décision** : option 2.
- **Raison** : le journal garde la trace de ce qui est tranché, la to do change
  souvent.
- **Preuve attendue** : BACKLOG.md créé et tenu à jour.
- **Limite connue** : deux fichiers à garder cohérents.

## 2026-10-28 — Abandon de l'espace de jeu pour maquetter

- **Problème** : maquetter des écrans dans DS-Studio à partir des composants.
- **Options explorées** : (1) glisser-déposer libre ; (2) composants empilés en
  une colonne mobile, avec espacements appliqués automatiquement ; (3) ne pas le
  faire et maquetter dans Figma.
- **Décision** : option 3, idée abandonnée.
- **Raison** : ce serait refaire Figma en moins bien. Figma reste l'outil de
  maquettage ; DS-Studio sert à consulter, modifier et tester le DS.
- **Preuve attendue** : aucune, piste écartée volontairement.
- **Limite connue** : DS-Studio ne vérifie pas les espacements d'un écran complet.

## 2026-10-28 — Pont Figma → DS-Studio pour les composants

- **Problème** : concevoir les composants dans Figma et les retrouver dans
  DS-Studio.
- **Options explorées** : (1) l'agent lit le composant Figma (lecture seule) et le
  traduit en code avec les tokens, puis je valide ; (2) export d'images ;
  (3) convertisseur automatique maison.
- **Décision** : option 1.
- **Raison** : faisable dès maintenant avec le connecteur Figma ; le composant
  reste vivant (états, tokens, aperçu mobile) ; rien n'est écrit dans Figma et je
  valide chaque étape. Les images (2) ne suivent pas les tokens ; le convertisseur
  (3) est un trop gros chantier.
- **Preuve attendue** : un composant du fichier de test lu, traduit, puis vérifié
  dans DS-Studio avec ses propriétés aux mêmes noms que dans Figma.
- **Limite connue** : pas automatique, une tâche par composant ; le plan Figma
  Étudiant peut limiter le nombre de lectures.

## 2026-10-28 — Réorganisation de l'interface de DS-Studio

- **Problème** : l'atelier mélange liste et modification des tokens à gauche ; la
  colonne Agent occupe une place fixe alors que je travaille surtout avec Claude
  dans le terminal ; rien n'est prévu pour les états, la documentation et
  l'accessibilité des composants. Je regarde surtout les composants et l'aperçu,
  uniquement sur ordinateur.
- **Options explorées** : (A) petites retouches du plan actuel ; (B) canevas à
  onglets et panneau de réglages à droite ; (C) menu de sections façon site de
  documentation de DS.
- **Décision** : option B, ajustée.
  - Barre de gauche façon Storybook : une recherche (composants et tokens), les
    familles de tokens (couleurs, typographie, espacements), puis la liste des
    composants par ordre alphabétique.
  - Onglets du centre : **Design** (renomme « Composants » ; page du composant
    à faire défiler : aperçu interactif avec ses props, définition, anatomie,
    propriétés), **Aperçu** (inchangé), **Accessibilité** (ce qu'un développeur
    doit savoir, plus les contrastes si c'est utile).
  - Les onglets s'adaptent à la sélection : sur une famille de tokens, Design
    montre les valeurs et Accessibilité les contrastes.
  - La colonne de droite devient un bouton flottant qui ouvre un panneau latéral
    de modification. Les tokens ne se modifient que dans ce panneau, avec un mode
    manuel sans IA et l'agent en option.
- **Raison** : un plan proche de Figma et Storybook, centré sur ce que je fais le
  plus (regarder et tester les composants). Chaque idée du backlog y trouve sa place.
- **Preuve attendue** : chaque étape vérifiée dans l'atelier (capture), plus
  `npm run check`, `npm test` et `npm run build`. Une modification de token reste
  possible sans IA.
- **Limite connue** : gros chantier, à faire par petites étapes. Les textes de
  définition et d'anatomie sont à écrire par moi. La version mobile de l'atelier
  n'est pas une priorité, mais on garde celle qui existe.

## 2026-10-28 — Générateur de palettes accessibles

- **Problème** : la charte du CAPC (8 couleurs) n'est pas assez accessible.
  Sur blanc, le jaune, le vert, le cyan et le rose sont illisibles (1,1 à 1,7:1) ;
  le rouge, le violet et l'orange restent sous 4,5:1. Sur noir, presque toutes
  passent. Je dois prévoir un mode clair et un mode sombre, en AA minimum
  (AAA idéalement), en gardant l'ambiance générale de la charte.
- **Options explorées** : (A) nuances par mélange avec du noir et du blanc, avec
  une pastille de contraste (façon Scale) ; (B) je choisis le contraste visé et
  l'outil trouve la nuance (façon Leonardo) ; clarté seule ou décalage de teinte ;
  couleur de départ placée selon sa clarté ou toujours en 500 ; générateur
  autonome ou relié aux tokens.
- **Décision** : approche B, dans un outil ouvert par un bouton de la barre de
  navigation.
  - Je pars d'une teinte hex et d'un nom libre (ex. « Rouge primaire »).
  - La couleur de la charte est toujours le 500, la plus vive de l'échelle.
    Vers 050, elle se rapproche du blanc et perd en saturation ; vers 900, elle
    fonce. Les rôles d'accessibilité sont signalés sur les numéros qui les
    remplissent, quels qu'ils soient.
  - L'outil propose automatiquement un décalage de teinte selon la couleur de
    départ : direction d'éclaircissement et d'assombrissement propre à chaque
    famille de teinte, avec des pas par défaut de 5°, 8° et 12° autour de la
    couleur de départ. Saturation et décalage restent réglables.
    Source : « Principles of creating a color palette in interface design »,
    Design Systems Collective (section « Determining the hue shift step »).
  - L'outil trouve les nuances qui atteignent les contrastes visés ; je peux
    retoucher chaque nuance, une alerte s'affiche sous le seuil requis.
  - Résultat : une échelle numérotée (050 → 900) où sont signalés 6 rôles (fond,
    décor, 3:1, 4,5:1, 7:1, extrême), pour le mode clair et pour le mode sombre.
    Les contrastes se calculent sur la nuance de fond de la palette.
  - En deux temps : d'abord générer, ajuster et exporter ; ensuite un bouton
    « Ajouter comme tokens primitives », qui passe par le diff avant validation.
- **Raison** : je garde la main sur l'esthétique sans risquer de passer sous les
  seuils. Le décalage de teinte évite les nuances ternes, comme un jaune foncé qui
  tourne au kaki. Les primitives n'ont pas de mode : je peux créer les palettes
  maintenant et traiter les modes plus tard, dans les tokens sémantiques.
- **Preuve attendue** : sur une couleur du CAPC (ex. le jaune `#FFFF0A`), chaque
  rôle atteint son ratio sur son fond, en clair et en sombre ; une retouche sous
  le seuil déclenche l'alerte. Au second temps : famille de primitives créée via
  le diff, toujours présente après rechargement, annulable.
- **Limite connue** : le second temps dépend de l'ajout de tokens. Les primitives
  ne seront pas encore reliées aux tokens sémantiques (alias à faire). Un jaune
  lisible sur fond clair ne sera jamais vif. Pour les couleurs très claires et
  vives (jaune, cyan), les rôles de texte sur fond clair tombent dans les nuances
  les plus foncées. Le jugement esthétique reste le mien.

## 2026-10-29 — Ajout et suppression de tokens (schéma version 2)

- **Problème** : la liste des tokens était figée (18 tokens, 4 polices). La charte
  du CAPC (8 couleurs déclinées en palettes de 050 à 900) n'y entre pas. C'est un
  prérequis du second temps du générateur de palettes, puis des alias et des modes.
- **Options explorées** : nommage libre ou encadré par famille ; suppression d'un
  token utilisé par un composant refusée ou permise après alerte ; polices par
  nom libre, liste élargie ou import de fichier ; migration au démarrage ou au
  premier enregistrement.
- **Décision** :
  - Nom encadré : une famille (`color.`, `space.`, `radius.`, `font.`) puis des
    mots ou des numéros séparés par des points (ex. `color.rouge.500`). La famille
    fixe le type ; `font.` accepte une police ou une taille.
  - Suppression permise après une alerte qui liste les composants touchés. Un
    token de base supprimé prend une valeur par défaut voyante : fuchsia
    `#FF00FF` pour une couleur, 0 pour une dimension, police système pour une police.
  - Polices : nom libre d'une police installée, police de secours automatique,
    alerte si elle est introuvable sur l'ordinateur.
  - Migration de la version 1 vers la version 2 au démarrage ; l'original est
    archivé intact dans `.ds-studio/` (`state-v1-archive-….json`).
  - Ajout et suppression passent par le même diff, la même validation et la même
    annulation que les modifications.
- **Raison** : le rangement par famille garde la barre de gauche lisible et reste
  proche des variables Figma. Le fuchsia rend un oubli impossible à rater. La
  migration au démarrage évite de gérer deux formats.
- **Preuve** : 37 tests unitaires (dont la migration d'un état v1 à 4 révisions
  et le refus d'un journal incohérent), 20 tests de parcours, essai réel sur une
  copie de mes données : ajout de `color.rouge.500`, rechargement, suppression de
  `color.brand` (composants en fuchsia), annulation qui le rétablit.
- **Limite connue** : l'agent Codex ne crée ni ne supprime de tokens. Une police
  n'est pas téléchargée : elle doit être installée sur chaque poste. Une ancienne
  version de l'atelier ne lit plus le fichier v2 (l'archive v1 reste). La liste
  des composants par token est tenue à la main (`app/client/tokenUsage.ts`).
