import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { artifFrame, consoFrame } from './__fixtures__/frames';
import { StubMap, mapLibreStub } from './__fixtures__/mapLibreStub';
import {
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    FRANCE_BY_REGION,
    MAYOTTE_BY_EPCI,
} from './__fixtures__/nationalMapFixtures';
import type { StageMapStatus } from './components/stage/mapLibre';
import type { GridRender, MapFrame } from './domain/frame/types';
import { cellColorExpression } from './domain/grid/cells';
import { ignArtifTiles } from './domain/grid/soilImage';
import { soilZoneFilter } from './domain/grid/soilCells';
import GriddedMap from './GriddedMap';
import { borderOpacityOnImage, haloOpacityOnImage, lineWidthExpression } from './gridded';
import { ZONE_FRANCE } from './zones';
import { exportInfoOf, exportLegendOf } from './domain/frame/exportImage';

// La carte de mailles, montée sur une carte d'essai : les tests lisent ce qu'elle demande à MapLibre
// quand la carte, la destination, la période, la zone ou le zoom change.

// Fiche du territoire, où la carte lit les millésimes de ses départements ; `asked` : les
// territoires dont la fiche a été demandée
const landStub = {
    asked: [] as unknown[],
    millesimes: [
        { index: 1, year: 2017, departement: '35' },
        { index: 2, year: 2020, departement: '35' },
        { index: 1, year: 2018, departement: '22' },
        { index: 2, year: 2021, departement: '22' },
    ],
};

jest.mock('./components/stage/mapLibre', () => jest.requireActual('./__fixtures__/mapLibreStub').mapLibreModule);
jest.mock('@services/api', () => ({
    __esModule: true,
    useGetEnvironmentQuery: () => ({ data: { vector_tiles_location: 'https://tuiles.test/vector_tiles' } }),
    useGetLandQuery: (land: unknown, { skip }: { skip: boolean }) => {
        if (skip) return { currentData: undefined };
        landStub.asked.push(land);
        return { currentData: { millesimes: landStub.millesimes } };
    },
}));

const LANDS_FILL = 'national-map-lands-fill';
const LANDS_HALO = 'national-map-lands-halo';
const GRID_SOURCE = 'national-map-grid';
const GRID_FILL = 'national-map-grid-fill';
const SEPARATION_SOURCE = 'national-map-grid-separation';
const LANDS_LINE = 'national-map-lands-line';
// Image : un palier pour les vues larges (tuiles réduites de moitié), un pour les autres, deux passes chacun
const IMAGE_SOURCES = ['national-map-image-0', 'national-map-image-1'];
const WIDE_IMAGE_LAYERS = ['national-map-image-0-0', 'national-map-image-0-1'];
const IMAGE_LAYERS = ['national-map-image-1-0', 'national-map-image-1-1'];
const IMAGE_MASK_SOURCE = 'national-map-image-mask';
const IMAGE_MASK_FILL = 'national-map-image-mask-fill';
const OBJECTS_35 = 'national-map-detail-35';
const OBJECTS_22 = 'national-map-detail-22';

const france = (indicatorId: string, conso = CONSO_FRANCE_BY_REGION): MapFrame => consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, indicatorId, conso);
const bretagne = (indicatorId: string): MapFrame => consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, indicatorId, CONSO_BRETAGNE_BY_DEPARTEMENT);
const SOILS_FRANCE = artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'artif_pct_gridded', ARTIF_FRANCE_BY_REGION);
const SOILS_BRETAGNE = artifFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'artif_pct_gridded', { scale: 'DEPART', lands: {} });
const SOILS_MAYOTTE = artifFrame('REGION_06', MAYOTTE_BY_EPCI, 'artif_pct_gridded', { scale: 'EPCI', lands: {} });

const gridOf = ({ render: drawn }: MapFrame): GridRender => {
    if (drawn.renderer !== 'grid') throw new Error('rendu de mailles attendu');
    return drawn;
};

// `image` : la carte reçoit l'image qui remplace ses mailles. Sans elle (son repli quand l'image
// ne répond pas), la carte dessine ses mailles à tous les zooms : c'est le cas de la plupart des tests.
type Options = { numberedInsets?: boolean; highlightedClass?: number | null; highlightedDetailClass?: number | null; image?: boolean };

const mount = (frame: MapFrame, options: Options = {}) => {
    const statuses: StageMapStatus[] = [];
    const onStatusChange = (status: StageMapStatus) => statuses.push(status);
    const onHover = jest.fn();
    const onZoneChange = jest.fn();
    const onStageChange = jest.fn();
    const element = (shown: MapFrame, { numberedInsets = false, highlightedClass = null, highlightedDetailClass = null, image = false }: Options = {}) => (
        <GriddedMap
            zone={shown.base.zone}
            render={image ? gridOf(shown) : { ...gridOf(shown), image: null }}
            scale={shown.base.scale}
            numberedInsets={numberedInsets}
            highlightedClass={highlightedClass}
            highlightedDetailClass={highlightedDetailClass}
            clickable={shown.base.clickable}
            busy={false}
            exportInfo={exportInfoOf(shown.exportMeta)}
            exportLegend={exportLegendOf(shown.legend)}
            ariaLabel={shown.ariaLabel}
            onHover={onHover}
            onZoneChange={onZoneChange}
            onStatusChange={onStatusChange}
            onStageChange={onStageChange}
        />
    );
    const view = render(element(frame, options));
    // Le style de la carte est chargé : elle dessine son fond, puis ses mailles
    if (mapLibreStub.maps[0]) act(() => mapLibreStub.maps[0].fire('load'));
    return {
        status: (): StageMapStatus => statuses[statuses.length - 1],
        show: (next: MapFrame, nextOptions?: Options) => view.rerender(element(next, nextOptions)),
        onHover,
        onZoneChange,
        // Dernière annonce de ce que la carte dessine : ses objets (true) ou ses mailles
        detailShown: (): boolean => onStageChange.mock.calls[onStageChange.mock.calls.length - 1]?.[0] === 'objects',
        // Dernière annonce de ce que la carte dessine : ses mailles, l'image ou les objets
        stage: (): string => onStageChange.mock.calls[onStageChange.mock.calls.length - 1]?.[0],
    };
};

