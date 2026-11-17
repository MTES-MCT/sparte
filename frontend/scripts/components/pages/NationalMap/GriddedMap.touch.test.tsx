import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { artifFrame } from './__fixtures__/frames';
import { StubMap, mapLibreStub } from './__fixtures__/mapLibreStub';
import { BRETAGNE_BY_DEPARTEMENT } from './__fixtures__/nationalMapFixtures';
import { HOVER_SOURCE } from './components/stage/hoverOutline';
import type { GridRender, MapFrame } from './domain/frame/types';
import GriddedMap from './GriddedMap';
import { exportInfoOf, exportLegendOf } from './domain/frame/exportImage';

// La carte de mailles sous le doigt et sous le pointeur : ce qu'un appui lit sans ouvrir, la fiche
// qui ouvre, et le contour de l'élément survolé. Le reste de la carte est éprouvé dans GriddedMap.test.tsx.

jest.mock('./components/stage/mapLibre', () => jest.requireActual('./__fixtures__/mapLibreStub').mapLibreModule);
jest.mock('@services/api', () => ({
    __esModule: true,
    useGetEnvironmentQuery: () => ({ data: { vector_tiles_location: 'https://tuiles.test/vector_tiles' } }),
    useGetLandQuery: (): { currentData: null } => ({ currentData: null }),
}));

const LANDS_FILL = 'national-map-lands-fill';
const GRID_FILL = 'national-map-grid-fill';
const SOILS_BRETAGNE = artifFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'artif_pct_gridded', { scale: 'DEPART', lands: {} });
const CELL = { DEPART: '["35"]', part_artif: 23, resolution_m: 250, annee_min: 2020, annee_max: 2020 };
const LAND = { land_id: '35', name: 'Ille-et-Vilaine' };
const SQUARE = { type: 'Polygon', coordinates: [[[0, 0], [1, 0.1], [1.1, 1], [0, 1.1], [0, 0]]] };

const gridOf = ({ render: drawn }: MapFrame): GridRender => {
    if (drawn.renderer !== 'grid') throw new Error('rendu de mailles attendu');
    return { ...drawn, image: null };
};

// `touch` : le dernier geste a été fait au doigt
const mount = (touch: boolean, busy = false) => {
    const onZoneChange = jest.fn();
    render(
        <GriddedMap
            zone={SOILS_BRETAGNE.base.zone}
            render={gridOf(SOILS_BRETAGNE)}
            scale={SOILS_BRETAGNE.base.scale}
            numberedInsets={false}
            highlightedClass={null}
            highlightedDetailClass={null}
            clickable={SOILS_BRETAGNE.base.clickable}
            busy={busy}
            exportInfo={exportInfoOf(SOILS_BRETAGNE.exportMeta)}
            exportLegend={exportLegendOf(SOILS_BRETAGNE.legend)}
            ariaLabel={SOILS_BRETAGNE.ariaLabel}
            onHover={jest.fn()}
            touching={() => touch}
            onZoneChange={onZoneChange}
            onStatusChange={jest.fn()}
            onStageChange={jest.fn()}
        />,
    );
    act(() => mapLibreStub.maps[0].fire('load'));
    return { onZoneChange };
};
const theMap = (): StubMap => mapLibreStub.maps[0];
const sheet = (): HTMLElement | null => screen.queryByRole('region', { name: 'Élément désigné sur la carte' });
const tap = (drawn: StubMap['drawn']): void =>
    act(() => {
        theMap().drawn = drawn;
        theMap().fire('click', { lngLat: { lng: -1.7, lat: 48.1 } });
    });
const outlined = () => theMap().sources.get(HOVER_SOURCE)?.data as { geometry?: { coordinates: unknown }; features?: unknown[] } | undefined;

beforeEach(() => mapLibreStub.reset());

