import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type * as maplibregl from 'maplibre-gl';
import { useGetEnvironmentQuery } from '@services/api';
import type { NationalMapFeature } from '@services/api';
import type { HoveredLand } from './ClassLegend';
import TipSheet from './components/stage/TipSheet';
import { HoverOutline, createHoverOutline, piecesAround, sameFeatureFilter } from './components/stage/hoverOutline';
import {
    MapContainer,
    MapTooltip,
    STAGE_BACKGROUND_COLOR,
    StageMapStatus,
    TouchMark,
    addLabels,
    createStageMap,
    createTooltip,
    createTouchMark,
    useTilesAvailability,
} from './components/stage/mapLibre';
import { exportMapPng } from './components/stage/exportPng';
import OverviewButton, { ZoomControlsCorner } from './components/stage/OverviewButton';
import { drawParentBoundary } from './components/stage/parentBoundaryLayer';
import { SEPARATION_COLOR } from './components/stage/territoryOptions';
import { useGridDetail } from './components/stage/useGridDetail';
import { useOverviewCamera } from './components/stage/useOverviewCamera';
import { insetMapLabels } from './domain/frame/base';
import type { ExportLegend, MapImageInfo } from './domain/frame/exportImage';
import type { GridRender } from './domain/frame/types';
import { cellColorExpression, cellOpacityExpression } from './domain/grid/cells';
import type { GridStage } from './domain/grid/cells';
import { imageMask } from './domain/grid/imageClip';
import { TipSource, pressOutcome, tipOf } from './domain/tip';
import { ValueClass } from './values';
import { landToZone } from './zones';
import {
    LAND_BORDER_COLOR,
    LAND_HALO_COLOR,
    borderOpacityOnImage,
    haloOpacityExpression,
    haloOpacityOnImage,
    isolatedInset,
    landBorderStyle,
    lineWidthExpression,
    lngLatToMercator,
    mercatorToLngLat,
    separationLine,
    toLngLatCollection,
} from './gridded';

// Carte MapLibre de mailles carrées en aplat, sur le fond des territoires de la zone (contours et
// clic pour descendre d'un niveau, comme la carte Highcharts). Elle ne sait pas ce que sont ses
// mailles : leur fichier, leur valeur et leurs classes lui sont décrits (voir GridCells). La même
// carte sert la consommation carroyée, toutes destinations comprises, et les sols artificialisés :
// passer de l'une à l'autre remplace ses mailles, pas elle. Aux grands zooms, une carte qui en
// décrit dessine les objets réels à la place des mailles (voir useGridDetail).

const LANDS_SOURCE = 'national-map-lands';
const LANDS_FILL = 'national-map-lands-fill';
const LANDS_HALO = 'national-map-lands-halo';
const LANDS_LINE = 'national-map-lands-line';
const SEPARATION_SOURCE = 'national-map-grid-separation';
const SEPARATION_LINE = 'national-map-grid-separation-line';
const GRID_SOURCE = 'national-map-grid';
const GRID_FILL = 'national-map-grid-fill';
// Une source par palier de l'image, et une couche par passe
const IMAGE_SOURCE_PREFIX = 'national-map-image-';
const imageSourceId = (tier: number): string => `${IMAGE_SOURCE_PREFIX}${tier}`;
// Réponse de l'éditeur de l'image pour une tuile sans donnée : ce n'est pas une panne
const NOTHING_HERE_STATUS = 404;
const imageLayerId = (tier: number, pass: number): string => `national-map-image-${tier}-${pass}`;
// Nombre de paliers et de passes au plus : ceux d'une image précédente sont retirés jusqu'à ces rangs
const MAX_IMAGE_TIERS = 3;
const MAX_IMAGE_PASSES = 3;
// Masque d'une image rognée sur les territoires dessinés : tout ce qui les entoure
const IMAGE_MASK_SOURCE = 'national-map-image-mask';
const IMAGE_MASK_FILL = 'national-map-image-mask-fill';
// Image d'un cartouche d'outre-mer : une source par territoire, et une couche par passe
const insetSourceId = (zone: string): string => `national-map-inset-${zone}`;
const insetLayerId = (zone: string, pass: number): string => `national-map-inset-${zone}-${pass}`;

// Sous une image, les mailles ne sont plus dessinées : leurs tuiles ne sont demandées qu'un niveau
// de zoom avant les objets, à qui leurs attributs disent les départements en vue
const CELLS_ZOOMS_BEFORE_OBJECTS = 1;
const LAST_ZOOM = 24;
// Marge laissée autour des territoires cadrés, en pixels, quand la carte passe sous la légende
const FRAME_MARGIN_PX = 24;
// Coin des boutons de zoom et du retour à la vue d'ensemble : le haut de la carte est à la légende
const ZOOM_CONTROLS: ZoomControlsCorner = 'bottom-left';
// Largeur que le liseré ajoute au trait, en pixels
const LAND_HALO_EXTRA_PX = 2;
// Opacité des mailles et des objets hors de la classe mise en avant dans la légende
const DIMMED_OPACITY = 0.12;

