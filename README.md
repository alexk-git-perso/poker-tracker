# Suivi poker

Appli de suivi de parties de poker, installable sur téléphone et ordinateur (PWA), qui fonctionne hors ligne.
Les données restent **uniquement sur l'appareil** (IndexedDB) : aucun serveur, aucun compte.

## Fonctions

- Sessions **cash game** (par défaut) ou **tournoi** : date, lieu, jeu/limite, buy-in (recaves comprises), cash-out, durée, place finale et nombre de joueurs.
- **Session en direct** : « Démarrer maintenant » lance un chrono, on ajoute les recaves pendant la partie, puis on clôture avec le cash-out. Durée, buy-in total et gain horaire sont calculés, et la session en cours survit à la fermeture de l'appli.
- Courbe du **bénéfice cumulé**, filtre Tout / Cash / Tournoi.
- Stats : bénéfice horaire, % de sessions gagnantes, plus gros gain et plus grosse perte, ROI et places payées en tournoi.
- Onglet **Analyse** : bénéfice par mois, par lieu, par jeu/limite, écart-type par session, pire downswing, plus longue série perdante.
- **Partage en image** d'une session ou du bilan (carte 1080×1350) via le partage natif du téléphone (WhatsApp, Messages…), sinon téléchargement.
- **Meilleure main** d'une session : sélecteur de cartes visuel, nom de la main détecté (Full, Couleur…), affichée dans l'historique et sur les images.
- **Paramètres** : nom de joueur, photo (recadrable : glisser, zoomer), couleur et main de départ préférée, repris sur les images partagées.
- **Sauvegarde** : export et import JSON pour garder une copie ou changer d'appareil.

## Structure

```
index.html            page unique
css/app.css           styles
js/app.js             interface
js/db.js              base locale IndexedDB
js/stats.js           calculs (fonctions pures, testées)
js/live.js            session en direct (testée)
js/profile.js         paramètres du joueur, couleurs
js/share.js           image à partager
js/format.js          utilitaires
sw.js                 service worker (hors ligne)
manifest.webmanifest  installation
tests/                tests des calculs
```

Pas d'étape de build : ce sont des fichiers statiques.

## Lancer en local

```sh
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Tests

```sh
node --test
```

## Mise en ligne

N'importe quel hébergement statique en HTTPS convient (GitHub Pages, Netlify, Cloudflare Pages).
Avant chaque mise en ligne : `node tools/bump.mjs` (version majeur.date.mineur, affichée en bas de l'accueil et dans les Paramètres ; `--major` pour passer à la version majeure suivante).
