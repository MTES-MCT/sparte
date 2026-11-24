// Indicateurs d'artificialisation de la carte nationale, d'après l'OCS GE : le stock (espaces
// artificialisés au dernier millésime de chaque territoire) et le flux (artificialisation nette
// entre ses deux derniers millésimes). L'OCS GE est produite département par département, à des
// dates différentes : il n'y a pas de période à choisir, et les valeurs de deux territoires ne
// portent pas forcément sur les mêmes années. Les identifiants des cartes sont les clés de la
// réponse de l'endpoint des indicateurs d'artificialisation, sauf celui de la carte en anneaux,
// qui en lit deux (les surfaces artificialisées et les surfaces désartificialisées), et celui de
// la carte des sols par maille, qui lit ses valeurs dans des tuiles (voir domain/grid/soilCells.ts).
import type { NationalMapArtifLand, NationalMapYearSet } from '@services/api';
import { MillesimeKind, countWithoutFlux, landsMillesimeReading } from './domain/millesimes';
import type { Indicator } from './indicators';

// Graphiques complémentaires des cartes de chaque rubrique, dans l'ordre où le menu les propose
// et où la colonne les affiche. Ils décrivent la zone affichée, à ses propres millésimes.
export const ARTIF_STOCK_CHARTS: Indicator[] = [
    {
        id: 'artif_share_by_millesime',
        label: 'Part du territoire artificialisée aux deux derniers millésimes',
        description:
            'Part de la surface du territoire artificialisée à chacun de ses deux derniers millésimes OCS GE, avec la surface correspondante en hectares (diagramme en barres).',
        type: 'chart',
    },
    {
        id: 'artif_by_cover',
        label: 'Surfaces artificialisées par type de couverture du sol',
        description:
            'Part de chaque type de couverture du sol dans les surfaces artificialisées au dernier millésime OCS GE : les cinq premiers types, puis les autres réunis (diagramme en barres).',
        type: 'chart',
    },
];

export const ARTIF_FLUX_CHARTS: Indicator[] = [
    {
        id: 'artif_and_desartif',
        label: 'Artificialisation, désartificialisation et artificialisation nette (en hectares)',
        description:
            'Surfaces artificialisées, surfaces désartificialisées et leur différence, l’artificialisation nette, entre les deux derniers millésimes OCS GE du territoire (diagramme en barres).',
        type: 'chart',
    },
    {
        id: 'artif_flux_by_cover',
        label: 'Artificialisation et désartificialisation par type de couverture du sol (en hectares)',
        description:
            'Surfaces artificialisées et désartificialisées entre les deux derniers millésimes OCS GE, pour les six types de couverture du sol les plus concernés (diagramme en barres).',
        type: 'chart',
    },
];

const STOCK_CHARTS = ARTIF_STOCK_CHARTS.map(({ id }) => id);
const FLUX_CHARTS = ARTIF_FLUX_CHARTS.map(({ id }) => id);

// L'ordre est celui du menu, et la première carte est celle qui s'affiche à l'ouverture de la
// rubrique : l'image des sols, qui montre l'artificialisation là où elle est, puis la part par
// territoire. La surface en hectares n'a pas de carte : ses cercles ne se lisaient qu'aux mailles
// les plus larges, et elle reste donnée par les chiffres clés.
export const ARTIF_STOCK_INDICATORS: Indicator[] = [
    {
        id: 'artif_soils',
        label: 'Sols artificialisés',
        description:
            'Image de l’OCS GE publiée par l’IGN : chaque objet y est dessiné, artificialisé ou non, du pays entier jusqu’à la rue. En zoomant jusqu’à la commune, la carte dessine les objets eux-mêmes, que l’on peut survoler.',
        type: 'map',
        // Ni unité ni décimales : la carte dessine une nature de sol, pas une valeur par territoire
        gridded: true,
        source: 'ocsge',
        // L'image recouvre les territoires, qui ne servent qu'à ouvrir une zone : le pays se parcourt
        // par région, puis une région par EPCI (demande de l'utilisateur : « passe de région à EPCI
        // une fois cliqué, au lieu de commune »). Par EPCI, le pays menait d'un clic à un seul EPCI
        // découpé en communes.
        openingScales: { NATION: 'REGION', REGION: 'EPCI' },
        charts: STOCK_CHARTS,
    },
    {
        id: 'artif_pct',
        label: 'Part du territoire artificialisée (en pourcentage)',
        description: 'Surface artificialisée au dernier millésime OCS GE du territoire, rapportée à sa superficie.',
        type: 'map',
        unit: '%',
        decimals: 1,
        source: 'ocsge',
        charts: STOCK_CHARTS,
    },
];

