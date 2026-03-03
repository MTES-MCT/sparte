import React from "react";
import styled from "styled-components";
import { theme } from "@theme";

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Card = styled.div`
  background: ${theme.colors.background};
  border-radius: ${theme.radius.default};
  box-shadow: ${theme.shadow.md};
  width: 100%;
  overflow: hidden;
`;

export const BaseCard: React.FC<BaseCardProps> = ({ className, ...props }) => (
  <Card className={className} {...props} />
);

export default BaseCard;
