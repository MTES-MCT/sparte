import React from 'react'
import GenericChart from '@components/charts/GenericChart'
import { LogementVacantProgressionProps } from '../types'

export const LogementVacantTaux: React.FC<LogementVacantProgressionProps> = ({
  landId,
  landType,
  startYear,
  endYear,
}) => (
    <div className="bg-white fr-p-2w rounded">
      <GenericChart
        id="logement_vacant_taux_progression_chart"
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
        }}
        sources={['lovac', 'rpls']}
        showDataTable={true}
      />
    </div>
)
