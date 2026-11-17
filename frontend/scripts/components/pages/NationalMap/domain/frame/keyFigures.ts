// Chiffres clés de la zone affichée, sommés sur les territoires visibles
import { formatNumber } from '@utils/formatUtils';
import { ArtifTotals, artifTotals } from '../../artifIndicators';
import type { MillesimeReading } from '../millesimes';
import { artifLandsOf, consoLandsOf, millesimeReadingOf } from './shownLands';
import type { FrameContext, KeyFigure, KeyFiguresModel } from './types';

export type KeyFiguresId = 'conso_period' | 'artif_stock' | 'artif_flux' | 'artif_gross_flux';

const sum = (values: (number | null)[]): number | null => {
    const present = values.filter((v): v is number => v !== null && v !== undefined);
    return present.length > 0 ? present.reduce((a, b) => a + b, 0) : null;
};

// Nombre signé : une artificialisation nette s'écrit « +120 », une désartificialisation nette « -12 »
const signed = (value: number, decimals: number): string => `${value > 0 ? '+' : ''}${formatNumber({ number: value, decimals })}`;

// Rappel sous chaque chiffre : la désignation du ou des millésimes, sans leurs années, que la
// barre de titre et la note de la carte donnent une fois pour tous les chiffres
const ocsgeFooter = (reading: MillesimeReading | null): KeyFigure['footer'] => ({ type: 'period', from: reading?.title ?? 'Millésimes de l’OCS GE' });

const NO_OCSGE: KeyFiguresModel = { kind: 'empty', message: 'Aucune donnée OCS GE pour cette zone.' };

const hectares = (value: number | null): string | null => (value === null ? null : formatNumber({ number: value, decimals: 0 }));

// Artificialisation nette entre les deux derniers millésimes des territoires renseignés, et son rythme annuel
const netFluxFigures = ({ netHa, annualNetHa }: ArtifTotals, footer: KeyFigure['footer']): KeyFigure[] => {
    return [
        { icon: 'bi-bar-chart', label: 'Artificialisation nette', value: netHa === null ? null : signed(netHa, 0), unit: 'ha', footer },
        { icon: 'bi-speedometer2', label: 'Rythme annuel moyen', value: annualNetHa === null ? null : signed(annualNetHa, 0), unit: 'ha/an', footer },
    ];
};

export const KEY_FIGURES: Record<KeyFiguresId, (ctx: FrameContext) => KeyFiguresModel> = {
    // Consommation totale et rythme annuel sur la période de la réponse
    conso_period: (ctx) => {
        const lands = consoLandsOf(ctx);
        if (lands.length === 0 || !ctx.period) return { kind: 'empty', message: 'Aucune donnée pour cette zone.' };
        const { startYear, endYear } = ctx.period;
        const conso = sum(lands.map((land) => land.conso_ha));
        const years = endYear - startYear + 1;
        const footer: KeyFigure['footer'] = { type: 'period', from: String(startYear), to: String(endYear) };
        return {
            kind: 'figures',
            figures: [
                { icon: 'bi-bar-chart', label: "Consommation d'espaces", value: conso === null ? null : formatNumber({ number: conso, decimals: 0 }), unit: 'ha', footer },
                { icon: 'bi-speedometer2', label: 'Rythme annuel moyen', value: conso === null ? null : formatNumber({ number: conso / years, decimals: 0 }), unit: 'ha/an', footer },
            ],
        };
    },
    // Surface et part artificialisées des territoires renseignés, à leur dernier millésime
    artif_stock: (ctx) => {
        const totals = artifTotals(artifLandsOf(ctx).lands);
        if (totals.withData === 0) return NO_OCSGE;
        const footer = ocsgeFooter(millesimeReadingOf(ctx));
        return {
            kind: 'figures',
            figures: [
                { icon: 'bi-buildings', label: 'Surface artificialisée', value: totals.artifHa === null ? null : formatNumber({ number: totals.artifHa, decimals: 0 }), unit: 'ha', footer },
                { icon: 'bi-pie-chart', label: 'Part du territoire artificialisée', value: totals.artifPct === null ? null : formatNumber({ number: totals.artifPct, decimals: 1 }), unit: '%', footer },
            ],
        };
    },
    artif_flux: (ctx) => {
        const totals = artifTotals(artifLandsOf(ctx).lands);
        return totals.withData === 0 ? NO_OCSGE : { kind: 'figures', figures: netFluxFigures(totals, ocsgeFooter(millesimeReadingOf(ctx))) };
    },
    // Les mêmes, puis les deux flux bruts dont l'artificialisation nette est la différence : ce
    // que somment les anneaux de la carte
    artif_gross_flux: (ctx) => {
        const totals = artifTotals(artifLandsOf(ctx).lands);
        if (totals.withData === 0) return NO_OCSGE;
        const footer = ocsgeFooter(millesimeReadingOf(ctx));
        return {
            kind: 'figures',
            figures: [
                ...netFluxFigures(totals, footer),
                { icon: 'bi-plus-circle', label: 'Surfaces artificialisées', value: hectares(totals.grossArtifHa), unit: 'ha', footer },
                { icon: 'bi-dash-circle', label: 'Surfaces désartificialisées', value: hectares(totals.grossDesartifHa), unit: 'ha', footer },
            ],
        };
    },
};
