import { LandType } from "@services/types/land";

const PADDING_BY_LAND_TYPE: Record<LandType, number> = {
    [LandType.COMMUNE]: 15,
    [LandType.EPCI]: 30,
    [LandType.SCOT]: 30,
    [LandType.DEPARTEMENT]: 40,
    [LandType.REGION]: 50,
    [LandType.NATION]: 60,
};

export const calculateMaxBoundsWithPadding = (
    bounds: [number, number, number, number],
    landType: LandType
): [number, number, number, number] => {
    const paddingKm = PADDING_BY_LAND_TYPE[landType] ?? 50;
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const centerLat = (minLat + maxLat) / 2;

    const latPaddingDeg = paddingKm / 111;
    const lngPaddingDeg = paddingKm / (111 * Math.cos(centerLat * Math.PI / 180));

    return [
        minLng - lngPaddingDeg,
        minLat - latPaddingDeg,
        maxLng + lngPaddingDeg,
        maxLat + latPaddingDeg,
    ];
};

