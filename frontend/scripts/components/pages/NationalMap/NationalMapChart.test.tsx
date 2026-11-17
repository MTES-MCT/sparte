import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { NationalMapBaseMap, NationalMapValues } from '@services/api';
import NationalMapChart from './NationalMapChart';
import { ZONE_FRANCE, ZONE_HEXAGONE } from './zones';
import type { ViewError } from './domain/frame/buildFrame';
import type { MapFrame } from './domain/frame/types';
import { LandHighlight, createLandHighlight } from './domain/landHighlight';
import { COMMUNES_CONSO_EVOLUTION, COMMUNES_CONSO_HA, COMMUNES_CONSO_SHARE } from './__fixtures__/communesFixtures';
import { chartStub, communesStub, gridStub } from './__fixtures__/engineStubs';
import { resizeObserverStub } from './__fixtures__/resizeObserverStub';
import { artifFrame, communesFrame, consoFrame } from './__fixtures__/frames';
import {
    ARTIF_FRANCE_BY_REGION,
    BRETAGNE_BY_DEPARTEMENT,
    CONSO_BRETAGNE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_DEPARTEMENT,
    CONSO_FRANCE_BY_REGION,
    CONSO_FRANCE_BY_REGION_IN_2024,
    CONSO_MAYOTTE_BY_EPCI,
    FRANCE_BY_DEPARTEMENT,
    FRANCE_BY_REGION,
    MAYOTTE_BY_EPCI,
    RHONE_BY_EPCI,
} from './__fixtures__/nationalMapFixtures';

jest.mock('highcharts-react-official', () => jest.requireActual('./__fixtures__/engineStubs').highchartsReactModule);
jest.mock('./GriddedMap', () => jest.requireActual('./__fixtures__/engineStubs').griddedMapModule);
jest.mock('./components/stage/CommunesCanvas', () => jest.requireActual('./__fixtures__/engineStubs').communesCanvasModule);

type View = {
    frame: MapFrame | null;
    staged?: MapFrame | null;
    pending?: boolean;
    error?: ViewError | null;
    onStagedPainted?: (frameKey: string) => void;
    highlight?: LandHighlight;
};

// La carte telle que la page la monte
const chartElement = ({ frame, staged = null, pending = false, error = null, onStagedPainted, highlight }: View) => (
    <NationalMapChart frame={frame} staged={staged} pending={pending} error={error} targetName="Bretagne" onStagedPainted={onStagedPainted} highlight={highlight} />
);

const france = (indicatorId: string, conso = CONSO_FRANCE_BY_REGION): MapFrame => consoFrame(ZONE_FRANCE, FRANCE_BY_REGION, indicatorId, conso);

const NO_VIEW: View = { frame: null, pending: true };
const CHOROPLETH: View = { frame: france('conso_pct_surface') };
const CHOROPLETH_IN_2024: View = { frame: france('conso_pct_surface', CONSO_FRANCE_BY_REGION_IN_2024) };
const SYMBOLS: View = { frame: france('conso_ha') };
const BIVARIATE: View = { frame: france('bivariate_habitat_menages') };
const GRID: View = { frame: france('conso_ha_gridded') };
const DIVERGING: View = { frame: artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'artif_net_pct_surface', ARTIF_FRANCE_BY_REGION) };
const SIGNED_SYMBOLS: View = { frame: artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'artif_net_ha', ARTIF_FRANCE_BY_REGION) };
const RINGS: View = { frame: artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'artif_desartif_ha', ARTIF_FRANCE_BY_REGION) };

// Toutes les communes d'une zone nationale, sur le fond et les chiffres clés des départements
const dense = (indicatorId: string, values: NationalMapValues = COMMUNES_CONSO_SHARE, zone = ZONE_FRANCE): MapFrame =>
    communesFrame(zone, indicatorId, values, { base: FRANCE_BY_DEPARTEMENT, conso: CONSO_FRANCE_BY_DEPARTEMENT });
const DENSE: View = { frame: dense('conso_pct_surface') };
const DENSE_IN_HECTARES: View = { frame: dense('conso_ha', COMMUNES_CONSO_HA) };
const DENSE_EVOLUTION: View = { frame: dense('conso_evolution_between_periods', COMMUNES_CONSO_EVOLUTION) };
const DENSE_HEXAGONE: View = { frame: dense('conso_pct_surface', COMMUNES_CONSO_SHARE, ZONE_HEXAGONE) };

// Les nombres sont formatés avec des espaces insécables, étroites pour les milliers
const plain = (text: string | null): string => (text ?? '').replace(/[\u00a0\u202f]/g, ' ');

// Légende posée sur la carte
const legend = (): HTMLElement => screen.getByRole('region', { name: 'Légende de la carte' });
const legendTitle = (): string => plain(within(legend()).getByRole('heading', { level: 2 }).textContent);
const legendMethod = (): string => plain(legend().querySelector('details p')?.textContent ?? null);

// Lignes d'une légende de classes : libellé, puis effectif entre parenthèses comme à l'écran
// (les parenthèses viennent de la feuille de style)
const classRows = (): string[] =>
    within(legend())
        .getAllByRole('listitem')
        .map((item) => {
            const text = plain(item.textContent);
            const count = item.querySelector('span:not([aria-hidden])')?.textContent ?? '';
            return `${text.slice(0, text.length - count.length)} (${count})`;
        });

const classButtons = (): HTMLElement[] => within(within(legend()).getByRole('list', { name: 'Classes de valeurs' })).getAllByRole('button');

// Classe épinglée dans la légende, null si aucune
const pinnedClass = (): number | null => {
    const index = classButtons().findIndex((button) => button.getAttribute('aria-pressed') === 'true');
    return index < 0 ? null : index;
};

// Classes mises en avant dans la légende : leur pastille est agrandie
const activeClasses = (): number[] =>
    classButtons().flatMap((button, index) => (getComputedStyle(button.querySelector('span[aria-hidden]')).transform === 'scale(1.08)' ? [index] : []));

// Cases de la légende d'une carte bivariée, ligne par ligne, et celles qui sont mises en avant (agrandies)
const cellButtons = (): HTMLElement[] => within(within(legend()).getByRole('group', { name: 'Classes croisées' })).getAllByRole('button');
const activeCells = (): number[] => cellButtons().flatMap((cell, index) => (getComputedStyle(cell).transform === 'scale(1.12)' ? [index] : []));

type LandPoint = { land_id: string; value: number | null; color?: string; valueText: string; legendKey: number | null };
const landPoints = (): LandPoint[] => (chartStub.options().series[0] as unknown as { data: LandPoint[] }).data;

// Territoires que la mise en avant d'une classe doit estomper : ceux des autres classes
const landsOutsideClass = (classIndex: number | null): string[] =>
    classIndex === null ? [] : landPoints().filter((point) => point.legendKey !== classIndex).map((point) => point.land_id);

// Bande réservée à la légende en haut de la scène, ou colonne réservée à sa gauche, en pixels ;
// null si rien n'y est réservé
const legendBand = (): string | null => document.querySelector('[data-legend-band]')?.getAttribute('data-legend-band') ?? null;
const legendSide = (): string | null => document.querySelector('[data-legend-side]')?.getAttribute('data-legend-side') ?? null;

// Calque de la carte Highcharts, qui porte son atténuation
const chartLayer = (): HTMLElement => screen.getByTestId('highcharts-map').parentElement;

// Donne au cadre de la carte la taille qu'il aurait à l'écran : jsdom ne calcule aucune mise en page
const measureStageAs = (width: number, height: number): jest.SpyInstance =>
    jest
        .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
        .mockReturnValue({ width, height, x: 0, y: 0, top: 0, left: 0, right: width, bottom: height, toJSON: () => ({}) });

// Colonne à droite de la carte, et note de la carte, qui s'y trouve sous les chiffres clés
const aside = (): HTMLElement => screen.getByRole('complementary', { name: 'Chiffres clés et graphiques' });
const footnote = (): string => plain(within(aside()).getByText(/^(Les données de consommation|Carroyage de 1 km|Source : OCS GE)/).textContent);

// Options remises à Highcharts, sous une forme comparable d'une version du code à l'autre : sans
// leurs fonctions (gestionnaires de survol et de clic), avec des espaces ordinaires, et avec les
// identifiants des territoires à la place de leurs géométries
const comparable = (value: unknown): unknown => {
    if (typeof value === 'string') return plain(value);
    if (Array.isArray(value)) return value.map(comparable);
    if (value === null || typeof value !== 'object') return value;
    return Object.fromEntries(
        Object.entries(value)
            .filter(([, entry]) => typeof entry !== 'function')
            .map(([key, entry]) => [key, comparable(entry)]),
    );
};

const comparableOptions = (): unknown => {
    const options = chartStub.options();
    const { features } = options.chart.map as unknown as NationalMapBaseMap['geojson'];
    return comparable({ ...options, chart: { ...options.chart, map: features.map((feature) => feature.properties.land_id) } });
};

beforeEach(() => {
    chartStub.reset();
    gridStub.reset();
    communesStub.reset();
});

describe('carte en aplat de couleur', () => {
    it('pose sur la carte la légende des classes de Jenks, avec leurs effectifs', () => {
        render(chartElement(CHOROPLETH));

        expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(classRows()).toEqual(["Jusqu'à 0,02 % (2)", 'De 0,02 à 0,33 % (1)', 'De 0,33 à 0,55 % (2)', 'De 0,55 à 0,83 % (1)', 'Plus de 0,83 % (1)']);
        expect(legendMethod()).toBe('Classes par seuils naturels (méthode de Jenks), calculées sur les territoires affichés.');
    });

    it('signale dans la colonne le territoire sans donnée et les collectivités absentes de la France entière', () => {
        render(chartElement(CHOROPLETH));

        expect(footnote()).toBe(
            "Les données de consommation d'espaces ne sont pas disponibles pour Mayotte (en gris sur la carte), ni pour " +
                'Saint-Pierre-et-Miquelon, Saint-Barthélemy, Saint-Martin, Wallis-et-Futuna, la Polynésie française, la Nouvelle-Calédonie ' +
                'et les Terres australes et antarctiques françaises, qui ne figurent pas sur la carte.',
        );
    });

    it('remet à Highcharts un point par territoire et les classes de couleurs', () => {
        render(chartElement(CHOROPLETH));

        expect(comparableOptions()).toMatchSnapshot();
    });

    it('explique dans la légende le trait de la limite du département, quand le fond en porte une', () => {
        render(chartElement({ frame: consoFrame('DEPART_69', RHONE_BY_EPCI, 'conso_pct_surface', CONSO_MAYOTTE_BY_EPCI) }));

        const key = within(legend()).getByText('Limite du département');
        // L'échantillon reprend le tireté de la carte
        expect(key.querySelector('line[stroke-dasharray]')).not.toBeNull();
    });

    it('ne parle pas de limite dans la légende d’un fond qui n’en porte pas', () => {
        render(chartElement(CHOROPLETH));

        expect(within(legend()).queryByText(/^Limite d/)).not.toBeInTheDocument();
    });

    it('nomme les territoires sans donnée d’une zone qui n’est pas la France entière', () => {
        render(chartElement({ frame: consoFrame('REGION_06', MAYOTTE_BY_EPCI, 'conso_pct_surface', CONSO_MAYOTTE_BY_EPCI) }));

        expect(footnote()).toBe(
            "Les données de consommation d'espaces ne sont pas disponibles pour CA de Dembeni / Mamoudzou, CC de Petite-Terre (en gris sur la carte).",
        );
    });

    it('ne signale rien pour une région dont tous les territoires ont des données', () => {
        render(chartElement({ frame: consoFrame('REGION_53', BRETAGNE_BY_DEPARTEMENT, 'conso_pct_surface', CONSO_BRETAGNE_BY_DEPARTEMENT) }));

        expect(screen.queryByText(/^Les données de consommation/)).toBeNull();
    });
});

