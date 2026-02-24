import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { LandDetailResultType, LandType, Millesime, MillesimeByIndex } from "@services/types/land";
import { useArtificialisation } from "@hooks/useArtificialisation";
import { useArtificialisationZonage } from "@hooks/useArtificialisationZonage";
import { useGetLandArtifFluxIndexQuery } from "@services/api";
import { LandArtifStockIndex, defautLandArtifStockIndex } from "@services/types/landartifstockindex";
import { LandArtifFluxIndex } from "@services/types/landartiffluxindex";
import { ZonageData } from "@components/features/ocsge/ArtificialisationZonage";

interface ArtificialisationContextValue {
  landData: LandDetailResultType;
  landId: string;
  landType: LandType;
  name: string;
  millesimes: Millesime[];
  millesimesByIndex: MillesimeByIndex[];
  childLandTypes: string[];
  isInterdepartemental: boolean;
  hasZonage: boolean;

  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  childLandType: string | undefined;
  setChildLandType: (type: string | undefined) => void;
  defaultStockIndex: number;

  landArtifStockIndex: LandArtifStockIndex;
  landArtifFluxIndex: LandArtifFluxIndex | null;
  artifZonageIndex: ZonageData[];

  byDepartementFlux: boolean;
  setByDepartementFlux: (value: boolean) => void;
  byDepartementNetFlux: boolean;
  setByDepartementNetFlux: (value: boolean) => void;
  byDepartementRepartition: boolean;
  setByDepartementRepartition: (value: boolean) => void;

  isLoading: boolean;
  error: unknown;
}

const ArtificialisationContext = createContext<ArtificialisationContextValue | null>(null);

interface ArtificialisationProviderProps {
  landData: LandDetailResultType;
  children: ReactNode;
}

export const ArtificialisationProvider: React.FC<ArtificialisationProviderProps> = ({
  landData,
  children,
}) => {
  const {
    land_id,
    land_type,
    name,
    millesimes,
    millesimes_by_index,
    child_land_types,
    is_interdepartemental,
    has_zonage,
  } = landData;

  const {
    selectedIndex,
    setSelectedIndex,
    defaultStockIndex,
    childLandType,
    setChildLandType,
    landArtifStockIndex,
    isLoading: isLoadingArtif,
    error: errorArtif,
  } = useArtificialisation({ landData });

  const {
    artifZonageIndex,
    isLoading: isLoadingZonage,
    error: errorZonage,
  } = useArtificialisationZonage({ landData, defaultStockIndex });

  const { data: landArtifFluxIndexList } = useGetLandArtifFluxIndexQuery(
    {
      land_type: land_type,
      land_id: land_id,
      millesime_new_index: defaultStockIndex,
      millesime_old_index: defaultStockIndex - 1,
    },
    { skip: !land_id || defaultStockIndex < 1 }
  );
  const landArtifFluxIndex = landArtifFluxIndexList?.[0] ?? null;

  const [byDepartementFlux, setByDepartementFlux] = useState(false);
  const [byDepartementNetFlux, setByDepartementNetFlux] = useState(false);
  const [byDepartementRepartition, setByDepartementRepartition] = useState(false);

  const value = useMemo<ArtificialisationContextValue>(
    () => ({
      landData,
      landId: land_id,
      landType: land_type,
      name,
      millesimes: millesimes || [],
      millesimesByIndex: millesimes_by_index || [],
      childLandTypes: child_land_types || [],
      isInterdepartemental: is_interdepartemental || false,
      hasZonage: has_zonage || false,

      selectedIndex,
      setSelectedIndex,
      childLandType,
      setChildLandType,
      defaultStockIndex,

      landArtifStockIndex: landArtifStockIndex || defautLandArtifStockIndex,
      landArtifFluxIndex,
      artifZonageIndex: artifZonageIndex || [],

      byDepartementFlux,
      setByDepartementFlux,
      byDepartementNetFlux,
      setByDepartementNetFlux,
      byDepartementRepartition,
      setByDepartementRepartition,

      isLoading: isLoadingArtif || isLoadingZonage,
      error: errorArtif || errorZonage,
    }),
    [
      landData,
      land_id,
      land_type,
      name,
      millesimes,
      millesimes_by_index,
      child_land_types,
      is_interdepartemental,
      has_zonage,
      selectedIndex,
      setSelectedIndex,
      childLandType,
      setChildLandType,
      defaultStockIndex,
      landArtifStockIndex,
      landArtifFluxIndex,
      artifZonageIndex,
      byDepartementFlux,
      byDepartementNetFlux,
      byDepartementRepartition,
      isLoadingArtif,
      isLoadingZonage,
      errorArtif,
      errorZonage,
    ]
  );

  return (
    <ArtificialisationContext.Provider value={value}>
      {children}
    </ArtificialisationContext.Provider>
  );
};

export const useArtificialisationContext = (): ArtificialisationContextValue => {
  const context = useContext(ArtificialisationContext);
  if (!context) {
    throw new Error(
      "useArtificialisationContext must be used within an ArtificialisationProvider"
    );
  }
  return context;
};
