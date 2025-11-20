import React from 'react';
import Guide from '@components/ui/Guide';
import Card from '@components/ui/Card';
import { TrajectoiresChart } from '@components/charts/trajectoires/TrajectoiresChart';
import { TargetModal, useTargetModal } from '@components/features/trajectoires/TargetModal';
import { useUpdateProjectTarget2031Mutation } from '@services/api';
import { formatNumber } from '@utils/formatUtils';
import { LandDetailResultType } from '@services/types/land';
import { ProjectDetailResultType } from '@services/types/project';
import styled from 'styled-components';

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

const PeriodReferenceValue = styled.span`
    font-size: 2.8rem;
    font-weight: 600;
`;

const PeriodReferenceLabel = styled.p`
    font-size: 0.85rem;
    margin-top: 1rem;
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
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.5rem;
    font-size: 0.75rem;
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
`;

interface MiniComparisonChartProps {
    value1: number;
    label1: string;
    value2: number;
    label2: string;
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
    // Utiliser la valeur maximale réelle, avec un minimum très petit pour éviter la division par zéro
    const maxValue = Math.max(value1, value2, 0.001);
    
    return (
        <MiniChartContainer>
            <MiniChartLabel>
                <span>{label1}</span>
            </MiniChartLabel>
            <MiniChartBarContainer>
                <MiniChartBar $value={value1} $maxValue={maxValue} $color={color1}>
                    {value1 > maxValue * 0.15 && formatNumber({ number: value1 })} ha
                </MiniChartBar>
            </MiniChartBarContainer>
            <MiniChartLabel>
                <span>{label2}</span>
            </MiniChartLabel>
            <MiniChartBarContainer>
                <MiniChartBar $value={value2} $maxValue={maxValue} $color={color2}>
                    {value2 > maxValue * 0.15 && formatNumber({ number: value2 })} ha
                </MiniChartBar>
            </MiniChartBarContainer>
        </MiniChartContainer>
    );
};

