import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { NationalMapBaseMap, NationalMapValues } from '@services/api';
import { COMMUNES_CONSO_EVOLUTION, COMMUNES_CONSO_HA, COMMUNES_CONSO_SHARE, COMMUNES_HABITAT_MENAGES } from '../../__fixtures__/communesFixtures';
import { communesFrame } from '../../__fixtures__/frames';
import { StubMap, mapLibreStub } from '../../__fixtures__/mapLibreStub';
import { CONSO_FRANCE_BY_DEPARTEMENT, FRANCE_BY_DEPARTEMENT } from '../../__fixtures__/nationalMapFixtures';
import type { HoveredLand } from '../../ClassLegend';
import { colorChanges, communeColors } from '../../domain/communes/colors';
import type { CommunesRender, LegendKey, MapFrame } from '../../domain/frame/types';
import { ZONE_FRANCE, ZONE_HEXAGONE } from '../../zones';
import CommunesCanvas from './CommunesCanvas';
import { COMMUNES_FILL, COMMUNES_SOURCE, COMMUNE_OUTLINE, DEPARTMENTS_SOURCE, SEPARATION_SOURCE } from './communesStyle';
import { HOVER_SOURCE } from './hoverOutline';
import type { StageMapStatus } from './mapLibre';
import { exportInfoOf, exportLegendOf } from '../../domain/frame/exportImage';

// Le moteur des communes du pays, monté sur une carte d'essai : les tests lisent ce qu'il demande
// à la carte, et lui font émettre les événements que MapLibre émettrait.

jest.mock('./mapLibre', () => jest.requireActual('../../__fixtures__/mapLibreStub').mapLibreModule);
jest.mock('@services/api', () => ({ __esModule: true, useGetEnvironmentQuery: () => ({ data: { vector_tiles_location: 'https://tuiles.test/vector_tiles' } }) }));

// jsdom n'implémente pas l'API User Timing, dont le moteur se sert pour repérer ses créations
if (typeof performance.mark !== 'function') {
    Object.defineProperty(performance, 'mark', { configurable: true, writable: true, value: (): void => undefined });
}

// France entière par département, avec un territoire d'outre-mer en cartouche et sa ligne de séparation
const FRANCE: NationalMapBaseMap = {
    ...FRANCE_BY_DEPARTEMENT,
    insets: [{ zone: '03', name: 'Guyane', bbox: [-900_000, 0, -700_000, 200_000], source_bbox: [-6_078_000, 235_000, -5_746_000, 567_000] }],
    separation: [
        [-600_000, 300_000],
        [-600_000, -100_000],
    ],
};

const frameOf = (zone: string, indicatorId: string, values: NationalMapValues = COMMUNES_CONSO_SHARE): MapFrame => communesFrame(zone, indicatorId, values, { base: FRANCE, conso: CONSO_FRANCE_BY_DEPARTEMENT });

const SHARE = frameOf(ZONE_FRANCE, 'conso_pct_surface');
const EVOLUTION = frameOf(ZONE_FRANCE, 'conso_evolution_between_periods', COMMUNES_CONSO_EVOLUTION);
const HECTARES = frameOf(ZONE_FRANCE, 'conso_ha', COMMUNES_CONSO_HA);
const CROSSED = frameOf(ZONE_FRANCE, 'bivariate_habitat_menages', COMMUNES_HABITAT_MENAGES);
const HEXAGONE_SHARE = frameOf(ZONE_HEXAGONE, 'conso_pct_surface');

const rendered = (frame: MapFrame): CommunesRender => frame.render as CommunesRender;

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[\u00a0\u202f]/g, ' ');
// Minuteries d'essai, sans toucher aux repères de performance que pose le moteur
const useFakeTimers = (): void => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
};

// Attributs que les tuiles portent pour une commune
const RENNES = { land_id: '35238', name: 'Rennes', REGION: '53', DEPART: '35' };
const AJACCIO = { land_id: '2A004', name: 'Ajaccio', REGION: '94', DEPART: '2A' };

type Options = { highlightedClass?: LegendKey | null; numberedInsets?: boolean; busy?: boolean; touching?: () => boolean; sheetSlot?: HTMLElement | null };

