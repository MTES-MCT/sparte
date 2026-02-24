import React from "react";
import Kpi from "@components/ui/Kpi";
import GenericChart from "@components/charts/GenericChart";
import { LandDetailResultType } from "@services/types/land";
import { formatNumber } from "@utils/formatUtils";
import { ConsommationControls } from "./components/ConsommationControls";
import { ConsoDemography } from "./components/ConsoDemography";
import { ConsoInsee } from "./components/ConsoInsee";
import { ConsoComparison } from "./components/ConsoComparison";
import { useConsoData, useNearestTerritories, useComparisonTerritories } from "./hooks";
import { ComparisonLand, UserLandPreferenceResultType } from "@services/types/project";
import { ConsommationControlsProvider, useConsommationControls } from "./context/ConsommationControlsContext";
import { TopBarContent } from "@components/layout/TopBarContent";
import Loader from "@components/ui/Loader";
import { CarroyageLeaMap } from "@components/map";
import Triptych from "@components/ui/Triptych";
import Feedback from "@components/ui/Feedback";

interface ConsommationProps {
  landData: LandDetailResultType;
  preference?: UserLandPreferenceResultType;
}

const DetailsCalculationFichiersFonciers: React.FC = () => (
  <div>
    <h6 className="fr-mb-0">Calcul</h6>
    <p className="fr-text--xs fr-mb-0">Données brutes, sans calcul</p>
  </div>
);

