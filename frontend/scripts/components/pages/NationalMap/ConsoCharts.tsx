import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { theme } from '@theme';
import GenericChart, { DataSource } from '@components/charts/GenericChart';
import { djangoApi, useGetLandQuery } from '@services/api';
import type { LandDetailResultType } from '@services/types/land';
import type { AppDispatch, RootState } from '@store/store';
import ScatterChart from './components/ScatterChart';
import { ChartContext, ChartPeriod, ComplementaryChart, chartHeight, withChartLayout } from './components/narrowChartLayouts';
import type { CrossedScatter, ScatterModel, ShownOcsge } from './domain/frame/types';
import type { LandHighlight } from './domain/landHighlight';
import { LandMillesimes, chartScopeOf, millesimesOf } from './domain/ocsgeCharts';
import { useLast } from './hooks/useLast';
import { CROSSED_RATES_SCATTER } from './indicators';
import { LandRef, ZONE_HEXAGONE, chartsLandOf } from './zones';

// Ce qu'un graphique lit de la période choisie : rien (`none` : il ne dépend que du territoire),
// la période quelle qu'elle soit (`any`), ou une période d'au moins deux années (`several-years` :
// pour une seule, le serveur répond par une erreur)
type PeriodUse = 'none' | 'any' | 'several-years';

// Ce qu'un graphique de l'OCS GE lit des millésimes du territoire : rien qu'il faille dire au
// serveur (`all`), le dernier, ou les deux derniers, que le serveur attend par leur index
type MillesimeUse = 'all' | 'last' | 'last-two';

// Graphique complémentaire du catalogue : le graphique du serveur qui le dessine, variante
// « carte nationale » d'un graphique des diagnostics, dont elle ne change que le titre et le
// sous-titre (les diagnostics et l'export gardent les leurs). Plusieurs graphiques du catalogue
// peuvent présenter le même à leur façon.
// Seul le nuage de points des cartes bivariées n'en a pas : la page le dessine de la carte affichée.
type ChartSpec = {
    serverChart: string;
    sources: DataSource[];
    period: PeriodUse;
    // Faux : le serveur n'a pas ses données pour la nation (dossier complet de l'Insee, tenu de la région à la commune)
    nationwide: boolean;
    // Graphique de l'OCS GE : il n'existe que pour un territoire qu'elle couvre entièrement
    millesimes?: MillesimeUse;
};

// Fichiers fonciers (consommation d'espaces), recensements de l'Insee et occupation du sol à grande échelle
const LAND_FILES: DataSource[] = ['majic'];
const LAND_FILES_AND_INSEE: DataSource[] = ['majic', 'insee'];
const INSEE: DataSource[] = ['insee'];
const OCSGE: DataSource[] = ['ocsge'];

const CHART_SPECS: Record<ComplementaryChart, ChartSpec> = {
    conso_by_year_and_destination: { serverChart: 'chart_determinant_national_map', sources: LAND_FILES, period: 'several-years', nationwide: true },
    conso_habitat_by_year: { serverChart: 'chart_determinant_national_map', sources: LAND_FILES, period: 'several-years', nationwide: true },
    conso_activite_by_year: { serverChart: 'chart_determinant_national_map', sources: LAND_FILES, period: 'several-years', nationwide: true },
    conso_by_year: { serverChart: 'conso_annual_national_map', sources: LAND_FILES, period: 'none', nationwide: true },
    destination_share: { serverChart: 'pie_determinant_national_map', sources: LAND_FILES, period: 'several-years', nationwide: true },
    conso_and_population_by_year: { serverChart: 'population_conso_progression_chart_national_map', sources: LAND_FILES_AND_INSEE, period: 'several-years', nationwide: true },
    conso_and_households_by_year: { serverChart: 'dc_menages_evolution_national_map', sources: LAND_FILES_AND_INSEE, period: 'any', nationwide: false },
    employment_by_census: { serverChart: 'dc_emploi_chomage_national_map', sources: INSEE, period: 'none', nationwide: false },
    artif_share_by_millesime: { serverChart: 'artif_synthese_national_map', sources: OCSGE, period: 'none', nationwide: true, millesimes: 'all' },
    artif_by_cover: { serverChart: 'pie_artif_by_couverture_national_map', sources: OCSGE, period: 'none', nationwide: true, millesimes: 'last' },
    artif_and_desartif: { serverChart: 'artif_net_flux_national_map', sources: OCSGE, period: 'none', nationwide: true, millesimes: 'last-two' },
    artif_flux_by_cover: { serverChart: 'artif_flux_by_couverture_national_map', sources: OCSGE, period: 'none', nationwide: true, millesimes: 'last-two' },
};

