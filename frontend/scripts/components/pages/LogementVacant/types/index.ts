import { LandDetailResultType } from "@services/types/land";

// Données logement vacant
export interface LogementVacantYearData {
  year: number;
  logements_vacants_parc_prive: number;
  logements_vacants_parc_prive_percent: number;
  logements_vacants_parc_social: number;
  logements_vacants_parc_social_percent: number;
  logements_vacants_parc_general: number;
  logements_vacants_parc_prive_on_parc_general_percent: number;
  logements_vacants_parc_social_on_parc_general_percent: number;
}

export interface LogementVacantProgression {
  years: LogementVacantYearData[];
  last_year: LogementVacantYearData;
}

// Données autorisation logement
export interface AutorisationLogementYearData {
  year: number;
  logements_autorises: number;
  percent_autorises_on_parc_general: number;
  percent_autorises_on_vacants_parc_general: number;
}

export interface AutorisationLogementProgression {
  years: AutorisationLogementYearData[];
  last_year: AutorisationLogementYearData;
}

// Props composants
export interface LogementVacantProps {
  landData: LandDetailResultType;
}

export interface LogementVacantProgressionProps {
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
}

export interface LogementVacantAutorisationProps extends LogementVacantProgressionProps {
  hasAutorisationLogement: boolean;
  logementVacantLastYear?: LogementVacantYearData;
  autorisationLogementLastYear?: AutorisationLogementYearData;
  territoryName: string;
}
