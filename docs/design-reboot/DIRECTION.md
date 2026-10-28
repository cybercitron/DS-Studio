# Shape et sélection de direction

## Contexte

Mode Impeccable : **Operate**. L'étudiant travaille sur un système, en salle de
cours ou à son bureau sous lumière ambiante. Le fond clair laisse comparer les
couleurs sans imposer une ambiance nocturne ; une barre d'application en encre
violette sépare nettement l'outil de l'objet édité. Build code-led, conforme au
mode Operate. Les maquettes sont des explorations statiques, pas de fausses
fonctionnalités livrées.

## Matériau de conception

Sept sources, par résonance : nuancier annoté, mur de critique d'atelier,
planche d'identité, spécimen de fonderie, inventaire d'archives, cahier de cours,
épreuve d'imprimerie. Elles apportent palette, typographie, densité et un geste,
pas des contrôles exotiques. Le mécanisme propre à DS-Studio est la propagation
d'une valeur validée dans un vocabulaire partagé de composants.

`concept-seed --scope direction --mode operate` a réellement été exécuté après
init. Référence : `seed:c0f2a9a91f4e2049`, position assignée 4 : **spécimen de
fonderie**. Les challengers ont été interprétés selon les limites Operate.

| Challenger officiel           | Identification / clarté                                                      | Verdict et discipline conservée                                 |
| ----------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Dark-first developer console  | familière aux développeurs / moins lisible comme atelier étudiant en journée | Décliné ; séparation nette des actions dangereuses.             |
| Crouwel grid specimen         | reconnaissable par les designers / grille décorative peu utile aux tokens    | Compétitif ; alignement rigoureux des valeurs et des noms.      |
| Centre-rail reference setting | lecture éditoriale / rail et microtexte compliquent les tâches               | Décliné ; annotations proches de l'objet sélectionné.           |
| Timetable slide rack          | densité intéressante / inclinaison et taille unique nuisent aux formulaires  | Décliné ; densité cohérente et état dans une position stable.   |
| Saville catalog sleeve        | personnalité forte / codes de couleurs demandent un décodage                 | Décliné ; primauté d'un artefact, pas de répétition des labels. |
| Variable-font specimen        | pertinent pour les étudiants / grand glyphe ne montre pas tous les tokens    | Compétitif ; montrer réellement le résultat avant l'écriture.   |

Les boards/hero des deux challengers proches ont été demandés au domaine officiel
mais renvoient HTTP 403 ; ils ne sont pas présentés comme inspectés. Leur grammar
textuelle fournie par le moteur a été étudiée. Aucun reroll opportuniste.

## Trois architectures comparées dans le navigateur

Captures 1440 × 900 réellement ouvertes, HTML autonome conservé dans
`explorations/`. Ces notes jugent la direction, pas la qualité finale de maquettes.
Notes sur 5, pondération égale, jugement du designer et non mesure utilisateur.

| Direction             | Clarté | Personnalité | Efficacité | Accessibilité | Maintenabilité |     Total |
| --------------------- | -----: | -----------: | ---------: | ------------: | -------------: | --------: |
| Creative IDE          |      3 |            4 |          4 |             3 |              3 |     17/25 |
| Editorial Workstation |      4 |            4 |          2 |             4 |              4 |     18/25 |
| **Studio Specimen**   |  **5** |        **4** |      **5** |         **4** |          **5** | **23/25** |

**Creative IDE** : explorateur à gauche, données façon source au centre,
assistant à droite et preview inférieure. Sans compacte, code en mono, forte
densité. Efficace pour un développeur mais syntaxe trop dominante et dark mode
non justifié pour cette scène d'usage.

**Editorial Workstation** : document large, nuancier visuel, inspecteur à droite,
assistant sur demande. Grande hiérarchie, densité faible, sans lisible. Bonne
revue d'identité, trop contemplative pour les cycles édition/diff/résultat.

**Studio Specimen** : inventaire sémantique et inspecteur à gauche, planche de
composants dominante, aperçu comme second mode du même canevas, assistant
repliable à droite. Geist locale, valeurs tabulaires/mono, échelle serrée de
logiciel, surfaces jointives. La proposition dispose de son propre spécimen
avant/après, sans contaminer le système enregistré. Le canevas peut s'agrandir.

## Brief retenu

- Travail : sélectionner un rôle sémantique nommé, éditer, proposer, comparer,
  accepter ou refuser ; retrouver et annuler une révision.
- Structure : une barre d'application, inventaire/inspecteur, canevas à deux vues,
  assistant facultatif. Réduire les panneaux, pas les capacités. Petites fenêtres :
  quatre destinations explicites, composants montés pour conserver les états.
- États : brouillon, proposé, enregistrement, erreur, conflit, vide, indisponible.
  Les composants et l'iframe reflètent la révision enregistrée ; seul le spécimen
  du diff présente la proposition avant acceptation.
- Frontières : backend, sécurité, stockage et launcher intacts. Pas d'intégration
  Figma fictive, pas de simulation de réponse IA non signalée.

La mission autorise explicitement le choix sans intervention de Max : pas de
page de vote ni de fausse confirmation. Les tours interactifs standard init /
shape / sélection sont remplacés par ce mandat, pas par une prétendue réponse.
