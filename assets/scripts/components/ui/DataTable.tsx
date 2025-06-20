import React from 'react';
import styled from 'styled-components';
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";

interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    sortField?: keyof T;
    sortDirection?: 'asc' | 'desc';
    onSort?: (field: keyof T) => void;
    caption?: string;
    className?: string;
    keyField?: keyof T;
    tooltipFields?: (keyof T)[];
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

export function DataTable<T>({
    data,
    columns,
    sortField,
    sortDirection,
    onSort,
    caption,
    className = "",
    keyField,
    tooltipFields
}: DataTableProps<T>) {
    const renderTableStructure = (children: React.ReactNode) => (
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
                                {children}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

    if (data.length === 0) {
        return renderTableStructure(
            <tr>
                <td colSpan={columns.length}>
                    <NoDataMessage>
                        Il n'y a aucun résultat pour votre recherche.
                    </NoDataMessage>
                </td>
            </tr>
        );
    }

    return renderTableStructure(
        data.map((item) => (
            <tr key={String(item[keyField])}>
                {columns.map((column) => (
                    <TableCell 
                        key={String(column.key)}
                        className={column.key === 'actions' ? 'fr-cell--fixed' : undefined}
                    >
                        {tooltipFields?.includes(column.key) ? (
                            <>
                                <Tooltip
                                    kind="hover"
                                    title={String(item[column.key])}
                                />
                                <span className="fr-ml-1w">
                                    {column.render 
                                        ? column.render(item[column.key], item)
                                        : String(item[column.key])
                                    }
                                </span>
                            </>
                        ) : (
                            column.render 
                                ? column.render(item[column.key], item)
                                : String(item[column.key])
                        )}
                    </TableCell>
                ))}
            </tr>
        ))
    );
}