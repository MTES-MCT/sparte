import React, { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from "react";
import { formatNumber } from "@utils/formatUtils";
import { useConsoData } from "../hooks";

export const DEFAULT_START_YEAR = 2011;
export const DEFAULT_END_YEAR = 2023;

export const LAND_TYPE_LABELS: Record<string, string> = {
  COMM: "Commune",
  EPCI: "EPCI",
  DEPART: "Département",
  SCOT: "SCoT",
  REGION: "Région",
  NATION: "Nation",
  COMP: "Composite",
};

const LAND_TYPE_HIERARCHY: Record<string, number> = {
  REGION: 5,
  DEPART: 4,
  SCOT: 3,
  EPCI: 2,
  COMM: 1,
  NATION: 6,
  COMP: 0,
};

const getHighestLandType = (landTypes: string[]): string => {
  if (!landTypes || landTypes.length === 0) return "";
  return landTypes.reduce((highest, current) => {
    const highestValue = LAND_TYPE_HIERARCHY[highest] || 0;
    const currentValue = LAND_TYPE_HIERARCHY[current] || 0;
    return currentValue > highestValue ? current : highest;
  }, landTypes[0]);
};

interface ConsommationControlsContextType {
  startYear: number;
  endYear: number;
  setStartYear: (year: number) => void;
  setEndYear: (year: number) => void;
  minYear: number;
  maxYear: number;
  defaultStartYear: number;
  defaultEndYear: number;
  showStickyConsoCard: boolean;
  showStickyPerHabitantCard: boolean;
  showStickyPopulationCard: boolean;
  consoCardRef: React.RefObject<HTMLDivElement>;
  perHabitantCardRef: React.RefObject<HTMLDivElement>;
  populationCardRef: React.RefObject<HTMLDivElement>;
  totalConsoHa: number | null;
  consoPerNewHabitant: string;
  populationEvolution: number | null;
  populationEvolutionPercent: number | null;
  isLoadingConso: boolean;
  isLoadingPop: boolean;
  childLandTypes?: string[];
  childType?: string;
  setChildType: (childType: string) => void;
  landTypeLabels: Record<string, string>;
}

const ConsommationControlsContext = createContext<ConsommationControlsContextType | undefined>(undefined);

interface ConsommationControlsProviderProps {
  children: ReactNode;
  land_id: string;
  land_type: string;
  childLandTypes?: string[];
  minYear?: number;
  maxYear?: number;
  defaultStartYear?: number;
  defaultEndYear?: number;
}

export const ConsommationControlsProvider: React.FC<ConsommationControlsProviderProps> = ({
  children,
  land_id,
  land_type,
  childLandTypes,
  minYear = 2009,
  maxYear = 2023,
  defaultStartYear = DEFAULT_START_YEAR,
  defaultEndYear = DEFAULT_END_YEAR,
}) => {
  const [startYear, setStartYear] = useState(defaultStartYear);
  const [endYear, setEndYear] = useState(defaultEndYear);

  const [childType, setChildType] = useState<string | undefined>(
    childLandTypes && childLandTypes.length > 0 ? getHighestLandType(childLandTypes) : undefined
  );

  const { totalConsoHa, populationEvolution, populationEvolutionPercent, isLoadingConso, isLoadingPop } =
    useConsoData(land_id, land_type, startYear, endYear);

  const [showStickyConsoCard, setShowStickyConsoCard] = useState(false);
  const [showStickyPerHabitantCard, setShowStickyPerHabitantCard] = useState(false);
  const [showStickyPopulationCard, setShowStickyPopulationCard] = useState(false);
  const consoCardRef = useRef<HTMLDivElement>(null);
  const perHabitantCardRef = useRef<HTMLDivElement>(null);
  const populationCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (consoCardRef.current) {
        const rect = consoCardRef.current.getBoundingClientRect();
        setShowStickyConsoCard(rect.bottom < 0);
      }

      if (perHabitantCardRef.current) {
        const rect = perHabitantCardRef.current.getBoundingClientRect();
        setShowStickyPerHabitantCard(rect.bottom < 0);
      }

      if (populationCardRef.current) {
        const rect = populationCardRef.current.getBoundingClientRect();
        setShowStickyPopulationCard(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const consoPerNewHabitant = useMemo(() => {
    if (isLoadingConso || isLoadingPop || totalConsoHa === null || populationEvolution === null || populationEvolution <= 0) {
      return "...";
    }

    const consoPerHabitantM2 = (totalConsoHa * 10000) / populationEvolution;
    return `${formatNumber({ number: consoPerHabitantM2, decimals: 0 })} m²`;
  }, [isLoadingConso, isLoadingPop, totalConsoHa, populationEvolution]);

  const value: ConsommationControlsContextType = useMemo(
    () => ({
      startYear,
      endYear,
      setStartYear,
      setEndYear,
      minYear,
      maxYear,
      defaultStartYear,
      defaultEndYear,
      showStickyConsoCard,
      showStickyPerHabitantCard,
      showStickyPopulationCard,
      consoCardRef,
      perHabitantCardRef,
      populationCardRef,
      totalConsoHa,
      consoPerNewHabitant,
      populationEvolution,
      populationEvolutionPercent,
      isLoadingConso,
      isLoadingPop,
      childLandTypes,
      childType,
      setChildType,
      landTypeLabels: LAND_TYPE_LABELS,
    }),
    [
      startYear,
      endYear,
      minYear,
      maxYear,
      defaultStartYear,
      defaultEndYear,
      showStickyConsoCard,
      showStickyPerHabitantCard,
      showStickyPopulationCard,
      totalConsoHa,
      consoPerNewHabitant,
      populationEvolution,
      populationEvolutionPercent,
      isLoadingConso,
      isLoadingPop,
      childLandTypes,
      childType,
    ]
  );

  return (
    <ConsommationControlsContext.Provider value={value}>
      {children}
    </ConsommationControlsContext.Provider>
  );
};

export const useConsommationControls = (): ConsommationControlsContextType => {
  const context = useContext(ConsommationControlsContext);
  if (!context) {
    throw new Error("useConsommationControls must be used within a ConsommationControlsProvider");
  }
  return context;
};