const mount = (frame: MapFrame, options: Options = {}) => {
    const statuses: StageMapStatus[] = [];
    const hovers: (HoveredLand | null)[] = [];
    const onZoneChange = jest.fn();
    const onStatusChange = (status: StageMapStatus) => statuses.push(status);
    const onHover = (land: HoveredLand | null) => hovers.push(land);
    const element = (shown: MapFrame, { highlightedClass = null, numberedInsets = false, busy = false, touching, sheetSlot }: Options = {}) => (
        <CommunesCanvas
            base={shown.base}
            render={rendered(shown)}
            exportInfo={exportInfoOf(shown.exportMeta)}
            exportLegend={exportLegendOf(shown.legend)}
            highlightedClass={highlightedClass}
            numberedInsets={numberedInsets}
            busy={busy}
            ariaLabel={shown.ariaLabel}
            onHover={onHover}
            touching={touching}
            sheetSlot={sheetSlot}
            onZoneChange={onZoneChange}
            onStatusChange={onStatusChange}
        />
    );
    const view = render(element(frame, options));
    return {
        statuses,
        hovers,
        onZoneChange,
        status: (): StageMapStatus => statuses[statuses.length - 1],
        show: (next: MapFrame, nextOptions?: Options) => view.rerender(element(next, nextOptions)),
        unmount: view.unmount,
    };
};

const theMap = (): StubMap => mapLibreStub.maps[0];
// Le style de la carte est chargé, puis elle a fini de dessiner
const load = (): void => act(() => theMap().fire('load'));
const idle = (): void => act(() => theMap().fire('idle'));
// Monte la carte et la laisse se dessiner entièrement
const mountDrawn = (frame: MapFrame, options?: Options) => {
    const mounted = mount(frame, options);
    load();
    idle();
    return mounted;
};

const stateColors = (frame: MapFrame, highlighted: LegendKey | null = null): Record<string, string> => {
    const { ids, colors } = communeColors(rendered(frame), highlighted);
    return Object.fromEntries(ids.map((id, rank) => [id, colors[rank]]));
};
const shownColors = (): Record<string, unknown> =>
    Object.fromEntries(rendered(SHARE).ids.map((id) => [id, theMap().stateOf(COMMUNES_SOURCE, id).color]));
const colorPoses = (since: number): unknown[][] => theMap().callsOf('setFeatureState', since).filter(([target]) => (target as { source: string }).source === COMMUNES_SOURCE);
// Ce qui ferait analyser de nouveau les tuiles des communes : un filtre ou une propriété changés
// sur une de leurs couches, une source ou une couche ajoutée ou retirée
const reparsing = (since: number): string[] => {
    const communesLayers = new Set(theMap().layers.filter((layer) => layer.source === COMMUNES_SOURCE).map((layer) => layer.id));
    return theMap()
        .calls.slice(since)
        .filter(({ method, args }) => ['addSource', 'removeSource', 'addLayer', 'removeLayer'].includes(method) || (/^set(Filter|PaintProperty|LayoutProperty)$/.test(method) && communesLayers.has(args[0] as string)))
        .map(({ method }) => method);
};
const selectionCard = (): HTMLElement | null => screen.queryByRole('region', { name: 'Sélection sur la carte' });
const overviewButton = (): HTMLElement | null => screen.queryByRole('button', { name: "Vue d'ensemble" });
const click = (properties: Record<string, unknown>[], zoom: number): void =>
    act(() => {
        theMap().rendered = properties;
        theMap().zoom = zoom;
        theMap().fire('click');
    });
const hover = (properties: Record<string, unknown>[]): void =>
    act(() => {
        theMap().rendered = properties;
        theMap().fire('mousemove');
    });

beforeEach(() => {
    mapLibreStub.reset();
    jest.useRealTimers();
});

