# Audit Impeccable avant refonte

Method: dual-agent (A: /root/critique_a · B: /root/critique_b)

27 octobre 2026. Cible : `app/client/App.tsx`. Les deux évaluations indépendantes
ont été terminées avant toute modification de l'interface. A a réellement
inspecté les captures du navigateur sans connaître le détecteur ; B a exécuté
le détecteur et les parcours dans un autre navigateur. Rapports complets :
[A](assessment-a.md), [B](assessment-b.md).

## Critique

**24/40** sur les dix heuristiques Nielsen. Le défaut fondamental est la priorité
donnée au tutoriel plutôt qu'au document de création. Le premier outil commence
à 143 px du haut ; les onze pastilles anonymes ne constituent pas un inventaire
sémantique. Les trois panneaux rigides accordent autant d'espace à l'absence
d'agent qu'au travail. À 1100 px, l'aperçu 375 px dépasse sa zone disponible.
Les états décisifs sont à 9–11 px, alors que le slogan manuel atteint 34 px.

La proposition compare des valeurs sans démontrer leur effet avant validation.
Ce manque de retour visuel est distinct de la bonne protection contre les
écritures non autorisées. Il faut conserver cette protection et enrichir le diff.

## Audit technique

| Dimension     |   Note /4 | Preuve et limite                                                                 |
| ------------- | --------: | -------------------------------------------------------------------------------- |
| Accessibilité |         2 | Focus, labels, dialogues natifs présents ; microtexte et contrastes à qualifier. |
| Performance   |         3 | Pas de bibliothèque graphique ; font locale, mais polling des deux documents.    |
| Thème         |         3 | Tokens éditables séparés du chrome ; chrome à formaliser. Dark mode non requis.  |
| Responsive    |         3 | Reflow testé, pas de scroll global ; espace de preview insuffisant à1100.        |
| Intégrité     |         2 | Garde-fous réels, mais composition interchangeable avec un configurateur.        |
| **Total**     | **13/20** | Travail de structure nécessaire, pas simple recoloration.                        |

Priorités : P1 espace de travail, P1 reconnaissance des tokens, P1 retour de
proposition, P1 espace de preview, P2 lisibilité des états. Aucun P0 observé.
Le détecteur statique TSX retourne **0 constat** : cela ne réfute aucun de ces
défauts de conception. JSON conservé dans `detector-before.json`.

## Distill — décisions

Retirer le second grand header, les index de panneaux, le slogan manuel, les
trois rappels pédagogiques et le footer slogan. Ne retirer aucune fonction.
Remplacer les pastilles anonymes par un inventaire nommé/groupé. Déplacer le
catalogue et l'aperçu dans une même zone de travail dominante. Assistant
repliable, brief préservé dans le panneau, états près de leur action.

## Provenance et adaptations

Impeccable 4.8.0 installé officiellement, sans hook. `SKILL.md`, init, critique,
audit, distill, shape, new-work et guidance Operate lus ; `context` réellement
exécuté. Les questions d'entretien, la sélection humaine et les arrêts de shape
sont remplacés par les réponses déjà détaillées dans la mission et par la
délégation explicite de Max. Aucun accord supplémentaire n'est simulé.

Questions skipped: Max a explicitement confié les arbitrages et demandé la
poursuite autonome. Cette dérogation utilisateur prévaut sur la clôture
interactive standard du playbook.

L'overlay navigateur a été tenté sur trois vues, mais bloqué par la CSP self.
La CSP n'a pas été affaiblie. Pas d'overlay visible revendiqué. Fallback :
captures inspectées, DOM mesuré, parcours Playwright et détecteur source.
Live-server Impeccable arrêté avec `--keep-inject`. Aucun contenu privé envoyé.
