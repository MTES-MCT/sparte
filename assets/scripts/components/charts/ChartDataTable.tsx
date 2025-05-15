import React from 'react';
import { formatNumber } from "@utils/formatUtils";
import { ChartDataTableProps } from 'scripts/types/chart';

const ChartDataTable: React.FC<ChartDataTableProps> = ({ data }) => {
    if (!data || !data.headers || !data.rows) return null;

    const { headers, rows } = data;
    return (
        <div className="fr-table--sm fr-table fr-table--bordered fr-mb-0">
            <div className="fr-table__wrapper">
                <div className="fr-table__container">
                    <div className="fr-table__content">
                        <table>
                            <thead>
                                <tr>
                                    {headers.map((header: string, index: number) => (
                                        <th key={index} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex: number) => (
                                    <tr key={rowIndex} data-row-key={rowIndex}>
                                        {row.data.map((cell: any, cellIndex: number) => {
                                            const isNumeric = typeof cell === 'number' || !isNaN(Number(cell));
                                            return (
                                                <td key={cellIndex} className={isNumeric ? 'fr-cell--right' : ''}>
                                                    {isNumeric ? formatNumber({
                                                        number: Number(cell),
                                                    }) : cell}
                                                </td>
                                            );
                                        })}
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