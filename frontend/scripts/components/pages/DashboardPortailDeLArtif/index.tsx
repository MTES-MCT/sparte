import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import GenericChart from '@components/charts/GenericChart';
import { CarroyageLeaMap } from '@components/map';
import { OcsgeObjectMap } from '@components/map/ui/OcsgeObjectMap';
import { ArtificialisationDiffMap } from '@components/map/ui/ArtificialisationDiffMap';
import { ZonageUrbanismeMap } from '@components/map/ui/ZonageUrbanismeMap';
import PeriodSelector from '@components/ui/PeriodSelector';
import Button from '@components/ui/Button';
import Kpi from '@components/ui/Kpi';
import Loader from '@components/ui/Loader';
import { formatNumber } from '@utils/formatUtils';
import { useConsoData } from '@components/pages/Consommation/hooks';
import { useGetLandQuery, useGetCarroyageDestinationConfigQuery, useGetLandArtifFluxIndexQuery } from '@services/api';
import { LandMillesimeTable } from '@components/features/ocsge/LandMillesimeTable';
import { LAND_TYPE_LABELS } from '@components/pages/Consommation/context/ConsommationControlsContext';

const ChartSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ChartRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ChartColumn = styled.div<{ $flex?: string }>`
  flex: ${({ $flex }) => $flex || '1'};
  min-width: 0;
`;

const ColorDot = styled.span<{ $color: string; $active: boolean }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  margin-right: 6px;
  vertical-align: middle;
  border: 1px solid ${({ $active }) => ($active ? 'white' : '#ccc')};
`;

const ButtonSeparator = styled.span`
  display: inline-block;
  width: 1px;
  height: 24px;
  background-color: #ccc;
  vertical-align: middle;
