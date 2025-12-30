import React, { useMemo, useState, useCallback } from 'react';
import { LandDetailResultType } from '@services/types/land';
import TimelineTrajectoireZanImage from '@images/timeline-trajectoire-zan.png';
import { useGetProjectQuery, useGetLandArtifStockIndexQuery } from '@services/api';
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
    CalloutEditInfo,
} from '../styles';
import ChartWithTable from '@components/charts/ChartWithTable';
import CoverPage from './CoverPage';
import AvailableDataPage from './AvailableDataPage';
import Drawer from '@components/ui/Drawer';
import styled from 'styled-components';
import { useReportComparisonTerritories } from '../hooks';
import { ComparisonTerritoriesSettings, ComparisonTerritoriesCallout } from '../components';

export interface RapportCompletContent {
    conso_start_year?: string;
    conso_end_year?: string;
    comparison_territories?: string;
    target_2031?: string;
    trajectoire?: string;
    consommation_annuelle?: string;
    consommation_destinations?: string;
    consommation_comparison_absolue?: string;
    consommation_comparison_relative?: string;
    artificialisation_detail?: string;
    artificialisation_couverture?: string;
    artificialisation_usage?: string;
    impermeabilisation_couverture?: string;
    impermeabilisation_usage?: string;
}

interface RapportCompletProps {
    landData: LandDetailResultType;
    content: RapportCompletContent;
    mode: ContentZoneMode;
    projectId: number;
    onContentChange?: (key: string, value: string) => void;
    isSettingsOpen?: boolean;
    onSettingsChange?: (isOpen: boolean) => void;
}

const DEFAULT_consoStartYear = 2011;
const DEFAULT_consoEndYear = 2023;

// Années disponibles pour la sélection (fichiers fonciers disponibles depuis 2009)
const AVAILABLE_YEARS = Array.from({ length: 15 }, (_, i) => 2009 + i);

const SettingsSection = styled.div`
    margin-bottom: 2.5rem;
`;

const SettingsInfo = styled.p`
    font-size: 0.8rem;
    color: #666;
    margin: 1rem 0 0 0;
    line-height: 1.4;
`;

const TimelineImage = styled.img`
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 1.5rem 0;
    display: block;
    
    @media print {
        page-break-inside: avoid;
    }
`;

