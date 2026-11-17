import type * as Highcharts from 'highcharts';
import type { MapFrame } from '../../domain/frame/types';
import { ZONE_FRANCE } from '../../zones';
import { artifFrame, consoFrame } from '../../__fixtures__/frames';
import {
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    FRANCE_BY_REGION,
} from '../../__fixtures__/nationalMapFixtures';
import { renderRings, resizeRings } from './ringsLayer';
import { OPEN_HINT, PointHandlers, StageOptions, applySymbolMaxSize, buildChartOptions, outlineLand, stagePadding } from './territoryOptions';
import { TIP_CLASS } from './tipView';

// Le calque des anneaux dessine dans le SVG de Highcharts : ici, seul ce qui lui est demandé compte
jest.mock('./ringsLayer', () => ({ renderRings: jest.fn(), resizeRings: jest.fn() }));

const LARGE: StageOptions = { numberedInsets: false, symbolMaxSize: null };
const SMALL: StageOptions = { numberedInsets: true, symbolMaxSize: null };

// `touch` : le dernier geste a été fait au doigt
const handlers = (touch = false): jest.Mocked<PointHandlers> => ({ onLandClick: jest.fn(), onLandHover: jest.fn(), touching: jest.fn(() => touch), onLandRead: jest.fn() });

const france = (indicatorId: string): MapFrame => consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, indicatorId, CONSO_FRANCE_BY_REGION);
const bretagne = (indicatorId: string): MapFrame => consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, indicatorId, CONSO_BRETAGNE_BY_DEPARTEMENT);
const artif = (indicatorId: string): MapFrame => artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, indicatorId, ARTIF_FRANCE_BY_REGION);
// La même carte, à la maille des communes : un clic n'y descend plus d'un niveau
const communes = (frame: MapFrame): MapFrame => ({ ...frame, base: { ...frame.base, clickable: false } });

const optionsOf = (frame: MapFrame, stage: StageOptions = LARGE, pointHandlers: PointHandlers = handlers()): Highcharts.Options =>
    buildChartOptions(frame, stage, pointHandlers);

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string): string => text.replace(/[  ]/g, ' ');

type Series = {
    type: string;
    cursor?: string;
    maxSize?: number;
    borderColor?: string;
    data: { name?: string; land_id?: string; geometry?: { coordinates: number[] } }[];
};
const seriesOf = (options: Highcharts.Options): Series[] => options.series as unknown as Series[];
const seriesTypes = (options: Highcharts.Options): string[] => seriesOf(options).map((series) => series.type);
const exported = (options: Highcharts.Options): Highcharts.Options => options.exporting.chartOptions;

type PointEvents = { click: (event: { point: { options: object } }) => void; mouseOver: (event: { target: { options: object } }) => void; mouseOut: () => void };
const eventsOf = (options: Highcharts.Options, series: 'map' | 'mapbubble'): PointEvents => options.plotOptions[series].point.events as unknown as PointEvents;

// Infobulle d'un point, telle que le navigateur la lira ; null quand la carte n'en dessine pas
type TipPoint = { options: object; color?: string };
const tooltipOf = (options: Highcharts.Options, point: TipPoint): HTMLElement | null => {
    const markup = (options.tooltip.formatter as unknown as (this: { point: TipPoint }) => string | false).call({ point });
    if (markup === false) return null;
    const host = document.createElement('div');
    host.innerHTML = markup;
    return host.firstElementChild as HTMLElement;
};
const partOf = (tip: HTMLElement, part: string): string | null => {
    const element = tip.querySelector(`.${TIP_CLASS}__${part}`);
    return element ? plain(element.textContent) : null;
};

