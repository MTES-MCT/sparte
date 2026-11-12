/**
 * Indique si un flux OCS GE (artificialisation ou imperméabilisation) entre deux
 * millésimes contient au moins un objet. Sans flux, la carte des différences
 * n'aurait rien à afficher.
 */
export const hasOcsgeFlux = (fluxPositif?: number | null, fluxNegatif?: number | null): boolean =>
  (fluxPositif ?? 0) > 0 || (fluxNegatif ?? 0) > 0;
