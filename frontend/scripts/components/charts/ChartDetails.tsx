import React, { useState } from 'react';
import styled from 'styled-components';
import ChartDataSource from './ChartDataSource';
import ChartDataTable from './ChartDataTable';

const Container = styled.div`
    margin-top: 1rem;
    border: 1px solid #EEF2F7;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
`;

const DataContainer = styled.div<{ $isVisible: boolean }>`
    max-height: ${props => props.$isVisible ? 'auto' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
    padding: ${props => props.$isVisible ? '1rem' : '0'};
    visibility: ${props => props.$isVisible ? 'visible' : 'hidden'};
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

type ChartDetailsProps = {
    sources: string[];
    showDataTable?: boolean;
    children?: React.ReactNode;
    chartId: string;
    dataTable?: {
        headers: string[];
        rows: any[];
    };
    chartTitle?: string;
}

const ChartDetails: React.FC<ChartDetailsProps> = ({
    sources,
    showDataTable = false,
    children,
    chartId,
    dataTable,
    chartTitle
}) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!(sources.length > 0 || showDataTable)) {
        return null;
    }

    return (
        <Container>
            <Header>
                {sources.length > 0 && (
                    <ChartDataSource 
                        sources={sources}
                        displayMode="tag"
                    />
                )}
                {(sources.length > 0 || showDataTable) && (
                    <button
                        className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-right fr-icon-arrow-down-s-fill"
                        onClick={() => setIsVisible(!isVisible)}
                        title={isVisible ? "Masquer les données" : "Afficher les données"}
                        aria-expanded={isVisible}
                        aria-controls={`${chartId}-details`}
                    >
                        Détails données et calcul
                    </button>
                )}
            </Header>
            {(sources.length > 0 || showDataTable) && (
                <DataContainer 
                    $isVisible={isVisible}
                    id={`${chartId}-details`}
                    role="region"
                    aria-label="Détails des données et calculs"
                    aria-hidden={!isVisible}
                >
                    {sources.length > 0 && (
                        <ChartDataSource 
                            sources={sources}
                            displayMode="text"
                        />
                    )}
                    {children}
                    {showDataTable && dataTable && (
                        <ChartDataTable data={dataTable} title={chartTitle} />
                    )}
                </DataContainer>
            )}
        </Container>
    );
};

export default ChartDetails; 