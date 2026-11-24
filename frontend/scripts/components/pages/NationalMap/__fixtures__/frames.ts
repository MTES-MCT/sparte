// Cadres d'essai : des vues complètes, construites comme la page les construit à l'arrivée du
// fond de carte et des données
import type { NationalMapArtifIndicators, NationalMapBaseMap, NationalMapIndicators, NationalMapValues } from '@services/api';
import { ARTIF_INDICATORS } from '../artifIndicators';
import { buildFrame } from '../domain/frame/buildFrame';
import type { MapFrame } from '../domain/frame/types';
import { CONSO_INDICATORS, Indicator } from '../indicators';

export const indicatorOf = (id: string): Indicator => [...CONSO_INDICATORS, ...ARTIF_INDICATORS].find((indicator) => indicator.id === id);

// Carte de consommation d'une zone, sur la période de la réponse
export const consoFrame = (zone: string, base: NationalMapBaseMap, indicatorId: string, conso: NationalMapIndicators): MapFrame =>
    buildFrame({
        request: { zone, scale: base.scale, startYear: conso.start_year, endYear: conso.end_year, indicatorId },
        indicator: indicatorOf(indicatorId),
        base,
        conso,
    });

// Carte d'artificialisation (OCS GE) d'une zone
export const artifFrame = (zone: string, base: NationalMapBaseMap, indicatorId: string, artif: NationalMapArtifIndicators): MapFrame =>
    buildFrame({
        request: { zone, scale: base.scale, startYear: 2011, endYear: 2024, indicatorId },
        indicator: indicatorOf(indicatorId),
        base,
        artif,
    });

// Toutes les communes d'une zone nationale : le fond et les données par département, et la
// colonne de valeurs par commune que la carte dessine
export const communesFrame = (
    zone: string,
    indicatorId: string,
    values: NationalMapValues,
    responses: { base: NationalMapBaseMap; conso?: NationalMapIndicators; artif?: NationalMapArtifIndicators },
): MapFrame =>
    buildFrame({
        request: { zone, scale: 'COMM', startYear: responses.conso?.start_year ?? 2011, endYear: responses.conso?.end_year ?? 2024, indicatorId },
        indicator: indicatorOf(indicatorId),
        values,
        ...responses,
    });
