import React, { useRef, useState } from "react";
import styled from "styled-components";
import { theme } from "@theme";

// Période proposée toute prête, en tête des deux listes d'années
export type PeriodPreset = {
  label: string;
  startYear: number;
  endYear: number;
  // Précision donnée au survol
  hint?: string;
};

interface PeriodSelectorProps {
  startYear: number;
  endYear: number;
  minYear: number;
  maxYear: number;
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
  // Bord du sélecteur sur lequel le menu déroulant s'aligne (à droite par défaut)
  dropdownAlign?: "left" | "right";
  // Périodes prédéfinies, et ce que fait le choix de l'une d'elles ; sans elles, le sélecteur
  // ne propose que des années
  presets?: { periods: PeriodPreset[]; onSelect: (startYear: number, endYear: number) => void };
}

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  position: relative;
`;

const YearButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  font-size: ${theme.fontSize.xs};
  font-family: inherit;
  font-weight: ${theme.fontWeight.medium};
  border: 1px solid ${theme.button.secondary.border};
  border-radius: ${theme.radius.default};
  background: transparent;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  min-width: 3.5rem;
  text-align: center;

  &:hover {
    background: ${theme.button.secondary.backgroundHover};
    border-color: ${theme.button.secondary.borderHover};
  }
`;

const Dash = styled.span`
  padding: 0 0.25rem;
  color: ${theme.colors.textMuted};
  font-size: ${theme.fontSize.xs};
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  background: ${theme.colors.background};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radius.default};
  box-shadow: ${theme.shadow.lg};
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  padding: 0.375rem;
  width: max-content;
  max-width: 200px;
`;

const YearOption = styled.button<{ $selected?: boolean; $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.5rem;
  font-size: ${theme.fontSize.xs};
  font-family: inherit;
  font-weight: ${({ $selected }) => $selected ? theme.fontWeight.semibold : theme.fontWeight.medium};
  border: none;
  border-radius: 4px;
  cursor: ${({ $disabled }) => $disabled ? "not-allowed" : "pointer"};
  opacity: ${({ $disabled }) => $disabled ? 0.35 : 1};
  background: ${({ $selected }) => $selected ? theme.colors.primary : "transparent"};
  color: ${({ $selected }) => $selected ? theme.button.primary.color : "inherit"};
  transition: background 0.12s ease;
  min-width: 2.75rem;

  &:hover:not(:disabled) {
    background: ${({ $selected, $disabled }) =>
      $disabled ? "transparent" : $selected ? theme.colors.primaryHover : theme.button.secondary.backgroundHover};
  }
`;

// Avec des périodes prédéfinies, la liste s'élargit : leurs libellés tiennent sur une ligne
const PresetDropdown = styled(Dropdown)`
  max-width: 15rem;
`;

// Les périodes prédéfinies occupent toute la largeur de la liste, au-dessus des années
const Presets = styled.div`
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 0.25rem;
  padding-bottom: 0.375rem;
  border-bottom: 1px solid ${theme.colors.border};
`;

const PresetOption = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.3rem 0.5rem;
  font-size: ${theme.fontSize.xs};
  line-height: 1.25rem;
  font-family: inherit;
  font-weight: ${({ $selected }) => $selected ? theme.fontWeight.semibold : theme.fontWeight.medium};
  text-align: left;
  white-space: nowrap;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? theme.colors.primary : "transparent"};
  color: ${({ $selected }) => $selected ? theme.button.primary.color : "inherit"};
  transition: background 0.12s ease;

  &:hover {
    background: ${({ $selected }) => $selected ? theme.colors.primaryHover : theme.button.secondary.backgroundHover};
  }
`;

const PresetYears = styled.span`
  font-weight: ${theme.fontWeight.medium};
  opacity: 0.75;
`;

type OpenDropdown = "start" | "end" | null;

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  startYear,
  endYear,
  minYear,
  maxYear,
  onStartYearChange,
  onEndYearChange,
  dropdownAlign = "right",
  presets,
}) => {
  const [open, setOpen] = useState<OpenDropdown>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownStyle = dropdownAlign === "left" ? { left: 0 } : { right: 0 };

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const handleBlur = (e: React.FocusEvent) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(null);
    }
  };

  const handleToggle = (which: OpenDropdown) => {
    setOpen((prev) => (prev === which ? null : which));
  };

  // Les mêmes périodes prédéfinies en tête des deux listes ; celle de la période en cours est marquée
  const presetList = presets && presets.periods.length > 0 && (
    <Presets role="group" aria-label="Périodes prédéfinies">
      {presets.periods.map((preset) => {
        const selected = preset.startYear === startYear && preset.endYear === endYear;
        return (
          <PresetOption
            key={preset.label}
            type="button"
            $selected={selected}
            aria-pressed={selected}
            title={preset.hint}
            onClick={() => {
              presets.onSelect(preset.startYear, preset.endYear);
              setOpen(null);
            }}
          >
            <span>{preset.label}</span>
            <PresetYears>{preset.startYear} – {preset.endYear}</PresetYears>
          </PresetOption>
        );
      })}
    </Presets>
  );
  const YearList = presetList ? PresetDropdown : Dropdown;

  return (
    <Wrapper ref={wrapperRef} onBlur={handleBlur}>
      <YearButton onClick={() => handleToggle("start")} aria-label="Année de début">
        {startYear}
        <i className="bi bi-chevron-down" style={{ fontSize: "0.6em", marginLeft: 4 }} />
      </YearButton>

      <Dash>-</Dash>

      <YearButton onClick={() => handleToggle("end")} aria-label="Année de fin">
        {endYear}
        <i className="bi bi-chevron-down" style={{ fontSize: "0.6em", marginLeft: 4 }} />
      </YearButton>

      {open === "start" && (
        <YearList style={dropdownStyle}>
          {presetList}
          {years.map((year) => {
            const disabled = year >= endYear;
            return (
              <YearOption
                key={year}
                $selected={year === startYear}
                $disabled={disabled}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    onStartYearChange(year);
                    setOpen(null);
                  }
                }}
              >
                {year}
              </YearOption>
            );
          })}
        </YearList>
      )}

      {open === "end" && (
        <YearList style={dropdownStyle}>
          {presetList}
          {years.map((year) => {
            const disabled = year <= startYear;
            return (
              <YearOption
                key={year}
                $selected={year === endYear}
                $disabled={disabled}
                disabled={disabled}
                onClick={() => {
                  if (!disabled) {
                    onEndYearChange(year);
                    setOpen(null);
                  }
                }}
              >
                {year}
              </YearOption>
            );
          })}
        </YearList>
      )}
    </Wrapper>
  );
};

export default PeriodSelector;
