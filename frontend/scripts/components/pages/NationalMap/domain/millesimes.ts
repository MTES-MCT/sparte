// Lecture des millésimes de l'OCS GE, la même partout dans la rubrique d'artificialisation de la
// carte nationale. L'OCS GE est produite département par département, à des années différentes :
// comme sur le reste du site, un millésime est désigné par son index (« millésime n°2 »),
// comparable d'un département à l'autre, et suivi des années qu'il recouvre pour les territoires
// affichés (« 2020 », ou « 2020 à 2023 » quand elles diffèrent selon les départements). Les
// graphiques de la colonne écrivent leurs sous-titres dans les mêmes mots (voir
// project/charts/mixins/NationalMapChartMixin.py). Aucun autre fichier ne compose ces textes.
import type { Millesime } from '@services/types/land';

// Stock : une valeur à un millésime. Flux : une évolution entre deux millésimes.
export type MillesimeKind = 'stock' | 'flux';

// Un millésime représenté : son index, et ses années (plusieurs quand il rassemble des départements).
// `index` : null quand la réponse ne le donne pas ; le millésime n'est alors désigné que par ses années.
export type MillesimeSpan = { index: number | null; years: number[] };

// Les deux millésimes entre lesquels un flux est mesuré
export type MillesimePair = { previous: MillesimeSpan; last: MillesimeSpan };

// Ce qu'un territoire (ou un département) montre : son dernier millésime, celui d'un stock, et
// ses deux derniers, ceux d'un flux. `last` : null quand la réponse ne porte que les millésimes du
// flux ; `flux` : null quand le territoire n'a qu'un millésime, où aucune évolution ne se mesure.
export type ShownMillesimes = { last: MillesimeSpan | null; flux: MillesimePair | null };

// Millésimes d'un territoire dans les réponses de la carte : les années et l'index du stock, puis
// ceux des deux millésimes du flux. Tout est facultatif : une réponse ne porte que ceux de sa carte.
export type LandMillesimes = {
    artif_years?: number[];
    artif_index?: number | null;
    artif_net_years_old?: number[];
    artif_net_years_new?: number[];
    artif_net_index_old?: number | null;
    artif_net_index_new?: number | null;
};

export type MillesimeReading = {
    kind: MillesimeKind;
    // Désignation seule : « Millésime n°2 », « Millésimes n°1 et n°2 »
    title: string;
    // Ce qui la précise, à lire à côté : « 2020 », « 2020 à 2023 », « 2017 puis 2020 »
    detail: string;
    // Libellé court : « Millésime n°2 (2020 à 2023) », « Millésimes n°1 (2017) et n°2 (2020) »
    short: string;
    // Libellé long, à la suite d'une valeur ou dans une phrase : « au millésime n°2 (2020 à 2023) »,
    // « entre le millésime n°1 (2017) et le millésime n°2 (2020) »
    long: string;
    // Les années d'un même millésime diffèrent-elles selon les départements, ou l'index du millésime
    // représenté selon les territoires ? Les valeurs ne sont alors pas strictement comparables.
    varies: boolean;
    // Le dernier millésime n'a pas le même index partout : la carte montre celui de chaque territoire
    mixed: boolean;
};

const present = <T>(value: T | null): value is T => value !== null;

const unique = (years: number[]): number[] => [...new Set(years.filter((year) => Number.isFinite(year)))].sort((a, b) => a - b);

// « 2020 », ou « 2020 à 2023 » pour un millésime produit sur plusieurs années selon les départements
export const yearsRange = (years: number[]): string => {
    const sorted = unique(years);
    if (sorted.length === 0) return '';
    const [first, last] = [sorted[0], sorted.at(-1)];
    return first === last ? String(first) : `${first} à ${last}`;
};

// « n°2 (2020) » : l'index d'un millésime puis ses années ; ses années seules quand l'index manque
export const millesimeNumber = ({ index, years }: MillesimeSpan): string => {
    const range = yearsRange(years);
    if (index === null) return range;
    return range ? `n°${index} (${range})` : `n°${index}`;
};

