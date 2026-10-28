---
name: DS-Studio
description: Studio Specimen — un atelier clair pour comparer et valider un système distinct de son chrome.
colors:
  studio-accent: '#5145c9'
  studio-accent-hover: '#4035af'
  studio-selected: '#eeebff'
  studio-ink: '#29263f'
  studio-bg: '#edeef4'
  studio-surface: '#ffffff'
  studio-panel: '#f8f9fc'
  studio-text: '#292938'
  studio-muted: '#636575'
  studio-line: '#dddfe9'
  studio-control-line: '#8a8c9d'
  studio-error: '#a02541'
  studio-notice: '#256144'
  studio-control-hover: '#72738a'
typography:
  headline:
    fontFamily: Geist, sans-serif
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: -0.025em
  title:
    fontFamily: Geist, sans-serif
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.025em
  panel-title:
    fontFamily: Geist, sans-serif
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: Geist, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: Geist, sans-serif
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: Geist, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
  value:
    fontFamily: ui-monospace, monospace
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  row: 4px
  control: 6px
  composer: 8px
  dialog: 12px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '6': 24px
  '8': 32px
components:
  button-primary:
    backgroundColor: '{colors.studio-accent}'
    textColor: '{colors.studio-surface}'
    rounded: '{rounded.control}'
    typography: '{typography.control}'
    padding: 6px 10px
  button-primary-hover:
    backgroundColor: '{colors.studio-accent-hover}'
  button-secondary:
    backgroundColor: '{colors.studio-surface}'
    textColor: '{colors.studio-text}'
    rounded: '{rounded.control}'
    padding: 6px 10px
  input:
    backgroundColor: '{colors.studio-surface}'
    textColor: '{colors.studio-text}'
    rounded: '{rounded.control}'
    padding: 7px 10px
  token-row-selected:
    backgroundColor: '{colors.studio-selected}'
    rounded: '{rounded.row}'
    padding: 5px 8px
  composer:
    backgroundColor: '{colors.studio-surface}'
    rounded: '{rounded.composer}'
    padding: '{spacing.3}'
---

# Design System: DS-Studio

## Overview

**Creative North Star: "Studio Specimen"**

Studio Specimen donne à l'atelier la précision d'un spécimen de fonderie, sans transformer le logiciel en affiche. L'encre violette cadre l'application ; la lavande claire sépare les surfaces de travail et l'iris désigne l'action ou la sélection. La densité reste celle d'un outil : titres modestes, valeurs alignées et commandes proches de l'objet.

Le chrome de DS-Studio et le système édité sont deux domaines visuels indépendants. Les tokens ci-dessus décrivent uniquement le chrome livré dans `app/client/styles.css`. Les composants Lisière prennent leurs couleurs, leur police et leurs dimensions dans les tokens de l'étudiant ; leur bleu initial et leur police système ne deviennent pas l'identité de DS-Studio. La comparaison avant/après fait voir une proposition sans l'appliquer.

**Key Characteristics:**

- Encre violette, lavande pâle et planche blanche.
- Geist locale pour l’interface ; monospace pour les clés et valeurs.
- Surfaces jointives, contours utiles et profondeur tonale.
- Spécimens réels ; aucune image décorative livrée.

## Colors

Une palette froide et légèrement violette, avec un accent iris réservé aux commandes et aux états actifs. Les valeurs normatives sont dans le frontmatter ; les noms ci-dessous en précisent l'emploi.

### Primary

- **Iris d'action** (`studio-accent`) : action principale, lien, focus et destination active.
- **Iris appuyé** (`studio-accent-hover`) : survol de l'action principale.
- **Lavande de sélection** (`studio-selected`) : ligne de token ou destination sélectionnée, sans masquer la valeur.

### Secondary

- **Encre violette** (`studio-ink`) : barre d'application ; elle cadre l'outil et non le système édité.
- **Framboise d'erreur** (`studio-error`) et **Vert de confirmation** (`studio-notice`) : messages fonctionnels, accompagnés de texte.

### Neutral

