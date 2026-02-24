import React, { createContext, useContext, useState, useMemo } from "react";
import { LandDetailResultType } from "@services/types/land";
import { UserLandPreferenceResultType } from "@services/types/project";
import { useUpdatePreferenceTarget2031Mutation, useGetCurrentUserQuery } from "@services/api";
import { getLandTypeLabel } from "@utils/landUtils";

interface TrajectoiresContextValue {
  landData: LandDetailResultType;
  landId: string;
  landType: string;
  name: string;

  conso2011_2020: number;
  annualConsoSince2021: number;

  hasTerritorialisation: boolean;
  isFromParent: boolean;
  objectifReduction: number;
  objectifLabel: string;
  objectifType: string;
  objectifTypeBadge: string;

  allowedConso2021_2030: number;
  allowedConso2021_2030PerYear: number;

  targetCustom: number | null;
  hasCustomTarget: boolean;
  allowedConsoCustom: number;
  allowedConsoCustomPerYear: number;

  sourceDocument: { nom_document: string } | null;
  currentDocument: { nom_document: string; document_url?: string } | null;
  parentDocument: { document_url?: string } | null;
  childrenLandTypesLabel: string;

  consoProjetee2031: number;
  tauxAtteinte2031: number;
  depassement2031: number;

  showCustomTargetModal: boolean;
  setShowCustomTargetModal: (value: boolean) => void;
  modalTargetInput: string;
  setModalTargetInput: (value: string) => void;
  openModal: () => void;
  handleSaveCustomTarget: () => void;
  isUpdating: boolean;

  isDGALNMember: boolean;
}

const TrajectoiresContext = createContext<TrajectoiresContextValue | null>(null);

export const useTrajectoiresContext = () => {
  const ctx = useContext(TrajectoiresContext);
  if (!ctx) {
    throw new Error("useTrajectoiresContext doit être utilisé dans un TrajectoiresProvider");
  }
  return ctx;
};

interface TrajectoiresProviderProps {
  landData: LandDetailResultType;
  preference?: UserLandPreferenceResultType;
  children: React.ReactNode;
}

export const TrajectoiresProvider: React.FC<TrajectoiresProviderProps> = ({
  landData,
  preference,
  children,
}) => {
  const { land_id, land_type, name, conso_details, territorialisation } = landData;
  const [updateTarget2031, { isLoading: isUpdating }] = useUpdatePreferenceTarget2031Mutation();
  const [showCustomTargetModal, setShowCustomTargetModal] = useState(false);
  const [modalTargetInput, setModalTargetInput] = useState<string>("");

  const { data: currentUser } = useGetCurrentUserQuery();
  const isDGALNMember = currentUser?.groups?.includes("DGALN") ?? false;

  const conso2011_2020 = conso_details?.conso_2011_2020 ?? 0;
  const annualConsoSince2021 = conso_details?.annual_conso_since_2021 ?? 0;

  const hasTerritorialisation = isDGALNMember && (territorialisation?.has_objectif ?? false);
  const isFromParent = territorialisation?.is_from_parent ?? false;
  const objectifReduction = hasTerritorialisation
    ? territorialisation?.objectif ?? 50
    : 50;

  const getObjectifLabel = () => {
    if (!hasTerritorialisation) return "Objectif national";
    if (isFromParent) return "Objectif suggéré";
    return "Objectif territorialisé";
  };

  const objectifLabel = getObjectifLabel();
  const objectifType = isFromParent || !hasTerritorialisation ? "suggéré" : "réglementaire";
  const objectifTypeBadge = isFromParent || !hasTerritorialisation ? "Objectif national non réglementaire" : "Objectif national réglementaire";

  const sourceDocument = territorialisation?.source_document ?? null;
  const currentDocument = territorialisation?.hierarchy?.at(-1) ?? null;
  const parentDocument = territorialisation?.hierarchy?.at(-2) ?? null;

  const allowedConso2021_2030 = conso2011_2020 * (1 - objectifReduction / 100);
  const allowedConso2021_2030PerYear = allowedConso2021_2030 / 10;

  const ANNEES_TOTALES = 10;
  const consoProjetee2031 = annualConsoSince2021 * ANNEES_TOTALES;
  const tauxAtteinte2031 =
    allowedConso2021_2030 > 0 ? (consoProjetee2031 / allowedConso2021_2030) * 100 : 0;
  const depassement2031 = consoProjetee2031 - allowedConso2021_2030;

  const targetCustom: number | null = preference?.target_2031 ?? null;
  const hasCustomTarget = targetCustom != null;
  const allowedConsoCustom = hasCustomTarget ? conso2011_2020 * (1 - targetCustom / 100) : 0;
  const allowedConsoCustomPerYear = hasCustomTarget ? allowedConsoCustom / 10 : 0;

  const childrenLandTypesLabel = (territorialisation?.children_land_types ?? [])
    .map((type, index) => {
      const label = getLandTypeLabel(type, true);
      return index === 0 ? label.charAt(0).toUpperCase() + label.slice(1) : label;
    })
    .join(" / ");

  const openModal = () => {
    setModalTargetInput(targetCustom != null ? String(targetCustom) : "");
    setShowCustomTargetModal(true);
  };

  const handleSaveCustomTarget = () => {
    if (modalTargetInput === "") {
      updateTarget2031({ land_type, land_id, target_2031: objectifReduction });
    } else {
      const numValue = Number.parseFloat(modalTargetInput);
      if (!Number.isNaN(numValue) && numValue >= 0 && numValue <= 100) {
        updateTarget2031({ land_type, land_id, target_2031: numValue });
      }
    }
    setShowCustomTargetModal(false);
  };

  const value = useMemo<TrajectoiresContextValue>(
    () => ({
      landData,
      landId: land_id ?? "",
      landType: land_type ?? "",
      name: name ?? "",

      conso2011_2020,
      annualConsoSince2021,

      hasTerritorialisation,
      isFromParent,
      objectifReduction,
      objectifLabel,
      objectifType,
      objectifTypeBadge,

      allowedConso2021_2030,
      allowedConso2021_2030PerYear,

      targetCustom,
      hasCustomTarget,
      allowedConsoCustom,
      allowedConsoCustomPerYear,

      sourceDocument,
      currentDocument,
      parentDocument,
      childrenLandTypesLabel,

      consoProjetee2031,
      tauxAtteinte2031,
      depassement2031,

      showCustomTargetModal,
      setShowCustomTargetModal,
      modalTargetInput,
      setModalTargetInput,
      openModal,
      handleSaveCustomTarget,
      isUpdating,

      isDGALNMember,
    }),
    [
      landData,
      land_id,
      land_type,
      name,
      conso2011_2020,
      annualConsoSince2021,
      hasTerritorialisation,
      isFromParent,
      objectifReduction,
      objectifLabel,
      objectifType,
      objectifTypeBadge,
      allowedConso2021_2030,
      allowedConso2021_2030PerYear,
      targetCustom,
      hasCustomTarget,
      allowedConsoCustom,
      allowedConsoCustomPerYear,
      sourceDocument,
      currentDocument,
      parentDocument,
      childrenLandTypesLabel,
      consoProjetee2031,
      tauxAtteinte2031,
      depassement2031,
      showCustomTargetModal,
      modalTargetInput,
      isUpdating,
      isDGALNMember,
    ]
  );

  return (
    <TrajectoiresContext.Provider value={value}>
      {children}
    </TrajectoiresContext.Provider>
  );
};
