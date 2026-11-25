// Traductions. Les clés sont les textes français ; l'anglais est dans EN.
// Le HTML est traduit en parcourant ses textes et attributs (le français d'origine est gardé pour revenir en arrière).
const EN = {
  // En-tête, filtres, onglets
  'Mes sessions de poker': 'My poker sessions', 'Paramètres du joueur': 'Player settings', 'Type de partie': 'Game type',
  'Tout': 'All', 'Cash game': 'Cash game', 'Tournoi': 'Tournament', 'Tournois': 'Tournaments',
  'Bénéfice cumulé dans le temps': 'Cumulative profit over time', 'Vues': 'Views', 'Sessions': 'Sessions', 'Analyse': 'Analysis',
  'Installez l’appli sur votre écran d’accueil pour l’utiliser hors ligne.': 'Install the app on your home screen to use it offline.',
  'Installer': 'Install', 'Pour l’installer : touchez Partager, puis « Sur l’écran d’accueil ».': 'To install it: tap Share, then “Add to Home Screen”.',
  'sur {n} session': 'over {n} session', 'sur {n} sessions': 'over {n} sessions', '{h} h jouées': '{h} h played', 'aucune session': 'no sessions',
  // Session en direct
  'Session en cours': 'Session in progress', 'En cours': 'Live', 'Durée': 'Duration', 'Buy-in total': 'Total buy-in', 'Recaves': 'Rebuys',
  '+ Recave': '+ Rebuy', 'Annuler la dernière recave': 'Undo last rebuy', 'Terminer': 'Finish', 'Montant de la recave (€)': 'Rebuy amount (€)',
  'Annuler': 'Cancel', 'Ajouter': 'Add', 'Cash-out (€)': 'Cash-out (€)', 'Place finale': 'Final position', 'Joueurs': 'Players',
  'Abandonner la session': 'Discard session', 'Confirmer l’abandon': 'Confirm discard', 'Reprendre': 'Resume', 'Enregistrer la session': 'Save session',
  'Indiquez le buy-in de départ.': 'Enter the starting buy-in.', 'Session démarrée. Bonne partie !': 'Session started. Good luck!',
  'Recave de {a} ajoutée.': 'Rebuy of {a} added.', 'Recave de {a} retirée.': 'Rebuy of {a} removed.',
  'Session enregistrée : {p}.': 'Session saved: {p}.', 'Session en cours abandonnée.': 'Live session discarded.',
  'Session en cours non enregistrée sur cet appareil.': 'Live session not saved on this device.',
  // Liste et sauvegarde
  'Dernières sessions': 'Latest sessions', 'Partager mon bilan': 'Share my summary', 'Sauvegarde': 'Backup',
  'Vos sessions restent uniquement sur cet appareil. Rien n’est envoyé en ligne.': 'Your sessions stay on this device only. Nothing is sent online.',
  'Aucune session pour ce filtre. Ajoutez-en une avec « + Session ».': 'No sessions for this filter. Add one with “+ Session”.',
  'Session': 'Session', '{n} recave': '{n} rebuy', '{n} recaves': '{n} rebuys',
  'Attention : ce navigateur bloque le stockage local. Vos sessions seront perdues en fermant l’appli : faites une sauvegarde.': 'Warning: this browser blocks local storage. Your sessions will be lost when you close the app: make a backup.',
  // Analyse
  'Chiffres clés': 'Key figures', 'Variance': 'Variance', 'Bénéfice horaire': 'Hourly profit', 'Sessions gagnantes': 'Winning sessions',
  'Plus gros gain': 'Biggest win', 'Plus grosse perte': 'Biggest loss', 'ROI tournois': 'Tournament ROI', 'Places payées': 'In the money',
  'Écart-type par session': 'Standard deviation per session', 'Pire downswing': 'Worst downswing', 'Plus longue série perdante': 'Longest losing streak',
  'sur {n} session': 'over {n} session', '{n} session': '{n} session', '{n} sessions': '{n} sessions',
  'Le downswing est la plus forte baisse de votre bénéfice cumulé depuis un sommet. L’écart-type mesure de combien une session s’écarte en général de votre moyenne.': 'The downswing is the largest drop in your cumulative profit from a peak. The standard deviation measures how far a session typically strays from your average.',
  'Par mois': 'By month', 'Par lieu': 'By venue', 'Par jeu et limite': 'By game and stakes', 'Pas encore de données.': 'No data yet.',
  'Bénéfice': 'Profit', 'Non renseigné': 'Not specified', 'La courbe apparaîtra après votre première session': 'The chart will appear after your first session',
  'Comment c’est calculé': 'How it’s calculated',
  'Bénéfice = cash-out − buy-in (recaves comprises). Bénéfice horaire = bénéfice ÷ heures jouées, sur les sessions avec une durée. ROI tournoi = bénéfice des tournois ÷ total des buy-ins de tournoi. Places payées = tournois terminés avec un cash-out.': 'Profit = cash-out − buy-in (rebuys included). Hourly profit = profit ÷ hours played, for sessions with a duration. Tournament ROI = tournament profit ÷ total tournament buy-ins. In the money = tournaments finished with a cash-out.',
  // Formulaire
  'Nouvelle session': 'New session', 'Modifier la session': 'Edit session', 'Type': 'Type', 'Date': 'Date', 'Durée (h)': 'Duration (h)', '3,5': '3.5',
  'Lieu': 'Venue', 'Casino, en ligne…': 'Casino, online…', 'Jeu / limite': 'Game / stakes', 'Buy-in total (€)': 'Total buy-in (€)',
  'Meilleure main': 'Best hand', 'Notes': 'Notes', 'Table, mains marquantes…': 'Table, notable hands…', 'Supprimer': 'Delete',
  'Partager en image': 'Share as image', 'Démarrer maintenant': 'Start now', 'Enregistrer': 'Save',
  '« Démarrer maintenant » lance le chrono avec ce buy-in : vous ajouterez les recaves et le cash-out pendant la partie.': '“Start now” starts the timer with this buy-in: you’ll add rebuys and the cash-out during the game.',
  'Résultat : {p}': 'Result: {p}', 'Session modifiée.': 'Session updated.', 'Session enregistrée.': 'Session saved.', 'Abandonner la saisie ?': 'Discard this entry?', 'Des champs obligatoires sont vides : cette saisie ne peut pas être enregistrée.': 'Some required fields are empty, so this entry cannot be saved.', 'Abandonner': 'Discard', 'Continuer la saisie': 'Keep editing', 'Indiquez au moins le buy-in et le cash-out pour partager.': 'Enter at least the buy-in and cash-out to share.', 'Les modifications sont enregistrées automatiquement.': 'Changes are saved automatically.', 'Complétez la session puis enregistrez pour garder les photos.': 'Complete the session and save it to keep the photos.', 'Session ajoutée.': 'Session added.', 'Session supprimée.': 'Session deleted.',
  'Choisir les cartes': 'Choose cards', 'Photo': 'Photo', 'Ajouter une photo': 'Add a photo', 'Changer la photo': 'Change photo', 'Voir la photo': 'View photo', 'Photos': 'Photos', 'Album': 'Album', 'Version avec les photos de la session': 'Version with the session photos', 'Supprimer cette session ?': 'Delete this session?', 'Ajouter des photos': 'Add photos', '{n} photos au plus par session.': 'Up to {n} photos per session.', 'Photo précédente': 'Previous photo', 'Photo suivante': 'Next photo',
  'Photo de la session': 'Session photo', 'Photo non enregistrée sur cet appareil.': 'Photo not saved on this device.', 'Avec photo': 'With photo',
  'Les photos des sessions ne sont pas incluses dans la sauvegarde.': 'Session photos are not included in the backup.',
  'Stockage utilisé : {u} (photos comprises).': 'Storage used: {u} (photos included).', 'Espace disponible : {q}.': 'Space available: {q}.',
  'Données protégées contre l’effacement automatique.': 'Data protected from automatic clearing.', 'Le navigateur peut effacer les données s’il manque de place : faites des sauvegardes.': 'The browser may clear data if space runs low: make backups.',
  // Sauvegarde
  'Vos données ne quittent pas cet appareil. Pour en garder une copie ou les passer sur un autre appareil, téléchargez le fichier ou copiez le texte. Pour restaurer, choisissez un fichier ou collez une sauvegarde, puis importez.': 'Your data never leaves this device. To keep a copy or move it to another device, download the file or copy the text. To restore, choose a file or paste a backup, then import.',
  'Données JSON': 'JSON data', 'Ou importer un fichier': 'Or import a file', 'Importer': 'Import', 'Fermer': 'Close', 'Copier': 'Copy', 'Télécharger': 'Download',
  'Fichier téléchargé.': 'File downloaded.', 'Copié.': 'Copied.', 'Sélectionné : copiez avec Ctrl+C ou un appui long.': 'Selected: copy with Ctrl+C or a long press.',
  'Fichier chargé : appuyez sur Importer.': 'File loaded: tap Import.', '{n} sessions importées.': '{n} sessions imported.', '{n} session importée.': '{n} session imported.',
  'Ce texte n’est pas une sauvegarde valide.': 'This text is not a valid backup.',
  // Partage
  'Version de l’image': 'Image style', 'Version détaillée': 'Detailed version', 'Détaillée': 'Detailed', 'Version photo': 'Photo version', 'Photo': 'Photo',
  'Copier l’image': 'Copy image', 'Partager': 'Share', 'Image impossible à créer sur cet appareil.': 'Couldn’t create the image on this device.',
  'Envoyez-la directement à vos amis (WhatsApp, Messages…).': 'Send it straight to your friends (WhatsApp, Messages…).',
  'Téléchargez l’image, puis envoyez-la à vos amis.': 'Download the image, then send it to your friends.',
  'Partagé.': 'Shared.', 'Partage annulé.': 'Sharing cancelled.', 'Image téléchargée.': 'Image downloaded.',
  'Image copiée : collez-la dans votre messagerie.': 'Image copied: paste it into your messaging app.', 'Copie refusée par ce navigateur : utilisez Partager.': 'This browser blocked copying: use Share.',
  'Mon bilan poker': 'My poker summary', 'Bilan cash game': 'Cash game summary', 'Bilan tournois': 'Tournament summary', 'Bilan': 'Summary',
  'Bilan de {name}': '{name}’s summary', 'Session de poker': 'Poker session', 'Buy-in': 'Buy-in', 'Cash-out': 'Cash-out', 'Place': 'Position',
  '{p} sur {n}': '{p} of {n}', '{h} h de jeu': '{h} h played',
  // Paramètres
  'Paramètres': 'Settings', 'Choisir une photo': 'Choose a photo', 'Recadrer': 'Crop', 'Retirer la photo': 'Remove photo',
  'Main de départ préférée': 'Favourite starting hand', 'Choisir 2 cartes': 'Choose 2 cards', 'Nom de joueur': 'Player name', 'Votre nom ou pseudo': 'Your name or nickname',
  'Couleur': 'Colour', 'Langue': 'Language', 'Devise': 'Currency', 'Les montants déjà saisis ne sont pas convertis.': 'Amounts already entered are not converted.',
  'Euro': 'Euro', 'Dollar américain': 'US dollar', 'Livre sterling': 'Pound sterling', 'Franc suisse': 'Swiss franc', 'Dollar canadien': 'Canadian dollar', 'Automatique (langue du téléphone)': 'Automatic (phone language)',
  'Le nom, la photo et la couleur apparaissent aussi sur les images que vous partagez. Tout reste sur cet appareil.': 'Your name, photo and colour also appear on the images you share. Everything stays on this device.',
  'À propos': 'About', 'Version {v}': 'Version {v}', 'Code source': 'Source code',
  'Suivi de parties de poker. Vos données restent sur cet appareil.': 'Poker session tracker. Your data stays on this device.',
  'Terminé': 'Done', 'Paramètres non enregistrés sur cet appareil.': 'Settings not saved on this device.', 'Cette image n’a pas pu être lue.': 'This image couldn’t be read.',
  'Tapis vert': 'Green felt', 'Bleu nuit': 'Midnight blue', 'Bordeaux': 'Burgundy', 'Pétrole': 'Teal', 'Noir': 'Black',
  // Recadrage
  'Recadrer la photo': 'Crop photo', 'Faites glisser la photo pour la placer, et zoomez avec le curseur ou en pinçant.': 'Drag the photo to position it, and zoom with the slider or by pinching.',
  'Aperçu du cadrage': 'Crop preview', 'Zoom': 'Zoom', 'Valider': 'Confirm',
  // Cartes
  'Cartes choisies (toucher une carte pour la retirer)': 'Chosen cards (tap a card to remove it)', 'Valeur': 'Rank', 'Effacer': 'Clear',
  'Choisissez la couleur, puis touchez les valeurs. {n} cartes au plus ; touchez une carte en haut pour la retirer.': 'Pick a suit, then tap the ranks. Up to {n} cards; tap a card at the top to remove it.',
  'Pique': 'Spades', 'Cœur': 'Hearts', 'Carreau': 'Diamonds', 'Trèfle': 'Clubs', '{r} de {s}': '{r} of {s}',
};

