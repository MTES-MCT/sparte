import React from "react";
import { LandDetailResultType } from "@services/types/land";
import { buildUrls } from "@utils/projectUrls";
import {
  SyntheseConso,
  SyntheseArtif,
  SyntheseFriche,
  SyntheseLogementVacant,
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
      <div className="fr-mb-7w">
        <h2 className="fr-mb-1w">
          Comprendre : les objectifs de sobriété foncière
        </h2>
        <p className="fr-text--sm fr-mb-4w">
          En France, 24 000 ha d’espaces naturels, agricoles et forestiers (ENAF) ont été consommés en moyenne chaque année entre le 1er janvier 2011 et le 1er janvier 2021.
          La sobriété foncière vise à protéger les sols et leur
          rôle vital pour le climat, la biodiversité et l'agriculture, tout en
          permettant un développement durable des territoires. La{" "}
          <strong>loi Climat et Résilience</strong> fixe pour les territoires un
          objectif de réduction de la consommation d'ENAF et, à terme, d'équilibre entre artificialisation et désartificialisation.
        </p>

        <Timeline phases={[
            {
              badge: <Badge variant="primary">2011-2021</Badge>,
              title: "Période de référence",
              description:
                "La consommation d'ENAF de cette décennie sert de base pour calculer l'objectif de réduction.",
              content: <SyntheseConso landData={landData} urls={urls} phase="reference" />,
            },
            {
              badge: <Badge variant="primary">2021-2031</Badge>,
              title: "Période de réduction",
              description:
                "À l'échelle nationale, l'objectif est de diviser par deux la consommation d'ENAF par rapport à la période de référence.",
              content: <SyntheseConso landData={landData} urls={urls} phase="reduction" />,
            },
            {
              badge: <Badge variant="primary">2031-2050</Badge>,
              title: "Suivi de l’artificialisation nette des sols",
              description:
                "L'objectif est d’atteindre le « Zéro Artificialisation Nette » (ZAN) à l’horizon 2050.",
              content: <SyntheseArtif landData={landData} urls={urls} />,
            },
          ]} 
        />

      </div>

      <div className="fr-mb-7w">
        <h2 className="fr-mb-1w">Agir : Leviers de sobriété foncière</h2>
        <div className="fr-text--sm fr-mb-4w">
          Pour atteindre ces objectifs, plusieurs leviers d'action peuvent être
          identifiés sur votre territoire. Leur activation permet de réduire
          concrètement la consommation d'ENAF et l'artificialisation des sols.
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
