// Objets réels d'une carte de mailles (voir GridDetail) : à partir d'un zoom, la carte les dessine
// à la place des mailles. Leurs tuiles sont publiées par département : seuls ceux des mailles en
// vue sont lus, et rien n'est lu tant que la carte n'a pas atteint ce zoom. Les mailles restent
// dessinées sous les objets tant que ceux de la vue ne sont pas tous chargés : la carte n'est
// jamais vide entre les deux. Les objets ne dépendent pas des mailles : si leur fichier manque,
// les départements à lire sont déduits des territoires en vue.
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import type * as maplibregl from 'maplibre-gl';
import { useGetLandQuery } from '@services/api';
import type { Millesime } from '@services/types/land';
import type { DetailTiles, GridDetail } from '../../domain/grid/cells';
import { useLast } from '../../hooks/useLast';
import { useTilesAvailabilities } from './mapLibre';

const LAYER_PREFIX = 'national-map-detail-';
const layerIdOf = ({ department }: DetailTiles): string => `${LAYER_PREFIX}${department}`;

const NO_DEPARTMENTS: string[] = [];
const NO_MILLESIMES: Millesime[] = [];
const NO_TILES: DetailTiles[] = [];

type Options = {
    // Le style de la carte est chargé
    ready: boolean;
    // Objets de la carte affichée ; null : elle n'en a pas
    detail: GridDetail | null;
    // Adresse du dossier des fichiers de tuiles ; null tant qu'elle n'est pas connue
    tilesLocation: string | null;
    // Couche des mailles, où se lisent les départements en vue
    cellsLayer: string;
    // Le fichier des mailles manque : les départements se déduisent de la couche des territoires
    cellsMissing: boolean;
    landsLayer: string;
    // Couche sous laquelle les objets se glissent
    beforeLayer: string;
    // Classe de la légende des objets mise en avant
    highlightedClass: number | null;
    dimmedOpacity: number;
    // Appelé dans l'image même où la carte repasse sous le zoom des objets, qui ne sont alors plus
    // dessinés : les mailles doivent l'être de nouveau sans attendre le prochain rendu de React
    onObjectsHidden: () => void;
};

export type GridDetailView = {
    // Les objets sont dessinés : la légende et le survol parlent d'eux
    shown: boolean;
    // Les mailles n'ont plus à être dessinées sous eux : ceux de la vue sont tous chargés
    replacesCells: boolean;
    // Message de la carte quand des objets manquent dans la vue
    notice: string | null;
    // Couches des objets posées sur la carte, à l'instant de l'appel
    layerIds: () => string[];
};

