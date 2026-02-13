import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import HighchartsReact from 'highcharts-react-official';
import * as Highcharts from 'highcharts';

import HighchartsMore from 'highcharts/highcharts-more';
import HCSoldGauge from 'highcharts/modules/solid-gauge';

import HighchartsMap from 'highcharts/modules/map';
import HighchartsHeatmap from 'highcharts/modules/heatmap';
import HighchartsTilemap from 'highcharts/modules/tilemap';
import HighchartsTreemap from 'highcharts/modules/treemap';
import Drilldown from 'highcharts/modules/drilldown';
import Exporting from 'highcharts/modules/exporting';
import Fullscreen from 'highcharts/modules/full-screen';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import SeriesOnPoint from 'highcharts/modules/series-on-point';

import { theme } from '@theme';
import Loader from '@components/ui/Loader';
import Button from '@components/ui/Button';
import ChartDataSource from './ChartDataSource';
import ChartDataTable from './ChartDataTable';
import ChartExplorer from './ChartExplorer';
import { useGetChartConfigQuery } from '@services/api';

// Initialize the modules
HighchartsMore(Highcharts);
HighchartsMap(Highcharts)
HighchartsHeatmap(Highcharts)
HighchartsTilemap(Highcharts)
HighchartsTreemap(Highcharts)
Drilldown(Highcharts)
Exporting(Highcharts)
Fullscreen(Highcharts)
NoDataToDisplay(Highcharts)
HCSoldGauge(Highcharts)
SeriesOnPoint(Highcharts)

export type DataSource =
  | 'insee'
  | 'majic'
  | 'gpu'
  | 'lovac'
  | 'ocsge'
  | 'rpls'
  | 'sitadel'
  | 'cartofriches';

type GenericChartProps = {
  id: string;
  land_id: string;
  land_type: string;
  params?: object;
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
  isMap?: boolean;
  showToolbar?: boolean;
  sources?: DataSource[];
  children?: React.ReactNode;
  showDataTable?: boolean;
  dataTableHeader?: React.ReactNode;
  dataTableOnly?: boolean;
  hideToggle?: boolean;
  compactDataTable?: boolean;
  hideDetails?: boolean;
  onPointClick?: (point: { land_id: string; land_type: string; name: string }) => void;
}

