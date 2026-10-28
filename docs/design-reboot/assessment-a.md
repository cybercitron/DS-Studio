# Assessment A — revue de conception indépendante

Surface : `app/client/App.tsx` et `app/client/styles.css`, DS-Studio en mode Operate. Inspection de l’application isolée à `http://127.0.0.1:4318`, nouveau navigateur Playwright, 1440 × 1000 et 1100 × 800. Référence rejetée : `before/desktop.png`. Captures produites : `before/audit-live.png` et `before/audit-live-1100.png`. Aucun détecteur exécuté ou consulté. Aucune modification de source, token, brief, historique ou donnée métier. Historique ouvert puis fermé ; navigateur fermé. Les mécanismes de proposition, d’écriture et d’annulation ont été lus dans le code, pas exécutés pour cette revue.

## Verdict de spécificité — commencer ici

L’application ressemble à un starter pédagogique propre, pas encore à un logiciel de création professionnel. La marque Lisière appartient au contenu de démonstration, pas à la conception de l’outil. Le chrome crème, les filets, les petites capitales et le grand titre « Du choix au changement. » pourraient habiller un générateur de formulaires ou un configurateur sans changement structurel. La structure en trois panneaux est pertinente pour la catégorie, mais traite le mode d’emploi, le catalogue et le viewport comme trois destinations de poids voisin, plutôt qu’un espace de travail avec un objet sélectionné, un résultat visible et des commandes contextuelles.

La bonne opportunité n’est pas une nouvelle décoration. C’est un atelier de Design System immédiatement reconnaissable : navigation de bibliothèque, zone de travail généreuse, inspecteur de tokens, assistant facultatif et accès explicite aux versions. La signature produit peut être une liaison visuelle discrète entre le token sélectionné et les composants qu’il affecte. Typographie, palette engagée et densité servent cette organisation standard ; aucune métaphore de terminal, de cockpit ou de magazine ne doit remplacer les contrôles familiers.

## Santé ergonomique

Échelle 0–4, 4 = excellent. Les dix heuristiques s’appliquent à cet outil de travail.

| #         | Heuristique                             |     Score | Observation décisive                                                                                                                                                    |
| --------- | --------------------------------------- | --------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Visibilité de l’état                    |         3 | Révision, brouillon, statut local et messages d’enregistrement existent ; les états utiles sont minuscules et dispersés.                                                |
| 2         | Correspondance avec le monde réel       |         3 | « Proposer », « Valider et enregistrer » et « Historique » sont clairs ; le passage de `color.onBrand` à son effet demande une traduction mentale.                      |
| 3         | Contrôle et liberté                     |         3 | Diff avec refus, abandon du brouillon, fermeture native des dialogues et annulation sélective prévue ; aucun redimensionnement des panneaux.                            |
| 4         | Cohérence et standards                  |         3 | Contrôles HTML et système de composants cohérents ; « Agent » abrite aussi le brief et le mode manuel, deux fonctions distinctes.                                       |
| 5         | Prévention des erreurs                  |         3 | Diff avant écriture, révision périmée bloquée, brouillon récupérable et bornes numériques ; aide au contraste limitée à une paire.                                      |
| 6         | Reconnaissance plutôt que rappel        |         2 | Onze pastilles sans libellé visible et une liste plate de dix-huit clés ; pas de relation visible entre sélection et composants touchés.                                |
| 7         | Flexibilité et efficacité               |         1 | Recherche disponible mais édition unitaire par select, pas d’accélérateur métier ni de mise en page réglable ; ne pas confondre Tab natif et raccourcis professionnels. |
| 8         | Esthétique et minimalisme               |         1 | Un tiers pédagogique permanent, grands espaces et microtexte de contrôle ; le contenu de démonstration prend plus de présence que les outils.                           |
| 9         | Reconnaissance et récupération d’erreur |         3 | Message réseau exploitable et conservation des validations ; erreurs communes affichées globalement plutôt qu’au champ concerné.                                        |
| 10        | Aide et documentation                   |         2 | Trois étapes utiles et explications locales ; pas d’aide contextuelle sur les tokens et leurs conséquences.                                                             |
| **Total** |                                         | **24/40** | **Acceptable : changements importants nécessaires.**                                                                                                                    |

