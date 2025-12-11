import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { getLandTypeLabel } from "@utils/landUtils";
import LogoMDA from "@images/logo-mon-diagnostic-artificialisation.svg";
import { FullPageContainer } from "../styles";

interface CoverPageProps {
    landData: LandDetailResultType;
    reportTitle: string;
    reportSubtitle?: string;
}

const CoverPageContainer = styled(FullPageContainer)``;

const CoverContent = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
`;

const CoverHeader = styled.div`
    text-align: center;
    margin-bottom: 3rem;
`;

const LogosContainer = styled.div`
    display: flex;
    justify-content: space-between;
`;

const RepubliqueLogo = styled.img`
    height: 70px;
    width: auto;
`;

const MDALogo = styled(LogoMDA)`
    height: 55px;
    width: auto;
`;

const CoverTitle = styled.h1`
    font-size: 2.5rem !important;
    font-weight: 700;
    color: #000091;
    margin: 5rem 0 1rem 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
`;

const CoverSubtitle = styled.p`
    font-size: 1rem;
    color: #666;
    font-weight: 400;
    margin-bottom: 3rem;
`;

const CoverTerritory = styled.div`
    padding: 2rem 2.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const TerritoryName = styled.h2`
    font-size: 2.5rem;
    font-weight: 700;
    color: #000091;
    margin: 1rem 0;
    line-height: 1.2;
    letter-spacing: -0.02em;
`;

const TerritoryMeta = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
`;

const CoverFooter = styled.div`
    text-align: center;
    padding: 2rem 0 0 0;
    flex-shrink: 0;
`;

const FooterLine = styled.div`
    height: 2px;
    background-color: #EBEBEC;
    margin-bottom: 1.5rem;
`;

const GenerationDate = styled.p`
    font-size: 0.875rem;
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
                    <LogosContainer>
                        <RepubliqueLogo src="/static/img/republique-francaise-logo.svg" alt="République Française" />
                        <MDALogo />
                    </LogosContainer>
                </CoverHeader>

                <CoverTerritory>
                    <CoverTitle>{reportTitle}</CoverTitle>
                    <CoverSubtitle>{reportSubtitle}</CoverSubtitle>
                    <TerritoryName>
                        {landData.name}{landData.land_type !== "REGION" && ` (${landData.land_id})`}
                    </TerritoryName>
                    <TerritoryMeta>
                        <span className="fr-tag fr-tag--blue fr-tag--sm">{getLandTypeLabel(landData.land_type)}</span>
                        <span className="fr-tag fr-tag--blue fr-tag--sm">{Math.round(landData.surface).toLocaleString('fr-FR')} ha</span>
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
