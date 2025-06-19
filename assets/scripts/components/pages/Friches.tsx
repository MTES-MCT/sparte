import React, { useState, useRef, useEffect } from "react";
import Guide from "@components/ui/Guide";
import { FrichesChart } from "@components/charts/friches/FrichesChart";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandFrichesStatutQuery, useGetLandFrichesQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import styled from "styled-components";
import { FrichesMap } from "@components/map/friches/FrichesMap";
import { STATUT_BADGE_CONFIG, STATUT_CONFIG } from "@components/map/friches/constants";
import { LandFriche } from "@services/types/land_friches";
import { useDataTable } from "@hooks/useDataTable";
import { DataTable } from "@components/ui/DataTable";
import { Pagination } from "@components/ui/Pagination";
import { SearchInput } from "@components/ui/SearchInput";

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

const StatutBadge = styled.span`
    font-size: 1rem;
    text-transform: lowercase;
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
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0;
`;

const IconZoneActivite = styled.i`
    font-size: 1.5rem;
`;

const DisplayPaginationInfo = styled.div`
    margin-top: 1rem;
    font-size: 0.8rem;
`;

const FRICHES_CHARTS = [
    { id: 'friche_pollution' },
    { id: 'friche_surface' },
    { id: 'friche_type' },
    { id: 'friche_zonage_environnemental' },
    { id: 'friche_zonage_type' },
    { id: 'friche_zone_activite' }
] as const;

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
                <StatutBadge className={`fr-badge fr-badge--no-icon ${STATUT_BADGE_CONFIG[friche_statut as keyof typeof STATUT_BADGE_CONFIG] || ''}`}>
                    {friche_statut}
                </StatutBadge>
            </StatutHeader>
            <StatutContent>
                <StatutValue>{friche_count}</StatutValue>
                <StatutLabel>Soit {formatNumber({ number: friche_surface })} ha</StatutLabel>
            </StatutContent>
        </StatutCard>
    );
};

export const Friches: React.FC<FrichesProps> = ({
	projectData,
    landData,
}) => {
    const [selectedFriche, setSelectedFriche] = useState<[number, number] | null>(null);
    const mapSectionRef = useRef<HTMLDivElement>(null);

    const { data: statutData, isLoading: isLoadingStatut, error: statutError } = useGetLandFrichesStatutQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id
	});

    const { data: frichesData, isLoading: isLoadingFriches, error: frichesError } = useGetLandFrichesQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id
    });

    // Tableau
    const {
        paginatedData,
        searchTerm,
        setSearchTerm,
        sortField,
        sortDirection,
        setSort,
        currentPage,
        totalPages,
        setPage,
        displayInfo
    } = useDataTable({
        data: frichesData || [],
        searchFields: ['site_id', 'friche_type', 'friche_statut', 'friche_sol_pollution', 'friche_zonage_environnemental', 'friche_type_zone'],
        itemsPerPage: 10,
        defaultSortField: 'friche_statut',
        defaultSortDirection: 'asc'
    });

    const handleFricheClick = (point: { type: "Point"; coordinates: [number, number] }) => {
        setSelectedFriche(point.coordinates);
    };

    // Scroll vers la carte quand une friche est sélectionnée
    useEffect(() => {
        if (selectedFriche && mapSectionRef.current) {
            mapSectionRef.current.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }, [selectedFriche]);

    const columns = [
        {
            key: 'actions' as keyof LandFriche,
            label: 'Actions',
            sortable: false,
            render: (_: any, friche: LandFriche) => (
                <button
                    className="fr-btn fr-btn--sm fr-btn--secondary"
                    onClick={() => handleFricheClick(friche.point_on_surface)}
                >
                    <i className="bi bi-map fr-mr-1w"></i>
                    Voir sur la carte
                </button>
            )
        },
        {
            key: 'site_id' as keyof LandFriche,
            label: 'Identifiant',
            sortable: true
        },
        {
            key: 'friche_type' as keyof LandFriche,
            label: 'Type',
            sortable: true
        },
        {
            key: 'friche_statut' as keyof LandFriche,
            label: 'Statut',
            sortable: true,
            render: (value: any) => (
                <span className={`fr-badge fr-badge--no-icon text-lowercase ${STATUT_BADGE_CONFIG[value as keyof typeof STATUT_BADGE_CONFIG] || ''}`}>
                    {value}
                </span>
            )
        },
        {
            key: 'friche_sol_pollution' as keyof LandFriche,
            label: 'Pollution',
            sortable: true
        },
        {
            key: 'surface' as keyof LandFriche,
            label: 'Surface (ha)',
            sortable: true,
            render: (value: number) => formatNumber({ number: value / 10000 })
        },
        {
            key: 'friche_is_in_zone_activite' as keyof LandFriche,
            label: 'Zone d\'activité',
            sortable: false,
            render: (value: boolean) => (
                <IconZoneActivite className={`bi ${value ? 'bi-check text-success' : 'bi-x text-danger'}`}/>
            )
        },
        {
            key: 'friche_zonage_environnemental' as keyof LandFriche,
            label: 'Zonage environnemental',
            sortable: true
        },
        {
            key: 'friche_type_zone' as keyof LandFriche,
            label: 'Type de zone',
            sortable: true
        }
    ];

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
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                <div className="fr-col-12">
                    <SearchInput
                        id="search-friches"
                        placeholder="Recherchez par identifiant, type, statut, pollution, zonage..."
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                    <DataTable
                        data={paginatedData}
                        columns={columns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={setSort}
                        caption="Liste détaillée des friches du territoire"
                        className="fr-mb-2w"
                        noDataMessage={
                            searchTerm 
                                ? `Aucune friche trouvée pour "${searchTerm}". Essayez avec d'autres termes de recherche.`
                                : "Aucune friche disponible pour ce territoire."
                        }
                    />
                    <div className="d-flex justify-content-between align-items-center gap-2">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                        <DisplayPaginationInfo className="fr-text--xs">
                            {displayInfo.start}-{displayInfo.end} sur {displayInfo.total}
                        </DisplayPaginationInfo>
                    </div>
                </div>
            </div>
            <h2 className="fr-mt-7w">Carte des friches</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w" ref={mapSectionRef}>
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
