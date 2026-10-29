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

## 2026-10-29 — Générateur de palettes : réglages plutôt qu'usages imposés

- **Problème** : le générateur doit marcher avec n'importe quelle couleur, pas
  seulement celles du CAPC, comme un Scale amélioré.
- **Options explorées** : suggérer un usage par nuance, par groupes façon Radix
  (fonds, composants, bordures, couleurs pleines, texte) ; ou ne garder que le
  nombre de nuances et des règles de contraste.
- **Décision** :
  - De 3 à 12 nuances, 10 par défaut (050 → 900), sinon numérotées de 100 en 100.
  - La couleur de départ est gardée intacte, au milieu de l'échelle (le 500 sur
    10 nuances).
  - Règles « nuance A ≥ ratio sur nuance B » réglables avant le calcul ; l'outil
    ajuste les autres nuances. Une règle impossible avec la couleur de départ est
    signalée avec le meilleur ratio atteignable, sans toucher à la couleur.
  - Décalage de teinte selon la famille de la couleur de départ (12 familles,
    chacune avec sa direction en clair et en foncé : le rouge tire vers l'orange
    en clair et vers le pourpre en foncé, le jaune vers le vert et vers l'orange…),
    pas de 5°, 8° puis 12° autour du 500, réglables. Pas de décalage pour un gris.
  - Ouvert par le bouton « Palette » de la barre du haut ; export JSON seulement.
- **Raison** : décider de l'usage de chaque nuance dès sa création prête à
  confusion. Les règles gardent l'accessibilité sous contrôle sans figer l'usage.
- **Preuve** : sur le jaune `#FFFF0A`, la règle 500 ≥ 3:1 est signalée
  impossible, la couleur reste intacte et les règles de texte passent ; une
  retouche sous le seuil déclenche l'alerte. 48 tests unitaires et 21 tests de
  parcours passent ; vérifié dans l'atelier, à 320 px et en grand écran.
- **Limite connue** : pas encore de mode sombre ni d'ajout comme tokens. Au-delà
  du 200 et du 800, le décalage reste plafonné à 12°. Les jaunes foncés gardent
  une pointe kaki au réglage par défaut. Le jugement esthétique reste le mien.

## 2026-10-29 — Nouvelle structure de la barre latérale

- **Problème** : la barre latérale mélange une entrée « Vue d'ensemble » et les
  listes ; le générateur de palettes est un bouton isolé dans la barre du haut ;
  rien n'annonce les outils à venir.
- **Options explorées** : pour les sections repliables, (A) une flèche pour
  replier et le titre pour ouvrir la page de vue d'ensemble, ou (B) un seul clic
  pour les deux ; garder ou retirer le bouton Palette de la barre du haut.
- **Décision** :
  - Barre latérale foncée, de la même couleur que la barre du haut.
  - Recherche (composants et tokens) conservée en haut.
  - Deux sections repliables : **Tokens** (Couleurs, Typographie, Espacements,
    Rayons) et **Composants** (liste des composants créés). Option A : la flèche
    replie ou déplie ; le titre ouvre une page de vue d'ensemble (toutes les
    familles de tokens pour Tokens, tous les composants pour Composants).
  - L'entrée « Vue d'ensemble » disparaît de la liste.
  - Ouvertes au premier lancement, puis l'outil se souvient de mon choix.
  - En bas, une section **Boîte à outils** : Créateur de palettes, et Générateur
    de composants avec un badge « WIP », impossible à cliquer (« Bientôt
    disponible » au survol, annoncé comme désactivé aux lecteurs d'écran).
  - Le bouton Palette est retiré de la barre du haut. Cela remplace l'emplacement
    prévu dans la décision du 28/10 sur le générateur de palettes.
- **Raison** : un plan à la Figma et Storybook, où un clic ne fait qu'une chose ;
  un seul chemin vers chaque outil ; la Boîte à outils annonce la suite.
- **Preuve attendue** : capture de la barre ; repli, dépli et pages de vue
  d'ensemble testés à la souris et au clavier ; état retrouvé après rechargement ;
  générateur WIP non cliquable ; textes de la barre foncée vérifiés à 4,5:1
  (élément sélectionné, compteurs et badge compris).
- **Limite connue** : les familles de tokens restent les quatre actuelles.

## 2026-10-29 — Refonte visuelle de l'atelier, inspirée d'eBay Playbook

- **Problème** : l'habillage de DS-Studio paraît daté et anguleux. Je le veux plus
  moderne et épuré. Cela concerne l'atelier, pas les composants du DS Cartel.
- **Options explorées** : arrondis doux (8 à 12 px) ou très marqués ; séparations
  par bordures fines ou par cartes sur fond gris ; police Nunito, DM Sans,
  Quicksand ou Poppins ; un seul chantier ou deux.
- **Décision** :
  - Ce que je reprends de Playbook : arrondis **très marqués**, boutons en
    pilule, illustrations, gros titres, cartes aux ombres légères. Inspiration
    seulement : ni police, ni logo, ni couleurs d'eBay.
  - Zones de l'atelier séparées par des bordures fines.
  - Police : **Poppins** à essayer à la place de Geist, installée localement
    (licence libre OFL).
  - Illustrations libres de droits (par exemple unDraw) dans les états vides, en
    tête des pages de vue d'ensemble et dans la Boîte à outils.
  - Deux chantiers : d'abord la nouvelle barre latérale, directement dans ce
    style ; ensuite le reste de l'atelier.
- **Raison** : un atelier plus agréable et plus actuel, cohérent avec un outil
  d'aide à la création ; la barre latérale n'est pas refaite deux fois.
- **Preuve attendue** : captures avant / après ; textes et boutons vérifiés à
  4,5:1 ; focus clavier visible sur les nouveaux boutons pilule ; atelier toujours
  utilisable sans Internet ; licence de chaque illustration vérifiée et notée.
- **Limite connue** : « très marqués » et Poppins sont à tester ; on ajustera si
  cela gêne la densité des listes. Le style reste un jugement personnel.

## 2026-10-29 — Vue Couleurs : onglets Primitives et Semantic

- **Problème** : la page Couleurs mélange les couleurs brutes des palettes et les
  rôles (texte, fond, marque…). Le générateur de palettes va créer de nombreuses
  primitives : sans séparation, la page deviendra illisible.
- **Options explorées** : tri par le nom ou par une étiquette dans chaque token ;
  Couleurs seulement ou toutes les familles ; sémantiques en liste simple ou
  regroupées par rôle.
- **Décision** :
  - Deux onglets en haut de la page Couleurs : **Primitives** et **Semantic**.
  - Tri par le nom : un token qui finit par un numéro (`color.rouge.500`) est
    une primitive ; les autres sont des sémantiques.
  - Primitives : une rangée de pastilles par palette (050 → 900). État vide avec
    une illustration et un bouton « Créer une palette » qui ouvre le générateur.
  - Semantic : groupes repliables par rôle (Marque, Texte, Fonds, Bordures,
    États). Les tokens actuels sont rangés par une table de correspondance ; un
    nouveau token `color.groupe.nom` va dans son groupe ; sinon « Autres ».
    Chaque ligne : pastille, nom, valeur, composants qui l'utilisent.
  - Cliquer sur un token ouvre le panneau de modification (un seul endroit pour
    modifier).
  - Couleurs seulement pour l'instant.
  - Ordre : d'abord le bouton « Ajouter comme tokens primitives » du générateur,
    pour que l'onglet Primitives ait du contenu dès sa sortie.
- **Raison** : séparer « quelle couleur » et « à quoi elle sert », comme dans les
  DS professionnels et les variables Figma ; préparer les alias et les modes.
- **Preuve attendue** : une palette ajoutée depuis le générateur apparaît dans
  Primitives ; les tokens actuels sont tous rangés dans le bon groupe de Semantic ;
  repli, dépli et clic vers le panneau testés à la souris et au clavier.
- **Limite connue** : le tri par le nom dépend d'un nommage rigoureux. Pas encore
  de colonne « pointe vers » (alias) ni de colonnes par mode.

## 2026-10-29 — Générateur de palettes : ajout comme tokens primitives

- **Problème** : la palette générée ne pouvait qu'être exportée ; il fallait la
  recréer token par token.
- **Options explorées** : nom avec tirets (`color.rouge-primaire.050`) ou en
  camelCase (`color.rougePrimaire.050`) ; écraser une palette existante ou refuser.
- **Décision** : un bouton « Ajouter comme tokens primitives » crée une famille
  `color.nomEnCamelCase.050` → `.900`, via le même diff, la même validation et la
  même annulation que les autres ajouts. Un nom déjà pris (même avec une autre
  casse) est signalé et bloque l'ajout : rien n'est écrasé. L'export JSON reste
  disponible.
- **Raison** : le schéma v2 n'accepte pas les tirets, et un tiret rendrait deux
  noms identiques en variable CSS. Les noms finissent par un numéro : la future
  vue Couleurs les rangera en primitives.
- **Preuve** : 49 tests unitaires, 23 tests de parcours ; essai réel sur mes
  données : « Rouge primaire » ajoutée, présente après rechargement, refus du
  même nom, puis annulation.
- **Limite connue** : pas de mode sombre ni de vue Couleurs encore. Pour modifier
  une palette déjà ajoutée, il faut l'annuler ou changer de nom.

## 2026-10-29 — Recadrage : la promesse de DS-Studio

- **Problème** : en deux jours, les features se sont accumulées plus vite que le
  besoin ne se précisait ; j'ai perdu le sens de l'outil. Or mon livrable final
  (mai 2027) est un Design System dans Figma.
- **Options explorées** : DS-Studio comme second endroit où vit le DS, avec sa
  propre consultation, ses alias et ses modes ; ou DS-Studio comme atelier
  d'assistance qui fabrique, vérifie et livre dans Figma.
- **Décision** : la seconde option, avec cette promesse :
  « DS-Studio est mon assistant de création de Design System : il fabrique et
  vérifie à ma place les briques longues à produire (palettes, composants,
  variantes, documentation), puis me les livre dans Figma, où vit mon DS final. »
  - Figma est la source de vérité. DS-Studio y lit pour vérifier et y ajoute de
    nouvelles briques.
  - Priorités : 1) palette → variables Figma ; 2) générateur de composants, qui
    absorbe le panneau de propriétés et l'affichage des états. Gardés : mode
    sombre du générateur de palettes, vérificateur de contrastes, aperçu mobile.
  - Priorité moyenne : documentation générée vers Figma ; prototypes réels à
    partir de mes maquettes Figma (après les composants).
  - En pause : alias et modes dans DS-Studio (les variables Figma le font),
    liste des templates, mode salle d'exposition. Illustrations en priorité basse.
  - Abandonné : remplacer Codex par Claude dans l'outil (je travaille déjà avec
    Claude dans le terminal).
  - Projet à part, après finalisation du DS : un site de présentation du DS.
- **Raison** : ce qui me prend du temps, c'est la palette accessible, les
  composants, les variantes et la documentation. Ce que Figma ne fait pas, c'est
  vérifier l'accessibilité, montrer le vrai rendu mobile et documenter. Je ne veux
  pas d'un Figma en moins bien.
- **Preuve attendue** : chaque pont vers Figma commence par un test sur le
  fichier Figma de test : refus sans validation, écriture validée, résultat relu.
- **Limite connue** : l'écriture dans Figma passera par un plugin que je lance
  moi-même (le plan Étudiant n'a pas d'accès automatique aux variables). Les
  prototypes et la documentation dépendent des composants.
