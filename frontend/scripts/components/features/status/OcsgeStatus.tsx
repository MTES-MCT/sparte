import React from 'react';
import Notice from '@components/ui/Notice';

export enum OcsgeStatusEnum {
  COMPLETE_UNIFORM = "COMPLETE_UNIFORM",
  COMPLETE_NOT_UNIFORM = "COMPLETE_NOT_UNIFORM",
  PARTIAL = "PARTIAL",
  PARTIAL_DUE_TO_PRODUCTOR_ISSUE = "PARTIAL_DUE_TO_PRODUCTOR_ISSUE",
  NO_DATA = "NO_DATA",
  UNDEFINED = "UNDEFINED",
}

interface StatusMessage {
  title: string;
  description: string;
}

const defaultMessage = "Les données OCS GE ne sont pas encore disponibles sur ce territoire.";
const detailMessage = "Vous n'avez donc pas accès aux informations relatives à l'artificialisation.";
const errorMessage = `${defaultMessage} ${detailMessage}`;

const statusMessages: Partial<Record<OcsgeStatusEnum, StatusMessage>> = {
  [OcsgeStatusEnum.COMPLETE_NOT_UNIFORM]: {
    title: "Données OCS GE disponibles mais non uniformes.",
    description: "Les données OCS GE sont disponibles sur ce territoire, mais les dates des millésimes ne sont pas uniformes entre toutes les collectivités."
  },
  [OcsgeStatusEnum.PARTIAL]: {
    title: "Données OCS GE partiellement disponibles.",
    description: `Les données OCS GE ne sont que partiellement disponibles sur ce territoire. ${detailMessage}`
  },
  [OcsgeStatusEnum.PARTIAL_DUE_TO_PRODUCTOR_ISSUE]: {
    title: "Données OCS GE partiellement disponibles.",
    description: `Les données OCS GE ne sont que partiellement disponibles sur ce territoire en raison d'un problème lié à la production de la donnée. ${detailMessage}`
  },
  [OcsgeStatusEnum.NO_DATA]: {
    title: "Données OCS GE non disponibles.",
    description: errorMessage
  },
  [OcsgeStatusEnum.UNDEFINED]: {
    title: "Données OCS GE non disponibles.",
    description: errorMessage
  },
};

export interface OcsgeStatusProps {
  status: OcsgeStatusEnum;
}

const OcsgeStatus: React.FC<OcsgeStatusProps> = ({ status }) => {
  const content = statusMessages[status];
  if (!content) return null;

  return <Notice type="warning" title={content.title} description={content.description} />;
};

export default OcsgeStatus;
