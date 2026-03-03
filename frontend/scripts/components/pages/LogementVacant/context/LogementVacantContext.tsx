import React, { createContext, useContext, useState, useMemo } from "react";
import { LandDetailResultType, LogementsVacantsStatusDetails, LogementVacantStatusEnum } from "@services/types/land";

const LAND_TYPE_LABELS: Record<string, string> = {
  COMM: "Commune",
  EPCI: "EPCI",
  DEPART: "Département",
  SCOT: "SCoT",
  REGION: "Région",
};

interface LogementVacantContextValue {
  landData: LandDetailResultType;
  landId: string;
  landType: string;
  name: string;
  childLandTypes: string[];
  logementsVacantsStatus: LogementVacantStatusEnum;
  logementsVacantsStatusDetails: LogementsVacantsStatusDetails;

  startYear: number;
  endYear: number;

  childType: string;
  setChildType: (value: string) => void;

  getLandTypeLabel: (type: string) => string;
}

const LogementVacantContext = createContext<LogementVacantContextValue | null>(null);

export const useLogementVacantContext = () => {
  const ctx = useContext(LogementVacantContext);
  if (!ctx) {
    throw new Error("useLogementVacantContext doit être utilisé dans un LogementVacantProvider");
  }
  return ctx;
};

interface LogementVacantProviderProps {
  landData: LandDetailResultType;
  children: React.ReactNode;
}

export const LogementVacantProvider: React.FC<LogementVacantProviderProps> = ({
  landData,
  children,
}) => {
  const {
    land_id,
    land_type,
    name,
    child_land_types,
    logements_vacants_status,
    logements_vacants_status_details,
  } = landData || {};

  const startYear = 2020;
  const endYear = 2024;

  const defaultChildType =
    land_type === "REGION" && child_land_types?.includes("DEPART")
      ? "DEPART"
      : child_land_types?.[0] || "";

  const [childType, setChildType] = useState<string>(defaultChildType);

  const getLandTypeLabel = (type: string) => LAND_TYPE_LABELS[type] || type;

  const value = useMemo<LogementVacantContextValue>(
    () => ({
      landData,
      landId: land_id ?? "",
      landType: land_type ?? "",
      name: name ?? "",
      childLandTypes: child_land_types ?? [],
      logementsVacantsStatus: logements_vacants_status ?? LogementVacantStatusEnum.DONNEES_INDISPONIBLES,
      logementsVacantsStatusDetails: logements_vacants_status_details ?? {
        logements_vacants_parc_prive: null,
        logements_vacants_parc_social: null,
        logements_vacants_parc_prive_percent: null,
        logements_vacants_parc_social_percent: null,
      },

      startYear,
      endYear,

      childType,
      setChildType,

      getLandTypeLabel,
    }),
    [
      landData,
      land_id,
      land_type,
      name,
      child_land_types,
      logements_vacants_status,
      logements_vacants_status_details,
      childType,
    ]
  );

  return (
    <LogementVacantContext.Provider value={value}>
      {children}
    </LogementVacantContext.Provider>
  );
};