describe('carte en aplat divergent', () => {
    it('sépare les baisses des hausses à zéro et compte à part les territoires sans donnée', () => {
        render(chartElement(DIVERGING));

        expect(legendTitle()).toBe('Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)');
        expect(classRows()).toEqual(["Jusqu'à 0 % (2)", 'De 0 à +0,11 % (2)', 'De +0,11 à +0,16 % (1)', 'Plus de +0,16 % (1)', 'Donnée non disponible (1)']);
        expect(legendMethod()).toBe(
            'Classes par seuils naturels (méthode de Jenks), calculées de part et d’autre de zéro sur les territoires affichés.',
        );
    });

    it('affiche dans la colonne la note de la source OCS GE, à la place de celle de la consommation', () => {
        render(chartElement(DIVERGING));

        expect(footnote()).toMatch(/^Source : OCS GE \(IGN\)\. Évolution mesurée entre le millésime n°1 \(2017 à 2020\) et le millésime n°2 \(2020 à 2023\)\./);
        expect(screen.queryByText(/^Les données de consommation/)).toBeNull();
    });

    it('remet à Highcharts les classes bleues et orangées et le millésime de chaque territoire', () => {
        render(chartElement(DIVERGING));

        expect(comparableOptions()).toMatchSnapshot();
    });
});

describe('carte en cercles proportionnels', () => {
    it('pose sur la carte les cercles de référence, aux valeurs rondes', () => {
        render(chartElement(SYMBOLS));

        expect(legendTitle()).toBe("Consommation d'ENAF (en hectares)");
        expect(plain(within(legend()).getByRole('img').getAttribute('aria-label'))).toBe('Cercles de référence : 20 000 ha, 10 000 ha, 2 000 ha');
        expect(within(legend()).queryByText('Donnée non disponible')).toBeNull();
    });

    it('laisse les territoires sur un fond neutre, sans classes de couleurs', () => {
        render(chartElement(SYMBOLS));

        expect(chartStub.options().colorAxis).toBeUndefined();
        expect(new Set(landPoints().map((point) => point.color))).toEqual(new Set(['#eeeef8']));
    });
});

describe('carte en cercles d’une valeur signée', () => {
    it('compte dans la légende le territoire sans donnée', () => {
        render(chartElement(SIGNED_SYMBOLS));

        expect(legendTitle()).toBe('Artificialisation nette entre les deux derniers millésimes (en hectares)');
        expect(plain(within(legend()).getByRole('img').getAttribute('aria-label'))).toBe('Cercles de référence : 5 000,0 ha, 2 000,0 ha, 200,0 ha');
        expect(within(legend()).getByText('Donnée non disponible')).toHaveTextContent('Donnée non disponible(1)');
    });

    it('remet à Highcharts des cercles à la taille de la valeur absolue, rouges ou bleus selon le signe', () => {
        render(chartElement(SIGNED_SYMBOLS));

        expect(comparableOptions()).toMatchSnapshot();
    });
});

describe('carte en anneaux', () => {
    it('pose sur la carte les anneaux de référence, les deux couleurs nommées et ce qu’il faut savoir pour les lire', () => {
        render(chartElement(RINGS));

        expect(legendTitle()).toBe('Artificialisation et désartificialisation entre les deux derniers millésimes (en hectares)');
        expect(plain(within(legend()).getByRole('img').getAttribute('aria-label'))).toBe('Anneaux de référence : 10 000 ha, 2 000 ha, 500 ha');
        expect(within(within(legend()).getByRole('list', { name: 'Couleurs des anneaux' })).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
            'Artificialisation',
            'Désartificialisation',
        ]);
        expect(within(legend()).getByText('Sous 12 px, un disque plein de la couleur du flux le plus fort')).toBeInTheDocument();
        expect(within(legend()).getByText('Donnée non disponible')).toHaveTextContent('Donnée non disponible(1)');
        expect(legendMethod()).toMatch(/^La surface de chaque anneau est proportionnelle au flux brut du territoire/);
    });

    it('montre un anneau témoin aux deux couleurs des arcs, et des anneaux de référence neutres', () => {
        render(chartElement(RINGS));
        const sample = [...legend().querySelectorAll('svg[aria-hidden="true"] path')].map((arc) => arc.getAttribute('fill'));
        const references = [...within(legend()).getByRole('img').querySelectorAll('circle')].map((circle) => circle.getAttribute('stroke'));

        expect(sample).toEqual(['#b2182b', '#2166ac']);
        expect(new Set(references)).toEqual(new Set(['#666666']));
    });

    it('ne nomme aucune couleur et n’ajoute rien à la légende d’une carte en cercles', () => {
        render(chartElement(SIGNED_SYMBOLS));

        expect(within(legend()).queryByRole('list', { name: 'Couleurs des anneaux' })).toBeNull();
        expect(within(legend()).queryByText(/Sous 12 px/)).toBeNull();
    });

    it('laisse les territoires sur un fond neutre, sans classes de couleurs ni série de cercles', () => {
        render(chartElement(RINGS));

        expect(chartStub.options().colorAxis).toBeUndefined();
        expect(new Set(landPoints().map((point) => point.color))).toEqual(new Set(['#eeeef8', '#dcdcdc']));
        expect(chartStub.options().series.map((series) => series.type)).toEqual(['map', 'mapline', 'mappoint']);
    });

    it('affiche dans la colonne les deux flux bruts à la suite des chiffres clés des cartes de flux, et la note de l’OCS GE', () => {
        render(chartElement(RINGS));
        const figures = within(aside()).getByLabelText('Chiffres clés');

        expect(plain(figures.textContent)).toMatch(
            /\+22 429 haArtificialisation nette.*\+7 132 ha\/anRythme annuel moyen.*28 063 haSurfaces artificialisées.*5 634 haSurfaces désartificialisées/,
        );
        expect(footnote()).toMatch(/^Source : OCS GE \(IGN\)\. Évolution mesurée entre le millésime n°1 /);
        expect(footnote()).not.toMatch(/cercles/i);
    });

    it('remet à Highcharts des territoires qui portent leurs deux flux, et de quoi redessiner les anneaux à chaque rendu', () => {
        render(chartElement(RINGS));

        expect(typeof chartStub.options().chart.events.render).toBe('function');
        expect(comparableOptions()).toMatchSnapshot();
    });
});

describe('carte bivariée', () => {
    it('pose sur la carte la grille des neuf couleurs et le sens de ses deux axes', () => {
        render(chartElement(BIVARIATE));

        expect(legendTitle()).toBe("Rythme annuel de consommation pour l'habitat et évolution des ménages");
        expect(within(legend()).getByText("Consommation annuelle pour l'habitat (%)")).toBeInTheDocument();
        expect(within(legend()).getByText('Évolution du nombre de ménages (%)')).toBeInTheDocument();
        expect(cellButtons().map((cell) => cell.getAttribute('aria-label'))).toEqual([
            "Consommation annuelle pour l'habitat parmi les plus faibles, évolution du nombre de ménages parmi les plus faibles",
            "Consommation annuelle pour l'habitat parmi les plus faibles, évolution du nombre de ménages intermédiaire",
            "Consommation annuelle pour l'habitat parmi les plus faibles, évolution du nombre de ménages parmi les plus élevées",
            "Consommation annuelle pour l'habitat intermédiaire, évolution du nombre de ménages parmi les plus faibles",
            "Consommation annuelle pour l'habitat intermédiaire, évolution du nombre de ménages intermédiaire",
            "Consommation annuelle pour l'habitat intermédiaire, évolution du nombre de ménages parmi les plus élevées",
            "Consommation annuelle pour l'habitat parmi les plus élevées, évolution du nombre de ménages parmi les plus faibles",
            "Consommation annuelle pour l'habitat parmi les plus élevées, évolution du nombre de ménages intermédiaire",
            "Consommation annuelle pour l'habitat parmi les plus élevées, évolution du nombre de ménages parmi les plus élevées",
        ]);
    });

    it('donne dans le volet Méthode l’intervalle de chaque niveau des deux taux', () => {
        render(chartElement(BIVARIATE));

        expect([...legend().querySelectorAll('details p span')].map((level) => plain(level.textContent))).toEqual([
            "Consommation annuelle pour l'habitat parmi les plus faibles : [0, 0,019] %",
            "Consommation annuelle pour l'habitat intermédiaire : ]0,019, 0,028] %",
            "Consommation annuelle pour l'habitat parmi les plus élevées : ]0,028, 0,041] %",
            'Évolution du nombre de ménages parmi les plus faibles : [+0,72, +0,67] %',
            'Évolution du nombre de ménages intermédiaire : ]+0,67, +1,14] %',
            'Évolution du nombre de ménages parmi les plus élevées : ]+1,14, +2,52] %',
        ]);
    });

    it('estompe les territoires des autres cases au survol d’une case, et épingle la case cliquée', () => {
        render(chartElement(BIVARIATE));
        fireEvent.mouseEnter(cellButtons()[2]);

        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(2));
        expect(chartStub.dimmedLands()).not.toHaveLength(0);

        fireEvent.mouseLeave(cellButtons()[2]);

        expect(chartStub.dimmedLands()).toEqual([]);

        fireEvent.click(cellButtons()[2]);

        expect(cellButtons()[2]).toHaveAttribute('aria-pressed', 'true');
        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(2));
    });

    it('met en avant la case du territoire survolé sur la carte', () => {
        render(chartElement(BIVARIATE));
        const bretagne = landPoints().find((point) => point.land_id === '53').legendKey;
        act(() => chartStub.hoverLand('53'));

        expect(activeCells()).toEqual([bretagne]);

        act(() => chartStub.hoverLand(null));

        expect(activeCells()).toEqual([]);
    });

    it('remet à Highcharts la couleur de la classe croisée de chaque territoire', () => {
        render(chartElement(BIVARIATE));

        expect(comparableOptions()).toMatchSnapshot();
    });

    it('laisse les territoires en gris quand la période n’a pas de seuils', () => {
        render(chartElement({ frame: france('bivariate_habitat_menages', CONSO_FRANCE_BY_REGION_IN_2024) }));

        expect(landPoints().map(({ color, valueText }) => [color, valueText])).toEqual(landPoints().map(() => ['#dcdcdc', 'Donnée non disponible']));
    });

    it('garde la grille et ses niveaux, sans intervalles, quand la période n’a pas de seuils', () => {
        render(chartElement({ frame: france('bivariate_habitat_menages', CONSO_FRANCE_BY_REGION_IN_2024) }));

        expect(cellButtons()).toHaveLength(9);
        expect([...legend().querySelectorAll('details p span')].map((level) => plain(level.textContent))).toEqual([
            "Consommation annuelle pour l'habitat parmi les plus faibles",
            "Consommation annuelle pour l'habitat intermédiaire",
            "Consommation annuelle pour l'habitat parmi les plus élevées",
            'Évolution du nombre de ménages parmi les plus faibles',
            'Évolution du nombre de ménages intermédiaire',
            'Évolution du nombre de ménages parmi les plus élevées',
        ]);
    });
});

