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
