# Suivi poker

Appli de suivi de parties de poker, installable sur téléphone et ordinateur (PWA), qui fonctionne hors ligne.
Les données restent **uniquement sur l'appareil** (IndexedDB) : aucun serveur, aucun compte.

## Fonctions

- Sessions **cash game** (par défaut) ou **tournoi** : date, lieu, jeu/limite, buy-in (recaves comprises), cash-out, durée, place finale et nombre de joueurs.
- Courbe du **bénéfice cumulé**, filtre Tout / Cash / Tournoi.
- Stats : bénéfice horaire, % de sessions gagnantes, plus gros gain et plus grosse perte, ROI et places payées en tournoi.
- Onglet **Analyse** : bénéfice par mois, par lieu, par jeu/limite, écart-type par session, pire downswing, plus longue série perdante.
- **Partage en image** d'une session ou du bilan (carte 1080×1350) via le partage natif du téléphone (WhatsApp, Messages…), sinon téléchargement.
- **Paramètres** : nom de joueur, photo et couleur, repris sur les images partagées.
- **Sauvegarde** : export et import JSON pour garder une copie ou changer d'appareil.

## Structure

```
index.html            page unique
css/app.css           styles
js/app.js             interface
js/db.js              base locale IndexedDB
js/stats.js           calculs (fonctions pures, testées)
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
Pensez à changer `VERSION` dans `sw.js` à chaque mise en ligne pour que les téléphones récupèrent la nouvelle version.
