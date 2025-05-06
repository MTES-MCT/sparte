import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryFn, FetchArgs } from "@reduxjs/toolkit/query";
import { FetchBaseQueryError } from "@reduxjs/toolkit/dist/query/react";






export type Millesime = {
    index: number;
    year: number;
    departement: string;
    departement_name?: string;
  }
  
  export type MillesimeByIndex = {
    index: number;
    years: string;
    departements: string;
  }
  
  export type LandDetailResultType = {
    land_id: string;
    land_type: string;
    name: string;
    surface: number;
    surface_unit: string;
    surface_artif: number | null;
    percent_artif: number | null;
    years_artif: number[] | null;
    millesimes: Millesime[]
    millesimes_by_index: MillesimeByIndex[]
    child_land_types: string[];
    parent_land_type: string;
    parent_land_ids: string[];
    departements: string[];
    is_interdepartemental: boolean;
  };

  type LandDetailQueryArg = string | FetchArgs | {
    land_id: string;
    land_type: string;
  }
  type LandDetailBaseQuery = BaseQueryFn<LandDetailQueryArg, unknown, FetchBaseQueryError>;
  
  export type UseLandDetailType = TypedUseQuery<
    LandDetailResultType,
    LandDetailQueryArg,
    LandDetailBaseQuery
  >;
  
  