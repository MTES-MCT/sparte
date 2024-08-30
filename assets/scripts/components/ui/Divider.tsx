import React from 'react';
import styled from 'styled-components';

interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    color?: string;
    size?: string;
}

const StyledDivider = styled.div<DividerProps>`
    background-color: ${({ color }) => color || '#EEF2F7'};
    ${({ orientation, size }) =>
        orientation === 'vertical'
        ? `
        height: ${size || 'auto'};
        width: 1px;
        `
        : `
        height: 1px;
        width: ${size || 'auto'};
        `}
`;

const Divider: React.FC<DividerProps> = ({
    orientation = 'vertical',
    color,
  size,
}) => {
    return <StyledDivider orientation={orientation} color={color} size={size} />;
};

export default Divider;