import React, { ReactNode } from 'react';
import styled from 'styled-components';

type IconProps = {
    icon: string;
    color?: string;
};
  
const IconWrapper = styled.i<{ color?: string }>`
    color: ${({ color }) => color || 'currentColor'};
`;
  
const Icon: React.FC<IconProps> = ({ icon, color }) => {
    return <IconWrapper className={`bi bi-${icon}`} color={color} />;
};

export default Icon;
