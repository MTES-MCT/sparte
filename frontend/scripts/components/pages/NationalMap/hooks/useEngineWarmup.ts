import { useEffect } from 'react';
import { useGetEnvironmentQuery } from '@services/api';
import { communesTilesUrl } from '../components/stage/communesStyle';
import { prepareStageMap } from '../components/stage/mapLibre';
import { viewProfileOf } from '../domain/viewProfile';
import { ViewRequest, requestedIndicator } from '../domain/viewState';

// Une carte MapLibre n'est créée qu'une fois les données de sa vue reçues. Ce qu'elle attendrait
// alors, avant de charger sa première tuile, est préparé dès que la vue est demandée, pendant que
// ses données chargent : l'adresse des fichiers de tuiles (demandée dès l'ouverture de la page),
// les fils d'exécution de MapLibre et, pour la carte de toutes les communes du pays, l'en-tête de
// son fichier. Une carte par territoire ne prépare rien de MapLibre.
export const useEngineWarmup = (request: ViewRequest): void => {
    const { renderer } = viewProfileOf(request, requestedIndicator(request));
    const { data: environment } = useGetEnvironmentQuery({});
    const tilesLocation: string | null = environment?.vector_tiles_location ?? null;
    useEffect(() => {
        if (renderer === 'territory') return;
        prepareStageMap(renderer === 'communes' && tilesLocation ? communesTilesUrl(tilesLocation) : null);
    }, [renderer, tilesLocation]);
};
