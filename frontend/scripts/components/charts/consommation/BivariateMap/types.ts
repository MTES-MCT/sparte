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

export interface BivariateMapProps {
  chartId: string;
  landId: string;
  landType: string;
  landName?: string;
  childLandType: string;
  childLandTypes?: string[];
  onChildLandTypeChange?: (type: string) => void;
}

export interface BivariateLegendProps {
  colorGrid: string[][];
  consoLabel: string;
  consoRanges: string[] | null;
  indicName: string;
  indicUnit: string;
  indicRanges: string[] | null;
  indicQualif: string[];
  verdicts: string[][];
  adjectives: { faible: string; moyen: string; fort: string };
}
