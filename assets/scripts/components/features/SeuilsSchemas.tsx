import React from "react";
import styled from "styled-components";

export const artifColor = "#F4D0C4";
export const nonArtifColor = "#CDE3CE";
export const nonArtifDarkColor = "#486B5D";

export const SquareBase = styled.div`
  width: 150px;
  height: 150px;
  position: relative;

  @keyframes blinkRed {
    0% {
      background-color: ${artifColor};
    }
    50% {
      background-color: #edb2a1;
    }
    100% {
      background-color: ${artifColor};
    }
  }

  @keyframes blinkGreen {
    0% {
      background-color: ${nonArtifColor};
    }
    50% {
      background-color: #b8d7b9;
    }
    100% {
      background-color: ${nonArtifColor};
    }
  }
`;

export const ArtificializedSquare = styled(SquareBase)`
  background-color: ${artifColor};

  &::after {
    content: "< 2500m²";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 66.67%;
    height: 66.67%;
    background-color: ${nonArtifColor};
    border: 1px solid ${nonArtifDarkColor};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    color: ${nonArtifDarkColor};
  }

  &:hover::after {
    animation: blinkRed 1s infinite;
  }
`;

export const NonArtificializedSquare = styled(SquareBase)`
  background-color: ${nonArtifColor};

  &::after {
    content: "< 2500m²";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 66.67%;
    height: 66.67%;
    background-color: ${artifColor};
    border: 1px solid ${nonArtifDarkColor};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75em;
    color: ${nonArtifDarkColor};
  }

  &:hover::after {
    animation: blinkGreen 1s infinite;
  }
`;

export const ConstructionSquare = styled(SquareBase)`
  background-color: ${nonArtifColor};

  &::after {
    content: "> 50m²";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 35%;
    height: 35%;
    background-color: ${artifColor};
    border: 1px solid ${nonArtifDarkColor};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65em;
    color: ${nonArtifDarkColor};
  }

  &:hover::after {
    animation: blinkRed 1s infinite;
  }
`;

export const SeuilsSchemas = () => {
  return (
    <>
      <div className="d-flex flex-column align-items-center">
        <span className="fr-badge">1</span>
        <br />
        <ArtificializedSquare />
        <p className="fr-text--sm text-center fr-mt-2w fr-mb-0 fr-text--bold">
          Une zone non-artificielle de moins de 2500m², enclavée dans une zone
          artificielle, devient artificielle
        </p>
      </div>
      <div className="d-flex flex-column align-items-center">
        <span className="fr-badge">2</span>
        <br />
        <NonArtificializedSquare />
        <p className="fr-text--sm text-center fr-mt-2w fr-mb-0 fr-text--bold">
          Une zone artificielle de moins de 2500m², enclavée dans une zone
          non-artificielle, devient non-artificielle
        </p>
      </div>
      <div className="d-flex flex-column align-items-center">
        <span className="fr-badge">3</span>
        <br />
        <ConstructionSquare />
        <p className="fr-text--sm text-center fr-mt-2w fr-mb-0 fr-text--bold">
          Une zone bâtie de plus de 50m², enclavée dans une zone
          non-artificielle, est toujours artificielle
        </p>
      </div>
    </>
  );
};
