# Assessment B — preuves déterministes et navigateur

## Périmètre et indépendance

Évaluation indépendante de l’Assessment A, sans accès à ses résultats et sans jugement visuel subjectif. Sources examinées : `app/client/App.tsx`, `app/client/ProjectBrief.tsx`, `app/client/DesignSystem.tsx`. Cible active : `http://127.0.0.1:4318`, serveur de test à données fictives fourni par le parent. Aucun appel IA, authentification, accès aux données utilisateur ou changement de source/CSP.

Les consignes applicables et la section Assessment B de `.agents/skills/impeccable/reference/critique.md` ont été lues. Le contexte Impeccable a été chargé. Aucun `.impeccable/critique/ignore.md` n’existait lors de cette évaluation.

## Détecteur CLI

Commande réellement exécutée, avec le binaire installé et la télémétrie désactivée :

```sh
IMPECCABLE_NO_TELEMETRY=1 \
.agents/skills/impeccable/scripts/impeccable detect --json app/client/App.tsx app/client/ProjectBrief.tsx app/client/DesignSystem.tsx
```

Un override vers le même moteur du cache npx a été utilisé au premier lancement ; son chemin personnel est omis ici. Le lanceur installé utilise désormais son moteur adjacent.

Sortie JSON brute conservée dans `docs/design-reboot/detector-before.json` : `[]`.

| Mesure                   | Résultat                                    |
| ------------------------ | ------------------------------------------- |
| Constats du détecteur    | 0                                           |
| Règles déclenchées       | Aucune                                      |
| Emplacements signalés    | Aucun                                       |
| Faux positifs à arbitrer | Aucun, puisqu’aucun constat n’a été produit |

Limite : le mode TSX du détecteur est une recherche de motifs source, pas une validation complète du rendu, des interactions ou du contraste. Le fichier CSS n’était pas une cible CLI. Ce résultat ne signifie pas que l’interface est exempte de problèmes.

## Préflight et overlay

Aucun outil de navigateur natif n’étant exposé, le contrôle a utilisé Chromium headless avec le paquet installé `@playwright/test`, lancé par Node 22.23.4, dans un contexte et une page neufs propres à B.

Le préflight mutable a réussi pour la modification de `document.title` et l’ajout effectif d’une balise `<script>`. Son script inline n’a pas été exécuté : la CSP le bloque. La disponibilité de mutations DOM a permis de tenter le parcours overlay exigé.

Le live-server Impeccable a été lancé en arrière-plan sur le port 8400 (PID 13473). L’injection de `http://localhost:8400/detect.js` a ensuite été tentée dans trois vues représentatives, chacune titrée `[Human] Assessment B`, défilée en haut, puis observée pendant 2,5 secondes :

| Vue               | URL                          | Résultat                     |
| ----------------- | ---------------------------- | ---------------------------- |
| Atelier           | `/`                          | Injection bloquée par la CSP |
| Découverte/cartes | `/?preview=1&scenario=cards` | Injection bloquée par la CSP |
| Inscription       | `/?preview=1&scenario=form`  | Injection bloquée par la CSP |

Erreur décisive, identique sur les trois vues :

> Loading the script 'http://localhost:8400/detect.js' violates the following Content Security Policy directive: "default-src 'self'".

La politique est appliquée dans `app/server/http.ts:59`. Une balise externe présente dans le DOM ne prouve donc pas son exécution. Aucun nœud d’overlay Impeccable n’a été trouvé et aucun résultat du détecteur exécuté dans la page n’est disponible. Aucun overlay fiable ou onglet `[Human]` visible par l’utilisateur n’est revendiqué : il s’agissait d’un navigateur headless, sans API native de présentation. La CSP n’a pas été modifiée ou contournée.

Le signal de repli est la sortie CLI source `[]`, complétée par les contrôles navigateur ci-dessous. Les erreurs console attendues sont celles de CSP provoquées par les tentatives ; aucun `pageerror` applicatif n’a été relevé pendant les trois vues d’injection.

## Contrôles navigateur objectifs

| Contrôle                                  | Preuve observée                                                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chargement desktop, largeur 1600 px       | Document de 1600 px dans chacune des trois vues ; pas de débordement horizontal global mesuré                                                        |
| Premier Tab                               | Lien « Aller aux tokens » focalisé ; contour calculé `rgb(167, 67, 43) solid 2px`                                                                    |
| Historique vide                           | Dialogue visible, texte « Aucun changement enregistré. », fermeture par Échap réussie                                                                |
| Recherche sans correspondance             | « 0 résultat(s). La sélection courante reste accessible. » ; `color.brand` reste sélectionnable                                                      |
| Panneaux de l’atelier à 320 × 800         | Agent, Design System et Aperçu activables séparément ; un seul panneau affiché à chaque fois ; document et body de 320 px                            |
| Cartes à 320 px                           | Document de 320 px ; réservation change le bouton en « Réservation confirmée ✓ » et annonce « Inscription de démonstration, aucune donnée envoyée. » |
| Navigation du scénario                    | Activation de Favoris : « Vos ateliers favoris apparaîtront ici. »                                                                                   |
| Formulaire vide                           | Validation native refuse l’envoi ; 3 champs invalides                                                                                                |
| Formulaire complété avec données fictives | Statut « Merci ! Démonstration locale, aucune inscription réelle. » ; document de 320 px                                                             |

Ces mesures ne constituent pas un audit complet de contraste, de lecteur d’écran, de zoom, de parcours clavier ou de tous les formats. Les boutons de changement de panneau ont été testés, mais l’identifiant de focus mesuré immédiatement après clic était vide ; aucune conclusion sur le focus différé après `requestAnimationFrame` n’est tirée.

## Échecs du harnais et nettoyage

Deux sélecteurs initiaux du script de contrôle étaient trop stricts : `.token-hint` correspondait à deux paragraphes et le nom accessible du bouton Agent inclut son numéro. Les contrôles concernés ont été rejoués avec `.token-hint[role=status]` et les `aria-controls` des boutons. Il s’agissait d’erreurs du script de mesure, pas d’erreurs applicatives ; les traces sont conservées dans `browser-evidence-before.json`.

Le live-server démarré par B a été arrêté avec `.agents/skills/impeccable/scripts/impeccable live-server stop --keep-inject`, réponse « Stopped live server on port 8400. ». Aucune suppression de balise dans les sources n’a été demandée. Les pages et contextes Chromium ont été fermés ; les trois scripts temporaires de B ont été supprimés. Le jeton éphémère du serveur arrêté a été retiré de l’archive.

Preuve navigateur détaillée : `docs/design-reboot/browser-evidence-before.json`. Le serveur applicatif fourni par le parent n’a pas été arrêté.
