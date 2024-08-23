import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/store';
import formatNumber from '../../utils/formatUtils';
import styled from 'styled-components';
import useHtmx from '@hooks/useHtmx';

const OverviewContainer = styled.header`
    position: sticky;
    background: #fff;
    border-bottom: 1px solid #EEF2F7;
    z-index: 998;
    padding: 1rem;
`;

const OverviewHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const OverviewTitle = styled.h1`
    color: #2B3674;
    margin: 0;
    padding: 0;
    font-size: 2em;
    margin-bottom: 0.5rem;
`;

const Overview: React.FC = () => {
    const projectData = useSelector((state: RootState) => state.project.projectData);
    const htmxRef = useHtmx([projectData]);
    
    if (!projectData) return <div>No project data available.</div>;

    return (
        <OverviewContainer ref={htmxRef}>
            <OverviewHeader>
                <OverviewTitle>{ projectData.territory_name }</OverviewTitle>
                <div className="dropdown custom-dropdown mt-2">
                    <button className="fr-btn" data-bs-toggle="dropdown" aria-expanded="false">
                        Télécharger un rapport
                    </button>

                    <ul className="dropdown-menu w-100">
                        <li>
                            <a
                                id="conso-report-download-btn"
                                className="fr-nav__link"
                                hx-get={`/project/${projectData.id}/tableau-de-bord/telechargement/rapport-conso`}
                                hx-target="#diag_word_form"
                                href="#"
                                data-fr-opened="false"
                                aria-controls="fr-modal-download-word"
                            >
                                Analyse de consommation
                            </a>
                        </li>
                        <li>
                            <a
                                id="download_diag_word_btn"
                                className="fr-nav__link"
                                hx-get={`/project/${projectData.id}/tableau-de-bord/telechargement/rapport-complet`}
                                hx-target="#diag_word_form"
                                href="#"
                                data-fr-opened="false"
                                aria-controls="fr-modal-download-word"
                            >
                                Analyse complète
                            </a>
                        </li>
                        <li className="d-flex justify-content-between"> 
                            <a
                                id="local-report-download-btn"
                                className="fr-nav__link"
                                hx-get={`/project/${projectData.id}/tableau-de-bord/telechargement/rapport-local`}
                                hx-target="#diag_word_form"
                                href="#"
                                data-fr-opened="false"
                                aria-controls="fr-modal-download-word"
                            >
                                Rapport triennal local 
                                <p className="fr-badge fr-badge--new fr-badge--sm">Nouveau</p>
                            </a>
                        </li>
                        <li>
                            <a 
                                id="download_diag_excel_btn" 
                                className="fr-nav__link"
                                href={`/project/${projectData.id}/export-excel`}
                            >
                                Format Excel
                            </a>
                        </li>
                    </ul>
                </div>
            </OverviewHeader>
            <ul className="fr-tags-group">
                <li>
                    <p className="fr-tag">Surface du territoire:&nbsp;<strong>{ formatNumber(projectData.area, 0) } ha</strong></p>
                </li>
                <li>
                    <a href="#" data-fr-opened="false" aria-controls="fr-modal-1" className="fr-tag" hx-get={`/project/${projectData.id}/set-period`} hx-target="#update_period_form">Période demandée:&nbsp;<strong>De { projectData.analyse_start_date } à { projectData.analyse_end_date }</strong><span className="fr-icon-pencil-fill fr-icon--sm custom-tag-icon" aria-hidden="true"></span></a>
                </li>
                <li>
                    <p className="fr-tag">Maille d'analyse:&nbsp;<strong>{ projectData.level_label }</strong></p>
                </li>
            </ul>

            <dialog aria-labelledby="fr-modal-title-modal-1" role="dialog" id="fr-modal-1" className="fr-modal">
                <div className="fr-container fr-container--fluid fr-container-md">
                    <div className="fr-grid-row fr-grid-row--center">
                        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                            <div className="fr-modal__body">
                                <div className="fr-modal__header">
                                    <button className="fr-btn--close fr-btn" title="Fermer la fenêtre modale" aria-controls="fr-modal-1">Fermer</button>
                                </div>
                                <div className="fr-modal__content">
                                    <h1 id="fr-modal-title-modal-1" className="fr-modal__title">Modifier la période du diagnostic</h1>
                                    <div id="update_period_form">
                                        <div className="fr-custom-loader"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>

            <dialog aria-labelledby="fr-modal-2-title" id="fr-modal-download-word" className="fr-modal" role="dialog" >
                <div className="fr-container fr-container--fluid fr-container-md">
                    <div className="fr-grid-row fr-grid-row--center">
                        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
                            <div className="fr-modal__body">
                                <div className="fr-modal__header">
                                    <button className="fr-link--close fr-link" aria-controls="fr-modal-download-word">Fermer</button>
                                </div>
                                <div className="fr-modal__content">
                                    <div id="diag_word_form"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </dialog>
        </OverviewContainer>
    );
};

export default Overview;