// Un graphique tel que son emplacement le monte. `containerProps` garde son identité d'un rendu à l'autre.
type Chart = ChartSpec & { id: ComplementaryChart; containerProps: { style: React.CSSProperties } };

const CHARTS = new Map<string, Chart>(
    (Object.entries(CHART_SPECS) as [ComplementaryChart, ChartSpec][]).map(([id, spec]) => [
        id,
        { ...spec, id, containerProps: { style: { height: `${chartHeight(id)}px`, width: '100%' } } },
    ]),
);

// La nation : le seul territoire dont le serveur n'a pas le dossier complet de l'Insee
const NATION_LAND_TYPE = 'NATION';

// Graphiques connus d'une liste d'identifiants du catalogue
const knownCharts = (ids: string[]): Chart[] => ids.map((id) => CHARTS.get(id)).filter(Boolean);

// Ce dont dépend la requête d'un graphique : le territoire qu'il décrit, la période choisie
// (null pour une carte de l'OCS GE) et les millésimes OCS GE du territoire (null s'il n'est pas
// couvert en entier, ou pour une carte de la consommation, qui ne les demande pas)
type ChartTarget = { land: LandRef; period: ChartPeriod | null; millesimes: LandMillesimes | null };

const knownForLand = (chart: Chart, { land }: ChartTarget): boolean => chart.nationwide || land.land_type !== NATION_LAND_TYPE;
// Un flux se mesure entre deux millésimes
const knownForMillesimes = (chart: Chart, { millesimes }: ChartTarget): boolean =>
    !chart.millesimes || (millesimes !== null && (chart.millesimes !== 'last-two' || millesimes.previousYears.length > 0));
const knownForPeriod = (chart: Chart, { period }: ChartTarget): boolean =>
    chart.period === 'none' || (period !== null && (chart.period === 'any' || period.endYear > period.startYear));

// Graphiques que le serveur sait dessiner pour un territoire, ses millésimes et la période. Pour
// les autres, il répondrait par un graphique vide ou par une erreur : ils ne sont ni demandés ni
// affichés.
const chartsOfTarget = (charts: Chart[], target: ChartTarget): Chart[] =>
    charts.filter((chart) => knownForLand(chart, target) && knownForMillesimes(chart, target) && knownForPeriod(chart, target));

// Un graphique sans paramètre n'est pas rechargé quand la période change
const NO_PARAMS = {};

// Millésimes d'un graphique de l'OCS GE, tels que le serveur les attend : par leur index, comme
// les demandent les diagnostics
const MILLESIME_PARAMS: Record<MillesimeUse, (lastIndex: number) => object> = {
    all: () => NO_PARAMS,
    last: (lastIndex) => ({ index: lastIndex }),
    'last-two': (lastIndex) => ({ millesime_new_index: lastIndex, millesime_old_index: lastIndex - 1 }),
};

// Paramètres d'un graphique que le serveur sait dessiner pour la cible
const paramsOf = (chart: Chart, { period, millesimes }: ChartTarget): object => {
    if (chart.millesimes) return millesimes ? MILLESIME_PARAMS[chart.millesimes](millesimes.lastIndex) : NO_PARAMS;
    return chart.period === 'none' || !period ? NO_PARAMS : { start_date: String(period.startYear), end_date: String(period.endYear) };
};