const theMap = (): StubMap => mapLibreStub.maps[0];
// Source et couche des mailles telles que la carte les a reçues en dernier
const gridSource = (): { url: string } => theMap().sources.get(GRID_SOURCE)?.spec as { url: string };
type DrawnLayer = { source: string; 'source-layer': string; minzoom?: number; beforeId?: string; filter: unknown; paint: Record<string, unknown> };
const layerOf = (id: string) => theMap().getLayer(id) as unknown as DrawnLayer | undefined;
const gridLayer = () => layerOf(GRID_FILL);
// Ce que la carte a demandé pour une source ou une couche depuis un repère, dans l'ordre
const callsFor = (targets: string[], since: number): string[] =>
    theMap()
        .calls.slice(since)
        .filter(({ args }) => targets.includes(typeof args[0] === 'string' ? args[0] : (args[0] as { id?: string })?.id))
        .map(({ method }) => method);
const gridCalls = (since: number): string[] => callsFor([GRID_SOURCE, GRID_FILL], since);
// Dernière valeur posée pour une propriété de dessin d'une couche
const lastPaint = (layerId: string, name: string): unknown => {
    const calls = theMap().callsOf('setPaintProperty').filter(([id, property]) => id === layerId && property === name);
    return calls.length > 0 ? calls[calls.length - 1][2] : layerOf(layerId)?.paint[name];
};

// La carte atteint un zoom, puis revient au repos : ses mailles en vue sont chargées
const zoomTo = (zoom: number): void => act(() => theMap().zoomTo(zoom));
const rest = (): void => act(() => theMap().fire('idle'));
const seeDepartments = (...departments: string[]): void => {
    theMap().drawn[GRID_FILL] = departments.map((department) => ({ DEPART: `["${department}"]`, part_artif: 12, resolution_m: 250, annee_min: 2020, annee_max: 2020 }));
};

beforeEach(() => {
    mapLibreStub.reset();
    landStub.asked = [];
});

