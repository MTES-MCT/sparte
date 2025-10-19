import { useGetLandConsoStatsQuery, useGetLandPopStatsQuery } from "@services/api";

/**
 * Hook to fetch consumption and population statistics
 */
export const useConsoData = (
  landId: string,
  landType: string,
  startYear: number,
  endYear: number
) => {
  const {
    data: consoStats,
    isLoading: isLoadingConso,
    isFetching: isFetchingConso,
  } = useGetLandConsoStatsQuery({
    land_id: landId,
    land_type: landType,
    from_year: startYear,
    to_year: endYear,
  });

  const {
    data: popStats,
    isLoading: isLoadingPop,
    isFetching: isFetchingPop,
  } = useGetLandPopStatsQuery({
    land_id: landId,
    land_type: landType,
    from_year: startYear,
    to_year: endYear,
  });

  // Convert m² to ha (divide by 10000)
  const totalConsoHa = consoStats?.[0]?.total ? consoStats[0].total / 10000 : null;

  // Get population evolution
  const populationEvolution = popStats?.[0]?.evolution || null;
  const populationEvolutionPercent = popStats?.[0]?.evolution_percent || null;

  return {
    totalConsoHa,
    populationEvolution,
    populationEvolutionPercent,
    isLoadingConso: isLoadingConso || isFetchingConso,
    isLoadingPop: isLoadingPop || isFetchingPop,
  };
};
