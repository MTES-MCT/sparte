import React from 'react';
import styled from 'styled-components';

interface Column<T> {
    readonly key: keyof T;
    readonly label: string;
    readonly sortable?: boolean;
    readonly render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: number | string }> {
    readonly data: ReadonlyArray<T>;
    readonly columns: ReadonlyArray<Column<T>>;
    readonly sortField?: keyof T;
    readonly sortDirection?: 'asc' | 'desc';
    readonly onSort?: (field: keyof T) => void;
    readonly caption?: string;
    readonly className?: string;
    readonly noDataMessage?: string;
}

const SortableHeader = styled.th<{ $isSortable?: boolean; $sortDirection?: 'asc' | 'desc' | null }>`
    cursor: ${props => props.$isSortable ? 'pointer' : 'default'};
    position: relative;
    min-width: ${props => props.$isSortable ? '120px' : '100px'};
    padding-right: ${props => props.$isSortable ? '2.5rem' : '0.75rem'} !important;
    white-space: nowrap;
    
    ${props => props.$isSortable && `
        &:hover {
            background-color: var(--background-contrast-grey-hover);
        }
        
        &::after {
            content: "↕";
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.5;
            font-size: 0.8rem;
            pointer-events: none;
            z-index: 0;
        }
        
        ${props.$sortDirection === 'asc' && `
            &::after {
                content: "↑";
                opacity: 1;
            }
        `}
        
        ${props.$sortDirection === 'desc' && `
            &::after {
                content: "↓";
                opacity: 1;
            }
        `}
    `}
`;

const TableCell = styled.td`
    min-width: 100px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const NoDataMessage = styled.div`
    text-align: center;
    padding: 2rem;
    color: var(--text-mention-grey);
    font-style: italic;
`;

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    sortField,
    sortDirection,
    onSort,
    caption,
    className = "",
    noDataMessage = "Aucune donnée à afficher"
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className={`fr-table fr-table--bordered fr-table--no-caption ${className}`}>
                <div className="fr-table__wrapper">
                    <div className="fr-table__container">
                        <div className="fr-table__content">
                            <table>
                                {caption && <caption>{caption}</caption>}
                                <thead>
                                    <tr>
                                        {columns.map((column) => (
                                            <th key={String(column.key)} scope="col">
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={columns.length}>
                                            <NoDataMessage>
                                                {noDataMessage}
                                            </NoDataMessage>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`fr-table fr-table--bordered fr-table--no-caption ${className}`}>
            <div className="fr-table__wrapper">
                <div className="fr-table__container">
                    <div className="fr-table__content">
                        <table>
                            {caption && <caption>{caption}</caption>}
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        <SortableHeader
                                            key={String(column.key)}
                                            scope="col"
                                            $isSortable={column.sortable}
                                            $sortDirection={sortField === column.key ? sortDirection : null}
                                            onClick={() => column.sortable && onSort?.(column.key)}
                                            className={column.key === 'actions' ? 'fr-cell--fixed' : undefined}
                                            role={column.key === 'actions' ? 'columnheader' : undefined}
                                        >
                                            {column.label}
                                        </SortableHeader>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((item) => (
                                    <tr key={item.id}>
                                        {columns.map((column) => (
                                            <TableCell 
                                                key={String(column.key)}
                                                className={column.key === 'actions' ? 'fr-cell--fixed' : undefined}
                                            >
                                                {column.render 
                                                    ? column.render(item[column.key], item)
                                                    : String(item[column.key] || '')
                                                }
                                            </TableCell>
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
} 