import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { useGetDepartementListQuery } from '../services/api.js';

HighchartsMap(Highcharts);

interface Departement {
  id: number;
  source_id: string;
  name: string;
  region_id: number;
  is_artif_ready: boolean;
  ocsge_millesimes: number[] | null;
}

interface GeoJSON {
  type: string;
  features: Feature[];
}

interface Feature {
  type: string;
  geometry: Geometry;
  properties: Properties;
}

interface Properties {
  code: string;
  nom: string;
  is_artif_ready?: boolean;
  ocsge_millesimes?: number[] | null;
}

interface Geometry {
  type: string;
  coordinates: (number[] | number)[][][];
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
      fetch('https://gist.githubusercontent.com/alexisig/8003b3cb786ba1fcaf1801b81d42d755/raw/0715b61a3f6ef828f7dc90b8fa42167547673af4/departements-1000m-dept-simpl-displaced-vertical.geojson')
        .then(response => response.json())
        .then(geojson => {
          const updatedTopology = updateGeoJSONProperties(geojson, data);
          setMapData(updatedTopology);
        })
        .catch(error => console.error('Error fetching GeoJSON:', error));
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