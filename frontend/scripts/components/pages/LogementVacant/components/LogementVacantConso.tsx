import React from 'react'
import GenericChart from '@components/charts/GenericChart'
import { LogementVacantProgressionProps } from '../types'

export const LogementVacantConso: React.FC<LogementVacantProgressionProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => (
    <div className="bg-white fr-p-2w rounded">
      <GenericChart
        id="logement_vacant_conso_progression_chart"
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
        }}
        sources={['fichiers_fonciers', 'lovac', 'rpls']}
        showDataTable={true}
      />
    </div>
)
