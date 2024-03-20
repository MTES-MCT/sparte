import React from 'react'
import { useGetProjectQuery } from '../services/api.js'


const StaticMap = () => {
    const projectId = window.location.pathname.split('/')[2]
    const { data } = useGetProjectQuery(projectId)
    if (!data) {
        return <div>Chargement ...</div>
    }
    return <img src={data?.theme_map_understand_artif} alt="Carte comprendre l'artificialisation de son territoire" />
}

export default StaticMap