describe('création de la carte', () => {
    it('crée une carte, sans rotation au-delà du zoom 11, et y pose la source des communes une fois le fichier de tuiles trouvé', () => {
        mount(SHARE);
        load();

        expect(mapLibreStub.maps).toHaveLength(1);
        expect(mapLibreStub.creations[0]).toEqual({ controls: 'top-right', maxZoom: 11 });
        expect(mapLibreStub.tilesUrls[0]).toBe('https://tuiles.test/vector_tiles/communes_national.pmtiles');
        expect(theMap().sources.get(COMMUNES_SOURCE).spec).toEqual({
            type: 'vector',
            url: 'pmtiles://https://tuiles.test/vector_tiles/communes_national.pmtiles',
            promoteId: 'land_id',
        });
        expect(theMap().callsOf('addSource').filter(([id]) => id === COMMUNES_SOURCE)).toHaveLength(1);
    });

    it('colore chaque commune par son état d’entité : classe, gris sans donnée', () => {
        mount(SHARE);
        load();

        expect(shownColors()).toEqual(stateColors(SHARE));
        expect(theMap().stateOf(COMMUNES_SOURCE, '35238').color).toBe(rendered(SHARE).palette[rendered(SHARE).legendKeys[5]]);
        expect(colorPoses(0)[0][0]).toEqual({ source: COMMUNES_SOURCE, sourceLayer: 'communes_national', id: '09304' });
    });

    it('dessine les limites des départements de la zone et la ligne de séparation de l’outre-mer, en longitudes et latitudes', () => {
        mount(SHARE);
        load();

        const departments = theMap().sources.get(DEPARTMENTS_SOURCE).data as GeoJSON.FeatureCollection<GeoJSON.Polygon>;
        const separation = theMap().sources.get(SEPARATION_SOURCE).data as GeoJSON.Feature<GeoJSON.LineString>;
        expect(departments.features.map((feature) => feature.properties.land_id)).toEqual(['22', '35', '75', '84']);
        // 100 km en coordonnées projetées font un peu moins d'un degré de longitude
        expect(departments.features[0].geometry.coordinates[0][1][0]).toBeCloseTo(0.898, 3);
        expect(separation.geometry.coordinates).toHaveLength(2);
        expect(separation.geometry.coordinates[0][0]).toBeCloseTo(-5.39, 2);
    });

    it('nomme les territoires d’outre-mer au-dessus d’eux, ou les numérote à leur gauche sur une petite carte', () => {
        const view = mount(SHARE);
        load();

        expect(mapLibreStub.labels).toEqual([{ text: 'Guyane', position: [expect.closeTo(-7.187, 3), expect.closeTo(1.796, 3)], anchor: 'bottom' }]);

        view.show(SHARE, { numberedInsets: true });

        expect(mapLibreStub.labels).toEqual([{ text: '1', position: [expect.closeTo(-8.085, 3), expect.closeTo(0.898, 3)], anchor: 'right' }]);
    });

    it('détruit la carte en quittant la vue', () => {
        const view = mountDrawn(SHARE);

        view.unmount();

        expect(theMap().removed).toBe(true);
        expect(view.hovers[view.hovers.length - 1]).toBeNull();
    });
});

describe('changement de carte, de période, de zone nationale ou de classe mise en avant', () => {
    it('ne repose que les couleurs qui changent, sur la même carte, sans rien qui fasse analyser de nouveau les tuiles', () => {
        const view = mountDrawn(SHARE);
        const steps: [string, MapFrame][] = [
            ['évolution', EVOLUTION],
            ['bivariée', CROSSED],
            ['hectares', HECTARES],
            ['Hexagone', HEXAGONE_SHARE],
            ['France entière', SHARE],
        ];
        let previous = SHARE;

        steps.forEach(([name, next]) => {
            const since = theMap().mark();
            view.show(next);
            idle();

            const expected = colorChanges(communeColors(rendered(previous), null), communeColors(rendered(next), null));
            expect([name, colorPoses(since).length]).toEqual([name, expected.length]);
            expect([name, reparsing(since)]).toEqual([name, []]);
            expect(shownColors()).toEqual(stateColors(next));
            previous = next;
        });
        expect(mapLibreStub.maps).toHaveLength(1);
    });

    it('ne pose aucune couleur quand la carte suivante colore les communes de la même façon', () => {
        const view = mountDrawn(SHARE);
        const since = theMap().mark();

        // La carte en hectares est dessinée par la même part de la surface communale
        view.show(HECTARES);
        idle();

        expect(colorPoses(since)).toEqual([]);
        expect(view.status()).toEqual({ ready: true, loading: false, notice: null });
    });

    it('rend transparentes la Corse et l’outre-mer sur la zone Hexagone, sans filtre', () => {
        const view = mountDrawn(SHARE);
        const since = theMap().mark();

        view.show(HEXAGONE_SHARE);

        const colors = shownColors();
        expect(rendered(SHARE).ids.filter((id) => colors[id] === 'rgba(0, 0, 0, 0)')).toEqual(['2A004', '97302', '97304', '97608', '97611']);
        expect(theMap().callsOf('setFilter', since)).toEqual([]);
    });

    it('estompe les communes des autres classes après un court délai, pour ne pas suivre chaque ligne de légende traversée', () => {
        useFakeTimers();
        const view = mountDrawn(SHARE);
        const since = theMap().mark();

        // Le pointeur balaie la légende : deux lignes traversées, puis il s'arrête sur la troisième
        view.show(SHARE, { highlightedClass: 0 });
        act(() => jest.advanceTimersByTime(10));
        view.show(SHARE, { highlightedClass: 1 });
        act(() => jest.advanceTimersByTime(10));
        view.show(SHARE, { highlightedClass: 2 });

        expect(colorPoses(since)).toEqual([]);

        act(() => jest.advanceTimersByTime(60));

        expect(shownColors()).toEqual(stateColors(SHARE, 2));
        expect(colorPoses(since)).toHaveLength(colorChanges(communeColors(rendered(SHARE), null), communeColors(rendered(SHARE), 2)).length);
        expect(reparsing(since)).toEqual([]);
    });

    it('n’applique pas à une carte neuve la classe mise en avant sur la précédente', () => {
        useFakeTimers();
        const view = mountDrawn(SHARE, { highlightedClass: 4 });

        expect(shownColors()).toEqual(stateColors(SHARE, 4));

        // La légende a changé : plus rien n'y est mis en avant, dans le rendu même où la carte change
        view.show(EVOLUTION, { highlightedClass: null });

        expect(shownColors()).toEqual(stateColors(EVOLUTION));
    });
});