Ce score évalue la surface actuelle et les garde-fous visibles/lus. Il ne constitue pas une nouvelle qualification de la persistance, de la sécurité ou de l’annulation.

## Ce qui fonctionne

1. La séparation entre chrome du logiciel et tokens du système édité est juste. Une expérimentation de couleur ne détruit pas la lisibilité des commandes du studio.
2. Le modèle « proposition → diff → validation » est une vraie qualité produit. Refus explicite, état de brouillon, conflits de révision et historique protègent le sentiment de contrôle ; ces protections doivent survivre à la refonte.
3. Le catalogue et l’iframe utilisent les mêmes composants. La boucle locale sans compte IA possède une utilité concrète, indépendamment d’un discours sur l’assistant.

## Problèmes prioritaires

### [P1] L’espace de travail met le mode d’emploi au même rang que le travail

**Constat :** à 1440 px, le panneau Agent mesure 341 px, le panneau DS 587 px et l’aperçu 509 px. Le panneau Agent manuel reste rempli d’un titre promotionnel, de trois étapes et de rappels permanents. L’en-tête de marque et la barre d’espace de travail occupent ensemble 143 px avant la première zone de travail. À 1100 × 800, le catalogue visible s’arrête pratiquement au premier groupe de boutons.

**Effet :** une tâche d’édition possède beaucoup de surface explicative mais peu de surface utile. L’utilisateur demandé — un créateur utilisant un outil professionnel plein écran — voit une démonstration à lire, pas un document à travailler.

**Correction :** une barre d’application compacte avec projet, révision et état ; une navigation bibliothèque étroite ; un canevas/catalogue central dominant ; un inspecteur contextuel. Déplacer le brief et l’assistant dans des panneaux ouvrables. Résumer le tutoriel dans une aide ponctuelle, sans supprimer le mode manuel. Commandes pertinentes : `layout`, `distill`.

### [P1] La banque de tokens masque les rôles sémantiques

**Constat :** onze pastilles de 24 × 24 px sans noms visibles précèdent un select plat contenant dix-huit clés. Les couleurs proches — surface, canvas, border — sont difficiles à identifier visuellement. Il faut survoler ou sélectionner pour connaître leur rôle. La recherche, la pastille et le select sont trois chemins vers le même objet, sans inventaire utile des valeurs.

**Effet :** on choisit une couleur par apparence plutôt qu’un rôle de conception. Un novice ne sait pas ce qu’il va changer ; un expert perd du temps à ouvrir le select pour passer d’une valeur à l’autre.

**Correction :** groupes Couleurs / Typographie / Espacements / Rayons, lignes avec nom humain, clé et valeur, sélection persistante et inspecteur. Conserver les clés et validations existantes. Afficher le rôle des pastilles, sans inventer des tokens. Commandes : `clarify`, `layout`.

### [P1] Le moment de décision compare des valeurs, pas un résultat de design

**Constat :** le catalogue et l’iframe reçoivent uniquement `state.tokens`. Le brouillon apparaît dans le champ et le contraste proposé, mais pas dans les composants. Le dialogue de diff fournit Avant/Après textuel. L’utilisateur doit accepter l’écriture avant de voir le rendu global d’une nouvelle couleur, taille ou famille de police.

**Effet :** une validation techniquement sûre reste une décision visuelle à l’aveugle. Le discours « Comparez l’avant et l’après » promet davantage que le retour visuel actuel.

**Correction :** rendre le brouillon ou la proposition identifiable dans une prévisualisation non persistante, clairement séparée de la révision enregistrée ; conserver le diff vérifié et la validation comme unique écriture. Au minimum, présenter les valeurs de couleur avec leur échantillon et montrer les composants concernés. Ne jamais réinterpréter une prévisualisation comme une sauvegarde automatique. Commandes : `shape`, `clarify`, `harden`.

