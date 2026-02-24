import React from "react";
import { LandDetailResultType } from "@services/types/land";
import Triptych from "@components/ui/Triptych";
import Feedback from "@components/ui/Feedback";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { ArtificialisationProvider, useArtificialisationContext } from "./context/ArtificialisationContext";
import {
  ArtifKpiCards,
  ArtifNetFlux,
  ArtifZonage,
  ArtifRepartition,
  ArtifFluxDetail,
  ArtifChildLands,
  ArtifExplorer,
  ArtifCalculation,
} from "./components";

interface ArtificialisationProps {
  landData: LandDetailResultType;
}

const ArtificialisationContent: React.FC = () => {
  const { isLoading, error, name, millesimes, isInterdepartemental } = useArtificialisationContext();

  if (isLoading) {
    return <div role="status" aria-live="polite">Chargement...</div>;
  }

  if (error) {
    return <div role="alert" aria-live="assertive">Erreur : {String(error)}</div>;
  }

  return (
    <div className="fr-container--fluid fr-p-3w">
      <Triptych
        className="fr-mb-5w"
        definition={{
          preview: "L'artificialisation est définie dans l'article 192 de la loi Climat et Résilience comme «l'altération durable de tout ou partie des fonctions écologiques d'un sol, en particulier de ses fonctions biologiques, hydriques et climatiques, ainsi que de son potentiel agronomique par son occupation ou son usage.»",
          content: (
            <>
              <p>L'artificialisation est définie dans l'<a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957221" target="_blank" rel="noopener noreferrer">article 192 de la loi Climat et Résilience</a> comme «<strong>l'altération durable de tout ou partie des fonctions écologiques d'un sol</strong>, en particulier de ses fonctions biologiques, hydriques et climatiques, ainsi que de son potentiel agronomique par son occupation ou son usage.»</p>
              <p>Elle entraîne une perte de biodiversité, réduit la capacité des sols à absorber l'eau et contribue au réchauffement climatique.</p>
            </>
          ),
        }}
        donnees={{
          preview: "La mesure de l'artificialisation d'un territoire repose sur la donnée OCS GE (Occupation du Sol à Grande Échelle), base de données de référence pour la description de l'occupation du sol.",
          content: (
            <>
              <p>La mesure de l'artificialisation d'un territoire repose sur la donnée <strong>OCS GE (Occupation du Sol à Grande Échelle)</strong>, base de données de référence pour la description de l'occupation du sol.</p>
              <p>Cette donnée est produite par l'IGN tous les 3 ans pour chaque département. Chaque production est appelée un millésime.</p>
              <LandMillesimeTable millesimes={millesimes} territory_name={name} is_interdepartemental={isInterdepartemental} compact />
              <p>Ces données sont disponibles en téléchargement sur le site de l'IGN : <a href="https://geoservices.ign.fr/artificialisation-ocs-ge#telechargement" target="_blank" rel="noopener noreferrer">geoservices.ign.fr</a></p>
            </>
          ),
        }}
        cadreReglementaire={{
          preview: "Afin de préserver les sols naturels, agricoles et forestiers, la loi Climat et Résilience fixe à partir de 2031 un cap clair : atteindre l'équilibre entre les surfaces artificialisées et désartificialisées, c'est-à-dire un objectif de « zéro artificialisation nette » des sols, à horizon 2050.",
          content: (
            <>
              <p>Afin de préserver les sols naturels, agricoles et forestiers, la loi Climat et Résilience fixe à partir de 2031 un cap clair : <strong>atteindre l'équilibre entre les surfaces artificialisées et désartificialisées</strong>, c'est-à-dire un objectif de « zéro artificialisation nette » des sols, à horizon 2050.</p>
            </>
          ),
        }}
      />
      <ArtifKpiCards />
      <ArtifNetFlux />
      <ArtifZonage />
      <ArtifRepartition />
      <ArtifFluxDetail />
      <ArtifChildLands />
      <ArtifExplorer />
      <ArtifCalculation />
      <Feedback />
    </div>
  );
};

export const Artificialisation: React.FC<ArtificialisationProps> = ({ landData }) => {
  if (!landData) {
    return <div role="status" aria-live="polite">Données non disponibles</div>;
  }

  return (
    <ArtificialisationProvider landData={landData}>
      <ArtificialisationContent />
    </ArtificialisationProvider>
  );
};
