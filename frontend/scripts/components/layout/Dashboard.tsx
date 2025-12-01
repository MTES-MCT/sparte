import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/store';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useGetLandQuery, useGetProjectQuery, useGetEnvironmentQuery } from '@services/api';
import { setProjectData } from '@store/projectSlice';
import { selectIsNavbarOpen } from '@store/navbarSlice';
import { fetchPdfExport, selectPdfExportStatus } from '@store/pdfExportSlice';
import useWindowSize from '@hooks/useWindowSize';
import useMatomoTracking from '@hooks/useMatomoTracking';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import Navbar from '@components/layout/Navbar';
import TopBar from '@components/layout/TopBar';
import Synthese from '@components/pages/Synthese';
import { Consommation } from '@components/pages/Consommation';
import LogementVacant from '@components/pages/LogementVacant';
import Trajectoires from '@components/pages/Trajectoires';
import RapportLocal from '@components/pages/RapportLocal';
import { Artificialisation } from '@components/pages/Artificialisation';
import { Impermeabilisation } from '@components/pages/Impermeabilisation';
import Update from '@components/pages/Update';
import Downloads from '@components/pages/Downloads';
import { Friches } from '@components/pages/Friches';
import RouteWrapper from '@components/ui/RouteWrapper';
import ConsoCorrectionStatus, { ConsoCorrectionStatusEnum } from '@components/features/status/ConsoCorrectionStatus';
import OcsgeStatus, { OcsgeStatusEnum } from '@components/features/status/OcsgeStatus';
import LogementVacantStatus from '@components/features/status/LogementVacantStatus';
import FricheStatus from '@components/features/status/FricheStatus';

interface DashboardProps {
    projectId: string;
}

const Main = styled.main<{ $isOpen: boolean; $isMobile: boolean }>`
    margin-left: ${({ $isOpen, $isMobile }) => {
        if ($isMobile) return '0';
        return $isOpen ? '280px' : '0';
    }};
    margin-top: 80px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #f8f9ff;
    transition: margin-left 0.3s ease;
`;

const Content = styled.div`
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;


const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: projectData, error, isLoading } = useGetProjectQuery(projectId);
    const { data: landData } = useGetLandQuery(
        {
            land_type: projectData?.land_type,
            land_id: projectData?.land_id
        },
        {
            skip: !projectData
        }
    );
    const { data: env } = useGetEnvironmentQuery(null);

    const { ocsge_status, has_ocsge, has_friche, has_conso, consommation_correction_status } = landData || {};

    const { urls, logements_vacants_available } = projectData || {};

    const isOpen = useSelector((state: RootState) => selectIsNavbarOpen(state));
    const pdfExportStatus = useSelector((state: RootState) => selectPdfExportStatus(state));
    const { isMobile } = useWindowSize();

    useEffect(() => {
        if (projectData) {
            dispatch(setProjectData(projectData));
        }
    }, [projectData, dispatch]);

    // Lancer le téléchargement du PDF au démarrage
    useEffect(() => {
        if (projectData && env && pdfExportStatus === 'idle') {
            const { export_server_url, pdf_header_url, pdf_footer_url } = env;
            if (export_server_url && pdf_header_url && pdf_footer_url) {
                dispatch(fetchPdfExport({
                    exportServerUrl: export_server_url,
                    pdfHeaderUrl: pdf_header_url,
                    pdfFooterUrl: pdf_footer_url,
                    landType: projectData.land_type,
                    landId: projectData.land_id,
                }));
            }
        }
    }, [projectData, env, pdfExportStatus, dispatch]);


    return (
        <>
            {projectData && landData && !isLoading && !error && urls && (
                <>
                    <Header projectData={projectData} />
                    <Router>
                        <TrackingWrapper />
                        <Navbar projectData={projectData} landData={landData} />
                        <Main $isOpen={isOpen} $isMobile={isMobile}>
                            <TopBar />
                            <Content>
                                <Routes>
                                    <Route
                                        path={urls.synthese}
                                        element={
                                            <RouteWrapper
                                                title="Synthèse"
                                                showTitle={false}
                                            >
                                                <Synthese
                                                    projectData={projectData}
                                                    landData={landData}
                                                />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.consommation}
                                        element={
                                            <RouteWrapper
                                                title="Consommation d'espaces NAF (Naturels, Agricoles et Forestiers)"
                                                showPage={has_conso}
                                                showStatus={consommation_correction_status !== ConsoCorrectionStatusEnum.DONNEES_INCHANGEES}
                                                status={
                                                    <ConsoCorrectionStatus status={consommation_correction_status} />
                                                }
                                            >
                                                <Consommation landData={landData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.trajectoires}
                                        element={
                                            <RouteWrapper
                                                title="Trajectoire de sobriété foncière"
                                                showPage={has_conso}
                                                showStatus={consommation_correction_status !== ConsoCorrectionStatusEnum.DONNEES_INCHANGEES}
                                                status={
                                                    <ConsoCorrectionStatus status={consommation_correction_status} />
                                                }
                                            >
                                                <Trajectoires landData={landData} projectData={projectData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.artificialisation}
                                        element={
                                            <RouteWrapper
                                                title="Artificialisation des sols"
                                                showPage={has_ocsge}
                                                showStatus={ocsge_status !== OcsgeStatusEnum.COMPLETE_UNIFORM}
                                                status={
                                                    <OcsgeStatus status={ocsge_status} />
                                                }
                                            >
                                                    <Artificialisation landData={landData} />
                                                </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.impermeabilisation}
                                        element={
                                            <RouteWrapper
                                                title="Imperméabilisation des sols"
                                                showPage={has_ocsge}
                                                showStatus={ocsge_status !== OcsgeStatusEnum.COMPLETE_UNIFORM}
                                                status={
                                                    <OcsgeStatus status={ocsge_status} />
                                                }
                                            >
                                                    <Impermeabilisation
                                                        landData={landData}
                                                    />
                                                </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.logementVacant}
                                        element={
                                            <RouteWrapper
                                                title="Vacance des logements"
                                                showPage={logements_vacants_available}
                                                showStatus={!logements_vacants_available}
                                                status={
                                                    <LogementVacantStatus />
                                                }
                                            >
                                                <LogementVacant landData={landData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.friches}
                                        element={
                                            <RouteWrapper
                                                title="Friches"
                                                showPage={has_friche}
                                                showStatus={!has_friche}
                                                status={
                                                    <FricheStatus />
                                                }
                                            >
                                                    <Friches landData={landData} />
                                                </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.rapportLocal}
                                        element={
                                            <RouteWrapper
                                                title="Rapport triennal local"
                                                showPage={has_conso}
                                                showStatus={consommation_correction_status !== ConsoCorrectionStatusEnum.DONNEES_INCHANGEES}
                                                status={
                                                    <ConsoCorrectionStatus status={consommation_correction_status} />
                                                }
                                            >
                                                <RapportLocal endpoint={urls.rapportLocal} projectData={projectData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.update}
                                        element={
                                            <RouteWrapper
                                                title="Paramètres du diagnostic"
                                            >
                                                <Update endpoint={urls.update} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.downloads}
                                        element={
                                            <RouteWrapper
                                                title="Téléchargements"
                                            >
                                                <Downloads />
                                            </RouteWrapper>
                                        }
                                    />
                                </Routes>
                            </Content>
                            <Footer projectData={projectData} />
                        </Main>
                    </Router>
                </>
            )}
        </>
    );
};

const TrackingWrapper: React.FC = () => {
    useMatomoTracking();
    return null; // Ce composant ne rend rien
};

export default Dashboard;
