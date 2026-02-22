import React from "react";
import GenericChart from "@components/charts/GenericChart";
import { BivariateMapSection } from "./BivariateMapSection";

interface ConsoInseeProps {
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
  childLandTypes?: string[];
  childType?: string;
}

export const ConsoInsee: React.FC<ConsoInseeProps> = ({
  landId,
  landType,
  startYear,
  endYear,
  childLandTypes,
  childType,
}) => {
  const hasChildren = childLandTypes && childLandTypes.length > 0;
  const mapChildType = childType || (childLandTypes && childLandTypes[0]);
  const [rsYear, setRsYear] = React.useState("2022");

  return (
    <div className="fr-mt-7w">
      <h3 id="conso-insee">Indicateurs INSEE du territoire</h3>
      <p className="fr-text--sm fr-mb-3w">
        Les données ci-dessous sont issues du <strong>dossier complet INSEE</strong> et
        permettent de croiser les dynamiques territoriales (population, logement, emploi, etc.)
        avec la consommation d'espaces NAF.
      </p>

      {/* Population */}
      <h4 className="fr-mt-5w">Population</h4>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_population_evolution"
              land_id={landId}
              land_type={landType}
              sources={["insee"]}
              showDataTable={true}
            />
          </div>
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_population_pyramid"
              land_id={landId}
              land_type={landType}
              sources={["insee"]}
              showDataTable={true}
            />
          </div>
        </div>
      </div>

      {hasChildren && mapChildType && (
        <BivariateMapSection
          chartId="dc_population_conso_map"
          landId={landId}
          landType={landType}
          childLandType={mapChildType}
        />
      )}

      {/* Logement */}
      <h4 className="fr-mt-5w">Logement</h4>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_logement_parc"
              land_id={landId}
              land_type={landType}
              sources={["insee"]}
              showDataTable={true}
            />
          </div>
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_logement_construction"
              land_id={landId}
              land_type={landType}
              sources={["insee"]}
              showDataTable={true}
            />
          </div>
        </div>
      </div>

      {hasChildren && mapChildType && (
        <>
          <BivariateMapSection
            chartId="dc_logement_conso_map"
            landId={landId}
            landType={landType}
            childLandType={mapChildType}
          />
          <BivariateMapSection
            chartId="dc_vacance_conso_map"
            landId={landId}
            landType={landType}
            childLandType={mapChildType}
          />
        </>
      )}

      {hasChildren && mapChildType && (
        <div className="fr-mb-5w">
          <div className="bg-white fr-p-2w rounded">
            <GenericChart
              key={`dc_logement_vacant_map-${mapChildType}`}
              id="dc_logement_vacant_map"
              land_id={landId}
              land_type={landType}
              params={{ child_land_type: mapChildType }}
              sources={["insee"]}
              showDataTable={true}
              isMap={true}
            />
          </div>
        </div>
      )}

      {/* Residences secondaires */}
      <h4 className="fr-mt-5w">Résidences secondaires</h4>

      <div className="fr-mb-3w">
        <div className="bg-white fr-p-2w rounded">
          <GenericChart
            id="dc_residences_secondaires"
            land_id={landId}
            land_type={landType}
            sources={["insee"]}
            showDataTable={true}
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <div className="fr-mb-5w">
          <div className="bg-white fr-p-2w rounded">
            <div className="fr-mb-2w">
              {["2011", "2016", "2022"].map((y) => (
                <button
                  key={y}
                  className={`fr-btn ${rsYear === y ? "fr-btn--primary" : "fr-btn--tertiary"} fr-btn--sm fr-mr-1w`}
                  onClick={() => setRsYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
            <GenericChart
              key={`dc_residences_secondaires_map-${mapChildType}-${rsYear}`}
              id="dc_residences_secondaires_map"
              land_id={landId}
              land_type={landType}
              params={{ child_land_type: mapChildType, year: rsYear }}
              sources={["insee"]}
              showDataTable={true}
              isMap={true}
            />
          </div>
        </div>
      )}

      {/* Emploi et economie */}
      <h4 className="fr-mt-5w">Emploi et économie</h4>

      <div className="fr-grid-row fr-grid-row--gutters fr-mb-3w">
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_creations_entreprises"
              land_id={landId}
              land_type={landType}
              sources={["insee"]}
              showDataTable={true}
            />
          </div>
        </div>
        <div className="fr-col-12 fr-col-lg-6">
          <div className="bg-white fr-p-2w rounded h-100">
            <GenericChart
              id="dc_emploi_vs_conso"
              land_id={landId}
              land_type={landType}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["insee", "majic"]}
              showDataTable={true}
            />
          </div>
        </div>
      </div>

      {hasChildren && mapChildType && (
        <>
          <BivariateMapSection
            chartId="dc_emploi_conso_map"
            landId={landId}
            landType={landType}
            childLandType={mapChildType}
          />
          <BivariateMapSection
            chartId="dc_chomage_conso_map"
            landId={landId}
            landType={landType}
            childLandType={mapChildType}
          />
        </>
      )}

      {/* Menages */}
      <h4 className="fr-mt-5w">Ménages</h4>

      <div className="fr-mb-5w">
        <div className="bg-white fr-p-2w rounded">
          <GenericChart
            id="dc_menages_evolution"
            land_id={landId}
            land_type={landType}
            params={{
              start_date: String(startYear),
              end_date: String(endYear),
            }}
            sources={["insee", "majic"]}
            showDataTable={true}
          />
        </div>
      </div>

      {hasChildren && mapChildType && (
        <BivariateMapSection
          chartId="dc_menages_conso_map"
          landId={landId}
          landType={landType}
          childLandType={mapChildType}
        />
      )}

    </div>
  );
};
