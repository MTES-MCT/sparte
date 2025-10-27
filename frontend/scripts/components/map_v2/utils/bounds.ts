export const calculateMaxBoundsWithPadding = (
    bounds: [number, number, number, number],
    paddingKm: number = 50
): [number, number, number, number] => {
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

