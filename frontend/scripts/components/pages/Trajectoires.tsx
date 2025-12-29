import React from 'react';
import Guide from '@components/ui/Guide';
import Card from '@components/ui/Card';
import { TargetModal, useTargetModal } from '@components/features/trajectoires/TargetModal';
import { TerritorialisationHierarchy } from '@components/features/trajectoires/TerritorialisationHierarchy';
import { TerritorialisationWarning } from '@components/features/trajectoires/TerritorialisationWarning';
import GuideContent from '@components/ui/GuideContent';
import { useUpdateProjectTarget2031Mutation } from '@services/api';
import { formatNumber } from '@utils/formatUtils';
import { LandDetailResultType } from '@services/types/land';
import { ProjectDetailResultType } from '@services/types/project';
import styled from 'styled-components';
import GenericChart from '@components/charts/GenericChart';

interface TrajectoiresProps {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}

const Container = styled.div`
    background: linear-gradient(180deg,rgb(236, 236, 248) 0%, rgba(236, 236, 248, 0) 100%);
    border-radius: 4px; 
    padding: 1.5rem;
`;

const PeriodTitle = styled.h4`
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.8rem;
`;

const MiniChartContainer = styled.div`
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
    margin-bottom: 0.25rem;
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
    const { land_id, land_type, conso_details, territorialisation } = landData;
    const modal = useTargetModal();
    const [updateTarget2031, { isLoading: isUpdating }] = useUpdateProjectTarget2031Mutation();

    const conso_2011_2020 = conso_details?.conso_2011_2020;
    const conso_2011_2020_per_year = conso_2011_2020 / 10;
    const annual_conso_since_2021 = conso_details?.annual_conso_since_2021;

    // Objectif territorialisé (réglementaire) ou national par défaut (50%)
    const has_territorialisation = territorialisation?.has_objectif ?? false;
    const objectif_reduction = has_territorialisation
        ? territorialisation?.objectif ?? 50
        : 50;
    const allowed_conso_2021_2030 = conso_2011_2020 * (1 - objectif_reduction / 100);
    const allowed_conso_2021_2030_per_year = allowed_conso_2021_2030 / 10;

    // Calcul de l'objectif personnalisé
    const target_custom = projectData.target_2031;
    const has_custom_target = Number(target_custom) !== 50;
    const allowed_conso_custom = conso_2011_2020 * (1 - (target_custom || 50) / 100);
    const allowed_conso_custom_per_year = allowed_conso_custom / 10;

    const handleUpdateTarget = async (newTarget: number) => {
        await updateTarget2031({ projectId: projectData.id, target_2031: newTarget }).unwrap();
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
                                    par rapport à la décennie précédente 2011-2021 (en se basant sur les données allant du 01/01/2011 au 31/12/2020).
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
                        <p className="fr-text--sm fr-mb-2w">La loi n° 2021-1104 du 22 août 2021 dite “Climat et Résilience” fixe pour la France l’objectif de parvenir au Zéro Artificialisation Nette (ZAN) à l’horizon 2050 (article L.101-2-1 du Code de l’urbanisme). 
                        À titre intermédiaire, les collectivités doivent inscrire leurs documents d’urbanisme dans une trajectoire visant nationalement à <strong>réduire de moitié la consommation d’espaces naturels, agricoles et forestiers (ENAF) sur la période 2021-2031, par rapport à la décennie 2011-2021.</strong></p>
                        <p className="fr-text--sm"> Les données affichées sur cette plateforme proviennent du <strong>Portail national de l’artificialisation</strong> et sont produites par le CEREMA à partir des Fichiers Fonciers. Elles constituent une donnée <strong>de référence</strong> pour la mesure de la consommation d’ENAF. Ces données peuvent être complétées par des données locales (ex. MOS, bases communales, etc.) dès lors que celles-ci sont cohérentes avec les définitions légales et justifiées méthodologiquement. </p>
                    </Guide>
                </div>
            </div>

            {!territorialisation?.has_objectif && <TerritorialisationWarning />}

            {territorialisation?.has_objectif && territorialisation?.hierarchy?.length > 0 && (
                <TerritorialisationHierarchy hierarchy={territorialisation.hierarchy} />
            )}

            <Container>
                <PeriodTitle>Période de référence : 2011 - 2021</PeriodTitle>
                <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
                    <div className="fr-col-12 fr-col-lg-5">
                        <Card
                            icon="bi-calendar-range"
                            badgeClass="fr-badge--grey"
                            badgeLabel="Consommation de référence"
                            value={`${formatNumber({ number: conso_2011_2020 })} ha`}
                            label="Consommation cumulée du 1er jan. 2011 au 31 déc. 2020 (10 ans)"
                            isHighlighted={true}
                            highlightBadge="Base de calcul"
                        >
                            <MiniComparisonChart
                                value1={conso_2011_2020_per_year}
                                label1="Consommation annuelle moyenne durant la période de référence"
                                value2={allowed_conso_2021_2030_per_year}
                                label2="Objectif annuel 2021-2030"
                                color1="#6a6a6a"
                                color2={has_territorialisation ? "#A558A0" : "#00A95F"}
                            />
                        </Card>
                    </div>
                    <div className="fr-col-12 fr-col-lg-7">
                        <GuideContent title="Pourquoi cette période de référence ?" column>
                            <p>
                                La <strong>période 2011-2020</strong> sert de base pour calculer les objectifs de réduction
                                de consommation d'espaces. C'est la consommation observée sur cette décennie qui détermine
                                l'enveloppe maximale autorisée pour 2021-2031.
                            </p>
                            <p>
                                {has_territorialisation ? (
                                    <>
                                        L'objectif territorialisé pour ce territoire est de <strong>réduire de {objectif_reduction}%</strong> la
                                        consommation d'espaces NAF par rapport à cette période de référence. Cet objectif provient
                                        des documents de planification (SRADDET, SCoT, PLU) qui déclinent l'objectif national.
                                    </>
                                ) : (
                                    <>
                                        L'objectif national est de <strong>réduire de 50%</strong> la consommation d'espaces NAF
                                        par rapport à cette période de référence. Les documents de planification (SRADDET, SCoT, PLU)
                                        peuvent territorialiser cet objectif avec des taux différents selon les territoires.
                                    </>
                                )}
                            </p>
                        </GuideContent>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center fr-mb-1w">
                    <PeriodTitle>Période de réduction : 2021 - 2031</PeriodTitle>
                    {has_custom_target && (
                        <button
                            className="fr-btn fr-btn--secondary fr-btn--sm"
                            onClick={() => modal.open()}
                        >
                            Modifier l'objectif personnalisé
                        </button>
                    )}
                </div>
                <p className="fr-text--sm fr-mb-2w" style={{ color: '#666' }}>
                    Retrouvez ci-dessous l'objectif de réduction {has_territorialisation ? "territorialisé issu des documents de planification" : "national fixé par la loi"} pour
                    votre territoire. Vous pouvez également définir un <strong>objectif personnalisé</strong> pour simuler différents scénarios de trajectoire.
                </p>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-6">
                        <Card
                            icon="bi-bullseye"
                            badgeClass={has_territorialisation ? "fr-badge--purple-glycine" : "fr-badge--blue-ecume"}
                            badgeLabel={has_territorialisation ? "Objectif territorialisé (réglementaire)" : "Objectif national (non-réglementaire)"}
                            value={`${formatNumber({ number: allowed_conso_2021_2030 })} ha`}
                            label="Consommation maximale du 1er jan. 2021 au 31 déc. 2030 (10 ans)"
                        >
                            <MiniComparisonChart
                                value1={annual_conso_since_2021}
                                label1="Consommation annuelle moyenne depuis 2021"
                                value2={allowed_conso_2021_2030_per_year}
                                label2={has_territorialisation ? "Consommation annuelle maximum pour 2021-2030 (territorialisé)" : "Consommation annuelle maximum 2021-2030 (national)"}
                                color1="#0063CB"
                                color2={has_territorialisation ? "#A558A0" : "#00A95F"}
                            />
                        </Card>
                    </div>
                    <div className="fr-col-12 fr-col-md-6">
                        {has_custom_target ? (
                            <Card
                                icon="bi-sliders"
                                badgeClass="fr-badge--green-archipel"
                                badgeLabel="Objectif personnalisé"
                                value={`${formatNumber({ number: allowed_conso_custom })} ha`}
                                label="Consommation maximale du 1er jan. 2021 au 31 déc. 2030 (10 ans)"
                            >
                                <MiniComparisonChart
                                    value1={annual_conso_since_2021}
                                    label1="Consommation annuelle moyenne depuis 2021"
                                    value2={allowed_conso_custom_per_year}
                                    label2="Consommation annuelle maximum pour 2021-2030 (personnalisé)"
                                    color1="#0063CB"
                                    color2="#98cecc"
                                />
                            </Card>
                        ) : (
                            <Card
                                icon="bi-sliders"
                                badgeClass="fr-badge--grey"
                                badgeLabel="Objectif personnalisé"
                            >
                                <div className="d-flex flex-column align-items-center gap-2 justify-content-center">
                                    <p className="fr-text--sm fr-mb-0">Simuler une trajectoire personnalisée en ajustant l'objectif de réduction.</p>
                                    <button
                                        className="fr-btn fr-btn--secondary fr-btn--sm"
                                        onClick={() => modal.open()}
                                    >
                                        Définir un objectif personnalisé
                                    </button>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </Container>

            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12">
                    <div className="bg-white fr-p-2w rounded">
                      {land_id && land_type && (
                                <GenericChart
                                    id="objective_chart"
                                    land_id={land_id}
                                    land_type={land_type}
                                    sources={['majic']}
                                    showDataTable
                                    params={{
                                        target_2031_custom: has_custom_target ? target_custom : objectif_reduction,
                                        ...(has_territorialisation && { target_territorialise: objectif_reduction })
                                    }}
                                />
                          )}
                    </div>
                </div>
            </div>

            {territorialisation?.has_children && (
                <div className="fr-mt-3w">
                    <h4 className="fr-h4 fr-mb-2w">Territorialisation des objectifs</h4>
                    <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12 fr-col-lg-8">
                            <div className="bg-white fr-p-2w rounded h-100">
                                <GenericChart
                                    id="territorialisation_map"
                                    isMap
                                    land_id={land_id}
                                    land_type={land_type}
                                    showDataTable
                                />
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-lg-4">
                            <GuideContent title="Comprendre la carte" column>
                                <p>
                                    Cette carte présente les <strong>objectifs de réduction de consommation d'espaces</strong> assignés aux territoires.
                                </p>
                                <p>
                                    Chaque territoire affiche son objectif en pourcentage, correspondant à la réduction attendue entre 2021-2031
                                    par rapport à 2011-2021. Plus la couleur est foncée, plus l'objectif est ambitieux.
                                </p>
                                <p>
                                    Les objectifs proviennent des <strong>documents de planification</strong> (SRADDET, SCoT, PLU, etc.).
                                </p>
                            </GuideContent>
                        </div>
                    </div>
                </div>
            )}

            {territorialisation?.has_children && (
                <div className="fr-mt-3w">
                    <h4 className="fr-h4 fr-mb-2w">Situation par rapport aux objectifs</h4>
                    <div className="fr-grid-row fr-grid-row--gutters">
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
                            <GuideContent title="Comprendre la carte" column>
                                <p>
                                    Cette carte montre la <strong>progression de chaque territoire vers son objectif</strong>.
                                </p>
                                <p>
                                    Le pourcentage affiché représente la part de l'enveloppe de consommation 2021-2030 déjà utilisée.
                                    Un territoire à 50% a consommé la moitié de son budget. Au-delà de 100%, il est en dépassement.
                                </p>
                                <p>
                                    Consommation issue des <strong>fichiers fonciers</strong> (Cerema), objectifs des documents de planification.
                                </p>
                            </GuideContent>
                        </div>
                    </div>
                </div>
            )}

            <TargetModal
                currentTarget={target_custom}
                onSubmit={handleUpdateTarget}
                isLoading={isUpdating}
            />
        </div>
  );
};

export default Trajectoires;
