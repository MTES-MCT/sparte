import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import LogoMDA from "@images/logo-mon-diagnostic-artificialisation.svg";

interface CoverPageProps {
  landData: LandDetailResultType;
  reportTitle: string;
  reportSubtitle?: string;
}

const CoverPageContainer = styled.div`
  min-height: 217mm;
  max-height: 217mm;
  display: flex;
  align-items: center;
  justify-content: center;
  page-break-after: always;
  padding: 20mm;
  box-sizing: border-box;
  border: none;
  outline: none;

  @media print {
    page-break-after: always;
  }
`;

const CoverContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`;

const CoverHeader = styled.div`
  text-align: center;
`;

const CoverLogo = styled.div`
  margin-bottom: 3rem;

  .logo-image {
    max-width: 400px;
    height: auto;
  }
`;

const CoverTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000091;
  margin: 2rem 0 1rem 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
`;

const CoverSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin: 0;
  font-weight: 400;
`;

const CoverTerritory = styled.div`
  text-align: center;
  padding: 3rem 2.5rem;
  border-radius: 20px;
  margin: 3rem 0;
  position: relative;
  overflow: hidden;
`;

const TerritoryBadge = styled.div`
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: #f0f0f0;
  border-radius: 50px;
  color: #000091;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  border: 2px solid #000091;
`;

const TerritoryName = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000091;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.02em;
  position: relative;
`;

const TerritoryMeta = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  color: #333;
  font-size: 0.95rem;
  position: relative;

  .meta-item {
    font-weight: 500;
  }

  .meta-separator {
    color: #999;
    margin: 0 0.25rem;
  }
`;

const CoverFooter = styled.div`
  text-align: center;
  padding: 2rem 0 0 0;
`;

const FooterLine = styled.div`
  height: 3px;
  background: linear-gradient(to right, transparent, #000091, transparent);
  margin-bottom: 1.5rem;
`;

const GenerationDate = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 0.5rem 0;
`;

const CoverPage: React.FC<CoverPageProps> = ({ landData, reportTitle, reportSubtitle }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <CoverPageContainer>
      <CoverContent>
        <CoverHeader>
          <CoverLogo>
            <LogoMDA className="logo-image" />
          </CoverLogo>
          <CoverTitle>{reportTitle}</CoverTitle>
          {reportSubtitle && <CoverSubtitle>{reportSubtitle}</CoverSubtitle>}
        </CoverHeader>

        <CoverTerritory>
          <TerritoryBadge>{landData.land_type}</TerritoryBadge>
          <TerritoryName>{landData.name}</TerritoryName>
          <TerritoryMeta>
            {landData.land_id && (
              <span className="meta-item">Code: {landData.land_id}</span>
            )}
            {landData.surface && (
              <>
                <span className="meta-separator">•</span>
                <span className="meta-item">{Math.round(landData.surface).toLocaleString('fr-FR')} ha</span>
              </>
            )}
          </TerritoryMeta>
        </CoverTerritory>

        <CoverFooter>
          <FooterLine />
          <GenerationDate>Document généré le {currentDate}</GenerationDate>
        </CoverFooter>
      </CoverContent>
    </CoverPageContainer>
  );
};

export default CoverPage;