describe('état annoncé à la page', () => {
    it('annonce le chargement jusqu’à la première image complète, puis la carte prête', () => {
        const view = mount(SHARE);

        expect(view.status()).toEqual({ ready: false, loading: true, notice: null });

        load();

        expect(view.status()).toEqual({ ready: false, loading: true, notice: null });

        idle();

        expect(view.status()).toEqual({ ready: true, loading: false, notice: null });
    });

    it('n’est plus prête tant que les couleurs de la carte suivante ne sont pas à l’écran, sans annoncer de chargement', () => {
        const view = mountDrawn(SHARE);

        view.show(EVOLUTION);

        expect(view.status()).toEqual({ ready: false, loading: false, notice: null });

        idle();

        expect(view.status()).toEqual({ ready: true, loading: false, notice: null });
    });

    it('demande toujours une image après une pose de couleurs, pour que la carte finisse par s’annoncer prête', () => {
        mount(SHARE);
        load();

        expect(theMap().callsOf('triggerRepaint')).not.toHaveLength(0);
    });

    it('invite à choisir un territoire quand le fichier de tuiles manque, sans attendre de dessin', () => {
        mapLibreStub.tilesAvailable = false;
        const view = mount(SHARE);
        load();

        expect(view.status()).toEqual({
            ready: true,
            loading: false,
            notice: "La carte de toutes les communes du pays n'a pas pu être affichée : choisissez une région, un département ou un EPCI pour voir ses communes.",
        });
        expect(theMap().sources.has(COMMUNES_SOURCE)).toBe(false);
        // Les limites des départements restent dessinées
        expect((theMap().sources.get(DEPARTMENTS_SOURCE).data as GeoJSON.FeatureCollection).features).toHaveLength(4);
    });

    it('affiche le même message quand le navigateur ne peut pas créer la carte (WebGL absent)', () => {
        mapLibreStub.webgl = false;
        const view = mount(SHARE);

        expect(mapLibreStub.maps).toHaveLength(0);
        expect(view.status()).toMatchObject({ ready: true, loading: false, notice: expect.stringContaining('choisissez une région, un département ou un EPCI') });
    });

    it('n’est pas attendue indéfiniment après une erreur de la carte, et dit qu’elle n’a pas pu être affichée', () => {
        const view = mount(SHARE);
        load();

        act(() => theMap().fire('error'));

        expect(view.status()).toEqual({ ready: true, loading: false, notice: expect.stringContaining("n'a pas pu être affichée") });
    });

    it('garde sans message une carte déjà dessinée quand une erreur la suit', () => {
        const view = mountDrawn(SHARE);

        act(() => theMap().fire('error'));

        expect(view.status()).toEqual({ ready: true, loading: false, notice: null });
    });
});