const Trajectoires: React.FC<TrajectoiresProps> = ({ landData, projectData }) => {
    const { land_id, land_type, conso_details } = landData;
    const modal = useTargetModal();
    const [updateTarget2031, { isLoading: isUpdating }] = useUpdateProjectTarget2031Mutation();

    const conso_2011_2020 = conso_details?.conso_2011_2020;
    const conso_2011_2020_per_year = conso_2011_2020 / 10;
    const allowed_conso_2021_2030 = conso_details?.allowed_conso_2021_2030;
    const allowed_conso_2021_2030_per_year = allowed_conso_2021_2030 / 10;
    const annual_conso_since_2021 = conso_details?.annual_conso_since_2021;

    // Calcul de l'objectif personnalisé
    const target_custom = projectData.target_2031;
    const has_custom_target = Number(target_custom) !== 50;
    
    const annual_2020 = conso_2011_2020 / 10;
    const annual_custom_objective = has_custom_target 
        ? annual_2020 - (annual_2020 * ((target_custom || 50) / 100))
        : annual_2020 - (annual_2020 * 0.5);
    const allowed_conso_custom = annual_custom_objective * 10;

    const handleUpdateTarget = async (newTarget: number) => {
        await updateTarget2031({ projectId: projectData.id, target_2031: newTarget }).unwrap();
    };

    return (
        <div className="fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <Guide
                        title="Cadre réglementaire"
                        DrawerTitle="Cadre Réglementaire"
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
                        La loi Climat & Résilience fixe<strong> l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec un objectif intermédiaire
                        de réduction de moitié de la consommation d'espaces</strong> naturels, agricoles et forestiers dans les dix prochaines années 2021-2031 
                        par rapport à la décennie précédente 2011-2021.
                    </Guide>
                </div>
            </div>

            <div className="fr-notice fr-notice--warning fr-mb-5w">
                <div className="fr-px-2w">
                    <div className="fr-notice__body">
                        <p>
                            <span className="fr-notice__title fr-text--sm">
                                L'équipe travaille à l'intégration des objectifs déjà
                                territorialisés de réduction de la consommation d'espaces
                                NAF.{" "}
                            </span>
                            <span className="fr-notice__desc fr-text--sm">
                                Dans l'attente de cette mise à jour, vous pouvez modifier
                                l'objectif du territoire dans le graphique ci-dessous. Par
                                défaut, en attendant cette territorisalisation, l'outil
                                affiche l'objectif national de réduction de 50%.
                                <br /><br /><strong>Cet objectif est fourni à titre indicatif et n’a pas de valeur réglementaire.</strong>
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <Container>
                <PeriodTitle>Période de référence: 2011 - 2021</PeriodTitle>
                <PeriodReferenceValue>
                    <span>{formatNumber({ number: conso_2011_2020 })} ha</span>
                    <span className="fr-tag fr-tag--sm fr-tag--blue fr-ml-2w">{formatNumber({ number: conso_2011_2020_per_year })} ha/an</span>
                </PeriodReferenceValue>
                <PeriodReferenceLabel className="fr-mb-5w">Consommation cumulée de la période du 1er jan. 2011 au 31 déc. 2020 (10 ans)</PeriodReferenceLabel>
                
                <div className="d-flex justify-content-between align-items-center fr-mb-2w">
                    <PeriodTitle>Période de réduction : 2021 - 2031 </PeriodTitle>
                    {has_custom_target && (
                        <button
                            className="fr-btn fr-btn--secondary fr-btn--sm"
                            onClick={() => modal.open()}
                        >
                            Modifier l'objectif personnalisé
                        </button>
                    )}
                </div>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-6">
                        <Card
                            badgeClass="fr-badge--blue-ecume"
                            badgeLabel="Objectif de réduction (non-réglementaire) : 50%"
                            value={`${formatNumber({ number: allowed_conso_2021_2030 })} ha`}
                            label="Consommation maximale pour la période du 1er jan. 2021 au 31 déc. 2030 (10 ans)"
                            isHighlighted={true}
                            highlightBadge="trajectoire selon objectif national"
                        >
                            <MiniComparisonChart
                                value1={annual_conso_since_2021}
                                label1="Consommation annuelle moyenne depuis 2021"
                                value2={allowed_conso_2021_2030_per_year}
                                label2="Consommation annuelle moyenne selon objectif national"
                                color1="#D9D9D9"
                                color2="#b6c1ea"
                            />
                        </Card>
                    </div>
                    <div className="fr-col-12 fr-col-md-6">
                        {has_custom_target ? (
                            <Card
                                badgeClass="fr-badge--green-archipel"
                                badgeLabel={`Objectif de réduction (personnalisé) : ${target_custom}%`}
                                value={`${formatNumber({ number: allowed_conso_custom })} ha`}
                                label="Consommation maximale pour la période du 1er jan. 2021 au 31 déc. 2030 (10 ans)"
                                isHighlighted={true}
                                highlightBadge="Trajectoire selon objectif personnalisé"
                            >
                                <MiniComparisonChart
                                    value1={annual_conso_since_2021}
                                    label1="Consommation annuelle moyenne depuis 2021"
                                    value2={annual_custom_objective}
                                    label2="Consommation annuelle moyenne selon objectif personnalisé"
                                    color1="#D9D9D9"
                                    color2="#B6DFDE"
                                />
                            </Card>
                        ) : (
                            <Card
                                isHighlighted={true}
                                highlightBadge="Trajectoire selon objectif personnalisé"
                                empty={true}
                            >
                                <div className="d-flex flex-column align-items-center gap-2 justify-content-center">
                                    <p className="fr-text--sm">Simuler une trajectoire personnalisée en ajustant l'objectif de réduction.</p>
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
                        <TrajectoiresChart
                            id="objective_chart"
                            land_id={land_id}
                            land_type={land_type}
                            sources={['majic']}
                            showDataTable={true}
                            params={{
                                target_2031_custom: target_custom || 50
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="fr-mb-7w fr-mt-5w">
                <div className="bg-white fr-p-4w rounded">
                    <h6>
                        D'où proviennent ces données ? 
                    </h6>
                    <div className="fr-highlight fr-highlight--no-margin">
                        <p className="fr-text--sm">
                            La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est mesurée avec les données d'évolution des fichiers fonciers produits et diffusés par le Cerema depuis 2009 à partir des fichiers MAJIC de la DGFIP.
                            Le dernier millésime de 2023 est la photographie du territoire au 1er janvier 2024, intégrant les évolutions réalisées au cours de l'année 2023.
                        </p>
                    </div>
                </div>
            </div>

            <TargetModal
                currentTarget={target_custom}
                onSubmit={handleUpdateTarget}
                isLoading={isUpdating}
            />
        </div>
    );
};

export default Trajectoires;