describe('au doigt', () => {
    it('lit la maille touchée au lieu d’ouvrir son territoire : une fiche, un repère sur le point touché, pas d’infobulle', () => {
        const { onZoneChange } = mount(true);

        tap({ [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] });

        expect(onZoneChange).not.toHaveBeenCalled();
        expect(sheet()).toHaveTextContent('Ille-et-Vilaine');
        expect(sheet()).toHaveTextContent('23 % de sols artificialisés');
        expect(sheet()).toHaveTextContent('Maille de 250 m × 250 m, millésime 2020');
        expect(mapLibreStub.touchMark).toEqual({ lng: -1.7, lat: 48.1 });
        expect(mapLibreStub.tooltip).toBeNull();
    });

    it('ouvre le territoire par le bouton de la fiche, et par lui seul', () => {
        const { onZoneChange } = mount(true);
        tap({ [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] });

        fireEvent.click(within(sheet()).getByRole('button', { name: 'Ouvrir ce territoire' }));

        expect(onZoneChange.mock.calls).toEqual([['DEPART_35', 'Ille-et-Vilaine']]);
    });

    it('n’ouvre rien pendant un chargement, où la carte montre encore la vue précédente', () => {
        const { onZoneChange } = mount(true, true);
        tap({ [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] });

        fireEvent.click(within(sheet()).getByRole('button', { name: 'Ouvrir ce territoire' }));

        expect(onZoneChange).not.toHaveBeenCalled();
    });

    it('remplace la fiche par celle d’un autre appui, et la ferme par un appui hors de tout élément ou par sa croix', () => {
        mount(true);
        tap({ [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] });
        tap({ [LANDS_FILL]: [{ land_id: '22', name: "Côtes-d'Armor" }] });

        expect(sheet()).toHaveTextContent("Côtes-d'Armor");
        expect(sheet()).not.toHaveTextContent('Ille-et-Vilaine');

        tap({});

        expect(sheet()).not.toBeInTheDocument();
        expect(mapLibreStub.touchMark).toBeNull();

        tap({ [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] });
        fireEvent.click(within(sheet()).getByRole('button', { name: /Fermer/ }));

        expect(sheet()).not.toBeInTheDocument();
        expect(mapLibreStub.touchMark).toBeNull();
    });
});

describe('à la souris', () => {
    it('ouvre le territoire au clic, sans fiche', () => {
        const { onZoneChange } = mount(false);

        tap({ [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] });

        expect(onZoneChange.mock.calls).toEqual([['DEPART_35', 'Ille-et-Vilaine']]);
        expect(sheet()).not.toBeInTheDocument();
        expect(mapLibreStub.touchMark).toBeNull();
    });

    it('donne à l’infobulle la pastille de la classe de la maille lue', () => {
        mount(false);
        theMap().drawn = { [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('mousemove'));

        expect(mapLibreStub.tooltipSwatch).toBe(gridOf(SOILS_BRETAGNE).cells.classes[2].color);
    });

    it('cerne la maille survolée dans une source à part, puis l’efface quand le pointeur quitte la carte', () => {
        mount(false);
        theMap().shapes.set(CELL, SQUARE);
        theMap().drawn = { [GRID_FILL]: [CELL], [LANDS_FILL]: [LAND] };
        const since = theMap().mark();
        act(() => theMap().fire('mousemove'));

        expect(outlined().geometry.coordinates).toEqual(SQUARE.coordinates);
        // Ni filtre ni propriété de dessin changés sur les couches de la carte : rien n'y est recalculé
        expect(theMap().callsOf('setFilter', since)).toEqual([]);
        expect(theMap().callsOf('setPaintProperty', since)).toEqual([]);

        act(() => theMap().fire('mouseout'));

        expect(outlined().features).toEqual([]);
    });

    it('cerne le territoire là où il n’y a ni maille ni objet à lire', () => {
        mount(false);
        theMap().shapes.set(LAND, SQUARE);
        theMap().drawn = { [LANDS_FILL]: [LAND] };
        act(() => theMap().fire('mousemove'));

        expect(outlined().geometry.coordinates).toEqual(SQUARE.coordinates);
    });
});
