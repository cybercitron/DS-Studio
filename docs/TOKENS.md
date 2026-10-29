# Tokens et échanges locaux

Le schéma version 2 conserve un JSON à clés plates :

```json
{ "color.brand": { "$type": "color", "$value": "#3154C4" } }
```

Cet extrait n’est **pas un fichier complet importable**. Exportez le fichier complet
par l’application ou prenez `workspace/design-system.tokens.json` comme modèle.
Une clé absente du fichier importé sera proposée à la suppression, une clé
nouvelle à l'ajout : relisez le diff.

## Noms et types

Un nom commence par une famille, puis des mots (minuscules, majuscule interne
permise) ou des numéros séparés par des points : `color.rouge.500`, `space.xl`,
`font.titre`. 64 caractères et 500 tokens au maximum ; deux noms qui ne diffèrent
que par les majuscules sont refusés. Chaque token devient une variable CSS
(`color.rouge.500` → `--color-rouge-500`).

| Famille   | Type accepté        |
| --------- | ------------------- |
| `color.`  | couleur `#RRGGBB`   |
| `space.`  | dimension           |
| `radius.` | dimension           |
| `font.`   | dimension ou police |

Les dimensions sont des nombres de 0 à 128, convertis en pixels CSS. Une police
est le nom d'une police installée (lettres, chiffres, espaces, tirets) ; l'atelier
ajoute `system-ui, sans-serif` en secours et signale une police introuvable.
Rien n'est téléchargé : la police doit être installée sur chaque poste.

## Tokens de base, ajout et suppression

Les 18 tokens du seed sont lus par les composants. On peut les supprimer : le diff
liste alors les composants touchés, qui prennent une valeur par défaut voyante
(`#FF00FF` fuchsia, 0, ou police système) jusqu'à recréation ou annulation. Un
token de base recréé doit garder son type d'origine. Les autres tokens (par
exemple des primitives de palette) ne sont utilisés par aucun composant tant
qu'aucun alias ne les relie. Ajout et suppression passent par le panneau
Modifier, puis le diff et l'historique ; l'agent Codex ne fait que modifier.

Pas d’alias, de thèmes, d’alpha ou d’unités composées dans ce format. Ce format reprend les noms
`$type/$value` mais ne prétend pas implémenter toute la spécification DTCG (notamment
la représentation normative de couleur et dimension). Aucun convertisseur Figma
n’est fourni. Un export de plugin tiers doit être converti explicitement.

## Importer une palette

Exporter les tokens, modifier une valeur dans le JSON, puis importer via l’interface.
Le schéma et les valeurs sont validés avant proposition. Le diff et l’acceptation
sont les mêmes qu’en mode manuel. Un fichier invalide ne change ni le journal ni
le seed. Le navigateur transmet le contenu, jamais un chemin de fichier à ouvrir.

## Faire utiliser un nouveau token par un composant

Ajouter la variable dans les règles `.ds` de `styles.css`. Pour en faire un token de
base, le déclarer dans `baseTokenTypes` (`model.ts`), dans le seed et dans
`app/client/tokenUsage.ts`.

## Migration

L'état est en version 2 (patches `{key, before, after}` avec type, `null` pour un
ajout ou une suppression). Un `state.json` version 1 est traduit au démarrage, sans
perte, après archivage de l'original (`state-v1-archive-….json`). Tout futur
changement de format exige une migration testée. Ne pas effacer les données de
l’étudiant.
