import React from "react";
import Kpi from "@components/ui/Kpi";
import Triptych from "@components/ui/Triptych";
import { LandMillesimeTable } from "@components/features/ocsge/LandMillesimeTable";
import { formatNumber } from "@utils/formatUtils";
import { useArtificialisationContext } from "../context/ArtificialisationContext";

export const ArtifKpiCards: React.FC = () => {
  const {
    name,
    millesimes,
    isInterdepartemental,
    landArtifStockIndex,
    landArtifFluxIndex,
  } = useArtificialisationContext();

  const artifNettePeriodText = isInterdepartemental
    ? `Entre le millésime n°${landArtifStockIndex.millesime_index - 1} et le millésime n°${landArtifStockIndex.millesime_index}`
    : `Entre ${landArtifStockIndex.flux_previous_years?.[0] ?? "–"} et ${landArtifStockIndex.years?.[0] ?? "–"}`;

  const artifNetteFooterMetrics: [{ icon: string; label: string; value: string }, { icon: string; label: string; value: string }] = [
    { icon: "bi bi-plus-lg", label: "Artificialisation", value: landArtifFluxIndex != null ? `${formatNumber({ number: landArtifFluxIndex.flux_artif })} ha` : "–" },
    { icon: "bi bi-dash-lg", label: "Désartificialisation", value: landArtifFluxIndex != null ? `${formatNumber({ number: landArtifFluxIndex.flux_desartif })} ha` : "–" },
  ];

  const millesimeLabel = isInterdepartemental
    ? `Millésime n°${landArtifStockIndex.millesime_index}`
    : String(landArtifStockIndex.years?.[0] ?? "–");

  const surfacesArtifFooterMetrics: [{ icon: string; label: string; value: string }, { icon: string; label: string; value: string }] = [
    { icon: "bi bi-percent", label: "Part du territoire", value: `${formatNumber({ number: landArtifStockIndex.percent })} %` },
    { icon: "bi bi-calendar3", label: "Millésime", value: millesimeLabel },
  ];

  return (
    <div className="fr-mb-5w">
      <Triptych
        className="fr-mb-5w"
        definition={{
          content: (
            <>
              <p>L'artificialisation est définie dans l'<a href="https://www.legifrance.gouv.fr/jorf/article_jo/JORFARTI000043957221" target="_blank" rel="noopener noreferrer">article 192 de la loi Climat et Résilience</a> comme «<strong>l'altération durable de tout ou partie des fonctions écologiques d'un sol</strong>, en particulier de ses fonctions biologiques, hydriques et climatiques, ainsi que de son potentiel agronomique par son occupation ou son usage.»</p>
              <p>Elle entraîne une perte de biodiversité, réduit la capacité des sols à absorber l'eau et contribue au réchauffement climatique.</p>
            </>
          ),
        }}
        donnees={{
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
          content: (
            <>
              <p>Afin de préserver les sols naturels, agricoles et forestiers, la loi Climat et Résilience fixe à partir de 2031 un cap clair : <strong>atteindre l'équilibre entre les surfaces artificialisées et désartificialisées</strong>, c'est-à-dire un objectif de « zéro artificialisation nette » des sols, à horizon 2050.</p>
            </>
          ),
        }}
      />
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          <Kpi
            icon="bi bi-buildings"
            label="Artificialisation nette"
            description={`${artifNettePeriodText}`}
            value={<>{formatNumber({ number: landArtifStockIndex.flux_surface, addSymbol: true })} <span>ha</span></>}
            variant="error"
            badge="Donnée clé"
            footer={{
              type: "metric",
              items: artifNetteFooterMetrics,
            }}
          />
        </div>
        <div className="fr-col-12 fr-col-md-6">
          <Kpi
            icon="bi bi-buildings"
            label="Surfaces artificialisées"
            value={<>{formatNumber({ number: landArtifStockIndex.surface })} <span>ha</span></>}
            variant="default"
            footer={{
              type: "metric",
              items: surfacesArtifFooterMetrics,
            }}
          />
        </div>
      </div>
    </div>
  );
};
