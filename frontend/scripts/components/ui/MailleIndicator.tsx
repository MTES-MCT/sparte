import React from "react";
import styled from "styled-components";
import { theme } from "@theme";

const Wrapper = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textMuted};

  i {
    font-size: 0.85em;
  }
`;

const MailleIndicator: React.FC = () => (
  <Wrapper title="Ce graphique dépend de la maille d'analyse sélectionnée">
    <i className="bi bi-grid-3x3-gap" aria-hidden="true" />
    Maille d'analyse modifiable
  </Wrapper>
);

export default MailleIndicator;
