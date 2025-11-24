'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Report } from '@/types';
import { reportsApi } from '@/api/reports';
import { useAuth } from './AuthContext';

interface SearchContextType {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    allReports: Report[];
    loading: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [allReports, setAllReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const reports = await reportsApi.getAll();
                setAllReports(reports);
            } catch (error) {
                console.error('Failed to fetch reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user]);

    return (
        <SearchContext.Provider value={{ searchQuery, setSearchQuery, allReports, loading }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider');
    }
    return context;
}