describe('carreaux d’une destination', () => {
    it('lit, pour la France entière, le fichier de toutes les destinations puis celui de la destination choisie', () => {
        const { show } = mount(france('conso_ha_gridded'));

        expect(gridSource().url).toBe('pmtiles://https://tuiles.test/vector_tiles/carroyage_national.pmtiles');
        expect(gridLayer()['source-layer']).toBe('carroyage_national');

        show(france('conso_habitat_ha_gridded'));

        expect(gridSource().url).toBe('pmtiles://https://tuiles.test/vector_tiles/carroyage_national_habitat.pmtiles');
        expect(gridLayer()['source-layer']).toBe('carroyage_national_habitat');
        expect(gridLayer().filter).toEqual(gridOf(france('conso_habitat_ha_gridded')).cells.filter);
    });

    it('lit, pour une région, les attributs de la destination dans le fichier des diagnostics', () => {
        const { show } = mount(bretagne('conso_ha_gridded'));
        show(bretagne('conso_route_ha_gridded'));
        const { cells } = gridOf(bretagne('conso_route_ha_gridded'));

        expect(gridSource().url).toBe('pmtiles://https://tuiles.test/vector_tiles/carroyage_lea.pmtiles');
        expect(gridLayer()['source-layer']).toBe('carroyage_lea');
        expect(gridLayer().filter).toEqual(cells.filter);
        expect(gridLayer().paint['fill-color']).toEqual(cellColorExpression(cells));
        expect(JSON.stringify(gridLayer().paint['fill-color'])).toContain('conso_2011_route');
        expect(gridLayer().paint['fill-antialias']).toBe(true);
    });

    it.each([
        ['la France entière', france],
        ['une région, dont le fichier reste le même', bretagne],
    ])('recrée la source des carreaux d’une destination à l’autre pour %s : aucun carreau de l’ancienne ne reste dessiné', (_, frameOf) => {
        const { show } = mount(frameOf('conso_ha_gridded'));
        const mark = theMap().mark();
        show(frameOf('conso_activite_ha_gridded'));

        // Ni filtre ni couleur changés sur des tuiles déjà chargées, qui resteraient dessinées le temps d'être retraitées
        expect(gridCalls(mark)).toEqual(['removeLayer', 'removeSource', 'addSource', 'addLayer']);
    });

    it('garde la même carte MapLibre d’une destination à l’autre, sans la recadrer', () => {
        const { show } = mount(france('conso_ha_gridded'));
        const fits = mapLibreStub.fits.length;
        show(france('conso_mixte_ha_gridded'));
        show(france('conso_ha_gridded'));

        expect(mapLibreStub.maps).toHaveLength(1);
        expect(theMap().removed).toBe(false);
        expect(mapLibreStub.fits).toHaveLength(fits);
    });

    it('garde la source d’une période à l’autre : seuls le filtre et les couleurs changent', () => {
        const { show } = mount(france('conso_habitat_ha_gridded'));
        const mark = theMap().mark();
        show(france('conso_habitat_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024));

        expect(gridCalls(mark)).toEqual(['setFilter', 'setPaintProperty', 'setPaintProperty']);
    });

    it('annonce le fichier absent d’une destination, sans le confondre avec l’absence de tout carroyage national', () => {
        mapLibreStub.tilesAvailable = false;
        const { status, show } = mount(france('conso_ferroviaire_ha_gridded'));

        expect(status().notice).toMatch(/^Les données carroyées de cette destination ne sont pas encore disponibles pour la France entière : choisissez « Toutes »/);
        expect(theMap().getLayer(GRID_FILL)).toBeUndefined();

        show(france('conso_ha_gridded'));

        expect(status().notice).toMatch(/^Les données carroyées ne sont pas encore disponibles pour la France entière/);
    });

    it('n’a ni objets à explorer, ni zoom maximal, ni territoires d’outre-mer rapprochés', () => {
        const { detailShown } = mount(france('conso_ha_gridded'));
        zoomTo(16);
        rest();

        expect(theMap().maxZoom).toBeNull();
        expect(landStub.asked).toEqual([]);
        expect(detailShown()).toBe(false);
        expect(mapLibreStub.labels).toEqual([]);
    });
});

describe('mailles des sols artificialisés', () => {
    it('lit le fichier national des mailles, filtré sur la zone, sans lissage', () => {
        mount(SOILS_BRETAGNE);

        expect(gridSource().url).toBe('pmtiles://https://tuiles.test/vector_tiles/sols_artificialises_national.pmtiles');
        expect(gridLayer()['source-layer']).toBe('sols_artificialises_national');
        expect(gridLayer().filter).toEqual(soilZoneFilter('REGION_53', { scale: 'DEPART', landIds: ['22', '29', '35', '56'], departments: [] }));
        expect(gridLayer().paint).toEqual({ 'fill-color': cellColorExpression(gridOf(SOILS_BRETAGNE).cells), 'fill-opacity': 1, 'fill-antialias': false });
        expect(gridLayer().beforeId).toBe(LANDS_HALO);
    });

    it('dessine les territoires en gris : sans maille, c’est la donnée qui manque', () => {
        mount(SOILS_BRETAGNE);

        expect(lastPaint(LANDS_FILL, 'fill-color')).toBe('#dcdcdc');
    });

    it('remplace les carreaux de la consommation par les mailles des sols sur la même carte, et inversement', () => {
        const { show } = mount(bretagne('conso_ha_gridded'));
        const mark = theMap().mark();
        show(SOILS_BRETAGNE);

        // La source est recréée : aucun carreau de la consommation ne reste dessiné sous la légende des sols
        expect(gridCalls(mark)).toEqual(['removeLayer', 'removeSource', 'addSource', 'addLayer']);
        expect(lastPaint(LANDS_FILL, 'fill-color')).toBe('#dcdcdc');
        expect(theMap().maxZoom).toBe(17);

        const back = theMap().mark();
        show(bretagne('conso_ha_gridded'));

        expect(gridCalls(back)).toEqual(['removeLayer', 'removeSource', 'addSource', 'addLayer']);
        expect(lastPaint(LANDS_FILL, 'fill-color')).toBe('#f0f0f0');
        expect(theMap().maxZoom).toBeNull();
        expect(mapLibreStub.maps).toHaveLength(1);
    });

    it('estompe les mailles des autres classes quand une classe de la légende est mise en avant', () => {
        const { show } = mount(SOILS_BRETAGNE);
        show(SOILS_BRETAGNE, { highlightedClass: 4 });

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toEqual(['case', ['all', ['>=', ['coalesce', ['get', 'part_artif'], 0], 50]], 1, 0.12]);
    });

    it('renvoie à la carte par territoire quand le fichier des mailles manque', () => {
        mapLibreStub.tilesAvailable = false;
        const { status } = mount(SOILS_BRETAGNE);

        expect(status().notice).toMatch(/n’est pas encore disponible : la carte « Part du territoire artificialisée » montre la même grandeur par territoire\.$/);
        expect(status().loading).toBe(false);
        expect(theMap().getLayer(GRID_FILL)).toBeUndefined();
    });

    it('pose ses boutons de zoom en bas à gauche, hors des messages et de la Corse', () => {
        mount(SOILS_FRANCE);

        expect(mapLibreStub.creations).toEqual([{ controls: 'bottom-left' }]);
    });

    it('dit que la carte ne peut pas être affichée sans WebGL, et ne se fait pas attendre', () => {
        mapLibreStub.webgl = false;
        const { status } = mount(SOILS_BRETAGNE);

        expect(status()).toEqual({ ready: true, loading: false, notice: 'Cette carte ne peut pas être affichée : votre navigateur ne prend pas en charge WebGL.' });
    });

    describe('sur la France entière', () => {
        it('garde les mailles d’outre-mer déplacées, nomme leurs territoires et trace la ligne qui les sépare de l’Hexagone', () => {
            mount(SOILS_FRANCE);

            expect(gridLayer().filter).toEqual(['!=', ['coalesce', ['get', 'placement'], ''], 'reel']);
            expect(mapLibreStub.labels.map(({ text, anchor }) => [text, anchor])).toEqual(SOILS_FRANCE.base.insets.map(({ name }) => [name, 'bottom']));
            const line = theMap().sources.get(SEPARATION_SOURCE).data as { geometry: { coordinates: unknown[] } };
            expect(line.geometry.coordinates).toHaveLength(SOILS_FRANCE.base.separation.length);
        });

        it('désigne les territoires d’outre-mer par des numéros sur une petite carte', () => {
            mount(SOILS_FRANCE, { numberedInsets: true });

            expect(mapLibreStub.labels.map(({ text, anchor }) => [text, anchor])).toEqual(SOILS_FRANCE.base.insets.map((_, rank) => [String(rank + 1), 'right']));
        });
    });
});

describe('objets OCS GE aux grands zooms', () => {
    // La carte des sols de la Bretagne, zoomée sur l'Ille-et-Vilaine jusqu'aux objets
    const zoomOnRennes = (options?: Options) => {
        const mounted = mount(SOILS_BRETAGNE, options);
        seeDepartments('35');
        zoomTo(14.5);
        rest();
        return mounted;
    };

    it('ne lit ni fiche ni objets tant que la carte n’a pas atteint leur zoom', () => {
        const { detailShown } = mount(SOILS_BRETAGNE);
        seeDepartments('35');
        zoomTo(12.9);
        rest();

        expect(landStub.asked).toEqual([]);
        expect(theMap().getLayer(OBJECTS_35)).toBeUndefined();
        expect(detailShown()).toBe(false);
    });

    it('lit, au zoom des objets, la fiche de la zone puis les tuiles du seul département en vue, à son dernier millésime', () => {
        zoomOnRennes();

        expect(landStub.asked[0]).toEqual({ land_type: 'REGION', land_id: '53' });
        expect(theMap().sources.get(OBJECTS_35).spec).toEqual({ type: 'vector', url: 'pmtiles://https://tuiles.test/vector_tiles/occupation_du_sol_2_35.pmtiles' });
        expect(layerOf(OBJECTS_35)).toMatchObject({ source: OBJECTS_35, 'source-layer': 'occupation_du_sol_2_35', minzoom: 13, filter: ['==', ['get', 'REGION'], '53'], beforeId: LANDS_HALO });
        expect(layerOf(OBJECTS_35).paint['fill-color']).toEqual(['case', ['==', ['get', 'is_artificial'], true], '#ff9b93', '#b4ff8d']);
        expect(theMap().getLayer(OBJECTS_22)).toBeUndefined();
    });

    it('garde les mailles dessinées tant que les objets chargent, puis les efface sous eux et le dit', () => {
        const { detailShown } = mount(SOILS_BRETAGNE);
        seeDepartments('35');
        zoomTo(14.5);
        theMap().loadingSources.add(OBJECTS_35);
        rest();

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(1);
        expect(detailShown()).toBe(false);

        theMap().loadingSources.clear();
        rest();

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);
        expect(detailShown()).toBe(true);
        // Les mailles restent sur la carte : leurs attributs disent les départements en vue
        expect(theMap().getLayer(GRID_FILL)).toBeDefined();
    });

    it('rend les mailles le temps qu’un déplacement charge de nouveaux objets, sans cesser d’annoncer les objets', () => {
        const { detailShown } = zoomOnRennes();
        rest();
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);

        act(() => theMap().fire('sourcedataloading', { sourceId: OBJECTS_35 }));

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(1);
        expect(detailShown()).toBe(true);

        rest();

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);
    });

    it('ne rend pas les mailles pour le chargement d’une autre source', () => {
        zoomOnRennes();
        rest();
        act(() => theMap().fire('sourcedataloading', { sourceId: GRID_SOURCE }));

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);
    });

    it('revient aux mailles dès que la carte repasse sous le zoom des objets, et garde leurs tuiles pour le retour', () => {
        const { detailShown } = zoomOnRennes();
        rest();
        zoomTo(12);

        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(1);
        expect(detailShown()).toBe(false);
        expect(theMap().getLayer(OBJECTS_35)).toBeDefined();

        const mark = theMap().mark();
        zoomTo(14.2);
        rest();

        expect(callsFor([OBJECTS_35], mark)).not.toContain('addSource');
        expect(detailShown()).toBe(true);
    });

    it('rend les mailles dans l’image même où la carte repasse sous le zoom des objets, sans attendre le rendu', () => {
        zoomOnRennes();
        rest();
        const mark = theMap().mark();
        // L'événement de zoom, hors de tout rendu de React : la carte dessine son image juste après
        theMap().zoom = 12.99;
        theMap().fire('zoom');

        expect(theMap().callsOf('setPaintProperty', mark)).toEqual([[GRID_FILL, 'fill-opacity', 1]]);
    });

    it('suit les départements en vue : charge celui qui y entre, retire celui qui en sort', () => {
        zoomOnRennes();
        seeDepartments('35', '22');
        rest();

        expect(theMap().sources.get(OBJECTS_22).spec).toEqual({ type: 'vector', url: 'pmtiles://https://tuiles.test/vector_tiles/occupation_du_sol_2_22.pmtiles' });
        expect(theMap().getLayer(OBJECTS_35)).toBeDefined();

        seeDepartments('22');
        rest();

        expect(theMap().getLayer(OBJECTS_35)).toBeUndefined();
        expect(theMap().sources.has(OBJECTS_35)).toBe(false);
        expect(theMap().getLayer(OBJECTS_22)).toBeDefined();
    });

    it('garde les mailles et le dit quand les objets d’un département en vue ne sont pas publiés', () => {
        mapLibreStub.missingFiles = ['occupation_du_sol_2_22.pmtiles'];
        const { status, detailShown } = mount(SOILS_BRETAGNE);
        seeDepartments('22', '35');
        zoomTo(15);
        rest();
        rest();

        expect(theMap().getLayer(OBJECTS_22)).toBeUndefined();
        expect(theMap().getLayer(OBJECTS_35)).toBeDefined();
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(1);
        expect(detailShown()).toBe(true);
        expect(status().notice).toBe('Les objets OCS GE ne sont pas disponibles partout dans cette vue : la carte y garde ses mailles.');
    });

    it('ne dessine aucun objet là où aucune maille n’est en vue : un territoire sans OCS GE n’a ni l’un ni l’autre', () => {
        const { detailShown, status } = mount(SOILS_BRETAGNE);
        seeDepartments();
        zoomTo(15);
        rest();
        rest();

        expect(theMap().layers.filter(({ id }) => id.startsWith('national-map-detail-'))).toEqual([]);
        expect(detailShown()).toBe(false);
        expect(status().notice).toBeNull();
    });

    it('estompe les objets de l’autre nature quand une ligne de leur légende est mise en avant', () => {
        const { show } = zoomOnRennes();
        rest();
        show(SOILS_BRETAGNE, { highlightedDetailClass: 1 });

        expect(lastPaint(OBJECTS_35, 'fill-opacity')).toEqual(['case', ['==', ['==', ['get', 'is_artificial'], true], false], 1, 0.12]);
        // La classe des objets ne dit rien des mailles
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);
    });

    it('retire les objets en passant à une carte qui n’en a pas', () => {
        const { show, detailShown } = zoomOnRennes();
        rest();
        show(bretagne('conso_ha_gridded'));

        expect(theMap().getLayer(OBJECTS_35)).toBeUndefined();
        expect(theMap().sources.has(OBJECTS_35)).toBe(false);
        expect(detailShown()).toBe(false);
    });
});

