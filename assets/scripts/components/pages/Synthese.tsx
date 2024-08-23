import React from 'react';
import { useParams } from 'react-router-dom';
import { useHtmlLoader } from '@hooks/useHtmlLoader';
import Card from '@components/ui/Card';
import Loader from '@components/ui/Loader';

const Synthese: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const endpoint = `/project/${projectId}/tableau-de-bord/synthesis`;
    const { content, loading, error } = useHtmlLoader(endpoint);

    if (loading) return <Loader />;
    if (error) return <div>Erreur : {error}</div>;

    return (
        <div>
            {/* <div className="fr-grid-row fr-grid-row--gutters">
                <div className="fr-col-12">
                    <Card title="Cadre légal. Loi C&R" icon="bi-info-circle-fill">
                        <p className="fr-text--sm mb-3">L'article 191 de la Loi Climat & Résilience exprime que :</p>
                        <p className="fr-text--sm mb-3"><i>« Afin d'atteindre l'objectif national d'absence de toute artificialisation nette des sols en 2050, le rythme de <strong>l'artificialisation des sols</strong> dans les dix années suivant la promulgation de la présente loi doit être tel que, sur cette période, <strong>la consommation totale d'espaces</strong> observée à l'échelle nationale soit inférieure à la moitié de celle observée sur les dix années précédant cette date.»</i></p>
                        <p className="fr-text--sm mb-3">Informations clés à retenir sur la mise en œuvre&nbsp;:</p>
                        <ul className="fr-text--sm">
                            <li>Entre 2021 et 2031 à l'échelle de la région, il est demandé de diviser par 2 la consommation d'espaces NAF (Naturels, Agricoles et Forestiers) mesurée entre 2011 et 2021.</li>
                            <li>D'ici février 2024, les schémas régionaux territorialiseront les objectifs de diminution.</li>
                            <li>Les SCoT (Schéma de Cohérence Territoriale) auront jusqu'en février 2027 pour intégrer ces objectifs</li>
                            <li>Les PLU et cartes communales jusqu'en février 2028</li>
                        </ul>
                        <p className="fr-text--sm mb-3">Mon Diagnostic Artificialisation vous accompagne dans le suivi de ces nouvelles règles en produisant des indicateurs s'appuyant sur&nbsp;:</p>
                        <ul className="fr-text--sm mb-0">
                            <li>la base de données d'OCcupation des Sols à Grande Echelle (OCS GE) de l'IGN ;</li>
                            <li>les fichiers fonciers du Cerema issus des données MAJIC (Mise A Jour de l'Information Cadastrale) de la DGFIP ;</li>
                            <li>les données, en particulier du recensement, de l'INSEE</li>
                        </ul>
                    </Card>
                </div>
            </div> */}
            <div className="fr-grid-row fr-grid-row--gutters fr-p-3w">
                <div className="fr-col-12">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        </div>
    );
};

export default Synthese;