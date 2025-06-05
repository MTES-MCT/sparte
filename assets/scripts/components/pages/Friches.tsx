import React from "react";
import Guide from "@components/ui/Guide";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import { useGetLandFrichesStatutQuery } from "@services/api";
import { formatNumber } from "@utils/formatUtils";
import styled from "styled-components";

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

const STATUT_CONFIG = {
    'friche avec projet': { icon: 'bi bi-building' },
    'friche sans projet': { icon: 'bi bi-building-x' },
    'friche reconvertie': { icon: 'bi bi-building-check' },
    'friche potentielle': { icon: 'bi bi-building-exclamation' }
} as const;

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
    const {
		name,
	} = landData || {};

    const { data, isLoading, error }  = useGetLandFrichesStatutQuery({
        land_type: projectData.land_type,
        land_id: projectData.land_id
	});

    if (isLoading) return <div>Chargement...</div>;
    if (error) return <div>Erreur : {error}</div>;

	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-mb-3w">
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
			</div>
            <h2>Les friches sur le territoire de {name}</h2>
            <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
                {data?.map((friche) => (
                    <div key={friche.id} className="fr-col-12 fr-col-md-6 fr-col-lg-3">
                        <FrichesStatut
                            friche_count={friche.friche_count}
                            friche_surface={friche.friche_surface}
                            friche_statut={friche.friche_statut}
                        />
                    </div>
                ))}
            </div>
		</div>
	);
};