describe('objets OCS GE sans le fichier des mailles', () => {
    const department = (id: string) => ({ land_type: 'DEPART', land_id: id, name: `Département ${id}` });
    // La carte des sols de la Bretagne par département, mailles non publiées, zoomée jusqu'aux objets
    const zoomWithoutCells = (...inView: string[]) => {
        mapLibreStub.tilesAvailable = false;
        const mounted = mount(SOILS_BRETAGNE);
        theMap().drawn[LANDS_FILL] = inView.map(department);
        zoomTo(14.5);
        rest();
        rest();
        return mounted;
    };

    it('lit les objets des départements dessinés en vue : les objets ne dépendent pas des mailles', () => {
        const { detailShown } = zoomWithoutCells('35');

        expect(theMap().getLayer(GRID_FILL)).toBeUndefined();
        expect(theMap().sources.get(OBJECTS_35).spec).toEqual({ type: 'vector', url: 'pmtiles://https://tuiles.test/vector_tiles/occupation_du_sol_2_35.pmtiles' });
        expect(theMap().getLayer(OBJECTS_22)).toBeUndefined();
        expect(detailShown()).toBe(true);
    });

    it('ne dit plus que les mailles manquent une fois les objets dessinés à leur place, puis le redit en dézoomant', () => {
        const { status } = zoomWithoutCells('35');

        expect(status().notice).toBeNull();

        zoomTo(12);

        expect(status().notice).toMatch(/n’est pas encore disponible/);
    });

    it('garde le message des mailles quand les objets d’un département en vue manquent aussi', () => {
        mapLibreStub.missingFiles = ['occupation_du_sol_2_22.pmtiles'];
        const { status } = zoomWithoutCells('22', '35');

        expect(theMap().getLayer(OBJECTS_35)).toBeDefined();
        expect(status().notice).toMatch(/n’est pas encore disponible/);
    });

    it('ne prétend pas, au survol, que la donnée manque là où ce sont les mailles qui manquent', () => {
        mapLibreStub.tilesAvailable = false;
        mount(SOILS_BRETAGNE);
        theMap().drawn = { [LANDS_FILL]: [{ land_id: '35', name: 'Ille-et-Vilaine' }] };
        act(() => theMap().fire('mousemove'));

        expect(mapLibreStub.tooltip).toEqual({ name: 'Ille-et-Vilaine', value: '' });
    });
});

