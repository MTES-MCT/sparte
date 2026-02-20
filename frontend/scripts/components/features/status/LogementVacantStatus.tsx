import React from 'react';
import { LogementVacantStatusEnum } from '@services/types/land';
import StatusNotice from './StatusNotice';

interface LogementVacantStatusProps {
  status?: LogementVacantStatusEnum;
}

interface NoticeContent {
  title: string;
  description: string;
}

const noticeContentMap: Partial<Record<LogementVacantStatusEnum, NoticeContent>> = {
  [LogementVacantStatusEnum.DONNEES_INDISPONIBLES]: {
    title: "Données non disponibles",
    description: "Les données de logements vacants ne sont pas disponibles pour votre territoire en raison du secret statistique."
  },
  [LogementVacantStatusEnum.GISEMENT_NUL_PARTIELLEMENT_SECRETISE]: {
    title: "Données du parc privé partiellement secrétisées",
    description: "Certaines données du parc privé sont masquées en raison du secret statistique. Les chiffres peuvent être incomplets."
  },
  [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_ET_LE_PRIVE_PARTIELLEMENT_SECRETISE]: {
    title: "Données du parc privé partiellement secrétisées",
    description: "Certaines données du parc privé sont masquées en raison du secret statistique. Les chiffres affichés peuvent être sous-estimés."
  },
  [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_PARTIELLEMENT_SECRETISE]: {
    title: "Données du parc privé partiellement secrétisées",
    description: "Certaines données du parc privé sont masquées en raison du secret statistique."
  },
  [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_PARTIELLEMENT_SECRETISE]: {
    title: "Données du parc privé partiellement secrétisées",
    description: "Certaines données du parc privé sont masquées en raison du secret statistique. Les chiffres affichés peuvent être sous-estimés."
  },
  [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: {
    title: "Données du parc privé non disponibles",
    description: "Les données du parc privé sont indisponibles en raison du secret statistique. Seules les données du parc social sont affichées."
  },
  [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_SOCIAL_DONNEES_PRIVEES_INDISPONIBLES]: {
    title: "Données du parc privé non disponibles",
    description: "Les données du parc privé sont indisponibles en raison du secret statistique. Seules les données du parc social sont affichées."
  },
  [LogementVacantStatusEnum.GISEMENT_NUL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: {
    title: "Données du parc social non disponibles",
    description: "Les données du parc des bailleurs sociaux ne sont pas disponibles. Seules les données du parc privé sont affichées."
  },
  [LogementVacantStatusEnum.GISEMENT_POTENTIEL_DANS_LE_PRIVE_DONNEES_SOCIALES_INDISPONIBLES]: {
    title: "Données du parc social non disponibles",
    description: "Les données du parc des bailleurs sociaux ne sont pas disponibles. Seules les données du parc privé sont affichées."
  },
};

const LogementVacantStatus: React.FC<LogementVacantStatusProps> = ({ status }) => {
  if (!status) return null;

  const content = noticeContentMap[status];
  if (!content) return null;

  return <StatusNotice title={content.title} description={content.description} />;
};

export default LogementVacantStatus;
