/**
 * Types for Consommation page components
 */

import { Territory } from "@components/ui/SearchBar";

export interface SimilarTerritory {
  land_id: string;
  land_name: string;
  land_type: string;
  similar_land_id: string;
  similar_land_name: string;
  population_source: number;
  population_similar: number;
  population_difference: number;
  distance_km: number;
  similarity_rank: number;
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
