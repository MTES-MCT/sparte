import { Couverture, Usage } from "./constants/cs_and_us";

export type OcsgeTileFeatureProperties = {
  code_cs: Couverture;
  code_us: Usage;
  surface: number;
  is_artificial: boolean;
  is_impermeable: boolean;
  critere_seuil: boolean;
  index: number;
  year: number;
};