describe('image exportée', () => {
    it('est nommée d’après la zone, la maille et l’indicateur', () => {
        expect(optionsOf(france('conso_pct_surface')).exporting.filename).toBe('carte-france-region-conso_pct_surface');
        expect(optionsOf(bretagne('conso_ha')).exporting.filename).toBe('carte-region_53-depart-conso_ha');
    });

    it('porte le libellé de l’indicateur en titre, et la zone, la maille et la période en sous-titre', () => {
        const image = exported(optionsOf(bretagne('conso_pct_surface')));

        expect(image.title.text).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(image.subtitle.text).toBe('Bretagne · par département · de 2011 à 2024');
    });

    it('précise, pour des cercles, ce que porte leur surface et la valeur du plus grand', () => {
        expect(plain(exported(optionsOf(france('conso_ha'))).subtitle.text)).toBe(
            'France entière · par région · de 2011 à 2024 · surface des cercles proportionnelle à la valeur (maximum : 47 151 ha)',
        );
    });

    it('précise, pour des anneaux, ce que porte leur surface et le sens de leurs deux couleurs', () => {
        expect(plain(exported(optionsOf(artif('artif_desartif_ha'))).subtitle.text)).toBe(
            'France entière · par région · Millésimes n°1 (2017 à 2020) et n°2 (2020 à 2023) · surface des anneaux proportionnelle à la somme des deux flux (maximum : 13 897,6 ha) · ' +
                'artificialisation en rouge, désartificialisation en bleu',
        );
    });

    it('donne en sous-titre, pour l’OCS GE, les millésimes représentés à la place de la période', () => {
        expect(exported(optionsOf(artif('artif_net_pct_surface'))).subtitle.text).toBe('France entière · par région · Millésimes n°1 (2017 à 2020) et n°2 (2020 à 2023)');
    });

    it('crédite le Cerema pour la consommation et l’IGN pour l’OCS GE', () => {
        expect(exported(optionsOf(france('conso_pct_surface'))).credits).toEqual({
            enabled: true,
            text: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)',
        });
        expect(exported(optionsOf(artif('artif_net_pct_surface'))).credits.text).toBe('Mon Diagnostic Artificialisation · données IGN (OCS GE)');
    });

    it('dessine la légende des classes d’un aplat, titrée par son unité', () => {
        const options = optionsOf(france('conso_pct_surface'));

        expect(exported(options).legend).toMatchObject({ enabled: true, title: { text: '%' } });
        expect((options.colorAxis as Highcharts.ColorAxisOptions).dataClasses).toHaveLength(5);
        expect(options.legend).toEqual({ enabled: false });
    });

    it('n’a pas de légende de classes pour des cercles ni pour une carte bivariée', () => {
        expect([france('conso_ha'), france('bivariate_habitat_menages')].map((frame) => exported(optionsOf(frame)).legend.enabled)).toEqual([false, false]);
        expect(optionsOf(france('conso_ha')).colorAxis).toBeUndefined();
    });
});

describe('séries', () => {
    it('dessine les territoires, la ligne de séparation et les noms des territoires d’outre-mer', () => {
        const options = optionsOf(france('conso_pct_surface'));

        expect(seriesTypes(options)).toEqual(['map', 'mapline', 'mappoint']);
        expect(seriesOf(options)[0].data.map((point) => point.land_id)).toEqual(['03', '06', '11', '53', '75', '84', '94']);
    });

    it('ajoute les cercles proportionnels, au diamètre que donne la scène à la création', () => {
        const options = optionsOf(france('conso_ha'), { numberedInsets: false, symbolMaxSize: 38 });

        expect(seriesTypes(options)).toEqual(['map', 'mapline', 'mapbubble', 'mappoint']);
        expect(seriesOf(options)[2].maxSize).toBe(38);
    });

    it('ne dessine rien pour un cadre carroyé, que Highcharts n’affiche pas', () => {
        expect(buildChartOptions(france('conso_ha_gridded'), LARGE, handlers())).toBeNull();
    });
});