const RapportComplet: React.FC<RapportCompletProps> = ({
    landData,
    content,
    mode,
    projectId,
    onContentChange,
    isSettingsOpen: externalIsSettingsOpen,
    onSettingsChange,
}) => {
    const [internalIsSettingsOpen, setInternalIsSettingsOpen] = useState(false);
    
    // Utilise le state externe si fourni, sinon le state local
    const isSettingsOpen = externalIsSettingsOpen !== undefined ? externalIsSettingsOpen : internalIsSettingsOpen;
    const setIsSettingsOpen = onSettingsChange || setInternalIsSettingsOpen;
    
    const handleChange = useCallback((key: keyof RapportCompletContent) => (value: string) => {
        onContentChange?.(key, value);
    }, [onContentChange]);

    // Années de la période de consommation (modifiables)
    const consoStartYear = parseInt(content.conso_start_year || String(DEFAULT_consoStartYear));
    const consoEndYear = parseInt(content.conso_end_year || String(DEFAULT_consoEndYear));

    const { data: projectData } = useGetProjectQuery(String(projectId));

    // Objectif territorialisé (réglementaire) ou national par défaut (50%)
    const objectif_reduction = landData.territorialisation?.has_objectif
        ? landData.territorialisation?.objectif ?? 50
        : 50;

    // Calcul de l'objectif personnalisé (depuis le content ou la valeur du projet par défaut)
    const defaultTarget2031 = projectData?.target_2031 || 50;
    const target_custom = content.target_2031 ? parseFloat(content.target_2031) : defaultTarget2031;
    const has_custom_target = Number(target_custom) !== objectif_reduction;

    // Récupérer le dernier millésime disponible
    const millesimes = landData.millesimes || [];
    const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;
    const minIndex = maxIndex > 0 ? maxIndex - 1 : 0;

    // Récupération des données d'artificialisation pour le dernier millésime (uniquement si OCSGE disponible)
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

    // Données du dernier millésime
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
        <>
            <Drawer
                isOpen={isSettingsOpen}
                title="Paramètres du rapport"
                onClose={() => setIsSettingsOpen(false)}
            >
                <SettingsSection>
                    <h3 className="fr-text--lg fr-mb-2w">Période d'analyse de la consommation</h3>

                    <div className="fr-select-group">
                        <label className="fr-label fr-text--sm fr-mb-0" htmlFor="select-start-year">
                            Année de début
                        </label>
                        <select
                            className="fr-select"
                            id="select-start-year"
                            name="select-start-year"
                            aria-describedby="select-start-year-messages"
                            value={consoStartYear}
                            onChange={(e) => handleChange('conso_start_year')(e.target.value)}
                        >
                            {AVAILABLE_YEARS.filter(y => y < consoEndYear).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="fr-select-group fr-mt-2w">
                        <label className="fr-label fr-text--sm fr-mb-0" htmlFor="select-end-year">
                            Année de fin
                        </label>
                        <select
                            className="fr-select"
                            id="select-end-year"
                            name="select-end-year"
                            aria-describedby="select-end-year-messages"
                            value={consoEndYear}
                            onChange={(e) => handleChange('conso_end_year')(e.target.value)}
                        >
                            {AVAILABLE_YEARS.filter(y => y > consoStartYear).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <SettingsInfo>
                        Modifie la période affichée dans les graphiques de consommation d'espaces NAF.
                    </SettingsInfo>
                </SettingsSection>

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

                <SettingsSection>
                    <h3 className="fr-text--lg fr-mb-2w">Objectif non-réglementaire de réduction 2031</h3>

                    <div className="fr-input-group">
                        <label className="fr-label fr-text--sm fr-mb-0" htmlFor="input-target-2031">
                            Objectif de réduction personnalisé
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                className="fr-input"
                                type="number"
                                id="input-target-2031"
                                name="input-target-2031"
                                min="0"
                                max="100"
                                step="1"
                                value={target_custom}
                                onChange={(e) => handleChange('target_2031')(e.target.value)}
                                style={{ width: '100px' }}
                            />
                            <span>%</span>
                        </div>
                    </div>

                    <SettingsInfo>
                        Le graphique de la trajectoire de consommation d'espaces NAF affiche par défaut une trajectoire avec un objectif de réduction de 50% (objectif national). Vous pouvez ajouter une trajectoire personnalisée en ajustant l'objectif de réduction ci-dessus.
                    </SettingsInfo>
                </SettingsSection>
            </Drawer>
        </>
    );

    const reportContent = (
        <>
            <section className="fr-mb-6w">
                <h2>1 Consommation des espaces NAF (Naturels, Agricoles et Forestiers)</h2>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Chaque année, <strong>24 000 ha d’espaces NAF (Naturels, Agricoles et Forestiers)</strong> sont consommés en moyenne en France, soit près de 5 terrains de football par heure.
                        Tous les territoires sont concernés : en particulier 61% de la consommation d’espaces est constatée dans les territoires sans tension immobilière.
                    </p>
                    <p className="fr-callout__text">
                        Les <strong>conséquences sont écologiques</strong> (érosion de la biodiversité, aggravation du risque de ruissellement, limitation du stockage carbone) mais aussi socio-économiques (coûts des équipements publics, augmentation des temps de déplacement et de la facture énergétique des ménages, dévitalisation des territoires en déprise, diminution du potentiel de production agricole etc.).
                    </p>
                </div>

                <TwoColumnLayout>
                    <p>
                        La France s’est donc fixée <strong>l’objectif d’atteindre le « zéro artificialisation nette des sols » en 2050</strong>, avec un <strong>objectif intermédiaire</strong> de réduction de moitié de la consommation d’espaces naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 (en se basant sur les données allant du 01/01/2021 au 31/12/2030) par rapport à la décennie précédente 2011-2020 (en se basant sur les données allant du 01/01/2011 au 31/12/2020).
                    </p>
                    <p>
                        Les dispositions introduites par la loi n° 2021-1104 du 22 août 2021 portant lutte contre le dérèglement climatique et renforcement de la résilience face à ses effets (dite « Loi Climat et résilience ») ont été complétées par la loi n° 2023-630 du 20 juillet 2023 visant à faciliter la mise en œuvre des objectifs de lutte contre l’artificialisation des sols et à renforcer l’accompagnement des élus locaux.
                    </p>
                    <p>
                        <strong>Pour la période 2021-2031, il s’agit de raisonner en consommation d’espaces.</strong>
                    </p>
                    <p>
                        La consommation d’espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (article 194 de la loi Climat et résilience).
                    </p>
                    <p>
                        La loi adoptée en 2023 précise qu’à l’échelle d’un même territoire, « la transformation effective d’espaces urbanisés ou construits en espaces naturels, agricoles et forestiers du fait d’une désartificialisation peut être comptabilisée en déduction de cette consommation ».
                    </p>
                    <p>
                        Au niveau national, la consommation d’espaces NAF (Naturels, Agricoles et Forestiers)  est mesurée par les fichiers fonciers retraités par le CEREMA.
                    </p>
                    <p>
                        <strong>A partir de 2031, il s’agit de raisonner en artificialisation.</strong>
                    </p>
                    <p>
                        L'artificialisation nette est définie comme « le solde de l'artificialisation et de la désartificialisation des sols constatées sur un périmètre et sur une période donnés » (article L.101-2-1 du code de l’urbanisme).
                    </p>
                    <p>
                        Au niveau national, l’artificialisation est mesurée par l’occupation des sols à grande échelle (OCSGE), en cours d’élaboration, dont la production sera engagée sur l’ensemble du territoire national d’ici fin 2024.
                    </p>
                </TwoColumnLayout>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        La consommation d'espaces entre le <strong>1er janvier 2011 et le 31 décembre 2020</strong> représente 
                        pour le territoire de <strong>{landData.name}</strong> une surface de <strong>{(landData.conso_details.conso_2011_2020).toFixed(1)} hectares</strong>.
                    </p>
                </div>
            </section>

            <section className="fr-mb-6w">
                <h2>2 Trajectoire de consommation d’espaces NAF à l’horizon 2031</h2>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        La loi Climat & Résilience fixe <strong>l’objectif d’atteindre le « zéro artificialisation nette des sols » en 2050</strong>, avec un <strong>objectif intermédiaire</strong> de réduction de moitié de la consommation d’espaces naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 (en se basant sur les données allant du 01/01/2021 au 31/12/2030) par rapport à la décennie précédente 2011-2020 (en se basant sur les données allant du 01/01/2011 au 31/12/2020).
                    </p>
                </div>

                <TimelineImage 
                    src={TimelineTrajectoireZanImage} 
                    alt="Trajectoire ZAN"
                />

                <TwoColumnLayout>
                    <p>
                        Cette <strong>trajectoire nationale progressive</strong> est à décliner dans les <strong>documents de planification et d'urbanisme</strong> (avant le 22 novembre 2024 pour les SRADDET, avant le 22 février 2027 pour les SCoT et avant le 22 février 2028 pour les PLU(i) et cartes communales).
                    </p>
                    <p>
                        Elle doit être conciliée avec l'objectif de soutien de la construction durable, en particulier dans les territoires où l'offre de logements et de surfaces économiques est insuffisante au regard de la demande.
                    </p>
                    <p>
                        La loi prévoit également que la consommation foncière des <strong>projets d'envergure nationale ou européenne et d'intérêt général majeur sera comptabilisée au niveau national</strong>, et non au niveau régional ou local.
                        Ces projets seront énumérés par arrêté du ministre chargé de l'urbanisme, en fonction de catégories définies dans la loi, après consultation des régions, de la conférence régionale et du public. Un forfait de 12 500 hectares est déterminé pour la période 2021-2031, dont 10 000 hectares font l'objet d'une péréquation entre les régions couvertes par un SRADDET. 
                    </p>
                    <p>
                        Cette loi précise également l’exercice de territorialisation de la trajectoire.
                        Afin de tenir compte des besoins de l’ensemble des territoires, <strong>une surface minimale d’un hectare de consommation</strong> est garantie à toutes les communes couvertes par un document d'urbanisme prescrit, arrêté ou approuvé avant le 22 août 2026, pour la période 2021-2031.
                        Cette « garantie communale » peut être mutualisée au niveau intercommunal à la demande des communes. Quant aux communes littorales soumises au recul du trait de côte, qui sont listées par décret et qui ont mis en place un projet de recomposition spatiale, elles peuvent considérer, avant même que la désartificialisation soit effective, comme « désartificialisées » les surfaces situées dans la zone menacée à horizon 30 ans et qui seront ensuite désartificialisées.
                    </p>
                    <p>
                        Dès aujourd'hui, <strong>Mon Diagnostic Artificialisation</strong> vous permet de vous projeter dans cet objectif de réduction de la consommation d'espaces NAF (Naturels, Agricoles et Forestiers) d'ici à 2031 et de simuler divers scénarii.
                    </p>
                </TwoColumnLayout>

                <div className="fr-callout">
                    {has_custom_target ? (
                        <p className="fr-callout__text">
                            Vous avez personnalisé votre objectif non-réglementaire de réduction à hauteur de <strong>{target_custom} %</strong> et le graphique ci-dessous vous montre un aperçu des tendances annuelles maximales que votre territoire ne devrait pas dépasser d’ici à 2031.
                        </p>
                    ) : (
                        <p className="fr-callout__text">
                            Vous n'avez pas personnalisé votre objectif non-réglementaire de réduction.
                        </p>
                    )}
                    {mode === 'edit' && (
                        <CalloutEditInfo>
                            <p className="fr-mb-0">
                                <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" />
                                L'objectif de réduction peut être modifié dans les paramètres du rapport
                            </p>
                            <button 
                                className="fr-btn fr-btn--sm fr-mt-0"
                                onClick={() => setIsSettingsOpen(true)}
                                title="Modifier l'objectif"
                            >
                                Modifier
                            </button>
                        </CalloutEditInfo>
                    )}
                </div>

                <ChartWithTable
                    chartId="objective_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={has_custom_target ? { target_2031_custom: target_custom } : {}}
                    sources={["majic"]}
                />

                <div className="fr-mt-4w">
                    <ContentZone
                        content={content.trajectoire || ''}
                        mode={mode}
                        onChange={handleChange('trajectoire')}
                        placeholder="Commentez la trajectoire. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
                    />
                </div>
            </section>

            <section className="fr-mb-6w">
                <h2>3 Détail de la consommation d'espaces</h2>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Les graphiques de cette section présentent les données de consommation d'espaces NAF
                        sur la période du <strong>1er janvier {consoStartYear}</strong> au{' '}
                        <strong>31 décembre {consoEndYear}</strong>.
                    </p>
                    {mode === 'edit' && (
                        <CalloutEditInfo>
                            <p className="fr-mb-0">
                                <i className="bi bi-exclamation-triangle text-danger fr-mr-1w" />
                                La période d'analyse peut être modifiée dans les paramètres du rapport
                            </p>
                            <button 
                                className="fr-btn fr-btn--sm fr-mt-0"
                                onClick={() => setIsSettingsOpen(true)}
                                title="Modifier la période"
                            >
                                Modifier
                            </button>
                        </CalloutEditInfo>
                    )}
                </div>

                <h3>3.1 Évolution annuelle de la consommation</h3>

                <ChartWithTable
                    chartId="annual_total_conso_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(consoStartYear), end_date: String(consoEndYear) }}
                    sources={["majic"]}
                />

                <div className="fr-mt-4w">
                    <ContentZone
                        content={content.consommation_annuelle || ''}
                        mode={mode}
                        onChange={handleChange('consommation_annuelle')}
                        placeholder="Commentez la consommation annuelle. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
                    />
                </div>

                <h3>3.2 Répartition de la consommation totale par destination</h3>

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
                    params={{ start_date: String(consoStartYear), end_date: String(consoEndYear) }}
                    sources={["majic"]}
                    showTable={false}
                />

                <h3>3.3 Évolution annuelle de la consommation par destination</h3>

                <ChartWithTable
                    chartId="chart_determinant_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ start_date: String(consoStartYear), end_date: String(consoEndYear) }}
                    sources={["majic"]}
                />

                <div className="fr-mt-4w">
                    <ContentZone
                        content={content.consommation_destinations || ''}
                        mode={mode}
                        onChange={handleChange('consommation_destinations')}
                        placeholder="Commentez la consommation d'espaces par destinations. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
                    />
                </div>
                
                <h3>3.4 Cartes de consommation d'espaces</h3>

                {landData.child_land_types && landData.child_land_types.length > 0 && (
                    <ChartWithTable
                        chartId="conso_map_bubble_export"
                        landId={landData.land_id}
                        landType={landData.land_type}
                        params={{
                            start_date: String(consoStartYear),
                            end_date: String(consoEndYear),
                            child_land_type: landData.child_land_types[0],
                        }}
                        sources={["majic"]}
                        isMap
                    />
                )}

                {landData.child_land_types && landData.child_land_types.length > 0 && (
                    <ChartWithTable
                        chartId="conso_map_relative_export"
                        landId={landData.land_id}
                        landType={landData.land_type}
                        params={{
                            start_date: String(consoStartYear),
                            end_date: String(consoEndYear),
                            child_land_type: landData.child_land_types[0],
                        }}
                        sources={["majic"]}
                        isMap
                    />
                )}
            </section>

            <section className="fr-mb-6w">
                <h2>4 Comparaison avec d'autres territoires</h2>

                <ComparisonTerritoriesCallout
                    territories={territories}
                    landName={landData.name}
                    isDefaultSelection={isDefaultSelection}
                    mode={mode}
                    onSettingsClick={() => setIsSettingsOpen(true)}
                />

                <h3>4.1 Comparaison de la consommation annuelle absolue</h3>

                <ChartWithTable
                    chartId="comparison_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ 
                        start_date: String(consoStartYear), 
                        end_date: String(consoEndYear),
                        ...(comparisonLandIds !== null && { comparison_lands: comparisonLandIds }),
                    }}
                    sources={["majic"]}
                />

                <div className="fr-mt-4w">
                    <ContentZone
                        content={content.consommation_comparison_absolue || ''}
                        mode={mode}
                        onChange={handleChange('consommation_comparison_absolue')}
                        placeholder="Commentez la consommation absolue de votre territoire par rapport aux territoires de comparaison."
                    />
                </div>
            
                <h3>4.2 Comparaison de la consommation annuelle relative à la surface</h3>

                <div className="fr-callout">
                    <p className="fr-callout__text">
                        Pour une comparaison plus équitable entre territoires de tailles différentes, la consommation peut être rapportée 
                        à la surface du territoire (en % de la surface). Cela permet de mieux comparer l'intensité de la consommation d'espaces.
                    </p>
                </div>

                <ChartWithTable
                    chartId="surface_proportional_chart_export"
                    landId={landData.land_id}
                    landType={landData.land_type}
                    params={{ 
                        start_date: String(consoStartYear), 
                        end_date: String(consoEndYear),
                        ...(comparisonLandIds !== null && { comparison_lands: comparisonLandIds }),
                    }}
                    sources={["majic"]}
                />

                <div className="fr-mt-4w">
                        <ContentZone
                        content={content.consommation_comparison_relative || ''}
                        mode={mode}
                        onChange={handleChange('consommation_comparison_relative')}
                        placeholder="Commentez la consommation relative de votre territoire par rapport aux territoires de comparaison."
                    />
                </div>

            </section>

            <section>
                <h2>5 Artificialisation</h2>
                {landData.has_ocsge ? (
                    <>
                        <h3>5.1 Définitions</h3>

                        <TwoColumnLayout>
                            <p>
                                L’article 192 modifie le code de l’urbanisme et donne une <strong>définition de l’artificialisation</strong> telle qu’elle doit être considérée et évaluée dans les documents d’urbanisme et de planification :
                            </p>
                            <p>
                                « Au sein des documents de planification et d’urbanisme, lorsque la loi ou le règlement prévoit des objectifs de réduction de l’artificialisation des sols ou de son rythme, ces objectifs sont fixés et évalués en considérant comme :
                            </p>
                            <p>
                                a) Artificialisée une surface dont les sols sont soit imperméabilisés en raison du bâti ou d’un revêtement, soit stabilisés et compactés, soit constitués de matériaux composites ; 
                            </p>
                            <p>
                                b) Non artificialisée une surface soit naturelle, nue ou couverte d’eau, soit végétalisée, constituant un habitat naturel ou utilisée à usage de cultures. 
                            </p>
                            <p>
                                Un décret en Conseil d’État fixe les conditions d’application du présent article. Il établit notamment une nomenclature des sols artificialisés ainsi que l’échelle à laquelle l’artificialisation des sols doit être appréciée dans les documents de planification et d’urbanisme. »
                            </p>
                            <p>
                                Cet article est le premier à définir textuellement ce qui doit être considéré comme artificialisé et non artificialisé. Les composantes des espaces artificialisés sont explicitement d’une grande finesse de définition, tant géographique que descriptive.
                            </p>
                            <p>
                                Le décret d’application du 29 avril 2022 précise encore la notion d’artificialisation au sens de la loi Climat et Résilience qui est traduite dans l’OCS GE comme la somme des surfaces anthropisées (CS1.1), sans les carrières (US1.3), et des surfaces herbacées (CS2.2) à usage de production secondaire, tertiaire, résidentielle ou réseaux (US2, US3, US235, US4, US5).
                            </p>
                        </TwoColumnLayout>


                        <h3>5.2 Détail de l'artificialisation</h3>

                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                <strong><MillesimeDisplay is_interdepartemental={landData.is_interdepartemental} landArtifStockIndex={latestArtifData} capitalize /></strong>, sur le territoire de {landData.name}, <strong>{formatNumber({ number: latestArtifData.surface })} ha</strong> étaient artificialisés, 
                                ce qui correspond à <strong>{formatNumber({ number: latestArtifData.percent })}%</strong> de sa surface totale ({formatNumber({ number: landData.surface })} ha).
                            </p>
                            <p className="fr-callout__text">
                                L'artificialisation nette <strong><MillesimeDisplay is_interdepartemental={landData.is_interdepartemental} landArtifStockIndex={latestArtifData} between={true} /></strong> est de <strong>{formatNumber({ number: latestArtifData.flux_surface, addSymbol: true })} ha</strong>.
                            </p>
                        </div>

                        <ChartWithTable
                            chartId="artif_synthese_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            sources={["ocsge"]}
                            showTable={false}
                        />

                        {landData.child_land_types && landData.child_land_types.length > 0 && (
                            <>
                                <ChartWithTable
                                    chartId="artif_map_export"
                                    landId={landData.land_id}
                                    landType={landData.land_type}
                                    params={{
                                        index: maxIndex,
                                        previous_index: minIndex,
                                        child_land_type: landData.child_land_types[0],
                                    }}
                                    sources={["ocsge"]}
                                    isMap
                                />
                            </>
                        )}

                        <div className="fr-mt-4w">
                            <ContentZone
                                content={content.artificialisation_detail || ''}
                                mode={mode}
                                onChange={handleChange('artificialisation_detail')}
                                placeholder="Commentez les données d'artificialisation présentées. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                            />
                        </div>

                        <h3>5.3 Données disponibles</h3>

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

                        <h3>5.4 Répartitions des surfaces artificialisées par couverture et usage</h3>

                        <h4>5.4.1 Répartition par type de couverture</h4>

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

                        <h4>5.4.2 Flux d'artificialisation par type de couverture</h4>

                        <ChartWithTable
                            chartId="artif_flux_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />

                        <div className="fr-mt-4w">
                            <ContentZone
                                content={content.artificialisation_couverture || ''}
                                mode={mode}
                                onChange={handleChange('artificialisation_couverture')}
                                placeholder="Commentez la répartition des surfaces artificialisées par type de couverture. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                            />
                        </div>

                        <h4>5.4.3 Répartition par type d'usage</h4>

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

                        <h4>5.4.4 Flux d'artificialisation par type d'usage</h4>

                        <ChartWithTable
                            chartId="artif_flux_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />

                        <div className="fr-mt-4w">
                            <ContentZone
                                content={content.artificialisation_usage || ''}
                                mode={mode}
                                onChange={handleChange('artificialisation_usage')}
                                placeholder="Commentez la répartition des surfaces artificialisées par type de couverture. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                            />
                        </div>
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
                <h2>6 Les surfaces dont les sols ont été rendus imperméables</h2>

                {landData.has_ocsge ? (
                    <>
                        <div className="fr-callout">
                            <p className="fr-callout__text">
                                Il s'agit ici d'indiquer, à l'échelle d'un document de planification ou d'urbanisme, 
                                les surfaces dont les sols ont été rendus imperméables au sens des 1° et 2° de la nomenclature annexée à l'article R. 101-1 du code de l'urbanisme.
                            </p>
                        </div>

                        <h3>6.1 Répartition par type de couverture</h3>

                        <ChartWithTable
                            chartId="pie_imper_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3>6.2 Flux d'imperméabilisation par type de couverture</h3>

                        <ChartWithTable
                            chartId="imper_flux_by_couverture_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />

                        <div className="fr-mt-4w">
                            <ContentZone
                                content={content.impermeabilisation_couverture || ''}
                                mode={mode}
                                onChange={handleChange('impermeabilisation_couverture')}
                                placeholder="Commentez la répartition des surfaces imperméabilisées par type de couverture. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                            />
                        </div>

                        <h3>6.3 Répartition par type d'usage</h3>

                        <ChartWithTable
                            chartId="pie_imper_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ index: maxIndex }}
                            sources={["ocsge"]}
                        />

                        <h3>6.4 Flux d'imperméabilisation par type d'usage</h3>

                        <ChartWithTable
                            chartId="imper_flux_by_usage_export"
                            landId={landData.land_id}
                            landType={landData.land_type}
                            params={{ millesime_new_index: maxIndex, millesime_old_index: minIndex }}
                            sources={["ocsge"]}
                        />

                        <div className="fr-mt-4w">
                            <ContentZone
                                content={content.impermeabilisation_usage || ''}
                                mode={mode}
                                onChange={handleChange('impermeabilisation_usage')}
                                placeholder="Commentez la répartition des surfaces imperméabilisées par type d'usage. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                            />
                        </div>
                    </>
                ) : (
                    <div className="fr-callout fr-callout--brown-caramel">
                        <p className="fr-callout__text">
                            Les données d'occupation des sols à grande échelle (OCS GE) ne sont pas disponibles pour ce territoire.
                        </p>
                    </div>
                )}
            </section>
        </>
    );

    if (mode === 'print') {
        return (
            <PrintLayout>
                <PrintContent>
                    <CoverPage
                        landData={landData}
                        reportTitle="Rapport Complet"
                        reportSubtitle="Diagnostic territorial de sobriété foncière"
                    />
                    <AvailableDataPage
                        landData={landData}
                        consoStartYear={consoStartYear}
                        consoEndYear={consoEndYear}
                        mode="print"
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
                reportTitle="Rapport Complet"
                reportSubtitle="Diagnostic territorial de sobriété foncière"
            />
            <AvailableDataPage
                landData={landData}
                consoStartYear={consoStartYear}
                consoEndYear={consoEndYear}
                mode={mode}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />
            <MainContent>
                <ReportTypography>
                    {reportContent}
                </ReportTypography>
            </MainContent>
        </ReportContainer>
    );
};

export default RapportComplet;
