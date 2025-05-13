import React from 'react';


interface ChartDataTableProps {
    data: any;
}

const ChartDataTable: React.FC<ChartDataTableProps> = ({ data }) => {
    if (!data) return null;

    return (
        <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
};

export default ChartDataTable; 