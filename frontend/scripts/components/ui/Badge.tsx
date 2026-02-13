import styled from "styled-components";
import { theme } from "@theme";

type BadgeVariant = "neutral" | "active";

/**
 * Badge/Tag avec deux états :
 * - neutral : discret, pour les éléments inactifs ou non disponibles
 * - active : mis en avant, pour les éléments actifs ou disponibles
 */
const Badge = styled.span<{ $variant?: BadgeVariant }>`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem;
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.medium};
  border-radius: ${theme.radius};
  background: ${({ $variant = "neutral" }) => theme.badge[$variant].background};
  color: ${({ $variant = "neutral" }) => theme.badge[$variant].color};

  i {
    font-size: ${theme.fontSize.xs};
  }
`;

export default Badge;
