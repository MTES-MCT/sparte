import React from 'react';

import { formatNumber } from "@utils/formatUtils";

interface ChartDataTableProps {
    data: [string[], string[][]];
}

const ChartDataTable: React.FC<ChartDataTableProps> = ({ data }) => {
    if (!data || !data[0] || !data[1]) return null;

    const headers = data[0];
    const rows = data[1];

    return (
        <div className="fr-table--sm fr-table fr-table--bordered fr-mb-0">
            <div className="fr-table__wrapper">
                <div className="fr-table__container">
                    <div className="fr-table__content">
                        <table>
                            <thead>
                                <tr>
                                    {headers.map((header, index) => (
                                        <th key={index} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex) => (
                                    <tr key={rowIndex} data-row-key={rowIndex}>
                                        {row.map((cell, cellIndex) => (
                                            <td key={cellIndex} className={!isNaN(Number(cell)) ? 'fr-cell--right' : ''}>
                                                {!isNaN(Number(cell)) ? formatNumber({
                                                    number: Number(cell),
                                                }) : cell}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartDataTable; 