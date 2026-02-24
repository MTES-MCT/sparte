import React from "react";
import styled from "styled-components";
import {
  FrichesMap,
  FrichesImpermeableMap,
  FrichesArtificialMap,
  FrichesOcsgeCouvertureMap,
} from "@components/map";
import { useFrichesContext } from "../context/FrichesContext";

const MapsContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-top: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StickyMapColumn = styled.div<{ $isMobile: boolean }>`
  ${({ $isMobile }) =>
    !$isMobile &&
    `
        position: sticky;
        top: 11rem;
    `}
  width: 50%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ScrollableMapsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
  flex: 1;
  width: 50%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const FrichesMaps: React.FC = () => {
  const {
    landData,
    frichesData,
    selectedFriche,
    mapsContainerRef,
    handleMapLoad,
    isMobile,
  } = useFrichesContext();

  return (
    <MapsContainer ref={mapsContainerRef}>
      <StickyMapColumn $isMobile={isMobile}>
        <h2 className="fr-mb-3w">Friches</h2>
        <FrichesMap
          landData={landData}
          frichesData={frichesData}
          center={selectedFriche}
          onMapLoad={handleMapLoad}
        />
      </StickyMapColumn>
      <ScrollableMapsColumn>
        <div>
          <h2>Surfaces artificialisées des friches</h2>
          <FrichesArtificialMap
            landData={landData}
            frichesData={frichesData}
            center={selectedFriche}
            onMapLoad={handleMapLoad}
          />
        </div>
        <div>
          <h2>Surfaces imperméables des friches</h2>
          <FrichesImpermeableMap
            landData={landData}
            frichesData={frichesData}
            center={selectedFriche}
            onMapLoad={handleMapLoad}
          />
        </div>
        <div>
          <h2>Couverture des friches</h2>
          <FrichesOcsgeCouvertureMap
            landData={landData}
            frichesData={frichesData}
            center={selectedFriche}
            onMapLoad={handleMapLoad}
          />
        </div>
      </ScrollableMapsColumn>
    </MapsContainer>
  );
};
