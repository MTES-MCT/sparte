import styled from "styled-components";
import { theme } from "@theme";

type CardPadding = "none" | "sm" | "md" | "lg";

const paddingMap: Record<CardPadding, string> = {
  none: "0",
  sm: theme.spacing.sm,
  md: theme.spacing.md,
  lg: theme.spacing.lg,
};

export const BaseCard = styled.div<{ $padding?: CardPadding }>`
  background: ${theme.colors.background};
  border-radius: ${theme.radius.default};
  box-shadow: ${theme.shadow.md};
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: ${({ $padding }) => ($padding ? paddingMap[$padding] : "0")};
`;

export default BaseCard;
