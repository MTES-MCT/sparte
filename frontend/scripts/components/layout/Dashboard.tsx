import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@store/store';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useGetLandQuery, useGetProjectQuery, useGetEnvironmentQuery } from '@services/api';
import { setProjectData } from '@store/projectSlice';
import { selectIsNavbarOpen } from '@store/navbarSlice';
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

const ContentWrapper = styled.div`
    display: flex;
    flex: 1;
    position: relative;
    min-height: calc(100vh - 80px);
`;

const Main = styled.main`
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f8f9ff;
    min-width: 0;
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
    const { isMobile } = useWindowSize();

    useEffect(() => {
        if (projectData) {
            dispatch(setProjectData(projectData));
        }
    }, [projectData, dispatch]);


    return (
        <>
            {projectData && landData && !isLoading && !error && urls && (
                <>
                    <Header projectData={projectData} />
                    <Router>
                        <TrackingWrapper />
                        <ContentWrapper>
                            <Navbar projectData={projectData} landData={landData} />
                            <Main>
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
                                                <Consommation landData={landData} projectData={projectData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.trajectoires}
                                        element={
                                            <RouteWrapper
                                                title="Trajectoire de sobriété foncière"
                                                showPage={has_conso}
                                                showStatus={![
                                                    ConsoCorrectionStatusEnum.DONNEES_INCHANGEES,
                                                    ConsoCorrectionStatusEnum.DONNEES_PARTIELLEMENT_CORRIGEES
                                                ].includes(consommation_correction_status)}
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
                                                <RapportLocal projectData={projectData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.downloads}
                                        element={
                                            <RouteWrapper
                                                title="Générer un rapport"
                                            >
                                                <Downloads landData={landData} projectData={projectData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={`${urls.downloads}/:draftId`}
                                        element={
                                            <RouteWrapper
                                                title="Générer un rapport"
                                            >
                                                <Downloads landData={landData} projectData={projectData} />
                                            </RouteWrapper>
                                        }
                                    />
                                </Routes>
                                </Content>
                                <Footer projectData={projectData} />
                            </Main>
                        </ContentWrapper>
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
