# DS-Studio — Product Design Reboot

27 octobre 2026. **IMPLEMENTED et TESTED, Chromium/Linux.**

## Résultat

Direction **Studio Specimen**, retenue après trois architectures comparées dans
le navigateur. Inventaire sémantique et propriétés à gauche, canevas dominant à
onglets Composants/Aperçu, agent repliable à droite et mode canevas agrandi.
L'application n'organise plus trois documents verticaux de poids identique.
Geist locale, chrome lavande/encre violette, valeurs alignées et titres de travail.
Aucune dépendance applicative ajoutée ; les tokens du système fictif ne changent pas.

À 1440 px, le canevas mesure872 px contre environ588 px pour l'ancien panneau de
composants. La barre d'application mesure52 px ; la seconde grande introduction
est supprimée. Sous 1100 px, quatre destinations donnent accès à tous les espaces
sans démonter les composants. Les petits paysages font défiler l'inspecteur,
pas la page. La preview reste à largeur CSS réelle, jamais rétrécie silencieusement.

Le diff ajoute deux vrais spécimens du bouton principal et des échantillons de
couleur. Ce rendu est explicitement limité au bouton ; le tableau reste la
référence de tous les changements. La validation humaine est toujours la seule
écriture. Import, export, historique, annulation sélective, brief privé,
brouillons, chat restreint et comportement local sont préservés.

## Livrables

| Livrable                                 | Emplacement                                                                                                                                                                                                                               |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direction artistique et tokens de chrome | [DESIGN.md](../../DESIGN.md), [.impeccable/design.json](../../.impeccable/design.json)                                                                                                                                                    |
| Contexte produit et direction            | [PRODUCT.md](../../PRODUCT.md), [exploration et sélection](DIRECTION.md)                                                                                                                                                                  |
| Audit Impeccable avant modification      | [AUDIT.md](AUDIT.md), [A indépendant](assessment-a.md), [B indépendant](assessment-b.md)                                                                                                                                                  |
| Installation et limites réelles          | [INSTALLATION.md](INSTALLATION.md)                                                                                                                                                                                                        |
| Trois passes et corrections              | [VISUAL_PASSES.md](VISUAL_PASSES.md)                                                                                                                                                                                                      |
| Revue finale et verdict ciblé            | [FINISH_REVIEW.md](FINISH_REVIEW.md), [FINISH_VERDICT.md](FINISH_VERDICT.md)                                                                                                                                                              |
| Avant / après                            | [Avant](before/desktop.png), [Après](final/desktop.png)                                                                                                                                                                                   |
| Parcours final                           | [Édition](final/token-edit.png), [diff](final/proposal-diff.png), [historique](final/history.png), [brief](final/brief.png), [chat synthétique](final/chat-fixture.png), [preview](final/preview.png), [mobile](final/mobile-preview.png) |
| Explorations comparables                 | [Creative IDE](explorations/creative-ide.png), [Editorial](explorations/editorial-workstation.png), [Specimen](explorations/studio-specimen.png)                                                                                          |
| Zoom réel 200 %                          | [Diff](final/real-zoom-200-diff.png), [preview](final/real-zoom-200-preview.png), [mesures](validation/zoom-measurements.json)                                                                                                            |

Impeccable 4.8.0 a été installé dans le projet avec la commande officielle et
`--no-hooks`. Skill et procédures réellement lues, moteur réellement exécuté,
évaluations A/B indépendantes, reviewer et documenter distincts. La session n'a
pas été présentée comme ayant découvert automatiquement les slash-commandes.
Les étapes interactives ont été remplacées par la délégation explicite de Max,
pas par un faux accord. Détails et écarts documentés dans la notice d'installation.

## Validation exécutée

