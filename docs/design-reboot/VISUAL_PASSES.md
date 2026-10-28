# Journal des revues visuelles

Ces observations proviennent d'images réellement ouvertes, pas de conclusions
à partir d'un build. Le code de capture est `scripts/design-review.mjs`. Il lance
désormais son propre serveur avec des données temporaires, puis ferme navigateur,
serveur et dossier de fixtures. Aucune donnée privée de l'application n'est utilisée.

## Avant

La capture rejetée a été copiée avant toute refonte dans `before/desktop.png`.
Les deux agents d'audit ont inspecté l'application réellement servie sur fixtures.
A a ouvert ses images 1440 et 1100 ; B a testé les parcours dans un autre navigateur.

## Passe1 — structure et premier rendu

14 captures sous `pass-1/`, toutes ouvertes : principal, édition, diff, historique,
aperçu, canevas agrandi, brief, chat synthétique,1280,375,320,844,720 et aperçu mobile.

Constats : le canevas domine enfin, mais le catalogue reste un long document
linéaire ; la grande carte occupe toute la largeur. À 1280, le texte de réponse
chat peut passer derrière le compositeur : sa base flex fixe ne suit pas sa taille
réelle. À 320×568 et en paysage, l'inventaire n'a presque plus de fenêtre utile.
Le libellé Design System casse sur deux lignes dans la navigation étroite.

Corrections : planche de spécimens en deux colonnes quand le conteneur le permet,
libellés de sections compacts, base flex automatique pour la conversation,
défilement du panneau entier sous 600 px de haut, destination courte Tokens.
Retrait du titre manuel à tonalité promotionnelle et d'une explication répétée.
Le statut de succès devient vert pâle plutôt qu'un bandeau jaune d'avertissement.

## Passe2 — typographie, densité et états

14 captures sous `pass-2/`, toutes ouvertes. La comparaison avec la passe1 montre
carte et formulaire côte à côte, alignement plus net et fin du chevauchement chat.
Les faibles hauteurs donnent accès à l'inventaire par une vraie région défilante.

Constats : la proposition de contraste sort encore de la partie visible de
l'inspecteur en cours d'édition ; les messages de validation restent affichés sans
fermeture ; le spécimen du diff pourrait être interprété comme une simulation
exhaustive de tous les composants.

Corrections : inspecteur autorisé jusqu'à 60 % de la hauteur desktop, suppression
d'une phrase redondante dans le brouillon, fermeture explicite du message,
mention exacte du périmètre « Spécimen : bouton principal ». La sécurité de
validation n'est pas allégée. Les champs, l'action et les statuts restent voisins.

## Passe3 — harden et polish

14 captures sous `pass-3/`, toutes ouvertes. Vérification des mêmes scénarios,
du contexte PFE, des panneaux, des petites fenêtres et du chat explicitement
étiqueté fixture. Pas de pageerror applicatif. Les captures confirment que le
diff est une interruption bornée et que le brouillon ne recolore pas le canevas.

Le reviewer indépendant Impeccable a ouvert les 14 images et relu les sources.
Il a relevé trois surtitres hérités du système fictif, contraires au craft-floor.
Correction en une passe : retirer les surtitres et conserver la durée d'atelier
comme métadonnée ordinaire sous le titre. Toutes les vues ont été recapturées
sous `final/`. Le reviewer a déclaré cette correction résolue.

## Clôture technique du contraste

L'audit initial avait laissé les contrastes à qualifier. Les calculs ont établi
un contour de champ à 1.62:1. Nouveau token chrome de contrôle : 3.3234:1 au repos.
Le reviewer a ensuite détecté un survol à 2.9431:1 ; il utilise maintenant un token
plus sombre à 4.6309:1. Le test navigateur vérifie repos ET survol, ainsi que texte
et compositeur. Dernier build et captures `final/` refaits et inspectés ; verdict
ciblé `ship` pour les corrections notées, pas une certification de toute la surface.

Les couleurs de bordure de Lisière n'ont pas été changées : elles appartiennent
au système édité, pas au chrome. Leurs éventuels défauts ne sont pas masqués par
une modification silencieuse du seed.

## Zoom et validité des captures

Vrai zoom Chromium 100/125/150/200%, réglé avec `chrome.tabs.setZoom` dans un profil
jetable contenant uniquement l'application de test. Ni zoom CSS ni simple viewport
simulé. À 200 %, largeur CSS 720, hauteur 456, DPR 2 ; document 720×456, zoom CSS 1.
Les parcours diff/refus et aperçu 320 sont exécutés à ce zoom.

Les premières captures Playwright de ce profil sans viewport étaient recadrées
sur un quart de la surface physique. Elles ont été rejetées et remplacées par
`Page.captureScreenshot` sans clip CSS. Les deux fichiers finaux ont été ouverts :
`final/real-zoom-200-diff.png` et `final/real-zoom-200-preview.png`. Ne pas confondre
ce défaut du harnais de capture avec un débordement de l'application.

Références techniques : [extensions Chromium sous Playwright](https://playwright.dev/docs/chrome-extensions)
et [API native setZoom](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom).

## Limites de la méthode

La mission délègue le choix de direction et impose au moins trois revues : elle
prime sur les confirmations interactives et la limite standard de deux regards
new-work. Le tirage et les playbooks officiels ont bien été utilisés ; aucun vote
humain ou chargement natif de skill n'est inventé. Les images externes de
calibration ont renvoyé HTTP 403. L'overlay a été bloqué par la CSP, conservée intacte.
Le chat des captures est une fixture interceptée, jamais une réponse IA réelle.
