import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useGetProjectQuery } from '../../services/api';
import { setProjectData } from '../../store/projectSlice';
import styled from 'styled-components';
import Navbar from '@components/ui/Navbar';
import Overview from '@components/widgets/Overview';
import Synthese from '@components/pages/Synthese';
import Consommation from '@components/pages/Consommation';
import Impermeabilisation from '@components/pages/Impermeabilisation';
import Artificialisation from '@components/pages/Artificialisation';
import Gpu from '@components/pages/Gpu';
import Ocsge from '@components/pages/Ocsge';
import Trajectoires from '@components/pages/Trajectoires';
import RapportLocal from '@components/pages/RapportLocal';
import Loader from '@components/ui/Loader';

interface DashboardProps {
    projectId: string;
}

const DashboardWrapper = styled.div`
    display: flex;
    height: 100vh;
    background: #f4f7fe;
`;

const ContentWrapper = styled.main`
    margin-left: 280px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

const ContentContainer = styled.section`
    overflow-y: auto;
    height: 100%;
`;

const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
    const dispatch = useDispatch();
    const { data, error, isLoading } = useGetProjectQuery(projectId);
  
    useEffect(() => {
      if (data) {
        dispatch(setProjectData(data));
      }
    }, [data, dispatch]);
  
    if (isLoading) return <Loader />;
    if (error) return <div>Error loading project data.</div>;
    
    return (
        <Router>
            <DashboardWrapper>
                <Navbar />
                <ContentWrapper>
                    <Overview />
                    <ContentContainer>
                        <Routes>
                            <Route
                                path="/project/:projectId/tableau-de-bord/synthesis"
                                element={<Synthese />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/consommation"
                                element={<Consommation />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/trajectoires"
                                element={<Trajectoires />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/découvrir-l-ocsge"
                                element={<Ocsge />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/artificialisation"
                                element={<Artificialisation />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/impermeabilisation"
                                element={<Impermeabilisation />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/zonages-d-urbanisme"
                                element={<Gpu />}
                            />
                            <Route
                                path="/project/:projectId/tableau-de-bord/rapport-local"
                                element={<RapportLocal />}
                            />
                        </Routes>
                    </ContentContainer>
                </ContentWrapper>
            </DashboardWrapper>
        </Router>
    );
};

export default Dashboard;