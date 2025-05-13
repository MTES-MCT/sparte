import React from 'react';
import { Link } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import Loader from '@components/ui/Loader';
import { formatNumber } from "@utils/formatUtils";
import { MillesimeDisplay } from "@components/features/ocsge/MillesimeDisplay";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { Millesime, MillesimeByIndex } from "@services/types/land";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { ProjectDetailResultType } from "@services/types/project";

/*
Ce composant est un composant hybride qui permet de récupérer du contenu côté serveur via Django et de l'intégrer directement dans l'interface React.
Cette approche progressive facilite la migration des éléments de contenu existants vers React, tout en permettant de conserver certaines fonctionnalités serveur le temps de la transition.

### Injection HTML contrôlée :
Le contenu récupéré du serveur est inséré directement dans le DOM à l'aide de `dangerouslySetInnerHTML`.
Cela est nécessaire pour rendre du contenu HTML généré côté serveur, mais il est important de prendre des précautions contre les injections de code malveillant (XSS).
Dans ce cas, les données provenant de Django sont considérées comme fiables.
*/

interface ArtificialisationData {
    surface: number;
    percent: number;
    flux_surface: number;
    years: number[];
    is_interdepartemental: boolean;
    millesime_index: number;
    flux_previous_years: number[];
    millesimes: Millesime[];
    territory_name: string;
    land_type: string;
    land_id: string;
    millesimes_by_index: MillesimeByIndex[];
}

interface UrlsType {
    [key: string]: string;
}

const ArtificialisationSection: React.FC<{ 
    data: ArtificialisationData;
    urls: UrlsType;
}> = ({ data, urls }) => {
    const { landArtifStockIndex, isLoading, error } = useArtificialisation({
        projectData: {
            land_type: data.land_type,
            land_id: data.land_id
        } as ProjectDetailResultType,
        landData: {
            millesimes_by_index: data.millesimes_by_index
        } as any
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
                                is_interdepartemental={data.is_interdepartemental}
                                landArtifStockIndex={landArtifStockIndex}
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
                            is_interdepartemental={data.is_interdepartemental}
                            landArtifStockIndex={landArtifStockIndex}
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
                    millesimes={data.millesimes}
                    territory_name={data.territory_name}
                    is_interdepartemental={data.is_interdepartemental}
                />
            </div>
            
            <Link className="fr-link" to={urls.artificialisation}>Consulter le détail de l'artificialisation des sols</Link>
        </div>
    );
};

const Synthese: React.FC<{ 
    endpoint: string; 
    urls: UrlsType; 
    artificialisationData?: ArtificialisationData 
}> = ({ endpoint, urls, artificialisationData }) => {
    const { content, isLoading, error } = useHtmlLoader(endpoint);

    if (isLoading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div className="fr-container--fluid fr-p-3w">
            <div className="fr-grid-row">
                <div className="fr-col-12">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
            {artificialisationData && <ArtificialisationSection data={artificialisationData} urls={urls} />}
        </div>
    );
};

export default Synthese;