- **Fond lavande grisé** (`studio-bg`) : terrain du canevas.
- **Planche blanche** (`studio-surface`) : spécimens, champs et inspecteur.
- **Lavande papier** (`studio-panel`) : inventaire et surfaces secondaires. Le panneau agent utilise une nuance voisine définie localement, sans nouvelle échelle normative.
- **Texte graphite violet** (`studio-text`) et **Gris annoté** (`studio-muted`) : information principale et annotations.
- **Filet de structure** (`studio-line`) : séparateurs de panneaux et tableaux ; pas le contour d'un champ.
- **Contour de commande** (`studio-control-line`) : limites des champs et du compositeur, distinctes sur blanc.
- **Contour appuyé** (`studio-control-hover`) : limite de champ renforcée au survol.

### Named Rules

**The Two Systems Rule.** Les variables du chrome restent indépendantes des tokens éditables ; une modification du système de l'étudiant ne recolore pas les commandes de l'atelier.

## Typography

**Display Font:** aucune police d'affiche propre au chrome.
**Body Font:** Geist, avec sans-serif en repli.
**Label/Mono Font:** ui-monospace, avec monospace en repli, pour les clés et valeurs.

**Character:** Une sans compacte et nette, sans emphase marketing. Geist variable (poids 100–900) est chargée localement avec `font-display: swap` ; la police du système édité reste indépendante.

### Hierarchy

- **Headline** : titre de dialogue ; rôle `headline`.
- **Title** : titre de document dans le canevas ; rôle `title`, réduit à 16px sous le seuil étroit.
- **Panel title** : en-tête d'inventaire ou d'agent ; rôle `panel-title`.
- **Body** : texte courant du chrome ; rôle `body`. Les explications d'agent utilisent aussi des interlignes locaux de 1.65 à 1.7.
- **Control / Label / Value** : commandes, annotations et valeurs, selon les rôles du frontmatter. Les nombres de révision et valeurs utilisent des chiffres tabulaires. Le pied d'application est un statut secondaire à 11px, pas un rôle de corps.

### Named Rules

**The Operational Type Rule.** Le texte de travail reste en casse naturelle ; la hiérarchie vient du poids, de la taille et de l'espace, pas d'un surtitre décoratif.

## Layout

La grammaire est celle de surfaces jointives : outils périphériques, objet de travail dominant et défilements internes. L'application occupe `100dvh`, sans défilement global. Le rythme réutilisable est la série d'espacement du frontmatter ; des demi-pas locaux règlent les commandes compactes.

Dans l'atelier actuel, la barre mesure au minimum 52px. Le canevas flexible est encadré par un inventaire de 264px et un agent de 304px ; à partir de 1800px ces panneaux passent à 288px et 344px. Entre 1100px et 1199px ils se resserrent à 240px et 280px. L'agent se replie ; le mode canevas agrandi masque les deux outils. Ces mesures décrivent cette surface, pas une grille imposée à tout futur écran.

Sous 1100px, quatre destinations explicites — Tokens, Composants, Aperçu, Agent — affichent une zone à la fois, en conservant les composants montés. Sous 600px, la barre se répartit sur deux lignes et les commandes de destination passent en icône plus texte. À faible hauteur (600px maximum), tout le panneau de tokens défile ; l'inventaire conserve une fenêtre de 280px et l'inspecteur n'est plus plafonné. Les dialogues restent bornés à la fenêtre. Le catalogue utilise deux colonnes quand son conteneur atteint 600px ; l'aperçu conserve sa largeur réelle dans sa zone défilante.

## Elevation & Depth

Aucune ombre d'auteur n'est utilisée dans le chrome. La profondeur vient du contraste des surfaces, des filets et de la sélection. Le dialogue natif place une planche blanche au-dessus d'un voile violet translucide (`#1c183a66`). Aucun token d'ombre n'est extrait.

### Named Rules

**The Tonal Depth Rule.** Les panneaux restent plats. La distinction entre fond, surface, sélection et dialogue ne dépend pas d'une ombre ajoutée.

## Shapes

