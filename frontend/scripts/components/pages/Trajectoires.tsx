import React, { useState, useEffect, useRef, useCallback } from 'react';
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

const MiniChartBarText = styled.span`
    position: absolute;
    right: 0.5rem;
    font-size: 0.75rem;
    z-index: 1;
    pointer-events: none;
`;

const SectionTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: #161616;
`;

interface MiniComparisonChartProps {
    value1: number;
    label1: string;
    value2?: number;
    label2?: string;
    color1?: string;
    color2?: string;
}

const MiniComparisonChart: React.FC<MiniComparisonChartProps> = ({
    value1,
    label1,
    value2,
    label2,
    color1 = '#0063CB',
    color2 = '#00A95F'
}) => {
    const maxValue = Math.max(value1, value2 ?? 0, 0.001);

    return (
        <MiniChartContainer>
            <MiniChartLabel>
                <span>{label1}</span>
            </MiniChartLabel>
            <MiniChartBarContainer>
                <MiniChartBar $value={value1} $maxValue={maxValue} $color={color1} />
                <MiniChartBarText>
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
                        <MiniChartBarText>
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
    const [customTargetInput, setCustomTargetInput] = useState<string>(projectData.target_2031?.toString() ?? '');

    const { data: currentUser } = useGetCurrentUserQuery();
    const isDGALNMember = currentUser?.groups?.includes('DGALN') ?? false;

    useEffect(() => {
        setCustomTargetInput(projectData.target_2031?.toString() ?? '');
    }, [projectData.target_2031]);

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

    // Calcul de l'objectif personnalisé
    const target_custom = projectData.target_2031;
    const has_custom_target = target_custom != null;
    const allowed_conso_custom = has_custom_target ? conso_2011_2020 * (1 - target_custom / 100) : 0;
    const allowed_conso_custom_per_year = has_custom_target ? allowed_conso_custom / 10 : 0;

    // Debounce pour la mise à jour de l'objectif personnalisé
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedUpdateTarget = useCallback((newTarget: number | null) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            updateTarget2031({ projectId: projectData.id, target_2031: newTarget });
        }, 500);
    }, [projectData.id, updateTarget2031]);

    // Cleanup du debounce au démontage
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    const handleCustomTargetChange = (value: string) => {
        setCustomTargetInput(value);
        if (value === '') {
            debouncedUpdateTarget(null);
        } else {
            const numValue = Number.parseFloat(value);
            if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                debouncedUpdateTarget(numValue);
            }
        }
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

                <PeriodTitle>Période de référence : 2011 - 2020</PeriodTitle>
                <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
                    <div className="fr-col-12 fr-col-lg-3">
                        <Card
                            icon="bi-calendar-range"
                            badgeClass="fr-badge--grey"
                            badgeLabel="Base de calcul"
                            value={`${formatNumber({ number: conso_2011_2020 })} ha`}
                            label="Consommation cumulée sur 10 ans"
                            isHighlighted={true}
                            highlightBadge="Référence"
                        />
                    </div>
                    <div className="fr-col-12 fr-col-lg-9">
                        <GuideContent title="Comment ça marche ?" column>
                            <p>
                                La consommation observée entre <strong>2011 et 2020</strong> ({formatNumber({ number: conso_2011_2020 })} ha)
                                sert de référence pour fixer la consommation maximale pour la période suivante.
                                Avec un objectif de <strong>-{objectif_reduction}%</strong>, le territoire peut consommer
                                au maximum <strong>{formatNumber({ number: allowed_conso_2021_2030 })} ha</strong> entre 2021 et 2030,
                                soit <strong>{formatNumber({ number: allowed_conso_2021_2030_per_year })} ha/an</strong> en moyenne.
                            </p>
                        </GuideContent>
                    </div>
                </div>

                <PeriodTitle>Période de réduction : 2021 - 2031</PeriodTitle>
                <p className="fr-text--sm fr-mb-2w" style={{ color: '#666' }}>
                    {has_territorialisation ? (
                        <>
                            Votre territoire doit réduire sa consommation d'espaces de <strong>{objectif_reduction}%</strong> par rapport à 2011-2020,
                            conformément aux documents de planification en vigueur.
                        </>
                    ) : (
                        <>
                            En l'absence d'objectif territorialisé, la trajectoire nationale de <strong>-50%</strong> sert de référence
                            pour votre territoire.
                        </>
                    )}
                </p>
                <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                    <div className="fr-col-12 fr-col-lg-4">
                        <Card
                            icon="bi-bullseye"
                            badgeClass='fr-badge'
                            badgeLabel={objectifLabel}
                            value={`${formatNumber({ number: allowed_conso_2021_2030 })} ha`}
                            label="Consommation maximale 2021-2030"
                            isHighlighted={true}
                            highlightBadge={is_from_parent ? "Suggestion" : "Réglementaire"}
                        >
                            <MiniComparisonChart
                                value1={annual_conso_since_2021}
                                label1="Consommation annuelle moyenne (depuis 2021)"
                                value2={allowed_conso_2021_2030_per_year}
                                label2="Consommation annuelle moyenne autorisée"
                                color1="#6a6a6a"
                                color2={has_territorialisation ? "#A558A0" : "#00A95F"}
                            />
                        </Card>
                    </div>
                    <div className="fr-col-12 fr-col-lg-4">
                        <Card
                            icon="bi-sliders"
                            badgeClass={has_custom_target ? 'fr-badge' : 'fr-badge--grey'}
                            badgeLabel="Objectif personnalisé"
                            value={has_custom_target ? `${formatNumber({ number: allowed_conso_custom })} ha` : undefined}
                            label={has_custom_target ? "Consommation maximale 2021-2030" : undefined}
                        >
                            <div className="d-flex flex-column gap-2">
                                <div className="d-flex align-items-center gap-2">
                                    <label htmlFor="custom-target" className="fr-text--sm fr-mb-0">Réduction :</label>
                                    <input
                                        id="custom-target"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={customTargetInput}
                                        onChange={(e) => handleCustomTargetChange(e.target.value)}
                                        disabled={isUpdating}
                                        className="fr-input"
                                        style={{ width: '100px', textAlign: 'center' }}
                                    />
                                    <span className="fr-text--sm">%</span>
                                </div>
                                {has_custom_target ? (
                                    <MiniComparisonChart
                                        value1={annual_conso_since_2021}
                                        label1="Consommation annuelle moyenne (depuis 2021)"
                                        value2={allowed_conso_custom_per_year}
                                        label2="Consommation annuelle moyenne personnalisée"
                                        color1="#6a6a6a"
                                        color2="#98cecc"
                                    />
                                ) : (
                                    <p className="fr-text--sm fr-text-mention--grey fr-mb-0">
                                        Entrez un pourcentage de réduction pour simuler un objectif personnalisé.
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>
                    <div className="fr-col-12 fr-col-lg-4">
                        <GuideContent title="Comprendre les objectifs" column>
                            {has_territorialisation && !is_from_parent && (
                                <p>
                                    <strong>{objectifLabel} (-{objectif_reduction}%)</strong> : objectif réglementaire issu du{' '}
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
                                    {land_type !== "REGION" && ", à inscrire dans vos documents d'urbanisme"}.
                                </p>
                            )}
                            {has_territorialisation && is_from_parent && (
                                <p>
                                    <strong>{objectifLabel} (-{objectif_reduction}%)</strong> : objectif du territoire parent{' '}
                                    <strong>{territorialisation?.parent_land_name}</strong>, utilisé comme référence en l'absence
                                    d'objectif territorialisé propre à {name}.
                                </p>
                            )}
                            {!has_territorialisation && (
                                <p>
                                    <strong>Objectif national (-50%)</strong> : trajectoire de référence en l'absence d'objectif territorialisé.
                                    Les documents de planification (SRADDET, SCoT, PLU) peuvent définir un objectif spécifique pour votre territoire.
                                </p>
                            )}
                            <p>
                                <strong>Objectif personnalisé</strong> : simulation libre pour explorer différents scénarios
                                de réduction, sans valeur réglementaire.
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
                                Ce graphique compare votre consommation réelle d'espaces avec la trajectoire théorique
                                permettant d'atteindre l'objectif de réduction en 2030.
                            </p>
                            <p>
                                Si les barres grises (réel) sont plus hautes que les barres colorées (objectif),
                                votre territoire consomme plus vite que prévu.
                            </p>
                            <p>
                                Les lignes montrent le cumul : tant que la ligne grise reste sous la ligne pointillée,
                                vous êtes dans les clous pour 2030.
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
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-people"
                                badgeClass="fr-badge--grey"
                                badgeLabel="Membres"
                                value={`${territorialisation.children_stats.total_membres}`}
                                label="Territoires suivis"
                            />
                        </div>
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-graph-up"
                                badgeClass="fr-badge--grey"
                                badgeLabel="Progression globale"
                                value={`${territorialisation.children_stats.progression_globale}%`}
                                label="de la consommation max. atteinte"
                            />
                        </div>
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-check-circle"
                                badgeClass="fr-badge--success"
                                badgeLabel="En bonne voie"
                                value={`${territorialisation.children_stats.en_bonne_voie}`}
                                label={`territoire${territorialisation.children_stats.en_bonne_voie > 1 ? 's' : ''} sous l'objectif`}
                            />
                        </div>
                        <div className="fr-col-6 fr-col-md-3">
                            <Card
                                icon="bi-exclamation-triangle"
                                badgeClass="fr-badge--error"
                                badgeLabel="En dépassement"
                                value={`${territorialisation.children_stats.en_depassement}`}
                                label={`territoire${territorialisation.children_stats.en_depassement > 1 ? 's' : ''} au-dessus de l'objectif`}
                            />
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-12 fr-col-lg-8">
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
                        <div className="fr-col-12 fr-col-lg-4">
                            <GuideContent title="Progression" column>
                                <p>Part de la consommation maximale autorisée déjà utilisée depuis 2021.</p>
                                <p>
                                    <strong style={{ color: '#4CAF50' }}>Vert</strong> = moins de 50%<br />
                                    <strong style={{ color: '#FFC107' }}>Jaune</strong> = 50-80%<br />
                                    <strong style={{ color: '#F44336' }}>Rouge</strong> = objectif dépassé
                                </p>
                            </GuideContent>
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-12 fr-col-lg-8">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_annees_restantes_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-lg-4">
                            <GuideContent title="Années restantes" column>
                                <p>Nombre d'années avant dépassement si le rythme actuel se poursuit.</p>
                                <p>
                                    <strong style={{ color: '#B71C1C' }}>Rouge foncé</strong> = déjà dépassé<br />
                                    <strong style={{ color: '#FFC107' }}>Jaune</strong> = 3-6 ans<br />
                                    <strong style={{ color: '#4CAF50' }}>Vert</strong> = +10 ans de marge
                                </p>
                            </GuideContent>
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-12 fr-col-lg-8">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_effort_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-lg-4">
                            <GuideContent title="Effort requis" column>
                                <p>Réduction du rythme annuel nécessaire pour respecter l'objectif d'ici 2030.</p>
                                <p>
                                    <strong style={{ color: '#4CAF50' }}>Vert</strong> = aucun effort requis<br />
                                    <strong style={{ color: '#FF8A65' }}>Orange</strong> = -30 à -60%<br />
                                    <strong style={{ color: '#C62828' }}>Rouge</strong> = effort majeur (&gt;60%)
                                </p>
                            </GuideContent>
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
                        <div className="fr-col-12 fr-col-lg-8">
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
                        <div className="fr-col-12 fr-col-lg-4">
                            <GuideContent title="Écart au rythme" column>
                                <p>Compare le rythme de consommation actuel au rythme autorisé par l'objectif.</p>
                                <p>
                                    <strong style={{ color: '#1B5E20' }}>Vert foncé</strong> = bien en dessous<br />
                                    <strong style={{ color: '#FFF9C4' }}>Jaune pâle</strong> = dans les clous<br />
                                    <strong style={{ color: '#B71C1C' }}>Rouge</strong> = rythme trop élevé
                                </p>
                            </GuideContent>
                        </div>
                    </div>

                    <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12 fr-col-lg-4">
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
                        <div className="fr-col-12 fr-col-lg-4">
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
                        <div className="fr-col-12 fr-col-lg-4">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_objectif_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
  );
};

export default Trajectoires;
