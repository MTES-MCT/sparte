import React, { useMemo } from 'react';
import { LandDetailResultType } from '@services/types/land';
import GenericChart from '@components/charts/GenericChart';
import AnnexeArticleR101Image from '@images/annexe-article-r-101-1-code-urbanisme.png';
import { useGetLandArtifStockIndexQuery } from '@services/api';
import { useMillesime } from '@hooks/useMillesime';
import { LandArtifStockIndex, defautLandArtifStockIndex } from '@services/types/landartifstockindex';
import { formatNumber } from '@utils/formatUtils';
import {
    ContentZone,
    ContentZoneMode,
} from '../editor';
import {
    Paragraph,
    ReportContainer,
    PrintLayout,
    PrintContent,
    MainContent,
    SectionContainer,
    SectionTitle,
    SubTitle,
    ChartContainer,
    DataTableContainer,
    HighlightBox,
    InfoBox,
    LegalReference,
} from '../styles';
import styled from 'styled-components';
import {
    ComparisonSection,
    ComparisonRelativeSection,
    ArtifCouvertureSection,
    ArtifUsageSection,
    ImperCouvertureSection,
    ImperUsageSection,
} from '../sections';
import CoverPage from './CoverPage';
import { LandMillesimeTable } from '@components/features/ocsge/LandMillesimeTable';