const ConsommationContent: React.FC<ConsommationProps> = ({ landData, preference }) => {
  const { land_id, land_type, name, child_land_types } = landData || {};

  const {
    startYear,
    endYear,
    childType,
    setChildType,
    consoCardRef,
    populationCardRef,
    landTypeLabels: LAND_TYPE_LABELS,
    totalConsoHa,
    populationEvolution,
    populationEvolutionPercent,
    isLoadingConso,
    isLoadingPop,
  } = useConsommationControls();

  const { populationDensity, populationStock } = useConsoData(land_id, land_type, startYear, endYear);

  const { territories: nearestTerritories } = useNearestTerritories(land_id, land_type);

  const defaultTerritories: ComparisonLand[] = React.useMemo(
    () => nearestTerritories.map((t) => ({
      land_type: t.land_type,
      land_id: t.land_id,
      name: t.name,
    })),
    [nearestTerritories]
  );

  const {
    territories,
    comparisonLandIds,
    isDefaultSelection,
    excludedTerritories,
    handleAddTerritory,
    handleRemoveTerritory,
    handleResetTerritories,
  } = useComparisonTerritories(land_id, land_type, name, {
    landId: land_id,
    landType: land_type,
    comparisonLands: preference?.comparison_lands ?? [],
    defaultTerritories,
  });
  if (!landData) {
    return (
      <div role="status" aria-live="polite">
        Données non disponibles
      </div>
    );
  }

  return (
    <>
      {/* Enregistre les contrôles dans la TopBar de manière déclarative */}
      <TopBarContent>
        <ConsommationControls />
      </TopBarContent>

      <div className="fr-container--fluid fr-p-3w">
        <Triptych
          className="fr-mb-5w"
          definition={{
            preview: "La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme « la création ou l'extension effective d'espaces urbanisés sur le territoire concerné » (article 194 de la loi Climat et résilience).",
            content: (
              <>
                <p>La consommation d'espaces NAF (Naturels, Agricoles et Forestiers) est entendue comme <strong>« la création ou l'extension effective d'espaces urbanisés sur le territoire concerné »</strong> (article 194 de la loi Climat et résilience).</p>
                <p>Cet article exprime le fait que le caractère urbanisé d'un espace est la traduction de l'usage qui en est fait. Un espace urbanisé n'est plus un espace d'usage NAF (Naturel, Agricole et Forestier).</p>
                <p>Si l'artificialisation des sols traduit globalement un changement de couverture physique, la consommation traduit un changement d'usage. À titre d'exemple, un bâtiment agricole artificialise mais ne consomme pas.</p>
              </>
            ),
          }}
          donnees={{
            preview: "Les données de consommation d'espaces NAF publiées sur Mon Diagnostic Artificialisation sont produites par le CEREMA à partir des données d'évolution des fichiers fonciers.",
            content: (
              <>
                <p>Les données de consommation d'espaces NAF publiées sur Mon Diagnostic Artificialisation sont produites par le <strong>CEREMA</strong> à partir des données d'évolution des <strong>fichiers fonciers</strong>.</p>
                <p>Ces données sont disponibles à l'échelle de la commune.</p>
                <p>Le dernier millésime (2023) correspond à la photographie du territoire au 1er janvier 2024, et intègre les évolutions réalisées au cours de l'année 2023.</p>
              </>
            ),
          }}
          cadreReglementaire={{
            preview: "La loi Climat et Résilience, adoptée en 2021, engage la France à limiter la consommation d'espaces naturels, agricoles et forestiers (NAF), entendue comme leur transformation en espaces urbanisés.",
            content: (
              <>
                <p>La loi Climat et Résilience, adoptée en 2021, engage la France à <strong>limiter la consommation d'espaces naturels, agricoles et forestiers</strong> (NAF), entendue comme leur transformation en espaces urbanisés.</p>
                <p>Plus précisément, elle fixe à l'échelle nationale l'objectif de <strong>réduire de moitié cette consommation sur la période 2021-2031</strong>, par rapport à la décennie 2011-2021.</p>
              </>
            ),
          }}
        />
      <div>
        <h3 id="conso-annuelle">Évolution annuelle et répartition de la consommation d'espaces NAF</h3>

        <div className="fr-grid-row fr-grid-row--gutters fr-mb-5w">
          <div className="fr-col-12 fr-col-lg-4" ref={consoCardRef}>
            <Kpi
              icon="bi-bar-chart"
              label="Consommation d'espaces"
              value={
                isLoadingConso || totalConsoHa === null ? <Loader size={32} /> : <>{formatNumber({ number: totalConsoHa, addSymbol: true })} <span>ha</span></>
              }
              variant="error"
              badge="Donnée clé"
              footer={{
                type: "period",
                periods: [
                  { label: String(startYear), active: true },
                  { label: String(endYear) },
                ],
              }}
            />
          </div>
          <div className="fr-col-12 fr-col-lg-8">
            <GenericChart
              id="annual_total_conso_chart"
              land_id={land_id}
              land_type={land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
                ...(childType && { child_type: childType }),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <DetailsCalculationFichiersFonciers />
            </GenericChart>
          </div>
        </div>

        <h3 id="conso-determinants">Répartition de la consommation d'espaces NAF par destination</h3>

        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-lg-6">
            <GenericChart
              id="pie_determinant"
              land_id={land_id}
              land_type={land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <DetailsCalculationFichiersFonciers />
            </GenericChart>
          </div>
          <div className="fr-col-12 fr-col-lg-6">
            <GenericChart
              id="chart_determinant"
              land_id={land_id}
              land_type={land_type}
              params={{
                start_date: String(startYear),
                end_date: String(endYear),
              }}
              sources={["majic"]}
              showDataTable={true}
            >
              <DetailsCalculationFichiersFonciers />
            </GenericChart>
          </div>
        </div>

      </div>

      {child_land_types && child_land_types.length > 0 && (
        <div className="fr-mb-7w fr-mt-5w">
          <h3 id="conso-map">Cartes de consommation d'espaces</h3>

          {child_land_types.length > 1 && (
            <div className="fr-mb-3w">
              {child_land_types.map((child_land_type) => (
                <button
                  key={child_land_type}
                  className={`fr-btn ${
                    childType === child_land_type
                      ? "fr-btn--primary"
                      : "fr-btn--tertiary"
                  } fr-btn--sm fr-mr-1w`}
                  style={childType !== child_land_type ? { backgroundColor: "white" } : undefined}
                  onClick={() => setChildType(child_land_type)}
                >
                  {LAND_TYPE_LABELS[child_land_type] || child_land_type}
                </button>
              ))}
            </div>
          )}

          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-lg-6">
              <GenericChart
                key={`conso_map_relative-${childType}-${startYear}-${endYear}`}
                id="conso_map_relative"
                land_id={land_id}
                land_type={land_type}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                  child_land_type: childType,
                }}
                sources={["majic"]}
                showDataTable={true}
                isMap={true}
              >
                <div>
                  <h6 className="fr-mb-0">Comprendre la carte</h6>
                  <p className="fr-text--xs fr-mb-0">
                    Cette carte permet de visualiser la consommation d'espaces NAF relative à la surface de chaque territoire, représentée par l'intensité de la couleur : plus la teinte est foncée, plus la consommation d'espaces est importante par rapport à la surface du territoire.
                  </p>
                  <h6 className="fr-mb-0 fr-mt-2w">Source</h6>
                  <p className="fr-text--xs fr-mb-0">
                    Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                  </p>
                </div>
              </GenericChart>
            </div>

            <div className="fr-col-12 fr-col-lg-6">
              <GenericChart
                key={`conso_map_bubble-${childType}-${startYear}-${endYear}`}
                id="conso_map_bubble"
                land_id={land_id}
                land_type={land_type}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                  child_land_type: childType,
                }}
                sources={["majic"]}
                showDataTable={true}
                isMap={true}
              >
                <div>
                  <h6 className="fr-mb-0">Comprendre la carte</h6>
                  <p className="fr-text--xs fr-mb-0">
                    Cette carte permet de visualiser les flux de consommation d'espaces NAF par territoire : la taille des cercles est proportionnelle à la consommation totale d'espaces sur la période sélectionnée.
                  </p>
                  <h6 className="fr-mb-0 fr-mt-2w">Source</h6>
                  <p className="fr-text--xs fr-mb-0">
                    Les données proviennent des <strong>fichiers fonciers</strong> (Cerema, d'après DGFiP).
                  </p>
                </div>
              </GenericChart>
            </div>
          </div>

        </div>
      )}

      <div className="fr-mb-7w fr-mt-5w">
        <h3 id="conso-carroyage">Carroyage de la consommation d'espaces</h3>
        <p className="fr-text--sm fr-mb-2w">
          Cette carte utilise un <strong>carroyage de 1 km x 1 km</strong> afin
          de <strong>respecter le secret statistique</strong> tout en permettant de localiser la consommation d'espaces NAF.
          Cette représentation ne reflète pas la forme exacte des parcelles consommées et un même carreau peut chevaucher plusieurs communes.
          Les valeurs affichées sont donc des approximations liées à ce maillage, mais permettent toutefois d'identifier les secteurs les plus consommateurs du territoire.
        </p>
        <div className="fr-alert fr-alert--warning fr-alert--sm fr-mb-2w">
          <p className="fr-text--sm fr-mb-0">
            Seules les données ayant pu être géolocalisées sont présentes dans les données carroyées.
            Le total affiché ici peut donc être <strong>différent de celui du territoire</strong>.
          </p>
        </div>

        {child_land_types && child_land_types.length > 1 && (
          <div className="fr-mb-2w">
            {child_land_types.map((child_land_type) => (
              <button
                key={child_land_type}
                className={`fr-btn ${
                  childType === child_land_type
                    ? "fr-btn--primary"
                    : "fr-btn--tertiary"
                } fr-btn--sm fr-mr-1w`}
                style={childType !== child_land_type ? { backgroundColor: "white" } : undefined}
                onClick={() => setChildType(child_land_type)}
              >
                {LAND_TYPE_LABELS[child_land_type] || child_land_type}
              </button>
            ))}
          </div>
        )}

        <CarroyageLeaMap landData={landData} startYear={startYear} endYear={endYear} childLandType={childType} />

      </div>

      <ConsoDemography
        landId={land_id}
        landType={land_type}
        landName={name}
        startYear={startYear}
        endYear={endYear}
        populationEvolution={populationEvolution}
        populationEvolutionPercent={populationEvolutionPercent}
        populationDensity={populationDensity}
        populationStock={populationStock}
        isLoadingPop={isLoadingPop}
        populationCardRef={populationCardRef}
        childLandTypes={child_land_types}
        childType={childType}
        onChildLandTypeChange={setChildType}
      />

      <ConsoInsee
        landId={land_id}
        landType={land_type}
        landName={name}
        startYear={startYear}
        endYear={endYear}
        childLandTypes={child_land_types}
        childType={childType}
        onChildLandTypeChange={setChildType}
        logements={landData.logements_22}
        evolutionLogementsPercent={landData.evolution_logements_percent}
        evolutionLogementsAbsolute={landData.evolution_logements_absolute}
        densiteLogements={landData.densite_logements}
        emplois={landData.emplois_22}
        evolutionEmploisPercent={landData.evolution_emplois_percent}
        evolutionEmploisAbsolute={landData.evolution_emplois_absolute}
        densiteEmplois={landData.densite_emplois}
      />

      <ConsoComparison
        landId={land_id}
        landType={land_type}
        landName={name}
        startYear={startYear}
        endYear={endYear}
        territories={territories}
        excludedTerritories={excludedTerritories}
        comparisonLandIds={comparisonLandIds}
        isDefaultSelection={isDefaultSelection}
        onAddTerritory={handleAddTerritory}
        onRemoveTerritory={handleRemoveTerritory}
        onReset={handleResetTerritories}
      />
      <div className="fr-mt-5w">
        <Feedback />
      </div>
      </div>
    </>
  );
};

export const Consommation: React.FC<ConsommationProps> = ({ landData, preference }) => {
  const { land_id, land_type, child_land_types } = landData || {};

  return (
    <ConsommationControlsProvider
      land_id={land_id}
      land_type={land_type}
      childLandTypes={child_land_types}
    >
      <ConsommationContent landData={landData} preference={preference} />
    </ConsommationControlsProvider>
  );
};