// Millésimes d'un territoire d'une réponse de la carte ; null sans millésime (pas d'OCS GE complète)
export const shownOfLand = (land: LandMillesimes): ShownMillesimes | null => {
    const stockYears = land.artif_years ?? [];
    const previousYears = land.artif_net_years_old ?? [];
    const lastYears = land.artif_net_years_new ?? [];
    const last = stockYears.length > 0 ? { index: land.artif_index ?? null, years: stockYears } : null;
    const flux =
        previousYears.length > 0 && lastYears.length > 0
            ? { previous: { index: land.artif_net_index_old ?? null, years: previousYears }, last: { index: land.artif_net_index_new ?? null, years: lastYears } }
            : null;
    return last || flux ? { last, flux } : null;
};

// Millésimes de chaque département d'une liste de millésimes (fiche d'un territoire) : son dernier,
// et celui dont l'index le précède
export const shownOfDepartments = (millesimes: Pick<Millesime, 'departement' | 'index' | 'year'>[]): ShownMillesimes[] => {
    const byDepartment = new Map<string, Map<number, number>>();
    millesimes.forEach(({ departement, index, year }) => {
        if (!byDepartment.has(departement)) byDepartment.set(departement, new Map());
        (byDepartment.get(departement) as Map<number, number>).set(index, year);
    });
    return [...byDepartment.values()].map((years) => {
        const lastIndex = Math.max(...years.keys());
        const span = (index: number): MillesimeSpan => ({ index, years: [years.get(index) as number] });
        return { last: span(lastIndex), flux: years.has(lastIndex - 1) ? { previous: span(lastIndex - 1), last: span(lastIndex) } : null };
    });
};

// Millésimes de même index réunis, leurs années mises en commun, par index croissant
const merged = (spans: MillesimeSpan[]): MillesimeSpan[] => {
    const years = new Map<number | null, number[]>();
    spans.forEach((span) => years.set(span.index, [...(years.get(span.index) ?? []), ...span.years]));
    return [...years].map(([index, all]) => ({ index, years: unique(all) })).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
};

const severalYears = (spans: MillesimeSpan[]): boolean => spans.some((span) => unique(span.years).length > 1);

const stockReading = (shown: ShownMillesimes[]): MillesimeReading | null => {
    const spans = merged(shown.map(({ last }) => last).filter(present));
    if (spans.length === 0) return null;
    const varies = spans.length > 1 || severalYears(spans);
    const [only] = spans;
    if (spans.length === 1 && only.index !== null) {
        const number = millesimeNumber(only);
        return { kind: 'stock', title: `Millésime n°${only.index}`, detail: yearsRange(only.years), short: `Millésime ${number}`, long: `au millésime ${number}`, varies, mixed: false };
    }
    // Index inconnu : le millésime n'a que ses années
    if (spans.length === 1) {
        const detail = yearsRange(only.years);
        return { kind: 'stock', title: 'Dernier millésime', detail, short: `Dernier millésime (${detail})`, long: `au dernier millésime (${detail})`, varies, mixed: false };
    }
    // Le dernier millésime n'a pas le même index partout : la carte montre celui de chaque territoire
    const detail = spans.map(millesimeNumber).join(' ou ');
    return {
        kind: 'stock',
        title: 'Dernier millésime de chaque territoire',
        detail,
        short: `Dernier millésime de chaque territoire : ${detail}`,
        long: `au dernier millésime de chaque territoire : ${detail}`,
        varies,
        mixed: true,
    };
};

// Couples de millésimes de mêmes index réunis, par index croissant
const mergedPairs = (shown: ShownMillesimes[]): MillesimePair[] => {
    const groups = new Map<string, MillesimePair[]>();
    shown.forEach(({ flux }) => {
        if (!flux) return;
        const key = `${flux.previous.index}|${flux.last.index}`;
        groups.set(key, [...(groups.get(key) ?? []), flux]);
    });
    return [...groups.values()]
        .map((pairs) => ({ previous: merged(pairs.map((pair) => pair.previous))[0], last: merged(pairs.map((pair) => pair.last))[0] }))
        .sort((a, b) => (a.last.index ?? 0) - (b.last.index ?? 0));
};

