import React from 'react';
import { formatNumber } from "@utils/formatUtils";
interface ChartData {
    headers: string[];
    rows: Array<{
        name: string;
        data: any[];
    }>;
}

interface ChartDataTableProps {
    data: ChartData;
    title: string;
} 

const ChartDataTable: React.FC<ChartDataTableProps> = ({ data, title }) => {
    if (!data?.headers || !data?.rows) return null;

    const { headers, rows } = data;
    return (
        <div className="fr-table--sm fr-table fr-table--bordered fr-table--no-caption fr-mb-0 fr-mt-0">
            <div className="fr-table__wrapper">
                <div className="fr-table__container">
                    <div className="fr-table__content">
                        <table>
                            <caption>{title}</caption>
                            <thead>
                                <tr>
                                    {headers.map((header: string) => (
                                        <th key={header} scope="col">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, rowIndex: number) => (
                                    <tr key={`${row.name}-${rowIndex}`} data-row-key={rowIndex}>
                                        {row.data.map((cell: any, cellIndex: number) => {
                                            const isNumeric = typeof cell === 'number' || !isNaN(Number(cell));
                                            return (
                                                <td key={`${row.name}-${rowIndex}-${cellIndex}`} className={isNumeric ? 'fr-cell--right' : ''}>
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