import React, { useRef, useEffect, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import '../../styles/map-react.css'

const InteractiveMapMap = () =>
{
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [lng] = useState(139.753)
  const [lat] = useState(35.6844)
  const [zoom] = useState(14)

  useEffect(() =>
  {
    if (map.current) return // stops map from intializing more than once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: 'Empty',
        metadata: {
          'mapbox:autocomposite': true,
        },
        glyphs: '/static/carto/fonts/{fontstack}/{range}.pbf',
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: {
              'background-color': '#DDDDDD',
            },
          },
        ],
      }, // Empty style with DSFR Marianne font glyphs https://github.com/mapbox/mapbox-gl-styles/blob/master/styles/empty-v8.json
      center: [lng, lat],
      zoom,
      maxZoom: 18,
      attributionControl: false,
    })
  }, [lng, lat, zoom])

  return (
  <div className="map-wrap">
    <div ref={mapContainer} className="map" />
  </div>
  )
}

export default InteractiveMapMap