describe('carte en anneaux', () => {
    const RINGS = artif('artif_desartif_ha');
    // Graphique tel que Highcharts le donne au gestionnaire de rendu : le graphique affiché, ou sa
    // copie pour l'image exportée
    const chartOf = (forExport: boolean): Highcharts.Chart => ({ renderer: { forExport } }) as unknown as Highcharts.Chart;
    const renderEvent = (options: Highcharts.Options) => options.chart.events.render as unknown as (this: Highcharts.Chart) => void;

    beforeEach(() => jest.mocked(renderRings).mockClear());

    it('laisse les territoires sur leur fond neutre, sans série de cercles ni classes de couleurs', () => {
        const options = optionsOf(RINGS, { numberedInsets: false, symbolMaxSize: 64 });

        expect(seriesTypes(options)).toEqual(['map', 'mapline', 'mappoint']);
        expect(options.colorAxis).toBeUndefined();
        expect(seriesOf(options)[0].borderColor).toBe(seriesOf(optionsOf(artif('artif_net_ha'), { numberedInsets: false, symbolMaxSize: 64 }))[0].borderColor);
        expect(exported(options).legend.enabled).toBe(false);
    });

    it('redessine les anneaux à chaque rendu du graphique, au diamètre que donne la scène à la création', () => {
        const options = optionsOf(RINGS, { numberedInsets: false, symbolMaxSize: 38 });
        const chart = chartOf(false);
        renderEvent(options).call(chart);
        renderEvent(options).call(chart);

        expect(jest.mocked(renderRings).mock.calls).toEqual([
            [chart, RINGS.render, 38],
            [chart, RINGS.render, 38],
        ]);
    });

    it('donne aux anneaux de l’image exportée le diamètre d’une grande carte, quelle que soit la scène', () => {
        const options = optionsOf(RINGS, { numberedInsets: true, symbolMaxSize: 26 });
        const copy = chartOf(true);
        renderEvent(options).call(copy);

        // Sept territoires : 64 px pour le plus grand symbole d'une grande carte
        expect(jest.mocked(renderRings).mock.calls).toEqual([[copy, RINGS.render, 64]]);
    });

    it('laisse le survol et le clic aux territoires : leur infobulle dit les deux flux, leur clic ouvre leur zone', () => {
        const pointHandlers = handlers();
        const options = optionsOf(RINGS, { numberedInsets: false, symbolMaxSize: 64 }, pointHandlers);
        const corse = { options: { ...seriesOf(options)[0].data.find((point) => point.land_id === '94') } };
        eventsOf(options, 'map').click({ point: corse });
        eventsOf(options, 'map').mouseOver({ target: corse });

        expect(pointHandlers.onLandClick.mock.calls).toEqual([['REGION_94', 'Corse']]);
        expect(plain(pointHandlers.onLandHover.mock.calls[0][0].valueText)).toBe(
            '+52 ha artificialisés, −544 ha désartificialisés<br/>soit −491 ha nets entre le millésime n°1 (2019) et le millésime n°2 (2021)',
        );
        const tip = tooltipOf(options, corse);
        expect(partOf(tip, 'value')).toBe('+52 ha artificialisés, −544 ha désartificialisés');
        expect(partOf(tip, 'context')).toBe('soit −491 ha nets entre le millésime n°1 (2019) et le millésime n°2 (2021)');
    });

    it('n’écoute les rendus du graphique que pour une carte en anneaux', () => {
        expect(optionsOf(france('conso_ha'), { numberedInsets: false, symbolMaxSize: 64 }).chart.events.render).toBeUndefined();
        expect(optionsOf(artif('artif_net_pct_surface')).chart.events.render).toBeUndefined();
        expect('render' in optionsOf(france('conso_pct_surface')).chart.events).toBe(false);
    });
});

