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
    margin: 2rem 0;
    border: 1px solid #EBEBEC;
    padding: 1rem 0;
    background: white;

    @media print {
        page-break-inside: avoid;
        border: 1px solid #EBEBEC;
    }
`;

const DataTableContainer = styled.div`
    margin: 0.5rem 0 0.75rem 0;
`;

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
                        dataTableOnly
                        compactDataTable
                    />
                </DataTableContainer>
            )}
        </>
    );
};

export default ChartWithTable;