describe('caméra', () => {
    it('cadre la carte d’un coup au premier affichage, dans les marges de la carte par territoire', () => {
        mount(SHARE);

        expect(mapLibreStub.fits).toHaveLength(1);
        expect(mapLibreStub.fits[0]).toMatchObject({ durationMs: 0, padding: { top: 20, right: 12, bottom: 12, left: 24 } });
        // De l'ouest du cartouche d'outre-mer à l'est du dernier département
        expect(mapLibreStub.fits[0].bounds).toEqual([
            [expect.closeTo(-8.085, 3), expect.closeTo(-0.898, 3)],
            [expect.closeTo(6.288, 3), expect.closeTo(2.694, 3)],
        ]);
    });

    it('ne touche pas à la caméra pour un changement de carte', () => {
        const view = mountDrawn(SHARE);

        view.show(EVOLUTION);
        view.show(CROSSED);
        view.show(SHARE, { highlightedClass: 1 });

        expect(mapLibreStub.fits).toHaveLength(1);
    });

    it('recadre la carte en un mouvement quand la zone nationale change', () => {
        const view = mountDrawn(SHARE);

        view.show(HEXAGONE_SHARE);

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1]).toMatchObject({ durationMs: 300, padding: { top: 12, right: 12, bottom: 12, left: 12 } });
        // L'Hexagone seul : sans le cartouche ni la ligne de séparation
        expect(mapLibreStub.fits[1].bounds).toEqual([
            [expect.closeTo(0, 3), expect.closeTo(0, 3)],
            [expect.closeTo(6.288, 3), expect.closeTo(0.898, 3)],
        ]);
    });

    it('se recadre à une nouvelle taille tant que l’utilisateur ne l’a pas déplacée', () => {
        mountDrawn(SHARE);

        act(() => mapLibreStub.resize());

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1]).toMatchObject({ durationMs: 0, bounds: mapLibreStub.fits[0].bounds });
        expect(overviewButton()).not.toBeInTheDocument();
    });

    it('garde la vue de l’utilisateur une fois la carte déplacée, et propose de revenir à la vue d’ensemble', () => {
        mountDrawn(SHARE);
        expect(overviewButton()).not.toBeInTheDocument();

        // Un cran de molette isolé : le déplacement se termine sans l'événement du navigateur qui l'a causé
        act(() => theMap().fire('moveend'));
        act(() => mapLibreStub.resize());

        expect(mapLibreStub.fits).toHaveLength(1);

        fireEvent.click(overviewButton());

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1]).toMatchObject({ durationMs: 300, bounds: mapLibreStub.fits[0].bounds });
        expect(overviewButton()).not.toBeInTheDocument();
    });

    it('ne recadre pas une carte déplacée quand seules ses marges changent, avec la taille de la scène', () => {
        const view = mountDrawn(SHARE);
        act(() => theMap().fire('moveend'));

        view.show(SHARE, { numberedInsets: true });

        expect(mapLibreStub.fits).toHaveLength(1);
        expect(overviewButton()).toBeInTheDocument();
    });

    it('recadre dans ses nouvelles marges une carte que l’utilisateur n’a pas déplacée', () => {
        const view = mountDrawn(SHARE);

        view.show(SHARE, { numberedInsets: true });

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(mapLibreStub.fits[1]).toMatchObject({ durationMs: 0, bounds: mapLibreStub.fits[0].bounds });
        expect(mapLibreStub.fits[1].padding).not.toEqual(mapLibreStub.fits[0].padding);
    });

    it('revient à la vue d’ensemble de la nouvelle zone même si la carte avait été déplacée', () => {
        const view = mountDrawn(SHARE);
        act(() => theMap().fire('moveend', { originalEvent: {} }));

        view.show(HEXAGONE_SHARE);

        expect(mapLibreStub.fits).toHaveLength(2);
        expect(overviewButton()).not.toBeInTheDocument();
    });
});