const NOTICE_UNSUPPORTED = "Cette carte ne peut pas être affichée : votre navigateur ne prend pas en charge WebGL.";


export interface GriddedMapHandle {
    exportPng: () => void;
}

interface GriddedMapProps {
    // Zone dessinée : la carte est recadrée sur ses territoires quand elle change
    zone: string;
    // Ce que la carte dessine : territoires en coordonnées projetées (EPSG:3857), mailles, objets
    render: GridRender;
    // Maille des territoires dessinés
    scale: string;
    // Place de la légende sous laquelle la carte passe, en pixels : la carte occupe toute la scène,
    // et cadre ses territoires hors de cette place. Sans elle, la carte s'arrête à la légende.
    covered?: { top: number; left: number };
    // Petite carte : les territoires d'outre-mer rapprochés de l'Hexagone sont désignés par des numéros
    numberedInsets: boolean;
    // Classe des mailles mise en avant, puis classe des objets : l'une ou l'autre, selon la légende affichée
    highlightedClass: number | null;
    highlightedDetailClass: number | null;
    // Un clic sur un territoire en fait la zone affichée
    clickable: boolean;
    // La vue demandée est en cours de chargement : la carte est estompée et les clics ignorés
    busy: boolean;
    // Textes et légende de l'image exportée : ceux de ce que la carte dessine à cet instant
    exportInfo: MapImageInfo;
    exportLegend: ExportLegend;
    ariaLabel: string;
    onHover: (cell: HoveredLand | null) => void;
    // Le dernier geste a-t-il été fait au doigt ? Lu à chaque survol et à chaque clic ; sans lui, jamais
    touching?: () => boolean;
    // Emplacement de la page où la fiche de lecture des écrans tactiles est rendue
    sheetSlot?: HTMLElement | null;
    onZoneChange?: (zone: string, name?: string) => void;
    // `ready` : le fond des territoires reçus est dessiné, même sans ses mailles
    onStatusChange: (status: StageMapStatus) => void;
    // Ce que la carte dessine : ses mailles, l'image qui les remplace, ou les objets ; avec
    // l'identité de l'image de la carte, null si elle n'en a pas
    onStageChange: (stage: GridStage, imageKey: string | null) => void;
}