describe('territoires d’outre-mer rapprochés de l’Hexagone', () => {
    const labels = (options: Highcharts.Options): Series => seriesOf(options)[2];

    it('sont nommés au-dessus de leur cartouche sur une grande carte', () => {
        const options = optionsOf(france('conso_pct_surface'));

        expect(labels(options).data.map((label) => label.name)).toEqual(['Mayotte', 'Guyane']);
        expect(labels(options).data[0].geometry.coordinates).toEqual([250_000, 100_000]);
        // De la place en haut et à gauche, où les noms débordent de la carte
        expect(options.mapView.padding).toEqual([12, 4, 4, 16]);
    });

    it('sont numérotés à gauche de leur cartouche sur une petite carte, qui ne garde de place qu’à gauche', () => {
        const options = optionsOf(france('conso_pct_surface'), SMALL);

        expect(labels(options).data.map((label) => label.name)).toEqual(['1', '2']);
        expect(labels(options).data[0].geometry.coordinates).toEqual([200_000, 50_000]);
        expect(options.mapView.padding).toEqual([4, 4, 4, 18]);
    });

    it('n’ont ni nom ni numéro hors de la France entière, où la carte ne leur garde aucune place', () => {
        const small = optionsOf(bretagne('conso_pct_surface'), SMALL);
        const large = optionsOf(bretagne('conso_pct_surface'));

        expect(labels(small).data).toEqual([]);
        expect(small.mapView.padding).toEqual([4, 4, 4, 4]);
        expect(large.mapView.padding).toEqual([4, 4, 4, 4]);
    });

    it('donnent aux autres moteurs les mêmes marges, comptées depuis le bord de la scène : celles de la vue plus celle du graphique', () => {
        const { base } = france('conso_pct_surface');

        expect(stagePadding(base, false)).toEqual({ top: 20, right: 12, bottom: 12, left: 24 });
        expect(stagePadding(base, true)).toEqual({ top: 12, right: 12, bottom: 12, left: 26 });
        expect(stagePadding(bretagne('conso_pct_surface').base, true)).toEqual({ top: 12, right: 12, bottom: 12, left: 12 });
    });

    it('laissent à l’image exportée ses propres marges, plus larges que celles de la page', () => {
        const options = optionsOf(france('conso_pct_surface'));

        expect(options.chart.spacing).toEqual([8, 8, 8, 8]);
        expect(exported(options).chart.spacing).toEqual([24, 24, 24, 24]);
    });
});

