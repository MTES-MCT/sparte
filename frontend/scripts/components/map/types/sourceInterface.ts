export type SourceInterface = {
    getId?(): string;
    setMillesime?(newIndex: number, newDepartement: string): Promise<void>;
    getAvailableMillesimes?(): Array<{ value: string; label: string }>;
    setMillesimes?(startIndex: number, endIndex: number, departement?: string): Promise<void>;
    getAvailableMillesimePairs?(): Array<{ startIndex: number; endIndex: number; startYear?: number; endYear?: number; departement?: string; departementName?: string }>;
};
