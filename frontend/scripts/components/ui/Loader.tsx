import React from 'react';
import styled, { keyframes } from 'styled-components';

const m = keyframes`
    0% {
        background-position: calc(0*100%/2) 100%, calc(1*100%/2) 100%, calc(2*100%/2) 100%;
    }
    12.5% {
        background-position: calc(0*100%/2) 0, calc(1*100%/2) 100%, calc(2*100%/2) 100%;
    }
    25% {
        background-position: calc(0*100%/2) 0, calc(1*100%/2) 0, calc(2*100%/2) 100%;
    }
    37.5% {
        background-position: calc(0*100%/2) 0, calc(1*100%/2) 0, calc(2*100%/2) 0;
    }
    50% {
        background-position: calc(0*100%/2) 0, calc(1*100%/2) 0, calc(2*100%/2) 0;
    }
    62.5% {
        background-position: calc(0*100%/2) 100%, calc(1*100%/2) 0, calc(2*100%/2) 0;
    }
    75% {
        background-position: calc(0*100%/2) 100%, calc(1*100%/2) 100%, calc(2*100%/2) 0;
    }
    87.5% {
        background-position: calc(0*100%/2) 100%, calc(1*100%/2) 100%, calc(2*100%/2) 100%;
    }
    100% {
        background-position: calc(0*100%/2) 100%, calc(1*100%/2) 100%, calc(2*100%/2) 100%;
    }
`;

const LoaderWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
`;

const LoaderContainer = styled.div<{ size: number }>`
    color: darkblue;
    width: ${({ size }) => size}px;
    height: ${({ size }) => size * 0.566}px; /* Garder la proportion */
    --d: radial-gradient(farthest-side, currentColor 90%, #0000);
    background: var(--d), var(--d), var(--d);
    background-size: ${({ size }) => size * 0.226}px ${({ size }) => size * 0.226}px;
    background-repeat: no-repeat;
    animation: ${m} 1s infinite;
`;

interface LoaderProps {
    size?: number;
    wrap?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 53, wrap = true }) => {
    const content = <LoaderContainer size={size} />;

    return wrap ? (
        <LoaderWrapper>
            {content}
        </LoaderWrapper>
    ) : (
        content
    );
};

export default Loader;
