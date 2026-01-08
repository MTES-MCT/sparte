import React, { useState } from 'react';
import Guide from '@components/ui/Guide';
import Card from '@components/ui/Card';
import { TerritorialisationHierarchy } from '@components/features/trajectoires/TerritorialisationHierarchy';
import { TerritorialisationWarning } from '@components/features/trajectoires/TerritorialisationWarning';
import GuideContent from '@components/ui/GuideContent';
import { useUpdateProjectTarget2031Mutation, useGetCurrentUserQuery } from '@services/api';
import { formatNumber } from '@utils/formatUtils';
import { LandDetailResultType } from '@services/types/land';
import { ProjectDetailResultType } from '@services/types/project';
import styled from 'styled-components';
import GenericChart from '@components/charts/GenericChart';

interface TrajectoiresProps {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}

const PeriodTitle = styled.h4`
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
`;

const MiniChartContainer = styled.div`
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`;

const MiniChartBar = styled.div<{ $value: number; $maxValue: number; $color: string }>`
    height: 20px;
    background-color: ${props => props.$color};
    width: ${props => Math.max((props.$value / props.$maxValue) * 100, 2)}%;
    min-width: 2%;
    border-radius: 10px;
`;

const MiniChartLabel = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
`;

const MiniChartBarContainer = styled.div`
    position: relative;
    width: 100%;
    height: 20px;
    background-color: #f5f5f5;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
`;

const MiniChartBarText = styled.span<{ $color?: string }>`
    position: absolute;
    right: 0.5rem;
    font-size: 0.75rem;
    z-index: 1;
    pointer-events: none;
    color: ${props => props.$color || 'inherit'};
`;

const SectionTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #161616;
`;

const ObjectifCard = styled(Card)`
    justify-content: flex-start;
`;

const ReductionRow = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 40px;
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background: white;
    border-radius: 8px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
`;

const ModalTitle = styled.h4`
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
`;

const ModalActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
`;

interface MiniComparisonChartProps {
    value1: number;
    label1: string;
    value2?: number;
    label2?: string;
    color1?: string;
    color2?: string;
    textColor1?: string;
    textColor2?: string;
}

const MiniComparisonChart: React.FC<MiniComparisonChartProps> = ({
    value1,
    label1,
    value2,
    label2,
    color1 = '#0063CB',
    color2 = '#00A95F',
    textColor1,
    textColor2
}) => {
    const maxValue = Math.max(value1, value2 ?? 0, 0.001);

    return (
        <MiniChartContainer>
            <MiniChartLabel>
                <span>{label1}</span>
            </MiniChartLabel>
            <MiniChartBarContainer>
                <MiniChartBar $value={value1} $maxValue={maxValue} $color={color1} />
                <MiniChartBarText $color={textColor1}>
                    {formatNumber({ number: value1 })} ha
                </MiniChartBarText>
            </MiniChartBarContainer>
            {value2 !== undefined && label2 && (
                <>
                    <MiniChartLabel>
                        <span>{label2}</span>
                    </MiniChartLabel>
                    <MiniChartBarContainer>
                        <MiniChartBar $value={value2} $maxValue={maxValue} $color={color2} />
                        <MiniChartBarText $color={textColor2}>
                            {formatNumber({ number: value2 })} ha
                        </MiniChartBarText>
                    </MiniChartBarContainer>
                </>
            )}
        </MiniChartContainer>
    );
};