// Requête d'un graphique : les arguments que GenericChart compose de son côté, pour que la
// colonne, le préchargement et le graphique lisent la même entrée du cache
const chartQuery = (chart: Chart, target: ChartTarget) => ({ id: chart.serverChart, land_id: target.land.land_id, land_type: target.land.land_type, ...paramsOf(chart, target) });

type ChartQuery = ReturnType<typeof chartQuery>;

// Fiche du territoire des graphiques d'une carte de l'OCS GE, où se lisent ses millésimes, comme
// le font les diagnostics. Elle n'est demandée que si l'un des graphiques les lit. `detail` reste
// indéfini tant que le serveur n'a pas répondu ; `failed` : il a répondu par une erreur.
const useLandDetail = (land: LandRef, charts: Chart[]): { needed: boolean; detail: LandDetailResultType | undefined; failed: boolean } => {
    const needed = charts.some((chart) => chart.millesimes);
    const { currentData, isError } = useGetLandQuery(land, { skip: !needed });
    return { needed, detail: needed ? currentData : undefined, failed: needed && isError };
};

// Précharge les graphiques d'une vue demandée, pour qu'ils soient en cache quand sa carte
// s'affiche : graphiques et carte changent alors ensemble. `charts` doit garder son identité
// d'un rendu à l'autre. Les graphiques de l'OCS GE sont demandés dès que la fiche du territoire
// a donné ses millésimes.
// La requête est lancée sans abonnement, que personne ne résilierait : la réponse attend en cache
// la colonne des graphiques, et en est purgée à l'échéance une fois la vue quittée.
export const usePrefetchConsoCharts = (zone: string, startYear: number, endYear: number, charts: string[]): void => {
    const dispatch = useDispatch<AppDispatch>();
    const land = useMemo(() => chartsLandOf(zone), [zone]);
    const { detail } = useLandDetail(land, knownCharts(charts));
    const millesimes = useMemo(() => (detail ? millesimesOf(detail) : null), [detail]);
    useEffect(() => {
        const target = { land, period: { startYear, endYear }, millesimes };
        chartsOfTarget(knownCharts(charts), target).forEach((chart) =>
            dispatch(djangoApi.endpoints.getChartConfig.initiate(chartQuery(chart, target), { subscribe: false })),
        );
    }, [dispatch, land, startYear, endYear, charts, millesimes]);
};

// S'abonne aux requêtes des graphiques d'une vue, et dit si le serveur a répondu à toutes, par des
// données ou par une erreur. L'abonnement garde leurs réponses en cache tant que la vue est celle
// de la carte, que la colonne l'affiche déjà ou non. `queries` doit garder son identité d'un rendu
// à l'autre.
const useChartsAnswered = (queries: ChartQuery[]): boolean => {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const requests = queries.map((query) => dispatch(djangoApi.endpoints.getChartConfig.initiate(query)));
        return () => requests.forEach((request) => request.unsubscribe());
    }, [dispatch, queries]);
    const answers = useMemo(() => queries.map((query) => djangoApi.endpoints.getChartConfig.select(query)), [queries]);
    return useSelector((state: RootState) =>
        answers.every((answerOf) => {
            const { isSuccess, isError } = answerOf(state);
            return isSuccess || isError;
        }),
    );
};

// Juste sous les chiffres clés dans la colonne à droite de la carte ; côte à côte quand la
// colonne, passée sous la carte, est assez large
const Band = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
    gap: ${theme.spacing.md};
    align-items: start;
