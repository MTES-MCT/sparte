import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useGetLandQuery, useGetProjectQuery } from '@services/api';
import { setProjectData } from '@store/projectSlice';
import { selectIsNavbarOpen } from '@store/navbarSlice';
import useWindowSize from '@hooks/useWindowSize';
import useMatomoTracking from '@hooks/useMatomoTracking';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import Navbar from '@components/layout/Navbar';
import TopBar from '@components/layout/TopBar';
import Synthese from '@components/pages/Synthese';
import Consommation from '@components/pages/Consommation';
import LogementVacant from '@components/pages/LogementVacant';
import Trajectoires from '@components/pages/Trajectoires';
import RapportLocal from '@components/pages/RapportLocal';
import { Artificialisation } from '@components/pages/Artificialisation';
import Update from '@components/pages/Update';
import RouteWrapper from '@components/widgets/RouteWrapper';

interface DashboardProps {
    projectId: string;
}

const Main = styled.main<{ $isOpen: boolean; $isMobile: boolean }>`
    margin-left: ${({ $isOpen, $isMobile }) => ($isMobile ? '0' : $isOpen ? '280px' : '0')};
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
    const dispatch = useDispatch();
    const { data: projectData, error, isLoading } = useGetProjectQuery(projectId);
    const { data: landData } = useGetLandQuery({
        land_type: projectData?.land_type,
        land_id: projectData?.land_id }
    );
    const { urls } = projectData || {};

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
                        <Navbar projectData={projectData} />
                        <Main $isOpen={isOpen} $isMobile={isMobile}>
                            <TopBar />
                            <Content>
                                <Routes>
                                    <Route
                                        path={urls.synthese}
                                        element={
                                            <RouteWrapper
                                                title="Synthèse"
                                                consoCorrectionStatus={projectData.consommation_correction_status}
                                            >
                                                <Synthese endpoint={urls.synthese} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.consommation}
                                        element={
                                            <RouteWrapper
                                                title="Consommation d'espaces NAF (Naturels, Agricoles et Forestiers)"
                                                consoCorrectionStatus={projectData.consommation_correction_status}
                                            >
                                                <Consommation endpoint={urls.consommation} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.trajectoires}
                                        element={
                                            <RouteWrapper
                                                title="Trajectoire de sobriété foncière"
                                                consoCorrectionStatus={projectData.consommation_correction_status}
                                            >
                                                <Trajectoires endpoint={urls.trajectoires} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.artificialisation}
                                        element={
                                            <RouteWrapper
                                                title="Artificialisation des sols">
                                                    <Artificialisation
                                                        projectData={projectData}
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
                                                hasLogementVacant={projectData.logements_vacants_available}
                                            >
                                                <LogementVacant endpoint={urls.logementVacant} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.rapportLocal}
                                        element={
                                            <RouteWrapper
                                                title="Rapport triennal local"
                                                consoCorrectionStatus={projectData.consommation_correction_status}
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
