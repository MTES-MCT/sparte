import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import AnnexeArticleR101Image from '@images/annexe-article-r-101-1-code-urbanisme.png';
import { useGetLandArtifStockIndexQuery, useGetProjectQuery } from '@services/api';
import { useMillesime } from '@hooks/useMillesime';
import { LandArtifStockIndex, defautLandArtifStockIndex } from '@services/types/landartifstockindex';
import { formatNumber } from '@utils/formatUtils';
import { LandMillesimeTable } from '@components/features/ocsge/LandMillesimeTable';
import { MillesimeDisplay } from '@components/features/ocsge/MillesimeDisplay';
import ContentZone, { ContentZoneMode } from '../editor/ContentZone';
import {
    ReportContainer,
    PrintLayout,
    PrintContent,
    MainContent,
    ReportTypography,
    TwoColumnLayout,
} from '../styles';
import ChartWithTable from '@components/charts/ChartWithTable';
import CoverPage from './CoverPage';
import Drawer from '@components/ui/Drawer';
import { useReportComparisonTerritories } from '../hooks';
import { ComparisonTerritoriesSettings, ComparisonTerritoriesCallout } from '../components';

export interface RapportLocalContent {
    comparison_territories?: string;
    consommation_raison_evolutions?: string;
    evaluation_respect_trajectoire?: string;
    consommation_repartition_naf?: string;
    consommation_desartificialisation?: string;
    consommation_autres_indicateurs?: string;
    consommation_evolution_demographie?: string;
    consommation_evolution_menages?: string;
}

interface RapportLocalProps {
    landData: LandDetailResultType;
    content: RapportLocalContent;
    mode: ContentZoneMode;
    projectId: number;
    onContentChange?: (key: string, value: string) => void;
    isSettingsOpen?: boolean;
    onSettingsChange?: (isOpen: boolean) => void;
}

const CONSO_START_YEAR = 2011;
const CONSO_END_YEAR = 2023;

const AnnexeImage = styled.img`
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 1.5rem 0;
    display: block;
    
    @media print {
        page-break-inside: avoid;
    }
`;