// La rubrique s'ouvre sur le rythme annuel en pourcentage : la durée entre deux millésimes va de 2 à
// 5 ans selon les départements, et seule une valeur ramenée à l'année et à la surface se compare
// d'un territoire à l'autre. Les anneaux montrent ensuite les deux flux bruts, en hectares.
// L'artificialisation nette sur toute la durée, en pourcentage ou en hectares, et son rythme annuel
// en hectares n'ont pas de carte : la première reste la version relative des anneaux sur la vue de
// toutes les communes du pays, les autres sont données par les chiffres clés et l'infobulle.
export const ARTIF_FLUX_INDICATORS: Indicator[] = [
    {
        id: 'artif_net_annual_pct_surface',
        label: 'Rythme annuel d’artificialisation nette (en pourcentage de la surface du territoire par an)',
        description:
            'Artificialisation nette entre les deux derniers millésimes OCS GE, divisée par le nombre d’années qui les séparent (de 2 à 5 ans selon les départements) et rapportée à la superficie du territoire.',
        type: 'map',
        unit: '%/an',
        decimals: 3,
        palette: 'diverging',
        source: 'ocsge',
        charts: FLUX_CHARTS,
    },
    {
        id: 'artif_desartif_ha',
        label: 'Artificialisation et désartificialisation entre les deux derniers millésimes (en hectares)',
        description:
            'Surfaces artificialisées et surfaces désartificialisées entre les deux derniers millésimes OCS GE du territoire. La taille de chaque anneau porte leur somme, ses deux arcs leur partage ; leur différence est l’artificialisation nette.',
        type: 'map',
        unit: 'ha',
        decimals: 1,
        rings: true,
        // Par EPCI, presque aucun anneau du pays n'atteint la taille où son partage se lit : la carte
        // s'y ouvre par département
        openingScales: { NATION: 'DEPART' },
        // À l'échelle de toutes les communes du pays, la carte est celle de l'artificialisation nette
        relative: {
            key: 'artif_net_pct_surface',
            label: 'Artificialisation nette entre les deux derniers millésimes (en pourcentage de la surface du territoire)',
            unit: '%',
            decimals: 2,
            amount: 'artif_net_ha',
        },
        signed: true,
        source: 'ocsge',
        charts: FLUX_CHARTS,
    },
];

export const ARTIF_INDICATORS: Indicator[] = [...ARTIF_STOCK_INDICATORS, ...ARTIF_FLUX_INDICATORS];

export const findArtifIndicator = (id: string | null | undefined): Indicator | undefined => ARTIF_INDICATORS.find((i) => i.id === id);

export const isArtifFluxIndicator = (indicator: Pick<Indicator, 'id'>): boolean => ARTIF_FLUX_INDICATORS.some((i) => i.id === indicator.id);

// Indicateurs en rythme annuel : le flux de chaque département est divisé par la durée entre ses millésimes
const isAnnualIndicator = (indicator: Pick<Indicator, 'unit'>): boolean => indicator.unit === 'ha/an' || indicator.unit === '%/an';

// --- Anneaux de deux flux ---------------------------------------------------------------

// Rouge pour l'artificialisation, bleu pour la désartificialisation (jamais vert / rouge) : couleur
// des deux arcs d'un anneau
export const SIGNED_SYMBOL_COLORS = { increase: '#b2182b', decrease: '#2166ac' };

// --- Millésimes -------------------------------------------------------------------------
// Tous les textes qui désignent un millésime viennent de domain/millesimes.ts : « millésime n°2
// (2020) », comme sur le reste du site, et jamais une année seule.

export const millesimeKindOf = (indicator: Pick<Indicator, 'id'>): MillesimeKind => (isArtifFluxIndicator(indicator) ? 'flux' : 'stock');

// Précision ajoutée à la valeur d'un territoire dans l'infobulle : son millésime, ou celui du jeu
// de millésimes qu'il partage avec d'autres communes (« au millésime n°2 (2020) », « entre le
// millésime n°1 (2017) et le millésime n°2 (2020) »). Chaîne vide pour un territoire sans millésime.
export const artifValueNote = (land: NationalMapYearSet, indicator: Pick<Indicator, 'id'>): string => {
    const reading = landsMillesimeReading([land], millesimeKindOf(indicator));
    return reading ? ` ${reading.long}` : '';
};

