import React from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import TerritoryInfoPage from '@components/exports/TerritoryInfoPage';
import DefinitionSection from '@components/exports/sections/DefinitionSection';
import TrajectoireSection from '@components/exports/sections/TrajectoireSection';
import ConsoDetailSection from '@components/exports/sections/ConsoDetailSection';
import ComparisonSection from '@components/exports/sections/ComparisonSection';
import ArtifDefinitionSection from '@components/exports/sections/ArtifDefinitionSection';
import ArtifDetailSection from '@components/exports/sections/ArtifDetailSection';
import RepartitionSection from '@components/exports/sections/RepartitionSection';
import EditableZone from './EditableZone';

const ReportContainer = styled.div`
    width: 100%;
    background: white;
    min-height: 100%;
`;

const CoverPage = styled.div`
    min-height: 257mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40mm 20mm;
    text-align: center;
    border-bottom: 3px solid #000091;
`;

const CoverTitle = styled.h1`
    font-size: 2.5rem;
    font-weight: 700;
    color: #000091;
    margin: 0 0 1rem 0;
`;

const CoverSubtitle = styled.p`
    font-size: 1.2rem;
    color: #666;
    margin: 0 0 3rem 0;
`;

const TerritoryName = styled.h2`
    font-size: 2rem;
    font-weight: 600;
    color: #333;
    margin: 0;
    padding: 2rem;
    background: #f0f0ff;
    border-radius: 12px;
    border: 2px solid #000091;
`;

const GenerationDate = styled.p`
    margin-top: 3rem;
    font-size: 0.9rem;
    color: #999;
`;

const MainContent = styled.div`
    padding: 20mm;
`;

interface EditableContent {
    intro?: string;
    conso_comment?: string;
    comparison_comment?: string;
    artif_comment?: string;
    conclusion?: string;
}

interface EditableRapportCompletProps {
    landData: LandDetailResultType;
    content: EditableContent;
    onContentChange: (key: string, value: string) => void;
}

const EditableRapportComplet: React.FC<EditableRapportCompletProps> = ({
    landData,
    content,
    onContentChange,
}) => {
    const consoStartYear = 2011;
    const consoEndYear = 2023;

    const currentDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <ReportContainer>
            <CoverPage>
                <CoverTitle>Rapport Complet</CoverTitle>
                <CoverSubtitle>Diagnostic territorial de sobriété foncière</CoverSubtitle>
                <TerritoryName>{landData.name}</TerritoryName>
                <GenerationDate>Document généré le {currentDate}</GenerationDate>
            </CoverPage>

            <MainContent>
                <TerritoryInfoPage 
                    landData={landData} 
                    consoStartYear={consoStartYear} 
                    consoEndYear={consoEndYear} 
                />

                <EditableZone
                    label="Introduction générale"
                    content={content.intro || ''}
                    onChange={(value) => onContentChange('intro', value)}
                    placeholder="Présentez ici le contexte de votre territoire et les enjeux de ce diagnostic de sobriété foncière..."
                />

                <DefinitionSection />

                <TrajectoireSection landData={landData} />

                <ConsoDetailSection 
                    landData={landData} 
                    startYear={consoStartYear} 
                    endYear={consoEndYear} 
                />

                <EditableZone
                    label="Commentaire sur la consommation d'espaces"
                    content={content.conso_comment || ''}
                    onChange={(value) => onContentChange('conso_comment', value)}
                    placeholder="Analysez et commentez les données de consommation d'espaces NAF présentées ci-dessus. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
                />

                <ComparisonSection 
                    landData={landData} 
                    startYear={consoStartYear} 
                    endYear={consoEndYear} 
                />

                <EditableZone
                    label="Commentaire sur les comparaisons territoriales"
                    content={content.comparison_comment || ''}
                    onChange={(value) => onContentChange('comparison_comment', value)}
                    placeholder="Analysez la position de votre territoire par rapport aux territoires voisins ou similaires. Comment se situe-t-il ?"
                />

                {landData.has_ocsge && (
                    <>
                        <ArtifDefinitionSection />

                        <ArtifDetailSection landData={landData} />

                        <RepartitionSection landData={landData} />

                        <EditableZone
                            label="Commentaire sur l'artificialisation"
                            content={content.artif_comment || ''}
                            onChange={(value) => onContentChange('artif_comment', value)}
                            placeholder="Commentez les données d'artificialisation présentées. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                        />
                    </>
                )}

                <EditableZone
                    label="Conclusion et perspectives"
                    content={content.conclusion || ''}
                    onChange={(value) => onContentChange('conclusion', value)}
                    placeholder="Synthétisez les enseignements du diagnostic et décrivez les orientations et mesures envisagées pour atteindre les objectifs de sobriété foncière de votre territoire."
                />
            </MainContent>
        </ReportContainer>
    );
};

export default EditableRapportComplet;
