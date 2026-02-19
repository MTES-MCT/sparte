import React from "react";
import styled from "styled-components";
import { theme } from "@theme";

interface IconBadgeProps {
  icon: string;
  $size?: number;
}

const Wrapper = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${theme.colors.primary};
  color: #fff;

  i {
    font-size: ${theme.fontSize.md};
  }
`;

const IconBadge: React.FC<IconBadgeProps> = ({ icon, $size = 42 }) => (
  <Wrapper $size={$size}>
    <i className={icon} />
  </Wrapper>
);

export default IconBadge;