const fluxReading = (shown: ShownMillesimes[]): MillesimeReading | null => {
    const pairs = mergedPairs(shown);
    if (pairs.length === 0) return null;
    const varies = pairs.length > 1 || severalYears(pairs.flatMap(({ previous, last }) => [previous, last]));
    const [{ previous, last }] = pairs;
    if (pairs.length === 1 && previous.index !== null && last.index !== null) {
        return {
            kind: 'flux',
            title: `Millésimes n°${previous.index} et n°${last.index}`,
            detail: `${yearsRange(previous.years)} puis ${yearsRange(last.years)}`,
            short: `Millésimes ${millesimeNumber(previous)} et ${millesimeNumber(last)}`,
            long: `entre le millésime ${millesimeNumber(previous)} et le millésime ${millesimeNumber(last)}`,
            varies,
            mixed: false,
        };
    }
    if (pairs.length === 1) {
        const detail = `${yearsRange(previous.years)} puis ${yearsRange(last.years)}`;
        return {
            kind: 'flux',
            title: 'Deux derniers millésimes',
            detail,
            short: `Deux derniers millésimes (${detail})`,
            long: `entre les deux derniers millésimes (${detail})`,
            varies,
            mixed: false,
        };
    }
    // Les deux derniers millésimes n'ont pas les mêmes index partout
    const detail = pairs.map((pair) => `${millesimeNumber(pair.previous)} et ${millesimeNumber(pair.last)}`).join(', ou ');
    return {
        kind: 'flux',
        title: 'Deux derniers millésimes de chaque territoire',
        detail,
        short: `Deux derniers millésimes de chaque territoire : ${detail}`,
        long: `entre les deux derniers millésimes de chaque territoire : ${detail}`,
        varies,
        mixed: true,
    };
};

// Lecture des millésimes d'un ensemble de territoires ou de départements, pour une carte ou un
// graphique de stock ou de flux ; null quand aucun n'a le ou les millésimes qu'il lui faut
export const millesimeReading = (shown: ShownMillesimes[], kind: MillesimeKind): MillesimeReading | null => (kind === 'flux' ? fluxReading(shown) : stockReading(shown));

// Lecture des territoires affichés par une carte (réponses « indicateurs d'artificialisation » et
// « valeurs »)
export const landsMillesimeReading = (lands: LandMillesimes[], kind: MillesimeKind): MillesimeReading | null => millesimeReading(lands.map(shownOfLand).filter(present), kind);

// Lecture d'un territoire d'après les millésimes de sa fiche (`millesimes` de /api/lands) : celle
// de ses graphiques, qui décrivent la zone entière
export const departmentsMillesimeReading = (millesimes: Pick<Millesime, 'departement' | 'index' | 'year'>[], kind: MillesimeKind): MillesimeReading | null =>
    millesimeReading(shownOfDepartments(millesimes), kind);

// Territoires qui ont un millésime mais pas celui d'avant : aucun flux ne s'y mesure
export const countWithoutFlux = (lands: LandMillesimes[]): number =>
    lands
        .map(shownOfLand)
        .filter(present)
        .filter(({ last, flux }) => last !== null && flux === null).length;

// Départements d'outre-mer : leur code a trois chiffres (971 à 976)
const isOverseas = (departement: string): boolean => departement.length === 3 && departement.startsWith('97');

// Lignes du tableau des années par département, pour le territoire affiché : par index, puis par
// année, puis par nom de département. L'Hexagone n'a pas de fiche : ses lignes sont celles de la
// France entière, sans les départements d'outre-mer.
export const millesimeRows = (millesimes: Millesime[], { hexagoneOnly = false }: { hexagoneOnly?: boolean } = {}): Millesime[] =>
    millesimes
        .filter(({ departement }) => !hexagoneOnly || !isOverseas(departement))
        .sort((a, b) => a.index - b.index || a.year - b.year || (a.departement_name ?? a.departement).localeCompare(b.departement_name ?? b.departement, 'fr'));

// --- Explication ------------------------------------------------------------------------

// Section de l'explication des millésimes : son icône, son titre et ses paragraphes
export type ExplanationSection = { icon: string; title: string; paragraphs: string[] };

