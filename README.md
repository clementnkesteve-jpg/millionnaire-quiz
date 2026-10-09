# 💰 Millionnaire Quiz

Jeu de quiz inspiré de « Qui veut gagner des millions ? », en HTML/CSS/JavaScript pur (aucune dépendance).

## Fonctionnalités

- **9 thèmes + mode Mixte** : culture générale, cinéma, musique, anime & manga, sports, histoire, géographie, sciences, jeux vidéo.
- **335 questions** : 197 de base + un **pack étendu** de 138 questions (activable dans ⚙️ Options).
- **Mes questions** : ajoute tes propres questions dans n'importe quelle catégorie, avec export / import en JSON.
- **Options** : pack étendu, questions perso, chrono (Normal, Express, Détente sans chrono), animations (spectaculaires ou réduites).
- **Pyramide de 15 questions** de 100 € à 1 000 000 €, difficulté croissante, paliers garantis à 1 000 € et 32 000 €.
- **4 jokers** : 50:50, appel à un ami, vote du public, changer de question.
- **Chrono** par question (30 s / 45 s / 60 s selon la difficulté).
- **Système de gratification** :
  - cagnotte bonus (vitesse de réponse + séries de bonnes réponses), perdue en cas d'erreur ;
  - XP et niveaux : chaque niveau augmente de 5 % le **multiplicateur de tous tes gains futurs** ;
  - banque cumulée, rangs (Candidat → Légende vivante), records par thème ;
  - 12 trophées à débloquer, confettis, sons synthétisés, chèque final animé.
- **Animations dynamiques** : questions qui basculent en 3D, réponses qui glissent, projecteur pendant le suspense, flashs, tremblement d'écran, pièces qui volent vers la pyramide, bannières de palier / série, vignette rouge quand le temps presse, cartes inclinables en 3D.
- Profil sauvegardé dans le navigateur (`localStorage`).
- Responsive (mobile / desktop), raccourcis clavier A–D ou 1–4.

## Lancer en local

```bash
npx serve .
```

## Ajouter des questions

Depuis le jeu : bouton **➕ Mes questions**. Ou dans le code, dans [`js/questions.js`](js/questions.js) ou [`js/questions-plus.js`](js/questions-plus.js), ajoute une ligne dans la catégorie voulue :

```js
['Ta question ?', ['Bonne réponse', 'Mauvaise 1', 'Mauvaise 2', 'Mauvaise 3'], 2],
```

La bonne réponse est toujours en premier (les réponses sont mélangées en jeu). Le dernier nombre est la difficulté : 1 facile, 2 moyen, 3 difficile.

## Déploiement

Site statique : déployé sur Vercel sans configuration (`vercel --prod`).