describe('clic et survol', () => {
    const bretagnePoint = { options: { land_id: '53', name: 'Bretagne', zone: 'REGION_53', valueText: '0,83 % de 2011 à 2024', legendKey: 3 } };

    it('invite à cliquer un territoire qui ouvre sa zone, et lui donne un curseur de lien', () => {
        const options = optionsOf(france('conso_ha'), { numberedInsets: false, symbolMaxSize: 64 });

        expect(partOf(tooltipOf(options, bretagnePoint), 'hint')).toBe(OPEN_HINT);
        expect([seriesOf(options)[0].cursor, seriesOf(options)[2].cursor]).toEqual(['pointer', 'pointer']);
    });

    it('transmet la zone et le nom du territoire cliqué, et ceux du cercle cliqué', () => {
        const pointHandlers = handlers();
        const options = optionsOf(france('conso_ha'), { numberedInsets: false, symbolMaxSize: 64 }, pointHandlers);
        eventsOf(options, 'map').click({ point: bretagnePoint });
        eventsOf(options, 'mapbubble').click({ point: bretagnePoint });

        expect(pointHandlers.onLandClick.mock.calls).toEqual([
            ['REGION_53', 'Bretagne'],
            ['REGION_53', 'Bretagne'],
        ]);
    });

    it('ne rend pas les communes cliquables : curseur par défaut, pas d’invitation, clic sans effet', () => {
        const pointHandlers = handlers();
        const options = optionsOf(communes(france('conso_ha')), { numberedInsets: false, symbolMaxSize: 64 }, pointHandlers);
        eventsOf(options, 'map').click({ point: bretagnePoint });

        expect(partOf(tooltipOf(options, bretagnePoint), 'hint')).toBeNull();
        expect([seriesOf(options)[0].cursor, seriesOf(options)[2].cursor]).toEqual(['default', 'default']);
        expect(pointHandlers.onLandClick).not.toHaveBeenCalled();
    });

    it('écrit l’infobulle dans la grammaire de toutes les cartes : le nom, la valeur, puis son contexte', () => {
        const tip = tooltipOf(optionsOf(france('conso_pct_surface')), bretagnePoint);

        expect([partOf(tip, 'title'), partOf(tip, 'value'), partOf(tip, 'context')]).toEqual(['Bretagne', '0,83 %', 'de 2011 à 2024']);
    });

    it('donne à l’infobulle la pastille de la classe du territoire, sur une carte en aplats seulement', () => {
        const swatchOf = (frame: MapFrame): HTMLElement | null => {
            const options = optionsOf(frame, { numberedInsets: false, symbolMaxSize: 64 });
            const valued = seriesOf(options)[0].data.find((point) => (point as { value?: number | null }).value !== null);
            return tooltipOf(options, { options: valued }).querySelector<HTMLElement>(`.${TIP_CLASS}__swatch`);
        };

        expect(swatchOf(france('conso_pct_surface')).style.backgroundColor).toMatch(/^rgb/);
        // Carte en cercles : le fond du territoire est neutre
        expect(swatchOf(france('conso_ha'))).toBeNull();
    });

    it('laisse Highcharts placer la bulle au-dessus du pointeur, sans son cadre ni son retard', () => {
        const { tooltip } = optionsOf(france('conso_pct_surface'));

        expect(tooltip).toMatchObject({ useHTML: true, followPointer: true, animation: false, backgroundColor: 'transparent', borderWidth: 0, shadow: false, padding: 0 });
    });

    describe('au doigt', () => {
        it('lit le territoire touché au lieu de l’ouvrir, et ne dessine pas d’infobulle', () => {
            const pointHandlers = handlers(true);
            const options = optionsOf(france('conso_pct_surface'), LARGE, pointHandlers);
            eventsOf(options, 'map').click({ point: bretagnePoint });

            expect(pointHandlers.onLandRead.mock.calls).toEqual([['53']]);
            expect(pointHandlers.onLandClick).not.toHaveBeenCalled();
            expect(tooltipOf(options, bretagnePoint)).toBeNull();
        });

        it('lit aussi une commune, qu’aucun clic n’ouvre', () => {
            const pointHandlers = handlers(true);
            eventsOf(optionsOf(communes(france('conso_pct_surface')), LARGE, pointHandlers), 'map').click({ point: bretagnePoint });

            expect(pointHandlers.onLandRead.mock.calls).toEqual([['53']]);
        });

        it('ferme la lecture par un appui hors des territoires, que la souris ignore', () => {
            const touch = handlers(true);
            const mouse = handlers();
            (optionsOf(france('conso_pct_surface'), LARGE, touch).chart.events.click as () => void)();
            (optionsOf(france('conso_pct_surface'), LARGE, mouse).chart.events.click as () => void)();

            expect(touch.onLandRead.mock.calls).toEqual([[null]]);
            expect(mouse.onLandRead).not.toHaveBeenCalled();
        });
    });

    it('signale le territoire survolé, puis que le pointeur l’a quitté', () => {
        const pointHandlers = handlers();
        const events = eventsOf(optionsOf(france('conso_pct_surface'), LARGE, pointHandlers), 'map');
        events.mouseOver({ target: bretagnePoint });
        events.mouseOut();

        expect(pointHandlers.onLandHover.mock.calls).toEqual([[bretagnePoint.options], [null]]);
    });
});

