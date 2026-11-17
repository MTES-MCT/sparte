// Périodes que le sélecteur de période propose toutes prêtes : celles de la loi Climat et
// résilience, dont les bornes ne se devinent pas. Le sélecteur compte des millésimes inclus :
// « du 1er janvier 2011 au 1er janvier 2021 » s'y règle sur 2011 – 2020, et non sur 2011 – 2021,
// qui compterait une année de trop.
import type { PeriodPreset } from '@components/ui/PeriodSelector';
import type { NationalMapIndicators } from '@services/api';

const presetOf = (label: string, [startYear, endYear]: [number, number]): PeriodPreset => ({
    label,
    startYear,
    endYear,
    hint: `du 1er janvier ${startYear} au 1er janvier ${endYear + 1}`,
});

// Périodes de référence de la réponse des indicateurs ; aucune tant que cette réponse manque
export const presetPeriodsOf = (fixed: NationalMapIndicators['fixed_periods'] | undefined): PeriodPreset[] =>
    fixed ? [presetOf('Décennie de référence', fixed.p1), presetOf(`Depuis ${fixed.p2[0]}`, fixed.p2), presetOf('Toute la période', fixed.total)] : [];
