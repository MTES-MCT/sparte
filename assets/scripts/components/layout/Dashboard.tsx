import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useGetProjectQuery } from '@services/api';
import { setProjectData } from '@store/projectSlice';
import { selectIsNavbarOpen, handleResponsiveNavbar } from '@store/navbarSlice';
import useWindowSize from '@hooks/useWindowSize';
import useMatomoTracking from '@hooks/useMatomoTracking';
import useUrls from '@hooks/useUrls';
import Footer from '@components/layout/Footer';
import Header from '@components/layout/Header';
import Navbar from '@components/layout/Navbar';
import TopBar from '@components/layout/TopBar';
import Synthese from '@components/pages/Synthese';
import Consommation from '@components/pages/Consommation';
import Impermeabilisation from '@components/pages/Impermeabilisation';
import Artificialisation from '@components/pages/Artificialisation';
import Gpu from '@components/pages/Gpu';
import LogementVacant from '@components/pages/LogementVacant';
import Ocsge from '@components/pages/Ocsge';
import Trajectoires from '@components/pages/Trajectoires';
import RapportLocal from '@components/pages/RapportLocal';
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
    const { data, error, isLoading } = useGetProjectQuery(projectId);
    const urls = useUrls();

    const isOpen = useSelector((state: RootState) => selectIsNavbarOpen(state));
    const { isMobile } = useWindowSize();

    useEffect(() => {
    if (data) {        
        dispatch(setProjectData(data));        
    }
    }, [data, dispatch]);

    useEffect(() => {
        dispatch(handleResponsiveNavbar({ isMobile }));
    }, [isMobile, dispatch]);

    return (
        <>
            {data && !isLoading && !error && urls && (
                <>
                    <Header />
                    <Router>
                        <TrackingWrapper />
                        <Navbar projectData={data} />
                        <Main $isOpen={isOpen} $isMobile={isMobile}>
                            <TopBar />
                            <Content>
                                <Routes>
                                    <Route
                                        path={urls.synthese}
                                        element={
                                            <RouteWrapper
                                                title="Synthèse"
                                                consoCorrectionStatus={data.consommation_correction_status}
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
                                                consoCorrectionStatus={data.consommation_correction_status}
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
                                                consoCorrectionStatus={data.consommation_correction_status}
                                            >
                                                <Trajectoires endpoint={urls.trajectoires} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.ocsge}
                                        element={
                                            <RouteWrapper
                                                title="Usage et couverture du sol (OCS GE)"
                                                ocsgeStatus={data.ocsge_coverage_status}
                                            >
                                                <Ocsge projectData={data} endpoint={urls.ocsge} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.artificialisation}
                                        element={
                                            <RouteWrapper 
                                                title="Artificialisation"
                                                ocsgeStatus={data.ocsge_coverage_status}
                                            >
                                                <Artificialisation endpoint={urls.artificialisation} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.impermeabilisation}
                                        element={
                                            <RouteWrapper 
                                                title="Imperméabilisation"
                                                ocsgeStatus={data.ocsge_coverage_status}
                                            >
                                                <Impermeabilisation endpoint={urls.impermeabilisation} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.gpu}
                                        element={
                                            <RouteWrapper 
                                                title="Artificialisation des zonages d'urbanisme"
                                                ocsgeStatus={data.ocsge_coverage_status}
                                                hasGpu={data.has_zonage_urbanisme}
                                            >
                                                <Gpu endpoint={urls.gpu} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.logementVacant}
                                        element={
                                            <RouteWrapper 
                                                title="Vacance des logements"
                                                hasLogementVacant={data.logements_vacants_available}
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
                                                consoCorrectionStatus={data.consommation_correction_status}
                                            >
                                                <RapportLocal endpoint={urls.rapportLocal} />
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
                            <Footer />
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
