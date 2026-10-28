# Impeccable — installation et périmètre réel

## Source étudiée

Dépôt officiel : https://github.com/pbakaus/impeccable
Révision consultée : `d34c87e1a00989ae8dbdd7f6b30b70f23319e860`.
Paquet npm **4.8.0**, moteur **0.1.18**, Node local **22.23.4**, Codex **0.164.0**
vérifié par `codex --version` (pas de qualification cloud supplémentaire).

Lecture directe du README, README.npm.md, du shim `cli/bin/cli.js`, du manifeste
npm, des générateurs de hooks et du code Rust de télémétrie/installation. Le
paquet npm est un lanceur : moteur natif en optionalDependency, puis cache ou
release GitHub vérifiée SHA256 ; bundle des skills signé Ed25519. Aucun script
install/postinstall npm dans le manifeste examiné. Les scripts de build/release
ne sont pas des hooks à activer dans le projet utilisateur.

## Commandes exécutées

```sh
npm view impeccable version scripts dist.tarball
npx --yes impeccable@4.8.0 install --help
IMPECCABLE_NO_TELEMETRY=1 npx --yes impeccable@4.8.0 install --providers=codex --scope=project --no-hooks -y
```

Le premier téléchargement du bundle a échoué sur DNS. La même commande a été
rejouée avec le chemin d'approbation réseau prévu par l'environnement, sans
contournement. Installation réussie sous `.agents/skills/impeccable/`, moteur
local adjacent. Aucune installation npm globale, aucune modification des
dépendances/lockfile DS-Studio, aucune écriture dans les authentifications.

## Commandes versus procédures

Impeccable est **une skill** avec 24 playbooks, pas 24 exécutables autonomes.
`init`, `critique`, `audit`, `distill`, `shape`, `layout`, `typeset`, `harden` et
`polish` sont des procédures Markdown lues et appliquées par l'agent. Le moteur
exécute les opérations mécaniques : context, concept-seed, detect,
surface-brief, critique-storage, serve-question, etc. Ne pas confondre lire un
playbook avec avoir tapé un slash-command qui n'existe pas dans le shell.

Dans cette session, `SKILL.md` et les playbooks pertinents ont été réellement
ouverts. `context --target app/client/App.tsx`, le tirage de concepts, son contrôle
de provenance, l'écriture/relecture du surface brief et les détecteurs avant/après
ont été exécutés. Les évaluations A/B ont utilisé deux agents indépendants.
Les trois passes de captures et le reviewer final sont distincts du build.

La découverte native d'une skill ajoutée pendant une session n'est pas affirmée.
Elle a été chargée explicitement depuis son fichier, ce qui permet de travailler
maintenant. Pour une future session lancée dans DS-Studio, le dossier projet
`.agents/skills/` est prêt pour la découverte ; un redémarrage de la session
actuelle n'était pas nécessaire à l'application explicite des procédures.

## Hooks, réseau et confidentialité

Le manifeste Codex standard installerait des hooks `PostToolUse` et `Stop`, avec
un détecteur immédiat après édition puis une passe profonde à la fin. Il faut
faire confiance à la définition du hook dans Codex ; **aucun hook installé ou
approuvé ici**, grâce à l'option officielle `--no-hooks`. Pas de modification de
`.codex/hooks.json` ni de confiance globale. Conséquence : pas d'avertissement
automatique à chaque édition ; détecteur exécuté manuellement en fin de travail.

Réseau utilisé pour des téléchargements publics npm/GitHub, la documentation,
la police Geist depuis Google Fonts/GitHub et le catalogue public concept-seed.
Le tirage transmet mode/scope/seed, pas le nom ni le code du projet.
Télémétrie désactivée par environnement pendant les opérations et par
`.impeccable/config.json` dans le projet. Le ping de choix n'est pas envoyé.
Les images de calibration des challengers ont renvoyé HTTP 403 ; ne pas les présenter
comme vues.

Aucun PFE privé, historique étudiant, token d'authentification ou contenu métier
confidentiel n'a été transmis. Les requêtes chat des tests sont interceptées et
étiquetées fixtures ; aucun vrai appel à Codex, Figma ou autre fournisseur IA.
L'overlay de revue est bloqué par la CSP : cette protection n'a pas été modifiée.

La skill installée et son moteur restent présents localement, ignorés par Git.
Les fichiers produit/direction, le sidecar et les preuves utiles sont conservés
séparément ; cette notice permet de reproduire l'installation verrouillée.

La [documentation officielle OpenAI sur les skills](https://learn.chatgpt.com/docs/build-skills) confirme le dossier projet `.agents/skills/` et le chargement progressif ; la découverte native de cette session reste distincte de notre lecture explicite vérifiée.
