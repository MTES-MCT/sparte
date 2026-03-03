import React, { createContext, useContext, useState, useMemo } from "react";
import { LandDetailResultType, Millesime, MillesimeByIndex } from "@services/types/land";
import { useImpermeabilisation } from "@hooks/useImpermeabilisation";
import { useImpermeabilisationZonage } from "@hooks/useImpermeabilisationZonage";
import { useGetLandImperFluxIndexQuery } from "@services/api";
import { LandImperStockIndex, defautLandImperStockIndex } from "@services/types/landimperstockindex";
import { LandImperFluxIndex } from "@services/types/landimperfluxindex";
import { ImperZonageData } from "@components/features/ocsge/ImpermeabilisationZonage";

interface ImpermeabilisationContextValue {
  landData: LandDetailResultType;
  land_id: string;
  land_type: string;
  name: string;
  millesimes: Millesime[];
  millesimesByIndex: MillesimeByIndex[];
  childLandTypes: string[];
  isInterdepartemental: boolean;
  hasZonage: boolean;

  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  defaultStockIndex: number;
  childLandType: string | undefined;
  setChildLandType: (value: string | undefined) => void;

  landImperStockIndex: LandImperStockIndex;
  landImperFluxIndex: LandImperFluxIndex | null;
  imperZonageIndex: ImperZonageData[];

  byDepartementFlux: boolean;
  setByDepartementFlux: (value: boolean) => void;
  byDepartementNetFlux: boolean;
  setByDepartementNetFlux: (value: boolean) => void;
  byDepartementRepartition: boolean;
  setByDepartementRepartition: (value: boolean) => void;
}

const ImpermeabilisationContext = createContext<ImpermeabilisationContextValue | null>(null);

export const useImpermeabilisationContext = () => {
  const ctx = useContext(ImpermeabilisationContext);
  if (!ctx) {
    throw new Error("useImpermeabilisationContext doit être utilisé dans un ImpermeabilisationProvider");
  }
  return ctx;
};

interface ImpermeabilisationProviderProps {
  landData: LandDetailResultType;
  children: React.ReactNode;
}

export const ImpermeabilisationProvider: React.FC<ImpermeabilisationProviderProps> = ({
  landData,
  children,
}) => {
  const {
    land_id,
    land_type,
    millesimes_by_index,
    millesimes,
    child_land_types,
    name,
    is_interdepartemental,
    has_zonage,
  } = landData || {};

  const {
    selectedIndex,
    setSelectedIndex,
    defaultStockIndex,
    childLandType,
    setChildLandType,
    landImperStockIndex,
  } = useImpermeabilisation({ landData });

  const { imperZonageIndex } = useImpermeabilisationZonage({
    landData,
    defaultStockIndex,
  });

  const { data: landImperFluxIndexData } = useGetLandImperFluxIndexQuery(
    {
      land_type,
      land_id,
      millesime_old_index: defaultStockIndex - 1,
      millesime_new_index: defaultStockIndex,
    },
    { skip: !landData || defaultStockIndex < 1 }
  );

  const [byDepartementFlux, setByDepartementFlux] = useState(false);
  const [byDepartementNetFlux, setByDepartementNetFlux] = useState(false);
  const [byDepartementRepartition, setByDepartementRepartition] = useState(false);

  const value = useMemo<ImpermeabilisationContextValue>(
    () => ({
      landData,
      land_id: land_id ?? "",
      land_type: land_type ?? "",
      name: name ?? "",
      millesimes: millesimes ?? [],
      millesimesByIndex: millesimes_by_index ?? [],
      childLandTypes: child_land_types ?? [],
      isInterdepartemental: is_interdepartemental ?? false,
      hasZonage: has_zonage ?? false,

      selectedIndex,
      setSelectedIndex,
      defaultStockIndex,
      childLandType,
      setChildLandType,

      landImperStockIndex: landImperStockIndex ?? defautLandImperStockIndex,
      landImperFluxIndex: landImperFluxIndexData?.[0] ?? null,
      imperZonageIndex: imperZonageIndex ?? [],

      byDepartementFlux,
      setByDepartementFlux,
      byDepartementNetFlux,
      setByDepartementNetFlux,
      byDepartementRepartition,
      setByDepartementRepartition,
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
      defaultStockIndex,
      childLandType,
      setChildLandType,
      landImperStockIndex,
      landImperFluxIndexData,
      imperZonageIndex,
      byDepartementFlux,
      byDepartementNetFlux,
      byDepartementRepartition,
    ]
  );

  return (
    <ImpermeabilisationContext.Provider value={value}>
      {children}
    </ImpermeabilisationContext.Provider>
  );
};
