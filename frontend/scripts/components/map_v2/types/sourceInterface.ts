export type SourceInterface = {
    getId?(): string;
    setMillesime?(newIndex: number, newDepartement: string): Promise<void>;
    getAvailableMillesimes?(): Array<{ value: string; label: string }>;
};
