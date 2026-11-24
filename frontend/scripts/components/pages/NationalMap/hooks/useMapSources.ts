import {
    useGetNationalMapArtifIndicatorsQuery,
    useGetNationalMapBaseMapQuery,
    useGetNationalMapIndicatorsQuery,
    useGetNationalMapValuesQuery,
} from '@services/api';
import type { NationalMapArtifIndicators, NationalMapBaseMap, NationalMapIndicators, NationalMapValues } from '@services/api';
import { dataSourceOf } from '../domain/frame/buildFrame';
import { valuesQueryOf, viewProfileOf } from '../domain/viewProfile';
import { ViewRequest, requestedIndicator } from '../domain/viewState';
import { zoneToLand } from '../zones';

export type SourceState<T> = {
    // Réponse de la requête DEMANDÉE ; indéfinie tant qu'elle charge
    current: T | undefined;
    // Dernière réponse reçue, d'une autre demande pendant un chargement : à ne lire que pour ce
    // qui ne décrit pas la vue (années disponibles)
    latest: T | undefined;
    isError: boolean;
};

export type MapSources = {
    base: SourceState<NationalMapBaseMap>;
    conso: SourceState<NationalMapIndicators>;
    artif: SourceState<NationalMapArtifIndicators>;
    values: SourceState<NationalMapValues>;
};

type QueryResult<T> = { currentData?: T; data?: T; isError: boolean };

const sourceOf = <T,>({ currentData, data, isError }: QueryResult<T>): SourceState<T> => ({ current: currentData, latest: data, isError });

// Les requêtes de la carte pour la vue demandée, d'après son profil : le fond et la consommation
// à la maille du fond, l'artificialisation (OCS GE) si une de ses cartes est demandée, et la
// colonne de valeurs par commune si la vue la dessine. Sur la vue de toutes les communes du pays,
// le fond est celui des départements : celui des communes n'est jamais demandé sans parent.
export const useMapSources = (request: ViewRequest): MapSources => {
    const indicator = requestedIndicator(request);
    const parent = zoneToLand(request.zone);
    const { baseScale } = viewProfileOf(request, indicator);
    const lands = parent ? { scale: baseScale, parent_type: parent.land_type, parent_id: parent.land_id } : { scale: baseScale };
    const column = valuesQueryOf(request, indicator);
    const base = useGetNationalMapBaseMapQuery(lands);
    const conso = useGetNationalMapIndicatorsQuery({ ...lands, start_year: request.startYear, end_year: request.endYear });
    const artif = useGetNationalMapArtifIndicatorsQuery(lands, { skip: dataSourceOf(indicator) !== 'artif' });
    const values = useGetNationalMapValuesQuery(column, { skip: column === null });
    return { base: sourceOf(base), conso: sourceOf(conso), artif: sourceOf(artif), values: sourceOf(values) };
};
