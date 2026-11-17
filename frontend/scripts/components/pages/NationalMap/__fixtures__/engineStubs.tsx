// Bouchons des trois moteurs de rendu de la carte pour les tests Jest : jsdom ne dessine pas, et
// maplibre-gl n'est pas résoluble par Jest. Ils consignent ce que la carte leur demande, pour que
// les tests comptent les créations du graphique et lisent les options, les props et l'estompage.
//
// À brancher dans un fichier de test par :
//   jest.mock('highcharts-react-official', () => jest.requireActual('./__fixtures__/engineStubs').highchartsReactModule);
//   jest.mock('./GriddedMap', () => jest.requireActual('./__fixtures__/engineStubs').griddedMapModule);
//   jest.mock('./components/stage/CommunesCanvas', () => jest.requireActual('./__fixtures__/engineStubs').communesCanvasModule);
import React, { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react';
import type * as Highcharts from 'highcharts';
import type GriddedMap from '../GriddedMap';
import type CommunesCanvas from '../components/stage/CommunesCanvas';
import type { StageMapStatus } from '../components/stage/mapLibre';

// jsdom n'implémente pas l'API User Timing, dont la carte se sert pour repérer ses créations
if (typeof performance.mark !== 'function') {
    Object.defineProperty(performance, 'mark', { configurable: true, writable: true, value: (): void => undefined });
}

// --- Highcharts --------------------------------------------------------------------------

// Ce que la carte lit et écrit sur un point Highcharts : ses données, l'opacité de son tracé et
// son état (« hover » : cerné comme sous le pointeur)
type StubPoint = {
    options: Record<string, unknown>;
    fillOpacity: number;
    state: string;
    // Classes posées sur son tracé (territoire lu au doigt)
    classes: Set<string>;
    graphic: { attr: (attributes: Record<string, number>) => void; toFront: () => StubPoint['graphic']; addClass: (name: string) => void; removeClass: (name: string) => void };
    setState: (state: string) => void;
};
// Ce qu'elle lit et écrit sur une série : son type, ses options, mises à jour en place, et ses points
type StubSeries = { type: string; options: Record<string, unknown>; points: StubPoint[]; update: (changes: Record<string, unknown>) => void };
// Ce qu'elle lit et demande au graphique : ses séries, son recalage dans son conteneur, et s'il
// est la copie que Highcharts dessine le temps d'un export en image
type StubChart = { series: StubSeries[]; reflow: () => void; renderer: { forExport: boolean } };

const stubPoint = (options: Record<string, unknown>): StubPoint => {
    const point: StubPoint = {
        options,
        fillOpacity: 1,
        state: '',
        classes: new Set(),
        graphic: {
            attr: (attributes) => {
                point.fillOpacity = attributes['fill-opacity'] ?? point.fillOpacity;
            },
            toFront: () => point.graphic,
            addClass: (name) => {
                point.classes.add(name);
            },
            removeClass: (name) => {
                point.classes.delete(name);
            },
        },
        setState: (state) => {
            point.state = state;
        },
    };
    return point;
};

// Les options de la série sont copiées : une mise à jour en place ne touche pas celles de la création
const stubSeries = (options: Highcharts.SeriesOptionsType): StubSeries => {
    const series: StubSeries = {
        type: options.type,
        options: { ...options },
        points: (((options as { data?: unknown[] }).data ?? []) as Record<string, unknown>[]).map(stubPoint),
        update: (changes) => {
            series.options = { ...series.options, ...changes };
        },
    };
    return series;
};

const stubChart = (options: Highcharts.Options, forExport = false): StubChart => ({
    series: (options.series ?? []).map(stubSeries),
    reflow: () => {
        chartStub.reflows += 1;
    },
    renderer: { forExport },
});

type ChartStub = {
    // Options de chaque graphique créé, dans l'ordre : leur nombre est le nombre de créations
    creations: Highcharts.Options[];
    // Graphique affiché, null si aucun n'est monté
    chart: StubChart | null;
    // Nombre de recalages demandés aux graphiques depuis la dernière remise à zéro
    reflows: number;
    reset: () => void;
    // Export en image du graphique affiché, comme Highcharts le fait : il en crée une copie, pour
    // laquelle il appelle aussi le rappel de création
    exportCopy: () => void;
    // Options du graphique affiché
    options: () => Highcharts.Options;
    // Territoires que la carte a estompés (identifiants), dans l'ordre du fond
    dimmedLands: () => string[];
    // Territoires que la carte cerne sans que le pointeur les survole (identifiants)
    outlinedLands: () => string[];
    // Territoires cernés parce qu'ils sont lus au doigt
    readLands: () => string[];
    // Appui ou clic hors des territoires
    tapOutside: () => void;
    // Diamètre du plus grand cercle proportionnel du graphique affiché ; null hors carte en cercles
    symbolMaxSize: () => number | null;
    // Clic sur un territoire, tel que Highcharts le transmet au gestionnaire des options ; à appeler dans act()
    clickLand: (landId: string) => void;
    // Survol d'un territoire, puis sortie du pointeur (null) ; à appeler dans act()
    hoverLand: (landId: string | null) => void;
};

const NO_EXPORT = (): void => undefined;

export const chartStub: ChartStub = {
    creations: [],
    chart: null,
    reflows: 0,
    reset: () => {
        chartStub.creations = [];
        chartStub.chart = null;
        chartStub.reflows = 0;
        chartStub.exportCopy = NO_EXPORT;
    },
    exportCopy: NO_EXPORT,
    options: () => chartStub.creations[chartStub.creations.length - 1],
    dimmedLands: () => {
        const lands = chartStub.chart?.series[0].points ?? [];
        return lands.filter((point) => point.fillOpacity < 1).map((point) => point.options.land_id as string);
    },
    outlinedLands: () => (chartStub.chart?.series[0].points ?? []).filter((point) => point.state === 'hover').map((point) => point.options.land_id as string),
    readLands: () => (chartStub.chart?.series[0].points ?? []).filter((point) => point.classes.size > 0).map((point) => point.options.land_id as string),
    tapOutside: () => (chartStub.options().chart.events.click as unknown as () => void)(),
    symbolMaxSize: () => (chartStub.chart?.series.find((series) => series.type === 'mapbubble')?.options.maxSize as number) ?? null,
    clickLand: (landId) => {
        const point = chartStub.chart.series[0].points.find((land) => land.options.land_id === landId);
        const click = chartStub.options().plotOptions.map.point.events.click as unknown as (event: { point: StubPoint }) => void;
        click({ point });
    },
    hoverLand: (landId) => {
        const events = chartStub.options().plotOptions.map.point.events as unknown as { mouseOver: (event: { target: StubPoint }) => void; mouseOut: () => void };
        if (landId === null) events.mouseOut();
        else events.mouseOver({ target: chartStub.chart.series[0].points.find((land) => land.options.land_id === landId) });
    },
};

type HighchartsReactStubProps = {
    options: Highcharts.Options;
    containerProps?: React.HTMLAttributes<HTMLDivElement>;
    callback?: Highcharts.ChartCallbackFunction;
};

// Comme highcharts-react-official en mode « immutable » : un graphique neuf à chaque changement
// d'identité des options ou des props du conteneur, et le rappel de création appelé à chaque fois
const HighchartsReactStub = forwardRef<{ chart: StubChart | null }, HighchartsReactStubProps>(({ options, containerProps, callback }, ref) => {
    const chart = useRef<StubChart | null>(null);

    useLayoutEffect(() => {
        chart.current = stubChart(options);
        chartStub.chart = chart.current;
        chartStub.creations.push(options);
        chartStub.exportCopy = () => callback?.(stubChart(options, true) as unknown as Highcharts.Chart);
        callback?.(chart.current as unknown as Highcharts.Chart);
    }, [options, containerProps]);

    useLayoutEffect(
        () => () => {
            chartStub.chart = null;
        },
        [],
    );

    useImperativeHandle(
        ref,
        () => ({
            get chart() {
                return chart.current;
            },
        }),
        [],
    );

    return <div {...containerProps} data-testid="highcharts-map" />;
});

HighchartsReactStub.displayName = 'HighchartsReactStub';

export const highchartsReactModule = { __esModule: true, default: HighchartsReactStub };

// --- MapLibre ----------------------------------------------------------------------------

type GriddedMapProps = React.ComponentPropsWithoutRef<typeof GriddedMap>;

type GridStub = {
    // Props du dernier rendu de la carte carroyée, null si elle n'a pas été rendue
    props: GriddedMapProps | null;
    // Nombre de cartes créées depuis la dernière remise à zéro : une par montage
    creations: number;
    reset: () => void;
    // La carte carroyée annonce son état, comme MapLibre le fait au fil de son dessin (par défaut :
    // rien de dessiné, rien en cours) ; à appeler dans act()
    reportStatus: (status: Partial<StageMapStatus>) => void;
};

export const gridStub: GridStub = {
    props: null,
    creations: 0,
    reset: () => {
        gridStub.props = null;
        gridStub.creations = 0;
    },
    reportStatus: (status) => gridStub.props.onStatusChange({ ready: false, loading: false, notice: null, ...status }),
};

const GriddedMapStub = forwardRef<{ exportPng: () => void }, GriddedMapProps>((props, ref) => {
    gridStub.props = props;
    useLayoutEffect(() => {
        gridStub.creations += 1;
    }, []);
    useImperativeHandle(ref, () => ({ exportPng: () => undefined }), []);
    return <img alt={props.ariaLabel} />;
});

GriddedMapStub.displayName = 'GriddedMapStub';

export const griddedMapModule = { __esModule: true, default: GriddedMapStub };

type CommunesCanvasProps = React.ComponentProps<typeof CommunesCanvas>;

type CommunesStub = {
    // Props du dernier rendu de la carte des communes du pays, null si elle n'est pas montée
    props: CommunesCanvasProps | null;
    // Nombre de cartes créées depuis la dernière remise à zéro : une par montage
    creations: number;
    // Nombre d'images demandées à la carte depuis la dernière remise à zéro
    exports: number;
    reset: () => void;
    // La carte annonce son état, comme MapLibre le fait au fil de son dessin (par défaut : rien de
    // dessiné, rien en cours) ; à appeler dans act()
    reportStatus: (status: Partial<StageMapStatus>) => void;
};

export const communesStub: CommunesStub = {
    props: null,
    creations: 0,
    exports: 0,
    reset: () => {
        communesStub.props = null;
        communesStub.creations = 0;
        communesStub.exports = 0;
    },
    reportStatus: (status) => communesStub.props.onStatusChange({ ready: false, loading: false, notice: null, ...status }),
};

const CommunesCanvasStub = forwardRef<{ exportPng: () => void }, CommunesCanvasProps>((props, ref) => {
    communesStub.props = props;
    useLayoutEffect(() => {
        communesStub.creations += 1;
        return () => {
            communesStub.props = null;
        };
    }, []);
    useImperativeHandle(
        ref,
        () => ({
            exportPng: () => {
                communesStub.exports += 1;
            },
        }),
        [],
    );
    return <img alt={props.ariaLabel} />;
});

CommunesCanvasStub.displayName = 'CommunesCanvasStub';

export const communesCanvasModule = { __esModule: true, default: CommunesCanvasStub };