describe('carte des données carroyées', () => {
    it('remet à la carte carroyée les territoires couverts, ses carreaux et les textes de l’export', () => {
        render(chartElement(GRID));

        expect(chartStub.creations.length).toBe(0);
        expect(gridStub.props.render).toBe(GRID.frame.render);
        expect(gridStub.props.render.features.map((feature) => feature.properties.land_id)).toEqual(['11', '53', '75', '84', '94']);
        const { scale, clickable, busy, exportInfo, ariaLabel } = gridStub.props;
        expect({ scale, clickable, busy, exportInfo, ariaLabel }).toEqual({
            scale: 'REGION',
            clickable: true,
            busy: false,
            exportInfo: {
                title: "Consommation d'ENAF (en hectares), données carroyées",
                subtitle: 'France entière · carreaux de 1 km × 1 km · de 2011 à 2024',
                filename: 'carte-france-conso_ha_gridded',
                credits: 'Mon Diagnostic Artificialisation · données Cerema (fichiers fonciers)',
            },
            ariaLabel: "Carte de la zone France entière, indicateur Consommation d'ENAF (en hectares), données carroyées, par carreau de 1 km × 1 km de 2011 à 2024.",
        });
        expect(plain(gridStub.props.render.cells.read({ conso_2011: 12500 }).valueText)).toBe('1,25 ha consommés dans ce carreau de 2011 à 2024');
        expect(gridStub.props.render.cells.texts.empty).toBe('Pas de consommation localisée dans ce carreau de 2011 à 2024');
    });

    it('pose sur la carte la légende des classes fixes, exprimées par km², avec la période', () => {
        render(chartElement(GRID));

        expect(legendTitle()).toBe("Consommation d'ENAF (en hectares), données carroyées");
        expect(within(legend()).getByText('Par km², de 2011 à 2024')).toBeInTheDocument();
        expect(classButtons().map((button) => plain(button.textContent))).toEqual(["Jusqu'à 0,1 ha", 'De 0,1 à 0,5 ha', 'De 0,5 à 1 ha', 'De 1 à 5 ha', 'Plus de 5 ha']);
        expect(legendMethod()).toMatch(/^Classes à bornes fixes.*regroupés en blocs de 2 km ou 5 km de côté, colorés selon leur consommation moyenne par km²\.$/);
    });

    it('met en avant dans la légende la classe du carreau survolé sur la carte', () => {
        render(chartElement(GRID));
        act(() => gridStub.props.onHover({ name: 'Bretagne', valueText: '0,7 ha consommés dans ce carreau de 2011 à 2024', classIndex: 2 }));

        expect(activeClasses()).toEqual([2]);

        act(() => gridStub.props.onHover(null));

        expect(activeClasses()).toEqual([]);
    });

    it('pose l’avis de la carte carroyée sous la bande de la légende ouverte, ou sous le bouton de la légende repliée', () => {
        render(chartElement(GRID));
        act(() => gridStub.reportStatus({ ready: true, notice: "Les données carroyées ne couvrent que l'Hexagone et la Corse." }));
        const notice = screen.getByRole('status');

        expect(notice).toHaveTextContent("Les données carroyées ne couvrent que l'Hexagone et la Corse.");
        expect(document.querySelector('[data-legend-band]')).toContainElement(notice);
        expect(notice).toHaveStyle({ top: '1rem' });

        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));

        expect(screen.getByRole('status')).toHaveStyle({ top: '3rem' });
    });

    it('explique dans la colonne la couverture du carroyage et l’absence des régions d’outre-mer', () => {
        render(chartElement(GRID));

        expect(footnote()).toBe(
            "Carroyage de 1 km × 1 km de la consommation d'espaces (Cerema, fichiers fonciers), disponible pour l'Hexagone et la Corse. " +
                'Seule la consommation qui a pu être géolocalisée y figure : la somme des carreaux peut différer du total du territoire. ' +
                'Un carreau à cheval sur plusieurs territoires est affiché en entier. ' +
                "Les régions d'outre-mer, absentes du carroyage, ne figurent pas sur cette vue : elles restent accessibles par le sélecteur de zone.",
        );
    });
});

