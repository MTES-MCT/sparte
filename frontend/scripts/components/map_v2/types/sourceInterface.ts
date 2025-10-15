export type SourceInterface = {
    getId?(): string;
    setMillesime?(newIndex: number): Promise<void>;
    getAvailableMillesimes?(): Array<{ value: number; label: string }>;
};
