export interface BivariateConfig {
  consoT1: number | null;
  consoT2: number | null;
  indicT1: number | null;
  indicT2: number | null;
  consoMin: number | null;
  consoMax: number | null;
  indicMin: number | null;
  indicMax: number | null;
  consoLabel: string;
  indicName: string;
  indicUnit: string;
  indicGender: "m" | "f";
  verdicts: string[][];
  colorGrid: string[][] | null;
}

export interface MapNavEntry {
  land_id: string;
  land_type: string;
  name: string;
  child_land_type: string;
}

export interface MapDrilldown {
  navStack: MapNavEntry[];
  push: (entry: MapNavEntry) => void;
  navigateTo: (index: number) => void;
}

export interface BivariateMapProps {
  chartId: string;
  landId: string;
  landType: string;
  landName?: string;
  childLandType: string;
  startYear?: number;
  endYear?: number;
  drilldown?: MapDrilldown;
  showMailleIndicator?: boolean;
}

export interface BivariateLegendProps {
  colorGrid: string[][];
  consoLabel: string;
  consoRanges: string[] | null;
  indicName: string;
  indicUnit: string;
  indicRanges: string[] | null;
  indicQualif: string[];
  adjectives: { faible: string; moyen: string; fort: string };
  childLandTypeLabel: string;
  highlightedCell?: { row: number; col: number } | null;
}