const KEY = 'poker-lang';
export const pref = () => { try { return localStorage.getItem(KEY) || 'auto'; } catch (e) { return 'auto'; } };
const detect = () => typeof document === 'undefined' ? 'fr' : ((navigator.languages?.[0] || navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en');
export let lang = pref() === 'auto' ? detect() : pref();
export const locale = () => (lang === 'en' ? 'en-GB' : 'fr-FR');

export function setPref(p) {
  try { localStorage.setItem(KEY, p); } catch (e) { /* facultatif */ }
  lang = p === 'auto' ? detect() : p;
  translateDOM();
}

// Devise : simple affichage, les montants ne sont pas convertis
export const CURRENCIES = {
  EUR: { sym: '€', name: 'Euro' }, USD: { sym: '$', name: 'Dollar américain' }, GBP: { sym: '£', name: 'Livre sterling' },
  CHF: { sym: 'CHF', name: 'Franc suisse' }, CAD: { sym: 'C$', name: 'Dollar canadien' },
};
const CKEY = 'poker-cur';
export let cur = (() => { try { const c = localStorage.getItem(CKEY); return CURRENCIES[c] ? c : 'EUR'; } catch (e) { return 'EUR'; } })();
export const sym = () => CURRENCIES[cur].sym;
export function setCur(c) {
  if (!CURRENCIES[c]) return;
  cur = c; try { localStorage.setItem(CKEY, c); } catch (e) { /* facultatif */ }
  translateDOM();
}

export function t(fr, vars) {
  let s = (lang === 'en' ? (EN[fr] ?? fr) : fr).replace('(€)', '(' + sym() + ')');
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}
// Pluriel : le français met le pluriel à partir de 2, l'anglais dès que n ≠ 1
export const tn = (n, one, many, vars = {}) => t((lang === 'en' ? n !== 1 : n > 1) ? many : one, { n, ...vars });
// Rang : 2e / 2nd
export const ord = n => {
  if (lang !== 'en') return n + 'e';
  const j = n % 10, k = n % 100;
  return n + (j === 1 && k !== 11 ? 'st' : j === 2 && k !== 12 ? 'nd' : j === 3 && k !== 13 ? 'rd' : 'th');
};

// Traduction du HTML fixe
const orig = new WeakMap(), ATTRS = ['placeholder', 'aria-label', 'alt', 'title'];
export function translateDOM(root = document.body) {
  document.documentElement.lang = lang;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.parentElement?.closest('script,style,[data-i18n-skip]')) continue;
    if (!orig.has(n)) { const s = n.nodeValue.trim(); if (!s || !(s in EN)) continue; orig.set(n, n.nodeValue); }
    const o = orig.get(n), s = o.trim();
    n.nodeValue = o.replace(s, t(s));
  }
  root.querySelectorAll('*').forEach(el => ATTRS.forEach(a => {
    const k = 'i18n' + a.replace(/-./, m => m[1].toUpperCase()).replace(/^./, c => c.toUpperCase());
    if (!(k in el.dataset)) { const v = el.getAttribute(a); if (v == null || !(v in EN)) return; el.dataset[k] = v; }
    el.setAttribute(a, t(el.dataset[k]));
  }));
}
