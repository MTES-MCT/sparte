import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { FetchArgs, BaseQueryFn, FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type Logo = {
  src: string;
  alt: string;
  height: string;
  url?: string;
};

export type SubMenuItem = {
  label: string;
  url?: string;
  new?: boolean;
};

export type MenuItem = {
  label: string;
  url?: string;
  icon?: string;
  target?: string;
  subMenu?: SubMenuItem[];
  shouldDisplay?: boolean;
  new?: boolean;
  soon?: boolean;
};

export type ComparisonLand = {
  land_type: string;
  land_id: string;
  name: string;
};

export type ProjectDetailResultType = {
  id: number;
  land_id: string;
  land_type: string;
  target_2031: number | null;
  comparison_lands: ComparisonLand[];
  urls: {
    synthese: string;
    artificialisation: string;
    friches: string;
    impermeabilisation: string;
    rapportLocal: string;
    trajectoires: string;
    consommation: string;
    logementVacant: string;
    dowloadConsoReport: string;
    downloadFullReport: string;
    dowloadLocalReport: string;
    downloads: string;
  };
  navbar: {
    menuItems: MenuItem[];
  };
  footer: {
    menuItems: MenuItem[];
  };
  header: {
    logos: Logo[];
    search: Record<string, never>;
    menuItems: MenuItem[];
  };
};

export type UserLandPreferenceResultType = {
  is_favorited: boolean;
  target_2031: number | null;
  comparison_lands: ComparisonLand[];
};

type ProjectDetailQueryArg = string | FetchArgs
type ProjectDetailBaseQuery = BaseQueryFn<ProjectDetailQueryArg, unknown, FetchBaseQueryError>;
export type UseGetProjectQueryType = TypedUseQuery<ProjectDetailResultType, ProjectDetailQueryArg, ProjectDetailBaseQuery>;