describe('caméra', () => {
    const overviewButton = (): HTMLElement | null => screen.queryByRole('button', { name: "Vue d'ensemble" });
    // La même zone, dessinée avec d'autres territoires : une autre maille
    const SOILS_BRETAGNE_OTHER_SCALE = artifFrame(
        'REGION_53',
        { ...BRETAGNE_BY_DEPARTEMENT, geojson: { ...BRETAGNE_BY_DEPARTEMENT.geojson, features: BRETAGNE_BY_DEPARTEMENT.geojson.features.slice(0, 2) } },
        'artif_pct_gridded',
        { scale: 'DEPART', lands: {} },
    );

    it('cadre la carte sur les territoires de sa zone, et la recadre à une nouvelle taille tant que l’utilisateur ne l’a pas déplacée', () => {
        mount(SOILS_BRETAGNE);

        expect(mapLibreStub.fits).toHaveLength(1);

        act(() => mapLibreStub.resize());

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1].bounds).toEqual(mapLibreStub.fits[0].bounds);
        expect(overviewButton()).not.toBeInTheDocument();
    });

    it('garde l’endroit exploré à une nouvelle taille et d’une maille à l’autre, et propose de revenir à la vue d’ensemble', () => {
        const { show } = mount(SOILS_BRETAGNE);
        act(() => theMap().fire('moveend'));

        act(() => mapLibreStub.resize());
        show(SOILS_BRETAGNE_OTHER_SCALE);

        expect(mapLibreStub.fits).toHaveLength(1);

        fireEvent.click(overviewButton());

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1]).toMatchObject({ durationMs: 300 });
        expect(overviewButton()).not.toBeInTheDocument();
    });

    it('recadre sur les territoires d’une autre maille une carte que l’utilisateur n’a pas déplacée', () => {
        const { show } = mount(SOILS_BRETAGNE);
        show(SOILS_BRETAGNE_OTHER_SCALE);

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1].bounds).not.toEqual(mapLibreStub.fits[0].bounds);
    });

    it('recadre sur la nouvelle zone même une carte déplacée', () => {
        const { show } = mount(SOILS_BRETAGNE);
        act(() => theMap().fire('moveend'));

        show(SOILS_FRANCE);

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1]).toMatchObject({ durationMs: 0 });
        expect(overviewButton()).not.toBeInTheDocument();
    });
});

