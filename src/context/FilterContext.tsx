'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

type StatusFilter = 'purchased' | 'available' | 'all';

interface FilterContextType {
    year: number | '';
    status: StatusFilter;
    setYear: (year: number | '') => void;
    setStatus: (status: StatusFilter) => void;
    availableYears: number[];
    setAvailableYears: (years: number[]) => void;
    availableStatuses: StatusFilter[];
    setAvailableStatuses: (statuses: StatusFilter[]) => void;
    resetFilters: () => void;
    sheetOpen: boolean;
    setSheetOpen: (open: boolean) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const [year, setYear] = useState<number | ''>('');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [sheetOpen, setSheetOpen] = useState(false);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<StatusFilter[]>(['available', 'purchased']);

    const value = useMemo(
        () => ({
            year,
            status,
            setYear,
            setStatus,
            availableYears,
            setAvailableYears,
            availableStatuses,
            setAvailableStatuses,
            resetFilters: () => {
                setYear('');
                setStatus('all');
            },
            sheetOpen,
            setSheetOpen,
        }),
        [year, status, sheetOpen, availableYears, availableStatuses],
    );

    return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error('useFilters must be used within a FilterProvider');
    }
    return context;
}