describe('carte des sols artificialisés par maille', () => {
    const SOILS: View = { frame: artifFrame(ZONE_FRANCE, FRANCE_BY_REGION, 'artif_pct_gridded', ARTIF_FRANCE_BY_REGION) };
    // La carte annonce ce qu'elle dessine : l'image de l'IGN, ses mailles (son secours, sous le premier
    // niveau de l'image ou quand elle ne répond pas) ou les objets
    const draws = (stage: 'cells' | 'image' | 'objects'): void => act(() => gridStub.props.onStageChange(stage, gridStub.props.render.image?.key ?? null));
    const objectsDrawn = (shown: boolean): void => draws(shown ? 'objects' : 'cells');

    it('est dessinée par la carte de mailles, avec les chiffres clés des cartes de stock', () => {
        render(chartElement(SOILS));

        expect(chartStub.creations.length).toBe(0);
        expect(gridStub.props.render).toBe(SOILS.frame.render);
        expect(screen.getByLabelText('Chiffres clés')).toHaveTextContent('Part du territoire artificialisée');
        expect(footnote()).toMatch(/^Source : OCS GE \(IGN\)\. Chiffres au millésime n°2 \(2020 à 2023\)\./);
    });

    it('pose d’emblée la légende de l’image de l’IGN, sans passer par celle des mailles', () => {
        render(chartElement(SOILS));

        expect(legendTitle()).toBe('Nature des sols');
        expect(classButtons().map((button) => button.textContent)).toEqual(['Sol artificialisé', 'Sol non artificialisé']);
        expect(within(legend()).getByText("Image de l'OCS GE (IGN). Zoomez pour lire les objets.")).toBeInTheDocument();
        expect(within(legend()).getAllByRole('listitem').map((item) => item.textContent)).toContain('Pas de donnée OCS GE');
        expect(legendMethod()).toMatch(/flux WMTS de la Géoplateforme, génération 2021-2023/);
    });

    it('pose la légende des cinq classes de part artificialisée quand la carte se rabat sur ses mailles', () => {
        render(chartElement(SOILS));
        draws('cells');

        expect(legendTitle()).toBe('Part des sols artificialisés');
        expect(within(legend()).getByText('Par maille. Zoomez pour voir les objets OCS GE.')).toBeInTheDocument();
        expect(classButtons().map((button) => button.textContent)).toEqual(['Moins de 10 %', 'De 10 à 20 %', 'De 20 à 35 %', 'De 35 à 50 %', '50 % et plus']);
        expect(within(legend()).getAllByRole('listitem').map((item) => item.textContent)).toContain('Pas de donnée OCS GE');
    });

    it('épingle une classe de mailles, que la carte met en avant', () => {
        render(chartElement(SOILS));
        draws('cells');
        fireEvent.click(classButtons()[4]);

        expect(pinnedClass()).toBe(4);
        expect(gridStub.props).toMatchObject({ highlightedClass: 4, highlightedDetailClass: null });
    });

    it('dit sur la carte que les objets sont interactifs, tant qu’elle les dessine', () => {
        const HINT = 'Objets interactifs';
        render(chartElement(SOILS));

        expect(screen.queryByText(HINT)).not.toBeInTheDocument();

        objectsDrawn(true);

        expect(screen.getByText(HINT)).toHaveAttribute('role', 'status');

        objectsDrawn(false);

        expect(screen.queryByText(HINT)).not.toBeInTheDocument();
    });

    it('garde sa légende montée et lui fait dire la nature des objets quand la carte les dessine', () => {
        render(chartElement(SOILS));
        const mounted = legend();
        objectsDrawn(true);

        expect(legend()).toBe(mounted);
        expect(legendTitle()).toBe('Nature des sols');
        expect(classButtons().map((button) => button.textContent)).toEqual(['Sol artificialisé', 'Sol non artificialisé']);
        expect(within(legend()).getByText("Objets de l'OCS GE, interactifs : survolez ou touchez un objet pour lire sa nature.")).toBeInTheDocument();
        expect(within(legend()).getAllByRole('listitem').map((item) => item.textContent)).toContain('Pas de donnée OCS GE');
        expect(legendMethod()).toMatch(/^Objets de l'OCS GE \(IGN\) au dernier millésime de leur département/);

        objectsDrawn(false);

        expect(legendTitle()).toBe('Part des sols artificialisés');
        expect(classButtons()).toHaveLength(5);
    });

    it('oublie la classe épinglée quand la légende passe des mailles aux objets : elle n’y aurait pas le même sens', () => {
        render(chartElement(SOILS));
        draws('cells');
        fireEvent.click(classButtons()[1]);
        objectsDrawn(true);

        expect(pinnedClass()).toBeNull();
        expect(gridStub.props).toMatchObject({ highlightedClass: null, highlightedDetailClass: null });

        fireEvent.click(classButtons()[1]);

        expect(gridStub.props).toMatchObject({ highlightedClass: null, highlightedDetailClass: 1 });

        objectsDrawn(false);

        expect(pinnedClass()).toBeNull();
        expect(gridStub.props).toMatchObject({ highlightedClass: null, highlightedDetailClass: null });
    });

    it('met en avant la ligne de l’objet survolé dans la légende des objets', () => {
        render(chartElement(SOILS));
        objectsDrawn(true);
        act(() => gridStub.props.onHover({ name: 'Sol non artificialisé', valueText: 'Couverture : formations herbacées', classIndex: 1 }));

        expect(activeClasses()).toEqual([1]);
    });

    it('revient à la légende des mailles quand une autre carte de mailles prend sa place', () => {
        const { rerender } = render(chartElement(SOILS));
        objectsDrawn(true);
        rerender(chartElement(GRID));

        expect(legendTitle()).toBe("Consommation d'ENAF (en hectares), données carroyées");
        expect(classButtons()).toHaveLength(5);
    });

    it('annonce le chargement de ses mailles, et non de carreaux', () => {
        render(chartElement(SOILS));
        act(() => gridStub.reportStatus({ ready: true, loading: true }));

        expect(screen.getByRole('status')).toHaveTextContent('Chargement des mailles…');
    });

    it('désigne les territoires d’outre-mer par des numéros sur une petite carte, et donne leur clé sous la carte', () => {
        const measured = measureStageAs(360, 320);
        render(chartElement(SOILS));

        expect(gridStub.props.numberedInsets).toBe(true);
        expect(screen.getByText((_, element) => element.textContent === '1 Mayotte · 2 Guyane')).toBeInTheDocument();
        measured.mockRestore();
    });

    it('ne donne pas de clé aux carreaux de la consommation, dessinés sans territoires d’outre-mer', () => {
        const measured = measureStageAs(360, 320);
        render(chartElement(GRID));

        expect(screen.queryByText((_, element) => element.textContent === '1 Mayotte · 2 Guyane')).toBeNull();
        measured.mockRestore();
    });
});

describe('messages de la carte', () => {
    it('annonce le chargement tant que le fond n’est pas arrivé', () => {
        render(chartElement(NO_VIEW));

        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte…');
        expect(chartStub.creations.length).toBe(0);
    });

    it('annonce l’échec du chargement du fond', () => {
        render(chartElement({ ...NO_VIEW, error: 'base-map' }));

        expect(screen.getByText("Le fond de carte n'a pas pu être chargé.")).toBeInTheDocument();
        expect(screen.queryByRole('status')).toBeNull();
    });

    it('annonce l’échec du chargement des données', () => {
        render(chartElement({ ...NO_VIEW, error: 'data' }));

        expect(screen.getByText("Les données de la carte n'ont pas pu être chargées.")).toBeInTheDocument();
    });

    it('atténue la carte affichée pendant le chargement de la suivante, dont elle nomme la zone', () => {
        render(chartElement({ ...CHOROPLETH, pending: true }));

        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : Bretagne…');
        expect(chartLayer()).toHaveStyle({ opacity: '0.5' });
    });

    it('atténue aussi les chiffres clés et la note de la carte affichée, et les signale occupés', () => {
        render(chartElement({ ...CHOROPLETH, pending: true }));
        const slot = screen.getByLabelText('Chiffres clés').parentElement;

        expect(slot).toHaveAttribute('aria-busy', 'true');
        expect(slot).toHaveStyle({ opacity: '0.6' });
        expect(slot).toContainElement(within(aside()).getByText(/^Les données de consommation/));
    });

    it('garde la carte affichée, atténuée, sous l’annonce d’un échec', () => {
        render(chartElement({ ...CHOROPLETH, pending: true, error: 'data' }));

        expect(screen.getByRole('status')).toHaveTextContent("Les données de la carte n'ont pas pu être chargées.");
        expect(chartLayer()).toHaveStyle({ opacity: '0.5' });
        expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
    });
});

describe('créations du graphique', () => {
    it('pose le repère national-map:chart-create à chaque création', () => {
        const mark = jest.spyOn(performance, 'mark');
        const { rerender } = render(chartElement(CHOROPLETH));
        rerender(chartElement(SYMBOLS));

        expect(chartStub.creations.length).toBe(2);
        expect(mark.mock.calls).toEqual([['national-map:chart-create'], ['national-map:chart-create']]);
        mark.mockRestore();
    });

    it('ne pose pas de repère pour la copie du graphique que Highcharts dessine le temps d’un export en image', () => {
        const mark = jest.spyOn(performance, 'mark');
        render(chartElement(CHOROPLETH));
        chartStub.exportCopy();

        expect(mark.mock.calls).toEqual([['national-map:chart-create']]);
        mark.mockRestore();
    });

    it('ne recrée pas le graphique pour un rendu du même cadre', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        rerender(chartElement(CHOROPLETH));

        expect(chartStub.creations.length).toBe(1);
    });

    it('ne recrée pas le graphique quand seul l’état de chargement change', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        rerender(chartElement({ ...CHOROPLETH, pending: true }));

        expect(chartStub.creations.length).toBe(1);
        expect(chartLayer()).toHaveStyle({ opacity: '0.5' });

        rerender(chartElement(CHOROPLETH));

        expect(chartStub.creations.length).toBe(1);
        expect(chartLayer()).toHaveStyle({ opacity: '1' });
    });

    it('ne recrée pas le graphique quand le chargement échoue', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        rerender(chartElement({ ...CHOROPLETH, pending: true }));
        rerender(chartElement({ ...CHOROPLETH, pending: true, error: 'data' }));

        expect(chartStub.creations.length).toBe(1);
    });

    it('crée le graphique exactement une fois par cadre affiché', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        rerender(chartElement({ ...CHOROPLETH, pending: true }));
        rerender(chartElement(DIVERGING));
        rerender(chartElement({ ...DIVERGING, pending: true }));
        rerender(chartElement(SYMBOLS));

        expect(chartStub.creations.length).toBe(3);
    });

    it('ne recrée pas le graphique au survol d’un territoire, dont il met la classe en avant dans la légende', () => {
        render(chartElement(CHOROPLETH));
        act(() => chartStub.hoverLand('53'));

        expect(activeClasses()).toEqual([landPoints().find((point) => point.land_id === '53').legendKey]);

        act(() => chartStub.hoverLand(null));

        expect(activeClasses()).toEqual([]);
        expect(chartStub.creations.length).toBe(1);
    });

    it('ne recrée pas le graphique quand une classe est survolée ou épinglée dans la légende', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.mouseEnter(classButtons()[2]);
        fireEvent.click(classButtons()[2]);
        fireEvent.mouseLeave(classButtons()[2]);
        fireEvent.click(classButtons()[2]);

        expect(chartStub.creations.length).toBe(1);
    });

    it('ne recrée pas le graphique quand la légende est repliée puis rouverte', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));
        fireEvent.click(screen.getByRole('button', { name: 'Légende' }));

        expect(chartStub.creations.length).toBe(1);
    });

    it('ne recrée pas le graphique quand le parent lui remet un autre gestionnaire de clic, et appelle le dernier reçu', () => {
        const first = jest.fn();
        const second = jest.fn();
        const withHandler = (onZoneChange: (zone: string, name?: string) => void) => (
            <NationalMapChart frame={CHOROPLETH.frame} staged={null} pending={false} error={null} targetName="Bretagne" onZoneChange={onZoneChange} />
        );
        const { rerender } = render(withHandler(first));
        rerender(withHandler(second));
        act(() => chartStub.clickLand('53'));

        expect(chartStub.creations.length).toBe(1);
        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledWith('REGION_53', 'Bretagne');
    });

    it('ignore le clic sur un territoire pendant un chargement, sans avoir recréé le graphique', () => {
        const onZoneChange = jest.fn();
        const withPending = (pending: boolean) => (
            <NationalMapChart frame={CHOROPLETH.frame} staged={null} pending={pending} error={null} targetName="Bretagne" onZoneChange={onZoneChange} />
        );
        const { rerender } = render(withPending(false));
        rerender(withPending(true));
        act(() => chartStub.clickLand('53'));

        expect(onZoneChange).not.toHaveBeenCalled();

        rerender(withPending(false));
        act(() => chartStub.clickLand('53'));

        expect(onZoneChange).toHaveBeenCalledTimes(1);
        expect(chartStub.creations.length).toBe(1);
    });
});

describe('relais vers la carte carroyée', () => {
    // La carte carroyée est complète, mais MapLibre n'a pas encore dessiné son fond
    const STAGED: View = { frame: SYMBOLS.frame, staged: GRID.frame, pending: true };

    // Calque de la carte carroyée, qui la masque tant qu'elle se prépare
    const gridLayer = (): HTMLElement => screen.getByRole('img', { name: GRID.frame.ariaLabel, hidden: true }).parentElement;

    it('prépare la carte carroyée, invisible, sous la carte affichée, qui reste avec sa légende et ses chiffres clés', () => {
        render(chartElement(STAGED));

        expect(chartStub.creations.length).toBe(1);
        expect(chartLayer()).toHaveStyle({ opacity: '0.5' });
        expect(legendTitle()).toBe("Consommation d'ENAF (en hectares)");
        expect(screen.getByLabelText('Chiffres clés')).toHaveTextContent("Consommation d'espaces");
        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : Bretagne…');
        expect(gridStub.props.render).toBe(STAGED.staged.render);
        expect(gridLayer()).toHaveStyle({ opacity: '0', 'pointer-events': 'none' });
        expect(gridLayer()).toHaveAttribute('aria-hidden', 'true');
    });

    it('n’affiche ni la légende, ni la note, ni les messages de la carte carroyée tant qu’elle se prépare', () => {
        render(chartElement(STAGED));
        act(() => gridStub.reportStatus({ loading: true }));

        expect(screen.queryByText(/^Par km²/)).toBeNull();
        expect(screen.queryByText(/^Carroyage de 1 km/)).toBeNull();
        expect(screen.queryByText('Chargement des carreaux…')).toBeNull();
    });

    it('demande à afficher la carte carroyée dès que son fond est dessiné, pas avant', () => {
        const onStagedPainted = jest.fn();
        render(chartElement({ ...STAGED, onStagedPainted }));
        act(() => gridStub.reportStatus({ loading: true }));

        expect(onStagedPainted).not.toHaveBeenCalled();

        act(() => gridStub.reportStatus({ ready: true, loading: true }));

        expect(onStagedPainted).toHaveBeenCalledWith(GRID.frame.key);
    });

    it('ne met pas en avant, sur la carte en préparation, la classe épinglée dans la légende affichée', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        rerender(chartElement({ frame: CHOROPLETH.frame, staged: GRID.frame, pending: true }));

        expect(pinnedClass()).toBe(1);
        expect(gridStub.props.highlightedClass).toBeNull();
    });

    it('retire la carte par territoire et montre la carte carroyée dans le rendu où celle-ci devient la vue affichée', () => {
        const { rerender } = render(chartElement(STAGED));
        const preparedMap = gridLayer();
        rerender(chartElement(GRID));

        expect(screen.queryByTestId('highcharts-map')).toBeNull();
        expect(gridLayer()).toBe(preparedMap);
        expect(gridLayer()).toHaveStyle({ opacity: '1', 'pointer-events': 'auto' });
        expect(gridLayer()).not.toHaveAttribute('aria-hidden');
        expect(legendTitle()).toBe("Consommation d'ENAF (en hectares), données carroyées");
        expect(footnote()).toMatch(/^Carroyage de 1 km/);
    });

    it('ne demande rien quand la carte carroyée affichée redessine son fond', () => {
        const onStagedPainted = jest.fn();
        render(chartElement({ ...GRID, onStagedPainted }));
        act(() => gridStub.reportStatus({ ready: true }));

        expect(onStagedPainted).not.toHaveBeenCalled();
    });

    it('n’atténue la carte carroyée que lorsqu’elle est affichée et qu’une autre vue charge', () => {
        const { rerender } = render(chartElement(STAGED));

        expect(gridStub.props.busy).toBe(false);

        rerender(chartElement({ ...GRID, pending: true }));

        expect(gridStub.props.busy).toBe(true);
    });

    it('annonce le chargement des carreaux une fois la carte carroyée affichée', () => {
        render(chartElement(GRID));
        act(() => gridStub.reportStatus({ ready: true, loading: true }));

        expect(screen.getByRole('status')).toHaveTextContent('Chargement des carreaux…');
    });

    it('prépare sans rien afficher la carte carroyée ouverte par son adresse', () => {
        render(chartElement({ frame: null, staged: GRID.frame, pending: true }));

        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte…');
        expect(gridLayer()).toHaveStyle({ opacity: '0' });
        expect(chartStub.creations.length).toBe(0);
    });

    it('démonte la carte carroyée en préparation quand une carte par territoire est demandée à sa place', () => {
        const { rerender } = render(chartElement(STAGED));
        rerender(chartElement(CHOROPLETH));

        expect(screen.queryByRole('img', { name: GRID.frame.ariaLabel, hidden: true })).toBeNull();
        expect(chartStub.creations.length).toBe(2);
    });
});

