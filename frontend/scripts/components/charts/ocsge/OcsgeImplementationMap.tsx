import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMap from 'highcharts/modules/map';
import { useGetDepartementListQuery } from '@services/api';

HighchartsMap(Highcharts);

interface Departement {
  id: number;
  land_id: string;
  name: string;
  has_ocsge: boolean;
  millesimes: { departement: string; year: number }[] | null;
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
  has_ocsge?: boolean;
  millesimes?: number[] | null;
}

interface Geometry {
  type: string;
  coordinates: (number[] | number)[][][];
}

const pointFormatter = function (this: any) {
  const millesimes = this.properties.millesimes;
  const millesimesText = millesimes
    ? `Millésimes OCS GE disponibles: ${millesimes.join(', ')}`
    : "OCS GE Non disponible";
  return `<b>${this.properties.nom}</b><br>${millesimesText}`;
};

const dataLabelFormatter = function (this: any) {
  return this.point.properties.millesimes ? this.point.properties.nom : '';
};

const extractMillesimeYears = (millesimes: { departement: string; year: number }[] | null): number[] | null => {
  if (!millesimes || millesimes.length === 0) return null;
  return Array.from(new Set(millesimes.map(m => m.year))).sort((a, b) => a - b);
};

const updateGeoJSONProperties = (geojson: GeoJSON, departements: Departement[]): GeoJSON => {
  return {
    ...geojson,
    features: geojson.features.map(feature => {
      const code = feature.properties.code;
      const departement = departements.find(dept => dept.land_id === code);
      if (departement) {
        const years = extractMillesimeYears(departement.millesimes);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            has_ocsge: departement.has_ocsge,
            millesimes: years,
          },
        };
      } else {
        console.warn(`Le département "${code}" du GeoJSON n'a pas été trouvé dans les données.`);
        return feature;
      }
    }),
  };
};

const OcsgeImplementationMap: React.FC = () => {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
  const [mapData, setMapData] = useState<GeoJSON | null>(null);
  const { data } = useGetDepartementListQuery(null);

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
              .filter(feature => feature.properties.has_ocsge)
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
      enabled: false,
    },
    exporting: {
      enabled: false,
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

export default OcsgeImplementationMap;
