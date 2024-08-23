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
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const LoaderContainer = styled.div`
    color: darkblue;
    width: 53px;
    height: 30px;
    --d: radial-gradient(farthest-side, currentColor 90%, #0000);
    background: var(--d), var(--d), var(--d);
    background-size: 12px 12px;
    background-repeat: no-repeat;
    animation: ${m} 1s infinite;
`;

const Loader: React.FC = () => {
    return <LoaderWrapper>
        <LoaderContainer></LoaderContainer>
    </LoaderWrapper>;
};

export default Loader;
