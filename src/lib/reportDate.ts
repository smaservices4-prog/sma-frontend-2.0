const MONTH_NAMES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
] as const;

export interface MonthOption {
    value: string;
    label: string;
}

export interface YearOption {
    value: string;
    label: string;
}

export interface ReportMonthParts {
    year: string;
    month: string;
}

export const getCurrentReportMonthValue = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
};

export const getMonthOptions = (): MonthOption[] =>
    MONTH_NAMES.map((name, index) => ({
        value: `${index + 1}`.padStart(2, '0'),
        label: name
    }));

export const getYearOptions = (startYear: number, endYear: number): YearOption[] => {
    const years: YearOption[] = [];
    for (let year = startYear; year <= endYear; year += 1) {
        const value = `${year}`;
        years.push({ value, label: value });
    }
    return years;
};

export const parseReportMonth = (reportMonth: string): ReportMonthParts => {
    const fallback = getCurrentReportMonthValue();
    const [fallbackYear, fallbackMonth] = fallback.split('-');
    const [year = fallbackYear, month = fallbackMonth] = reportMonth.split('-');
    return {
        year: year || fallbackYear,
        month: month || fallbackMonth
    };
};

export const buildReportMonth = (year: string, month: string): string => {
    if (!year || !month) return '';
    return `${year}-${month.padStart(2, '0')}`;
};
