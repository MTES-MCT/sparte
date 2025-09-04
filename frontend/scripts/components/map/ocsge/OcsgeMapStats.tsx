import React from 'react'

import { getCouvertureOrUsageAsRGBString } from './constants/colors'
import { getCouvertureOrUsageLabel } from './constants/labels'
import { Stat } from './utils/getStats'
import styled from 'styled-components'

interface OcgeMapStatsProps {
    stats: Stat[]
}

const StatsWrapper = styled.div`
    display: flex;
    flex-direction: row;
`;

const StatsElement = styled.div<{ $percent: number, $color: string }>`
    height: 15px;
    width: ${(props) => props.$percent}%;
    background-color: ${(props) => props.$color};
`;

export const OcgeMapStats = ({ stats }: OcgeMapStatsProps) => {
    return (
          <StatsWrapper>
            {stats.map(({ code, percent }) => (
              <StatsElement
                $color={getCouvertureOrUsageAsRGBString(code)}
                $percent={percent}
                key={code}
                aria-describedby={`tooltip-${code}-percent`}
              >
                <span
                  className="fr-tooltip fr-placement"
                  id={`tooltip-${code}-percent`}
                  role="tooltip"
                  aria-hidden="true"
                >
                  <span className="fr-tooltip__content">
                    <span>
                      {getCouvertureOrUsageLabel(code)} - {code} - {Math.round(percent * 100) / 100}%
                    </span>
                  </span>
                </span>
              </StatsElement>
            ))}
          </StatsWrapper>
    )
}