describe('limites des territoires', () => {
    const LANDS_LINE = 'national-map-lands-line';
    const epci = (frame: MapFrame): MapFrame => ({ ...frame, base: { ...frame.base, scale: 'EPCI' } });

    it('amincit le trait des EPCI et efface son liseré sous le zoom du pays, sans toucher aux autres mailles', () => {
        const { show } = mount(epci(SOILS_FRANCE));

        expect(lastPaint(LANDS_LINE, 'line-width')).toEqual(lineWidthExpression(0.9, 5));
        expect(lastPaint(LANDS_HALO, 'line-opacity')).toEqual(['interpolate', ['linear'], ['zoom'], 4, 0, 5, 0.85]);

        show(SOILS_FRANCE);

        expect(lastPaint(LANDS_LINE, 'line-width')).toEqual(lineWidthExpression(1.4));
        expect(lastPaint(LANDS_HALO, 'line-opacity')).toBe(0.85);
    });
});

describe('image de l’IGN', () => {
    const WITH_IMAGE = { image: true };
    const CELL = { DEPART: '["35"]', part_artif: 23, resolution_m: 1000, annee_min: 2020, annee_max: 2020 };
    const LAND = { land_id: '35', name: 'Ille-et-Vilaine' };
    type ImageSource = { type: string; tiles: string[]; tileSize: number; minzoom: number; maxzoom: number; bounds: number[]; attribution: string };
    const imageSource = (tier = 1): ImageSource => theMap().sources.get(IMAGE_SOURCES[tier])?.spec as ImageSource;

    it('pose l’image de l’IGN au-dessus du fond, sous les mailles et les limites, sans demander de tuiles hors de la métropole', () => {
        mount(SOILS_FRANCE, WITH_IMAGE);

        expect(imageSource()).toEqual({
            type: 'raster',
            tiles: [ignArtifTiles('2021-2023')],
            tileSize: 256,
            minzoom: 6,
            maxzoom: 16,
            bounds: [-5.3, 41.2, 9.7, 51.2],
            attribution: '© IGN – OCS GE',
        });
        // Deux passes de la même source : ses couleurs sont translucides
        IMAGE_LAYERS.forEach((id) => expect(layerOf(id)).toMatchObject({ source: IMAGE_SOURCES[1], minzoom: 4.5, beforeId: LANDS_HALO }));
        IMAGE_LAYERS.forEach((id) => expect(layerOf(id)).not.toHaveProperty('maxzoom'));
        expect(theMap().layers.findIndex((layer) => layer.id === IMAGE_LAYERS[1])).toBeLessThan(theMap().layers.findIndex((layer) => layer.id === GRID_FILL));
    });

    it('demande les mêmes tuiles réduites de moitié aux vues plus larges, jusqu’au zoom où elles se lisent en vraie grandeur', () => {
        mount(SOILS_FRANCE, WITH_IMAGE);

        expect(imageSource(0)).toEqual({ ...imageSource(1), tileSize: 128 });
        WIDE_IMAGE_LAYERS.forEach((id) => expect(layerOf(id)).toMatchObject({ source: IMAGE_SOURCES[0], minzoom: 3.5, maxzoom: 4.5 }));
    });

    it('dès que l’image existe au zoom de la carte, ne dessine plus ses mailles, et pose l’image sur un fond blanc', () => {
        const { stage } = mount(SOILS_FRANCE, WITH_IMAGE);

        expect(stage()).toBe('image');
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);
        expect(lastPaint(LANDS_FILL, 'fill-color')).toEqual(['step', ['zoom'], '#dcdcdc', 3.5, '#ffffff']);
    });

    it('ne revient à ses mailles que sous le premier niveau de l’image, et les efface de nouveau en zoomant', () => {
        const { stage } = mount(SOILS_FRANCE, WITH_IMAGE);
        zoomTo(3.4);

        expect(stage()).toBe('cells');
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(1);

        zoomTo(3.5);

        expect(stage()).toBe('image');
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(0);
    });

    it('ne demande plus les tuiles des mailles sous l’image, sauf à l’approche des objets, à qui elles disent les départements en vue', () => {
        mount(SOILS_BRETAGNE, WITH_IMAGE);
        const lastRange = () => theMap().callsOf('setLayerZoomRange').filter(([id]) => id === GRID_FILL).pop();

        expect(lastRange()).toEqual([GRID_FILL, 12, 24]);

        zoomTo(3);

        expect(lastRange()).toEqual([GRID_FILL, 0, 24]);
    });

    it('pose sur chaque cartouche d’outre-mer l’image du territoire à sa position réelle, et la retire avec les cartouches', () => {
        const { show } = mount(SOILS_FRANCE, WITH_IMAGE);
        const { insets, image } = gridOf(SOILS_FRANCE);

        expect(insets.length).toBeGreaterThan(0);
        insets.forEach(({ zone, source_bbox: real }) => {
            const { spec } = theMap().sources.get(`national-map-inset-${zone}`);
            expect(spec).toMatchObject({ type: 'image', url: image.insetImage(real) });
            expect((spec as { coordinates: number[][] }).coordinates).toHaveLength(4);
            expect(layerOf(`national-map-inset-${zone}-0`)).toMatchObject({ source: `national-map-inset-${zone}`, minzoom: 3.5, beforeId: LANDS_HALO });
            expect(layerOf(`national-map-inset-${zone}-1`)).toBeDefined();
        });

        show(SOILS_BRETAGNE, WITH_IMAGE);

        insets.forEach(({ zone }) => {
            expect(theMap().sources.has(`national-map-inset-${zone}`)).toBe(false);
            expect(layerOf(`national-map-inset-${zone}-0`)).toBeUndefined();
        });
    });

    it('efface les limites aux vues larges, où elles recouvriraient l’image, et leur rend leur force sans elle', () => {
        const france = artifFrame(ZONE_FRANCE, { ...FRANCE_BY_REGION, scale: 'EPCI' }, 'artif_pct_gridded', { ...ARTIF_FRANCE_BY_REGION, scale: 'EPCI' });
        mount(france, WITH_IMAGE);

        expect(lastPaint(LANDS_LINE, 'line-opacity')).toEqual(borderOpacityOnImage('EPCI'));
        expect(lastPaint(LANDS_HALO, 'line-opacity')).toEqual(haloOpacityOnImage('EPCI'));

        zoomTo(3);

        expect(lastPaint(LANDS_LINE, 'line-opacity')).toBe(1);
        expect(lastPaint(LANDS_HALO, 'line-opacity')).toEqual(['interpolate', ['linear'], ['zoom'], 4, 0, 5, 0.85]);
    });

    it('retire l’image en passant à une carte qui n’en a pas, et la remet au retour', () => {
        const { show, stage } = mount(SOILS_BRETAGNE, WITH_IMAGE);
        show(bretagne('conso_ha_gridded'), WITH_IMAGE);

        IMAGE_SOURCES.forEach((id) => expect(theMap().sources.has(id)).toBe(false));
        [...WIDE_IMAGE_LAYERS, ...IMAGE_LAYERS].forEach((id) => expect(layerOf(id)).toBeUndefined());
        expect(stage()).toBe('cells');
        expect(lastPaint(LANDS_FILL, 'fill-color')).toBe('#f0f0f0');

        show(SOILS_BRETAGNE, WITH_IMAGE);

        expect(imageSource().tiles).toEqual([ignArtifTiles('2021-2023')]);
        expect(stage()).toBe('image');
        expect(mapLibreStub.maps).toHaveLength(1);
    });

    it('ne lit pas, au survol, une maille que l’image recouvre : seul le territoire est nommé', () => {
        const { onHover } = mount(SOILS_BRETAGNE, WITH_IMAGE);
        theMap().drawn = { [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('mousemove'));

        expect(onHover).toHaveBeenLastCalledWith({ name: 'Ille-et-Vilaine', valueText: '', classIndex: null });
    });

    it('revient à ses mailles et le dit quand les tuiles de l’image ne répondent pas, mais pas pour une tuile sans donnée', () => {
        const { stage, status } = mount(SOILS_BRETAGNE, WITH_IMAGE);
        // L'IGN répond 404 pour une tuile où il n'a rien : ce n'est pas une panne
        act(() => theMap().fire('error', { sourceId: IMAGE_SOURCES[1], error: { status: 404 } }));

        expect(stage()).toBe('image');
        expect(imageSource()).toBeDefined();

        act(() => theMap().fire('error', { sourceId: IMAGE_SOURCES[1], error: { status: 503 } }));

        expect(stage()).toBe('cells');
        IMAGE_SOURCES.forEach((id) => expect(theMap().sources.has(id)).toBe(false));
        expect(lastPaint(GRID_FILL, 'fill-opacity')).toBe(1);
        expect(lastPaint(LANDS_FILL, 'fill-color')).toBe('#dcdcdc');
        expect(status().notice).toBe('L’image de l’IGN ne répond pas : la carte montre à sa place la part artificialisée par maille.');
    });

    it('garde l’image quand une autre source de la carte échoue', () => {
        const { stage } = mount(SOILS_BRETAGNE, WITH_IMAGE);
        act(() => theMap().fire('error', { sourceId: GRID_SOURCE, error: { status: 503 } }));

        expect(stage()).toBe('image');
    });

    it('annonce les objets dès leur zoom, puis de nouveau l’image en dézoomant', () => {
        const { stage } = mount(SOILS_BRETAGNE, WITH_IMAGE);
        seeDepartments('35');
        zoomTo(13.5);
        // Un repos pour lire les départements en vue, un autre une fois leurs objets chargés
        rest();
        rest();

        expect(stage()).toBe('objects');

        zoomTo(12);

        expect(stage()).toBe('image');
    });

    describe('rognée sur les territoires dessinés', () => {
        // Masque : un polygone du monde, percé d'un trou par morceau de la réunion des territoires
        type Mask = { features: { geometry: { type: string; coordinates: [number, number][][][] } }[] };
        const mask = (): Mask | undefined => theMap().sources.get(IMAGE_MASK_SOURCE)?.data as Mask | undefined;
        const holes = (): [number, number][][] => mask().features[0].geometry.coordinates[0].slice(1);
        const rank = (id: string): number => theMap().layers.findIndex((layer) => layer.id === id);

        it('couvre de la couleur du fond tout ce qui entoure les territoires d’une région, entre l’image et les mailles', () => {
            mount(SOILS_BRETAGNE, WITH_IMAGE);
            const [world] = mask().features[0].geometry.coordinates[0];

            expect(layerOf(IMAGE_MASK_FILL)).toMatchObject({ type: 'fill', source: IMAGE_MASK_SOURCE, beforeId: LANDS_HALO, paint: { 'fill-color': '#ffffff' } });
            expect(rank(IMAGE_LAYERS[1])).toBeLessThan(rank(IMAGE_MASK_FILL));
            expect(rank(IMAGE_MASK_FILL)).toBeLessThan(rank(GRID_FILL));
            // Les quatre départements d'essai ne se touchent pas : un trou chacun, en longitudes et latitudes
            expect(holes()).toHaveLength(4);
            expect(world.slice(0, -1).map(([lng, lat]) => [Math.round(lng), Math.round(lat)])).toEqual([
                [-180, -85],
                [180, -85],
                [180, 85],
                [-180, 85],
            ]);
        });

        it('laisse l’image entière sur la France entière', () => {
            mount(SOILS_FRANCE, WITH_IMAGE);

            expect(mask()).toBeUndefined();
            expect(layerOf(IMAGE_MASK_FILL)).toBeUndefined();
        });

        it('suit les territoires d’une autre zone sans être recréé, et la nouvelle image se glisse sous lui', () => {
            const { show } = mount(SOILS_BRETAGNE, WITH_IMAGE);
            const since = theMap().mark();
            show(SOILS_MAYOTTE, WITH_IMAGE);

            expect(callsFor([IMAGE_MASK_SOURCE, IMAGE_MASK_FILL], since)).toEqual(['setData']);
            expect(holes()).toHaveLength(2);
            IMAGE_LAYERS.forEach((id) => expect(layerOf(id)).toMatchObject({ beforeId: IMAGE_MASK_FILL }));
            expect(mapLibreStub.maps).toHaveLength(1);
        });

        it('garde la source de l’image d’une zone à l’autre d’une même génération : ses tuiles restent dessinées sous le nouveau masque', () => {
            // Une autre zone, de mêmes génération et emprise de tuiles : seule l'identité de l'image change
            const parent = { land_type: 'DEPART', land_id: '35', name: 'Ille-et-Vilaine', ancestors: [] as [] };
            const ille = artifFrame('DEPART_35', { ...BRETAGNE_BY_DEPARTEMENT, scale: 'EPCI', parent }, 'artif_pct_gridded', { scale: 'EPCI', lands: {} });
            const { show } = mount(SOILS_BRETAGNE, WITH_IMAGE);
            const since = theMap().mark();
            show(ille, WITH_IMAGE);

            expect(gridOf(ille).image.key).not.toBe(gridOf(SOILS_BRETAGNE).image.key);
            expect(callsFor([...IMAGE_SOURCES, ...WIDE_IMAGE_LAYERS, ...IMAGE_LAYERS], since)).toEqual([]);
            expect(layerOf(IMAGE_MASK_FILL)).toBeDefined();
        });

        it('disparaît avec l’image : sur une carte qui n’en a pas, puis quand l’IGN ne répond pas', () => {
            const { show } = mount(SOILS_BRETAGNE, WITH_IMAGE);
            show(bretagne('conso_ha_gridded'), WITH_IMAGE);

            expect(mask()).toBeUndefined();
            expect(layerOf(IMAGE_MASK_FILL)).toBeUndefined();

            show(SOILS_BRETAGNE, WITH_IMAGE);

            expect(layerOf(IMAGE_MASK_FILL)).toBeDefined();

            act(() => theMap().fire('error', { sourceId: IMAGE_SOURCES[1], error: { status: 503 } }));

            expect(mask()).toBeUndefined();
            expect(layerOf(IMAGE_MASK_FILL)).toBeUndefined();
        });
    });
});

