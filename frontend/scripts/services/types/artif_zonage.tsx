import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query/react";
import { ZonageType } from "scripts/types/ZonageType";

export type ArtifZonageIndexrResultType = {
    land_id: string;
    land_type: string;
    departements: string[];
    years: number[];
    zonage_surface: number;
    artificial_surface: number;
    zonage_type: keyof typeof ZonageType;
    zonage_count: number;
    artificial_percent: number;
    millesime_index: number;
};

type ArtifZonageIndexrQueryArg = string | FetchArgs | {
    land_type: string;
    land_id: string;
    millesime_index: number;
}

type ArtifZonageIndexrBaseQuery = BaseQueryFn<ArtifZonageIndexrQueryArg, unknown, FetchBaseQueryError>;
  
export type ArtifZonageIndexType = TypedUseQuery<
    ArtifZonageIndexrResultType[],
    ArtifZonageIndexrQueryArg,
    ArtifZonageIndexrBaseQuery
>;
  