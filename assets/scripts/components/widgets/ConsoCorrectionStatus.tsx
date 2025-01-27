import React from "react";
import styled from "styled-components";

const NoticeBody = styled.div`
  flex-direction: column;
  display: flex;
  gap: 0.5rem;
`;

export enum ConsoCorrectionStatusEnum {
  UNCHANGED = "UNCHANGED",
  FUSION = "FUSION",
  DIVISION = "DIVISION",
  COG_ERROR = "COG_ERROR",
  MISSING_FROM_SOURCE = "MISSING_FROM_SOURCE",
}

interface IconsoCorrectionStatusMessages {
  title: string;
  message: string;
}

const defaultTitle = "Données de consommation modifiées";
const warningTitle = "Données de consommation indisponibles";
const missingMessage = `Votre territoire est absent du dernier millésime de données de consommation d'espaces NAF. Pour plus d'informations, rapprochez-vous du CEREMA, producteur de cette donnée.`;

export const consoCorrectionStatusMessages: {
  [key in ConsoCorrectionStatusEnum]?: IconsoCorrectionStatusMessages;
} = {
  FUSION: {
    title: defaultTitle,
    message:
      "Pour refléter les changements de votre territoire depuis la dernière mise à jour du code officiel géographique, nous avons fusionné les données de consommation d'espace NAF des anciennes communes le composant.",
  },
  DIVISION: {
    title: warningTitle,
    message: `Votre territoire ayant été divisé lors de la dernière mise à jour du code officiel géographique,
        nous ne pouvons pas vous proposer d'analyse de consommation d'espaces NAF.
        Nous vous invitons à consulter l'analyse de consommation de l'EPCI auquel votre territoire appartient.`,
  },
  COG_ERROR: {
    title: warningTitle,
    message: missingMessage,
  },
  MISSING_FROM_SOURCE: {
    title: warningTitle,
    message: missingMessage,
  },
};

export interface ConsoCorrectionStatusProps {
  status: ConsoCorrectionStatusEnum;
}

const ConsoCorrectionStatus: React.FC<ConsoCorrectionStatusProps> = ({
  status,
}) => {
  const title = consoCorrectionStatusMessages[status].title;
  const message = consoCorrectionStatusMessages[status].message;

  return (
    <div className="fr-notice fr-notice--info fr-my-3w">
      <div className="fr-container--fluid fr-p-3w">
        <NoticeBody className="fr-notice__body">
          <p className="fr-notice__title">{title}</p>
          <p className="fr-notice__desc fr-text--sm">{message}</p>
        </NoticeBody>
      </div>
    </div>
  );
};

export default ConsoCorrectionStatus;
