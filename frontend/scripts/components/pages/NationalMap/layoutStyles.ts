import { theme } from '@theme';

// Couleurs de la mise en page des diagnostics (voir components/layout/Navbar.tsx et Dashboard.tsx),
// reprises telles quelles pour que la carte nationale ait le même aspect
export const MENU_COLOR = '#313178';
export const MENU_ACTIVE_COLOR = theme.colors.purple;
export const MENU_ACTIVE_BORDER = '#6a6af4';
export const MENU_LINE_COLOR = '#E0E1FF';
export const PANEL_BORDER_COLOR = '#EEF2F7';
export const PAGE_BACKGROUND = '#f8f9ff';

// Sous cette largeur, un seul des deux volets (menu ou carte) est affiché, avec des onglets pour basculer
export const MOBILE_BREAKPOINT_PX = 980;
export const MOBILE_BREAKPOINT = `${MOBILE_BREAKPOINT_PX}px`;
// Sous cette largeur, la colonne de droite passe sous la carte et le contenu défile
export const STACK_BREAKPOINT = '1279px';
// Hauteur de la barre de titre quand le titre et les commandes partagent une ligne ; le bloc de
// marque du menu la reprend
export const TITLE_BAR_HEIGHT = '4.6rem';
// Sa hauteur quand la colonne passe sous la carte : les commandes y ont leur propre ligne
export const STACKED_TITLE_BAR_HEIGHT = '7.1rem';
// Ligne du fil d'Ariane dans la barre de titre, réservée même quand il n'a rien à montrer
export const BREADCRUMB_LINE_HEIGHT = '1.25rem';

// Colonne à droite de la carte (chiffres clés, note, graphiques). Elle suit la largeur de la
// fenêtre entre deux bornes : sur un écran moyen, c'est la largeur qui limite la carte, et chaque
// pixel de la colonne lui est pris. Au plancher, les deux chiffres clés tiennent encore côte à côte.
export const ASIDE_WIDTH = 'clamp(320px, 22vw, 400px)';

// Scène de la carte quand la colonne passe sous elle : le premier écran, moins la barre de titre
// et de quoi laisser voir le haut des chiffres clés, qui annonce la suite de la page
export const STACKED_STAGE_HEIGHT = `max(calc(100vh - ${STACKED_TITLE_BAR_HEIGHT} - 6rem), 360px)`;

// Scène de la carte sous les onglets mobiles : un peu plus haute que large. Une carte limitée par
// sa largeur (France entière, Bretagne) n'y perd rien et les chiffres clés remontent dans le
// premier écran ; un territoire tout en hauteur (Corse) y garde de la place. Elle est bornée par
// la hauteur de l'écran, pour un téléphone en paysage ou une tablette.
export const MOBILE_STAGE_ASPECT_RATIO = '10 / 11';
export const MOBILE_STAGE_MIN_HEIGHT = '320px';
export const MOBILE_STAGE_MAX_HEIGHT = 'max(60vh, 320px)';
