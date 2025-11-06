import React from "react";
import GenericChart from "@components/charts/GenericChart";

interface ChartSectionProps {
  id: string;
  landId: string;
  landType: string;
  startYear: number;
  endYear: number;
  comparisonLandIds: string | null;
  sources: string[];
  isMap?: boolean;
  showDataTable?: boolean;
  children?: React.ReactNode;
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  id,
  landId,
  landType,
  startYear,
  endYear,
  comparisonLandIds,
  sources,
  isMap = false,
  showDataTable = true,
  children,
}) => {
  return (
    <div className="bg-white fr-p-2w rounded h-100">
      <GenericChart
        isMap={isMap}
        id={id}
        land_id={landId}
        land_type={landType}
        params={{
          start_date: String(startYear),
          end_date: String(endYear),
          ...(comparisonLandIds && { comparison_lands: comparisonLandIds }),
        }}
        sources={sources}
        showDataTable={showDataTable}
      >
        {children}
      </GenericChart>
    </div>
  );
};
