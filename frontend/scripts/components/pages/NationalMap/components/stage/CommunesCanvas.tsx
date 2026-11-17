import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type * as maplibregl from 'maplibre-gl';
import { useGetEnvironmentQuery } from '@services/api';
import type { HoveredLand } from '../../ClassLegend';
import { CommuneColors, colorChanges, communeColors } from '../../domain/communes/colors';
import { extentToLngLat, zoneExtent } from '../../domain/communes/extent';
import { CommuneSelection, communeHitOf, selectionOf, selectionSheetOf } from '../../domain/communes/selection';
import { insetMapLabels } from '../../domain/frame/base';
import type { ExportLegend, MapImageInfo } from '../../domain/frame/exportImage';
import type { CommunesRender, FrameBase, LegendKey } from '../../domain/frame/types';
import { separationLine, toLngLatCollection } from '../../gridded';
import OverviewButton, { ZoomControlsCorner } from './OverviewButton';
import SelectionCard from './SelectionCard';
import {
    COMMUNES_FILL,
    COMMUNES_LAYERS,
    COMMUNES_SOURCE,
    COMMUNES_SOURCE_LAYER,
    COMMUNE_OUTLINE,
    DEPARTMENTS_SOURCE,
    FRAME_LAYERS,
    FRAME_SOURCES,
    SEPARATION_SOURCE,
    communeOutlineFilter,
    communesSource,
    communesTilesUrl,
} from './communesStyle';
import { exportMapPng } from './exportPng';
import { createHoverOutline, piecesAround } from './hoverOutline';
import { MapContainer, StageMapStatus, addLabels, createStageMap, createTooltip, useTilesAvailability } from './mapLibre';
import { stagePadding } from './territoryOptions';
import { useOverviewCamera } from './useOverviewCamera';

// Carte MapLibre de toutes les communes d'une zone nationale (France entière ou Hexagone) : des
// tuiles vectorielles, colorées commune par commune d'après le cadre affiché, sous les limites
// des départements de la carte par département (mêmes territoires d'outre-mer rapprochés de
// l'Hexagone). Une seule carte sert tant que la vue reste celle-là : changer de carte, de période,
// de zone nationale ou de classe mise en avant ne fait que reposer des couleurs.

// Au-delà, les tuiles (zooms 3 à 10) n'apportent plus de détail
const MAX_ZOOM = 11;
// Coin des boutons de zoom et du retour à la vue d'ensemble : le bas à gauche est à la fiche de sélection
const ZOOM_CONTROLS: ZoomControlsCorner = 'top-right';
// Durée du recadrage quand la zone change
const ZONE_CHANGE_MS = 300;
// Délai avant d'estomper la carte pour une classe de la légende : balayer la légende du pointeur
// ne repose pas les couleurs à chaque ligne traversée
const HIGHLIGHT_INTENT_MS = 40;

// Repères posés à la création de la carte et à chaque image qui suit une pose de couleurs : leur
// nombre et leurs dates se lisent dans le navigateur par performance.getEntriesByName
const CREATE_MARK = 'national-map:communes-create';
const PAINT_MARK = 'national-map:communes-paint';

const NOTICE_UNAVAILABLE =
    "La carte de toutes les communes du pays n'a pas pu être affichée : choisissez une région, un département ou un EPCI pour voir ses communes.";

interface CommunesCanvasProps {
    // Fond de la vue : la zone, ses cartouches d'outre-mer et la ligne qui les sépare de l'Hexagone
    base: FrameBase;
    // Départements, clés de légende et palette de la carte à dessiner
    render: CommunesRender;
    // Ligne de la légende dont les communes restent nettes, les autres étant estompées
    highlightedClass: LegendKey | null;
    // Petite carte : les territoires d'outre-mer sont désignés par des numéros
    numberedInsets: boolean;
    // La vue demandée est en cours de chargement : la carte est estompée et les clics ignorés
    busy: boolean;
    ariaLabel: string;
    // Textes et légende de l'image exportée
    exportInfo: MapImageInfo;
    exportLegend: ExportLegend;
    onHover: (commune: HoveredLand | null) => void;
    // Le dernier geste a-t-il été fait au doigt ? Lu à chaque survol ; sans lui, jamais
    touching?: () => boolean;
    // Emplacement de la page où la fiche de sélection est rendue ; sans lui, elle l'est sur la carte
    sheetSlot?: HTMLElement | null;
    onZoneChange?: (zone: string, name?: string) => void;
    // `ready` : les couleurs de la carte reçue sont à l'écran
    onStatusChange: (status: StageMapStatus) => void;
}

