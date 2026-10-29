# Plugin Figma « DS-Studio — variables »

Ce plugin crée dans Figma les variables couleur d'une palette faite dans
DS-Studio. Vous le lancez vous-même, dans le fichier ouvert. Il ne contacte
aucun service et ne voit que le fichier Figma ouvert.

Ce qu'il fait, et seulement ça :

- il lit un fichier `….figma-variables.json` exporté par DS-Studio ;
- il montre ce qu'il va créer : rien n'est écrit à ce moment-là ;
- il crée les variables seulement quand vous cliquez sur « Valider et créer » ;
- il relit ensuite chaque variable dans Figma et affiche le résultat.

Il ne remplace jamais une variable qui existe déjà, et ne supprime rien. Une
variable du même nom avec une autre valeur est signalée, puis laissée telle quelle.

## 1. Exporter depuis DS-Studio

Deux endroits, même bouton « Exporter pour Figma » :

- **Créateur de palettes** (Boîte à outils) : la palette en cours, par exemple
  `rougePrimaire.figma-variables.json` ;
- **Couleurs › Primitives** : toutes les primitives déjà ajoutées comme tokens,
  dans `primitives.figma-variables.json`.

Le fichier arrive dans votre dossier Téléchargements. L'export ne modifie pas
votre Design System.

## 2. Installer le plugin dans Figma (une seule fois)

Il faut l'application Figma pour ordinateur : le navigateur ne permet pas
d'importer un plugin de développement.

1. Ouvrez le fichier Figma de test.
2. Menu principal (logo Figma en haut à gauche) › **Plugins** › **Development**
   › **Import plugin from manifest…**
3. Choisissez le fichier `connectors/figma/plugin/manifest.json` de ce dépôt.

Le plugin apparaît ensuite dans **Plugins › Development › DS-Studio — variables**.

## 3. Créer les variables

1. Lancez **Plugins › Development › DS-Studio — variables**.
2. Choisissez le fichier exporté à l'étape 1.
3. Lisez l'aperçu : nom du fichier Figma, collection « Primitives » (créée si
   elle n'existe pas), variables à créer, déjà identiques ou différentes.
4. Si l'aperçu ne convient pas : **Annuler**. Rien n'est écrit.
5. Sinon : **Valider et créer**. Le plugin écrit, puis relit chaque variable.
6. Vérifiez le résultat : « N/N variables conformes ». Vous les retrouvez dans
   le panneau **Variables** (Local variables › Primitives), rangées en dossiers :
   `color › rougePrimaire › 050`.

Pour revenir en arrière dans Figma : **Cmd+Z** juste après, ou supprimer les
variables à la main dans le panneau Variables.

## Format du fichier

```json
{
  "format": "ds-studio.figma-variables",
  "version": 1,
  "collection": "Primitives",
  "variables": [
    { "name": "color/rougePrimaire/050", "type": "COLOR", "value": "#FFF4F2" }
  ]
}
```

Seules les couleurs `#RRGGBB` sont acceptées, 500 variables au maximum. Un fichier
d'un autre format est refusé avant toute lecture du fichier Figma.

## Garde-fous

- La validation est liée à l'aperçu affiché et ne sert qu'une fois. Si le
  fichier Figma change entre l'aperçu et le clic (par exemple si quelqu'un
  ajoute une variable), le plugin refuse et demande de relancer l'aperçu.
- Le plugin n'a pas d'accès réseau (`networkAccess: none` dans le manifest).
- Les noms sont comparés sans tenir compte des majuscules : `color/Rouge/500`
  et `color/rouge/500` sont considérées comme la même variable.

## Limites

- Couleurs seulement, un seul mode (celui par défaut de la collection).
  Pas d'alias, pas de mode sombre.
- Le plugin ne vérifie pas l'identité du fichier Figma : il affiche son nom,
  à vous de vérifier que c'est le bon avant de valider.
- Si une erreur survient au milieu de l'écriture, une partie des variables
  peut avoir été créée : relancez l'aperçu pour voir l'état réel.
- Testé avec une simulation de Figma (`tests/figma-plugin.test.ts`) et par un
  essai réel le 29/10 sur le fichier de test (Figma pour ordinateur, plan
  Étudiant) : refus avec Annuler, 24 variables créées, relues conformes.
