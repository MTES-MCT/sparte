import React, { createContext, useContext, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { LandDetailResultType, FricheStatusEnum, FricheStatusDetails, LandType } from "@services/types/land";
import { LandFriche } from "@services/types/land_friches";
import { useGetLandFrichesQuery } from "@services/api";
import { useMapSync } from "@components/map";
import useWindowSize from "@hooks/useWindowSize";
import type * as maplibregl from "maplibre-gl";

interface FrichesContextValue {
  landData: LandDetailResultType;
  landId: string;
  landType: LandType;
  name: string;
  fricheStatus: FricheStatusEnum;
  fricheStatusDetails: FricheStatusDetails;

  frichesData: LandFriche[] | undefined;

  selectedFriche: [number, number] | null;
  setSelectedFriche: (coords: [number, number] | null) => void;
  handleFricheClick: (point: { type: "Point"; coordinates: [number, number] }) => void;

  mapsContainerRef: React.RefObject<HTMLDivElement>;
  handleMapLoad: (map: maplibregl.Map) => void;
  isMobile: boolean;

  showCharts: boolean;
}

const FrichesContext = createContext<FrichesContextValue | null>(null);

export const useFrichesContext = () => {
  const ctx = useContext(FrichesContext);
  if (!ctx) {
    throw new Error("useFrichesContext doit être utilisé dans un FrichesProvider");
  }
  return ctx;
};

interface FrichesProviderProps {
  landData: LandDetailResultType;
  children: React.ReactNode;
}

export const FrichesProvider: React.FC<FrichesProviderProps> = ({
  landData,
  children,
}) => {
  const {
    land_id,
    land_type,
    name,
    friche_status,
    friche_status_details,
  } = landData || {};

  const [selectedFriche, setSelectedFriche] = useState<[number, number] | null>(null);
  const mapsContainerRef = useRef<HTMLDivElement>(null);
  const { addMap, cleanup } = useMapSync();
  const { isMobile } = useWindowSize();

  const { data: frichesData } = useGetLandFrichesQuery(
    { land_type, land_id },
    { skip: !landData }
  );

  const handleMapLoad = useCallback(
    (map: maplibregl.Map) => {
      addMap(map);
    },
    [addMap]
  );

  const handleFricheClick = useCallback(
    (point: { type: "Point"; coordinates: [number, number] }) => {
      setSelectedFriche(point.coordinates);
    },
    []
  );

  useEffect(() => {
    if (selectedFriche && mapsContainerRef.current) {
      const containerTop = mapsContainerRef.current.offsetTop;
      const headerOffset = 180;
      const scrollPosition = containerTop - headerOffset;

      window.scrollTo({
        top: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [selectedFriche]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const showCharts =
    [
      FricheStatusEnum.GISEMENT_POTENTIEL_ET_EN_COURS_EXPLOITATION,
      FricheStatusEnum.GISEMENT_POTENTIEL_ET_NON_EXPLOITE,
    ].includes(friche_status) &&
    [LandType.REGION, LandType.DEPARTEMENT].includes(land_type);

  const value = useMemo<FrichesContextValue>(
    () => ({
      landData,
      landId: land_id ?? "",
      landType: land_type ?? LandType.COMMUNE,
      name: name ?? "",
      fricheStatus: friche_status,
      fricheStatusDetails: friche_status_details,

      frichesData,

      selectedFriche,
      setSelectedFriche,
      handleFricheClick,

      mapsContainerRef: mapsContainerRef as React.RefObject<HTMLDivElement>,
      handleMapLoad,
      isMobile,

      showCharts,
    }),
    [
      landData,
      land_id,
      land_type,
      name,
      friche_status,
      friche_status_details,
      frichesData,
      selectedFriche,
      handleFricheClick,
      handleMapLoad,
      isMobile,
      showCharts,
    ]
  );

  return (
    <FrichesContext.Provider value={value}>{children}</FrichesContext.Provider>
  );
};
