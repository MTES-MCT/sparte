// Profil d'une vue : ce qui découle de la zone, de la maille et de la carte demandées, avant
// toute réponse de l'API. Les requêtes, le contrôle des réponses et le choix du rendu le lisent
// tous ici, pour ne jamais se contredire.
//
// Une vue fait exception, la « vue dense » : toutes les communes d'une zone nationale (France
// entière ou Hexagone), soit 34 875 territoires. Trop nombreuses pour être dessinées une à une en
// SVG, elles viennent de tuiles vectorielles et sont colorées par une colonne de valeurs. La vue
// garde le cadre de la maille département (contours, cartouches d'outre-mer, chiffres clés), et
// ne dessine que des aplats : des cercles ou des anneaux par commune y feraient moins d'un pixel.
import type { NationalMapValues, NationalMapValuesQuery } from '@services/api';
import { Indicator, IndicatorUnit, RenderMode, renderModeOf } from '../indicators';
import { zoneLevel } from '../zones';
import type { FrameRender } from './frame/types';
import type { ViewRequest } from './viewState';

const DENSE_SCALE = 'COMM';
// Maille du fond de carte de la vue dense
const DENSE_BASE_SCALE = 'DEPART';

export type View = Pick<ViewRequest, 'zone' | 'scale'>;

export const isDenseView = ({ zone, scale }: View): boolean => zoneLevel(zone) === 'NATION' && scale === DENSE_SCALE;

// Valeur que la carte dessine : sa clé dans la réponse lue, et la façon de l'écrire
export type DrawnValue = {
    key: string;
    label: string;
    unit?: IndicatorUnit;
    decimals?: number;
    // Évolution, dont les classes se répartissent de part et d'autre de zéro
    diverging: boolean;
};

export type ViewProfile = {
    renderer: FrameRender['renderer'];
    mode: RenderMode;
    // Maille du fond de carte et des réponses par territoire, d'où viennent les chiffres clés
    baseScale: string;
    drawn: DrawnValue;
    // Clé des hectares donnés au survol quand la carte dessine leur version relative ; null sinon
    amountKey: string | null;
};

// La carte dessine la valeur de l'indicateur lui-même
const ownValue = (indicator: Indicator): DrawnValue => ({
    key: indicator.id,
    label: indicator.label,
    unit: indicator.unit,
    decimals: indicator.decimals,
    diverging: indicator.palette === 'diverging',
});

// La carte dessine la version relative d'un indicateur en hectares ; une valeur signée y garde ses deux sens
const relativeValue = ({ relative: { key, label, unit, decimals }, signed }: Indicator): DrawnValue => ({ key, label, unit, decimals, diverging: Boolean(signed) });

export const viewProfileOf = (view: View, indicator: Indicator): ViewProfile => {
    const mode = renderModeOf(indicator);
    const own = ownValue(indicator);
    if (!isDenseView(view)) return { renderer: mode === 'grid' ? 'grid' : 'territory', mode, baseScale: view.scale, drawn: own, amountKey: null };
    // Les carreaux se dessinent sur les départements, comme à la maille département
    if (mode === 'grid') return { renderer: 'grid', mode, baseScale: DENSE_BASE_SCALE, drawn: own, amountKey: null };
    // Jamais d'hectares en aplat : une carte en hectares, en cercles ou en anneaux, est dessinée par sa version relative
    if (mode === 'symbols' || mode === 'rings') {
        return { renderer: 'communes', mode: 'choropleth', baseScale: DENSE_BASE_SCALE, drawn: relativeValue(indicator), amountKey: indicator.relative.amount ?? indicator.id };
    }
    return { renderer: 'communes', mode, baseScale: DENSE_BASE_SCALE, drawn: own, amountKey: null };
};

// Colonne de valeurs par commune à demander pour la vue ; null quand la vue lit les réponses par territoire
export const valuesQueryOf = (request: ViewRequest, indicator: Indicator): NationalMapValuesQuery | null => {
    const { renderer, drawn, amountKey } = viewProfileOf(request, indicator);
    if (renderer !== 'communes') return null;
    return {
        scale: request.scale,
        key: drawn.key,
        ...(amountKey ? { amount: amountKey } : {}),
        // Une clé qui ne dépend pas de la période est demandée sans elle : changer de période ne la recharge pas
        ...(indicator.usesPeriod ? { start_year: request.startYear, end_year: request.endYear } : {}),
    };
};

// La réponse est-elle celle de cette demande ? Elle rappelle la maille, les clés et la période servies.
export const answersValuesQuery = (values: NationalMapValues, query: NationalMapValuesQuery): boolean =>
    values.scale === query.scale &&
    values.key === query.key &&
    values.amount === (query.amount ?? null) &&
    values.start_year === (query.start_year ?? null) &&
    values.end_year === (query.end_year ?? null);
