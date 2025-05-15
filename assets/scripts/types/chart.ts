export interface ChartData {
    headers: string[];
    rows: Array<{
        name: string;
        data: any[];
    }>;
}

export interface ChartDataTableProps {
    data: ChartData;
} 