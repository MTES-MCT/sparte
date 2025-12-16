import { ComparisonLand } from "./project";

export type ReportType = "rapport-complet" | "rapport-local";

export interface ReportTypeOption {
    value: ReportType;
    label: string;
}

export interface ReportDraft {
    id: string;
    project: number;
    report_type: ReportType;
    report_type_display: string;
    name: string;
    content: Record<string, string>;
    land_type: string;
    land_id: string;
    comparison_lands: ComparisonLand[];
    created_at: string;
    updated_at: string;
}

export interface ReportDraftListItem {
    id: string;
    project: number;
    report_type: ReportType;
    report_type_display: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface CreateReportDraftPayload {
    project: number;
    report_type: ReportType;
    name: string;
    content: Record<string, string>;
    land_type?: string;
    land_id?: string;
    comparison_lands?: ComparisonLand[];
}

export interface UpdateReportDraftPayload {
    id: string;
    name?: string;
    content?: Record<string, string>;
    comparison_lands?: ComparisonLand[];
}

