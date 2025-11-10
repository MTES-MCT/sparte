import { useRef, useCallback } from "react";
import type maplibregl from "maplibre-gl";

export const useMapSync = () => {
    const mapsRef = useRef<maplibregl.Map[]>([]);
    const syncFunctionsRef = useRef<Array<() => void>>([]);
    const turnOffRef = useRef<(() => void) | null>(null);
    const turnOnRef = useRef<(() => void) | null>(null);

    const moveToMapPosition = (master: maplibregl.Map, clones: maplibregl.Map[]) => {
        const center = master.getCenter();
        const zoom = master.getZoom();
        const bearing = master.getBearing();
        const pitch = master.getPitch();

        clones.forEach((clone) => {
            clone.jumpTo({
                center,
                zoom,
                bearing,
                pitch
            });
        });
    };

    const setupSync = useCallback(() => {
        const maps = mapsRef.current;
        if (maps.length < 2) {
            return;
        }

        syncFunctionsRef.current.forEach((fn, index) => {
            if (fn && maps[index]) {
                maps[index].off('move', fn);
            }
        });

        syncFunctionsRef.current = maps.map((map, index) => {
            const clones = maps.filter((_, i) => i !== index);
            return function sync() {
                if (turnOffRef.current) turnOffRef.current();
                moveToMapPosition(map, clones);
                if (turnOnRef.current) turnOnRef.current();
            };
        });

        turnOffRef.current = () => {
            maps.forEach((map, index) => {
                const syncFn = syncFunctionsRef.current[index];
                if (syncFn) {
                    map.off('move', syncFn);
                }
            });
        };

        turnOnRef.current = () => {
            maps.forEach((map, index) => {
                const syncFn = syncFunctionsRef.current[index];
                if (syncFn) {
                    map.on('move', syncFn);
                }
            });
        };

        if (turnOnRef.current) turnOnRef.current();
    }, []);

    const addMap = useCallback((map: maplibregl.Map) => {
        if (!mapsRef.current.includes(map)) {
            mapsRef.current.push(map);
            setupSync();
        }
    }, [setupSync]);

    const removeMap = useCallback((map: maplibregl.Map) => {
        const index = mapsRef.current.indexOf(map);
        if (index > -1) {
            const syncFn = syncFunctionsRef.current[index];
            if (syncFn) {
                map.off('move', syncFn);
            }
            mapsRef.current.splice(index, 1);
            syncFunctionsRef.current.splice(index, 1);
            setupSync();
        }
    }, [setupSync]);

    const cleanup = useCallback(() => {
        if (turnOffRef.current) {
            turnOffRef.current();
        }
        mapsRef.current = [];
        syncFunctionsRef.current = [];
        turnOffRef.current = null;
        turnOnRef.current = null;
    }, []);

    return { addMap, removeMap, cleanup };
};

