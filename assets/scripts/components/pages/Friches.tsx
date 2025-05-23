import React from "react";
import Guide from "@components/ui/Guide";
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";

interface FrichesProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

export const Friches: React.FC<FrichesProps> = ({
	projectData,
}) => {
	return (
		<div className="fr-container--fluid fr-p-3w">
			<div className="fr-mb-7w">
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
                                        Une friche est donc une zone désaffectée après avoir connu une activité économique (industrielle ou commerciale), des usages résidentiels ou des équipements. On estime que ces sites pourraient représenter en France entre 90 000 et 150 000 hectares d’espaces inemployés, l’équivalent de plus de six ans d’artificialisation.
                                    </p>
                                    <p className="fr-text--sm mb-3">
                                        Recycler des friches urbaines peut être un moyen non seulement de limiter l’artificialisation des sols, mais aussi de redynamiser des territoires et de réhabiliter des sites pollués.
                                    </p>
                                </>
                            }
                        >
                            La loi Climat et Résilience du 22 août 2021 définit ce qu'est une friche au sens du code de l'urbanisme : "tout bien ou droit immobilier, bâti ou non bâti, inutilisé et dont l'état, la configuration ou l'occupation totale ou partielle ne permet pas un réemploi sans un aménagement ou des travaux préalables".
                        </Guide>
					</div>
				</div>
			</div>
		</div>
	);
};