describe('diamètre des cercles d’un graphique déjà créé', () => {
    type FakeSeries = { type: string; options: { maxSize?: number }; update: jest.Mock };
    const fakeSeries = (type: string, maxSize?: number): FakeSeries => ({ type, options: { maxSize }, update: jest.fn() });
    const chartOf = (...series: FakeSeries[]): Highcharts.Chart => ({ series }) as unknown as Highcharts.Chart;

    it('est appliqué à la seule série des cercles', () => {
        const lands = fakeSeries('map');
        const circles = fakeSeries('mapbubble', 64);
        applySymbolMaxSize(chartOf(lands, fakeSeries('mapline'), circles, fakeSeries('mappoint')), 58);

        expect(circles.update.mock.calls).toEqual([[{ type: 'mapbubble', maxSize: 58 }]]);
        expect(lands.update).not.toHaveBeenCalled();
    });

    it('ne redessine rien quand les cercles ont déjà ce diamètre', () => {
        const circles = fakeSeries('mapbubble', 58);
        applySymbolMaxSize(chartOf(fakeSeries('map'), circles), 58);

        expect(circles.update).not.toHaveBeenCalled();
    });

    it('ne fait rien sur une carte sans cercles', () => {
        const lands = fakeSeries('map');
        applySymbolMaxSize(chartOf(lands, fakeSeries('mapline'), fakeSeries('mappoint')), 58);

        expect(lands.update).not.toHaveBeenCalled();
    });

    it('est aussi donné au calque des anneaux, qui le prend s’il en dessine', () => {
        const chart = chartOf(fakeSeries('map'), fakeSeries('mapline'), fakeSeries('mappoint'));
        jest.mocked(resizeRings).mockClear();
        applySymbolMaxSize(chart, 58);

        expect(jest.mocked(resizeRings).mock.calls).toEqual([[chart, 58]]);
    });
});

describe('identité', () => {
    it('remet à Highcharts les gestionnaires reçus, sans rien retenir d’un appel à l’autre', () => {
        const frame = france('conso_pct_surface');
        const first = handlers();
        const second = handlers();
        eventsOf(optionsOf(frame, LARGE, first), 'map').mouseOut();
        eventsOf(optionsOf(frame, LARGE, second), 'map').mouseOut();

        expect(first.onLandHover).toHaveBeenCalledTimes(1);
        expect(second.onLandHover).toHaveBeenCalledTimes(1);
    });
});

describe('territoire cerné', () => {
    // Tracé d'un territoire dans le SVG du graphique, entre deux voisins
    const drawn = () => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const [before, land, after] = ['a', 'b', 'c'].map((name) => {
            const path = group.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
            path.setAttribute('d', `M0 0L1 1 ${name}`);
            path.setAttribute('class', 'highcharts-point');
            return path;
        });
        const point = { graphic: { element: land, toFront: () => group.appendChild(land) }, series: { type: 'map' }, options: { land_id: '53', name: 'Bretagne', valueText: '', legendKey: null as number | null } };
        return { group, before, land, after, point };
    };
    const halos = (group: SVGElement): Element[] => [...group.children].filter((child) => child.getAttribute('class') === 'national-map-land-halo');

    it('passe devant ses voisins, sur un liseré clair qui reprend son tracé, retiré ensuite', () => {
        const { group, before, land, after, point } = drawn();
        const drop = outlineLand(point as unknown as Highcharts.Point);

        const [halo] = halos(group);
        expect([...group.children]).toEqual([before, after, halo, land]);
        expect(halo.getAttribute('d')).toBe(land.getAttribute('d'));

        drop();

        expect(halos(group)).toEqual([]);
        expect(group.contains(land)).toBe(true);
    });

    it('ne fait rien pour un point sans tracé', () => {
        expect(() => outlineLand(undefined)()).not.toThrow();
        expect(() => outlineLand({ graphic: undefined } as unknown as Highcharts.Point)()).not.toThrow();
    });

    it('suit le survol : le liseré passe d’un territoire à l’autre et disparaît quand le pointeur quitte la carte', () => {
        const first = drawn();
        const second = drawn();
        const events = eventsOf(optionsOf(france('conso_pct_surface')), 'map');
        events.mouseOver({ target: first.point });
        events.mouseOver({ target: second.point });

        expect(halos(first.group)).toHaveLength(0);
        expect(halos(second.group)).toHaveLength(1);

        events.mouseOut();

        expect(halos(second.group)).toHaveLength(0);
    });

    it('laisse aux cercles leur propre liseré', () => {
        const { group, point } = drawn();
        eventsOf(optionsOf(france('conso_ha'), { numberedInsets: false, symbolMaxSize: 64 }), 'mapbubble').mouseOver({ target: Object.assign({}, point, { series: { type: 'mapbubble' } }) });

        expect(halos(group)).toEqual([]);
    });
});
