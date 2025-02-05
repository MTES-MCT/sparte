export const getOrthophotoURL = (year: number) => {
    return `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHO-SAT.SPOT.${year}&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal`
}

interface GetOcsgeVectorTilesURLProps {
    year: number;
    departement: string;
    tilesLocation: string;
}

export const getOcsgeVectorTilesURL = ({ year, departement, tilesLocation}: GetOcsgeVectorTilesURLProps) => {
    return `pmtiles://${tilesLocation}/occupation_du_sol_${year}_${departement}.pmtiles`
}