describe('carte de toutes les communes du pays', () => {
    // La vue est complète, mais MapLibre n'a pas encore dessiné les communes
    const STAGED: View = { frame: CHOROPLETH.frame, staged: DENSE.frame, pending: true };
    const NOTICE = 'La carte de toutes les communes du pays n’a pas pu être affichée.';

    // Calque du moteur des communes, qui le masque tant qu'il se prépare
    const communesLayer = (): HTMLElement => screen.getByRole('img', { name: DENSE.frame.ariaLabel, hidden: true }).parentElement;

    it('remet au moteur des communes le fond et le rendu du cadre, sans créer de graphique Highcharts', () => {
        render(chartElement(DENSE));

        expect(chartStub.creations).toHaveLength(0);
        expect(communesStub.props).toMatchObject({ base: DENSE.frame.base, render: DENSE.frame.render, highlightedClass: null, busy: false });
        expect(communesStub.props.ariaLabel).toBe("Carte de la France entière par commune, indicateur Consommation d'ENAF (en pourcentage de la surface communale). Les régions d'outre-mer sont placées à gauche de l'Hexagone.");
        expect(communesLayer()).toHaveStyle({ opacity: '1', 'pointer-events': 'auto' });
    });

    it('pose sur la carte la légende des quantiles et, dans la colonne, les chiffres clés et la note', () => {
        render(chartElement(DENSE));

        expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(legendMethod()).toMatch(/^Classes par quantiles, calculées sur les communes affichées/);
        expect(classRows().at(-1)).toBe('Donnée non disponible (4)');
        expect(screen.getByLabelText('Chiffres clés')).toHaveTextContent("Consommation d'espaces");
        expect(within(aside()).getByText(/^Les données de consommation/)).toBeInTheDocument();
    });

    it('dit dans la légende d’une carte en hectares ce qui est dessiné, et où lire les hectares', () => {
        render(chartElement(DENSE_IN_HECTARES));

        expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
        expect(legendMethod()).toMatch(/des cercles proportionnels par commune ne seraient pas lisibles .* les hectares sont donnés au survol\.$/);
    });

    it('garde la même carte d’un indicateur, d’une période et d’une zone nationale à l’autre', () => {
        const { rerender } = render(chartElement(DENSE));
        const shownMap = communesLayer();

        [DENSE_EVOLUTION, DENSE_IN_HECTARES, DENSE_HEXAGONE, { ...DENSE, pending: true }, DENSE].forEach((view) => {
            rerender(chartElement(view));

            expect(communesStub.props.render).toBe(view.frame.render);
        });
        expect(communesStub.creations).toBe(1);
        expect(communesLayer()).toBe(shownMap);
        expect(chartStub.creations).toHaveLength(0);
    });

    it('met en avant sur la carte la classe survolée ou épinglée dans la légende, et dans la légende celle de la commune survolée', () => {
        render(chartElement(DENSE));

        fireEvent.mouseEnter(classButtons()[1]);
        expect(communesStub.props.highlightedClass).toBe(1);

        fireEvent.mouseLeave(classButtons()[1]);
        fireEvent.click(classButtons()[3]);
        expect(communesStub.props.highlightedClass).toBe(3);

        fireEvent.click(classButtons()[3]);
        act(() => communesStub.props.onHover({ name: 'Rennes', valueText: '2,45 %', classIndex: 2 }));
        expect(communesStub.props.highlightedClass).toBeNull();
        expect(activeClasses()).toEqual([2]);
    });

    it('atténue la carte et sa légende pendant le chargement de la carte suivante', () => {
        render(chartElement({ ...DENSE, pending: true }));

        expect(communesStub.props.busy).toBe(true);
        expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : Bretagne…');
        expect(legend().parentElement).toHaveAttribute('aria-busy', 'true');
    });

    it('transmet au moteur le clic sur « Afficher ce département par commune »', () => {
        const onZoneChange = jest.fn();
        render(<NationalMapChart frame={DENSE.frame} staged={null} pending={false} error={null} targetName="France entière" onZoneChange={onZoneChange} />);

        communesStub.props.onZoneChange('DEPART_35', 'Ille-et-Vilaine');

        expect(onZoneChange).toHaveBeenCalledWith('DEPART_35', 'Ille-et-Vilaine');
    });

    describe('relais avec la carte par territoire', () => {
        it('se prépare, invisible, sous la carte affichée, qui reste avec sa légende et ses chiffres clés', () => {
            render(chartElement(STAGED));

            expect(chartStub.creations).toHaveLength(1);
            expect(chartLayer()).toHaveStyle({ opacity: '0.5' });
            expect(classRows()[0]).toBe("Jusqu'à 0,02 % (2)");
            expect(screen.getByLabelText('Chiffres clés')).toHaveTextContent("Consommation d'espaces");
            expect(communesLayer()).toHaveStyle({ opacity: '0', 'pointer-events': 'none' });
            expect(communesLayer()).toHaveAttribute('aria-hidden', 'true');
            expect(communesStub.props).toMatchObject({ render: DENSE.frame.render, busy: false, highlightedClass: null });
        });

        it('annonce le chargement des communes tant que leurs tuiles ne sont pas dessinées', () => {
            render(chartElement(STAGED));

            expect(screen.getByRole('status')).toHaveTextContent('Chargement des communes…');
        });

        it('demande à afficher la vue dès que ses communes sont dessinées, pas avant', () => {
            const onStagedPainted = jest.fn();
            render(chartElement({ ...STAGED, onStagedPainted }));
            act(() => communesStub.reportStatus({ loading: true }));

            expect(onStagedPainted).not.toHaveBeenCalled();

            act(() => communesStub.reportStatus({ ready: true }));

            expect(onStagedPainted).toHaveBeenCalledWith(DENSE.frame.key);
        });

        it('retire la carte par territoire et montre celle des communes, déjà dessinée, dans le rendu où elle devient la vue affichée', () => {
            const { rerender } = render(chartElement(STAGED));
            const preparedMap = communesLayer();
            rerender(chartElement(DENSE));

            expect(screen.queryByTestId('highcharts-map')).toBeNull();
            expect(communesLayer()).toBe(preparedMap);
            expect(communesStub.creations).toBe(1);
            expect(communesLayer()).toHaveStyle({ opacity: '1', 'pointer-events': 'auto' });
            expect(communesLayer()).not.toHaveAttribute('aria-hidden');
            expect(classRows()[0]).toMatch(/^Moins de /);
        });

        it('revient à la carte par territoire dans le rendu où son cadre arrive, et détruit la carte des communes', () => {
            const { rerender } = render(chartElement(DENSE));
            rerender(chartElement({ ...DENSE, pending: true }));

            // La légende de la vue affichée reste pendant le chargement
            expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");

            rerender(chartElement(CHOROPLETH));

            expect(chartStub.creations).toHaveLength(1);
            expect(communesStub.props).toBeNull();
            expect(screen.queryByRole('img', { name: DENSE.frame.ariaLabel, hidden: true })).toBeNull();
            expect(classRows()[0]).toBe("Jusqu'à 0,02 % (2)");
        });

        it('prépare sans rien afficher la vue ouverte par son adresse', () => {
            render(chartElement({ frame: null, staged: DENSE.frame, pending: true }));

            expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte…');
            expect(communesLayer()).toHaveStyle({ opacity: '0' });
            expect(chartStub.creations).toHaveLength(0);
        });

        it('réserve déjà la place de sa légende à la vue ouverte par son adresse : la carte naît à sa taille définitive', () => {
            const { rerender } = render(chartElement({ frame: null, staged: DENSE.frame, pending: true }));
            const reserved = legendBand();

            expect(reserved).not.toBeNull();
            expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();

            rerender(chartElement(DENSE));

            expect(legendBand()).toBe(reserved);
        });
    });

    describe('relais avec la carte carroyée', () => {
        it('ne prend pas pour sien le dessin de l’autre carte MapLibre', () => {
            const onStagedPainted = jest.fn();
            render(chartElement({ frame: GRID.frame, staged: DENSE.frame, pending: true, onStagedPainted }));

            // La carte carroyée affichée redessine son fond : ce n'est pas la vue en préparation
            act(() => gridStub.reportStatus({ ready: true }));
            expect(onStagedPainted).not.toHaveBeenCalled();

            act(() => communesStub.reportStatus({ ready: true }));
            expect(onStagedPainted).toHaveBeenCalledWith(DENSE.frame.key);
        });

        it('garde la carte des communes affichée pendant que la carte carroyée se prépare sous elle', () => {
            render(chartElement({ frame: DENSE.frame, staged: GRID.frame, pending: true }));

            expect(communesLayer()).toHaveStyle({ opacity: '1' });
            expect(communesStub.props.busy).toBe(true);
            expect(screen.getByRole('img', { name: GRID.frame.ariaLabel, hidden: true }).parentElement).toHaveStyle({ opacity: '0' });
            expect(screen.getByRole('status')).toHaveTextContent('Chargement de la carte : Bretagne…');
        });
    });

    describe('une fois affichée', () => {
        it('annonce le chargement des communes tant que ses premières tuiles ne sont pas dessinées', () => {
            render(chartElement(DENSE));
            act(() => communesStub.reportStatus({ loading: true }));

            expect(screen.getByRole('status')).toHaveTextContent('Chargement des communes…');

            act(() => communesStub.reportStatus({ ready: true }));

            expect(screen.queryByRole('status')).toBeNull();
        });

        it('affiche le message de repli sur la carte, la légende et les chiffres clés restant affichés', () => {
            render(chartElement(DENSE));
            act(() => communesStub.reportStatus({ ready: true, notice: NOTICE }));

            expect(screen.getByRole('status')).toHaveTextContent(NOTICE);
            expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
            expect(classRows()).toHaveLength(6);
            expect(screen.getByLabelText('Chiffres clés')).toHaveTextContent("Consommation d'espaces");
        });

        it('oublie l’état de la carte détruite : la suivante n’hérite pas de son message', () => {
            const { rerender } = render(chartElement(DENSE));
            act(() => communesStub.reportStatus({ ready: true, notice: NOTICE }));
            rerender(chartElement(CHOROPLETH));
            rerender(chartElement(DENSE));

            expect(screen.queryByText(NOTICE)).toBeNull();
        });

        it('désigne les territoires d’outre-mer par des numéros sur une petite scène', () => {
            const measured = measureStageAs(360, 360);
            render(chartElement(DENSE));

            expect(communesStub.props.numberedInsets).toBe(true);
            measured.mockRestore();
        });
    });
});