`;

// Intertitre de la colonne, comme ceux du menu : il annonce les graphiques et leur nombre,
// une partie d'entre eux étant sous la ligne de flottaison
const Heading = styled.div.attrs({ role: 'heading', 'aria-level': 2 })`
    grid-column: 1 / -1;
    margin: 0 0 -0.4rem;
    font-size: 0.7rem;
    font-weight: ${theme.fontWeight.semibold};
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${theme.colors.textMuted};
`;

const Note = styled.p`
    grid-column: 1 / -1;
    margin: 0;
    font-size: ${theme.fontSize.xs};
    color: ${theme.colors.textMuted};
`;

// Le graphique d'une vue précédente est atténué, comme la carte pendant un chargement.
// `min-width: 0` : sans lui, la largeur en pixels que Highcharts donne à son conteneur
// empêcherait la colonne de rétrécir.
const Slot = styled.div<{ $stale: boolean }>`
    min-width: 0;
    opacity: ${({ $stale }) => ($stale ? 0.6 : 1)};
    transition: opacity 0.2s;
`;

// Ce que la colonne montre d'une vue de la carte : la zone, le territoire que ses graphiques
// décrivent, ce qu'ils en lisent, et les graphiques cochés. `land`, `period` et `millesimes`
// gardent leur identité tant qu'ils ne changent pas.
type ChartsView = ChartTarget &
    ChartContext & {
        zone: string;
        // Graphiques du serveur
        charts: Chart[];
        // La fiche du territoire, où se lisent ses millésimes, n'a pas pu être chargée
        landUnread: boolean;
        // Nuage de points de la carte, s'il est coché, ou ce qui empêche de le dessiner ; null sans lui
        scatter: CrossedScatter | null;
    };

// Nuage de points qu'une vue dessine, s'il y en a un
const scatterOf = (view: ChartsView | null): ScatterModel | null => (view?.scatter?.kind === 'points' ? view.scatter.model : null);

// Une vue montre-t-elle au moins un graphique ?
const showsCharts = (view: ChartsView): boolean => chartsOfTarget(view.charts, view).length > 0 || scatterOf(view) !== null;

// Un graphique lit-il la même chose de deux vues ? Le territoire, puis ses millésimes et ce que
// son sous-titre en dit pour l'OCS GE, ou la période pour la consommation. Un changement de
// période ne touche donc pas un graphique qui n'en dépend pas.
const readsSame = (chart: Chart, previous: ChartsView, next: ChartsView): boolean => {
    if (previous.land !== next.land) return false;
    if (chart.millesimes) return previous.millesimes === next.millesimes && previous.scope === next.scope;
    return chart.period === 'none' || previous.period === next.period;
};

// Vue que la colonne affiche : la dernière dont le serveur a donné tous les graphiques, tant
// qu'elle en montre ; une vue réduite à une note cède aussitôt la place à celle de la carte, dont
// les graphiques affichent leur chargeur. `wanted` : vue de la carte, null tant qu'elle n'est pas connue.
const displayedView = (answered: ChartsView | null, wanted: ChartsView | null): ChartsView | null =>
    answered && (wanted === null || showsCharts(answered)) ? answered : wanted;

interface ChartSlotProps {
    chart: Chart;
    // Vue que la colonne affiche : le serveur a répondu pour ce graphique, sauf au premier affichage
    view: ChartsView;
    // La carte montre déjà autre chose que ce graphique, dont le suivant charge
    stale: boolean;
}

// Emplacement d'un graphique. Ce qu'il remet à GenericChart garde son identité tant que le
// graphique lirait la même chose de la vue : GenericChart, mémorisé, n'est alors pas rendu de
// nouveau.
const ChartSlot = React.memo(({ chart, view, stale }: ChartSlotProps) => {
    const read = useLast(view, (previous, next) => readsSame(chart, previous, next)) ?? view;
    const params = useMemo(() => paramsOf(chart, read), [chart, read]);
    const transformOptions = useMemo(() => withChartLayout(chart.id, read), [chart, read]);

    return (
        <Slot $stale={stale} aria-busy={stale}>
            <GenericChart
                id={chart.serverChart}
                land_id={read.land.land_id}
                land_type={read.land.land_type}
                params={params}
                sources={chart.sources}
                showDataTable
                containerProps={chart.containerProps}
                transformOptions={transformOptions}
            />
        </Slot>
    );
});

ChartSlot.displayName = 'ChartSlot';

interface ConsoChartsProps {
    // Zone affichée, et territoire dont les graphiques existent : la nation pour la France entière et l'Hexagone
    zone: string;
    land: LandRef;
    // Période de la carte ; null pour une carte de l'OCS GE
    period: ChartPeriod | null;
    // Étendue des territoires affichés d'une carte de l'OCS GE ; null pour la consommation
    shownOcsge: ShownOcsge | null;
    // Nuage de points de la carte affichée, ou ce qui empêche de le dessiner ; null pour une carte qui n'en a pas
    scatter: CrossedScatter | null;
    // Canal par lequel le nuage et la carte se désignent le territoire survolé
    highlight: LandHighlight;
    // Identifiants des graphiques à afficher, dans l'ordre
    charts: string[];
}

const HEXAGONE_AS_FRANCE = "Les graphiques de l'Hexagone seul ne sont pas disponibles : ceux de la France entière sont affichés.";
const NO_OCSGE = "Les graphiques de cette carte ne sont pas disponibles pour ce territoire : l'OCS GE ne le couvre pas entièrement.";
const LAND_UNREAD = "Les graphiques de cette carte n'ont pas pu être chargés.";
const SINGLE_MILLESIME = "Les graphiques qui comparent deux millésimes de l'OCS GE ne sont pas disponibles : ce territoire n'en a qu'un.";

// Ce que la colonne dit des graphiques de l'OCS GE qu'elle n'affiche pas
const ocsgeNote = ({ landUnread, millesimes }: ChartsView): string => {
    if (landUnread) return LAND_UNREAD;
    return millesimes ? SINGLE_MILLESIME : NO_OCSGE;
};

// Graphiques dont parle une note : tous ceux de la carte, ou une partie
const chartsNamed = (all: boolean): string => (all ? 'Les graphiques de cette carte' : 'Certains graphiques de cette carte');

// Ce que la colonne dit des graphiques que le serveur n'a pas pour la nation
const nationwideNote = (allHidden: boolean): string =>
    `${chartsNamed(allHidden)} ne sont pas disponibles à l'échelle nationale : choisissez une région, un département ou un EPCI.`;