describe('survol', () => {
    it('donne la commune sous le pointeur : son nom lu dans la tuile, sa valeur et sa classe', () => {
        const view = mountDrawn(SHARE);

        hover([RENNES]);

        const hovered = view.hovers[view.hovers.length - 1];
        expect({ ...hovered, valueText: plain(hovered.valueText) }).toEqual({ name: 'Rennes', valueText: '2,45 % de 2011 à 2024', classIndex: rendered(SHARE).legendKeys[5] });
        expect(mapLibreStub.tooltip).toEqual({ name: 'Rennes', value: hovered.valueText });
        expect(theMap().getCanvas().style.cursor).toBe('pointer');
    });

    it('donne aussi les hectares d’une carte en hectares, dessinée par sa version relative', () => {
        mountDrawn(HECTARES);

        hover([RENNES]);

        expect(plain(mapLibreStub.tooltip.value)).toBe('2,45 %, soit 123 ha de 2011 à 2024');
    });

    it('écrit les deux taux d’une carte bivariée sur une seule ligne pour la légende, et ligne par ligne pour l’infobulle, qui nomme chacun', () => {
        const view = mountDrawn(CROSSED);

        hover([RENNES]);

        const hovered = view.hovers[view.hovers.length - 1];
        expect(hovered.valueText).not.toContain('<br/>');
        expect(hovered.valueText).toContain(', ');
        expect(mapLibreStub.tooltip.value.split('<br/>')).toHaveLength(2);
    });

    it('donne à l’infobulle la pastille de la classe de la commune', () => {
        mountDrawn(SHARE);

        hover([RENNES]);

        expect(mapLibreStub.tooltipSwatch).toBe(rendered(SHARE).palette[rendered(SHARE).legendKeys[5]]);
    });

    it('cerne la commune survolée dans une source à part, sans toucher aux couches des communes, et l’efface quand le pointeur la quitte', () => {
        mountDrawn(SHARE);
        const shape = { type: 'Polygon', coordinates: [[[0, 0], [2, 1], [1, 3], [0, 0]]] };
        theMap().shapes.set(RENNES, shape);
        const since = theMap().mark();

        hover([RENNES]);

        const outlined = () => theMap().sources.get(HOVER_SOURCE)?.data as { geometry?: { coordinates: unknown }; features?: unknown[] };
        expect(outlined().geometry.coordinates).toEqual(shape.coordinates);
        expect(theMap().layers.filter((layer) => layer.source === HOVER_SOURCE)).toHaveLength(2);
        expect(colorPoses(since)).toEqual([]);
        expect(theMap().callsOf('setFilter', since)).toEqual([]);

        hover([]);

        expect(outlined().features).toEqual([]);
    });

    it('au doigt, ne dessine ni infobulle ni contour de survol : la fiche de sélection en tient lieu', () => {
        mountDrawn(SHARE, { touching: () => true });
        theMap().shapes.set(RENNES, { type: 'Polygon', coordinates: [[[0, 0], [2, 1], [1, 3], [0, 0]]] });

        hover([RENNES]);

        expect(mapLibreStub.tooltip).toBeNull();
        expect(theMap().sources.has(HOVER_SOURCE)).toBe(false);
    });

    it('surligne le département de la commune survolée, par un état de la source des départements', () => {
        mountDrawn(SHARE);
        const since = theMap().mark();

        hover([RENNES]);
        expect(theMap().stateOf(DEPARTMENTS_SOURCE, '35')).toEqual({ hover: true });

        hover([{ land_id: '22278', name: 'Saint-Brieuc', REGION: '53', DEPART: '22' }]);
        expect(theMap().stateOf(DEPARTMENTS_SOURCE, '35')).toEqual({ hover: false });
        expect(theMap().stateOf(DEPARTMENTS_SOURCE, '22')).toEqual({ hover: true });
        // L'état des communes n'est pas touché par un survol
        expect(colorPoses(since)).toEqual([]);
    });

    it('ne retient qu’une fois la commune que deux tuiles dessinent à leur limite', () => {
        const view = mountDrawn(SHARE);

        hover([RENNES, RENNES]);

        expect(view.hovers.filter((land) => land?.name === 'Rennes')).toHaveLength(1);
    });

    it('s’efface quand le pointeur quitte les communes ou la carte', () => {
        const view = mountDrawn(SHARE);
        hover([RENNES]);

        hover([]);

        expect(view.hovers[view.hovers.length - 1]).toBeNull();
        expect(mapLibreStub.tooltip).toBeNull();
        expect(theMap().stateOf(DEPARTMENTS_SOURCE, '35')).toEqual({ hover: false });
        expect(theMap().getCanvas().style.cursor).toBe('');

        hover([RENNES]);
        act(() => theMap().fire('mouseout'));

        expect(mapLibreStub.tooltip).toBeNull();
    });

    it('ignore, sur la zone Hexagone, les communes de Corse que la carte ne dessine pas', () => {
        const view = mountDrawn(HEXAGONE_SHARE);

        hover([AJACCIO]);

        expect(view.hovers.filter(Boolean)).toEqual([]);
        expect(mapLibreStub.tooltip).toBeNull();
    });
});