describe('légende d’un indicateur à l’autre', () => {
    it.each([
        ['un aplat', CHOROPLETH],
        ['des cercles', SYMBOLS],
        ['des anneaux', RINGS],
        ['une carte bivariée', BIVARIATE],
        ['une carte carroyée', GRID],
    ])('pose la légende sur la carte, hors de la colonne, pour %s', (_, view) => {
        render(chartElement(view));
        const stage = document.querySelector('[data-legend-band]').parentElement;

        expect(stage).toContainElement(legend());
        expect(screen.getByLabelText('Chiffres clés et graphiques')).not.toContainElement(legend());
    });

    it('garde le même nœud de légende d’un aplat à des cercles, à une carte bivariée et à une carte carroyée', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        const before = legend();

        [SYMBOLS, BIVARIATE, GRID].forEach((view) => {
            rerender(chartElement(view));

            expect(legend().isSameNode(before)).toBe(true);
        });
    });

    it.each([
        ['des cercles', SYMBOLS],
        ['une carte bivariée', BIVARIATE],
        ['une carte carroyée', GRID],
    ])('garde la légende repliée d’un aplat à %s', (_, view) => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));
        rerender(chartElement(view));

        expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Légende' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('atténue la légende de la carte affichée et la signale occupée pendant le chargement de la suivante', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        const overlay = legend().parentElement;

        expect(overlay).toHaveAttribute('aria-busy', 'false');
        expect(overlay).toHaveStyle({ opacity: '1' });

        rerender(chartElement({ ...CHOROPLETH, pending: true }));

        expect(legend().parentElement).toBe(overlay);
        expect(overlay).toHaveAttribute('aria-busy', 'true');
        expect(overlay).toHaveStyle({ opacity: '0.6' });
    });

    it('garde la légende atténuée, sans la dire occupée, quand la carte suivante n’a pas pu être chargée', () => {
        render(chartElement({ ...CHOROPLETH, pending: true, error: 'data' }));

        expect(legend().parentElement).toHaveAttribute('aria-busy', 'false');
        expect(legend().parentElement).toHaveStyle({ opacity: '0.6' });
    });

    it.each([
        ['bivariée', BIVARIATE],
        ['carroyée', GRID],
    ])('atténue aussi la légende d’une carte %s, et la signale occupée, pendant le chargement de la carte suivante', (_, view) => {
        const { rerender } = render(chartElement(view));
        const overlay = legend().parentElement;

        expect(overlay).toHaveAttribute('aria-busy', 'false');
        expect(overlay).toHaveStyle({ opacity: '1' });

        rerender(chartElement({ ...view, pending: true }));

        expect(overlay).toHaveAttribute('aria-busy', 'true');
        expect(overlay).toHaveStyle({ opacity: '0.6' });
    });
});

describe('place réservée à la légende', () => {
    it('réserve la même bande en haut de la carte quelle que soit la représentation', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        const band = legendBand();
        const others = [DIVERGING, SYMBOLS, SIGNED_SYMBOLS, RINGS, BIVARIATE, GRID].map((view) => {
            rerender(chartElement(view));
            return legendBand();
        });

        expect(band).toBe('140');
        expect(others).toEqual([band, band, band, band, band, band]);
    });

    it('garde à la légende en bande ses classes en ligne et sa méthode dans un volet posé sous elle', () => {
        render(chartElement(CHOROPLETH));
        const method = within(legend()).getByText('Méthode').parentElement;

        expect(legend()).toHaveAttribute('data-legend-placement', 'band');
        expect(within(legend()).getByRole('list', { name: 'Classes de valeurs' })).not.toHaveStyle({ 'flex-direction': 'column' });
        // Marges comprises, le volet ne dépasse pas la largeur de la légende, donc pas la scène
        expect(within(method).getByText(/^Classes par seuils naturels/)).toHaveStyle({ position: 'absolute', 'box-sizing': 'border-box' });
        // Le volet dépasse de la bande, par-dessus la carte : le panneau ne le fait pas défiler
        expect(legend()).not.toHaveStyle({ 'overflow-y': 'auto' });
    });

    it('ne réserve rien quand la légende est repliée, et rend la bande quand elle est rouverte', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));

        expect(legendBand()).toBeNull();

        fireEvent.click(screen.getByRole('button', { name: 'Légende' }));

        expect(legendBand()).toBe('140');
    });

    it('recale la carte dans la place que la légende lui rend en se repliant, puis lui reprend en se rouvrant', () => {
        render(chartElement(CHOROPLETH));
        const reflowsBefore = chartStub.reflows;
        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));

        expect(chartStub.reflows).toBe(reflowsBefore + 1);

        fireEvent.click(screen.getByRole('button', { name: 'Légende' }));

        expect(chartStub.reflows).toBe(reflowsBefore + 2);
    });

    it('réserve une bande plus haute sur une carte de largeur moyenne, où la légende passe à la ligne', () => {
        const measure = measureStageAs(500, 600);
        render(chartElement(CHOROPLETH));
        measure.mockRestore();

        expect(legendBand()).toBe('150');
    });

    // Scène d'une fenêtre d'ordinateur de 1280 × 600
    it('replie la légende d’office sur une carte trop basse pour la bande, qui garde ainsi ses noms d’outre-mer', () => {
        const measure = measureStageAs(576, 486);
        render(chartElement(CHOROPLETH));
        measure.mockRestore();
        const insetLabels = chartStub.options().series[2] as unknown as { data: { name: string }[] };

        expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();
        expect(screen.getByRole('button', { name: 'Légende' })).toHaveAttribute('aria-expanded', 'false');
        expect(legendBand()).toBeNull();
        expect(insetLabels.data.map((label) => label.name)).toEqual(['Mayotte', 'Guyane']);
    });

    describe('sur une carte étroite', () => {
        let measure: jest.SpyInstance;

        beforeEach(() => {
            measure = measureStageAs(358, 506);
        });

        afterEach(() => measure.mockRestore());

        it('replie la légende d’office et laisse toute la hauteur à la carte', () => {
            render(chartElement(CHOROPLETH));

            expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();
            expect(screen.getByRole('button', { name: 'Légende' })).toHaveAttribute('aria-expanded', 'false');
            expect(legendBand()).toBeNull();
        });

        it('ouvre la légende par-dessus la carte, sans la décaler, et la garde ouverte d’un aplat à des cercles', () => {
            const { rerender } = render(chartElement(CHOROPLETH));
            fireEvent.click(screen.getByRole('button', { name: 'Légende' }));
            rerender(chartElement(SYMBOLS));

            expect(legendTitle()).toBe("Consommation d'ENAF (en hectares)");
            expect(legendBand()).toBeNull();
        });

        it('remplace les noms des territoires d’outre-mer par des numéros, dont la clé est donnée sous la carte', () => {
            render(chartElement(CHOROPLETH));
            const insetLabels = chartStub.options().series[2] as unknown as { data: { name: string }[] };

            expect(insetLabels.data.map((label) => label.name)).toEqual(['1', '2']);
            expect(screen.getByText((_, element) => element.textContent === '1 Mayotte · 2 Guyane')).toBeInTheDocument();
        });

        it('déplie la méthode dans le panneau de la légende, à la suite des classes restées en ligne', () => {
            render(chartElement(CHOROPLETH));
            fireEvent.click(screen.getByRole('button', { name: 'Légende' }));
            const method = within(legend()).getByText('Méthode').parentElement;

            expect(legend()).toHaveAttribute('data-legend-placement', 'over');
            expect(within(legend()).getByRole('list', { name: 'Classes de valeurs' })).not.toHaveStyle({ 'flex-direction': 'column' });
            expect(method).toHaveStyle({ order: '1' });
            // Rien ne sort du panneau, qui défile dans la hauteur de la scène
            expect(within(method).getByText(/^Classes par seuils naturels/)).toHaveStyle({ position: 'static' });
            expect(legend()).toHaveStyle({ 'overflow-y': 'auto' });
        });

        it('efface l’avis de la carte carroyée le temps que la légende ouverte le recouvrirait', () => {
            render(chartElement(GRID));
            act(() => gridStub.reportStatus({ ready: true, notice: "Les données carroyées ne couvrent que l'Hexagone et la Corse." }));

            expect(screen.getByRole('status')).toHaveStyle({ top: '3rem' });

            fireEvent.click(screen.getByRole('button', { name: 'Légende' }));

            expect(screen.queryByRole('status')).toBeNull();

            fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));

            expect(screen.getByRole('status')).toHaveTextContent("Les données carroyées ne couvrent que l'Hexagone et la Corse.");
        });
    });

    // Fenêtre d'ordinateur basse, trop étroite pour une colonne de légende
    describe('sur une carte basse', () => {
        let measure: jest.SpyInstance;

        beforeEach(() => {
            measure = measureStageAs(496, 352);
        });

        afterEach(() => measure.mockRestore());

        it('replie la légende d’office et laisse toute la hauteur à la carte', () => {
            render(chartElement(CHOROPLETH));

            expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();
            expect(legendBand()).toBeNull();
            expect(legendSide()).toBeNull();
        });

        it('ouvre la légende par-dessus la carte, sans la décaler', () => {
            render(chartElement(CHOROPLETH));
            fireEvent.click(screen.getByRole('button', { name: 'Légende' }));

            expect(legendTitle()).toBe("Consommation d'ENAF (en pourcentage de la surface communale)");
            expect(legendBand()).toBeNull();
            expect(legendSide()).toBeNull();
        });
    });

    // Fenêtre d'ordinateur large et peu haute (1536 × 730)
    describe('sur une carte plus large que haute', () => {
        let measure: jest.SpyInstance;

        beforeEach(() => {
            measure = measureStageAs(814, 616);
        });

        afterEach(() => measure.mockRestore());

        it('ouvre la légende dans une colonne à gauche de la carte, qui garde toute la hauteur', () => {
            render(chartElement(CHOROPLETH));

            expect(legend()).toHaveAttribute('data-legend-placement', 'side');
            expect(legendSide()).toBe('220');
            expect(legendBand()).toBeNull();
        });

        it('réserve la même colonne quelle que soit la représentation', () => {
            const { rerender } = render(chartElement(CHOROPLETH));
            const others = [DIVERGING, SYMBOLS, SIGNED_SYMBOLS, RINGS, BIVARIATE, GRID].map((view) => {
                rerender(chartElement(view));
                return [legendSide(), legendBand()];
            });

            expect(others).toEqual(Array(6).fill(['220', null]));
        });

        it('met la légende en colonne : une classe par ligne, la méthode à leur suite', () => {
            render(chartElement(CHOROPLETH));
            const classes = within(legend()).getByRole('list', { name: 'Classes de valeurs' });
            const method = within(legend()).getByText('Méthode').parentElement;

            expect(classes).toHaveStyle({ 'flex-direction': 'column' });
            expect(method).toHaveStyle({ order: '1' });
            // Le volet de la méthode se déplie dans la colonne, pas par-dessus la carte
            expect(within(method).getByText(/^Classes par seuils naturels/)).toHaveStyle({ position: 'static' });
        });

        it('pose la mention des territoires sans donnée sous les cercles de référence', () => {
            render(chartElement(SYMBOLS));
            const circles = within(legend()).getByRole('img', { name: /^Cercles de référence/ });

            expect(circles.parentElement).toHaveStyle({ 'flex-direction': 'column' });
            // Sa largeur, estimée d'après ses libellés, ne fait pas défiler la colonne
            expect(circles).toHaveStyle({ 'max-width': '100%' });
        });

        it('pose le sens des axes d’une carte bivariée sous sa grille de couleurs', () => {
            render(chartElement(BIVARIATE));

            expect(within(legend()).getByRole('group', { name: 'Classes croisées' }).parentElement).toHaveStyle({ 'flex-direction': 'column' });
        });

        it('rend sa colonne à la carte quand la légende est repliée, et la reprend quand elle est rouverte', () => {
            render(chartElement(CHOROPLETH));
            fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));

            expect(legendSide()).toBeNull();

            fireEvent.click(screen.getByRole('button', { name: 'Légende' }));

            expect(legendSide()).toBe('220');
        });

        it('centre l’annonce de chargement sur la carte, à côté de la colonne', () => {
            render(chartElement({ ...CHOROPLETH, pending: true }));

            expect(document.querySelector('[data-legend-side]')).toContainElement(screen.getByRole('status'));
        });

        it('pose l’avis de la carte carroyée en haut de la carte, à côté de la colonne', () => {
            render(chartElement(GRID));
            act(() => gridStub.reportStatus({ ready: true, notice: "Les données carroyées ne couvrent que l'Hexagone et la Corse." }));

            expect(document.querySelector('[data-legend-side]')).toContainElement(screen.getByRole('status'));
            expect(screen.getByRole('status')).toHaveStyle({ top: '1rem' });
        });
    });
});

