import React from "react";
import styled from "styled-components";
import { formatNumber } from "@utils/formatUtils";
import { LandFriche } from "@services/types/land_friches";
import { useDataTable } from "@hooks/useDataTable";
import { DataTable } from "@components/ui/DataTable";
import { Pagination } from "@components/ui/Pagination";
import { SearchInput } from "@components/ui/SearchInput";
import { STATUT_BADGE_CONFIG, STATUT_ORDER } from "@components/features/friches/constants";
import { useFrichesContext } from "../context/FrichesContext";

const DisplayPaginationInfo = styled.div`
  margin-top: 0.8rem;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: auto;
  color: var(--text-mention-grey);
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin-left: auto;
`;

export const FrichesDataTable: React.FC = () => {
  const { frichesData, handleFricheClick } = useFrichesContext();

  const {
    paginatedData,
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    setSort,
    currentPage,
    totalPages,
    setPage,
    displayInfo,
  } = useDataTable({
    data: frichesData || [],
    searchFields: [
      "site_id",
      "site_nom",
      "friche_type",
      "friche_statut",
      "friche_sol_pollution",
      "friche_zonage_environnemental",
      "friche_type_zone",
    ],
    itemsPerPage: 10,
    defaultSortField: "friche_statut",
    defaultSortDirection: "asc",
    customSortFunction: (a, b, field, direction) => {
      if (field === "friche_statut") {
        const aIndex =
          STATUT_ORDER.indexOf(a.friche_statut as (typeof STATUT_ORDER)[number]) * 500000 +
          a.surface_artif * -1;
        const bIndex =
          STATUT_ORDER.indexOf(b.friche_statut as (typeof STATUT_ORDER)[number]) * 500000 +
          b.surface_artif * -1;

        return direction === "asc" ? aIndex - bIndex : bIndex - aIndex;
      }

      const aValue = a[field];
      const bValue = b[field];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    },
  });

  const columns = [
    {
      key: "actions" as keyof LandFriche,
      label: "",
      sortable: false,
      render: (_: unknown, friche: LandFriche) => (
        <button
          className="fr-btn fr-btn--sm fr-btn--secondary"
          onClick={() => handleFricheClick(friche.point_on_surface)}
          title="Voir sur la carte"
        >
          <i className="bi bi-geo-alt"></i>
        </button>
      ),
    },
    {
      key: "site_nom" as keyof LandFriche,
      label: "Nom",
      sortable: true,
    },
    {
      key: "site_id" as keyof LandFriche,
      label: "Identifiant",
      sortable: true,
    },
    {
      key: "friche_type" as keyof LandFriche,
      label: "Type",
      sortable: true,
    },
    {
      key: "friche_statut" as keyof LandFriche,
      label: "Statut",
      sortable: true,
      render: (value: unknown) => (
        <span
          className={`fr-badge fr-badge--no-icon fr-badge--sm text-lowercase ${
            STATUT_BADGE_CONFIG[value as keyof typeof STATUT_BADGE_CONFIG] || ""
          }`}
        >
          {value as string}
        </span>
      ),
    },
    {
      key: "friche_sol_pollution" as keyof LandFriche,
      label: "Pollution",
      sortable: true,
    },
    {
      key: "surface" as keyof LandFriche,
      label: "Surface (ha)",
      sortable: true,
      render: (value: unknown) =>
        formatNumber({ number: (value as number) / 10000 }),
    },
    {
      key: "friche_is_in_zone_activite" as keyof LandFriche,
      label: "Zone d'activité",
      sortable: false,
      render: (value: unknown) => ((value as boolean) ? "Oui" : "Non"),
    },
    {
      key: "friche_zonage_environnemental" as keyof LandFriche,
      label: "Zonage environnemental",
      sortable: true,
    },
    {
      key: "friche_type_zone" as keyof LandFriche,
      label: "Type de zone",
      sortable: true,
    },
    {
      key: "surface_artif" as keyof LandFriche,
      label: "Surface artificialisée",
      sortable: true,
      render: (value: unknown, friche: LandFriche) =>
        `${formatNumber({ number: value as number })} ha (${formatNumber({
          number: friche.percent_artif,
        })} %)`,
    },
    {
      key: "surface_imper" as keyof LandFriche,
      label: "Surface imperméable",
      sortable: true,
      render: (value: unknown, friche: LandFriche) =>
        `${formatNumber({ number: value as number })} ha (${formatNumber({
          number: friche.percent_imper,
        })} %)`,
    },
    {
      key: "cartofriches" as keyof LandFriche,
      label: "Lien cartofriches",
      sortable: false,
      render: (_: unknown, friche: LandFriche) => (
        <a
          href={`https://cartofriches.cerema.fr/cartofriches/?site=${friche.site_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fr-text--xs"
        >
          Plus de détails sur cette friche
        </a>
      ),
    },
  ];

  return (
    <div className="fr-mb-5w">
      <h2>Détail des friches</h2>
      <div className="fr-grid-row fr-grid-row--gutters fr-mt-3w">
        <div className="fr-col-12">
          <SearchContainer>
            <SearchInput
              id="search-friches"
              placeholder="Recherchez par identifiant, type, statut, pollution, zonage..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </SearchContainer>
          <DataTable
            data={paginatedData}
            columns={columns}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={setSort}
            caption="Liste détaillée des friches du territoire"
            className="fr-mb-2w"
            keyField="site_id"
            tooltipFields={["site_nom"]}
          />
          <div className="d-flex justify-content-start align-items-center gap-2">
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
            <DisplayPaginationInfo className="fr-text--xs">
              {displayInfo.start}-{displayInfo.end} sur {displayInfo.total}
            </DisplayPaginationInfo>
          </div>
        </div>
      </div>
    </div>
  );
};