const Trajectoires: React.FC<TrajectoiresProps> = ({ landData, projectData }) => {
    const { land_id, land_type, name, conso_details, territorialisation } = landData;
    const [updateTarget2031, { isLoading: isUpdating }] = useUpdateProjectTarget2031Mutation();
    const [showCustomTargetModal, setShowCustomTargetModal] = useState(false);
    const [modalTargetInput, setModalTargetInput] = useState<string>('');

    const { data: currentUser } = useGetCurrentUserQuery();
    const isDGALNMember = currentUser?.groups?.includes('DGALN') ?? false;

    const openModal = () => {
        setModalTargetInput(projectData.target_2031?.toString() ?? '');
        setShowCustomTargetModal(true);
    };

    const conso_2011_2020 = conso_details?.conso_2011_2020;
    const annual_conso_since_2021 = conso_details?.annual_conso_since_2021;

    // Objectif territorialisé, suggéré (hérité d'un parent), ou national par défaut (50%)
    const has_territorialisation = territorialisation?.has_objectif ?? false;
    const is_from_parent = territorialisation?.is_from_parent ?? false;
    const objectif_reduction = has_territorialisation
        ? territorialisation?.objectif ?? 50
        : 50;

    // Déterminer le type d'objectif pour l'affichage
    const getObjectifLabel = () => {
        if (!has_territorialisation) return "Objectif national";
        if (is_from_parent) return "Objectif suggéré";
        return "Objectif territorialisé";
    };
    const objectifLabel = getObjectifLabel();

    // Document source de l'objectif (renvoyé par le backend)
    const sourceDocument = territorialisation?.source_document ?? null;
    // Document du territoire actuel (dernier élément de la hiérarchie) - utilisé pour les régions
    const currentDocument = territorialisation?.hierarchy?.at(-1) ?? null;
    // Document parent (avant-dernier élément) pour récupérer l'URL
    const parentDocument = territorialisation?.hierarchy?.at(-2) ?? null;
    const allowed_conso_2021_2030 = conso_2011_2020 * (1 - objectif_reduction / 100);
    const allowed_conso_2021_2030_per_year = allowed_conso_2021_2030 / 10;

    // Projections 2031 du territoire
    const ANNEES_ECOULEES = 3;
    const ANNEES_TOTALES = 10;
    const conso_since_2021 = annual_conso_since_2021 * ANNEES_ECOULEES;
    const conso_projetee_2031 = annual_conso_since_2021 * ANNEES_TOTALES;
    const taux_atteinte_2031 = allowed_conso_2021_2030 > 0
        ? (conso_projetee_2031 / allowed_conso_2021_2030) * 100
        : 0;
    const depassement_2031 = conso_projetee_2031 - allowed_conso_2021_2030;

    // Calcul de l'objectif personnalisé
    const target_custom = projectData.target_2031;
    const has_custom_target = target_custom != null;
    const allowed_conso_custom = has_custom_target ? conso_2011_2020 * (1 - target_custom / 100) : 0;
    const allowed_conso_custom_per_year = has_custom_target ? allowed_conso_custom / 10 : 0;

    const handleSaveCustomTarget = () => {
        if (modalTargetInput === '') {
            updateTarget2031({ projectId: projectData.id, target_2031: null });
        } else {
            const numValue = Number.parseFloat(modalTargetInput);
            if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                updateTarget2031({ projectId: projectData.id, target_2031: numValue });
            }
        }
        setShowCustomTargetModal(false);
    };

    return (
        <div className="fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <Guide
                        title="Cadre réglementaire et données"
                        DrawerTitle="Cadre réglementaire et données"
                        drawerChildren={
                            <>
                                <p className="fr-text--sm mb-3">
                                    La loi Climat & Résilience fixe<strong> l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec un objectif intermédiaire
                                    de réduction de moitié de la consommation d'espaces</strong>
                                    naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 (en se basant sur les données allant du 01/01/2021 au 31/12/2030)
                                    par rapport à la décennie précédente 2011-2020 (en se basant sur les données allant du 01/01/2011 au 31/12/2020).
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Cette <strong>trajectoire nationale progressive</strong> est à décliner dans les documents de planification et d'urbanisme (avant le 22 novembre 2024 pour les SRADDET,
                                    avant le 22 février 2027 pour les SCoT et avant le 22 février 2028 pour les PLU(i) et cartes communales).
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Elle doit être conciliée avec <strong>l'objectif de soutien de la construction durable</strong>, en particulier dans les territoires où l'offre de logements et de surfaces économiques
                                    est insuffisante au regard de la demande.
                                </p>
                                <p className="fr-text--sm mb-3">
                                    La loi prévoit également que <strong>la consommation foncière des projets d'envergure nationale ou européenne et d'intérêt général majeur sera comptabilisée au niveau national</strong>, et
                                    non au niveau régional ou local. Ces projets seront énumérés par arrêté du ministre chargé de l'urbanisme, en fonction de catégories définies dans la loi,
                                    après consultation des régions, de la conférence régionale et du public. Un forfait de 12 500 hectares est déterminé pour la période 2021-2031, dont 10 000
                                    hectares font l'objet d'une péréquation entre les régions couvertes par un SRADDET.
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Cette loi précise également l'exercice de territorialisation de la trajectoire. Afin de tenir compte des besoins de l'ensemble des territoires,
                                    <strong> une surface minimale d'un hectare de consommation est garantie à toutes les communes couvertes par un document d'urbanisme prescrit</strong>, arrêté ou approuvé avant le 22 août 2026,
                                    pour la période 2021-2031. Cette « garantie communale » peut être mutualisée au niveau intercommunal à la demande des communes. Quant aux communes littorales soumises au recul
                                    du trait de côte, qui sont listées par décret et qui ont mis en place un projet de recomposition spatiale, elles peuvent considérer, avant même que la désartificialisation soit
                                    effective, comme « désartificialisées » les surfaces situées dans la zone menacée à horizon 30 ans et qui seront ensuite désartificialisées.
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Dès aujourd'hui, <strong>Mon Diagnostic Artificialisation</strong> vous permet de vous projeter dans cet objectif de réduction de la consommation d'espaces NAF (Naturels, Agricoles et Forestiers) d'ici à 2031 et de simuler divers scénarios.
                                </p>
                                <p className="fr-text--sm mb-3">
                                    La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est mesurée avec les données d'évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à partir des fichiers MAJIC de la DGFIP.
                                    Le dernier millésime de 2023 est la photographie du territoire au 1er janvier 2024, intégrant les évolutions réalisées au cours de l'année 2023.
                                </p>
                            </>
                        }
                    >
                        <p className="fr-text--sm fr-mb-2w">La loi n° 2021-1104 du 22 août 2021 dite "Climat et Résilience" fixe pour la France l'objectif de parvenir au Zéro Artificialisation Nette (ZAN) à l'horizon 2050 (article L.101-2-1 du Code de l'urbanisme).
                        À titre intermédiaire, les collectivités doivent inscrire leurs documents d'urbanisme dans une trajectoire visant nationalement à <strong>réduire de moitié la consommation d'Espaces NAF (naturels, agricoles et forestiers) sur la période 2021-2031, par rapport à la décennie 2011-2020.</strong></p>
                        <p className="fr-text--sm"> Les données affichées sur cette plateforme proviennent du <strong>Portail national de l'artificialisation</strong> et sont produites par le CEREMA à partir des Fichiers Fonciers. Elles constituent une donnée <strong>de référence</strong> pour la mesure de la consommation d'Espaces NAF. Ces données peuvent être complétées par des données locales (ex. MOS, bases communales, etc.) dès lors que celles-ci sont cohérentes avec les définitions légales et justifiées méthodologiquement. </p>
                    </Guide>
                </div>
            </div>

            {!territorialisation?.has_objectif && <TerritorialisationWarning />}

            {territorialisation?.has_objectif && territorialisation?.hierarchy?.length > 0 && (
                <TerritorialisationHierarchy
                    hierarchy={territorialisation.hierarchy}
                    land_id={land_id}
                    land_type={land_type}
                    land_name={name}
                    has_children={territorialisation?.has_children ?? false}
                    is_from_parent={territorialisation?.is_from_parent ?? false}
                    parent_land_name={territorialisation?.parent_land_name ?? null}
                    objectif={territorialisation?.objectif ?? null}
                />
            )}

                <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                    <div className="fr-col-12 fr-col-lg-9">
                        <div style={{ background: 'var(--background-alt-grey)', borderRadius: '8px', padding: '1.5rem' }}>
                            <PeriodTitle>Période de référence : 2011 - 2020</PeriodTitle>
                            <div className="fr-mb-3w">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 }}>{formatNumber({ number: conso_2011_2020 })} ha</span>
                                    <span className="fr-tag fr-tag--blue" style={{ fontWeight: 700 }}>
                                        {formatNumber({ number: conso_2011_2020 / 10 })} ha/an en moyenne
                                    </span>
                                </div>
                                <p className="fr-text--sm" style={{ color: '#666', margin: '0.5rem 0' }}>Consommation cumulée de la période du 1er jan. 2011 au 31 déc. 2020 (10 ans)</p>
                            </div>

                            <PeriodTitle>Période de réduction : 2021 - 2031</PeriodTitle>
                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-6">
                                    <ObjectifCard
                                        icon="bi-bullseye"
                                        badgeClass='fr-badge'
                                        badgeLabel={objectifLabel}
                                        value={`${formatNumber({ number: allowed_conso_2021_2030 })} ha`}
                                        label="Consommation maximale 2021-2030"
                                        isHighlighted={true}
                                        highlightBadge={is_from_parent ? "Suggestion" : "Réglementaire"}
                                    >
                                        <div className="d-flex flex-column gap-2">
                                            <ReductionRow>
                                                <span className="fr-text--sm fr-mb-0">Réduction :</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>-{objectif_reduction}%</span>
                                            </ReductionRow>
                                            <MiniComparisonChart
                                                value1={annual_conso_since_2021}
                                                label1="Consommation annuelle moyenne (depuis 2021)"
                                                value2={allowed_conso_2021_2030_per_year}
                                                label2="Consommation annuelle moyenne autorisée"
                                                color1="#6a6a6a"
                                                color2={has_territorialisation ? "#A558A0" : "#00A95F"}
                                                textColor1="white"
                                            />
                                        </div>
                                    </ObjectifCard>
                                </div>
                                <div className="fr-col-12 fr-col-md-6">
                                    <ObjectifCard
                                        icon="bi-sliders"
                                        badgeClass={has_custom_target ? 'fr-badge' : 'fr-badge--grey'}
                                        badgeLabel="Objectif personnalisé"
                                        value={has_custom_target ? `${formatNumber({ number: allowed_conso_custom })} ha` : '-- ha'}
                                        label="Consommation maximale 2021-2030"
                                    >
                                        <div className="d-flex flex-column gap-2">
                                            <ReductionRow>
                                                <span className="fr-text--sm fr-mb-0">Réduction :</span>
                                                <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                                                    {has_custom_target ? `-${target_custom}%` : '--%'}
                                                </span>
                                                <button
                                                    type="button"
                                                    className="fr-btn fr-btn--sm fr-btn--secondary"
                                                    onClick={openModal}
                                                    title="Modifier l'objectif personnalisé"
                                                >
                                                    <i className="bi bi-pencil" />&nbsp;Modifier
                                                </button>
                                            </ReductionRow>
                                            {has_custom_target ? (
                                                <MiniComparisonChart
                                                    value1={annual_conso_since_2021}
                                                    label1="Consommation annuelle moyenne (depuis 2021)"
                                                    value2={allowed_conso_custom_per_year}
                                                    label2="Consommation annuelle moyenne personnalisée"
                                                    color1="#6a6a6a"
                                                    color2="#98cecc"
                                                    textColor1="white"
                                                />
                                            ) : (
                                                <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                                                    Cliquez sur le crayon pour définir un objectif personnalisé.
                                                </p>
                                            )}
                                        </div>
                                    </ObjectifCard>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="fr-col-12 fr-col-lg-3">
                        <GuideContent title="Comprendre les objectifs" column>
                            <p>
                                <strong>{objectifLabel}</strong> : c'est l'enveloppe maximale de consommation d'espaces que le territoire peut utiliser entre 2021 et 2030.
                                Elle est calculée en appliquant une réduction de <strong>{objectif_reduction}%</strong> à la consommation de référence (2011-2020).
                            </p>
                            {has_territorialisation && !is_from_parent && (
                                <p>
                                    Cet objectif est issu du{' '}
                                    {sourceDocument ? (
                                        parentDocument?.document_url ? (
                                            <a href={parentDocument.document_url} target="_blank" rel="noopener noreferrer">
                                                {sourceDocument.nom_document}
                                            </a>
                                        ) : (
                                            sourceDocument.nom_document
                                        )
                                    ) : currentDocument ? (
                                        currentDocument.document_url ? (
                                            <a href={currentDocument.document_url} target="_blank" rel="noopener noreferrer">
                                                {currentDocument.nom_document}
                                            </a>
                                        ) : (
                                            currentDocument.nom_document
                                        )
                                    ) : null}
                                    {land_type !== "REGION" && " et doit être inscrit dans vos documents d'urbanisme"}.
                                </p>
                            )}
                            {has_territorialisation && is_from_parent && (
                                <p>
                                    Cet objectif reprend celui de l'échelon supérieur <strong>{territorialisation?.parent_land_name}</strong>,
                                    car {name} ne dispose pas encore d'un objectif territorialisé propre.  Il est fourni à titre indicatif et n'a donc pas de valeur réglementaire."
                                </p>
                            )}
                            {!has_territorialisation && (
                                <p>
                                    En l'absence d'objectif territorialisé, la trajectoire nationale de <strong>-50%</strong> s'applique par défaut.
                                    Les documents de planification (SRADDET, SCoT, PLU) pourront définir un objectif spécifique.
                                </p>
                            )}
                            <p>
                                <strong>Objectif personnalisé</strong> : permet de simuler différents scénarios de réduction pour anticiper
                                les besoins du territoire. Cette simulation n'a pas de valeur réglementaire.
                            </p>
                        </GuideContent>
                    </div>
                </div>

            <div className="fr-mt-5w">
                <SectionTitle>Projection jusqu'en 2030</SectionTitle>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-lg-9">
                        <div className="bg-white fr-p-2w rounded">
                            {land_id && land_type && (
                                <GenericChart
                                    id="objective_chart"
                                    land_id={land_id}
                                    land_type={land_type}
                                    sources={['majic']}
                                    showDataTable
                                    params={has_custom_target ? { target_2031_custom: target_custom } : {}}
                                />
                            )}
                        </div>
                    </div>
                    <div className="fr-col-12 fr-col-lg-3">
                        <GuideContent title="Comment lire ce graphique ?" column>
                            <p>
                                Ce graphique compare la <strong>consommation réelle</strong> d'espaces avec la <strong>trajectoire théorique</strong> permettant d'atteindre l'objectif de réduction en 2030.
                            </p>
                            <p>
                                Si les <strong>barres grises</strong> (réel) sont plus hautes que les <strong>barres colorées</strong> (objectif),
                                le territoire doit ralentir son rythme de consommation afin de respecter l'objectif.
                            </p>
                            <p>
                                Les lignes montrent le cumul : tant que la <strong>ligne grise</strong> reste en-dessous de la <strong>ligne pointillée</strong>,
                                le territoire est en bonne voie pour respecter son objectif de réduction.
                            </p>
                        </GuideContent>
                    </div>
                </div>
            </div>

            {territorialisation?.has_children && isDGALNMember && territorialisation?.children_stats && (
                <div className="fr-mt-5w">
                    <SectionTitle>Avancement des membres de {name}</SectionTitle>
                    <div className="fr-notice fr-notice--info fr-mb-2w">
                        <div className="fr-container">
                            <div className="fr-notice__body">
                                <p className="fr-notice__title">
                                    Cette section est réservée aux agents de la DGALN et n'est pas visible par les autres utilisateurs.
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className="fr-text--sm fr-mb-2w" style={{ color: '#666' }}>
                        Suivez la progression de chaque membre vers son objectif.
                    </p>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-6 fr-col-lg-4">
                            <Card
                                icon="bi-check-circle"
                                badgeClass="fr-badge--success"
                                badgeLabel="En bonne voie"
                                value={`${territorialisation.children_stats.en_bonne_voie}`}
                                label={`territoire${territorialisation.children_stats.en_bonne_voie > 1 ? 's' : ''} en bonne voie`}
                            />
                        </div>
                        <div className="fr-col-6 fr-col-lg-4">
                            <Card
                                icon="bi-exclamation-triangle"
                                badgeClass="fr-badge--warning"
                                badgeLabel="Vont dépasser"
                                value={`${territorialisation.children_stats.vont_depasser}`}
                                label={`territoire${territorialisation.children_stats.vont_depasser > 1 ? 's vont' : ' va'} dépasser leur enveloppe au rythme actuel`}
                            />
                        </div>
                        <div className="fr-col-6 fr-col-lg-4">
                            <Card
                                icon="bi-x-circle"
                                badgeClass="fr-badge--error"
                                badgeLabel="Déjà dépassé"
                                value={`${territorialisation.children_stats.deja_depasse}`}
                                label={`territoire${territorialisation.children_stats.deja_depasse > 1 ? 's ont' : ' a'} déjà dépassé l'enveloppe`}
                            />
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-12 fr-col-lg-9">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_progress_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-lg-3">
                            <GuideContent title="Lecture de la carte" column>
                                <p>
                                    <strong style={{ color: '#34D399' }}>{territorialisation.children_stats.en_bonne_voie}</strong> {territorialisation.children_stats.en_bonne_voie > 1 ? 'territoires sont' : 'territoire est'} en bonne voie pour respecter leur enveloppe.
                                </p>
                                <p>
                                    <strong style={{ color: '#FBBF24' }}>{territorialisation.children_stats.vont_depasser}</strong> {territorialisation.children_stats.vont_depasser > 1 ? 'territoires vont dépasser' : 'territoire va dépasser'} leur enveloppe au rythme actuel.
                                </p>
                                <p>
                                    <strong style={{ color: '#F87171' }}>{territorialisation.children_stats.deja_depasse}</strong> {territorialisation.children_stats.deja_depasse > 1 ? 'territoires ont' : 'territoire a'} déjà dépassé leur enveloppe.
                                </p>
                                <p className="fr-text--sm" style={{ color: '#666' }}>Survolez un territoire pour voir les détails.</p>
                            </GuideContent>
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-12 fr-col-lg-9">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_rythme_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-lg-3">
                            <GuideContent title="Lecture de la carte" column>
                                <p>Compare la consommation annuelle actuelle à la consommation annuelle autorisée pour respecter l'enveloppe.</p>
                                <p>
                                    <strong style={{ color: '#34D399' }}>Vert</strong> : consomme moins que le rythme autorisé.<br />
                                    <strong style={{ color: '#B71C1C' }}>Rouge</strong> : consomme plus que le rythme autorisé.
                                </p>
                                <p className="fr-text--sm" style={{ color: '#666' }}>Survolez un territoire pour voir les détails.</p>
                            </GuideContent>
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12 fr-col-lg-6">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_conso_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-lg-6">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_restante_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                    </div>

                    <SectionTitle className="fr-mt-5w">Projection de {name} en 2031 au rythme actuel</SectionTitle>
                    <p className="fr-text--sm fr-mb-2w" style={{ color: '#666' }}>
                        Estimation de la situation en 2031 si le rythme de consommation actuel se maintient.
                    </p>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-graph-up-arrow"
                                badgeClass="fr-badge--grey"
                                badgeLabel="Projection"
                                value={`${formatNumber({ number: conso_projetee_2031 })} ha`}
                                label="Consommation projetée en 2031"
                            />
                        </div>
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-bullseye"
                                badgeClass="fr-badge--grey"
                                badgeLabel="Objectif"
                                value={`${formatNumber({ number: allowed_conso_2021_2030 })} ha`}
                                label="Consommation max autorisée"
                            />
                        </div>
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-percent"
                                badgeClass={taux_atteinte_2031 > 100 ? 'fr-badge--error' : 'fr-badge--success'}
                                badgeLabel={taux_atteinte_2031 > 100 ? 'Dépassement' : 'Dans l\'objectif'}
                                value={`${formatNumber({ number: taux_atteinte_2031, decimals: 1 })}%`}
                                label="de l'objectif atteint en 2031"
                            />
                        </div>
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon={depassement_2031 > 0 ? 'bi-exclamation-triangle' : 'bi-check-circle'}
                                badgeClass={depassement_2031 > 0 ? 'fr-badge--error' : 'fr-badge--success'}
                                badgeLabel={depassement_2031 > 0 ? 'Dépassement' : 'Marge'}
                                value={`${depassement_2031 > 0 ? '+' : ''}${formatNumber({ number: depassement_2031 })} ha`}
                                label={depassement_2031 > 0 ? 'de dépassement projeté' : 'de marge disponible'}
                            />
                        </div>
                    </div>

                </div>
            )}

            {showCustomTargetModal && (
                <ModalOverlay onClick={() => setShowCustomTargetModal(false)}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>Définir un objectif personnalisé</ModalTitle>
                        <div className="fr-input-group">
                            <label className="fr-label" htmlFor="custom-target-modal">
                                Pourcentage de réduction
                            </label>
                            <div className="d-flex align-items-center gap-2">
                                <input
                                    id="custom-target-modal"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={modalTargetInput}
                                    onChange={(e) => setModalTargetInput(e.target.value)}
                                    disabled={isUpdating}
                                    className="fr-input"
                                    style={{ width: '120px', textAlign: 'center' }}
                                />
                                <span>%</span>
                            </div>
                            <p className="fr-hint-text">
                                Entrez un pourcentage entre 0 et 100 pour simuler un objectif de réduction personnalisé.
                            </p>
                        </div>
                        <ModalActions>
                            <button
                                type="button"
                                className="fr-btn fr-btn--tertiary-no-outline"
                                onClick={() => setShowCustomTargetModal(false)}
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                className="fr-btn"
                                onClick={handleSaveCustomTarget}
                                disabled={isUpdating}
                            >
                                Enregistrer
                            </button>
                        </ModalActions>
                    </ModalContent>
                </ModalOverlay>
            )}
        </div>
  );
};

export default Trajectoires;