describe('clic et fiche de sélection', () => {
    it('ne change pas de zone : au cadrage du pays, il désigne le département et propose de l’afficher par commune', () => {
        const view = mountDrawn(SHARE);

        click([RENNES], 5.4);

        expect(view.onZoneChange).not.toHaveBeenCalled();
        expect(within(selectionCard()).getByText('Ille-et-Vilaine')).toBeInTheDocument();
        expect(within(selectionCard()).queryByText('Rennes')).not.toBeInTheDocument();
        expect(theMap().stateOf(DEPARTMENTS_SOURCE, '35')).toMatchObject({ selected: true });

        fireEvent.click(within(selectionCard()).getByRole('button', { name: 'Afficher ce département par commune' }));

        expect(view.onZoneChange).toHaveBeenCalledWith('DEPART_35', 'Ille-et-Vilaine');
    });

    it('donne aussi la commune à partir du zoom 7,5 : son nom, sa valeur et le lien vers son diagnostic', () => {
        mountDrawn(HECTARES);

        click([RENNES], 7.5);

        const card = within(selectionCard());
        expect(card.getByText('Rennes')).toBeInTheDocument();
        expect(card.getByText(/^2,45\s%, soit 123\sha de 2011 à 2024$/)).toBeInTheDocument();
        const diagnostic = card.getByRole('link', { name: 'Voir le diagnostic de la commune' });
        expect(diagnostic).toHaveAttribute('href', '/diagnostic/commune/35238');
        // Dans un autre onglet, pour ne pas perdre la carte
        expect(diagnostic).toHaveAttribute('target', '_blank');
        expect(diagnostic).toHaveAttribute('rel', 'noopener noreferrer');
        expect(card.getByText('Ille-et-Vilaine')).toBeInTheDocument();
    });

    it('ne change un filtre de la source des communes que pour le contour de la commune sélectionnée', () => {
        const view = mountDrawn(SHARE);
        const since = theMap().mark();

        click([RENNES], 5.4);
        expect(theMap().callsOf('setFilter', since)).toEqual([]);

        click([RENNES], 8);
        expect(theMap().callsOf('setFilter', since)).toEqual([[COMMUNE_OUTLINE, ['==', ['get', 'land_id'], '35238']]]);

        // Un changement de carte sous la sélection ne touche pas au contour
        view.show(EVOLUTION);
        expect(theMap().callsOf('setFilter', since)).toHaveLength(1);
        expect(theMap().getLayer(COMMUNES_FILL).filter).toBeUndefined();
    });

    it('fait suivre à la fiche la carte affichée sous la sélection', () => {
        const view = mountDrawn(SHARE);
        click([RENNES], 8);

        view.show(EVOLUTION);

        expect(within(selectionCard()).getByText('Rennes')).toBeInTheDocument();
        expect(within(selectionCard()).queryByText(/2,45/)).not.toBeInTheDocument();
    });

    it.each([
        ['le bouton de la fiche', () => fireEvent.click(within(selectionCard()).getByRole('button', { name: /Fermer/ }))],
        ['la touche Échap', () => fireEvent.keyDown(document, { key: 'Escape' })],
        ['un clic hors des communes', () => click([], 8)],
    ])('se ferme par %s, et retire les contours de la sélection', (_way, close) => {
        mountDrawn(SHARE);
        click([RENNES], 8);

        close();

        expect(selectionCard()).not.toBeInTheDocument();
        expect(theMap().getLayer(COMMUNE_OUTLINE).filter).toEqual(['==', ['get', 'land_id'], '']);
        expect(theMap().stateOf(DEPARTMENTS_SOURCE, '35')).toMatchObject({ selected: false });
    });

    it('se ferme quand la zone nationale change', () => {
        const view = mountDrawn(SHARE);
        click([RENNES], 8);

        view.show(HEXAGONE_SHARE);

        expect(selectionCard()).not.toBeInTheDocument();
    });

    it('ignore le clic sur une commune hors de la zone, et pendant un chargement', () => {
        const hexagone = mountDrawn(HEXAGONE_SHARE);

        click([AJACCIO], 8);

        expect(selectionCard()).not.toBeInTheDocument();

        hexagone.show(HEXAGONE_SHARE, { busy: true });
        click([RENNES], 8);

        expect(selectionCard()).not.toBeInTheDocument();
    });
});
