// Pointeur et doigt sur la carte de mailles (voir GriddedMap) : ce que le survol lit et cerne, ce
// qu'un clic ouvre, ce qu'un appui du doigt lit à la place. La carte MapLibre garde ses
// gestionnaires d'événements toute sa vie : ils lisent ce qu'elle dessine au moment de l'événement.
import type * as maplibregl from 'maplibre-gl';
import type { HoveredLand } from '../../ClassLegend';
import type { GridRender } from '../../domain/frame/types';
import { pointerReading } from '../../domain/grid/pointerReading';
import { pressOutcome } from '../../domain/tip';
import type { TipSource } from '../../domain/tip';
import { isolatedInset, lngLatToMercator } from '../../gridded';
import { landToZone } from '../../zones';
import { GRID_FILL, LANDS_FILL } from './gridLayers';
import { createHoverOutline, piecesAround, sameFeatureFilter } from './hoverOutline';
import type { HoverOutline } from './hoverOutline';
import { createTooltip, createTouchMark } from './mapLibre';
import type { MapTooltip, TouchMark } from './mapLibre';
import type { GridDetailView } from './useGridDetail';

// Ce que les gestionnaires d'événements de la carte lisent du dernier rendu
export type LiveGrid = {
    render: GridRender;
    scale: string;
    clickable: boolean;
    busy: boolean;
    onHover: (cell: HoveredLand | null) => void;
    touching?: () => boolean;
    onZoneChange?: (zone: string, name?: string) => void;
    detailView: GridDetailView;
    // Le fichier des mailles manque
    cellsMissing: boolean;
    // L'image est dessinée à la place des mailles
    imageShown: boolean;
};

type Live = { readonly current: LiveGrid };

// Ce qu'un appui du doigt a lu, avec le territoire que sa fiche propose d'ouvrir
export type TouchedReading = { reading: TipSource; opens: { zone: string; name: string } | null };

// Ce que la carte pose sous le pointeur et sous le doigt : l'infobulle, le repère du point touché,
// et le contour de l'élément survolé, ou touché tant que sa fiche est ouverte
export type GridPointer = {
    tooltip: MapTooltip;
    touchMark: TouchMark;
    outline: HoverOutline;
};

type Pointer = GridPointer & {
    map: maplibregl.Map;
    live: Live;
    // Dernière lecture faite sous le pointeur ou le doigt ; null hors de tout élément
    read: TipSource | null;
    onTouched: (touched: TouchedReading | null) => void;
};

type Drawn = maplibregl.MapGeoJSONFeature;
type Point = maplibregl.MapMouseEvent['point'];

// Ce que les tuiles dessinent sous un point
type Hit = {
    land: Drawn | undefined;
    object: Drawn | undefined;
    // Morceaux de la maille ; aucun sous l'image, où les mailles ne sont plus dessinées : elles
    // ne se lisent pas
    cells: Drawn[];
};

const hitAt = (map: maplibregl.Map, point: Point, objectLayers: string[], pictured: boolean): Hit => {
    const layers = [...objectLayers, GRID_FILL, LANDS_FILL].filter((id) => map.getLayer(id));
    const found = layers.length > 0 ? map.queryRenderedFeatures(point, { layers }) : [];
    return {
        land: found.find((feature) => feature.layer.id === LANDS_FILL),
        object: found.find((feature) => objectLayers.includes(feature.layer.id)),
        cells: pictured ? [] : found.filter((feature) => feature.layer.id === GRID_FILL),
    };
};

const attributesOf = (feature: Drawn | undefined): Record<string, unknown> | null => (feature ? (feature.properties ?? {}) : null);

// Contour de ce qui est lu : l'objet, sinon la maille, sinon le territoire. Un objet ou un
// territoire à cheval sur plusieurs tuiles est cerné en entier, d'après ses morceaux voisins ;
// une maille n'a rien qui la distingue de ses voisines : elle est cernée par ce que les tuiles en
// dessinent sous le pointeur.
const outlineHit = ({ map, outline }: Pointer, point: Point, { land, object, cells }: Hit): void => {
    const whole = object ?? (cells.length > 0 ? undefined : land);
    if (whole) {
        const attributes = whole.properties ?? {};
        outline.show(`${whole.layer.id}|${JSON.stringify(attributes)}`, () => piecesAround(map, point, [whole.layer.id], sameFeatureFilter(attributes)));
    } else if (cells.length > 0) {
        const pieces = cells.map((feature) => feature.geometry);
        outline.show(`${GRID_FILL}|${JSON.stringify(pieces[0])}`, () => pieces);
    }
};