### [P1] L’aperçu n’a pas de stratégie d’espace adaptée au document

**Constat :** la grille impose les trois panneaux dès 1100 px. À cette largeur, le panneau Aperçu n’a que 399 px, avant ses marges internes, pour un iframe standard de 375 px ; la capture montre le bord droit tronqué. Le mode Desktop de 1024 px est nécessairement une large zone à faire défiler dans une colonne de 400–509 px. Les panneaux ne sont pas redimensionnables et la transition à 1099 px masque deux zones plutôt que d’offrir une organisation adaptée au travail.

**Effet :** vérifier un résultat responsive devient un déplacement dans plusieurs zones de défilement ; le contexte de comparaison disparaît sous le seuil. Ce n’est pas un bug de largeur de l’iframe : c’est un arbitrage d’atelier insuffisant.

**Correction :** conserver la largeur CSS réelle comme mode 1:1 explicite, mais donner à l’aperçu une zone extensible/plein espace et une commande ajuster à la zone si retenue. Adapter l’organisation au besoin du travail, pas seulement à un seuil global. Aucun zoom implicite qui falsifierait les dimensions. Commandes : `adapt`, `layout`.

### [P2] Les informations essentielles sont traitées comme des notes de bas de page

**Constat :** version à 9 px, état de révision à 10 px, aide aux valeurs et contraste à 10 px, pieds de panneaux à 10 px ; couleurs gris-olive très discrètes, filet omniprésent et accents brun-rouille réservés principalement à l’action. Le titre manuel à 34 px a davantage de saillance que la valeur et son statut.

**Effet :** les informations qui rendent l’édition fiable demandent plus d’effort de lecture que le texte d’ambiance. Cela affaiblit le caractère professionnel et gêne les utilisateurs à faible vision sans que l’interface soit réellement dense.

**Correction :** échelle de texte de travail lisible, titres secondaires compacts, valeurs en style numérique/monospace approprié, statut d’enregistrement proche de l’action, surfaces de navigation et sélection plus nettement différenciées. Garder le rouge pour les vrais risques ; engager une palette de chrome sans nuire à la lecture des tokens. Commandes : `typeset`, `colorize`, `polish`.

## Charge cognitive

**Cinq échecs sur huit : charge élevée selon la grille de la méthode.** Ce constat ne signifie pas que dix-huit tokens sont intrinsèquement trop nombreux ; c’est leur présentation et le poids du contenu concurrent qui coûtent.

| Critère                 | Résultat | Preuve                                                                                                                   |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Foyer unique            | Échec    | Hero manuel, tutoriel, banque de tokens, catalogue et aperçu rivalisent.                                                 |
| Découpage en groupes    | Échec    | Onze pastilles sans sous-groupes et dix-huit clés dans un même select.                                                   |
| Groupement visuel       | Réussi   | Trois panneaux et zones de formulaire nettement séparés.                                                                 |
| Hiérarchie              | Échec    | Le grand titre éditorial domine l’objet sélectionné et l’état de travail.                                                |
| Une décision à la fois  | Réussi   | La proposition puis le diff séquencent la décision avant toute écriture.                                                 |
| Choix limités           | Échec    | Onze choix de couleur exposés ensemble ; select token à dix-huit options quand ouvert.                                   |
| Mémoire de travail      | Réussi   | Le diff remet bien Avant et Après côte à côte ; aucune mémorisation de la valeur précédente n’est imposée pour accepter. |
| Divulgation progressive | Échec    | Le brief est repliable, mais l’explication du mode manuel reste un panneau permanent.                                    |

Les quatre viewports et les deux scénarios ne dépassent pas le seuil de quatre options. Les quatre boutons de démonstration ne doivent pas être comptés comme quatre actions de production concurrentes : leur nature de spécimen doit simplement être plus claire.