Des panneaux rectangulaires jointifs, des lignes de sélection légèrement arrondies et des commandes plus douces. Les rayons réutilisables sont ceux du frontmatter : ligne, commande, compositeur et dialogue. Les spécimens sont posés sur une planche presque carrée (2px). Les séparateurs sont des filets de 1px. Les icônes sont des SVG de trait, `viewBox="0 0 24 24"`, sans remplissage, trait 1.6, extrémités arrondies ; leur taille courante est 18px. Elles signalent une commande et ne servent pas d'illustration.

## Components

### Buttons

Compacts et explicites. Le bouton du chrome mesure au minimum 34px ; la variante principale prend l'iris d'action et du texte blanc, la variante secondaire une surface blanche bordée. Le survol principal utilise l'iris appuyé ; l'état pressé utilise une nuance plus sombre définie localement. La désactivation réduit l'opacité à 0.5 et conserve le libellé. Les commandes de barre sont transparentes sur l'encre violette.

Le focus commun est un contour iris (2px), décalé de 2px ; sur l'encre il devient lavande clair. Les transitions de couleur durent 160ms avec `ease-out`, sans déplacement ; elles sont supprimées si le mouvement réduit est demandé.

### Cards / Containers

Le chrome n'est pas une grille de cartes : inspecteur, inventaire et agent se distinguent par leur fond et leurs séparateurs. Le compositeur est une exception fonctionnelle : surface blanche, rayon `composer`, contour de commande et espacement `3`. Les cartes visibles dans la planche appartiennent au système édité, pas au chrome.

### Inputs / Fields

Surface blanche, contour de commande, rayon `control`, hauteur minimale 36px. Le survol utilise le contour appuyé et renforce la limite et le focus utilise le contour commun. Les champs de propriété sont à 13px ; les clés et valeurs de token restent en monospace. Le champ de recherche réserve la place d'une icône. Le compositeur laisse sa zone de texte sans second contour interne.

### Navigation

Les onglets du canevas ont une casse naturelle, un fond très légèrement lavande à l'état actif et un soulignement iris (2px). Les destinations étroites utilisent lavande de sélection et texte iris. La ligne de token associe nom sémantique, valeur et échantillon ; la sélection est également indiquée par le poids du texte et `aria-pressed`, pas par la couleur seule.

### Proposition specimen

Le dialogue de validation associe diff textuel et deux vrais boutons du système partagé, nommés Avant / Proposition. Chaque moitié reçoit sa propre portée de tokens ; la proposition reste non persistante jusqu'à validation. Deux colonnes deviennent une seule sous 600px. La comparaison n'est ni une image ni une recoloration globale du canevas.

Les chips et cartes Lisière de la planche restent des composants du système édité. Le sidecar en expose un badge témoin avec ses variables propres, sans promouvoir ses valeurs de seed au rang de tokens du chrome.

## Do's and Don'ts

### Do:

- **Do** utiliser les variables du chrome pour les commandes et les tokens éditables seulement dans le système observé.
- **Do** garder le focus visible et les contours de champs distincts des séparateurs structurels.
- **Do** conserver les contenus et brouillons quand un panneau se replie ou change de destination.
- **Do** montrer une proposition avec les vrais composants avant toute validation.

### Don't:

- **Don't** copier la palette initiale de Lisière dans le chrome de DS-Studio.
- **Don't** ajouter de surtitres décoratifs, de glyphes utilisés comme icônes ou d'illustrations SVG.
- **Don't** inventer une intégration connectée ou transformer une proposition en modification enregistrée.
- **Don't** ajouter des ombres de cartes ou un défilement global à cette interface plein écran.

La présente extraction décrit `App.tsx`, `styles.css`, `Icon.tsx` et `DesignSystem.tsx`, vérifiés contre les captures finales. Geist est locale et sous OFL ; DM Sans reste un fichier de secours non utilisé. Aucun bitmap généré ou sourcé ne fait partie de l'application livrée. Les rampes OKLCH du sidecar sont des prévisualisations synthétiques du panneau, pas des couleurs supplémentaires implémentées dans l'application. Le skill Impeccable et le rôle documenter ont été lus explicitement ; leur découverte native n'a pas été testée et aucun hook n'a été activé.