describe('scène qui change de taille sous la carte affichée', () => {
    beforeEach(resizeObserverStub.install);

    afterEach(resizeObserverStub.remove);

    const resizeStage = (width: number, height: number): void => act(() => resizeObserverStub.resize(width, height));

    // Rayon du plus grand cercle de référence de la légende
    const largestReference = (): number => Math.max(...[...legend().querySelectorAll('circle')].map((circle) => Number(circle.getAttribute('r'))));

    it('donne aux cercles leur nouveau diamètre sans recréer le graphique, et la légende le suit', () => {
        render(chartElement(SYMBOLS));
        const reference = largestReference();

        expect(chartStub.symbolMaxSize()).toBe(64);

        resizeStage(520, 700);

        expect(chartStub.creations.length).toBe(1);
        expect(chartStub.symbolMaxSize()).toBe(58);
        expect(largestReference()).toBeLessThan(reference);
    });

    it('crée la carte en cercles suivante au diamètre que demande alors la scène', () => {
        const { rerender } = render(chartElement(SYMBOLS));
        resizeStage(520, 700);
        rerender(chartElement(SIGNED_SYMBOLS));

        expect(chartStub.creations.length).toBe(2);
        expect((chartStub.options().series[2] as unknown as { maxSize: number }).maxSize).toBe(58);
        expect(chartStub.symbolMaxSize()).toBe(58);
    });

    it('ne recrée pas un aplat dont la scène garde ses noms d’outre-mer', () => {
        render(chartElement(CHOROPLETH));
        resizeStage(520, 700);

        expect(chartStub.creations.length).toBe(1);
    });

    it('ne recrée pas la carte en anneaux, dont les anneaux de référence suivent le nouveau diamètre', () => {
        render(chartElement(RINGS));
        const reference = largestReference();
        resizeStage(520, 700);

        expect(chartStub.creations.length).toBe(1);
        expect(largestReference()).toBeLessThan(reference);
    });

    it('replie la légende ouverte d’office et rend sa bande à la carte quand la scène devient basse et étroite', () => {
        render(chartElement(CHOROPLETH));

        expect(legendBand()).toBe('140');

        resizeStage(496, 352);

        expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();
        expect(legendBand()).toBeNull();
    });

    it('garde ouverte, par-dessus la carte, la légende que l’utilisateur a rouverte sur une scène devenue basse et étroite', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));
        fireEvent.click(screen.getByRole('button', { name: 'Légende' }));
        resizeStage(496, 352);

        expect(legend()).toBeInTheDocument();
        expect(legendBand()).toBeNull();
        expect(legendSide()).toBeNull();
    });

    it('fait passer la légende de la bande à la colonne, puis de la colonne à la bande, sans recréer le graphique', () => {
        render(chartElement(CHOROPLETH));
        resizeStage(736, 786);
        const before = legend();

        expect([legendBand(), legendSide()]).toEqual(['140', null]);

        resizeStage(814, 616);

        expect([legendBand(), legendSide()]).toEqual([null, '220']);
        expect(legend().isSameNode(before)).toBe(true);

        resizeStage(736, 786);

        expect([legendBand(), legendSide()]).toEqual(['140', null]);
        expect(chartStub.creations.length).toBe(1);
    });

    it('garde repliée, d’un placement à l’autre, la légende que l’utilisateur a repliée', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(screen.getByRole('button', { name: 'Replier la légende' }));
        resizeStage(814, 616);

        expect(screen.queryByRole('region', { name: 'Légende de la carte' })).toBeNull();
        expect(legendSide()).toBeNull();
    });
});

describe('carte masquée par l’onglet Informations, sur téléphone', () => {
    let measure: jest.SpyInstance;

    beforeEach(() => {
        resizeObserverStub.install();
        measure = measureStageAs(358, 506);
    });

    afterEach(() => {
        measure.mockRestore();
        resizeObserverStub.remove();
    });

    // Comme dans la page, la scène est mesurée avant l'arrivée de la première carte
    const openOn = (view: View) => {
        const page = render(chartElement(NO_VIEW));
        page.rerender(chartElement(view));
        return page;
    };

    // Le volet de la carte est retiré de la mise en page, puis y revient
    const hideMap = (): void => act(() => resizeObserverStub.resize(0, 0));
    const showMap = (): void => act(() => resizeObserverStub.resize(358, 506));

    // Vingt-quatre territoires, les quatre départements bretons répétés : au-delà de vingt
    // territoires, le plus grand cercle est plus petit
    const manyLandsInCircles = (): MapFrame => {
        const features = [0, 1, 2, 3, 4, 5].flatMap((copy) =>
            BRETAGNE_BY_DEPARTEMENT.geojson.features.map((feature) => ({
                ...feature,
                properties: { ...feature.properties, land_id: `${feature.properties.land_id}-${copy}` },
            })),
        );
        const lands = Object.fromEntries(
            features.map(({ properties }) => [properties.land_id, CONSO_BRETAGNE_BY_DEPARTEMENT.lands[properties.land_id.split('-')[0]]]),
        );
        const baseMap = { ...BRETAGNE_BY_DEPARTEMENT, geojson: { ...BRETAGNE_BY_DEPARTEMENT.geojson, features } };
        return consoFrame('REGION_53', baseMap, 'conso_ha', { ...CONSO_BRETAGNE_BY_DEPARTEMENT, lands });
    };

    it('ne crée aucun graphique tant que la carte est masquée, quels que soient les choix faits dans le menu', () => {
        const { rerender } = openOn(CHOROPLETH);
        hideMap();
        rerender(chartElement(SYMBOLS));
        rerender(chartElement(DIVERGING));

        expect(chartStub.creations.length).toBe(1);
    });

    it('crée une seule fois, à son retour, la carte du dernier choix', () => {
        const { rerender } = openOn(CHOROPLETH);
        hideMap();
        rerender(chartElement(SYMBOLS));
        rerender(chartElement(DIVERGING));
        showMap();

        expect(chartStub.creations.length).toBe(2);
        expect(chartStub.options().accessibility.description).toBe(DIVERGING.frame.ariaLabel);
    });

    it('la crée dans le rappel même du changement de taille, avant la première image du retour', () => {
        const { rerender } = openOn(CHOROPLETH);
        hideMap();
        rerender(chartElement(SYMBOLS));
        let creationsRightAfterResize = 0;
        act(() => {
            resizeObserverStub.resize(358, 506);
            creationsRightAfterResize = chartStub.creations.length;
        });

        expect(creationsRightAfterResize).toBe(2);
    });

    it('ne recrée rien au retour quand la carte n’a pas changé', () => {
        openOn(CHOROPLETH);
        hideMap();
        showMap();

        expect(chartStub.creations.length).toBe(1);
    });

    it('retire à son retour la carte par territoire qu’une carte carroyée a remplacée, sans en avoir créé d’autre', () => {
        const { rerender } = openOn(CHOROPLETH);
        hideMap();
        rerender(chartElement(GRID));
        showMap();

        expect(screen.queryByTestId('highcharts-map')).toBeNull();
        expect(chartStub.creations.length).toBe(1);
    });

    it('ne crée la carte par territoire qui remplace une carte carroyée qu’à son retour', () => {
        const { rerender } = openOn(GRID);
        hideMap();
        rerender(chartElement(SYMBOLS));

        expect(chartStub.creations.length).toBe(0);

        showMap();

        expect(chartStub.creations.length).toBe(1);
    });

    it('ne retaille pas les cercles du graphique masqué, et crée le suivant à son diamètre', () => {
        const { rerender } = openOn(SYMBOLS);
        hideMap();
        rerender(chartElement({ frame: manyLandsInCircles() }));

        expect(chartStub.symbolMaxSize()).toBe(38);

        showMap();

        expect(chartStub.symbolMaxSize()).toBe(24);
    });
});

