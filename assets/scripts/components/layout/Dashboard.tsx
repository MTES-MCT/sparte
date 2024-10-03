import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useGetProjectQuery } from '@services/api';
import { setProjectData } from '@store/projectSlice';
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
import Ocsge from '@components/pages/Ocsge';
import Trajectoires from '@components/pages/Trajectoires';
import RapportLocal from '@components/pages/RapportLocal';
import Update from '@components/pages/Update';
import RouteWrapper from '@components/widgets/RouteWrapper';

interface DashboardProps {
    projectId: string;
}

const Main = styled.main`
    margin-left: 280px;
    margin-top: 80px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #f8f9ff;
`;

const Content = styled.div`
    flex-grow: 1;
    display: flex;
`;


const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
    const dispatch = useDispatch();
    const { data, error, isLoading } = useGetProjectQuery(projectId);
    const urls = useUrls();

    useEffect(() => {
    if (data) {        
        dispatch(setProjectData(data));
    }
    }, [data, dispatch]);

    return (
        <>
            {data && !isLoading && !error && urls && (
                <>
                    <Header />
                    <Router>
                        <TrackingWrapper />
                        <Navbar />
                        <Main>
                            <TopBar />
                            <Content>
                                <Routes>
                                    <Route
                                        path={urls.synthese}
                                        element={
                                            <RouteWrapper
                                                title="Synthèse"
                                                component={<Synthese endpoint={urls.synthese} />}
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.consommation}
                                        element={
                                            <RouteWrapper
                                                title="Consommation d'espaces NAF"
                                                component={<Consommation endpoint={urls.consommation} />}
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.trajectoires}
                                        element={
                                            <RouteWrapper
                                                title="Trajectoire ZAN"
                                                component={<Trajectoires endpoint={urls.trajectoires} />}
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.ocsge}
                                        element={
                                            <RouteWrapper
                                                title="Usage et couverture du sol (OCS GE)"
                                                component={<Ocsge endpoint={urls.ocsge} ocsgeStatus={data.ocsge_coverage_status} />} 
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.artificialisation}
                                        element={
                                            <RouteWrapper 
                                                title="Artificialisation" 
                                                component={<Artificialisation endpoint={urls.artificialisation} ocsgeStatus={data.ocsge_coverage_status} />} 
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.impermeabilisation}
                                        element={
                                            <RouteWrapper 
                                                title="Imperméabilisation"
                                                component={<Impermeabilisation endpoint={urls.impermeabilisation} ocsgeStatus={data.ocsge_coverage_status} /> } 
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.gpu}
                                        element={
                                            <RouteWrapper 
                                                title="Artificialisation des zonages d'urbanisme"
                                                component={<Gpu endpoint={urls.gpu} ocsgeStatus={data.ocsge_coverage_status} hasGpu={data.has_zonage_urbanisme} /> } 
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.rapportLocal}
                                        element={
                                            <RouteWrapper
                                                title="Rapport triennal local"
                                                component={<RapportLocal endpoint={urls.rapportLocal} />}
                                            />
                                        }
                                    />
                                    <Route
                                        path={urls.update}
                                        element={
                                            <RouteWrapper
                                                title="Paramètres du diagnostic"
                                                component={<Update endpoint={urls.rapportLocal} />}
                                            />
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
