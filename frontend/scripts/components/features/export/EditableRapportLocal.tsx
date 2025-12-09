import React from 'react';
import styled from 'styled-components';
import { LandDetailResultType } from '@services/types/land';
import GenericChart from '@components/charts/GenericChart';
import {
    SectionContainer,
    SectionTitle,
    SubTitle,
    ChartContainer,
    DataTableContainer,
    HighlightBox,
    InfoBox,
} from '@components/exports/ExportStyles';
import Paragraph from '@components/exports/Paragraph';
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

const LegalReference = styled.div`
    background: #f8f8f8;
    border-left: 4px solid #000091;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
    font-size: 0.85rem;

    a {
        color: #000091;
    }
`;

interface EditableContent {
    intro?: string;
    bilan_comment?: string;
    objectifs_comment?: string;
    perspectives?: string;
}

interface EditableRapportLocalProps {
    landData: LandDetailResultType;
    content: EditableContent;
    onContentChange: (key: string, value: string) => void;
}

const EditableRapportLocal: React.FC<EditableRapportLocalProps> = ({
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

    const millesimes = landData.millesimes || [];
    const maxIndex = millesimes.length > 0 ? Math.max(...millesimes.map(m => m.index)) : 0;

    return (
        <ReportContainer>
            <CoverPage>
                <CoverTitle>Rapport Triennal Local</CoverTitle>
                <CoverSubtitle>Suivi de l'artificialisation des sols</CoverSubtitle>
                <TerritoryName>{landData.name}</TerritoryName>
                <GenerationDate>Document généré le {currentDate}</GenerationDate>
            </CoverPage>

            <MainContent>
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

                <EditableZone
                    label="Introduction"
                    content={content.intro || ''}
                    onChange={(value) => onContentChange('intro', value)}
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
                                start_date: String(consoStartYear),
                                end_date: String(consoEndYear),
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
                                start_date: String(consoStartYear),
                                end_date: String(consoEndYear),
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
                                start_date: String(consoStartYear),
                                end_date: String(consoEndYear),
                            }}
                            sources={["majic"]}
                            showToolbar={false}
                            hideDetails
                        />
                    </ChartContainer>
                </SectionContainer>

                <EditableZone
                    label="Commentaire sur le bilan de consommation"
                    content={content.bilan_comment || ''}
                    onChange={(value) => onContentChange('bilan_comment', value)}
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

                <EditableZone
                    label="Évaluation du respect des objectifs"
                    content={content.objectifs_comment || ''}
                    onChange={(value) => onContentChange('objectifs_comment', value)}
                    placeholder="Évaluez le respect des objectifs de réduction fixés dans les documents d'urbanisme et de planification. Où en êtes-vous par rapport à la trajectoire ?"
                />

                <EditableZone
                    label="Perspectives et mesures envisagées"
                    content={content.perspectives || ''}
                    onChange={(value) => onContentChange('perspectives', value)}
                    placeholder="Décrivez les orientations et mesures envisagées pour atteindre les objectifs de sobriété foncière. Quelles actions sont prévues ? Quels leviers allez-vous mobiliser ?"
                />
            </MainContent>
        </ReportContainer>
    );
};

export default EditableRapportLocal;