export const useGridDetail = (mapRef: RefObject<maplibregl.Map | null>, options: Options): GridDetailView => {
    const { ready, detail, tilesLocation, cellsLayer, cellsMissing, landsLayer, beforeLayer, highlightedClass, dimmedOpacity, onObjectsHidden } = options;
    const minZoom = detail?.minZoom ?? null;
    const maxZoom = detail?.maxZoom ?? null;
    // La carte a atteint le zoom des objets
    const [zoomedIn, setZoomedIn] = useState(false);
    // Départements des mailles en vue, lus quand la carte est au repos
    const [departments, setDepartments] = useState(NO_DEPARTMENTS);
    // Les objets ont été dessinés depuis que la carte a atteint leur zoom, et certains chargent encore
    const [drawn, setDrawn] = useState(false);
    const [loading, setLoading] = useState(false);
    // Couches posées sur la carte, avec la description dont vient leur filtre
    const layers = useRef(new Map<string, GridDetail>());

    // Sans objets à explorer, la carte garde le zoom maximal de MapLibre
    useEffect(() => {
        if (ready) mapRef.current?.setMaxZoom(maxZoom);
    }, [mapRef, ready, maxZoom]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || minZoom === null) {
            setZoomedIn(false);
            return undefined;
        }
        const follow = () => {
            const reached = map.getZoom() >= minZoom;
            if (!reached) onObjectsHidden();
            setZoomedIn(reached);
        };
        follow();
        map.on('zoom', follow);
        return () => {
            map.off('zoom', follow);
        };
    }, [mapRef, ready, minZoom, onObjectsHidden]);

    // Dernier millésime de chaque département : il se lit dans la fiche du territoire, comme le
    // font les diagnostics. Elle n'est demandée qu'une fois le zoom des objets atteint, et ses
    // millésimes restent connus ensuite : ceux d'un département ne dépendent pas de la zone.
    const { currentData: land } = useGetLandQuery(detail?.land, { skip: !detail || !zoomedIn });
    const millesimes = useLast<Millesime[]>(land?.millesimes ?? null) ?? NO_MILLESIMES;

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !detail || !zoomedIn) return undefined;
        const drawnIn = (layer: string) => map.queryRenderedFeatures({ layers: [layer] }).map((feature) => feature.properties ?? {});
        // Au repos, les mailles de la vue sont chargées : leurs attributs disent ses départements
        const read = () => {
            let seen: string[];
            if (map.getLayer(cellsLayer)) seen = detail.departmentsOf(drawnIn(cellsLayer));
            else if (cellsMissing && map.getLayer(landsLayer)) seen = detail.departmentsWithoutCells(millesimes, drawnIn(landsLayer));
            // Mailles pas encore posées : elles diront les départements à leur arrivée
            else return;
            setDepartments((current) => (current.join() === seen.join() ? current : seen));
        };
        map.on('idle', read);
        // Un rendu est demandé, pour que l'événement « idle » suive même si la carte est déjà au repos
        map.triggerRepaint();
        return () => {
            map.off('idle', read);
        };
    }, [mapRef, detail, zoomedIn, cellsLayer, cellsMissing, landsLayer, millesimes]);

    // Fichiers des départements en vue, et ceux qui sont publiés
    const wanted = useMemo(() => (detail && tilesLocation ? detail.tilesOf(millesimes, departments) : NO_TILES), [detail, tilesLocation, millesimes, departments]);
    const urls = useMemo(() => wanted.map(({ file }) => `${tilesLocation}/${file}`), [wanted, tilesLocation]);
    const known = useTilesAvailabilities(urls);
    const available = useMemo(() => wanted.filter((_, rank) => known[urls[rank]] === true), [wanted, urls, known]);
    const missing = urls.some((url) => known[url] === false);
    const unchecked = urls.some((url) => known[url] === undefined);

    // Une source et une couche par département en vue ; celles des départements sortis de la vue
    // sont retirées. Sous le zoom des objets, les couches ne dessinent ni ne chargent rien, et
    // restent en place : revenir à ce zoom ne recharge pas leurs tuiles.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        const kept = new Set(available.map(layerIdOf));
        [...layers.current.keys()]
            .filter((id) => !kept.has(id))
            .forEach((id) => {
                map.removeLayer(id);
                map.removeSource(id);
                layers.current.delete(id);
            });
        if (!detail || !map.getLayer(beforeLayer)) return;
        available.forEach((tiles) => {
            const id = layerIdOf(tiles);
            if (layers.current.get(id) === detail) return;
            if (layers.current.has(id)) {
                map.setFilter(id, detail.filter as maplibregl.FilterSpecification | null);
            } else {
                map.addSource(id, { type: 'vector', url: `pmtiles://${tilesLocation}/${tiles.file}` });
                map.addLayer(
                    {
                        id,
                        type: 'fill',
                        source: id,
                        'source-layer': tiles.layer,
                        minzoom: detail.minZoom,
                        ...(detail.filter ? { filter: detail.filter as maplibregl.FilterSpecification } : {}),
                        paint: { 'fill-color': detail.color, 'fill-outline-color': detail.outlineColor },
                    },
                    beforeLayer,
                );
            }
            layers.current.set(id, detail);
        });
    }, [mapRef, ready, detail, available, tilesLocation, beforeLayer]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !detail) return;
        const opacity = detail.opacity(highlightedClass, dimmedOpacity);
        layers.current.forEach((_, id) => map.setPaintProperty(id, 'fill-opacity', opacity));
    }, [mapRef, detail, available, highlightedClass, dimmedOpacity]);

    // Les objets sont dessinés quand la carte revient au repos avec toutes leurs sources chargées ;
    // ils le restent tant qu'elle garde leur zoom. Une source qui se remet à charger (déplacement,
    // nouveau département) rend les mailles, le temps que ses tuiles arrivent.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !zoomedIn) {
            setDrawn(false);
            setLoading(false);
            return undefined;
        }
        const settle = () => {
            const ids = [...layers.current.keys()];
            const loaded = ids.every((id) => map.isSourceLoaded(id));
            if (loaded) setLoading(false);
            setDrawn((current) => ids.length > 0 && (current || loaded));
        };
        const startLoading = ({ sourceId }: { sourceId?: string }) => {
            if (sourceId && layers.current.has(sourceId)) setLoading(true);
        };
        map.on('idle', settle);
        map.on('sourcedataloading', startLoading);
        return () => {
            map.off('idle', settle);
            map.off('sourcedataloading', startLoading);
        };
    }, [mapRef, zoomedIn]);

    const shown = zoomedIn && drawn;
    return {
        shown,
        replacesCells: shown && !loading && !missing && !unchecked,
        notice: zoomedIn && missing && detail ? detail.partialNotice : null,
        layerIds: () => [...layers.current.keys()],
    };
};