## Personae : signaux concrets

**Alex, utilisateur expert :** cherche une couleur, choisit un token, change une valeur, propose, examine et accepte. La recherche aide, mais la banque plate, les clics par select, l’absence de panneau ajustable et l’aperçu desktop enfermé ralentissent les répétitions. Les raccourcis de navigateur et Tab existent ; aucun raccourci métier n’apparaît dans `App.tsx`. Le premier tiers de la fenêtre ne devient pas plus utile avec l’expertise.

**Sam, clavier/faible vision :** bénéficie du lien d’évitement, des labels HTML, de `focus-visible`, des dialogues natifs et des annonces de statut. En revanche, onze pastilles ajoutent onze arrêts Tab, leurs noms n’existent que pour le lecteur d’écran ou au survol, et les aides à 9–11 px sont exigeantes visuellement. Aucune certification de contraste ni aucun test réel de lecteur d’écran n’est affirmé dans cette revue.

**Jordan, étudiant débutant :** lit les trois étapes et comprend qu’il ne risque pas d’écrire sans accord — bon point. Mais « explorez les tokens » débouche sur `color.brandHover` et `color.onBrand`, sans exemples de rôles, explication de dépendances ni indication des composants affectés. Le gros « Supprimer » du catalogue est un bouton de spécimen sans comportement ; il doit être clairement identifié comme démonstration, pas comme une action sur son projet.

Aucun persona projet supplémentaire : `AGENTS.md` ne contient pas de section Design Context ; le contexte fictif Lisière n’est pas l’audience du logiciel.

## Parcours émotionnel

- **Arrivée :** ton calme, présence locale et compte IA facultatif rassurent ; l’ensemble paraît cependant une maquette pédagogique plus qu’un atelier personnel.
- **Exploration :** la promesse est simple, mais l’utilisateur hésite devant les pastilles anonymes et la syntaxe des clés. C’est le premier creux émotionnel.
- **Essai :** le brouillon récupérable et « Rien n’est appliqué » réduisent la peur ; l’absence d’impact visuel avant validation maintient une incertitude de conception.
- **Validation :** le diff et le bouton de refus constituent le pic de confiance. Il faut conserver cette protection et l’enrichir de conséquence visuelle, sans ajouter une confirmation inutile.
- **Fin :** la révision et le message d’écriture concluent honnêtement ; le résultat reste noyé dans les deux vues et le tutoriel. Une confirmation discrète proche de la sélection, le rendu actualisé et l’accès à l’annulation suffisent, sans animation de célébration.

## Observations secondaires

- Les numéros 01/02/03 des panneaux sont des index, pas des étapes ; les trois étapes manuelles réemploient les mêmes numéros. Retirer ce faux langage de progression.
- Le chrome affiche toujours « Lisière », même si le brief prend un autre nom. Séparer explicitement le projet utilisateur et le système d’exemple plutôt que de promettre une personnalisation inexistante.
- L’état Figma non connecté doit rester honnête, sans donner un poids permanent à une intégration non disponible.
- Le compteur de contraste doit continuer de préciser sa portée : une paire conforme ne certifie ni le logiciel ni tous les états des composants.
- La sécurité de l’API fermée, l’absence d’outils dans le chat et les écritures atomiques ne sont pas des détails de style à remanier pour rendre la démonstration plus spectaculaire.

## Questions de conception à résoudre en interne

1. Quel objet doit être sélectionné quand on ouvre le studio : un composant, une famille de tokens ou un scénario ? La composition doit trancher, pas présenter les trois avec le même poids.
2. Que doit voir l’utilisateur avant de pouvoir dire « cette proposition améliore mon système » ? Une valeur différente n’est pas encore une preuve visuelle.
3. Si l’assistant est facultatif, pourquoi son absence occupe-t-elle une zone permanente ?

Questions utilisateur non posées : arbitrages intégralement délégués par l’utilisateur ; cette revue alimente la refonte autonome.
