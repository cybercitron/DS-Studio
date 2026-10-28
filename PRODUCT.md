# DS-Studio

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Étudiants UX/UI qui conçoivent et font évoluer leur Design System dans le cadre
d'un PFE. Le contexte et les décisions appartiennent à l'étudiant.

## Product Purpose

Un environnement de création local : collaborer avec un agent facultatif,
modifier les tokens, observer les composants partagés et tester une interface
responsive. Réussir signifie comprendre, comparer et valider un changement,
puis retrouver ce changement après redémarrage.

## Positioning

Une même source de tokens alimente les composants du catalogue et ceux du
viewport isolé. Chaque proposition passe par un diff et une validation humaine
avant écriture atomique locale. Ce n'est ni une landing page ni un outil de gestion.

## Operating Context

Application plein écran dans un navigateur, lancée par le launcher local.
Mode manuel utilisable sans réseau une fois installée. Le brief PFE privé reste
sur ce poste. Lisière est une démonstration fictive, pas le projet de l'étudiant.

## Capabilities and Constraints

- Préserver tokens, import/export, historique, annulation sélective, persistance,
  brief privé et brouillons. Aucun changement silencieux de données.
- Le chat Codex ne dispose d'aucun outil ; les propositions restent bornées aux
  tokens connus. L'envoi cloud est explicite. Claude/Gemini et Figma indisponibles.
- Pas de scroll global ; zones internes accessibles au clavier, petits écrans
  et zoom navigateur. Les trois fonctions restent accessibles, pas forcément
  dans trois colonnes simultanées.
- React, TypeScript, Vite et serveur HTTP Node existants ; pas de nouveau service.
- Cette mission ne touche ni aux authentifications ni aux données privées et
  ne publie rien. Les essais emploient des dossiers temporaires.

## Brand Commitments

Nom DS-Studio. Interface française, vocabulaire de création précis. Les références
Figma, Linear et Framer concernent la maturité des interactions, pas une copie.
La palette et la police précédentes ne sont pas des engagements à préserver.

## Evidence on Hand

Demande détaillée de Max du 27 octobre 2026, README.md, START_HERE.md,
docs/UI_REDESIGN_REPORT.md, capture rejetée docs/design-reboot/before/desktop.png,
composants et tests existants. Aucun entretien utilisateur ni mesure de vitesse
d'exécution ne doit être inventé.

## Product Principles

1. L'objet de travail prime sur les explications de l'outil.
2. Une proposition n'est jamais une modification acceptée.
3. La simplicité retire des obstacles, jamais des fonctionnalités.
4. Séparer le chrome de l'atelier du système édité.
5. Vérifier le rendu réel et les parcours, pas seulement la compilation.

## Accessibility & Inclusion

Navigation clavier, focus visible, contrastes vérifiables, mouvement réduit,
reflow des panneaux et accès aux contenus à petite largeur. Une qualification
Chromium ne constitue pas une certification WCAG ou multi-navigateurs.

## Provenance

Init réalisé par lecture du playbook Impeccable 4.8.0 et de la demande explicite.
Le demandeur a déjà fourni les réponses produit et délégué les choix ; aucun
entretien de confirmation ni préférence esthétique supplémentaire n'est inventé.
