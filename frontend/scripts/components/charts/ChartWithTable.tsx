import React from "react";
import styled from "styled-components";
import GenericChart from "./GenericChart";

interface ChartWithTableProps {
    chartId: string;
    landId: string;
    landType: string;
    params?: Record<string, unknown>;
    sources: string[];
    isMap?: boolean;
    showTable?: boolean;
}

const ChartContainer = styled.div`
    margin: 1.5rem 0;

    @media print {
        page-break-inside: avoid;
    }
`;

const DataTableContainer = styled.div`
    margin: 1rem 0;
`;

/**
 * Composant combinant un graphique et son tableau de données associé.
 * Évite la duplication de code dans les rapports.
 */
const ChartWithTable: React.FC<ChartWithTableProps> = ({
    chartId,
    landId,
    landType,
    params = {},
    sources,
    isMap = false,
    showTable = true,
}) => {
    return (
        <>
            <ChartContainer>
                <GenericChart
                    id={chartId}
                    land_id={landId}
                    land_type={landType}
                    params={params}
                    sources={sources}
                    showToolbar={false}
                    hideDetails
                    isMap={isMap}
                />
            </ChartContainer>
            {showTable && (
                <DataTableContainer>
                    <GenericChart
                        id={chartId}
                        land_id={landId}
                        land_type={landType}
                        params={params}
                        sources={sources}
                        dataTableOnly
                        compactDataTable
                    />
                </DataTableContainer>
            )}
        </>
    );
};

export default ChartWithTable;
