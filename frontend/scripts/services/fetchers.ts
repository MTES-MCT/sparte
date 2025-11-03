import { djangoApi } from "@services/api";
import store from "@store/store";

export async function fetchLandGeom(land_type: string, land_id: string) {
    const result = await store.dispatch(
        djangoApi.endpoints.getLandGeom.initiate({ land_type, land_id })
    );
    if ("error" in result) {
        throw result.error;
    }
    return result.data;
}