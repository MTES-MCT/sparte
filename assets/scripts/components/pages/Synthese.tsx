import React from 'react';
import { Link } from 'react-router-dom';
import { ProjectDetailResultType } from "@services/types/project";
import { LandDetailResultType } from "@services/types/land";
import Loader from '@components/ui/Loader';
import { formatNumber } from "@utils/formatUtils";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { useArtificialisation } from "@hooks/useArtificialisation";
import Guide from "@components/ui/Guide";

interface SyntheseProps {
	projectData: ProjectDetailResultType;
	landData: LandDetailResultType;
}

const ArtificialisationSection: React.FC<{ 
    projectData: ProjectDetailResultType;
    landData: LandDetailResultType;
}> = ({ landData, projectData }) => {
    const { urls } = projectData;

    const { landArtifStockIndex : data, isLoading, error } = useArtificialisation({
        landData
    });

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-mt-7w">
            <h4>Artificialisation des sols </h4>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <p className="fr-callout__title">{formatNumber({ number: data.surface })} ha</p>
                        <p>
                            Surface artificialisée
                            {" "}
                            <MillesimeDisplay 
                                is_interdepartemental={landData.is_interdepartemental}
                                landArtifStockIndex={data}
                            />
                        </p>
                        <span className={`fr-badge ${
                            data.flux_surface >= 0
                                ? "fr-badge--error"
                                : "fr-badge--success"
                        } fr-badge--error fr-badge--sm fr-badge--no-icon`}>
                            {formatNumber({
                                number: data.flux_surface,
                                addSymbol: true,
                            })} ha
                            {data.flux_surface >= 0 ? (
                                <i className="bi bi-arrow-up-right fr-ml-1w" />
                            ) : (
                                <i className="bi bi-arrow-down-right fr-ml-1w" />
                            )}
                        </span>
                        <MillesimeDisplay 
                            is_interdepartemental={landData.is_interdepartemental}
                            landArtifStockIndex={data}
                            between={true}
                            className="fr-text--sm fr-ml-1w"
                        />
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        <p className="fr-callout__title">{formatNumber({ number: data.percent })}%</p>
                        <p>Taux d'artificialisation du territoire</p>
                    </div>
                </div>
            </div>
            
            <div className="fr-my-3w">
                <LandMillesimeTable 
                    millesimes={landData.millesimes}
                    territory_name={landData.name}
                    is_interdepartemental={landData.is_interdepartemental}
                />
            </div>
            
            <Link className="fr-link" to={urls.artificialisation}>Consulter le détail de l'artificialisation des sols</Link>
        </div>
    );
};

const Synthese: React.FC<SyntheseProps> = ({ 
	projectData,
	landData,
}) => {
    const {
        isLoading,
        error
    } = useArtificialisation({
        landData
    });

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row fr-grid-row--gutters">
				<div className="fr-col-12">
                    <Guide
                        title="Pourquoi la sobriété foncière ?"
                        DrawerTitle="Pourquoi la sobriété foncière ?"
                        drawerChildren={
                            <>
                                <p className="fr-text--sm mb-3">
                                    La sobriété foncière est essentielle pour préserver les sols naturels, agricoles et forestiers, indispensables à la biodiversité.
                                    Elle limite l'artificialisation, qui fragilise les écosystèmes et accentue les risques climatiques. Réduire l'étalement urbain permet de contenir les émissions de gaz à effet de serre, 
                                    et constitue un levier clé pour protéger les ressources et renforcer la résilience écologique des territoires.
                                </p>
                            </>
                        }
                    >
                         La sobriété foncière est essentielle pour préserver les sols naturels, agricoles et forestiers, indispensables à la biodiversité.
                        Elle limite l'artificialisation, qui fragilise les écosystèmes et accentue les risques climatiques. Réduire l'étalement urbain permet de contenir les émissions de gaz à effet de serre, 
                        et constitue un levier clé pour protéger les ressources et renforcer la résilience écologique des territoires.
                    </Guide>
				</div>
			</div>
            <h2 className="fr-mt-5w">Comprendre : les enjeux de la sobriété foncière</h2>
            <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                    <div className="fr-callout bg-white w-100">
                        1
                    </div>
                </div>
                <div className="fr-col-12 fr-col-md-6 fr-grid-row">
                <div className="fr-callout bg-white w-100">
                        2
                    </div>
                </div>
            </div>
            {landData?.has_ocsge && <ArtificialisationSection landData={landData} projectData={projectData} />}
        </div>
    );
};

export default Synthese;