// Classe mise en avant sur la carte : celle que demande la légende, après un court délai. Une
// carte neuve (`render`) prend tout de suite celle de sa légende : la classe d'une autre carte
// n'y aurait pas de sens.
const useSettledHighlight = (render: CommunesRender, requested: LegendKey | null): LegendKey | null => {
    const [stored, setStored] = useState({ render, key: requested });
    let settled = stored;
    if (stored.render !== render) {
        // État ajusté pendant le rendu : React rend de nouveau aussitôt, sans image intermédiaire
        settled = { render, key: requested };
        setStored(settled);
    }
    useEffect(() => {
        if (settled.key === requested) return undefined;
        const timer = setTimeout(() => setStored({ render, key: requested }), HIGHLIGHT_INTENT_MS);
        return () => clearTimeout(timer);
    }, [render, requested, settled.key]);
    return settled.key;
};

export type CommunesCanvasHandle = {
    // Télécharge l'image de la carte telle qu'elle est à l'écran, avec son titre et sa légende
    exportPng: () => void;
};

const CommunesCanvas = forwardRef<CommunesCanvasHandle, CommunesCanvasProps>((props, ref) => {
    const { base, render, highlightedClass, numberedInsets, busy, ariaLabel, onZoneChange, onStatusChange } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    // Le style de la carte est chargé, puis la source des communes y est posée
    const [loaded, setLoaded] = useState(false);
    const [installed, setInstalled] = useState(false);
    // Le navigateur n'a pas pu créer la carte (WebGL absent), ou elle a signalé une erreur
    const [unsupported, setUnsupported] = useState(false);
    const [errored, setErrored] = useState(false);
    // Carte dont les couleurs sont à l'écran
    const [painted, setPainted] = useState<CommunesRender | null>(null);
    const [selection, setSelection] = useState<CommuneSelection | null>(null);

    const { data: environment } = useGetEnvironmentQuery({});
    const tilesUrl = environment?.vector_tiles_location ? communesTilesUrl(environment.vector_tiles_location) : null;
    const tilesAvailable = useTilesAvailability(tilesUrl);

    // Vue d'ensemble : l'emprise de la zone, cartouches d'outre-mer compris, dans les marges de la
    // carte par territoire. Les deux moteurs montrent ainsi les territoires à la même place.
    const overview = useMemo(() => {
        const extent = zoneExtent(base);
        return extent && { bounds: extentToLngLat(extent), padding: stagePadding(base, numberedInsets) };
    }, [base, numberedInsets]);

    // Ce que les gestionnaires d'événements de la carte lisent au moment où ils sont appelés
    const live = useRef({ props });
    useLayoutEffect(() => {
        live.current = { props };
    });

    // Création de la carte, une seule fois
    useEffect(() => {
        const container = containerRef.current;
        // Boutons de zoom en haut à droite : le seul coin que ni les territoires d'outre-mer ni la
        // Corse n'occupent sur la France entière
        const map = container && createStageMap(container, { controls: ZOOM_CONTROLS, maxZoom: MAX_ZOOM });
        if (!map) {
            setUnsupported(true);
            return undefined;
        }
        mapRef.current = map;
        performance.mark(CREATE_MARK);
        const tooltip = createTooltip(map);
        // Contour de la commune survolée ; son département est cerné par ailleurs (markDepartment)
        const outline = createHoverOutline(map);

        // Département de la commune survolée : c'est lui qu'un clic désigne au cadrage du pays
        let hoveredDepartment: string | null = null;
        const markDepartment = (departmentId: string | null) => {
            if (departmentId === hoveredDepartment || !map.getSource(DEPARTMENTS_SOURCE)) return;
            if (hoveredDepartment) map.setFeatureState({ source: DEPARTMENTS_SOURCE, id: hoveredDepartment }, { hover: false });
            if (departmentId) map.setFeatureState({ source: DEPARTMENTS_SOURCE, id: departmentId }, { hover: true });
            hoveredDepartment = departmentId;
        };
        const hitAt = (point: maplibregl.PointLike) => {
            const rendered = map.getLayer(COMMUNES_FILL) ? map.queryRenderedFeatures(point, { layers: [COMMUNES_FILL] }) : [];
            return communeHitOf(rendered.map((feature) => feature.properties), live.current.props.render);
        };
        const leave = () => {
            tooltip.hide();
            outline.hide();
            markDepartment(null);
            map.getCanvas().style.cursor = '';
            live.current.props.onHover(null);
        };

        map.on('load', () => {
            Object.entries(FRAME_SOURCES).forEach(([id, source]) => map.addSource(id, source));
            FRAME_LAYERS.forEach((layer) => map.addLayer(layer));
            setLoaded(true);
        });
        map.on('error', () => setErrored(true));
        map.on('mousemove', (event) => {
            const hit = hitAt(event.point);
            if (!hit) {
                leave();
                return;
            }
            markDepartment(hit.departmentId);
            map.getCanvas().style.cursor = 'pointer';
            live.current.props.onHover({ name: hit.name, valueText: hit.value.valueText, classIndex: hit.value.legendKey });
            // Au doigt, rien n'est survolé : la fiche de sélection dit ce que l'appui désigne
            if (live.current.props.touching?.()) return;
            const { legendKey } = hit.value;
            const swatch = legendKey === null ? null : (live.current.props.render.palette[legendKey] ?? null);
            tooltip.show(event.lngLat, { name: hit.name, valueText: hit.tipText, swatch });
            outline.show(hit.landId, () => piecesAround(map, event.point, [COMMUNES_FILL], communeOutlineFilter(hit.landId)));
        });
        map.on('mouseout', leave);
        map.on('click', (event) => {
            // La fiche de sélection prend le relais de l'infobulle, qu'un appui laisserait ouverte sur un écran tactile
            tooltip.hide();
            if (!live.current.props.busy) setSelection(selectionOf(map.getZoom(), hitAt(event.point)));
        });

        return () => {
            mapRef.current = null;
            live.current.props.onHover(null);
            // L'infobulle est retirée avec la carte : restée ouverte, elle garderait ses nœuds
            tooltip.hide();
            map.remove();
        };
    }, []);

    // Cadrage au premier affichage et quand la zone change, jamais pour un changement de carte
    const { moved, showOverview } = useOverviewCamera(mapRef, containerRef, { zone: base.zone, overview, zoneChangeMs: ZONE_CHANGE_MS });
    // La sélection désigne un territoire de la zone quittée
    useEffect(() => setSelection(null), [base.zone]);

    // Limites des départements de la zone et ligne de séparation de l'outre-mer
    const departments = useMemo(() => toLngLatCollection(render.departments).collection, [render.departments]);
    const separation = useMemo(() => separationLine(base.separation), [base.separation]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded) return;
        (map.getSource(DEPARTMENTS_SOURCE) as maplibregl.GeoJSONSource).setData(departments as unknown as GeoJSON.FeatureCollection);
        (map.getSource(SEPARATION_SOURCE) as maplibregl.GeoJSONSource).setData(separation);
    }, [loaded, departments, separation]);

    // Noms des territoires d'outre-mer, ou leurs numéros sur une petite carte
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return undefined;
        return addLabels(map, insetMapLabels(base.insets, numberedInsets));
    }, [base.insets, numberedInsets]);

    // Source et couches des communes, posées une fois le fichier de tuiles trouvé
    const shownTilesUrl = tilesAvailable ? tilesUrl : null;
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !shownTilesUrl || map.getSource(COMMUNES_SOURCE)) return;
        map.addSource(COMMUNES_SOURCE, communesSource(shownTilesUrl));
        COMMUNES_LAYERS.forEach(({ layer, beforeId }) => map.addLayer(layer, beforeId));
        setInstalled(true);
    }, [loaded, shownTilesUrl]);

    // Couleurs des communes : seules celles qui changent sont reposées. Avant la peinture, pour
    // que la carte et sa légende changent dans la même image.
    const highlighted = useSettledHighlight(render, highlightedClass);
    const colors = useMemo(() => communeColors(render, highlighted), [render, highlighted]);
    const shownColors = useRef<CommuneColors | null>(null);
    useLayoutEffect(() => {
        const map = mapRef.current;
        if (!map || !installed) return undefined;
        colorChanges(shownColors.current, colors).forEach(({ id, color }) =>
            map.setFeatureState({ source: COMMUNES_SOURCE, sourceLayer: COMMUNES_SOURCE_LAYER, id }, { color }),
        );
        shownColors.current = colors;
        const markPainted = () => performance.mark(PAINT_MARK);
        // Les couleurs sont à l'écran quand la carte n'a plus rien à charger ni à dessiner
        const confirmPainted = () => setPainted(render);
        map.once('render', markPainted);
        map.once('idle', confirmPainted);
        // Un rendu est toujours demandé, pour que l'événement « idle » suive même sans couleur à poser
        map.triggerRepaint();
        return () => {
            map.off('render', markPainted);
            map.off('idle', confirmPainted);
        };
    }, [installed, colors, render]);

    // Sélection : sa fiche suit la carte affichée, son contour est dessiné sur la carte
    const sheet = useMemo(() => selection && selectionSheetOf(selection, render), [selection, render]);
    const closeSelection = useCallback(() => setSelection(null), []);
    const selectedDepartment = sheet?.department.landId ?? null;
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !loaded || !selectedDepartment) return undefined;
        map.setFeatureState({ source: DEPARTMENTS_SOURCE, id: selectedDepartment }, { selected: true });
        return () => {
            mapRef.current?.setFeatureState({ source: DEPARTMENTS_SOURCE, id: selectedDepartment }, { selected: false });
        };
    }, [loaded, selectedDepartment]);
    // Seul changement de filtre fait sur la source des communes, au clic : il fait analyser de
    // nouveau les tuiles en vue (0,15 à 0,25 s mesurés)
    const selectedCommune = sheet?.commune?.landId ?? null;
    const outlinedCommune = useRef<string | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !installed || outlinedCommune.current === selectedCommune) return;
        map.setFilter(COMMUNE_OUTLINE, communeOutlineFilter(selectedCommune));
        outlinedCommune.current = selectedCommune;
    }, [installed, selectedCommune]);

    // État communiqué au parent, qui affiche le message ou l'indicateur de chargement sur la carte
    const unavailable = unsupported || tilesAvailable === false;
    const ready = painted === render || unavailable || errored;
    const loading = !unavailable && !errored && painted === null;
    // Une erreur avant la première peinture laisse la carte blanche : elle le dit, comme sans tuiles
    const notice = unavailable || (errored && painted === null) ? NOTICE_UNAVAILABLE : null;
    useEffect(() => {
        onStatusChange({ ready, loading, notice });
    }, [ready, loading, notice, onStatusChange]);

    // L'image exportée porte les textes et la légende du dernier rendu
    const exported = useRef({ info: props.exportInfo, legend: props.exportLegend });
    exported.current = { info: props.exportInfo, legend: props.exportLegend };
    useImperativeHandle(
        ref,
        () => ({
            exportPng: () => {
                if (mapRef.current) exportMapPng(mapRef.current, () => exported.current);
            },
        }),
        [],
    );

    return (
        <>
            <MapContainer ref={containerRef} style={{ opacity: busy ? 0.5 : 1 }} role="img" aria-label={ariaLabel} />
            {moved && <OverviewButton onClick={showOverview} zoomControls={ZOOM_CONTROLS} />}
            {sheet && <SelectionCard slot={props.sheetSlot} sheet={sheet} onShowDepartment={(zone, name) => onZoneChange?.(zone, name)} onClose={closeSelection} />}
        </>
    );
});

CommunesCanvas.displayName = 'CommunesCanvas';

export default CommunesCanvas;
