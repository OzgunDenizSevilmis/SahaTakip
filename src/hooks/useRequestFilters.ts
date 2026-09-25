import {useMemo, useState} from 'react';
import type {RequestListItem} from '../services/requestService';
import type {RequestStatus} from '../types/models';

export function useRequestFilters(requests: RequestListItem[]) {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();
    
    return requests.filter((request) => {
        const matchesSearchText =
        normalizedSearch.length === 0 ||
        request.title.toLowerCase().includes(normalizedSearch) ||
        request.description.toLowerCase().includes(normalizedSearch);

        const matchesStatus =
        statusFilter === null || request.status === statusFilter;

        const matchesCategory =
        categoryFilter === null || request.categoryId === categoryFilter;

        return matchesSearchText && matchesStatus && matchesCategory;
    });
    }, [requests, searchText, statusFilter, categoryFilter]);

    const clearFilters = () => {
        setSearchText('');
        setStatusFilter(null);
        setCategoryFilter(null);
    };

    return {
        searchText,
        setSearchText,
        statusFilter,
        setStatusFilter,
        categoryFilter,
        setCategoryFilter,
        filteredRequests,
        clearFilters,
    };
}