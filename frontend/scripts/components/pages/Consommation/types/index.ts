import { LandDetailResultType } from "@services/types/land";

export interface ConsoStats {
  total: number;
}

export interface PopStats {
  evolution: number;
  evolution_percent: number;
}

export interface ConsommationProps {
  land_id: string;
  land_type: string;
  name: string;
  surface: number;
}

export type { LandDetailResultType };
