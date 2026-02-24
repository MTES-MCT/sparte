import React from "react";
import styled from "styled-components";
import { LandDetailResultType } from "@services/types/land";
import { theme } from "@theme";
import { buildUrls } from "@utils/projectUrls";
import SyntheseConso from "./components/SyntheseConso";
import SyntheseArtif from "./components/SyntheseArtif";
import SyntheseFriche from "./components/SyntheseFriche";
import SyntheseLogementVacant from "./components/SyntheseLogementVacant";
import TerritoryIdentityCard from "./components/TerritoryIdentityCard";
import DiagnosticsHub from "./components/DiagnosticsHub";
import Feedback from '@components/ui/Feedback';
import Badge from '@components/ui/Badge';

interface SyntheseProps {
  landData: LandDetailResultType;
}

const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 2rem;

  &::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${theme.colors.border};
  }
`;

const TimelineEndpoint = styled.div<{ $position: "start" | "end" }>`
  position: absolute;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${theme.colors.border};
  ${({ $position }) => $position === "start" ? "top: -6px;" : "bottom: -6px;"}
`;

const PhaseBlock = styled.div`
  position: relative;
`;

const MarkerDot = styled.div`
  position: absolute;
  left: -2rem;
  top: 1rem;
  transform: translate(-50%, -50%);
  margin-left: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  border: 2px solid white;
  box-shadow: 0 0 0 2px ${theme.colors.primaryBg};
`;

const Synthese: React.FC<SyntheseProps> = ({ landData }) => {
  const urls = buildUrls(landData.land_type_slug, landData.slug);

  return (
    <div className="fr-container--fluid fr-p-3w">
      <TerritoryIdentityCard landData={landData} className="fr-mb-7w" />

      <div className="fr-mb-7w">
        <h2 className="fr-mb-1w">Comprendre : les objectifs de sobriété foncière</h2>
        <p className="fr-text--sm fr-mb-4w">
          Chaque année, l'équivalent de 4 terrains de football par heure est artificialisé.
          La sobriété foncière vise à protéger les sols et leur rôle vital pour le climat, la biodiversité et l'agriculture, tout en permettant un développement durable des territoires.
          La <strong>loi Climat et Résilience</strong>, consistent à réduire la consommation d'espaces naturels, agricoles et forestiers et à terme de compenser toute nouvelle artificialisation par de la renaturation.
        </p>

        <TimelineWrapper className="fr-pt-4w">
          <TimelineEndpoint $position="start" />

          <PhaseBlock className="fr-mb-4w">
            <MarkerDot />
            <Badge variant="highlight">Horizon 2031</Badge>
            <h3 className="fr-mb-0">Réduction de la consommation d'espaces</h3>
            <p className="fr-text--sm fr-mb-0">
              Diviser par deux la consommation d'espaces NAF par rapport à la décennie précédente
            </p>
          </PhaseBlock>

          <div className="fr-mb-5w">
            <SyntheseConso
              landData={landData}
              urls={urls}
            />
          </div>

          <PhaseBlock className="fr-mb-4w">
            <MarkerDot />
            <Badge variant="highlight">Horizon 2050</Badge>
            <h3 className="fr-mb-0">Zéro Artificialisation Nette</h3>
            <p className="fr-text--sm fr-mb-0">
              Compenser toute nouvelle artificialisation par de la renaturation
            </p>
          </PhaseBlock>

          <div className="fr-mb-5w">
            <SyntheseArtif
              landData={landData}
              urls={urls}
            />
          </div>

          <TimelineEndpoint $position="end" />
        </TimelineWrapper>
      </div>

      <div className="fr-mb-7w">
        <h2 className="fr-mb-1w">Agir: Leviers de sobriété foncière</h2>
        <div className="fr-text--sm fr-mb-4w">
          Pour atteindre ces objectifs, plusieurs leviers d'action sont
          identifiés sur votre territoire. Leur activation permet de réduire
          concrètement la consommation d'espaces et l'artificialisation des
          sols.
        </div>

        <h3>Vacance des logements</h3>
        <SyntheseLogementVacant
          landData={landData}
          urls={urls}
        />

        <h3 className="fr-mt-5w">Réhabilitation des friches</h3>
        <SyntheseFriche
          landData={landData}
          urls={urls}
        />
      </div>

      <div className="fr-mb-7w">
        <DiagnosticsHub urls={urls} />
      </div>

      <Feedback onSubmit={(rating, comment) => console.log(rating, comment)} />
    </div>
  );
};

export default Synthese;