// Au-delà de ce nombre, les territoires sans donnée sont comptés plutôt que nommés
const MAX_NAMED_MISSING = 6;

const missingSentence = (missingNames: string[]): string => {
    if (missingNames.length === 0) return '';
    const cause = 'la couverture OCS GE y est incomplète';
    if (missingNames.length > MAX_NAMED_MISSING) return ` Donnée non disponible pour ${missingNames.length} territoires (hachurés) : ${cause}.`;
    return ` Donnée non disponible pour ${missingNames.join(', ')} (hachurés) : ${cause}.`;
};

// Territoires qui n'ont qu'un millésime : une carte de flux n'a rien à y mesurer
const withoutFluxSentence = (count: number): string => {
    if (count === 0) return '';
    const lands = count === 1 ? 'Un territoire n’a' : `${count} territoires n’ont`;
    return ` ${lands} qu’un millésime (hachurés) : il en faut deux pour mesurer une évolution.`;
};

const SOURCE = 'Source : OCS GE (IGN).';
const COMPARABILITY = ' Les années diffèrent selon les départements : les valeurs ne sont pas strictement comparables d’un territoire à l’autre.';

// Note de la carte : source, millésimes des territoires affichés et mise en garde sur la
// comparabilité ; territoires sans donnée. `lands` : valeurs des territoires affichés. `subject` :
// ce qui est au millésime annoncé, quand ce n'est pas toute la carte (carte des sols, dont l'image
// vient de l'IGN).
export const artifFootnote = (
    lands: NationalMapArtifLand[],
    indicator: Pick<Indicator, 'id' | 'unit' | 'signed'>,
    missingNames: string[] = [],
    subject = 'Valeurs',
): string => {
    const kind = millesimeKindOf(indicator);
    const reading = landsMillesimeReading(lands, kind);
    const missing = missingSentence(missingNames);
    const withoutFlux = kind === 'flux' ? withoutFluxSentence(countWithoutFlux(lands)) : '';
    if (!reading) return `${SOURCE}${withoutFlux}${missing || (withoutFlux ? '' : ' Aucune donnée pour les territoires affichés.')}`;
    const comparability = reading.varies ? COMPARABILITY : '';
    if (kind === 'stock') return `${SOURCE} ${subject} ${reading.long}.${comparability}${missing}`;
    const annual = isAnnualIndicator(indicator) ? ' Le rythme annuel divise le flux de chaque département par la durée entre ses deux millésimes.' : '';
    return `${SOURCE} Évolution mesurée ${reading.long}.${comparability}${annual}${withoutFlux}${missing}`;
};

// --- Chiffres clés ----------------------------------------------------------------------

export type ArtifTotals = {
    // Territoires affichés avec et sans donnée OCS GE
    withData: number;
    withoutData: number;
    artifHa: number | null;
    // Part artificialisée de l'ensemble des territoires renseignés
    artifPct: number | null;
    netHa: number | null;
    annualNetHa: number | null;
    // Flux bruts dont l'artificialisation nette est la différence
    grossArtifHa: number | null;
    grossDesartifHa: number | null;
};

const sum = (values: (number | null)[]): number | null => {
    const present = values.filter((v): v is number => v !== null && v !== undefined);
    return present.length > 0 ? present.reduce((a, b) => a + b, 0) : null;
};

// Totaux des territoires affichés. La part artificialisée rapporte la surface artificialisée
// à la superficie des seuls territoires renseignés.
export const artifTotals = (lands: NationalMapArtifLand[]): ArtifTotals => {
    const known = lands.filter((land) => land.artif_ha !== null);
    const artifHa = sum(known.map((land) => land.artif_ha));
    const surfaceHa = sum(known.map((land) => land.surface_ha));
    return {
        withData: known.length,
        withoutData: lands.length - known.length,
        artifHa,
        artifPct: artifHa !== null && surfaceHa ? (artifHa / surfaceHa) * 100 : null,
        netHa: sum(known.map((land) => land.artif_net_ha)),
        annualNetHa: sum(known.map((land) => land.artif_net_annual_ha)),
        grossArtifHa: sum(known.map((land) => land.artif_gross_ha)),
        grossDesartifHa: sum(known.map((land) => land.desartif_gross_ha)),
    };
};