// Ce que la colonne dit des graphiques que la période d'une seule année retire
const singleYearNote = (allHidden: boolean): string => `${chartsNamed(allHidden)} ne sont disponibles que pour une période d'au moins deux années.`;

// Graphiques complémentaires de la carte, pour la zone affichée. L'Hexagone n'est pas un
// territoire en base : on affiche la France entière en le signalant. Quand des graphiques cochés
// n'existent pas pour la zone, pour ses millésimes ou pour la période, une note le dit à leur
// place : le menu continue de les proposer.
// La colonne passe d'une vue à la suivante d'un bloc, quand le serveur a répondu pour tous les
// graphiques de la suivante : en attendant, ceux de la vue précédente restent en place, atténués,
// même s'ils sont ceux d'une autre carte, et la colonne garde sa hauteur. Au premier affichage,
// GenericChart montre son chargeur ; quand une requête échoue, son message d'erreur.
// Le nuage de points d'une carte bivariée, premier de la colonne, ne dépend d'aucune requête : son
// emplacement apparaît et disparaît avec les autres, mais il y montre toujours le nuage de la
// carte affichée quand elle en a un.
const ConsoCharts: React.FC<ConsoChartsProps> = ({ zone, land, period, shownOcsge, scatter, highlight, charts }) => {
    const { land_type: landType, land_id: landId } = land;
    // Mêmes objets tant que le territoire, la période et les graphiques cochés ne changent pas : un
    // rendu de la page (rubrique ouverte, onglet mobile) ne rend pas les graphiques de nouveau
    const shownLand = useMemo<LandRef>(() => ({ land_type: landType, land_id: landId }), [landType, landId]);
    const startYear = period?.startYear ?? null;
    const endYear = period?.endYear ?? null;
    const shownPeriod = useMemo<ChartPeriod | null>(() => (startYear === null || endYear === null ? null : { startYear, endYear }), [startYear, endYear]);
    const chartIds = charts.join(' ');
    const checked = useMemo(() => knownCharts(chartIds.split(' ')), [chartIds]);
    const checkedScatter = charts.includes(CROSSED_RATES_SCATTER) ? scatter : null;

    const { needed, detail, failed } = useLandDetail(shownLand, checked);
    const millesimes = useMemo(() => (detail ? millesimesOf(detail) : null), [detail]);
    const scope = detail && shownOcsge ? chartScopeOf(detail, shownOcsge) : null;
    // Vue de la carte ; null tant que les millésimes dont ses graphiques dépendent ne sont pas connus
    const landRead = !needed || detail !== undefined || failed;
    const wanted = useMemo<ChartsView | null>(
        () => (landRead ? { zone, land: shownLand, period: shownPeriod, millesimes, scope, charts: checked, landUnread: failed, scatter: checkedScatter } : null),
        [landRead, zone, shownLand, shownPeriod, millesimes, scope, checked, failed, checkedScatter],
    );
    const queries = useMemo(() => (wanted ? chartsOfTarget(wanted.charts, wanted).map((chart) => chartQuery(chart, wanted)) : []), [wanted]);
    const answered = useChartsAnswered(queries);
    const view = displayedView(useLast(wanted !== null && answered ? wanted : null), wanted);
    if (!view || (view.charts.length === 0 && view.scatter === null)) return null;

    const forLand = view.charts.filter((chart) => knownForLand(chart, view));
    const covered = forLand.filter((chart) => knownForMillesimes(chart, view));
    const shown = covered.filter((chart) => knownForPeriod(chart, view));
    // Graphiques que la carte garde tels quels : ceux de sa vue, quand ils lisent la même chose de la vue affichée
    const current = wanted ? chartsOfTarget(wanted.charts, wanted).filter((chart) => readsSame(chart, view, wanted)) : [];
    // Nuage de la carte affichée, puis celui que l'emplacement montre : le sien, ou à défaut celui de la vue précédente
    const mapScatter = scatterOf(wanted);
    const shownScatter = scatterOf(view) && (mapScatter ?? scatterOf(view));
    const shownCount = shown.length + (shownScatter ? 1 : 0);

    return (
        <Band aria-label="Graphiques complémentaires">
            <Heading>
                Graphiques complémentaires{shownCount > 1 ? ` (${shownCount})` : ''}
            </Heading>
            {view.scatter?.kind === 'none' && <Note>{view.scatter.reason}</Note>}
            {view.charts.length > 0 && forLand.length === 0 && <Note>{nationwideNote(!shownScatter)}</Note>}
            {covered.length < forLand.length && <Note>{ocsgeNote(view)}</Note>}
            {shown.length < covered.length && <Note>{singleYearNote(shownCount === 0)}</Note>}
            {shown.length > 0 && view.zone === ZONE_HEXAGONE && <Note>{HEXAGONE_AS_FRANCE}</Note>}
            {shownScatter && (
                <Slot $stale={mapScatter === null} aria-busy={mapScatter === null}>
                    <ScatterChart model={shownScatter} highlight={highlight} />
                </Slot>
            )}
            {/* Une clé par graphique, pas par territoire : le graphique reste monté d'une vue à l'autre */}
            {shown.map((chart) => (
                <ChartSlot key={chart.id} chart={chart} view={view} stale={!current.includes(chart)} />
            ))}
        </Band>
    );
};

export default ConsoCharts;
