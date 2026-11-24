// Ce qu'un survol ou un clic désigne sur la carte de toutes les communes du pays. Un clic n'y
// change pas de zone : une commune n'est pas une zone, et un clic qui naviguerait empêcherait le
// double clic de zoomer. Il sélectionne, et une fiche décrit la sélection.
import { diagnosticUrl, landToZone } from '../../zones';
import type { CommuneValue, CommunesRender } from '../frame/types';

// Zoom à partir duquel un clic désigne une commune. En deçà, une commune médiane fait moins de
// 11 px de côté : le clic désigne son département, et non une commune prise au hasard sous le doigt.
const COMMUNE_SELECTION_MIN_ZOOM = 7.5;

// La valeur d'une carte bivariée s'écrit sur deux lignes dans une infobulle Highcharts, sur une seule ailleurs
const onOneLine = (valueText: string): string => valueText.replace(/<br\/>/g, ', ');

// Commune sous un point de la carte
// `tipText` : la phrase de la carte telle qu'elle l'écrit, ligne par ligne, pour l'infobulle
export type CommuneHit = { landId: string; name: string; departmentId: string; value: CommuneValue; tipText: string };

// Commune désignée par un point, d'après les attributs des entités que les tuiles y dessinent. À
// la limite de deux tuiles, la même commune est rendue une fois par tuile : la première suffit.
// Une commune hors de la zone affichée, dessinée transparente, n'est pas désignable.
export const communeHitOf = (rendered: Record<string, unknown>[], { describe }: Pick<CommunesRender, 'describe'>): CommuneHit | null => {
    for (const { land_id: landId, name, DEPART: departmentId } of rendered) {
        const value = typeof landId === 'string' ? describe(landId) : null;
        if (value) {
            return {
                landId: landId as string,
                name: typeof name === 'string' ? name : '',
                departmentId: typeof departmentId === 'string' ? departmentId : '',
                value: { ...value, valueText: onOneLine(value.valueText) },
                tipText: value.valueText,
            };
        }
    }
    return null;
};

// Ce qu'un clic sélectionne : un département et, si le zoom permet de la viser, une commune
export type CommuneSelection = { departmentId: string; commune: { landId: string; name: string } | null };

// null : le clic est tombé hors des communes affichées, il ne sélectionne rien
export const selectionOf = (zoom: number, hit: CommuneHit | null): CommuneSelection | null =>
    hit && { departmentId: hit.departmentId, commune: zoom >= COMMUNE_SELECTION_MIN_ZOOM ? { landId: hit.landId, name: hit.name } : null };

// Ce que la fiche de sélection affiche
export type SelectionSheet = {
    // `zone` : zone qu'ouvre « Afficher ce département par commune »
    department: { landId: string; zone: string; name: string };
    commune: { landId: string; name: string; valueText: string; diagnosticUrl: string } | null;
};

// Fiche d'une sélection sur la carte affichée : la valeur de la commune suit la carte, qui peut
// changer sous la sélection. null quand la carte ne montre plus ce qui était sélectionné (passage
// de la France entière à l'Hexagone, par exemple).
export const selectionSheetOf = ({ departmentId, commune }: CommuneSelection, { departments, describe }: Pick<CommunesRender, 'departments' | 'describe'>): SelectionSheet | null => {
    const department = departments.find((feature) => feature.properties.land_id === departmentId);
    const value = commune && describe(commune.landId);
    if (!department || (commune && !value)) return null;
    const land = { land_type: 'DEPART', land_id: departmentId };
    return {
        department: { landId: departmentId, zone: landToZone(land), name: department.properties.name },
        commune: commune && { ...commune, valueText: onOneLine(value.valueText), diagnosticUrl: diagnosticUrl(landToZone({ land_type: 'COMM', land_id: commune.landId })) },
    };
};
