import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './Navbar';
import HtmlLoader from './HtmlLoader';

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
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/synthesis" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/consommation"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/consommation" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/trajectoires"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/trajectoires" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/découvrir-l-ocsge"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/découvrir-l-ocsge" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/artificialisation"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/artificialisation" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/impermeabilisation"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/impermeabilisation" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/zonages-d-urbanisme"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/zonages-d-urbanisme" />}
                        />
                        <Route
                            path="/project/:projectId/tableau-de-bord/rapport-local"
                            element={<HtmlLoader endpoint="/project/:projectId/tableau-de-bord/rapport-local" />}
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;