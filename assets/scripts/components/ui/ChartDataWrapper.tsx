import React, { useState } from 'react';
import styled from 'styled-components';
import ChartDataSource from '@components/charts/ChartDataSource';
import ChartDataTable from '@components/charts/ChartDataTable';

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

const DataContainer = styled.div<{ isVisible: boolean }>`
    max-height: ${props => props.isVisible ? 'auto' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
    padding: ${props => props.isVisible ? '1rem' : '0'};
`;

interface DataWrapperProps {
    sources?: string[];
    data?: any;
    chartId: string;
}

const DataWrapper: React.FC<DataWrapperProps> = ({ sources = [], data, chartId }) => {
    const [isVisible, setIsVisible] = useState(false);

    if (!sources.length && !data) return null;

    return (
        <Container>
            <Header>
                {sources.length > 0 && (
                    <ChartDataSource 
                        sources={sources} 
                        chartId={chartId} 
                    />
                )}
                {data && (
                    <button
                        className="fr-btn fr-btn--tertiary fr-btn--sm fr-btn--icon-right fr-icon-arrow-down-s-fill"
                        onClick={() => setIsVisible(!isVisible)}
                        title={isVisible ? "Masquer les données" : "Afficher les données"}
                    >Voir les données</button>
                )}
            </Header>
            {data && (
                <DataContainer isVisible={isVisible}>
                    <ChartDataTable data={data} />
                </DataContainer>
            )}
        </Container>
    );
};

export default DataWrapper;
