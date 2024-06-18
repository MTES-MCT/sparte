import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import topology from '../../geojson/departements-1000m-dept-simpl-displaced-vertical.geojson';
import { useGetDepartementListQuery } from '../services/api.js';

HighchartsMap(Highcharts);

interface Departement {
  id: number;
  source_id: string;
  name: string;
  region_id: number;
  is_artif_ready: boolean
  ocsge_millesimes: number[] | null;
}

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: any[];
  };
  properties: {
    code: string;
    nom: string;
    is_artif_ready?: boolean;
    ocsge_millesimes?: string | null;
  };
}

interface GeoJSON {
  type: string;
  features: GeoJSONFeature[];
}

const pointFormatter = function (this: any) {
  const millesimes = this.properties.ocsge_millesimes;
  const millesimesText = millesimes
    ? `Millésimes OCS GE disponibles: ${millesimes.join(', ')}`
    : "OCS GE Non disponible";
  return `<b>${this.properties.nom}</b><br>${millesimesText}`;
};

const dataLabelFormatter = function (this: any) {
  return this.point.properties.ocsge_millesimes ? this.point.properties.nom : '';
};

const HighchartsMapOcsge: React.FC = () => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [mapData, setMapData] = useState<GeoJSON | null>(null);
  const { data } = useGetDepartementListQuery(null);

  const options = useMemo(() => ({
    chart: {
      map: mapData,
      height: 550,
      width: 600,
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        type: 'map',
        joinBy: 'code',
        keys: ['code', 'value'],
        data: mapData
          ? mapData.features
              .filter(feature => feature.properties.is_artif_ready)
              .map(feature => ({
                code: feature.properties.code,
                value: 1,
              }))
          : [],
        states: {
          hover: {
            borderColor: '#cccccc',
            brightness: 0.1,
            borderWidth: 1,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: dataLabelFormatter,
          style: {
            color: '#293273',
          },
        },
        tooltip: {
          headerFormat: '',
          pointFormatter,
        },
        borderWidth: 1,
      },
    ],
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom',
      },
    },
    mapView: {
      projection: {
        name: 'WebMercator',
      },
    },
    colorAxis: {
      dataClasses: [
        {
          from: 1,
          to: 1,
          color: '#6dd176',
          name: 'OCS GE Disponible',
        },
      ],
    },
  }), [mapData]);

  const updateGeoJSONProperties = (geojson: GeoJSON, departements: Departement[]): GeoJSON => {
    return {
      ...geojson,
      features: geojson.features.map(feature => {
        const code = feature.properties.code;
        const departement = departements.find(dept => dept.source_id === code);
        if (departement) {
          return {
            ...feature,
            properties: {
              ...feature.properties,
              is_artif_ready: departement.is_artif_ready,
              ocsge_millesimes: departement.ocsge_millesimes,
            },
          };
        }
        return feature;
      }),
    };
  };

  useEffect(() => {
    if (data) {
      const updatedTopology = updateGeoJSONProperties(topology as GeoJSON, data);
      setMapData(updatedTopology);
    }
  }, [data]);

  return (
    <div>
      {mapData ? (
        <HighchartsReact
          highcharts={Highcharts}
          constructorType="mapChart"
          options={options}
          ref={chartComponentRef}
        />
      ) : (
        <div className="fr-custom-loader"></div>
      )}
    </div>
  );
};

export default HighchartsMapOcsge;