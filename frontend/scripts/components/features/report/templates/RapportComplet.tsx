import React from 'react';
import { LandDetailResultType } from '@services/types/land';
import {
    ContentZone,
    ContentZoneMode,
} from '../editor';
import {
    ReportContainer,
    PrintLayout,
    PrintContent,
    MainContent,
} from '../styles';
import {
    DefinitionSection,
    TrajectoireSection,
    ConsoDetailSection,
    ComparisonSection,
    ArtifDefinitionSection,
    ArtifDetailSection,
    RepartitionSection,
} from '../sections';
import CoverPage from './CoverPage';
import TerritoryInfoPage from './TerritoryInfoPage';

export interface RapportCompletContent {
    intro?: string;
    conso_comment?: string;
    comparison_comment?: string;
    artif_comment?: string;
    conclusion?: string;
}

interface RapportCompletProps {
    landData: LandDetailResultType;
    content: RapportCompletContent;
    mode: ContentZoneMode;
    onContentChange?: (key: string, value: string) => void;
}

const CONSO_START_YEAR = 2011;
const CONSO_END_YEAR = 2023;

const RapportComplet: React.FC<RapportCompletProps> = ({
    landData,
    content,
    mode,
    onContentChange,
}) => {
    const handleChange = (key: keyof RapportCompletContent) => (value: string) => {
        onContentChange?.(key, value);
    };

    const reportContent = (
        <>
            <TerritoryInfoPage
                landData={landData}
                consoStartYear={CONSO_START_YEAR}
                consoEndYear={CONSO_END_YEAR}
            />

            <ContentZone
                label="Introduction générale"
                content={content.intro || ''}
                mode={mode}
                onChange={handleChange('intro')}
                placeholder="Présentez ici le contexte de votre territoire et les enjeux de ce diagnostic de sobriété foncière..."
            />

            <DefinitionSection />

            <TrajectoireSection landData={landData} />

            <ConsoDetailSection
                landData={landData}
                startYear={CONSO_START_YEAR}
                endYear={CONSO_END_YEAR}
            />

            <ContentZone
                label="Commentaire sur la consommation d'espaces"
                content={content.conso_comment || ''}
                mode={mode}
                onChange={handleChange('conso_comment')}
                placeholder="Analysez et commentez les données de consommation d'espaces NAF présentées ci-dessus. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            <ComparisonSection
                landData={landData}
                startYear={CONSO_START_YEAR}
                endYear={CONSO_END_YEAR}
            />

            <ContentZone
                label="Commentaire sur les comparaisons territoriales"
                content={content.comparison_comment || ''}
                mode={mode}
                onChange={handleChange('comparison_comment')}
                placeholder="Analysez la position de votre territoire par rapport aux territoires voisins ou similaires. Comment se situe-t-il ?"
            />

            {landData.has_ocsge && (
                <>
                    <ArtifDefinitionSection />

                    <ArtifDetailSection landData={landData} />

                    <RepartitionSection landData={landData} />

                    <ContentZone
                        label="Commentaire sur l'artificialisation"
                        content={content.artif_comment || ''}
                        mode={mode}
                        onChange={handleChange('artif_comment')}
                        placeholder="Commentez les données d'artificialisation présentées. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                    />
                </>
            )}

            <ContentZone
                label="Conclusion et perspectives"
                content={content.conclusion || ''}
                mode={mode}
                onChange={handleChange('conclusion')}
                placeholder="Synthétisez les enseignements du diagnostic et décrivez les orientations et mesures envisagées pour atteindre les objectifs de sobriété foncière de votre territoire."
            />
        </>
    );

    if (mode === 'print') {
        return (
            <PrintLayout>
                <PrintContent>
                    <CoverPage
                        landData={landData}
                        reportTitle="Rapport Complet"
                        reportSubtitle="Diagnostic territorial de sobriété foncière"
                    />
                    <MainContent>
                        {reportContent}
                    </MainContent>
                </PrintContent>
            </PrintLayout>
        );
    }

    return (
        <ReportContainer>
            <CoverPage
                landData={landData}
                reportTitle="Rapport Complet"
                reportSubtitle="Diagnostic territorial de sobriété foncière"
            />
            <MainContent>
                {reportContent}
            </MainContent>
        </ReportContainer>
    );
};

export default RapportComplet;
