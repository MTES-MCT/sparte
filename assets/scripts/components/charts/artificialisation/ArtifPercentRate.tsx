import React from "react";
import styled from "styled-components";

// À remplacer par des svg
import treeIcon from "@images/icon-tree.png";
import houseIcon from "@images/icon-house.png";

interface ArtifPercentRateProps {
  percentageArtificialized: number;
  totalIcons?: number;
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  padding: 1rem;
  width: 100%;
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

const HouseIcon = () => (
  <img
    src={houseIcon}
    alt="Maison"
    width="32"
    height="32"
  />
);

export const ArtifPercentRate: React.FC<ArtifPercentRateProps> = ({
  percentageArtificialized,
  totalIcons = 56,
}) => {
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