const ChartCard = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoaderContainer = styled.div`
  height: 400px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartBody = styled.div`
  flex: 1;
  padding: 1.25rem;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const ChartFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const GenericChart = ({
  id,
  land_id,
  land_type,
  params,
  containerProps,
  isMap = false,
  showToolbar = true,
  sources = [],
  children,
  showDataTable = false,
  dataTableHeader,
  dataTableOnly = false,
  compactDataTable = false,
  hideDetails = false,
  onPointClick,
} : GenericChartProps) => {
  const chartRef = useRef<any>(null);
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);

  const {
    data: chartOptions, isLoading, isFetching, error,
  } = useGetChartConfigQuery({
    id,
    land_id,
    land_type,
    ...params,
  });

  const isLoadingOrFetching = isLoading || isFetching
  const effectiveShowDataTable = dataTableOnly || showDataTable

  const handleDownloadPNG = () => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.exportChart({ type: 'image/png' })
    }
  }

  const handleFullscreen = () => {
    if (chartRef.current?.chart) {
      chartRef.current.chart.fullscreen.toggle()
    }
  }

  if (isLoadingOrFetching) {
    return (
      <ChartCard>
        <LoaderContainer>
          <Loader />
        </LoaderContainer>
      </ChartCard>
    )
  }

  if (error || !chartOptions?.highcharts_options) {
    return (
      <ChartCard>
        <ChartBody className="fr-text--sm fr-text-mention--grey fr-py-4w">
          <i className="bi bi-exclamation-triangle fr-mr-1w" />
          Erreur lors du chargement des données
        </ChartBody>
      </ChartCard>
    )
  }

  const mutableChartOptions = JSON.parse(JSON.stringify(chartOptions.highcharts_options || {}))

  const pieSeries = mutableChartOptions._pieSeries
  delete mutableChartOptions._pieSeries

  if (mutableChartOptions.tooltip?.shared) {
    mutableChartOptions.tooltip.formatter = function tooltipFormatter(this: Highcharts.TooltipFormatterContextObject) {
      const points = this.points?.filter((p) => !p.point.options.custom?.skipTooltip)
      if (!points || points.length === 0) return false

      let tooltip = `<b>${this.x}</b><br/>`
      points.forEach((p) => {
        const seriesTooltipOptions = (p.series as Highcharts.Series & { tooltipOptions?: Highcharts.TooltipOptions }).tooltipOptions
        const suffix = seriesTooltipOptions?.valueSuffix || ''
        tooltip += `<span style="color:${p.color}">●</span> ${p.series.name}: <b>${Highcharts.numberFormat(p.y || 0, 0, ',', ' ')}${suffix}</b><br/>`
      })
      return tooltip
    }
  }

  const handleChartCallback = (chart: Highcharts.Chart) => {
    if (pieSeries && pieSeries.length > 0) {
      pieSeries.forEach((series: Highcharts.SeriesOptionsType) => {
        chart.addSeries(series, false)
      })
      chart.redraw()
    }

    if (onPointClick) {
      chart.series.forEach((series) => {
        Highcharts.addEvent(series, 'click', (e: any) => {
          const opts = e?.point?.options
          const pt = e?.point
          if (opts?.land_id) {
            onPointClick({
              land_id: opts.land_id,
              land_type: opts.land_type || '',
              name: pt?.name || opts?.name || '',
            })
          }
        })
      })
    }
  }

  const shouldRedraw = true
  const oneToOne = true
  const animation = !isMap

  const chartHeight = mutableChartOptions.chart?.height
  const shouldUseDefaultHeight = chartHeight === undefined

  const defaultContainerProps = {
    style: {
      height: shouldUseDefaultHeight ? '400px' : (chartHeight === null ? 'auto' : `${chartHeight}px`),
      width: '100%',
    },
  }

  const dataTable = effectiveShowDataTable ? {
    headers: chartOptions.data_table?.headers,
    rows: chartOptions.data_table?.rows,
    boldFirstColumn: chartOptions.data_table?.boldFirstColumn,
    boldLastColumn: chartOptions.data_table?.boldLastColumn,
    boldLastRow: chartOptions.data_table?.boldLastRow,
    formatFirstColumn: chartOptions.data_table?.formatFirstColumn,
  } : undefined

  const showFooter = !dataTableOnly && !hideDetails && (sources.length > 0 || effectiveShowDataTable);

  if (dataTableOnly && effectiveShowDataTable && dataTable) {
    return (
      <ChartCard>
        <ChartBody>
          {dataTableHeader}
          <ChartDataTable data={dataTable} title={mutableChartOptions.title?.text} compact={compactDataTable} />
          {children}
        </ChartBody>
      </ChartCard>
    )
  }

  return (
    <ChartCard>
      <ChartBody>
        {showToolbar && (
          <Toolbar>
            <Button variant="secondary" icon="bi bi-download" onClick={handleDownloadPNG} title="Télécharger en PNG">
              PNG
            </Button>
            <Button variant="secondary" icon="bi bi-arrows-fullscreen" onClick={handleFullscreen} title="Plein écran">
              Plein écran
            </Button>
          </Toolbar>
        )}
        <HighchartsReact
          ref={chartRef}
          highcharts={Highcharts}
          options={mutableChartOptions}
          updateArgs={[shouldRedraw, oneToOne, animation]}
          containerProps={{ ...defaultContainerProps, ...containerProps }}
          constructorType={isMap ? 'mapChart' : 'chart'}
          callback={(pieSeries || onPointClick) ? handleChartCallback : undefined}
        />
      </ChartBody>

      {showFooter && (
        <>
          <ChartFooter>
            {sources.length > 0 ? (
              <ChartDataSource sources={sources} displayMode="tag" />
            ) : (
              <div />
            )}
            <Button variant="secondary" icon="bi bi-table" onClick={() => setIsExplorerOpen(true)} type="button">
              Détails données et calculs
            </Button>
          </ChartFooter>
          <ChartExplorer
            isOpen={isExplorerOpen}
            onClose={() => setIsExplorerOpen(false)}
            chartTitle={mutableChartOptions.title?.text}
            chartOptions={chartOptions.highcharts_options}
            sources={sources}
            dataTable={dataTable}
            isMap={isMap}
          >
            {children}
          </ChartExplorer>
        </>
      )}
    </ChartCard>
  )
}

export default React.memo(GenericChart)
