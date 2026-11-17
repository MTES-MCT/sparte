// Mailles carrées en aplat, à bornes fixes, dessinées par MapLibre sur le contour des territoires
// de la zone. Deux familles de cartes : la consommation d'espaces carroyée (une carte par
// destination et une pour toutes : mêmes bornes, chacune dans la couleur de sa destination) et les
// sols artificialisés de l'OCS GE, dont les objets remplacent les mailles aux grands zooms.
import type { NationalMapFeature } from '@services/api';
import { GRID_METHOD_LABEL, consoCells, gridCellName, gridClasses, isInGridCoverage } from '../../../gridded';
import { GRID_DESTINATIONS } from '../../../indicators';
import { NO_DATA_COLOR, formatValue, periodLabel } from '../../../values';
import { chartsLandOf } from '../../../zones';
import { SOIL_CLASSES, SOIL_METHOD_LABEL, SOIL_NO_DATA_LABEL, soilCells } from '../../grid/soilCells';
import { SOIL_IMAGE_BASIS, SOIL_IMAGE_CLASSES, SOIL_IMAGE_LAND_COLOR, dominantGeneration, soilImage, soilImageMethod } from '../../grid/soilImage';
import { SOIL_OBJECTS_BASIS, SOIL_OBJECTS_HINT, SOIL_OBJECTS_METHOD_LABEL, SOIL_OBJECT_CLASSES, soilObjects } from '../../grid/soilObjects';
import type { FrameBase, FrameContext, FrameRender, LegendModel, Period } from '../types';
import { legendSignature } from './points';

// Les lignes de la légende ont le même sens pour toutes les cartes carroyées de la consommation :
// une classe mise en avant le reste d'une destination à l'autre, comme d'une période à l'autre
const SHARED_CONSO_LEGEND = { id: 'grid' };

// Territoires dessinés sous les carreaux de la consommation. La géographie est réelle : sur la
// France entière et l'Hexagone, les territoires d'outre-mer (déplacés par le fond, et hors carroyage)
// sont retirés. Chaque fond n'est filtré qu'une fois : tant qu'il ne change pas, la carte reçoit le
// même tableau et ne redessine ni ne recadre son fond, ce qui garde le zoom d'une destination ou
// d'une période à l'autre.
const coveredFeatures = new WeakMap<FrameBase, NationalMapFeature[]>();
const consoFeaturesOf = (base: FrameBase): NationalMapFeature[] => {
    if (base.parent !== null) return base.features;
    const covered = coveredFeatures.get(base) ?? base.features.filter((feature) => isInGridCoverage(feature.properties.zone));
    coveredFeatures.set(base, covered);
    return covered;
};

const landIdsOf = (features: NationalMapFeature[]): string[] => features.map((feature) => feature.properties.land_id);

const buildConsoGrid = ({ base, indicator }: FrameContext, period: Period): { render: FrameRender; legend: LegendModel } => {
    const periodText = periodLabel(period.startYear, period.endYear);
    const destination = indicator.destination ?? null;
    // Complément qui désigne la destination dans les textes ; vide pour toutes les destinations
    const ofDestination = destination ? ` ${GRID_DESTINATIONS[destination].complement}` : '';
    const features = consoFeaturesOf(base);
    return {
        render: {
            renderer: 'grid',
            mode: 'grid',
            features,
            insets: [],
            separation: [],
            parentBoundary: base.parentBoundary,
            cells: consoCells({
                zone: base.zone,
                displayed: { scale: base.scale, landIds: landIdsOf(features) },
                covered: features.length === 0 || features.some((feature) => isInGridCoverage(feature.properties.zone)),
                destination,
                period,
                periodText,
                describeValue: (valueHa, cellSizeKm) => {
                    if (valueHa === null) return `Pas de consommation${ofDestination} localisée dans ce carreau ${periodText}`;
                    const value = formatValue(valueHa, indicator);
                    // À petite échelle les carreaux sont regroupés en blocs, dont la valeur est une moyenne par km²
                    return cellSizeKm > 1
                        ? `${value} consommés${ofDestination} par km², en moyenne sur ce ${gridCellName(cellSizeKm).toLowerCase()} ${periodText}`
                        : `${value} consommés${ofDestination} dans ce carreau ${periodText}`;
                },
            }),
            detail: null,
            image: null,
        },
        // Classes à bornes fixes : leur sens ne dépend ni de la période ni de la destination, seule
        // leur couleur est celle de la destination
        legend: {
            kind: 'grid',
            signature: legendSignature({ base, indicator: SHARED_CONSO_LEGEND }),
            title: indicator.label,
            classes: gridClasses(destination),
            // Par km² : la grandeur d'un carreau de 1 km comme d'un bloc de carreaux regroupés à petite échelle
            basis: `Par km², ${periodText}`,
            method: destination
                ? `${GRID_METHOD_LABEL}. Seule la consommation${ofDestination} est représentée, dans la couleur de cette destination, avec les bornes de la carte de toutes les destinations, pour que les cartes se comparent`
                : GRID_METHOD_LABEL,
            noData: null,
            detail: null,
            image: null,
        },
    };
};

// Départements de la zone quand elle est un EPCI, d'après son fond
const epciDepartmentsOf = ({ parent }: FrameBase): string[] =>
    parent?.land_type === 'EPCI' ? parent.ancestors.filter((ancestor) => ancestor.land_type === 'DEPART').map((ancestor) => ancestor.land_id) : [];

// Sols artificialisés : toutes les zones sont couvertes, et la France entière garde ses territoires
// d'outre-mer rapprochés de l'Hexagone, sur lesquels se posent leurs mailles déplacées
const buildSoilGrid = ({ base, indicator, data }: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const displayed = { scale: base.scale, landIds: landIdsOf(base.features) };
    // L'image est celle de la génération des chiffres affichés à côté de la carte
    const image = soilImage(base.zone, data.source === 'artif' ? dominantGeneration(Object.values(data.response.lands)) : undefined);
    return {
        render: {
            renderer: 'grid',
            mode: 'grid',
            features: base.features,
            insets: base.insets,
            separation: base.separation,
            parentBoundary: base.parentBoundary,
            cells: soilCells(base.zone, { ...displayed, departments: epciDepartmentsOf(base) }),
            detail: soilObjects(base.zone, displayed, chartsLandOf(base.zone)),
            image,
        },
        legend: {
            kind: 'grid',
            signature: legendSignature({ base, indicator }),
            title: 'Part des sols artificialisés',
            classes: SOIL_CLASSES,
            basis: 'Par maille. Zoomez pour voir les objets OCS GE.',
            method: SOIL_METHOD_LABEL,
            noData: { label: SOIL_NO_DATA_LABEL, color: NO_DATA_COLOR },
            detail: {
                title: 'Nature des sols',
                classes: SOIL_OBJECT_CLASSES,
                basis: SOIL_OBJECTS_BASIS,
                method: SOIL_OBJECTS_METHOD_LABEL,
                hint: SOIL_OBJECTS_HINT,
            },
            image: {
                title: 'Nature des sols',
                classes: SOIL_IMAGE_CLASSES,
                basis: SOIL_IMAGE_BASIS,
                method: soilImageMethod(image),
                noDataColor: SOIL_IMAGE_LAND_COLOR,
            },
        },
    };
};

export const buildGrid = (ctx: FrameContext): { render: FrameRender; legend: LegendModel } => {
    const { data } = ctx;
    return data.source === 'artif' ? buildSoilGrid(ctx) : buildConsoGrid(ctx, { startYear: data.response.start_year, endYear: data.response.end_year });
};
