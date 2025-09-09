import React from 'react';
import { Pagination as DSFRPagination } from '@codegouvfr/react-dsfr/Pagination';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange
}) => {
    if (totalPages <= 1) return null;

    return (
        <DSFRPagination
            showFirstLast
            count={totalPages}
            defaultPage={currentPage}
            getPageLinkProps={(pageNumber: number) => ({
                onClick: (event: React.MouseEvent) => {
                    event.preventDefault();
                    onPageChange(pageNumber);
                },
                href: '#',
                'aria-label': `Page ${pageNumber}`
            })}
            className="fr-mb-0"
        />
    );
}; 