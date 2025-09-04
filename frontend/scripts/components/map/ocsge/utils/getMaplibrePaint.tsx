import { MatrixSelection } from "../constants/selections"


export const getMaplibrePaint = (matrix: MatrixSelection[]) => {
    let combinedRules: any = []
    let csRules: any = []
    let usRules: any = []

    matrix.forEach(({ couverture, usage, color }) => {
    if (couverture && usage) {
        combinedRules = combinedRules.concat([`${couverture}-${usage}`, `rgb(${color[0]}, ${color[1]}, ${color[2]})`])
    } else if (couverture) {
        csRules = csRules.concat([couverture, `rgb(${color[0]}, ${color[1]}, ${color[2]})`])
    } else if (usage) {
        usRules = usRules.concat([usage, `rgb(${color[0]}, ${color[1]}, ${color[2]})`])
    }
    })

    let paint: any = []

    if (combinedRules.length > 0) {
    paint = paint.concat(
        ['match', ['concat', ['get', 'code_cs'], '-', ['get', 'code_us']]]
    ).concat(combinedRules).concat(['#999'])
    }

    if (csRules.length > 0) {
    paint = paint.concat(
        ['match', ['get', 'code_cs']]
    ).concat(csRules).concat(['#999'])
    }

    if (usRules.length > 0) {
    paint = paint.concat(
        ['match', ['get', 'code_us']]
    ).concat(usRules).concat(['#999'])
    }

    return paint
}