import { MatrixSelection, UserFilter } from "../constants/selections";

export const getMaplibreFilters = (matrix: MatrixSelection[], userFilters: UserFilter[]) => {
    return matrix.filter(({ couverture, usage }) => {
        return userFilters.some(({ couverture: userCouverture, usage: userUsage }) => {
          if (couverture && usage) {
            return couverture === userCouverture && usage === userUsage
          } else if (couverture) {
            return couverture === userCouverture
          } else if (usage) {
            return usage === userUsage
          }
          return false
        })
      }).reduce((acc, combinaison) => {
        const { couverture, usage } = combinaison
        let customFilter: any = [
          "all",
        ]
    
        if (couverture) {
          customFilter.push(["==", ["get", "code_cs"], couverture])
        }
    
        if (usage) {
          customFilter.push(["==", ["get", "code_us"], usage])
        }
    
        return [...acc, customFilter]
      }, [])
}