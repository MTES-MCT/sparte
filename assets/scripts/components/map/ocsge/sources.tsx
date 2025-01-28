export const getOrthophotoURL = (year: number) => {
    return `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHO-SAT.SPOT.${year}&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal`
}

export const getOcsgeVectorTilesURL = (year: number, departement: string) => {
    return `pmtiles://https://airflow-staging.s3.fr-par.scw.cloud/vector_tiles/occupation_du_sol_${year}_${departement}.pmtiles`
}
