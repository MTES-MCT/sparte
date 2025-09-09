export const getOrthophotoURL = (year: number) => {
    return `https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=HR.ORTHOIMAGERY.ORTHOPHOTOS&tilematrixset=PM&TileMatrix={z}&TileCol={x}&TileRow={y}&format=image%2Fjpeg&style=normal`
}

interface GetOcsgeVectorTilesURLProps {
    index: number;
    departement: string;
    tilesLocation: string;
}

export const getOcsgeVectorTilesURL = ({ index, departement, tilesLocation}: GetOcsgeVectorTilesURLProps) => {
    return `pmtiles://${tilesLocation}/occupation_du_sol_${index}_${departement}.pmtiles`
}
