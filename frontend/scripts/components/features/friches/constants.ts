export const FRICHE_STATUS_CONFIG = {
    'friche avec projet': { icon: 'bi bi-building' },
    'friche sans projet': { icon: 'bi bi-building-x' },
    'friche reconvertie': { icon: 'bi bi-building-check' },
} as const;

export const STATUT_BADGE_CONFIG = {
    'friche reconvertie': 'fr-badge--success',
    'friche avec projet': 'fr-badge--info',
    'friche sans projet': 'fr-badge--warning',
} as const;

export const STATUT_ORDER = [
    'friche sans projet',
    'friche avec projet',
    'friche reconvertie'
] as const; 