import React, { useRef, useState } from "react";
import styled from "styled-components";
import { theme } from "@theme";

interface PeriodSelectorProps {
  startYear: number;
  endYear: number;
  minYear: number;
  maxYear: number;
  onStartYearChange: (year: number) => void;
  onEndYearChange: (year: number) => void;
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
  max-width: 240px;
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

type OpenDropdown = "start" | "end" | null;

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  startYear,
  endYear,
  minYear,
  maxYear,
  onStartYearChange,
  onEndYearChange,
}) => {
  const [open, setOpen] = useState<OpenDropdown>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const handleBlur = (e: React.FocusEvent) => {
    if (!wrapperRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(null);
    }
  };

  const handleToggle = (which: OpenDropdown) => {
    setOpen((prev) => (prev === which ? null : which));
  };

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
        <Dropdown style={{ left: 0 }}>
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
        </Dropdown>
      )}

      {open === "end" && (
        <Dropdown style={{ right: 0 }}>
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
        </Dropdown>
      )}
    </Wrapper>
  );
};

export default PeriodSelector;