describe('mise en avant d’une classe', () => {
    it('épingle la classe cliquée et estompe les territoires des autres classes', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);

        expect(pinnedClass()).toBe(1);
        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(1));
        expect(chartStub.dimmedLands()).not.toHaveLength(0);
    });

    it('annule l’épinglage et l’estompage au second clic', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        fireEvent.click(classButtons()[1]);

        expect(pinnedClass()).toBeNull();
        expect(chartStub.dimmedLands()).toEqual([]);
    });

    it('après un changement de période, estompe les territoires hors de la classe épinglée dans la légende, et eux seuls', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        rerender(chartElement(CHOROPLETH_IN_2024));

        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(pinnedClass()));
    });

    it('n’a plus de classe épinglée ni de territoire estompé quand les classes changent', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        rerender(chartElement(CHOROPLETH_IN_2024));

        expect(pinnedClass()).toBeNull();
        expect(chartStub.dimmedLands()).toEqual([]);
    });

    it('ne rétablit ni l’épinglage ni l’estompage au retour sur la carte où une classe était épinglée', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        rerender(chartElement(CHOROPLETH_IN_2024));
        rerender(chartElement(CHOROPLETH));

        expect(pinnedClass()).toBeNull();
        expect(activeClasses()).toEqual([]);
        expect(chartStub.dimmedLands()).toEqual([]);
    });

    it('garde la classe épinglée, et l’estompage, sur une carte redessinée avec les mêmes classes', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        rerender(chartElement({ frame: france('conso_pct_surface') }));

        expect(chartStub.creations.length).toBe(2);
        expect(pinnedClass()).toBe(1);
        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(1));
    });

    it('garde la classe épinglée et l’estompage pendant le chargement de la carte suivante', () => {
        const { rerender } = render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        rerender(chartElement({ ...CHOROPLETH, pending: true }));

        expect(pinnedClass()).toBe(1);
        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(1));
    });

    it('met en avant la classe survolée, puis revient à la classe épinglée', () => {
        render(chartElement(CHOROPLETH));
        fireEvent.click(classButtons()[1]);
        fireEvent.mouseEnter(classButtons()[3]);

        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(3));

        fireEvent.mouseLeave(classButtons()[3]);

        expect(chartStub.dimmedLands()).toEqual(landsOutsideClass(1));
    });

    it('épingle une classe de carreaux, d’une période à l’autre, et la libère au second clic', () => {
        const { rerender } = render(chartElement(GRID));
        fireEvent.click(classButtons()[2]);
        rerender(chartElement({ frame: france('conso_ha_gridded', CONSO_FRANCE_BY_REGION_IN_2024) }));

        expect(gridStub.props.highlightedClass).toBe(2);
        expect(pinnedClass()).toBe(2);

        fireEvent.click(classButtons()[2]);

        expect(gridStub.props.highlightedClass).toBeNull();
    });
});

// La carte par territoire et le nuage de points d'une carte bivariée se désignent le territoire
// survolé par un canal, sans que la page soit rendue de nouveau
describe('territoire survolé, partagé avec le nuage de points', () => {
    it('désigne au nuage le territoire survolé sur la carte, puis plus aucun', () => {
        const highlight = createLandHighlight();
        const onScatter = jest.fn();
        highlight.subscribe('scatter', onScatter);
        render(chartElement({ ...BIVARIATE, highlight }));
        act(() => chartStub.hoverLand('53'));
        act(() => chartStub.hoverLand(null));

        expect(onScatter.mock.calls).toEqual([['53'], [null]]);
    });

    it('cerne sur la carte le territoire que le nuage désigne, puis plus aucun', () => {
        const highlight = createLandHighlight();
        render(chartElement({ ...BIVARIATE, highlight }));
        act(() => highlight.publish('scatter', '53'));

        expect(chartStub.outlinedLands()).toEqual(['53']);

        act(() => highlight.publish('scatter', null));

        expect(chartStub.outlinedLands()).toEqual([]);
    });

    it('passe d’un territoire à l’autre sans laisser le premier cerné', () => {
        const highlight = createLandHighlight();
        render(chartElement({ ...BIVARIATE, highlight }));
        act(() => highlight.publish('scatter', '53'));
        act(() => highlight.publish('scatter', '75'));

        expect(chartStub.outlinedLands()).toEqual(['75']);
    });

    it('ignore un territoire que la carte ne montre pas', () => {
        const highlight = createLandHighlight();
        render(chartElement({ ...BIVARIATE, highlight }));

        expect(() => act(() => highlight.publish('scatter', 'inconnu'))).not.toThrow();
        expect(chartStub.outlinedLands()).toEqual([]);
    });

    it('ne recrée pas le graphique et ne touche pas à la légende', () => {
        const highlight = createLandHighlight();
        render(chartElement({ ...BIVARIATE, highlight }));
        act(() => highlight.publish('scatter', '53'));

        expect(chartStub.creations).toHaveLength(1);
        expect(chartStub.dimmedLands()).toEqual([]);
    });

    it('retrouve le territoire sur la carte recréée pour une autre vue', () => {
        const highlight = createLandHighlight();
        const { rerender } = render(chartElement({ ...BIVARIATE, highlight }));
        act(() => highlight.publish('scatter', '53'));
        rerender(chartElement({ frame: france('bivariate_habitat_population'), highlight }));
        act(() => highlight.publish('scatter', '75'));

        expect(chartStub.outlinedLands()).toEqual(['75']);
    });

    it('cesse d’écouter le nuage quand elle est retirée de la page', () => {
        const highlight = createLandHighlight();
        const { unmount } = render(chartElement({ ...BIVARIATE, highlight }));
        unmount();

        expect(() => highlight.publish('scatter', '53')).not.toThrow();
    });

    it('reste muette sans canal', () => {
        render(chartElement(BIVARIATE));

        expect(() => act(() => chartStub.hoverLand('53'))).not.toThrow();
    });
});

describe('lecture au doigt', () => {
    // Le dernier geste fait sur la page : jsdom n'a pas d'événements de pointeur, un événement
    // ordinaire en porte le type
    const point = (pointerType: string): void => {
        act(() => {
            document.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), { pointerType }));
        });
    };
    const sheet = (): HTMLElement | null => screen.queryByRole('region', { name: 'Élément désigné sur la carte' });
    const mountTouched = (pending = false) => {
        const onZoneChange = jest.fn();
        const view = (frame: MapFrame) => <NationalMapChart frame={frame} staged={null} pending={pending} error={null} targetName="Bretagne" onZoneChange={onZoneChange} />;
        const { rerender } = render(view(CHOROPLETH.frame));
        point('touch');
        return { onZoneChange, show: (frame: MapFrame) => rerender(view(frame)) };
    };
    afterEach(() => point('mouse'));

    it('lit le territoire touché au lieu de l’ouvrir : sa fiche, annoncée aux lecteurs d’écran, et son contour sur la carte', () => {
        const { onZoneChange } = mountTouched();
        act(() => chartStub.clickLand('53'));

        expect(onZoneChange).not.toHaveBeenCalled();
        expect(sheet()).toHaveTextContent('Bretagne');
        expect(sheet().parentElement).toHaveAttribute('aria-live', 'polite');
        expect(chartStub.readLands()).toEqual(['53']);
        expect(chartStub.creations).toHaveLength(1);
    });

    it('ouvre le territoire par le bouton de sa fiche', () => {
        const { onZoneChange } = mountTouched();
        act(() => chartStub.clickLand('53'));
        fireEvent.click(within(sheet()).getByRole('button', { name: 'Ouvrir ce territoire' }));

        expect(onZoneChange.mock.calls).toEqual([['REGION_53', 'Bretagne']]);
    });

    it('n’ouvre rien pendant un chargement', () => {
        const { onZoneChange } = mountTouched(true);
        act(() => chartStub.clickLand('53'));
        fireEvent.click(within(sheet()).getByRole('button', { name: 'Ouvrir ce territoire' }));

        expect(onZoneChange).not.toHaveBeenCalled();
    });

    it('remplace la fiche par celle d’un autre territoire, et la ferme par un appui hors des territoires ou par sa croix', () => {
        mountTouched();
        act(() => chartStub.clickLand('53'));
        act(() => chartStub.clickLand('75'));

        expect(sheet()).not.toHaveTextContent('Bretagne');
        expect(chartStub.readLands()).toEqual(['75']);

        act(() => chartStub.tapOutside());

        expect(sheet()).not.toBeInTheDocument();
        expect(chartStub.readLands()).toEqual([]);

        act(() => chartStub.clickLand('53'));
        fireEvent.click(within(sheet()).getByRole('button', { name: /Fermer/ }));

        expect(sheet()).not.toBeInTheDocument();
    });

    it('suit la carte : la fiche ouverte donne la valeur du nouvel indicateur', () => {
        const { show } = mountTouched();
        act(() => chartStub.clickLand('53'));
        const before = sheet().textContent;
        show(SYMBOLS.frame);

        expect(sheet()).toHaveTextContent('Bretagne');
        expect(sheet().textContent).not.toBe(before);
        expect(chartStub.readLands()).toEqual(['53']);
    });

    it('à la souris, le clic ouvre toujours le territoire, sans fiche', () => {
        const { onZoneChange } = mountTouched();
        point('mouse');
        act(() => chartStub.clickLand('53'));

        expect(onZoneChange.mock.calls).toEqual([['REGION_53', 'Bretagne']]);
        expect(sheet()).not.toBeInTheDocument();
    });
});
