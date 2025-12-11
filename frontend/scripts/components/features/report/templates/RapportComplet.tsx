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
    TerritoryInfoSection,
    DefinitionSection,
    TrajectoireSection,
    ConsoDetailSection,
    ConsoDestinationSection,
    ComparisonSection,
    ComparisonRelativeSection,
    ArtifDefinitionSection,
    ArtifDetailSection,
    ArtifCouvertureSection,
    ArtifUsageSection,
} from '../sections';
import CoverPage from './CoverPage';

export interface RapportCompletContent {
    trajectoire?: string;
    consommation_annuelle?: string;
    consommation_destinations?: string;
    comparison_absolue?: string;
    comparison_relative?: string;
    artificialisation_detail?: string;
    artificialisation_couverture?: string;
    artificialisation_usage?: string;
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
            <DefinitionSection />

            <TrajectoireSection landData={landData} />

            <ContentZone
                content={content.trajectoire || ''}
                mode={mode}
                onChange={handleChange('trajectoire')}
                placeholder="Commentez la trajectoire. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            <ConsoDetailSection
                landData={landData}
                startYear={CONSO_START_YEAR}
                endYear={CONSO_END_YEAR}
            />

            <ContentZone
                content={content.consommation_annuelle || ''}
                mode={mode}
                onChange={handleChange('consommation_annuelle')}
                placeholder="Commentez la consommation annuelle. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            <ConsoDestinationSection
                landData={landData}
                startYear={CONSO_START_YEAR}
                endYear={CONSO_END_YEAR}
            />

            <ContentZone
                content={content.consommation_destinations || ''}
                mode={mode}
                onChange={handleChange('consommation_destinations')}
                placeholder="Commentez la consommation d'espaces par destinations. Quelles sont les tendances ? Quels sont les principaux facteurs ?"
            />

            <ComparisonSection
                landData={landData}
                startYear={CONSO_START_YEAR}
                endYear={CONSO_END_YEAR}
            />

            <ContentZone
                content={content.comparison_absolue || ''}
                mode={mode}
                onChange={handleChange('comparison_absolue')}
                placeholder="Commentez la consommation absolue de votre territoire par rapport aux territoires de comparaison."
            />

            <ComparisonRelativeSection
                landData={landData}
                startYear={CONSO_START_YEAR}
                endYear={CONSO_END_YEAR}
            />

            <ContentZone
                content={content.comparison_relative || ''}
                mode={mode}
                onChange={handleChange('comparison_relative')}
                placeholder="Commentez la consommation relative de votre territoire par rapport aux territoires de comparaison."
            />

            {landData.has_ocsge && (
                <>
                    <ArtifDefinitionSection />

                    <ArtifDetailSection landData={landData} />

                    <ContentZone
                        content={content.artificialisation_detail || ''}
                        mode={mode}
                        onChange={handleChange('artificialisation_detail')}
                        placeholder="Commentez les données d'artificialisation présentées. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                    />

                    <ArtifCouvertureSection landData={landData} />

                    <ContentZone
                        content={content.artificialisation_couverture || ''}
                        mode={mode}
                        onChange={handleChange('artificialisation_couverture')}
                        placeholder="Commentez la répartition des surfaces artificialisées par type de couverture. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                    />

                    <ArtifUsageSection landData={landData} />

                    <ContentZone
                        content={content.artificialisation_usage || ''}
                        mode={mode}
                        onChange={handleChange('artificialisation_usage')}
                        placeholder="Commentez la répartition des surfaces artificialisées par type d'usage. Quels sont les principaux flux ? Quelles évolutions constatez-vous ?"
                    />
                </>
            )}
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
                    <TerritoryInfoSection
                        landData={landData}
                        consoStartYear={CONSO_START_YEAR}
                        consoEndYear={CONSO_END_YEAR}
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
            <TerritoryInfoSection
                landData={landData}
                consoStartYear={CONSO_START_YEAR}
                consoEndYear={CONSO_END_YEAR}
            />
            <MainContent>
                {reportContent}
            </MainContent>
        </ReportContainer>
    );
};

export default RapportComplet;
