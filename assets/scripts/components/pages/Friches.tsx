import React, { useState } from "react";
import Guide from "@components/ui/Guide";
import { FrichesChart } from "@components/charts/friches/FrichesChart";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandFrichesStatutQuery, useGetLandFrichesQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import styled from "styled-components";
import { FrichesMap } from "@components/map/friches/FrichesMap";

interface FrichesProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

const StatutCard = styled.div`
    background-color: white;
    border-radius: 4px;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const StatutHeader = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const StatutIcon = styled.i`
    font-size: 2.5rem;
`;

const StatutTitle = styled.h3`
    margin: 0;
    font-size: 1.25rem;
`;

const StatutContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const StatutValue = styled.div`
	font-size: 3rem;
	font-weight: bold;
	line-height: 3rem;
`;

const StatutLabel = styled.p`
    text-transform: lowercase;
`;

const IconZoneActivite = styled.i`
    font-size: 1.5rem;
`;

const STATUT_CONFIG = {
    'friche avec projet': { icon: 'bi bi-building' },
    'friche sans projet': { icon: 'bi bi-building-x' },
    'friche reconvertie': { icon: 'bi bi-building-check' },
} as const;

const STATUT_BADGE_CONFIG = {
    'friche reconvertie': 'fr-badge--success',
    'friche avec projet': 'fr-badge--info',
    'friche sans projet': 'fr-badge--warning',
} as const;

const FRICHES_CHARTS = [
    { id: 'friche_pollution' },
    { id: 'friche_surface' },
    { id: 'friche_type' },
    { id: 'friche_zonage_environnemental' },
    { id: 'friche_zonage_type' },
    { id: 'friche_zone_activite' }
] as const;

const TableRow = styled.tr`
    cursor: pointer;
    &:hover {
        background-color: var(--background-contrast-grey);
    }
