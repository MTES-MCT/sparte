import React, { useState } from 'react';
import Guide from '@components/ui/Guide';
import Card from '@components/ui/Card';
import { TrajectoiresChart } from '@components/charts/trajectoires/TrajectoiresChart';
import { TargetModal } from '@components/features/trajectoires/TargetModal';
import { useUpdateProjectTarget2031Mutation } from '@services/api';
import { formatNumber } from '@utils/formatUtils';
import { LandDetailResultType } from '@services/types/land';
import { ProjectDetailResultType } from '@services/types/project';
import styled from 'styled-components';

interface TrajectoiresProps {
    landData: LandDetailResultType;
    projectData: ProjectDetailResultType;
}

const EmptyCard = styled.div`
    background-color: white;
    border-radius: 4px;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    text-align: center;
    border: 2px dashed #e5e5e5;
`;

const EmptyCardIcon = styled.i`
    font-size: 3rem;
    color: var(--text-mention-grey);
`;

const EmptyCardTitle = styled.h4`
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
    color: var(--text-default-grey);
`;

const EmptyCardText = styled.p`
    font-size: 0.875rem;
    margin: 0;
    color: var(--text-mention-grey);
`;

const Trajectoires: React.FC<TrajectoiresProps> = ({ landData, projectData }) => {
    const { land_id, land_type, conso_details } = landData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateTarget2031, { isLoading: isUpdating }] = useUpdateProjectTarget2031Mutation();

    const conso_2011_2020 = conso_details?.conso_2011_2020 || 0;
    const conso_2011_2020_per_year = conso_2011_2020 / 10;
    const allowed_conso_2021_2030 = conso_details?.allowed_conso_2021_2030 || 0;
    const allowed_conso_2021_2030_per_year = allowed_conso_2021_2030 / 10;

    // Calcul de l'objectif personnalisé
    const target_custom = projectData.target_2031;
    const has_custom_target = target_custom !== null && target_custom !== 50;
    
    const annual_2020 = conso_2011_2020 / 10;
    const annual_custom_objective = has_custom_target 
        ? annual_2020 - (annual_2020 * ((target_custom || 50) / 100))
        : annual_2020 - (annual_2020 * 0.5);
    const allowed_conso_custom = annual_custom_objective * 10;

    const handleUpdateTarget = async (newTarget: number) => {
        try {
            await updateTarget2031({ projectId: projectData.id, target_2031: newTarget }).unwrap();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
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

            <h2 className="fr-mt-5w">Vue d'ensemble</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12 fr-col-md-4">
                    <Card
                        icon="bi bi-calendar-range"
                        badgeClass="fr-badge--blue-ecume"
                        badgeLabel="Période de référence"
                        value={
                            <>
                                {formatNumber({ number: conso_2011_2020 })} <span style={{ fontSize: '1.5rem' }}>ha</span>
                            </>
                        }
                        label="Consommation d'espaces NAF entre 2011 et 2020"
                    >
                        <div className="fr-text--sm text-muted">
                            Soit <strong>{formatNumber({ number: conso_2011_2020_per_year })} ha/an</strong> en moyenne
                        </div>
                    </Card>
                </div>
                <div className="fr-col-12 fr-col-md-4">
                    <Card
                        icon="bi bi-bullseye"
                        badgeClass="fr-badge--green-emeraude"
                        badgeLabel="Objectif national"
                        value={
                            <>
                                {formatNumber({ number: allowed_conso_2021_2030 })} <span style={{ fontSize: '1.5rem' }}>ha</span>
                            </>
                        }
                        label="Objectif national de réduction de 50%"
                    >
                        <div className="fr-text--sm text-muted">
                            Soit <strong>{formatNumber({ number: allowed_conso_2021_2030_per_year })} ha/an</strong> en moyenne
                        </div>
                    </Card>
                </div>
                <div className="fr-col-12 fr-col-md-4">
                    {has_custom_target ? (
                        <Card
                            icon="bi bi-star-fill"
                            badgeClass="fr-badge--orange-terre-battue"
                            badgeLabel="Objectif personnalisé"
                            value={
                                <>
                                    {formatNumber({ number: allowed_conso_custom })} <span style={{ fontSize: '1.5rem' }}>ha</span>
                                </>
                            }
                            label={`Réduction de ${target_custom}% sur 2021-2030`}
                            isHighlighted={true}
                            highlightBadge="Personnalisé"
                        >
                            <div className="fr-text--sm text-muted">
                                Soit <strong>{formatNumber({ number: annual_custom_objective })} ha/an</strong> en moyenne
                            </div>
                            <button
                                className="fr-btn fr-btn--secondary fr-btn--sm fr-mt-2w"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <i className="bi bi-pencil"></i>&nbsp;Modifier l'objectif
                            </button>
                        </Card>
                    ) : (
                        <EmptyCard>
                            <EmptyCardIcon className="bi bi-star" />
                            <EmptyCardTitle>Objectif personnalisé</EmptyCardTitle>
                            <EmptyCardText>
                                Définissez votre propre objectif de réduction de la consommation d'espaces NAF
                            </EmptyCardText>
                            <button
                                className="fr-btn fr-btn--primary fr-btn--sm"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <i className="bi bi-plus-circle"></i>&nbsp;Définir un objectif
                            </button>
                        </EmptyCard>
                    )}
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
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="fr-mt-5w">Trajectoire de consommation</h2>
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

            <TargetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentTarget={target_custom}
                onSubmit={handleUpdateTarget}
                isLoading={isUpdating}
            />
        </div>
    );
};

export default Trajectoires;