const GriddedMap = forwardRef<GriddedMapHandle, GriddedMapProps>((props, ref) => {
    const { zone, render, scale, numberedInsets, highlightedClass, highlightedDetailClass, busy, ariaLabel, onStatusChange, onStageChange } = props;
    const { features, insets, separation, parentBoundary, cells, detail } = render;
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const tooltipRef = useRef<MapTooltip | null>(null);
    // Ce qu'un appui du doigt a lu, avec le territoire que sa fiche propose d'ouvrir, et le repère
    // du point touché
    const [touched, setTouched] = useState<{ reading: TipSource; opens: { zone: string; name: string } | null } | null>(null);
    const touchMarkRef = useRef<TouchMark | null>(null);
    // Contour de l'élément survolé, ou touché tant que sa fiche est ouverte
    const hoverOutlineRef = useRef<HoverOutline | null>(null);
    const [ready, setReady] = useState(false);
    const [tilesLoading, setTilesLoading] = useState(false);
    // Territoires dont la carte a fini de dessiner le fond, et erreur signalée par la carte
    const [drawnFeatures, setDrawnFeatures] = useState<NationalMapFeature[] | null>(null);
    const [failed, setFailed] = useState(false);
    // Le navigateur n'a pas pu créer la carte (WebGL absent)
    const [unsupported, setUnsupported] = useState(false);
    // Image dont les tuiles ne répondent pas : la carte s'en passe et dessine ses mailles
    const [failedImageKey, setFailedImageKey] = useState<string | null>(null);
    const image = render.image && render.image.key !== failedImageKey ? render.image : null;
    // Image dessinée à la place des mailles : la carte a atteint le zoom où elle existe. Tenu pour
    // vrai tant que la carte n'a pas dit son zoom : la légende n'annonce pas des mailles pour rien.
    const [imageInRange, setImageInRange] = useState(true);
    const imageShown = image !== null && imageInRange;

    const { data: environment } = useGetEnvironmentQuery({});
    const tilesLocation: string | null = environment?.vector_tiles_location ?? null;
    const tilesUrl = tilesLocation ? `${tilesLocation}/${cells.file}` : null;
    const lands = useMemo(() => toLngLatCollection(features), [features]);
    // Zone hors de l'emprise des mailles : rien à charger
    const covered = cells.texts.outside === null;

    // Présence du fichier de tuiles : null tant qu'elle n'est pas connue
    const tilesAvailable = useTilesAvailability(covered ? tilesUrl : null);

    // Opacité des mailles quand elles sont dessinées, et opacité nulle posée sous les objets
    const visibleCellsOpacity = useRef<maplibregl.ExpressionSpecification | number>(1);
    const cellsDrawnHidden = useRef(false);
    const showCells = useCallback(() => {
        const map = mapRef.current;
        if (!map || !cellsDrawnHidden.current || !map.getLayer(GRID_FILL)) return;
        map.setPaintProperty(GRID_FILL, 'fill-opacity', visibleCellsOpacity.current);
        cellsDrawnHidden.current = false;
    }, []);

    const detailView = useGridDetail(mapRef, {
        ready,
        detail,
        tilesLocation,
        cellsLayer: GRID_FILL,
        cellsMissing: tilesAvailable === false,
        landsLayer: LANDS_FILL,
        beforeLayer: LANDS_HALO,
        highlightedClass: highlightedDetailClass,
        dimmedOpacity: DIMMED_OPACITY,
        onObjectsHidden: showCells,
    });

    // Les gestionnaires d'événements de la carte lisent toujours les props et les objets du dernier rendu
    const live = useRef({ props, detailView, cellsMissing: tilesAvailable === false, imageShown });
    useLayoutEffect(() => {
        live.current = { props, detailView, cellsMissing: tilesAvailable === false, imageShown };
    });

    // Création de la carte, une seule fois
    useEffect(() => {
        if (!containerRef.current) return undefined;
        // Boutons de zoom en bas : le haut de la carte reçoit les messages (voir Banner dans
        // NationalMapChart). À gauche : sur la France entière, le coin de droite est celui de la Corse.
        const map = createStageMap(containerRef.current, { controls: ZOOM_CONTROLS });
        if (!map) {
            setUnsupported(true);
            return undefined;
        }
        mapRef.current = map;
        map.on('load', () => setReady(true));
        map.on('idle', () => setTilesLoading(false));
        map.on('error', (event) => {
            setFailed(true);
            // Une tuile de l'image qui ne répond pas, autrement que par « rien à cet endroit » (404) :
            // l'image est abandonnée pour cette vue, la carte revient à ses mailles
            const { sourceId, error } = event as { sourceId?: string; error?: { status?: number } };
            const failedImage = live.current.props.render.image;
            if (failedImage && sourceId?.startsWith(IMAGE_SOURCE_PREFIX) && error?.status !== NOTHING_HERE_STATUS) setFailedImageKey(failedImage.key);
        });

        const tooltip = createTooltip(map);
        tooltipRef.current = tooltip;
        const touchMark = createTouchMark(map);
        touchMarkRef.current = touchMark;
        const outline = createHoverOutline(map);
        hoverOutlineRef.current = outline;
        // Dernière lecture faite sous le pointeur ou le doigt ; null hors de tout élément
        let read: TipSource | null = null;
        const leave = () => {
            read = null;
            tooltip.hide();
            outline.hide();
            live.current.props.onHover(null);
        };

        const hover = (event: maplibregl.MapMouseEvent) => {
            const { props: current, detailView: objects, cellsMissing, imageShown: pictured } = live.current;
            const { cells: shownCells, detail: shownDetail } = current.render;
            const objectLayers = objects.shown ? objects.layerIds() : [];
            const layers = [...objectLayers, GRID_FILL, LANDS_FILL].filter((id) => map.getLayer(id));
            const found = layers.length > 0 ? map.queryRenderedFeatures(event.point, { layers }) : [];
            const land = found.find((f) => f.layer.id === LANDS_FILL);
            // Sous l'image, les mailles ne sont plus dessinées : elles ne se lisent pas
            const cell = pictured ? undefined : found.find((f) => f.layer.id === GRID_FILL);
            const object = found.find((f) => objectLayers.includes(f.layer.id));
            // Aux grands zooms, l'appui lit un objet : le territoire n'est plus une cible
            map.getCanvas().style.cursor = land && current.clickable && !objects.shown ? 'pointer' : '';
            if (!land && !cell && !object) {
                leave();
                return;
            }
            // Un objet dessiné est lu à la place de la maille qu'il recouvre ; là où il n'est pas
            // encore chargé, la maille l'est toujours
            let reading = cell ? shownCells.read(cell.properties ?? {}) : null;
            if (object && shownDetail) reading = shownDetail.read(object.properties ?? {});
            const landName = land?.properties?.name as string | undefined;
            // Un objet se nomme lui-même ; une maille est lue sous le nom du territoire qu'un clic ouvrirait
            const name = (object ? undefined : landName) ?? reading?.name ?? '';
            // Sans maille ni objet à cet endroit, la carte dit ce que cela signifie ; sauf si le
            // fichier des mailles manque : elle ne sait alors rien de l'endroit
            // ni sous l'image, qui montre elle-même ce qu'il y a
            const valueText = reading?.valueText ?? (cellsMissing || pictured ? '' : shownCells.texts.empty);
            // La classe est celle de la légende affichée : celle des objets dès qu'ils sont dessinés
            const classIndex = objects.shown && !object ? null : (reading?.classIndex ?? null);
            current.onHover({ name, valueText, classIndex });
            // Pastille : la couleur de la classe lue, dans la légende affichée
            const readClasses = object ? shownDetail?.classes : shownCells.classes;
            read = { name, valueText, swatch: classIndex === null ? null : (readClasses?.[classIndex]?.color ?? null) };
            // Au doigt, rien n'est survolé : la fiche de lecture tient lieu d'infobulle (voir le clic)
            if (current.touching?.()) tooltip.hide();
            else tooltip.show(event.lngLat, read);
            // Contour de ce qui est lu : l'objet, sinon la maille, sinon le territoire. Un objet ou
            // un territoire à cheval sur plusieurs tuiles est cerné en entier, d'après ses morceaux
            // voisins ; une maille n'a rien qui la distingue de ses voisines : elle est cernée par
            // ce que les tuiles en dessinent sous le pointeur.
            const whole = object ?? (cell ? undefined : land);
            if (whole) {
                const attributes = whole.properties ?? {};
                outline.show(`${whole.layer.id}|${JSON.stringify(attributes)}`, () => piecesAround(map, event.point, [whole.layer.id], sameFeatureFilter(attributes)));
            } else if (cell) {
                const pieces = found.filter((f) => f.layer.id === GRID_FILL).map((f) => f.geometry);
                outline.show(`${GRID_FILL}|${JSON.stringify(pieces[0])}`, () => pieces);
            }
        };
        map.on('mousemove', hover);
        map.on('mouseout', leave);
        // Zoomer sur un cartouche d'outre-mer d'une carte à image ouvre le territoire à sa position
        // réelle : l'image n'existe que là, le cartouche n'est qu'une vignette
        map.on('zoomend', (event: { originalEvent?: unknown }) => {
            const { props: current } = live.current;
            const { image: shownImage, insets: shownInsets } = current.render;
            if (!event.originalEvent || !shownImage || shownInsets.length === 0 || current.busy) return;
            const centre = map.getCenter();
            const bounds = map.getBounds();
            const viewWidth = lngLatToMercator([bounds.getEast(), 0])[0] - lngLatToMercator([bounds.getWest(), 0])[0];
            const inset = isolatedInset(shownInsets, lngLatToMercator([centre.lng, centre.lat]), viewWidth);
            if (inset) current.onZoneChange?.(landToZone({ land_type: 'REGION', land_id: inset.zone }), inset.name);
        });
        map.on('click', (event) => {
            const { props: current, detailView: objects } = live.current;
            // Sur un écran tactile, l'appui tient lieu de survol
            hover(event);
            const opensLand = !objects.shown && current.clickable && Boolean(map.getLayer(LANDS_FILL));
            const [land] = opensLand ? map.queryRenderedFeatures(event.point, { layers: [LANDS_FILL] }) : [];
            const landId = land?.properties?.land_id as string | undefined;
            const opens = landId ? { zone: landToZone({ land_type: current.scale, land_id: landId }), name: land.properties.name as string } : null;
            const outcome = pressOutcome(current.touching?.() ?? false, opens !== null);
            // Au doigt, l'appui lit : la fiche dit ce qu'il désigne et porte le bouton qui ouvre le
            // territoire ; un appui hors de tout élément la ferme
            if (outcome === 'read') {
                if (read) touchMark.show(event.lngLat);
                else touchMark.hide();
                setTouched(read && { reading: read, opens });
            }
            if (outcome === 'open' && !current.busy) current.onZoneChange?.(opens.zone, opens.name);
        });

        return () => {
            mapRef.current = null;
            // L'infobulle est retirée avec la carte : restée ouverte, elle garderait ses nœuds
            tooltip.hide();
            map.remove();
        };
    }, []);

    // L'infobulle et le pointeur décrivent une maille ou un objet de la vue précédente : ils
    // s'effacent quand la vue change, jusqu'au prochain mouvement du pointeur
    useEffect(() => {
        tooltipRef.current?.hide();
        const canvas = mapRef.current?.getCanvas();
        if (canvas) canvas.style.cursor = '';
    }, [features, cells, detailView.shown]);

    // La fiche de lecture et son repère aussi : ils décrivent ce qu'un appui a lu sur cette vue
    const closeTouched = useCallback(() => {
        touchMarkRef.current?.hide();
        hoverOutlineRef.current?.hide();
        setTouched(null);
    }, []);
    useEffect(closeTouched, [features, cells, detailView.shown, closeTouched]);
    const touchedOpens = touched?.opens ?? null;
    const openTouched = useCallback(() => {
        const { busy: loading, onZoneChange } = live.current.props;
        if (touchedOpens && !loading) onZoneChange?.(touchedOpens.zone, touchedOpens.name);
    }, [touchedOpens]);

    // Cadrage sur les territoires de la zone ; un endroit exploré (jusqu'aux objets d'une rue)
    // n'est pas perdu quand la scène change de taille ou que la maille des territoires change
    const coveredTop = props.covered?.top ?? null;
    const coveredLeft = props.covered?.left ?? null;
    const overview = useMemo(() => {
        if (!lands.bounds) return null;
        if (coveredTop === null || coveredLeft === null) return { bounds: lands.bounds };
        const padding = { top: FRAME_MARGIN_PX + coveredTop, left: FRAME_MARGIN_PX + coveredLeft, right: FRAME_MARGIN_PX, bottom: FRAME_MARGIN_PX };
        return { bounds: lands.bounds, padding };
    }, [lands, coveredTop, coveredLeft]);
    const { moved, showOverview } = useOverviewCamera(mapRef, containerRef, { zone, overview });

    // Fond des territoires : aplat neutre sous les mailles, limites administratives par-dessus
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return undefined;
        const source = map.getSource(LANDS_SOURCE) as maplibregl.GeoJSONSource | undefined;
        if (source) {
            source.setData(lands.collection as unknown as GeoJSON.FeatureCollection);
        } else {
            map.addSource(LANDS_SOURCE, { type: 'geojson', data: lands.collection as unknown as GeoJSON.FeatureCollection });
            map.addLayer({ id: LANDS_FILL, type: 'fill', source: LANDS_SOURCE, paint: { 'fill-color': cells.landColor } });
            const joined = { 'line-join': 'round', 'line-cap': 'round' } as const;
            map.addLayer({ id: LANDS_HALO, type: 'line', source: LANDS_SOURCE, layout: joined, paint: { 'line-color': LAND_HALO_COLOR } });
            map.addLayer({ id: LANDS_LINE, type: 'line', source: LANDS_SOURCE, layout: joined, paint: { 'line-color': LAND_BORDER_COLOR } });
        }
        // Le trait suit la maille : épais pour quelques régions, léger pour des centaines de communes
        const border = landBorderStyle(scale);
        map.setPaintProperty(LANDS_LINE, 'line-width', lineWidthExpression(border.width, border.thinBelow));
        map.setPaintProperty(LANDS_HALO, 'line-width', lineWidthExpression(border.width + LAND_HALO_EXTRA_PX));
        map.setPaintProperty(LANDS_HALO, 'line-opacity', haloOpacityExpression(border));
        // Le fond est dessiné par la première image rendue une fois sa source chargée
        const confirmDrawn = () => {
            if (!map.isSourceLoaded(LANDS_SOURCE)) return;
            map.off('render', confirmDrawn);
            setDrawnFeatures(features);
        };
        map.on('render', confirmDrawn);
        return () => {
            map.off('render', confirmDrawn);
        };
    }, [ready, lands, features, scale]);

    // Sur l'image, les limites s'effacent aux vues larges, où elles la recouvriraient
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_LINE)) return;
        const border = landBorderStyle(scale);
        map.setPaintProperty(LANDS_LINE, 'line-opacity', imageShown ? borderOpacityOnImage(scale) : 1);
        map.setPaintProperty(LANDS_HALO, 'line-opacity', imageShown ? haloOpacityOnImage(scale) : haloOpacityExpression(border));
    }, [ready, lands, scale, imageShown]);

    // Couleur des territoires là où aucune maille n'est dessinée : elle dépend de ce que les mailles mesurent
    // Sous l'image, translucide, le fond est celui qu'elle attend
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        const color = image ? (['step', ['zoom'], cells.landColor, image.fromZoom, image.landColor] as maplibregl.ExpressionSpecification) : cells.landColor;
        map.setPaintProperty(LANDS_FILL, 'fill-color', color);
    }, [ready, lands, cells.landColor, image]);

    // Première couche posée au-dessus de l'image, sous laquelle elle se glisse : son masque, sinon
    // les mailles, sinon les objets, sinon les limites
    const layerAboveImage = useCallback(
        (map: maplibregl.Map): string | undefined => [IMAGE_MASK_FILL, GRID_FILL, ...live.current.detailView.layerIds(), LANDS_HALO].find((id) => map.getLayer(id)),
        [],
    );

    // Image : sa source suit ses tuiles et son emprise ; elle se glisse juste au-dessus du fond
    // des territoires, sous les mailles, les objets et les limites administratives. Son emprise
    // ne la rogne pas sur les territoires affichés : son masque le fait (plus bas).
    const imageBounds = useMemo(() => (image && lands.bounds ? image.boundsOf(lands.bounds) : null), [image, lands]);
    const shownImageKey = useRef<string | null>(null);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        // La source suit l'adresse de ses tuiles et leur emprise, non la zone : d'une zone à l'autre
        // d'une même génération, les tuiles déjà chargées restent dessinées, rognées par le
        // nouveau masque, le temps que les suivantes arrivent
        const key = image && imageBounds ? `${image.tiles}|${imageBounds.join(',')}` : null;
        if (shownImageKey.current === key) return;
        for (let tier = 0; tier < MAX_IMAGE_TIERS; tier += 1) {
            for (let pass = 0; pass < MAX_IMAGE_PASSES; pass += 1) if (map.getLayer(imageLayerId(tier, pass))) map.removeLayer(imageLayerId(tier, pass));
            if (map.getSource(imageSourceId(tier))) map.removeSource(imageSourceId(tier));
        }
        shownImageKey.current = key;
        if (!image || !imageBounds) return;
        const above = layerAboveImage(map);
        image.tiers.slice(0, MAX_IMAGE_TIERS).forEach(({ tileSize, fromZoom }, tier) => {
            map.addSource(imageSourceId(tier), {
                type: 'raster',
                tiles: [image.tiles],
                tileSize,
                minzoom: image.minZoom,
                maxzoom: image.maxZoom,
                bounds: imageBounds,
                attribution: image.attribution,
            });
            // Chaque palier s'efface au zoom du suivant
            const untilZoom = image.tiers[tier + 1]?.fromZoom;
            for (let pass = 0; pass < Math.min(image.passes, MAX_IMAGE_PASSES); pass += 1) {
                map.addLayer(
                    {
                        id: imageLayerId(tier, pass),
                        type: 'raster',
                        source: imageSourceId(tier),
                        minzoom: fromZoom,
                        ...(untilZoom === undefined ? {} : { maxzoom: untilZoom }),
                        paint: { 'raster-saturation': image.saturation, 'raster-contrast': image.contrast, 'raster-fade-duration': 0 },
                    },
                    above,
                );
            }
        });
    }, [ready, lands, image, imageBounds, layerAboveImage]);

    // Masque d'une image rognée : un aplat de la couleur du fond de la carte, percé au contour des
    // territoires dessinés, juste au-dessus de l'image. Il suit les territoires dessinés et non la
    // zone : à la maille EPCI, ceux qui débordent de la zone sont dessinés en entier, image
    // comprise, comme leurs objets aux grands zooms. Les mailles, les objets et les limites
    // restent au-dessus de lui. Il change avec le fond, par un simple remplacement de ses
    // données : ce qui est dessiné reste jusqu'à ce que la suite soit prête.
    const clipped = image?.clipped ?? false;
    const mask = useMemo(() => {
        const around = clipped ? imageMask(features) : null;
        return around && (toLngLatCollection([around]).collection as unknown as GeoJSON.FeatureCollection);
    }, [clipped, features]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        const source = map.getSource(IMAGE_MASK_SOURCE) as maplibregl.GeoJSONSource | undefined;
        if (!mask) {
            if (map.getLayer(IMAGE_MASK_FILL)) map.removeLayer(IMAGE_MASK_FILL);
            if (source) map.removeSource(IMAGE_MASK_SOURCE);
            return;
        }
        if (source) {
            source.setData(mask);
            return;
        }
        map.addSource(IMAGE_MASK_SOURCE, { type: 'geojson', data: mask });
        map.addLayer({ id: IMAGE_MASK_FILL, type: 'fill', source: IMAGE_MASK_SOURCE, paint: { 'fill-color': STAGE_BACKGROUND_COLOR } }, layerAboveImage(map));
    }, [ready, lands, mask, layerAboveImage]);

    // Cartouches d'outre-mer : l'image de chaque territoire à sa position réelle, posée sur son
    // cartouche. Les tuiles de l'image n'ont rien à cet endroit.
    const shownInsets = useRef(new Map<string, string>());
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_FILL)) return;
        const wanted = new Map(image ? insets.filter((inset) => inset.source_bbox).map((inset) => [inset.zone, image.insetImage(inset.source_bbox)]) : []);
        shownInsets.current.forEach((url, zone) => {
            if (wanted.get(zone) === url) return;
            for (let pass = 0; pass < MAX_IMAGE_PASSES; pass += 1) if (map.getLayer(insetLayerId(zone, pass))) map.removeLayer(insetLayerId(zone, pass));
            if (map.getSource(insetSourceId(zone))) map.removeSource(insetSourceId(zone));
            shownInsets.current.delete(zone);
        });
        if (!image) return;
        const above = layerAboveImage(map);
        insets.forEach(({ zone: inset, bbox: [xmin, ymin, xmax, ymax] }) => {
            const url = wanted.get(inset);
            if (!url || shownInsets.current.has(inset)) return;
            const [west, north] = mercatorToLngLat([xmin, ymax]);
            const [east, south] = mercatorToLngLat([xmax, ymin]);
            map.addSource(insetSourceId(inset), { type: 'image', url, coordinates: [[west, north], [east, north], [east, south], [west, south]] });
            for (let pass = 0; pass < Math.min(image.passes, MAX_IMAGE_PASSES); pass += 1) {
                map.addLayer(
                    {
                        id: insetLayerId(inset, pass),
                        type: 'raster',
                        source: insetSourceId(inset),
                        minzoom: image.fromZoom,
                        paint: { 'raster-saturation': image.saturation, 'raster-contrast': image.contrast, 'raster-fade-duration': 0 },
                    },
                    above,
                );
            }
            shownInsets.current.set(inset, url);
        });
    }, [ready, lands, image, insets, layerAboveImage]);

    // La carte dit quand elle franchit le zoom de l'image : la légende et le survol en dépendent
    const imageFromZoom = image?.fromZoom ?? null;
    useEffect(() => {
        const map = mapRef.current;
        // Sans image, l'état ne sert pas : il garde sa valeur pour la prochaine carte qui en a une
        if (!map || !ready || imageFromZoom === null) return undefined;
        const update = () => setImageInRange(map.getZoom() >= imageFromZoom);
        update();
        map.on('zoom', update);
        return () => {
            map.off('zoom', update);
        };
    }, [ready, imageFromZoom]);

    // Territoires d'outre-mer rapprochés de l'Hexagone : la ligne qui les en sépare, et leurs noms
    // ou leurs numéros sur une petite carte
    const separationFeature = useMemo(() => separationLine(separation), [separation]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        const source = map.getSource(SEPARATION_SOURCE) as maplibregl.GeoJSONSource | undefined;
        if (source) {
            source.setData(separationFeature);
            return;
        }
        map.addSource(SEPARATION_SOURCE, { type: 'geojson', data: separationFeature });
        map.addLayer({ id: SEPARATION_LINE, type: 'line', source: SEPARATION_SOURCE, paint: { 'line-color': SEPARATION_COLOR, 'line-width': 1 } });
    }, [ready, separationFeature]);
    // Limite de la zone, par-dessus les territoires qui débordent d'elle (EPCI à cheval sur
    // plusieurs départements), leurs mailles, leur image et leurs objets. Elle ne change qu'avec
    // le fond : ni une autre carte ni une autre période ne la redessinent.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        drawParentBoundary(map, parentBoundary);
    }, [ready, parentBoundary]);
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return undefined;
        return addLabels(map, insetMapLabels(insets, numberedInsets));
    }, [insets, numberedInsets]);

    // Mailles : la source suit leur identité (fichier, zone, grandeur), le style suit leur filtre,
    // leur valeur et la légende. Quand l'identité change, la source est recréée : un simple
    // changement de filtre ou d'attribut laisserait dessinées, le temps que les tuiles déjà chargées
    // soient retraitées, les mailles de l'ancienne zone autour des nouveaux contours, ou celles de
    // l'ancienne carte sous la nouvelle légende.
    const shownTilesUrl = covered && tilesAvailable ? tilesUrl : null;
    const cellsHidden = detailView.replacesCells;
    const shownGridSourceKey = useRef<string | null>(null);
    // Premier zoom où la couche des mailles demande ses tuiles ; une couche neuve les demande à tous
    const appliedCellsFromZoom = useRef(0);
    const styledCells = useRef(cells);
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(LANDS_LINE)) return;
        const sourceKey = shownTilesUrl ? `${shownTilesUrl}|${cells.key}` : null;
        if (shownGridSourceKey.current !== sourceKey) {
            if (map.getLayer(GRID_FILL)) map.removeLayer(GRID_FILL);
            if (map.getSource(GRID_SOURCE)) map.removeSource(GRID_SOURCE);
            shownGridSourceKey.current = null;
        }
        if (!shownTilesUrl) return;
        const color = cellColorExpression(cells);
        // Sous les objets qui les remplacent, les mailles ne sont plus dessinées, mais restent
        // chargées : leurs attributs disent les départements en vue
        const drawnOpacity = cellOpacityExpression(cells, highlightedClass, DIMMED_OPACITY);
        // Sous l'image, les mailles ne sont plus dessinées. L'opacité suit l'état de la carte et non
        // une expression de zoom : mêlée aux attributs des mailles, celle-ci ne serait évaluée qu'aux
        // zooms entiers, et les mailles resteraient sur l'image entre deux.
        visibleCellsOpacity.current = image && imageShown ? 0 : drawnOpacity;
        cellsDrawnHidden.current = cellsHidden;
        const opacity = cellsHidden ? 0 : visibleCellsOpacity.current;
        // L'indicateur de chargement ne suit que ce qui change les mailles à lire ou à classer
        if (!map.getLayer(GRID_FILL) || styledCells.current !== cells) setTilesLoading(true);
        styledCells.current = cells;
        if (map.getLayer(GRID_FILL)) {
            map.setFilter(GRID_FILL, cells.filter as maplibregl.FilterSpecification);
            map.setPaintProperty(GRID_FILL, 'fill-color', color);
            map.setPaintProperty(GRID_FILL, 'fill-opacity', opacity);
            // Un rendu est toujours demandé, pour que l'événement « idle » lève l'indicateur de chargement
            map.triggerRepaint();
            return;
        }
        map.addSource(GRID_SOURCE, { type: 'vector', url: `pmtiles://${shownTilesUrl}` });
        map.addLayer(
            {
                id: GRID_FILL,
                type: 'fill',
                source: GRID_SOURCE,
                'source-layer': cells.layer,
                filter: cells.filter as maplibregl.FilterSpecification,
                paint: { 'fill-color': color, 'fill-opacity': opacity, 'fill-antialias': cells.antialias },
            },
            // Sous les limites administratives et leur liseré
            LANDS_HALO,
        );
        appliedCellsFromZoom.current = 0;
        shownGridSourceKey.current = sourceKey;
    }, [ready, lands, shownTilesUrl, cells, highlightedClass, cellsHidden, image, imageShown]);

    // Tuiles des mailles : demandées à tous les zooms quand la carte les dessine ; sous une image,
    // seulement à l'approche des objets, ou jamais si la carte n'a pas d'objets
    let cellsFromZoom = 0;
    if (image && imageShown) cellsFromZoom = detail ? detail.minZoom - CELLS_ZOOMS_BEFORE_OBJECTS : LAST_ZOOM;
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || !map.getLayer(GRID_FILL) || appliedCellsFromZoom.current === cellsFromZoom) return;
        map.setLayerZoomRange(GRID_FILL, cellsFromZoom, LAST_ZOOM);
        appliedCellsFromZoom.current = cellsFromZoom;
    }, [ready, lands, shownTilesUrl, cells, cellsFromZoom]);

    // La légende suit ce qui est dessiné : les objets priment sur l'image, l'image sur les mailles
    let stage: GridStage = imageShown ? 'image' : 'cells';
    if (detailView.shown) stage = 'objects';
    // L'identité annoncée est celle de l'image de la carte, même abandonnée : c'est pour elle que
    // l'étape « mailles » vaut alors
    const imageKey = render.image?.key ?? null;
    useEffect(() => {
        onStageChange(stage, imageKey);
    }, [stage, imageKey, onStageChange]);

    // État communiqué au parent, qui affiche le message ou l'indicateur de chargement sur la carte
    // Sur une carte à image, des objets qui manquent ne laissent pas des mailles mais l'image
    let notice: string | null = detailView.notice && image ? image.partialNotice : detailView.notice;
    // L'image ne répond pas : la carte le dit, sous ses mailles de secours
    if (notice === null && render.image && !image) notice = render.image.failedNotice;
    if (unsupported) notice = NOTICE_UNSUPPORTED;
    else if (features.length > 0 && !covered) notice = cells.texts.outside;
    // Sans ses mailles, la carte le dit ; plus quand elle dessine à leur place tous les objets de la vue
    else if (tilesAvailable === false && !(detailView.shown && detailView.notice === null)) notice = cells.texts.missing;
    const loading = notice === null && (tilesLoading || (covered && tilesAvailable === null));
    const landsDrawn = drawnFeatures === features || failed || unsupported;
    useEffect(() => {
        onStatusChange({ ready: landsDrawn, loading, notice });
    }, [landsDrawn, loading, notice, onStatusChange]);

    // L'image exportée porte les textes et la légende du dernier rendu
    const exported = useRef({ info: props.exportInfo, legend: props.exportLegend });
    exported.current = { info: props.exportInfo, legend: props.exportLegend };
    useImperativeHandle(
        ref,
        () => ({
            exportPng: () => {
                const map = mapRef.current;
                if (!map) return;
                // Le contour d'un élément touché, que rien n'a effacé depuis, ne figure pas dans l'image
                hoverOutlineRef.current?.hide();
                exportMapPng(map, () => exported.current);
            },
        }),
        [],
    );

    return (
        <>
            <MapContainer ref={containerRef} style={{ opacity: busy ? 0.5 : 1 }} role="img" aria-label={ariaLabel} />
            {moved && <OverviewButton onClick={showOverview} zoomControls={ZOOM_CONTROLS} />}
            {touched && (
                <TipSheet
                    slot={props.sheetSlot}
                    tip={tipOf(touched.reading)}
                    action={touched.opens && { label: 'Ouvrir ce territoire', onClick: openTouched }}
                    onClose={closeTouched}
                />
            )}
        </>
    );
});

GriddedMap.displayName = 'GriddedMap';

export default GriddedMap;