`;

const FrichesStatut: React.FC<{
    friche_count: number;
    friche_surface: number;
    friche_statut: string;
}> = ({ friche_count, friche_surface, friche_statut }) => {
    const { icon } = STATUT_CONFIG[friche_statut as keyof typeof STATUT_CONFIG] || { 
        icon: 'bi bi-circle'
    };

    return (
        <StatutCard>
            <StatutHeader>
                <StatutIcon className={icon} />
                <StatutTitle>{friche_statut}</StatutTitle>
            </StatutHeader>
            <StatutContent>
                <StatutValue>{friche_count}</StatutValue>
                <StatutLabel className="fr-badge fr-badge--info">Soit {formatNumber({ number: friche_surface / 10000 })} ha</StatutLabel>
            </StatutContent>
        </StatutCard>
    );
};

export const Friches: React.FC<FrichesProps> = ({
	projectData,
    landData,
}) => {
    const [selectedFriche, setSelectedFriche] = useState<[number, number] | null>(null);
    const { data: statutData, isLoading: isLoadingStatut, error: statutError } = useGetLandFrichesStatutQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id
	});

    const { data: frichesData, isLoading: isLoadingFriches, error: frichesError } = useGetLandFrichesQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id
    });

    const handleFricheClick = (point: { type: "Point"; coordinates: [number, number] }) => {
        setSelectedFriche(point.coordinates);
    };

    if (isLoadingStatut || isLoadingFriches) return <div>Chargement...</div>;
    if (statutError || frichesError) return <div>Erreur : {statutError || frichesError}</div>;

	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-grid-row fr-grid-row--gutters">
				<div className="fr-col-12">
                    <Guide
                        title="Qu'est-ce qu'une friche urbaine ?"
                        DrawerTitle="Qu'est-ce qu'une friche urbaine ?"
                        drawerChildren={
                            <>
                                <p className="fr-text--sm mb-3">
                                    La loi Climat et Résilience du 22 août 2021 définit ce qu'est une friche au sens du code de l'urbanisme : "tout bien ou droit immobilier, bâti ou non bâti, inutilisé et dont l'état, la configuration ou l'occupation totale ou partielle ne permet pas un réemploi sans un aménagement ou des travaux préalables".
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Une friche est donc une zone désaffectée après avoir connu une activité économique (industrielle ou commerciale), des usages résidentiels ou des équipements. On estime que ces sites pourraient représenter en France entre 90 000 et 150 000 hectares d'espaces inemployés, l'équivalent de plus de six ans d'artificialisation.
                                </p>
                                <p className="fr-text--sm mb-3">
                                    Recycler des friches urbaines peut être un moyen non seulement de limiter l'artificialisation des sols, mais aussi de redynamiser des territoires et de réhabiliter des sites pollués.
                                </p>
                            </>
                        }
                    >
                        La loi Climat et Résilience du 22 août 2021 définit ce qu'est une friche au sens du code de l'urbanisme : "tout bien ou droit immobilier, bâti ou non bâti, inutilisé et dont l'état, la configuration ou l'occupation totale ou partielle ne permet pas un réemploi sans un aménagement ou des travaux préalables".
                    </Guide>
				</div>
			</div>
            <h2 className="fr-mt-5w">Vue d'ensemble</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                {statutData?.map((friche) => (
                    <div key={friche.id} className="fr-col-12 fr-col-md-6 fr-col-lg-4">
                        <FrichesStatut
                            friche_count={friche.friche_count}
                            friche_surface={friche.friche_surface}
                            friche_statut={friche.friche_statut}
                        />
                    </div>
                ))}
            </div>
            <h2 className="fr-mt-7w">Détail des friches</h2>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <div className="fr-table fr-table--caption-bottom fr-table--no-caption">
                        <div className="fr-table__wrapper fr-mb-0">
                            <div className="fr-table__container">
                                <div className="fr-table__content">
                                    <table>
                                        <caption>
                                            Liste détaillée des friches du territoire
                                        </caption>
                                        <thead>
                                            <tr>
                                                <th className="fr-cell--fixed" role="columnheader"></th>
                                                <th scope="col">Identifiant</th>
                                                <th scope="col">Type</th>
                                                <th scope="col">Statut</th>
                                                <th scope="col">Pollution</th>
                                                <th scope="col">Surface (ha)</th>
                                                <th scope="col">Zone d'activité</th>
                                                <th scope="col">Zonage environnemental</th>
                                                <th scope="col">Type de zone</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {frichesData?.map((friche) => (
                                                <TableRow 
                                                    key={friche.site_id} 
                                                    data-row-key={friche.site_id}
                                                >
                                                    <th className="fr-cell--fixed">
                                                        <button
                                                            className="fr-btn fr-btn--sm fr-btn--secondary"
                                                            onClick={() => handleFricheClick(friche.point_on_surface)}
                                                        >
                                                            <i className="bi bi-map fr-mr-1w"></i>
                                                            Voir sur la carte
                                                        </button>
                                                    </th>
                                                    <td>{friche.site_id}</td>
                                                    <td>{friche.friche_type}</td>
                                                    <td>
                                                        <span className={`fr-badge fr-badge--no-icon text-lowercase ${STATUT_BADGE_CONFIG[friche.friche_statut as keyof typeof STATUT_BADGE_CONFIG] || ''}`}>
                                                            {friche.friche_statut}
                                                        </span>
                                                    </td>
                                                    <td>{friche.friche_sol_pollution}</td>
                                                    <td>{formatNumber({ number: friche.surface / 10000 })}</td>
                                                    <td>
                                                        <IconZoneActivite className={`bi ${friche.friche_is_in_zone_activite ? 'bi-check text-success' : 'bi-x text-danger'}`}/>
                                                    </td>
                                                    <td>{friche.friche_zonage_environnemental}</td>
                                                    <td>{friche.friche_type_zone}</td>
                                                </TableRow>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h2 className="fr-mt-7w">Carte des friches</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12">
                    <FrichesMap 
                        projectData={projectData} 
                        center={selectedFriche}
                    />
                </div>
            </div>
            <h2 className="fr-mt-7w">Indicateurs</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                {FRICHES_CHARTS.map((chart, index) => (
                    <div key={chart.id} className="fr-col-12 fr-col-md-6 bg-white">
                        <FrichesChart
                            id={chart.id}
                            land_id={projectData.land_id}
                            land_type={projectData.land_type}
                        />
                    </div>
                ))}
            </div>
		</div>
	);
};
