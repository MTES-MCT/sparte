import React from "react";
import styled from "styled-components";
import { useGetLandQuery } from '@services/api';
import CoverPage from './CoverPage';

interface ExportLayoutProps {
  children: (landData: any) => React.ReactNode;
  landType: string;
  landId: string;
  reportTitle: string;
  reportSubtitle?: string;
}

const LayoutContainer = styled.div`
  min-height: 100vh;
  background-color: #f6f6f6;
`;

const ExportContent = styled.main`
  max-width: 210mm;
  margin: 2rem auto;
  background: white;
  min-height: 297mm;
  position: relative;

  @media screen {
    border: 2px dashed #0078f3;
  }

  @media print {
    border: none !important;

    @page {
      size: A4;
    }
  }

  @media screen and (max-width: 768px) {
    max-width: 100%;
    margin: 0;
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  padding: 20mm;
`;

const ExportLayout: React.FC<ExportLayoutProps> = ({
  children,
  landType,
  landId,
  reportTitle,
  reportSubtitle,
}) => {
  const { data: landData, isLoading, error } = useGetLandQuery({
    land_type: landType,
    land_id: landId,
  });

  if (isLoading) {
    return (
      <div className="fr-container fr-p-3w">
        <h1>Chargement des données...</h1>
        <p>Type: {landType}, ID: {landId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fr-container fr-p-3w">
        <h1 className="fr-error-text">Erreur lors du chargement des données</h1>
        <p>Type: {landType}, ID: {landId}</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!landData) {
    return (
      <div className="fr-container fr-p-3w">
        <p>Pas de données disponibles</p>
      </div>
    );
  }

  return (
    <LayoutContainer>
      <ExportContent>
        <CoverPage
          landData={landData}
          reportTitle={reportTitle}
          reportSubtitle={reportSubtitle}
        />
        <MainContent>
          {children(landData)}
        </MainContent>
      </ExportContent>
    </LayoutContainer>
  );
};

export default ExportLayout;
