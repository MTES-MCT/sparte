import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useGetProjectQuery } from '../../services/api';
import { setProjectData } from '../../store/projectSlice';
import styled from 'styled-components';
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

interface DashboardProps {
    projectId: string;
}

const Content = styled.main`
    margin-left: 280px;
    margin-top: 80px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    background: #f4f7fe;
`;

const Dashboard: React.FC<DashboardProps> = ({ projectId }) => {
    const dispatch = useDispatch();
    const { data, error, isLoading } = useGetProjectQuery(projectId);

    useEffect(() => {
    if (data) {        
        dispatch(setProjectData(data));
    }
    }, [data, dispatch]);
    
    return (
        <>
            {data && !isLoading && !error && (
                <>
                    <Header />
                    <Router>
                        <Navbar />
                        <Content>
                            <TopBar />
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
                                <Route
                                    path="/project/:projectId/edit"
                                    element={<Update />}
                                />
                            </Routes>
                            <Footer />
                        </Content>
                    </Router>
                </>
            )}
        </>
    );
};

export default Dashboard;