// Libellé du renvoi qui ouvre l'explication, partout où un millésime est cité
export const EXPLAIN_LABEL = 'Qu’est-ce qu’un millésime ?';

// Ce que la barre de titre dit à la place des millésimes quand aucun territoire affiché n'en a
export const NO_MILLESIME_LABEL = 'Millésimes de l’OCS GE';

const WHY_A_NUMBER: ExplanationSection = {
    icon: 'bi bi-question-circle',
    title: 'Pourquoi un numéro plutôt qu’une année ?',
    paragraphs: [
        'Les départements ne sont pas cartographiés la même année : un même millésime de l’OCS GE porte donc des années différentes d’un département à l’autre.',
        'C’est pourquoi un millésime est désigné par son numéro d’ordre : le millésime n°1 est le premier disponible pour un département, le millésime n°2 le suivant, et ainsi de suite. ' +
            'Le numéro se compare d’un département à l’autre ; l’année, elle, est rappelée entre parenthèses : « millésime n°2 (2020) », ou « millésime n°2 (2020 à 2023) » quand elle diffère selon les départements.',
    ],
};

export type ExplanationInput = {
    kind: MillesimeKind;
    // Lecture des territoires affichés par la carte ; null quand aucun n'a ce qu'il lui faut
    reading: MillesimeReading | null;
    // Nom du territoire affiché, et millésimes de sa fiche : ceux du tableau qui suit l'explication
    zoneName: string;
    zoneMillesimes: Pick<Millesime, 'departement' | 'index' | 'year'>[];
    // La carte dessine l'image des sols publiée par l'IGN, qui a son propre calendrier
    image?: boolean;
};

const shownParagraphs = ({ kind, reading, zoneName, zoneMillesimes, image = false }: ExplanationInput): string[] => {
    if (!reading) {
        return [
            kind === 'flux'
                ? 'Aucun territoire affiché n’a deux millésimes : il en faut deux pour mesurer une évolution.'
                : 'Aucun territoire affiché n’est entièrement couvert par un millésime de l’OCS GE.',
        ];
    }
    const paragraphs = [
        kind === 'flux'
            ? `Sur cette carte, l’évolution de chaque territoire affiché est mesurée ${reading.long}.`
            : `Sur cette carte, chaque territoire affiché est représenté ${reading.long}.`,
    ];
    if (reading.mixed) paragraphs.push('Tous les départements n’ont pas le même nombre de millésimes : le dernier millésime n’a donc pas le même numéro partout.');
    if (reading.varies) {
        paragraphs.push(
            kind === 'flux'
                ? 'Les valeurs de deux territoires ne portent pas forcément sur les mêmes années, ni sur la même durée : elles ne sont pas strictement comparables. Les rythmes annuels divisent l’évolution de chaque département par sa propre durée.'
                : 'Les valeurs de deux territoires ne portent pas forcément sur la même année : elles ne sont pas strictement comparables.',
        );
    }
    // Des territoires affichés (EPCI) débordent parfois de la zone sur un département voisin
    const zoneReading = departmentsMillesimeReading(zoneMillesimes, kind);
    if (zoneReading && zoneReading.short !== reading.short) {
        paragraphs.push(
            `Certains territoires affichés débordent de la zone (${zoneName}) sur un département voisin, dont ils portent aussi les années : elles peuvent différer de celles du tableau ci-dessous, qui ne décrit que la zone.`,
        );
    }
    if (image) {
        paragraphs.push(
            'L’image des sols est publiée par l’IGN, par génération de millésimes : son année peut différer de celle des chiffres, qui portent sur les millésimes indiqués ici.',
        );
    }
    return paragraphs;
};

// Ce que l'explication ajoute à celle du site (source des données, tableau des millésimes) :
// pourquoi un numéro, et ce que la carte affichée représente
export const millesimeExplanation = (input: ExplanationInput): ExplanationSection[] => [
    WHY_A_NUMBER,
    { icon: 'bi bi-map', title: 'Ce que montre cette carte', paragraphs: shownParagraphs(input) },
];
