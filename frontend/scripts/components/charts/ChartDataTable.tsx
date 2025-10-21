import React from 'react';
import { formatNumber } from "@utils/formatUtils";
interface ChartData {
    headers: string[];
    rows: Array<{
        name: string;
        data: any[];
    }>;
    boldFirstColumn?: boolean;
    boldLastColumn?: boolean;
    boldLastRow?: boolean;
}

interface ChartDataTableProps {
    data: ChartData;
    title: string;
}

/**
 * Formats a cell value for display in the data table.
 *
 * @param cell - The cell value to format (can be number, string, or any type)
 * @returns Formatted string for numeric values, original value for non-numeric
 *
 * @example
 * formatCellContent(1234.5) // Returns "1 234,5" (formatted number)
 * formatCellContent("Paris") // Returns "Paris" (unchanged string)
 * formatCellContent(null) // Returns null (unchanged)
 */
export const formatCellContent = (cell: any): any => {
    const isNumeric = typeof cell === 'number' || (typeof cell === 'string' && !Number.isNaN(Number(cell)));
    if (isNumeric) {
        return formatNumber({ number: Number(cell) });
    }
    return cell;
};

const ChartDataTable: React.FC<ChartDataTableProps> = ({ data, title }) => {
    if (!data?.headers || !data?.rows) return null;

    const { headers, rows, boldFirstColumn = false, boldLastColumn = false, boldLastRow = false } = data;

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
                                {rows.map((row, rowIndex: number) => {
                                    const isLastRow = rowIndex === rows.length - 1;
                                    return (
                                        <tr key={`${row.name}-${rowIndex}`} data-row-key={rowIndex}>
                                            {row.data.map((cell: any, cellIndex: number) => {
                                                const isNumeric = typeof cell === 'number' || (typeof cell === 'string' && !Number.isNaN(Number(cell)));
                                                const isFirstColumn = cellIndex === 0;
                                                const isLastColumn = cellIndex === row.data.length - 1;
                                                const shouldBold =
                                                    (boldFirstColumn && isFirstColumn) ||
                                                    (boldLastColumn && isLastColumn) ||
                                                    (boldLastRow && isLastRow);

                                                const cellContent = formatCellContent(cell);

                                                return (
                                                    <td key={`${row.name}-${rowIndex}-${cellIndex}`} className={isNumeric ? 'fr-cell--right' : ''}>
                                                        {shouldBold ? <strong>{cellContent}</strong> : cellContent}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChartDataTable; 