export interface RapportLocalContent {
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
    onContentChange?: (key: string, value: string) => void;
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

const RapportLocal: React.FC<RapportLocalProps> = ({
    landData,
    content,
    mode,
    onContentChange,
}) => {
    const handleChange = (key: keyof RapportLocalContent) => (value: string) => {
        onContentChange?.(key, value);
    };

    // Récupération des données d'artificialisation pour le millésime le plus récent
    const { defaultStockIndex } = useMillesime({
        millesimes_by_index: landData?.millesimes_by_index || []
    });

    const { data: landArtifStockIndexes } = useGetLandArtifStockIndexQuery({
        land_type: landData?.land_type,
        land_id: landData?.land_id,
        millesime_index: defaultStockIndex,
    }, {
        skip: !landData || !landData.has_ocsge
    });

    // Données du millésime le plus récent (2023)
    const latestArtifData: LandArtifStockIndex = useMemo(() =>
        landArtifStockIndexes?.find(
            (e: LandArtifStockIndex) => e.millesime_index === defaultStockIndex
        ) ?? defautLandArtifStockIndex,
        [landArtifStockIndexes, defaultStockIndex]
    );

    // Trouver le millésime de 2020
    const millesime2020Index = useMemo(() => {
        const millesime2020 = landData?.millesimes?.find(m => m.year === 2020);
        return millesime2020?.index;
    }, [landData?.millesimes]);

    // Récupération des données d'artificialisation pour 2020
    const { data: landArtifStockIndexes2020 } = useGetLandArtifStockIndexQuery({
        land_type: landData?.land_type,
        land_id: landData?.land_id,
        millesime_index: millesime2020Index || 0,
    }, {
        skip: !landData || !landData.has_ocsge || !millesime2020Index
    });

    const artifData2020: LandArtifStockIndex = useMemo(() =>
        landArtifStockIndexes2020?.find(
            (e: LandArtifStockIndex) => e.millesime_index === millesime2020Index
        ) ?? defautLandArtifStockIndex,
        [landArtifStockIndexes2020, millesime2020Index]
    );

    // Calcul de l'évolution depuis 2020
    const evolutionSince2020 = useMemo(() => {
        if (artifData2020 && artifData2020.surface > 0 && latestArtifData && latestArtifData.surface > 0) {
            return latestArtifData.surface - artifData2020.surface;
        }
        return null;
    }, [latestArtifData, artifData2020]);

    // Année du millésime le plus récent
    const latestYear = latestArtifData.years?.[0] || 2023;
    const reportContent = (
        <>
            <SectionContainer>
                <SectionTitle>Objet du rapport triennal local de suivi de l'artificialisation des sols</SectionTitle>
                <HighlightBox>
                    <p>
                        Sur la décennie 2011-2021, 24 000 ha d'espaces naturels, agricoles et forestiers
                        ont été consommés chaque année en moyenne en France, soit près de 5 terrains de
                        football par heure. Les conséquences sont écologiques mais aussi socio-économiques.
                    </p>
                </HighlightBox>
                <Paragraph>
                    La France s'est donc fixé, dans le cadre de la <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000043956924" target="_blank" rel="noopener noreferrer">loi n° 2021-1104 du 22 août 2021</a> dite 
                    « Climat et résilience » complétée par la <a href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000047866733" target="_blank" rel="noopener noreferrer">loi n° 2023-630 du 20 juillet 2023</a>,
                    l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec
                    un objectif intermédiaire de réduction de moitié de la consommation d'espaces NAF
                    sur 2021-2031 par rapport à la décennie précédente.
                </Paragraph>
                <Paragraph>
                    Cette trajectoire progressive est à décliner territorialement dans les documents de planification et d’urbanisme.
                </Paragraph>
                <Paragraph>
                    Cette trajectoire est mesurée, pour la période 2021-2031, en consommation d’espaces NAF (Naturels, Agricoles et Forestiers), définie comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (<a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957223" target="_blank" rel="noopener noreferrer">article 194, III, 5° de la loi Climat et résilience</a>).
                    Le bilan de consommation d'espaces NAF (Naturels, Agricoles et Forestiers) s'effectue à l'échelle d'un document de planification ou d'urbanisme.
                </Paragraph>
                <Paragraph>
                    A partir de 2031, cette trajectoire est également mesurée en artificialisation nette des sols, définie comme « le solde de l'artificialisation et de la désartificialisation des sols constatées sur un périmètre et sur une période donnés » (<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043967077/2023-09-04" target="_blank" rel="noopener noreferrer">article L.101-2-1 du code de l’urbanisme</a>).
                </Paragraph>
            </SectionContainer>

            <SectionContainer>
                <SectionTitle>Qui doit établir ce rapport ?</SectionTitle>
                <Paragraph>
                    <strong>Les communes ou les EPCI (établissements publics de coopération intercommunale) dotés d’un document d'urbanisme</strong>, établissent au minimum tous les 3 ans un rapport sur le rythme de l'artificialisation des sols et le respect des objectifs de sobriété foncière déclinés au niveau local (<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043977988" target="_blank" rel="noopener noreferrer">article L. 2231-1 du code général des collectivités territoriales</a>).
                </Paragraph>
                <Paragraph>
                    <strong>Pour les territoires soumis au règlement national d’urbanisme (RNU)</strong>, il revient aux <strong>services déconcentrés de l’Etat (DDT)</strong> de réaliser ce rapport.
                </Paragraph>
                <HighlightBox>
                    <p>
                        Le premier rapport doit être réalisé 3 ans après l'entrée en vigueur de la loi, soit en 2024.
                    </p>
                </HighlightBox>
                <Paragraph>
                    L’enjeu est de mesurer et de <strong>communiquer</strong> régulièrement au sujet du rythme de l’artificialisation des sols, afin <strong>d’anticiper et de suivre</strong> la trajectoire et sa réduction.
                    Ce rapport doit être présenté à l’organe délibérant, faire l’objet d’un <strong>débat</strong> et d’une <strong>délibération</strong> du conseil municipal ou communautaire, et de mesures de <strong>publicité</strong>.
                    Le rapport est <strong>transmis</strong> dans un délai de quinze jours suivant sa publication aux préfets de région et de département, au président du conseil régional, au président de l’EPCI dont la commune est membre ou aux maires des communes membres de l’EPCI compétent ainsi qu’aux observatoires locaux de l’habitat et du foncier.
                </Paragraph>
            </SectionContainer>


            <SectionContainer>
                <SectionTitle>Que doit contenir ce rapport ?</SectionTitle>
                <Paragraph>
                    Le contenu minimal obligatoire est détaillé à l'<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000048470630" target="_blank" rel="noopener noreferrer">article R. 2231-1 du code général des collectivités territoriales</a> :
                </Paragraph>
                <Paragraph>
                    <ul>
                        <li>« <strong>1° La consommation des espaces naturels, agricoles et forestiers, exprimée en nombre d'hectares</strong>, le cas échéant en la différenciant entre ces types d'espaces, et en pourcentage au regard de la superficie du territoire couvert. Sur le même territoire, le rapport peut préciser également la transformation effective d'espaces urbanisés ou construits en espaces naturels, agricoles et forestiers du fait d'une désartificialisation ;</li>
                        <li><strong>2° Le solde entre les surfaces artificialisées et les surfaces désartificialisées</strong>, telles que définies dans la nomenclature annexée à l'<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid" target="_blank" rel="noopener noreferrer">article R. 101-1 du code de l'urbanisme</a> ;</li>
                        <li><strong>3° Les surfaces dont les sols ont été rendus imperméables</strong>, au sens des 1° et 2° de la nomenclature annexée à l'<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid" target="_blank" rel="noopener noreferrer">article R. 101-1 du code de l'urbanisme</a> ;</li>
                        <li><strong>4° L'évaluation du respect des objectifs de réduction de la consommation d'espaces naturels, agricoles et forestiers et de lutte contre l'artificialisation des sols fixés dans les documents de planification et d'urbanisme.</strong>  Les documents de planification sont ceux énumérés au <a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000045729062&dateTexte=&categorieLien=cid" target="_blank" rel="noopener noreferrer">III de l'article R. 101-1 du code de l'urbanisme</a>.</li>
                    </ul>
                </Paragraph>
                <Paragraph>
                    Le rapport <strong>explique les raisons des évolutions observées sur tout ou partie du territoire qu'il couvre, notamment l'impact des décisions prises en matière d'aménagement et d'urbanisme ou des actions de désartificialisation réalisées. »</strong>
                </Paragraph>
                <HighlightBox>
                    <p>
                        Avant 2031, il n’est pas obligatoire de renseigner les indicateurs 2°, 3° et 4° tant que les documents d'urbanisme n'ont pas intégré cet objectif.
                    </p>
                </HighlightBox>
                <Paragraph>
                    A noter que c'est le rapport qui est triennal, et non la période à couvrir par le rapport :
                </Paragraph>
                <Paragraph>
                    <ul>
                        <li><strong>Il faut que le rapport soit produit a minima tous les 3 ans</strong>. Il est donc possible pour une collectivité qui le souhaite, de produire un rapport, par exemple tous les ans ou tous les 2 ans.</li>
                        <li>La période à couvrir n'est pas précisée dans les textes. Étant donné que l’État met à disposition les données des fichiers fonciers depuis le 1er janvier 2011 (= début de la période de référence de la loi CR), il est <strong>recommandé de présenter la chronique des données du 1er janvier 2011 et jusqu'au dernier millésime disponible</strong>, pour apprécier la trajectoire du territoire concerné avec le recul nécessaire (les variations annuelles étant toujours à prendre avec prudence).</li>
                    </ul>
                </Paragraph>
            </SectionContainer>

            <SectionContainer>
                <SectionTitle>Quelles sont les sources d’informations disponibles pour ce rapport ?</SectionTitle>
                <Paragraph>
                    Les données produites par l'<a href="https://artificialisation.developpement-durable.gouv.fr/" target="_blank" rel="noopener noreferrer">observatoire national de l'artificialisation</a> sont disponibles gratuitement.
                </Paragraph>
                <Paragraph>
                    <strong>Mon Diagnostic Artificialisation vous propose une première trame de ce rapport local, en s’appuyant sur les données de l’observatoire national disponibles à date, soit :</strong>
                </Paragraph>
                <Paragraph>
                    <ul>
                        <li><strong>concernant la consommation d’espaces NAF (Naturels, Agricoles et Forestiers), les données issues des fichiers fonciers produits annuellement par le Cerema. Ce rapport a été produit à partir des fichiers fonciers fournis par le Cerema au 1er janvier 2024 ;</strong></li>
                        <li><strong>concernant l’artificialisation nette des sols, les données issues de l’occupation des sols à grande échelle (OCS GE) en cours de production par l’IGN, qui seront disponibles sur l’ensemble du territoire national d’ici fin 2025.</strong></li>
                    </ul>
                </Paragraph>
                <HighlightBox>
                    <p>
                        Il n'est, bien évidemment, pas demandé d'inventer des données non encore disponibles : pour le premier rapport triennal à produire d'ici août 2024 il sera possible d'utiliser les fichiers fonciers au 1er janvier 2024, couvrant la consommation d’espaces NAF (Naturels, Agricoles et Forestiers) au titre de l'année 2023.
                    </p>
                    <p>
                        Il est également possible d’utiliser les données locales, notamment celles des observatoires de l’habitat et du foncier (<a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074096&idArticle=LEGIARTI000006824763&dateTexte=&categorieLien=cid" target="_blank" rel="noopener noreferrer">art. L. 302-1 du code de la construction et de l'habitation</a>) et de s'appuyer sur les analyses réalisées dans le cadre de l'évaluation du schéma de cohérence territoriale (ScoT – <a href="https://www.legifrance.gouv.fr/affichCodeArticle.do?cidTexte=LEGITEXT000006074075&idArticle=LEGIARTI000031211077&dateTexte=&categorieLien=cid" target="_blank" rel="noopener noreferrer">art. L. 143-28 du code de l'urbanisme</a>) et de celle du plan local d'urbanisme (<a href="https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000043977819" target="_blank" rel="noopener noreferrer">art. L. 153-27 du code de l’urbanisme</a>).
                    </p>
                    <p>
                        Ces données locales doivent être conformes aux définitions légales de la consommation d'espaces (et le cas échéant de l'artificialisation nette des sols), homogènes et cohérentes sur la décennie de référence de la loi (1er janvier 2011-1er janvier 2021) et sur la décennie en cours (1er janvier 2021-1er janvier 2031).
                    </p>
                </HighlightBox> 
            </SectionContainer>

            <SectionContainer>
                <SectionTitle>1° Consommation des espaces naturels, agricoles et forestiers</SectionTitle>
                <SubTitle>Indicateurs obligatoires</SubTitle>
                <Paragraph>
                    <strong>La consommation d'espaces entre le 1er janvier {CONSO_START_YEAR} et le 1er janvier {CONSO_END_YEAR + 1} représente pour le territoire de {landData.name} une surface de {(landData.conso_details.conso_2011_2020 + landData.conso_details.conso_since_2021).toFixed(1)} hectares.</strong>
                </Paragraph>
                <SubTitle>Évolution annuelle de la consommation</SubTitle>
                <ChartContainer>
                    <GenericChart
                        id="annual_total_conso_chart_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        showToolbar={false}
                        hideDetails
                    />
                </ChartContainer>
                <DataTableContainer>
                    <GenericChart
                        id="annual_total_conso_chart_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        dataTableOnly
                        compactDataTable
                    />
                </DataTableContainer>

                <SubTitle>Raisons des évolutions observées</SubTitle>
                <Paragraph>
                    Les destinations de la consommation d’espaces NAF (Naturels, Agricoles et Forestiers) constituent les usages pour lesquels le territoire a consommé : pour de l’habitat, de l’activité, des infrastructures routières, des infrastructures ferroviaires, ou pour des usages mixtes ou non renseignés.
                </Paragraph>
                <ChartContainer>
                    <GenericChart
                        id="pie_determinant_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        showToolbar={false}
                        hideDetails
                    />
                </ChartContainer>

                <SubTitle>Évolution annuelle par destination</SubTitle>
                <ChartContainer>
                    <GenericChart
                        id="chart_determinant_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        showToolbar={false}
                        hideDetails
                    />
                </ChartContainer>

                <DataTableContainer>
                    <GenericChart
                        id="chart_determinant_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        dataTableOnly
                        compactDataTable
                    />
                </DataTableContainer>

                <InfoBox>
                    <p>
                        Attention, les données issues des fichiers fonciers concernent uniquement la consommation d’espaces NAF (Naturels, Agricoles et Forestiers), et ne prennent pas en compte la désartificialisation (définie par l'<a href="https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000047870384" target="_blank" rel="noopener noreferrer">article 194 de la loi Climat et résilience</a>, modifié par la loi du 20 juillet 2023, comme "la transformation effective d’espaces urbanisés ou construits en espaces naturels, agricoles et forestiers du fait d’une désartificialisation")."
                    </p>
                </InfoBox>
                <ContentZone
                    content={content.consommation_raison_evolutions || ''}
                    mode={mode}
                    onChange={handleChange('consommation_raison_evolutions')}
                    placeholder="Il est obligatoire d’expliquer ici les raisons des évolutions observées dans la consommation d’espaces, notamment l'impact des décisions prises en matière d'aménagement et d'urbanisme ou des actions de désartificialisation réalisées."
                />
            </SectionContainer>

            <SectionContainer>
                <SubTitle>Indicateurs optionnels</SubTitle>
                <SubTitle>Différenciation de la consommation par types d’espaces naturels, agricoles et forestiers</SubTitle>
                <HighlightBox>
                    <p>
                        De façon optionnelle, il est possible d’indiquer ici, parmi les espaces NAF (Naturels, Agricoles et Forestiers) consommés sur la période de référence, la proportion des espaces agricoles, des espaces naturels, et des espaces forestiers. Cet indicateur n’est pas disponible sur l’observatoire national. Des données locales peuvent être utilisées.
                    </p>
                </HighlightBox>
                <ContentZone
                    content={content.consommation_repartition_naf || ''}
                    mode={mode}
                    onChange={handleChange('consommation_repartition_naf')}
                    placeholder=""
                />

                <SubTitle>Désartificialisation (transformation d’un espace urbanisé en un espace naturel, agricole, ou forestier)</SubTitle>
                <HighlightBox>
                    <p>
                        De façon optionnelle, il est possible d’indiquer les surfaces désartificialisées sur la période de référence.
                        La désartificialisation  peut être décomptée du bilan de consommation d’espaces NAF (Naturels, Agricoles et Forestiers), au choix de la commune ou de l’intercommunalité. Toutefois, la méthode de bilan doit être cohérente avec les bilans de consommation passée.
                        Cette méthode devra être employée pour la planification de la consommation dans les évolutions des documents d’urbanisme.
                        Les bilans futurs devront également être faits en cohérence avec la méthode employée dans l’ensemble, en particulier en ce qui concerne la prise en compte des opérations de désartificialisation.  
                        Cet indicateur n’est pas disponible sur l’observatoire national. Des données locales peuvent être utilisées.
                    </p>
                </HighlightBox>
                <ContentZone
                    content={content.consommation_desartificialisation || ''}
                    mode={mode}
                    onChange={handleChange('consommation_desartificialisation')}
                    placeholder=""
                />

                <SubTitle>Autres indicateurs optionnels</SubTitle>
                <ContentZone
                    content={content.consommation_autres_indicateurs || ''}
                    mode={mode}
                    onChange={handleChange('consommation_autres_indicateurs')}
                    placeholder=""
                />
            </SectionContainer>

            <SectionContainer>
                <SubTitle>Comparaison de la consommation annuelle absolue</SubTitle>
                <ComparisonSection
                    landData={landData}
                    startYear={CONSO_START_YEAR}
                    endYear={CONSO_END_YEAR}
                />
                
                <SubTitle>Comparaison de la consommation annuelle relative à la surface</SubTitle>
                <ComparisonRelativeSection
                    landData={landData}
                    startYear={CONSO_START_YEAR}
                    endYear={CONSO_END_YEAR}
                />
                <Paragraph>Cet indicateur permet de mesurer l’intensité de la consommation par rapport à la superficie totale du territoire, et de  comparer avec les territoires similaires.</Paragraph>
                
                <SubTitle>Consommation relative aux évolutions démographiques</SubTitle>
                <p className="fr-text--xs">Bientôt disponible France Métropolitaine, Corse et DROM (sauf Mayotte).</p>
                <ContentZone
                    content={content.consommation_evolution_demographie || ''}
                    mode={mode}
                    onChange={handleChange('consommation_evolution_demographie')}
                    placeholder=""
                />

                <SubTitle>Consommation relative à l’évolution des ménages</SubTitle>
                <ContentZone
                    content={content.consommation_evolution_menages || ''}
                    mode={mode}
                    onChange={handleChange('consommation_evolution_menages')}
                    placeholder=""
                />
            </SectionContainer>

            <SectionContainer>
                <SectionTitle>2° Solde entre surfaces artificialisées et désartificialisées</SectionTitle>

                {landData.has_ocsge ? (
                    <>
                        <Paragraph>
                            Il s’agit ici du bilan de l’artificialisation nette des sols tel que prévu par la loi, à partir de 2031, à l’échelle d’un document de planification ou d’urbanisme.
                        </Paragraph>
                        <Paragraph>
                            Ce bilan est calculé comme la différence entre les surfaces nouvellement artificialisées entre deux dates, et les surfaces nouvellement désartificialisées sur la même période.
                        </Paragraph>
                        <Paragraph>
                            L’annexe de l’article R. 101-1 du code de l’urbanisme définit la nomenclature des surfaces artificialisées et non-artificialisées :
                        </Paragraph>
                        <AnnexeImage 
                            src={AnnexeArticleR101Image} 
                            alt="Annexe de l'article R. 101-1 du code de l'urbanisme - Nomenclature des surfaces artificialisées et non-artificialisées"
                        />

                        <SubTitle>2.1 Définitions</SubTitle>
                        <Paragraph>
                            L'article 192 modifie le code de l'urbanisme et donne une <strong>définition de l'artificialisation</strong> telle qu'elle doit être considérée et évaluée dans les documents d'urbanisme et de planification :
                        </Paragraph>
                        <Paragraph>
                            « Au sein des documents de planification et d'urbanisme, lorsque la loi ou le règlement prévoit des objectifs de réduction de l'artificialisation des sols ou de son rythme, ces objectifs sont fixés et évalués en considérant comme :
                        </Paragraph>
                        <Paragraph>
                            « a) Artificialisée une surface dont les sols sont soit imperméabilisés en raison du bâti ou d'un revêtement, soit stabilisés et compactés, soit constitués de matériaux composites ; 
                        </Paragraph>
                        <Paragraph>
                            « b) Non artificialisée une surface soit naturelle, nue ou couverte d'eau, soit végétalisée, constituant un habitat naturel ou utilisée à usage de cultures. 
                        </Paragraph>
                        <Paragraph>
                            « Un décret en Conseil d'État fixe les conditions d'application du présent article. Il établit notamment une nomenclature des sols artificialisés ainsi que l'échelle à laquelle l'artificialisation des sols doit être appréciée dans les documents de planification et d'urbanisme. »
                        </Paragraph>
                        <Paragraph>
                            Cet article est le premier à définir textuellement ce qui doit être considéré comme artificialisé et non artificialisé. Les composantes des espaces artificialisés sont explicitement d'une grande finesse de définition, tant géographique que descriptive.
                        </Paragraph>
                        <Paragraph>
                            Le décret d'application du 29 avril 2022 précise encore la notion d'artificialisation au sens de la loi Climat et Résilience qui est traduite dans l'OCS GE comme la somme des surfaces anthropisées (CS1.1), sans les carrières (US1.3), et des surfaces herbacées (CS2.2) à usage de production secondaire, tertiaire, résidentielle ou réseaux (US2, US3, US235, US4, US5).
                        </Paragraph>

                        <SubTitle>2.2 Détail de l’artificialisation</SubTitle>
                        <Paragraph>
                            En {latestYear}, sur le territoire de {landData.name}, {formatNumber({ number: latestArtifData.surface })} ha étaient artificialisés, ce qui correspond à {formatNumber({ number: latestArtifData.percent })}% de sa surface totale ({formatNumber({ number: landData.surface })} ha) du territoire.{evolutionSince2020 !== null && evolutionSince2020 !== 0 && (
                                <> La surface artificialisée a {evolutionSince2020 > 0 ? 'augmenté' : 'diminué'} de {formatNumber({ number: Math.abs(evolutionSince2020) })} ha depuis 2020.</>
                            )}
                        </Paragraph>

                        <SubTitle>2.3 Données disponibles</SubTitle>
                        <Paragraph>
                            La mesure de l'artificialisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Echelle), actuellement en cours de production par l'IGN. Cette donnée est produite tous les 3 ans par département. Chaque production est appelée un millésime.
                        </Paragraph>
                        {landData.millesimes && landData.millesimes.length > 0 && (
                            <LandMillesimeTable
                                millesimes={landData.millesimes}
                                territory_name={landData.name}
                                is_interdepartemental={landData.is_interdepartemental}
                            />
                        )}

                        <SubTitle>2.4 Répartitions des surfaces artificialisées par couverture et usage</SubTitle>
                        <ArtifCouvertureSection landData={landData} />
                        <ArtifUsageSection landData={landData} />
                    </>
                ) : (
                    <InfoBox>
                        <p>
                            Les données d'occupation des sols à grande échelle (OCS GE) ne sont pas disponibles pour ce territoire.
                        </p>
                    </InfoBox>
                )}
            </SectionContainer>

            <SectionContainer>
                <SectionTitle>3° Les surfaces dont les sols ont été rendus imperméables</SectionTitle>
                {landData.has_ocsge ? (
                    <>
                        <Paragraph>
                            Il s'agit ici d'indiquer, à l'échelle d'un document de planification ou d'urbanisme, les surfaces dont les sols ont été rendus imperméables au sens des 1° et 2° de la nomenclature annexée à l'article R. 101-1 du code de l'urbanisme.
                        </Paragraph>
                        <ImperCouvertureSection landData={landData} />
                        <ImperUsageSection landData={landData} />
                    </>
                ) : (
                    <InfoBox>
                        <p>
                            Les données d'occupation des sols à grande échelle (OCS GE) ne sont pas disponibles pour ce territoire.
                        </p>
                    </InfoBox>
                )}
            </SectionContainer>

            <SectionContainer>
                <SectionTitle>4°Evaluation du respect des objectifs de réduction de la consommation d'espaces naturels, agricoles et forestiers et de lutte contre l'artificialisation des sols fixés dans les documents de planification et d'urbanisme</SectionTitle>
                <Paragraph>
                    Il s’agit ici d’indiquer, à partir de 2031, à l’échelle d’un document de planification ou d’urbanisme, les surfaces dont les sols ont été rendus imperméables entre deux dates.
                </Paragraph>
                <HighlightBox>
                    <p>
                        Il s’agit ici, au vu des objectifs en vigueur fixés dans les documents de planification régionale (SRADDET pour la plupart des régions, SDRIF pour l’Ile-de-France, PADDUC pour la Corse, SAR pour la Martinique, Guadeloupe, Guyane, La Réunion et Mayotte), le cas échéant dans le SCoT et le PLU(i) applicable, d’évaluer la trajectoire de la commune ou de l’intercommunalité.
                    </p>
                    <p>
                        Avant 2031, seule la trajectoire de consommation d’espaces NAF (Naturels, Agricoles et Forestiers) est à évaluer (et non l’artificialisation nette des sols).
                    </p>
                </HighlightBox>
                <ContentZone
                    content={content.evaluation_respect_trajectoire || ''}
                    mode={mode}
                    onChange={handleChange('evaluation_respect_trajectoire')}
                    placeholder=""
                />
            </SectionContainer>
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
                        {reportContent}
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    return (
        <ReportContainer>
            <CoverPage
                landData={landData}
                reportTitle="Rapport local de suivi de l'artificialisation des sols"
            />
            <MainContent>
                {reportContent}
            </MainContent>
        </ReportContainer>
    );
};

export default RapportLocal;