const SettingsSection = styled.div`
    margin-bottom: 1.5rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

const RapportLocal: React.FC<RapportLocalProps> = ({
    landData,
    content,
    mode,
    projectId,
    onContentChange,
    isSettingsOpen: externalIsSettingsOpen,
    onSettingsChange,
}) => {
    const [internalIsSettingsOpen, setInternalIsSettingsOpen] = useState(false);
    const isSettingsOpen = externalIsSettingsOpen ?? internalIsSettingsOpen;
    const setIsSettingsOpen = onSettingsChange || setInternalIsSettingsOpen;

    const handleChange = (key: keyof RapportLocalContent) => (value: string) => {
        onContentChange?.(key, value);
    };

    const { data: projectData } = useGetProjectQuery(String(projectId));

    const millesimes = landData.millesimes || [];
    const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
    const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

    const { defaultStockIndex } = useMillesime({
        millesimes_by_index: landData?.millesimes_by_index || []
    });

    const { data: landArtifStockIndexes } = useGetLandArtifStockIndexQuery({
        land_type: landData?.land_type,
        land_id: landData?.land_id,
        millesime_index: defaultStockIndex,
    }, {
        skip: !landData.has_ocsge
    });

    const latestArtifData: LandArtifStockIndex = useMemo(() =>
        landArtifStockIndexes?.find(
            (e: LandArtifStockIndex) => e.millesime_index === defaultStockIndex
        ) ?? defautLandArtifStockIndex,
        [landArtifStockIndexes, defaultStockIndex]
    );

    const {
        territories,
        comparisonLandIds,
        isDefaultSelection,
        excludedTerritories,
        handleAddTerritory,
        handleRemoveTerritory,
        handleResetTerritories,
    } = useReportComparisonTerritories({
        landId: landData?.land_id,
        landType: landData?.land_type,
        landName: landData?.name || '',
        contentComparisonTerritories: content.comparison_territories,
        projectComparisonLands: projectData?.comparison_lands,
        onContentChange: handleChange('comparison_territories'),
    });

    const settingsDrawer = mode === 'edit' && (
        <Drawer
            isOpen={isSettingsOpen}
            title="Paramètres du rapport"
            onClose={() => setIsSettingsOpen(false)}
        >
            <SettingsSection>
                <ComparisonTerritoriesSettings
                    territories={territories}
                    excludedTerritories={excludedTerritories}
                    isDefaultSelection={isDefaultSelection}
                    onAddTerritory={handleAddTerritory}
                    onRemoveTerritory={handleRemoveTerritory}
                    onReset={handleResetTerritories}
                />
            </SettingsSection>
        </Drawer>
    );

    const reportContent = (
        <>
            <section>
                <h2>Objet du rapport local de suivi de l'artificialisation des sols</h2>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Sur la décennie 2011-2021, 24 000 ha d'espaces naturels, agricoles et forestiers ont été consommés chaque année 
                        en moyenne en France, soit près de 5 terrains de football par heure. Les conséquences sont écologiques mais aussi socio-économiques.
                    </p>
                </div>

                <TwoColumnLayout>
                    <p>
                        La France s'est donc fixé, dans le cadre de la <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924" target="_blank" rel="noopener noreferrer">loi n° 2021-1104 du 22 août 2021</a> dite 
                        « Climat et résilience » complétée par la <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047866733" target="_blank" rel="noopener noreferrer">loi n° 2023-630 du 20 juillet 2023</a>,
                        l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec un objectif intermédiaire de réduction de moitié 
                        de la consommation d'espaces NAF sur 2021-2031 par rapport à la décennie précédente.
                    </p>
                    <p>
                        Cette trajectoire progressive est à décliner territorialement dans les documents de planification et d'urbanisme.
                    </p>
                    <p>
                        Cette trajectoire est mesurée, pour la période 2021-2031, en consommation d'espaces NAF (Naturels, Agricoles et Forestiers), 
                        définie comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » 
                        (<a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957223" target="_blank" rel="noopener noreferrer">article 194, III, 5° de la loi Climat et résilience</a>).
                    </p>
                    <p>
                        A partir de 2031, cette trajectoire est également mesurée en artificialisation nette des sols, définie comme 
                        « le solde de l'artificialisation et de la désartificialisation des sols constatées sur un périmètre et sur une période donnés » 
                        (<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043967077/2023-09-04" target="_blank" rel="noopener noreferrer">article L.101-2-1 du code de l'urbanisme</a>).
                    </p>
                </TwoColumnLayout>
            </section>

            <section>
                <h2>Qui doit établir ce rapport ?</h2>

                <TwoColumnLayout>
                    <p>
                        <strong>Les communes ou les EPCI (établissements publics de coopération intercommunale) dotés d'un document d'urbanisme</strong>, 
                        établissent au minimum tous les 3 ans un rapport sur le rythme de l'artificialisation des sols et le respect des objectifs de sobriété foncière 
                        déclinés au niveau local (<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043977988" target="_blank" rel="noopener noreferrer">article L. 2231-1 du code général des collectivités territoriales</a>).
                    </p>
                    <p>
                        <strong>Pour les territoires soumis au règlement national d'urbanisme (RNU)</strong>, il revient aux <strong>services déconcentrés de l'Etat (DDT)</strong> de réaliser ce rapport.
                    </p>
                    <p>
                        L'enjeu est de mesurer et de <strong>communiquer</strong> régulièrement au sujet du rythme de l'artificialisation des sols, 
                        afin <strong>d'anticiper et de suivre</strong> la trajectoire et sa réduction.
                        Ce rapport doit être présenté à l'organe délibérant, faire l'objet d'un <strong>débat</strong> et d'une <strong>délibération</strong>, et de mesures de <strong>publicité</strong>.
                        Le rapport est <strong>transmis</strong> dans un délai de quinze jours suivant sa publication aux préfets de région et de département, 
                        au président du conseil régional, au président de l'EPCI ou aux maires des communes membres.
                    </p>
                </TwoColumnLayout>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Le premier rapport doit être réalisé 3 ans après l'entrée en vigueur de la loi, soit en 2024.
                    </p>
                </div>
            </section>

            <section>
                <h2>Que doit contenir ce rapport ?</h2>
                <TwoColumnLayout>
                    <p>
                        Le contenu minimal obligatoire est détaillé à l'<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048470630" target="_blank" rel="noopener noreferrer">article R. 2231-1 du code général des collectivités territoriales</a> :
                    </p>
                    <p>
                        <strong>1° La consommation des espaces naturels, agricoles et forestiers, exprimée en nombre d'hectares</strong>, 
                        le cas échéant en la différenciant entre ces types d'espaces, et en pourcentage au regard de la superficie du territoire couvert ;
                    </p>
                    <p>
                        <strong>2° Le solde entre les surfaces artificialisées et les surfaces désartificialisées</strong>, 
                        telles que définies dans la nomenclature annexée à l'article R. 101-1 du code de l'urbanisme ;
                    </p>
                    <p>
                        <strong>3° Les surfaces dont les sols ont été rendus imperméables</strong>, 
                        au sens des 1° et 2° de la nomenclature annexée à l'article R. 101-1 du code de l'urbanisme ;
                    </p>
                    <p>
                        <strong>4° L'évaluation du respect des objectifs de réduction</strong> de la consommation d'espaces naturels, agricoles et forestiers 
                        et de lutte contre l'artificialisation des sols fixés dans les documents de planification et d'urbanisme.
                    </p>
                </TwoColumnLayout>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Avant 2031, il n'est pas obligatoire de renseigner les indicateurs 2°, 3° et 4° tant que les documents d'urbanisme n'ont pas intégré cet objectif.
                    </p>
                </div>

                <TwoColumnLayout>
                    <p>
                        Le rapport <strong>explique les raisons des évolutions observées sur tout ou partie du territoire qu'il couvre</strong>, 
                        notamment l'impact des décisions prises en matière d'aménagement et d'urbanisme ou des actions de désartificialisation réalisées.
                    </p>
                    <p>
                        A noter que c'est le rapport qui est triennal, et non la période à couvrir par le rapport :
                    </p>
                    <p>
                        <strong>Il faut que le rapport soit produit a minima tous les 3 ans</strong>. Il est donc possible de produire un rapport plus fréquemment.
                    </p>
                    <p>
                        La période à couvrir n'est pas précisée dans les textes. Il est <strong>recommandé de présenter la chronique des données du 1er janvier 2011</strong> jusqu'au dernier millésime disponible.
                    </p>
                </TwoColumnLayout>

            </section>

            <section>
                <h2>Quelles sont les sources d'informations disponibles pour ce rapport ?</h2>

                <TwoColumnLayout>
                    <p>
                        Les données produites par l'<a href="https://artificialisation.developpement-durable.gouv.fr/" target="_blank" rel="noopener noreferrer">observatoire national de l'artificialisation</a> sont disponibles gratuitement. <strong>Mon Diagnostic Artificialisation vous propose une première trame de ce rapport local, en s'appuyant sur les données de l'observatoire national disponibles à date, soit :</strong>
                    </p>
                    <p>
                        <strong>Concernant la consommation d'espaces NAF</strong>, les données issues des fichiers fonciers produits annuellement par le Cerema. 
                    </p>
                    <p>
                        Ce rapport a été produit à partir des fichiers fonciers fournis par le Cerema au 1er janvier 2024 ;
                    </p>
                    <p>
                        <strong>Concernant l'artificialisation nette des sols</strong>, les données issues de l'occupation des sols à grande échelle (OCS GE) 
                        en cours de production par l'IGN, qui seront disponibles sur l'ensemble du territoire national d'ici fin 2025.
                    </p>
                </TwoColumnLayout>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Il n'est pas demandé d'inventer des données non encore disponibles : pour le premier rapport triennal à produire d'ici août 2024, 
                        il sera possible d'utiliser les fichiers fonciers au 1er janvier 2024.
                    </p>
                    <p className="fr-callout__text">
                        Il est également possible d'utiliser les données locales, notamment celles des observatoires de l'habitat et du foncier 
                        et de s'appuyer sur les analyses réalisées dans le cadre de l'évaluation du SCoT et du PLU(i).
                    </p>
                </div>
            </section>

            <section>
                <h2>1 Consommation des espaces NAF (Naturels, Agricoles et Forestiers)</h2>

                <div className="fr-badge fr-badge--warning fr-badge--sm fr-mb-3w">Indicateurs obligatoires</div>
                
                <div className="fr-callout">
                    <p className="fr-callout__text">
                        La consommation d'espaces entre le <strong>1er janvier {CONSO_START_YEAR} et le 1er janvier {CONSO_END_YEAR + 1}</strong> représente 
                        pour le territoire de <strong>{landData.name}</strong> une surface de <strong>{(landData.conso_details.conso_2011_2020 + landData.conso_details.conso_since_2021).toFixed(1)} hectares</strong>.
                    </p>
                </div>

                <h3>1.1 Évolution annuelle de la consommation</h3>

                <ChartWithTable
                    chartId="annual_total_conso_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />

                <h3>1.2 Répartition de la consommation totale par destination</h3>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        La répartition de la consommation d'espaces par destination permet d'identifier les principaux facteurs de consommation : 
                        habitat, activités économiques, infrastructures de transport, etc.
                    </p>
                </div>

                <ChartWithTable
                    chartId="pie_determinant_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />

                <h3>1.3 Évolution annuelle par destination</h3>

                <ChartWithTable
                    chartId="chart_determinant_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(CONSO_START_YEAR), end_date: String(CONSO_END_YEAR) }}
                    sources={["majic"]}
                />

                <div className="fr-mt-4w">
                    <ContentZone
                        content={content.consommation_raison_evolutions || ''}
                        mode={mode}
                        onChange={handleChange('consommation_raison_evolutions')}
                        placeholder="Il est obligatoire d'expliquer ici les raisons des évolutions observées dans la consommation d'espaces, notamment l'impact des décisions prises en matière d'aménagement et d'urbanisme."
                    />
                </div>

                <div className="fr-callout fr-callout--brown-caramel">
                    <p className="fr-callout__text">
                        Attention, les données issues des fichiers fonciers concernent uniquement la consommation d'espaces NAF, 
                        et ne prennent pas en compte la désartificialisation (définie par l'article 194 de la loi Climat et résilience 
                        comme "la transformation effective d'espaces urbanisés ou construits en espaces naturels, agricoles et forestiers").
                    </p>
                </div>
            </section>

            <section>
                <div className="fr-badge fr-badge--warning fr-badge--sm">Indicateurs optionnels</div>

                <h3>1.4 Différenciation de la consommation par types d'espaces naturels, agricoles et forestiers</h3>

                <ContentZone
                    content={content.consommation_repartition_naf || ''}
                    mode={mode}
                    onChange={handleChange('consommation_repartition_naf')}
                    placeholder=""
                />

                <div className="fr-callout fr-callout--brown-caramel fr-mt-4w">
                    <p className="fr-callout__text">
                        De façon optionnelle, il est possible d'indiquer ici, parmi les espaces NAF consommés sur la période de référence, 
                        la proportion des espaces agricoles, naturels, et forestiers. Cet indicateur n'est pas disponible sur l'observatoire national. 
                        Des données locales peuvent être utilisées.
                    </p>
                </div>


                <h3>1.5 Désartificialisation (transformation d'un espace urbanisé en un espace naturel, agricole, ou forestier)</h3>

                <ContentZone
                    content={content.consommation_desartificialisation || ''}
                    mode={mode}
                    onChange={handleChange('consommation_desartificialisation')}
                    placeholder=""
                />

                <div className="fr-callout fr-callout--brown-caramel fr-mt-4w">
                    <p className="fr-callout__text">
                        De façon optionnelle, il est possible d'indiquer les surfaces désartificialisées sur la période de référence.
                        La désartificialisation peut être décomptée du bilan de consommation d'espaces NAF, au choix de la commune ou de l'intercommunalité.
                        Cet indicateur n'est pas disponible sur l'observatoire national. Des données locales peuvent être utilisées.
                    </p>
                </div>

                <h3>1.6 Autres indicateurs optionnels</h3>

                <ContentZone
                    content={content.consommation_autres_indicateurs || ''}
                    mode={mode}
                    onChange={handleChange('consommation_autres_indicateurs')}
                    placeholder=""
                />

                <h3>1.7 Comparaison de la consommation annuelle absolue</h3>
                
                <ComparisonTerritoriesCallout
                    territories={territories}
                    landName={landData.name}
                    isDefaultSelection={isDefaultSelection}
                    mode={mode}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />

                <ChartWithTable
                    chartId="comparison_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{
                        start_date: String(CONSO_START_YEAR),
                        end_date: String(CONSO_END_YEAR),
                        ...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
                    }}
                    sources={["majic"]}
                />

                <h3>1.8 Comparaison de la consommation annuelle relative à la surface</h3>

                <ComparisonTerritoriesCallout
                    territories={territories}
                    landName={landData.name}
                    isDefaultSelection={isDefaultSelection}
                    mode={mode}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />

                <ChartWithTable
                    chartId="surface_proportional_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{
                        start_date: String(CONSO_START_YEAR),
                        end_date: String(CONSO_END_YEAR),
                        ...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
                    }}
                    sources={["majic"]}
                />

                <h3>1.9 Consommation relative aux évolutions démographiques</h3>
                <p className="fr-text--xs fr-text--muted">Bientôt disponible France Métropolitaine, Corse et DROM (sauf Mayotte).</p>

                <ContentZone
                    content={content.consommation_evolution_demographie || ''}
                    mode={mode}
                    onChange={handleChange('consommation_evolution_demographie')}
                    placeholder=""
                />

                <h3>1.10 Consommation relative à l'évolution des ménages</h3>
                <p className="fr-text--xs fr-text--muted">Bientôt disponible France Métropolitaine, Corse et DROM (sauf Mayotte).</p>

                <ContentZone
                    content={content.consommation_evolution_menages || ''}
                    mode={mode}
                    onChange={handleChange('consommation_evolution_menages')}
                    placeholder=""
                />
            </section>

            <section>
                <h2>2 Solde entre surfaces artificialisées et désartificialisées</h2>

                {landData.has_ocsge ? (
                    <>
                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                Il s'agit ici du bilan de l'artificialisation nette des sols tel que prévu par la loi, à partir de 2031, 
                                à l'échelle d'un document de planification ou d'urbanisme.
                            </p>
                        </div>

                        <TwoColumnLayout>
                            <p>
                                Ce bilan est calculé comme la différence entre les surfaces nouvellement artificialisées entre deux dates, 
                                et les surfaces nouvellement désartificialisées sur la même période.
                            </p>
                            <p>
                                L'annexe de l'article R. 101-1 du code de l'urbanisme définit la nomenclature des surfaces artificialisées et non-artificialisées :
                            </p>
                        </TwoColumnLayout>
                        
                        <AnnexeImage 
                            src={AnnexeArticleR101Image} 
                            alt="Annexe de l'article R. 101-1 du code de l'urbanisme - Nomenclature des surfaces artificialisées et non-artificialisées"
                        />

                        <h3>2.1 Définitions</h3>

                        <TwoColumnLayout>
                            <p>
                                L'article 192 modifie le code de l'urbanisme et donne une <strong>définition de l'artificialisation</strong> telle qu'elle doit être considérée et évaluée dans les documents d'urbanisme et de planification :
                            </p>
                            <p>
                                « Au sein des documents de planification et d'urbanisme, lorsque la loi ou le règlement prévoit des objectifs de réduction de l'artificialisation des sols ou de son rythme, ces objectifs sont fixés et évalués en considérant comme :
                            </p>
                            <p>
                                a) Artificialisée une surface dont les sols sont soit imperméabilisés en raison du bâti ou d'un revêtement, soit stabilisés et compactés, soit constitués de matériaux composites ; 
                            </p>
                            <p>
                                b) Non artificialisée une surface soit naturelle, nue ou couverte d'eau, soit végétalisée, constituant un habitat naturel ou utilisée à usage de cultures. 
                            </p>
                            <p>
                                Un décret en Conseil d'État fixe les conditions d'application du présent article. Il établit notamment une nomenclature des sols artificialisés ainsi que l'échelle à laquelle l'artificialisation des sols doit être appréciée dans les documents de planification et d'urbanisme. »
                            </p>
                            <p>
                                Cet article est le premier à définir textuellement ce qui doit être considéré comme artificialisé et non artificialisé. Les composantes des espaces artificialisés sont explicitement d'une grande finesse de définition, tant géographique que descriptive.
                            </p>
                            <p>
                                Le décret d'application du 29 avril 2022 précise encore la notion d'artificialisation au sens de la loi Climat et Résilience qui est traduite dans l'OCS GE comme la somme des surfaces anthropisées (CS1.1), sans les carrières (US1.3), et des surfaces herbacées (CS2.2) à usage de production secondaire, tertiaire, résidentielle ou réseaux (US2, US3, US235, US4, US5).
                            </p>
                        </TwoColumnLayout>


                        <h3>2.2 Détail de l'artificialisation</h3>

                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                <strong><MillesimeDisplay is_interdepartemental={landData.is_interdepartemental} landArtifStockIndex={latestArtifData} capitalize /></strong>, sur le territoire de {landData.name}, <strong>{formatNumber({ number: latestArtifData.surface })} ha</strong> étaient artificialisés, 
                                ce qui correspond à <strong>{formatNumber({ number: latestArtifData.percent })}%</strong> de sa surface totale ({formatNumber({ number: landData.surface })} ha).
                            </p>
                            <p className="fr-callout__text">
                                L'artificialisation nette <strong><MillesimeDisplay is_interdepartemental={landData.is_interdepartemental} landArtifStockIndex={latestArtifData} between={true} /></strong> est de <strong>{formatNumber({ number: latestArtifData.flux_surface, addSymbol: true })} ha</strong>.
                            </p>
                        </div>

                        <h3>2.3 Données disponibles</h3>
                        <TwoColumnLayout> 
                            <p>
                                La mesure de l'artificialisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle), actuellement en cours de production par l'IGN.
                            </p>
                            <p>
                                Cette donnée est produite tous les 3 ans par département. Chaque production est appelée un millésime.
                            </p>
                        </TwoColumnLayout>

                        {landData.millesimes && landData.millesimes.length > 0 && (
                            <LandMillesimeTable
                                millesimes={landData.millesimes}
                                territory_name={landData.name}
                                is_interdepartemental={landData.is_interdepartemental}
                            />
                        )}

                        <h3>2.4 Répartitions des surfaces artificialisées par couverture et usage</h3>

                        <h4>2.4.1 Répartition par type de couverture</h4>
                        
                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                La couverture du sol décrit la nature physique de ce qui recouvre le territoire.
                            </p>
                        </div>
                        
                        <ChartWithTable
                            chartId="pie_artif_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h4>2.4.2 Flux d'artificialisation par type de couverture</h4>

                        <ChartWithTable
                            chartId="artif_flux_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />

                        <h4>2.4.3 Répartition par type d'usage</h4>
                        
                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                L'usage du sol indique la fonction ou l'activité qui se déroule sur le territoire.
                            </p>
                        </div>

                        <ChartWithTable
                            chartId="pie_artif_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h4>2.4.4 Flux d'artificialisation par type d'usage</h4>

                        <ChartWithTable
                            chartId="artif_flux_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />
                    </>
                ) : (
                    <div className="fr-callout fr-callout--brown-caramel">
                        <p className="fr-callout__text">
                            Les données d'occupation des sols à grande échelle (OCS GE) ne sont pas disponibles pour ce territoire.
                        </p>
                    </div>
                )}
            </section>

            <section>
                <h2>3 Les surfaces dont les sols ont été rendus imperméables</h2>

                {landData.has_ocsge ? (
                    <>
                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                Il s'agit ici d'indiquer, à l'échelle d'un document de planification ou d'urbanisme, 
                                les surfaces dont les sols ont été rendus imperméables au sens des 1° et 2° de la nomenclature annexée à l'article R. 101-1 du code de l'urbanisme.
                            </p>
                        </div>

                        <h3>3.1 Répartition par type de couverture</h3>

                        <ChartWithTable
                            chartId="pie_imper_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3>3.2 Flux d'imperméabilisation par type de couverture</h3>

                        <ChartWithTable
                            chartId="imper_flux_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />

                        <h3>3.3 Répartition par type d'usage</h3>

                        <ChartWithTable
                            chartId="pie_imper_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3>3.4 Flux d'imperméabilisation par type d'usage</h3>

                        <ChartWithTable
                            chartId="imper_flux_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />
                    </>
                ) : (
                    <div className="fr-callout fr-callout--brown-caramel">
                        <p className="fr-callout__text">
                            Les données d'occupation des sols à grande échelle (OCS GE) ne sont pas disponibles pour ce territoire.
                        </p>
                    </div>
                )}
            </section>

            <section>
                <h2>4 Evaluation du respect des objectifs de réduction</h2>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Il s'agit ici d'indiquer, à partir de 2031, à l'échelle d'un document de planification ou d'urbanisme, 
                        les surfaces dont les sols ont été rendus imperméables entre deux dates.
                    </p>
                </div>

                <ContentZone
                    content={content.evaluation_respect_trajectoire || ''}
                    mode={mode}
                    onChange={handleChange('evaluation_respect_trajectoire')}
                    placeholder=""
                />

                <div className="fr-callout fr-callout--brown-caramel">
                    <p className="fr-callout__text">
                        Il s'agit ici, au vu des objectifs en vigueur fixés dans les documents de planification régionale 
                        (SRADDET, SDRIF, PADDUC, SAR), le cas échéant dans le SCoT et le PLU(i) applicable, d'évaluer la trajectoire de la commune ou de l'intercommunalité.
                    </p>
                    <p className="fr-callout__text">
                        Avant 2031, seule la trajectoire de consommation d'espaces NAF est à évaluer (et non l'artificialisation nette des sols).
                    </p>
                </div>
            </section>
        </>
    );

    if (mode === 'print') {
        return (
            <PrintLayout>
                <PrintContent>
                    <CoverPage
                        landData={landData}
                        reportTitle="Rapport local de suivi de l'artificialisation des sols"
                    />
                    <MainContent>
                        <ReportTypography>
                            {reportContent}
                        </ReportTypography>
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    return (
        <ReportContainer>
            {settingsDrawer}
            <CoverPage
                landData={landData}
                reportTitle="Rapport local de suivi de l'artificialisation des sols"
            />
            <MainContent>
                <ReportTypography>
                    {reportContent}
                </ReportTypography>
            </MainContent>
        </ReportContainer>
    );
};

export default RapportLocal;
