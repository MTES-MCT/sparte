import React from "react";
import styled from "styled-components";

// À remplacer par des svg
import treeIcon from "@images/icon-tree.png";
import HouseIcon from "@images/icon-house.svg";

interface ArtifPercentRateProps {
  percentageArtificialized: number;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(8, 1fr);
  gap: 8px;
  padding: 1rem;
  width: 100%;
  max-width: 400px;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TreeIcon = () => (
  <img
    src={treeIcon}
    alt="Arbre"
    width="32"
    height="32"
  />
);

export const ArtifPercentRate: React.FC<ArtifPercentRateProps> = ({
  percentageArtificialized,
}) => {
  const totalIcons = 56;
  const houseCount = Math.round((percentageArtificialized / 100) * totalIcons);
  const treeCount = totalIcons - houseCount;

  const icons = [
    ...Array(houseCount).fill("house"),
    ...Array(treeCount).fill("tree"),
  ];

  return (
    <GridContainer>
      {icons.map((type, index) => (
        <IconContainer key={index}>
          {type === "house" ? <HouseIcon /> : <TreeIcon />}
        </IconContainer>
      ))}
    </GridContainer>
  );
};