describe('survol et clic', () => {
    const CELL = { DEPART: '["35"]', part_artif: 23, resolution_m: 250, annee_min: 2020, annee_max: 2020 };
    const OBJECT = { is_artificial: true, code_cs: 'CS1.1.1.1', code_us: 'US5', surface: 1240, year: 2020 };
    const LAND = { land_id: '35', name: 'Ille-et-Vilaine' };
    const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');

    it('lit la maille sous le pointeur, sous le nom du territoire qu’un clic ouvre', () => {
        const { onHover, onZoneChange } = mount(SOILS_BRETAGNE);
        theMap().drawn = { [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('mousemove'));

        expect(mapLibreStub.tooltip).toEqual({ name: 'Ille-et-Vilaine', value: 'Maille de 250 m × 250 m : 23 % de sols artificialisés (millésime 2020)' });
        expect(onHover).toHaveBeenLastCalledWith({ name: 'Ille-et-Vilaine', valueText: mapLibreStub.tooltip.value, classIndex: 2 });
        expect(theMap().getCanvas().style.cursor).toBe('pointer');

        act(() => theMap().fire('click'));

        expect(onZoneChange).toHaveBeenCalledWith('DEPART_35', 'Ille-et-Vilaine');
    });

    it('dit l’absence de donnée sur un territoire sans maille, et nomme à part une maille qui dépasse des territoires', () => {
        mount(SOILS_BRETAGNE);
        theMap().drawn = { [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('mousemove'));

        expect(mapLibreStub.tooltip).toEqual({ name: 'Ille-et-Vilaine', value: 'Pas de donnée OCS GE à cet endroit' });

        theMap().drawn = { [GRID_FILL]: [CELL] };
        act(() => theMap().fire('mousemove'));

        expect(mapLibreStub.tooltip.name).toBe('Hors des territoires affichés');
    });

    it('lit l’objet sous le pointeur dès que les objets sont dessinés, et n’ouvre plus le territoire au clic', () => {
        const { onHover, onZoneChange } = mount(SOILS_BRETAGNE);
        seeDepartments('35');
        zoomTo(15);
        rest();
        rest();
        theMap().drawn = { [OBJECTS_35]: [OBJECT], [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('click'));

        expect(mapLibreStub.tooltip.name).toBe('Sol artificialisé');
        expect(plain(mapLibreStub.tooltip.value)).toBe('Couverture : zones bâties · usage : résidentiel · 1 240 m² · millésime 2020');
        expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Sol artificialisé', classIndex: 0 }));
        expect(theMap().getCanvas().style.cursor).toBe('');
        expect(onZoneChange).not.toHaveBeenCalled();
    });

    it('lit encore la maille là où l’objet n’est pas chargé, sans désigner de ligne dans la légende des objets', () => {
        const { onHover } = mount(SOILS_BRETAGNE);
        seeDepartments('35');
        zoomTo(15);
        rest();
        rest();
        theMap().drawn = { [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('mousemove'));

        expect(mapLibreStub.tooltip.value).toBe('Maille de 250 m × 250 m : 23 % de sols artificialisés (millésime 2020)');
        expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ classIndex: null }));
    });
});
