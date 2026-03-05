import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { buildUrls } from "@utils/projectUrls";
import {
  SyntheseConso,
  SyntheseArtif,
  SyntheseFriche,
  SyntheseLogementVacant,
  TerritoryIdentityCard,
  DiagnosticsHub,
} from "./components";
import Badge from "@components/ui/Badge";
import Timeline from "@components/ui/Timeline";

interface SyntheseProps {
  landData: LandDetailResultType;
}

const Synthese: React.FC<SyntheseProps> = ({ landData }) => {
  const urls = buildUrls(landData.land_type_slug, landData.slug);

  return (
    <div className="fr-container--fluid fr-p-3w">
      <TerritoryIdentityCard landData={landData} className="fr-mb-7w" />

      <div className="fr-mb-7w">
        <h2 className="fr-mb-1w">
          Comprendre : les objectifs de sobriété foncière
        </h2>
        <p className="fr-text--sm fr-mb-4w">
          Chaque année, l'équivalent de 4 terrains de football par heure est
          artificialisé. La sobriété foncière vise à protéger les sols et leur
          rôle vital pour le climat, la biodiversité et l'agriculture, tout en
          permettant un développement durable des territoires. La{" "}
          <strong>loi Climat et Résilience</strong>, consistent à réduire la
          consommation d'espaces naturels, agricoles et forestiers et à terme de
          compenser toute nouvelle artificialisation par de la renaturation.
        </p>

        <Timeline phases={[
            {
              badge: <Badge variant="highlight">Horizon 2031</Badge>,
              title: "Réduction de la consommation d'espaces",
              description:
                "Diviser par deux la consommation d'espaces NAF par rapport à la décennie précédente",
              content: <SyntheseConso landData={landData} urls={urls} />,
            },
            {
              badge: <Badge variant="highlight">Horizon 2050</Badge>,
              title: "Zéro Artificialisation Nette",
              description:
                "Compenser toute nouvelle artificialisation par de la renaturation",
              content: <SyntheseArtif landData={landData} urls={urls} />,
            },
          ]} 
        />
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
      <DiagnosticsHub urls={urls} />
    </div>
  );
};

export default Synthese;