| Vérification                      | Résultat                                                                             | Preuve                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| TypeScript                        | Réussi                                                                               | [typescript.txt](validation/typescript.txt)                                      |
| Build production                  | Réussi ; JS 102.14 Ko gzip, police 169.05 Ko                                         | [build.txt](validation/build.txt)                                                |
| Tests serveur/modèle/agents/brief | **29/29**                                                                            | [unit.txt](validation/unit.txt)                                                  |
| Parcours Chromium                 | **19/19**,0 échec,0 ignoré                                                           | [browser.txt](validation/browser.txt), [résumé](validation/browser-summary.json) |
| Zoom réel                         | 100/125/150/200%, diff/refus et preview réussis ; replay après correction du harnais | [zoom.txt](validation/zoom.txt), [mesures](validation/zoom-measurements.json)    |
| Launcher                          | **22/22**                                                                            | [launcher.txt](validation/launcher.txt)                                          |
| Redémarrage réel et persistance   | Réussi : lanceur, verrou, disque, arrêt/redémarrage et annulation                    | [restart-persistence.txt](validation/restart-persistence.txt)                    |
| Détecteur Impeccable              | 0 constat source avant/après ; pas une preuve de qualité esthétique                  | [avant](detector-before.json), [après](detector-after.json)                      |
| Scan de publication               | 0 alerte ; heuristique, pas certification                                            | [scan.txt](validation/scan.txt)                                                  |

Les tests couvrent refus/validation/annulation, propagation, import/export,
conflits multi-onglets, session périmée, brouillon récupéré et stockage navigateur
refusé, brief persistant, focus et Échap, navigation et formulaires, repli/agrandissement,
conservation des états des deux vues, recherche vide, erreur chat et reprise.
Les tests chat utilisent une réponse synthétique interceptée ; aucun envoi cloud.

Absence de scroll global vérifiée sur 1920×1080,1600×1100,1440×900,1366×768,
1280×720,1100×700,1099×800,1024×768,700×900,375×812,320×568 et844×390.
Autres captures mesurées :720×450. Derniers relevés : [mesures du rendu](final/measurements.json).
Les assertions vérifient aussi l'accès réel aux contenus en fin de scroll :
il ne suffit pas de cacher un débordement avec overflow:hidden.

Contrastes chrome : texte 14.30:1 sur blanc ; secondaire 5.47:1 sur panneau ;
action blanche sur iris 6.90:1 ; sélection 7.89:1 ; contour de champ 3.3234:1 au
repos et 4.6309:1 au survol. Le test navigateur vérifie les styles rendus, pas
seulement les valeurs déclarées.

## Préservation et retour possible

Branche locale `codex/product-design-reboot`. La refonte antérieure complète,
y compris ses fichiers non suivis, est préservée par le commit **7a4bbe4** avant
les modifications de l'application. `main` et les branches distantes n'ont pas
été déplacées. Les captures initiales ont été copiées hors de test-results pour
survivre aux tests suivants. Aucun push, reset, nettoyage Git ou suppression du
travail existant. Retour de consultation : `git show 7a4bbe4:app/client/App.tsx`.
Ne pas faire un reset pour comparer les versions ; les deux commits restent consultables.

Backend, schémas, seed, données étudiantes, authentifications et fichiers MARC
n'ont pas été modifiés. Les essais utilisent des dossiers temporaires. Les
serveurs de revue sont arrêtés ; une éventuelle session utilisateur n'a pas été
redémarrée. Le launcher existant reste utilisable ; recharger l'onglet pour prendre
le nouveau bundle. Impeccable reste installé localement mais hors commits, avec
procédure verrouillée pour le réinstaller. PRODUCT, DESIGN et sidecar sont conservés.

## Défauts et limites non résolus

- **P2 — comparaison partielle** : le diff visualise un bouton, pas l'ensemble
  des composants. Tous les tokens restent comparés textuellement ; une preview
  non persistante de scénarios entiers n'est pas implémentée.
- **P2 — densité extrême** : petites hauteurs et zoom demandent du scroll interne
  et du changement de destination. Pas de séparateurs redimensionnables à la
  souris ; repli de l'agent et agrandissement du canevas sont implémentés.
- **Qualification limitée** : Chromium/Linux, pas Safari/Firefox ou appareil
  tactile physique ; pas d'audit exhaustif au lecteur d'écran. Les tokens
  étudiants peuvent créer des contrastes insuffisants, dont la bordure initiale
  de Lisière ; ils n'ont pas été recolorés sans validation.
- **Méthode sans hook** : pas de détecteur automatique à chaque édition ni
  d'overlay (CSP). Images externes de calibration indisponibles HTTP 403. Les captures
  réelles et le détecteur source constituent les preuves de repli.
- Le chat cloud n'a pas été requalifié avec un vrai fournisseur. Claude/Gemini
  et synchronisation Figma restent indisponibles comme avant. Aucune fausse
  fonctionnalité connectée n'est ajoutée. Le verdict `ship` clôt les corrections
  recensées par le reviewer, pas une certification universelle de la surface.
