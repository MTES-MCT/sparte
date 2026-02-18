import React, { useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import { useGetLandQuery, useGetCurrentUserQuery, useGetUserLandPreferenceQuery } from '@services/api';
import { setTerritoryName } from '@store/projectSlice';
import { AppDispatch } from '@store/store';
import { buildUrls, buildNavbar, buildFooter, buildHeader } from '@utils/projectUrls';
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
import { LogementVacantStatusEnum } from '@services/types/land';
import FricheStatus from '@components/features/status/FricheStatus';

interface DashboardProps {
    landType: string;
    landId: string;
    landSlug: string;
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


const Dashboard: React.FC<DashboardProps> = ({ landType, landId, landSlug }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { data: landData, error, isLoading } = useGetLandQuery({ land_type: landType, land_id: landId });
    const { data: currentUser } = useGetCurrentUserQuery();
    const { data: preference } = useGetUserLandPreferenceQuery(
        { land_type: landData?.land_type ?? landType, land_id: landData?.land_id ?? landId },
        { skip: !landData },
    );

    useEffect(() => {
        if (landData?.name) {
            dispatch(setTerritoryName(landData.name));
        }
    }, [landData?.name, dispatch]);

    const urls = useMemo(() => buildUrls(landType, landSlug), [landType, landSlug]);
    const navbar = useMemo(() => buildNavbar(landType, landSlug), [landType, landSlug]);
    const footer = useMemo(() => buildFooter(), []);
    const header = useMemo(() => buildHeader(currentUser?.is_authenticated ?? false), [currentUser?.is_authenticated]);

    const { ocsge_status, has_ocsge, has_friche, has_conso, consommation_correction_status, has_logements_vacants_prive, has_logements_vacants_social, logements_vacants_status } = landData || {};

    return (
        <>
            {landData && !isLoading && !error && (
                <>
                    <Header header={header} />
                    <Router>
                        <TrackingWrapper />
                        <ContentWrapper>
                            <Navbar navbar={navbar} urls={urls} landData={landData} />
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
                                                <Consommation landData={landData} preference={preference} />
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
                                                <Trajectoires landData={landData} preference={preference} />
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
                                                showPage={has_logements_vacants_prive || has_logements_vacants_social}
                                                showStatus={!has_logements_vacants_prive || !has_logements_vacants_social || logements_vacants_status?.includes('secretise') || logements_vacants_status?.includes('indisponibles')}
                                                status={
                                                    <LogementVacantStatus status={logements_vacants_status} />
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
                                                <RapportLocal landData={landData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={urls.downloads}
                                        element={
                                            <RouteWrapper
                                                title="Générer un rapport"
                                            >
                                                <Downloads landData={landData} />
                                            </RouteWrapper>
                                        }
                                    />
                                    <Route
                                        path={`${urls.downloads}/:draftId`}
                                        element={
                                            <RouteWrapper
                                                title="Générer un rapport"
                                            >
                                                <Downloads landData={landData} />
                                            </RouteWrapper>
                                        }
                                    />
                                </Routes>
                                </Content>
                                <Footer footer={footer} />
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