`;

const DEFAULT_LAND_ID = '84';
const DEFAULT_LAND_TYPE = 'REGION';
const MIN_YEAR = 2009;
const MAX_YEAR = 2023;
const DEFAULT_START_YEAR = 2011;
const DEFAULT_END_YEAR = 2023;

const DROM_COM = [
  { id: '971', name: 'Guadeloupe', landType: 'DEPART' },
  { id: '972', name: 'Martinique', landType: 'DEPART' },
  { id: '973', name: 'Guyane', landType: 'DEPART' },
  { id: '974', name: 'La Réunion', landType: 'DEPART' },
];

const DROM_CHILD_TYPES = ['SCOT', 'EPCI', 'COMM'];

const DashboardPortailDeLArtif: React.FC = () => {
  const landId = DEFAULT_LAND_ID;
  const landType = DEFAULT_LAND_TYPE;
  const [startYear, setStartYear] = useState(DEFAULT_START_YEAR);
  const [endYear, setEndYear] = useState(DEFAULT_END_YEAR);
  const [selectedChildType, setSelectedChildType] = useState<string | undefined>(undefined);

  const { data: landData, isLoading: isLoadingLand } = useGetLandQuery({ land_id: landId, land_type: landType });
  const { totalConsoHa, isLoadingConso } = useConsoData(landId, landType, startYear, endYear);

  const conso2011_2020 = landData?.conso_details?.conso_2011_2020 ?? 0;
  const consoSince2021 = landData?.conso_details?.conso_since_2021 ?? 0;
  const annualConsoSince2021 = landData?.conso_details?.annual_conso_since_2021 ?? 0;

  const childLandTypes = landData?.child_land_types ?? [];
  const childLandType = selectedChildType && childLandTypes.includes(selectedChildType)
    ? selectedChildType
    : childLandTypes[0];
  const dromChildLandType = childLandType && DROM_CHILD_TYPES.includes(childLandType) ? childLandType : 'COMM';

  const defaultStockIndex = landData?.millesimes_by_index?.length
    ? Math.max(...landData.millesimes_by_index.map(e => e.index))
    : 2;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const artifIndex = selectedIndex ?? defaultStockIndex;

  const { data: landArtifFluxIndexList } = useGetLandArtifFluxIndexQuery(
    { land_type: landType, land_id: landId, millesime_new_index: artifIndex, millesime_old_index: artifIndex - 1 },
    { skip: !landId || artifIndex < 1 }
  );
  const landArtifFluxIndex = landArtifFluxIndexList?.[0] ?? null;

  const hasChangedFromDefault = startYear !== DEFAULT_START_YEAR || endYear !== DEFAULT_END_YEAR;
  const handleResetPeriod = () => { setStartYear(DEFAULT_START_YEAR); setEndYear(DEFAULT_END_YEAR); };

  const [selectedDestination, setSelectedDestination] = useState('total');
  const { data: destinationConfig } = useGetCarroyageDestinationConfigQuery(undefined);
  const [activeTab, setActiveTab] = useState<'conso' | 'artif'>('conso');
  const handleTabChange = (tab: 'conso' | 'artif') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const titleRef = useRef<HTMLHeadingElement>(null);
  const [titleHidden, setTitleHidden] = useState(false);

  useEffect(() => {
    if (!titleRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setTitleHidden(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ position: 'relative', padding: '2rem 1rem' }}>
      {/* Titre fixe top-left */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        left: '1.5rem',
        zIndex: 10,
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#333',
        maxWidth: '220px',
        lineHeight: 1.3,
        opacity: titleHidden ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: titleHidden ? 'auto' : 'none',
      }}>
        Synthèse nationale de la consommation d'espaces et d'artificialisation des sols
      </div>

      {/* Contrôles à gauche */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '1.5rem',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        zIndex: 10,
      }}>
        {activeTab === 'conso' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#666' }}>
              <i className="bi bi-calendar3 fr-mr-1v" />Période
            </span>
            <PeriodSelector
              startYear={startYear}
              endYear={endYear}
              minYear={MIN_YEAR}
              maxYear={MAX_YEAR}
              onStartYearChange={setStartYear}
              onEndYearChange={setEndYear}
            />
            {hasChangedFromDefault && (
              <Button
                onClick={handleResetPeriod}
                variant="secondary"
                size="sm"
                icon="bi bi-arrow-clockwise"
                title={`Réinitialiser à ${DEFAULT_START_YEAR}-${DEFAULT_END_YEAR}`}
              />
            )}
          </div>
        )}
        {childLandTypes.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#666' }}>
              <i className="bi bi-grid-3x3-gap fr-mr-1v" />Maille
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {childLandTypes.map((type) => (
                <Button
                  key={type}
                  variant={childLandType === type ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedChildType(type)}
                >
                  {LAND_TYPE_LABELS[type] || type}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>
        <h1 ref={titleRef} style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Synthèse nationale de la consommation d'espaces et d'artificialisation des sols
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '2px solid #eee', marginBottom: '2rem', position: 'sticky', top: 0, background: '#fff', zIndex: 5, paddingTop: '0.5rem' }}>
          <button
            onClick={() => handleTabChange('conso')}
            style={{
              padding: '0.75rem 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: activeTab === 'conso' ? 700 : 400,
              color: activeTab === 'conso' ? 'var(--background-active-blue-france)' : '#666',
              borderBottom: activeTab === 'conso' ? '2px solid var(--background-active-blue-france)' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            <i className="bi bi-bar-chart-line fr-mr-1v" />
            Consommation d'espaces NAF
            <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem', opacity: 0.7 }}>2021–2031</span>
          </button>
          <button
            onClick={() => handleTabChange('artif')}
            style={{
              padding: '0.75rem 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: activeTab === 'artif' ? 700 : 400,
              color: activeTab === 'artif' ? 'var(--background-active-blue-france)' : '#666',
              borderBottom: activeTab === 'artif' ? '2px solid var(--background-active-blue-france)' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            <i className="bi bi-hexagon fr-mr-1v" />
            Artificialisation des sols
            <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem', opacity: 0.7 }}>2031–2050</span>
          </button>
        </div>

      {/* Section Consommation */}
      {activeTab === 'conso' && (
        <section>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
            <Kpi
              icon="bi-bar-chart"
              label="Consommation totale"
              value={
                isLoadingConso || totalConsoHa === null ? (
                  <Loader size={20} />
                ) : (
                  <>{formatNumber({ number: totalConsoHa, addSymbol: true })} <span>ha</span></>
                )
              }
              description={isLoadingConso || totalConsoHa === null ? undefined : `${formatNumber({ number: totalConsoHa / (endYear - startYear) })} ha/an`}
              variant="default"
              compact
              footer={{ type: "period", from: String(startYear), to: String(endYear) }}
            />
            <Kpi
              icon="bi-clock-history"
              label="Période de référence"
              value={
                isLoadingLand ? (
                  <Loader size={20} />
                ) : (
                  <>{formatNumber({ number: conso2011_2020 })} <span>ha</span></>
                )
              }
              description={isLoadingLand ? undefined : `${formatNumber({ number: conso2011_2020 / 10 })} ha/an`}
              variant="default"
              compact
              footer={{ type: "period", from: "2011", to: "2020" }}
            />
            <Kpi
              icon="bi-calendar-check"
              label="Depuis 2021"
              value={
                isLoadingLand ? (
                  <Loader size={20} />
                ) : (
                  <>{formatNumber({ number: consoSince2021 })} <span>ha</span></>
                )
              }
              description={isLoadingLand ? undefined : `${formatNumber({ number: annualConsoSince2021 })} ha/an`}
              variant="default"
              compact
              footer={{ type: "period", from: "2021" }}
            />
          </div>

          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Nulla facilisi. Cras accumsan vestibulum ante. Proin semper, leo vitae faucibus aliquet, velit urna auctor neque, at porttitor nunc nisi sed arcu. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum.
          </p>

          <ChartSection>
            <GenericChart
              id="chart_determinant"
              land_id={landId}
              land_type={landType}
              params={{ start_date: String(startYear), end_date: String(endYear) }}
              sources={['majic']}
              showDataTable={false}
            />
          </ChartSection>

          <ChartRow>
            <ChartColumn>
              <GenericChart
                id="pie_determinant"
                land_id={landId}
                land_type={landType}
                params={{ start_date: String(startYear), end_date: String(endYear) }}
                sources={['majic']}
                showDataTable={false}
              />
            </ChartColumn>
            <ChartColumn>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula.
              </p>
            </ChartColumn>
          </ChartRow>

          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Donec velit neque, auctor sit amet aliquam vel. Proin gravida hendrerit lectus a molestie. Morbi vestibulum volutpat enim. Fusce neque nulla, posuere a nibh quis, finibus consequat urna.
          </p>

          {childLandType && (
            <ChartSection>
              <GenericChart
                id="conso_map_relative"
                land_id={landId}
                land_type={landType}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                  child_land_type: childLandType,
                }}
                sources={['majic']}
                isMap={true}
                showToolbar={false}
              />
            </ChartSection>
          )}

          <ChartRow style={{ flexWrap: 'wrap' }}>
            {DROM_COM.map((dom) => (
              <ChartColumn key={`relative-${dom.id}`} $flex="0 0 calc(50% - 0.5rem)">

                <GenericChart
                  id="conso_map_relative"
                  land_id={dom.id}
                  land_type={dom.landType}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: dromChildLandType,
                  }}
                  sources={['majic']}
                  isMap={true}
                  showToolbar={false}
                />
              </ChartColumn>
            ))}
          </ChartRow>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.5rem' }}>
            Dynamiques socio-économiques
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris mollis semper velit, vel scelerisque nibh fermentum a. Integer lacinia sollicitudin massa, nec vehicula arcu dignissim ut.
          </p>

          <ChartSection>
            <GenericChart
              id="population_conso_progression_chart"
              land_id={landId}
              land_type={landType}
              params={{ start_date: String(startYear), end_date: String(endYear) }}
              sources={['majic', 'insee']}
              showDataTable={false}
            />
          </ChartSection>


          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus magna justo, lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Donec rutrum congue leo eget malesuada.
          </p>

          {childLandType && (
            <ChartSection>
              <GenericChart
                id="conso_map_bubble"
                land_id={landId}
                land_type={landType}
                params={{
                  start_date: String(startYear),
                  end_date: String(endYear),
                  child_land_type: childLandType,
                }}
                sources={['majic']}
                isMap={true}
                showToolbar={false}
              />
            </ChartSection>
          )}

          <ChartRow style={{ flexWrap: 'wrap' }}>
            {DROM_COM.map((dom) => (
              <ChartColumn key={`bubble-${dom.id}`} $flex="0 0 calc(50% - 0.5rem)">

                <GenericChart
                  id="conso_map_bubble"
                  land_id={dom.id}
                  land_type={dom.landType}
                  params={{
                    start_date: String(startYear),
                    end_date: String(endYear),
                    child_land_type: dromChildLandType,
                  }}
                  sources={['majic']}
                  isMap={true}
                  showToolbar={false}
                />
              </ChartColumn>
            ))}
          </ChartRow>

          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Donec sollicitudin molestie malesuada. Nulla quis lorem ut libero malesuada feugiat. Praesent sapien massa, convallis a pellentesque nec. Sed lectus donec ut volutpat nisl, eget varius sem. Aenean massa lorem, blandit vel sapien vitae, condimentum ultricies magna.
          </p>

          {destinationConfig && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'white', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', width: 'fit-content', marginBottom: '1rem' }}>
              {Object.keys(destinationConfig).map((dest, index) => (
                <React.Fragment key={dest}>
                  {index === 1 && <ButtonSeparator />}
                  <Button
                    variant={selectedDestination === dest ? 'primary' : 'tertiary'}
                    size="sm"
                    onClick={() => setSelectedDestination(dest)}
                  >
                    <ColorDot $color={destinationConfig[dest].color} $active={selectedDestination === dest} />
                    {destinationConfig[dest].label}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          )}

          {landData && childLandType && (
            <ChartSection>
              <CarroyageLeaMap
                landData={landData}
                startYear={startYear}
                endYear={endYear}
                selectedDestination={selectedDestination}
                childLandType={childLandType}
              />
            </ChartSection>
          )}

        </section>
      )}

      {/* Section Artificialisation */}
      {activeTab === 'artif' && (
        <section>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Fusce vel dui sed est fringilla sodales. Quisque aliquet nulla eu diam tempor gravida. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh. Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <Kpi
              icon="bi-arrow-up-right"
              label="Artificialisation"
              value={landArtifFluxIndex ? <>{formatNumber({ number: landArtifFluxIndex.flux_artif })} <span>ha</span></> : <Loader size={20} />}
              variant="error"
              compact
            />
            <Kpi
              icon="bi-arrow-down-left"
              label="Désartificialisation"
              value={landArtifFluxIndex ? <>{formatNumber({ number: landArtifFluxIndex.flux_desartif })} <span>ha</span></> : <Loader size={20} />}
              variant="success"
              compact
            />
            <Kpi
              icon="bi-activity"
              label="Solde net"
              value={landArtifFluxIndex ? <>{formatNumber({ number: landArtifFluxIndex.flux_artif_net, addSymbol: true })} <span>ha</span></> : <Loader size={20} />}
              variant="default"
              compact
            />
          </div>

          {landData?.millesimes && landData.millesimes.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <LandMillesimeTable
                millesimes={landData.millesimes}
                is_interdepartemental={landData.is_interdepartemental}
              />
            </div>
          )}

          {childLandType && (
            <ChartSection>
              <GenericChart
                key={`artif-map-${landId}-${childLandType}-${artifIndex}`}
                id="artif_map"
                land_id={landId}
                land_type={landType}
                params={{
                  index: artifIndex,
                  previous_index: artifIndex - 1,
                  child_land_type: childLandType,
                }}
                sources={['ocsge']}
                isMap={true}
                showToolbar={false}
              />
            </ChartSection>
          )}

          <ChartRow style={{ flexWrap: 'wrap' }}>
            {DROM_COM.map((dom) => (
              <ChartColumn key={`artif-${dom.id}`} $flex="0 0 calc(50% - 0.5rem)">
                <GenericChart
                  id="artif_map"
                  land_id={dom.id}
                  land_type={dom.landType}
                  params={{
                    index: artifIndex,
                    previous_index: artifIndex - 1,
                    child_land_type: dromChildLandType,
                  }}
                  sources={['ocsge']}
                  isMap={true}
                  showToolbar={false}
                />
              </ChartColumn>
            ))}
          </ChartRow>

          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Etiam ultricies nisi vel augue. Suspendisse potenti. Nam at tortor in tellus interdum sagittis. Aliquam augue quam, sollicitudin vitae, consectetuer eget, rutrum at, lorem. Integer tincidunt ante vel ipsum.
          </p>

          <ChartSection>
            <GenericChart
              id="artif_net_flux"
              land_id={landId}
              land_type={landType}
              params={{
                millesime_new_index: artifIndex,
                millesime_old_index: artifIndex - 1,
              }}
              sources={['ocsge']}
              showDataTable={false}
            />
          </ChartSection>

          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Aliquam erat volutpat. In congue. Fusce commodo aliquam arcu. Nam commodo suscipit quam. Quisque id odio. Praesent venenatis metus at tortor pulvinar varius. Sed pretium blandit orci eu mattis.
          </p>

          <ChartSection>
            <GenericChart
              id="artif_flux_by_couverture"
              land_id={landId}
              land_type={landType}
              params={{
                millesime_new_index: artifIndex,
                millesime_old_index: artifIndex - 1,
              }}
              sources={['ocsge']}
              showDataTable={false}
            />
          </ChartSection>

          <ChartSection>
            <GenericChart
              id="artif_flux_by_usage"
              land_id={landId}
              land_type={landType}
              params={{
                millesime_new_index: artifIndex,
                millesime_old_index: artifIndex - 1,
              }}
              sources={['ocsge']}
              showDataTable={false}
            />
          </ChartSection>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.5rem' }}>
            Flux d'artificialisation
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Praesent blandit laoreet nibh. Sed mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor urna a orci.
          </p>

          {landData && (
            <ChartSection>
              <ArtificialisationDiffMap
                key={`artif-diff-${landId}`}
                landData={landData}
              />
            </ChartSection>
          )}

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.5rem' }}>
            Explorateur OCS GE
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Vivamus suscipit tortor eget felis porttitor volutpat. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Nulla porttitor accumsan tincidunt.
          </p>

          {landData && (
            <ChartSection>
              <OcsgeObjectMap landData={landData} mode="artif" />
            </ChartSection>
          )}

          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2.5rem', marginBottom: '0.5rem' }}>
            Zonage d'urbanisme
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
            Pellentesque in ipsum id orci porta dapibus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Sed porttitor lectus nibh, sed posuere orci viverra nec.
          </p>

          {landData && (
            <ChartSection>
              <ZonageUrbanismeMap landData={landData} mode="artif" />
            </ChartSection>
          )}
        </section>
      )}
      </div>
    </div>
  );
};

export default DashboardPortailDeLArtif;
