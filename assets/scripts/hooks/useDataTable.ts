import { useState, useMemo } from 'react';

interface UseDataTableOptions<T> {
    data: T[];
    searchFields: (keyof T)[];
    itemsPerPage?: number;
}

interface UseDataTableReturn<T> {
    // Données filtrées et triées
    filteredData: T[];
    // Données paginées pour l'affichage
    paginatedData: T[];
    // État de la recherche
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    // État du tri
    sortField: keyof T;
    sortDirection: 'asc' | 'desc';
    setSort: (field: keyof T) => void;
    // État de la pagination
    currentPage: number;
    totalPages: number;
    setPage: (page: number) => void;
    // Informations d'affichage
    displayInfo: {
        start: number;
        end: number;
        total: number;
    };
}

export function useDataTable<T>({ 
    data, 
    searchFields, 
    itemsPerPage = 10 
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof T>(Object.keys(data[0] || {})[0] as keyof T);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Filtrage des données
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        
        return data.filter(item => 
            searchFields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                }
                if (typeof value === 'number') {
                    return value.toString().includes(searchTerm);
                }
                return false;
            })
        );
    }, [data, searchTerm, searchFields]);

    // Tri des données
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];
            
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortDirection === 'asc' 
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            return 0;
        });
    }, [filteredData, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Gestion du tri
    const setSort = (field: keyof T) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1); // Reset à la première page
    };

    // Gestion de la recherche
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset à la première page
    };

    // Gestion de la pagination
    const setPage = (page: number) => {
        setCurrentPage(page);
    };

    // Informations d'affichage
    const displayInfo = {
        start: ((currentPage - 1) * itemsPerPage) + 1,
        end: Math.min(currentPage * itemsPerPage, sortedData.length),
        total: sortedData.length
    };

    return {
        filteredData: sortedData,
        paginatedData,
        searchTerm,
        setSearchTerm: handleSearch,
        sortField,
        sortDirection,
        setSort,
        currentPage,
        totalPages,
        setPage,
        displayInfo
    };
} 