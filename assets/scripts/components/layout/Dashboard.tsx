import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from '@components/ui/Navbar';
import Synthese from '@components/pages/Synthese';
import Consommation from '@components/pages/Consommation';
import Impermeabilisation from '@components/pages/Impermeabilisation';
import Artificialisation from '@components/pages/Artificialisation';
import Gpu from '@components/pages/Gpu';
import Ocsge from '@components/pages/Ocsge';
import Trajectoires from '@components/pages/Trajectoires';
import RapportLocal from '@components/pages/RapportLocal';

const App: React.FC = () => {
    return (
        <Router>
            <div className="dashboard-wrapper">
                <div className="dashboard-sidebar">
                    <Navbar />
                </div>
                <div className="dashboard-content">
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
                </div>
            </div>
        </Router>
    );
};

export default App;