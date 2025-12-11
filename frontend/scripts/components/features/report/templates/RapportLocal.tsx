import React from 'react';
import { LandDetailResultType } from '@services/types/land';
import GenericChart from '@components/charts/GenericChart';
import {
    ContentZone,
    ContentZoneMode,
} from '../editor';
import {
    Paragraph,
    ReportContainer,
    PrintLayout,
    PrintContent,
    MainContent,
    SectionContainer,
    SectionTitle,
    SubTitle,
    ChartContainer,
    DataTableContainer,
    HighlightBox,
    InfoBox,
    LegalReference,
} from '../styles';
import CoverPage from './CoverPage';

export interface RapportLocalContent {
    intro?: string;
    bilan_comment?: string;
    objectifs_comment?: string;
    perspectives?: string;
}

interface RapportLocalProps {
    landData: LandDetailResultType;
    content: RapportLocalContent;
    mode: ContentZoneMode;
    onContentChange?: (key: string, value: string) => void;
}

const CONSO_START_YEAR = 2011;
const CONSO_END_YEAR = 2023;

const RapportLocal: React.FC<RapportLocalProps> = ({
    landData,
    content,
    mode,
    onContentChange,
}) => {
    const handleChange = (key: keyof RapportLocalContent) => (value: string) => {
        onContentChange?.(key, value);
    };

    const reportContent = (
        <>
            <SectionContainer>
                <SectionTitle>Objet du rapport triennal local de suivi de l'artificialisation des sols</SectionTitle>

                <HighlightBox>
                    <p>
                        Sur la décennie 2011-2021, 24 000 ha d'espaces naturels, agricoles et forestiers
                        ont été consommés chaque année en moyenne en France, soit près de 5 terrains de
                        football par heure. Les conséquences sont écologiques mais aussi socio-économiques.
                    </p>
                </HighlightBox>

                <Paragraph>
                    La France s'est donc fixé, dans le cadre de la loi n° 2021-1104 du 22 août 2021
                    dite « Climat et résilience » complétée par la loi n° 2023-630 du 20 juillet 2023,
                    l'objectif d'atteindre le « zéro artificialisation nette des sols » en 2050, avec
                    un objectif intermédiaire de réduction de moitié de la consommation d'espaces NAF
                    sur 2021-2031 par rapport à la décennie précédente.
                </Paragraph>

                <LegalReference>
                    <strong>Base légale :</strong> Article R. 2231-1 du code général des collectivités territoriales
                </LegalReference>
            </SectionContainer>

            <ContentZone
                content={content.intro || ''}
                mode={mode}
                onChange={handleChange('intro')}
                placeholder="Présentez le contexte de ce rapport triennal local pour votre territoire. Quels sont les enjeux spécifiques ? Quelle est la situation actuelle ?"
            />

            <SectionContainer>
                <SectionTitle>1° Consommation des espaces naturels, agricoles et forestiers</SectionTitle>

                <InfoBox>
                    <h4>Indicateur obligatoire</h4>
                    <p>
                        La consommation des espaces naturels, agricoles et forestiers, exprimée en
                        nombre d'hectares, le cas échéant en la différenciant entre ces types d'espaces,
                        et en pourcentage au regard de la superficie du territoire couvert.
                    </p>
                </InfoBox>

                <SubTitle>Évolution annuelle de la consommation</SubTitle>
                <Paragraph>
                    Le graphique ci-dessous présente l'évolution annuelle de la consommation d'espaces
                    NAF sur votre territoire depuis 2011.
                </Paragraph>

                <ChartContainer>
                    <GenericChart
                        id="annual_total_conso_chart_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        showToolbar={false}
                        hideDetails
                    />
                </ChartContainer>

                <DataTableContainer>
                    <GenericChart
                        id="annual_total_conso_chart_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        dataTableOnly
                        compactDataTable
                    />
                </DataTableContainer>

                <SubTitle>Répartition par destination</SubTitle>
                <ChartContainer>
                    <GenericChart
                        id="pie_determinant_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{
                            start_date: String(CONSO_START_YEAR),
                            end_date: String(CONSO_END_YEAR),
                        }}
                        sources={["majic"]}
                        showToolbar={false}
                        hideDetails
                    />
                </ChartContainer>
            </SectionContainer>

            <ContentZone
                content={content.bilan_comment || ''}
                mode={mode}
                onChange={handleChange('bilan_comment')}
                placeholder="Commentez le bilan de consommation d'espaces NAF sur la période analysée. Quelles sont les tendances observées ? Quels sont les principaux déterminants ?"
            />

            {landData.has_ocsge && (
                <SectionContainer>
                    <SectionTitle>2° Solde entre surfaces artificialisées et désartificialisées</SectionTitle>

                    <InfoBox>
                        <h4>Indicateur non obligatoire avant 2031</h4>
                        <p>
                            Le solde entre les surfaces artificialisées et les surfaces désartificialisées,
                            telles que définies dans la nomenclature annexée à l'article R. 101-1 du code de l'urbanisme.
                        </p>
                    </InfoBox>

                    <ChartContainer>
                        <GenericChart
                            id="artif_synthese_export"
                            land_id={landData.land_id}
                            land_type={landData.land_type}
                            sources={["ocsge"]}
                            showToolbar={false}
                            hideDetails
                        />
                    </ChartContainer>
                </SectionContainer>
            )}

            <SectionContainer>
                <SectionTitle>Trajectoire et objectifs de réduction</SectionTitle>

                <Paragraph>
                    La loi fixe un objectif intermédiaire de réduction de moitié de la consommation
                    d'espaces NAF sur 2021-2031 par rapport à la décennie précédente. Le graphique
                    ci-dessous projette votre trajectoire au regard de cet objectif.
                </Paragraph>

                <ChartContainer>
                    <GenericChart
                        id="objective_chart_export"
                        land_id={landData.land_id}
                        land_type={landData.land_type}
                        params={{ target_2031_custom: 50 }}
                        sources={["majic"]}
                        showToolbar={false}
                        hideDetails
                    />
                </ChartContainer>
            </SectionContainer>

            <ContentZone
                content={content.objectifs_comment || ''}
                mode={mode}
                onChange={handleChange('objectifs_comment')}
                placeholder="Évaluez le respect des objectifs de réduction fixés dans les documents d'urbanisme et de planification. Où en êtes-vous par rapport à la trajectoire ?"
            />

            <ContentZone
                content={content.perspectives || ''}
                mode={mode}
                onChange={handleChange('perspectives')}
                placeholder="Décrivez les orientations et mesures envisagées pour atteindre les objectifs de sobriété foncière. Quelles actions sont prévues ? Quels leviers allez-vous mobiliser ?"
            />
        </>
    );

    if (mode === 'print') {
        return (
            <PrintLayout>
                <PrintContent>
                    <CoverPage
                        landData={landData}
                        reportTitle="Rapport Triennal Local"
                        reportSubtitle="Suivi de l'artificialisation des sols"
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
                reportTitle="Rapport Triennal Local"
                reportSubtitle="Suivi de l'artificialisation des sols"
            />
            <MainContent>
                {reportContent}
            </MainContent>
        </ReportContainer>
    );
};

export default RapportLocal;