const leave = (pointer: Pointer): void => {
    pointer.read = null;
    pointer.tooltip.hide();
    pointer.outline.hide();
    pointer.live.current.onHover(null);
};

const hover = (pointer: Pointer, event: maplibregl.MapMouseEvent): void => {
    const { map, live, tooltip } = pointer;
    const { render, clickable, onHover, touching, detailView: objects, cellsMissing, imageShown: pictured } = live.current;
    const hit = hitAt(map, event.point, objects.shown ? objects.layerIds() : [], pictured);
    // Aux grands zooms, l'appui lit un objet : le territoire n'est plus une cible
    map.getCanvas().style.cursor = hit.land && clickable && !objects.shown ? 'pointer' : '';
    if (!hit.land && hit.cells.length === 0 && !hit.object) {
        leave(pointer);
        return;
    }
    const { name, valueText, classIndex, swatch } = pointerReading(
        { landName: hit.land?.properties?.name as string | undefined, cell: attributesOf(hit.cells[0]), object: attributesOf(hit.object) },
        { cells: render.cells, detail: render.detail, objectsShown: objects.shown, cellsMissing, pictured },
    );
    onHover({ name, valueText, classIndex });
    pointer.read = { name, valueText, swatch };
    // Au doigt, rien n'est survolé : la fiche de lecture tient lieu d'infobulle (voir press)
    if (touching?.()) tooltip.hide();
    else tooltip.show(event.lngLat, pointer.read);
    outlineHit(pointer, event.point, hit);
};

// Territoire qu'un clic à cet endroit ouvre ; null : aucun
const landOpenedAt = (map: maplibregl.Map, { clickable, scale, detailView: objects }: LiveGrid, point: Point): TouchedReading['opens'] => {
    const opensLand = !objects.shown && clickable && Boolean(map.getLayer(LANDS_FILL));
    const [land] = opensLand ? map.queryRenderedFeatures(point, { layers: [LANDS_FILL] }) : [];
    const landId = land?.properties?.land_id as string | undefined;
    return landId ? { zone: landToZone({ land_type: scale, land_id: landId }), name: land.properties.name as string } : null;
};

const press = (pointer: Pointer, event: maplibregl.MapMouseEvent): void => {
    const current = pointer.live.current;
    // Sur un écran tactile, l'appui tient lieu de survol
    hover(pointer, event);
    const opens = landOpenedAt(pointer.map, current, event.point);
    const outcome = pressOutcome(current.touching?.() ?? false, opens !== null);
    // Au doigt, l'appui lit : la fiche dit ce qu'il désigne et porte le bouton qui ouvre le
    // territoire ; un appui hors de tout élément la ferme
    if (outcome === 'read') {
        if (pointer.read) pointer.touchMark.show(event.lngLat);
        else pointer.touchMark.hide();
        pointer.onTouched(pointer.read && { reading: pointer.read, opens });
    }
    if (outcome === 'open' && !current.busy) current.onZoneChange?.(opens.zone, opens.name);
};

// Zoomer sur un cartouche d'outre-mer d'une carte à image ouvre le territoire à sa position
// réelle : l'image n'existe que là, le cartouche n'est qu'une vignette
const openIsolatedInset = (map: maplibregl.Map, { render, busy, onZoneChange }: LiveGrid, event: { originalEvent?: unknown }): void => {
    const { image, insets } = render;
    if (!event.originalEvent || !image || insets.length === 0 || busy) return;
    const centre = map.getCenter();
    const bounds = map.getBounds();
    const viewWidth = lngLatToMercator([bounds.getEast(), 0])[0] - lngLatToMercator([bounds.getWest(), 0])[0];
    const inset = isolatedInset(insets, lngLatToMercator([centre.lng, centre.lat]), viewWidth);
    if (inset) onZoneChange?.(landToZone({ land_type: 'REGION', land_id: inset.zone }), inset.name);
};

// Pose sur la carte de quoi lire sous le pointeur et sous le doigt, et les suit. `onTouched` : ce
// qu'un appui du doigt vient de lire ; null hors de tout élément.
export const followPointer = (map: maplibregl.Map, live: Live, onTouched: (touched: TouchedReading | null) => void): GridPointer => {
    const pointer: Pointer = { map, live, tooltip: createTooltip(map), touchMark: createTouchMark(map), outline: createHoverOutline(map), read: null, onTouched };
    map.on('mousemove', (event) => hover(pointer, event));
    map.on('mouseout', () => leave(pointer));
    map.on('zoomend', (event: { originalEvent?: unknown }) => openIsolatedInset(map, live.current, event));
    map.on('click', (event) => press(pointer, event));
    return pointer;
};
