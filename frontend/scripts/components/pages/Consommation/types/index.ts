/**
 * Types for Consommation page components
 */

import { Territory } from "@components/ui/SearchBar";

export interface SimilarTerritory {
  land_id: string;
  land_name: string;
  land_type: string;
  nearest_land_id: string;
  nearest_land_name: string;
  distance_km: number;
  distance_rank: number;
}

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

export type { Territory };
