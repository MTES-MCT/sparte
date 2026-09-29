import { useGetUserLandPreferenceQuery } from "@services/api";
import { ReportOwnerPreference } from "@services/types/reportDraft";

/**
 * Préférences à appliquer au rapport.
 * En rendu PDF, Puppeteer n'a pas de session : on utilise alors les préférences
 * du propriétaire du brouillon (ownerPreference) au lieu de celles de l'utilisateur courant.
 */
export const useReportPreference = (
  landType: string,
  landId: string,
  ownerPreference?: ReportOwnerPreference
) => {
  const { data: currentUserPreference } = useGetUserLandPreferenceQuery(
    { land_type: landType, land_id: landId },
    { skip: !!ownerPreference }
  );
  return ownerPreference ?? currentUserPreference;
};
