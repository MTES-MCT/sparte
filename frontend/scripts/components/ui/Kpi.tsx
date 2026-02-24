import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import Button from "@components/ui/Button";

type KpiVariant = "default" | "success" | "error";

interface KpiMetricItem {
  icon: string;
  label: string;
  value: string;
}

interface KpiPeriodItem {
  label: string;
  active?: boolean;
}

interface KpiMiniChartBar {
  label: string;
  value: number | null;
}

type KpiFooter =
  | { type: "metric"; items: [KpiMetricItem, KpiMetricItem] }
  | { type: "period"; periods: KpiPeriodItem[] }
  | { type: "minichart"; bars: [KpiMiniChartBar, KpiMiniChartBar]; unit?: string };

interface KpiAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface KpiProps {
  icon: string;
  label: string;
  value: ReactNode;
  description?: ReactNode;
  detail?: ReactNode;
  variant: KpiVariant;
  badge?: string;
  footer?: KpiFooter;
  action?: KpiAction;
}

const variantConfig: Record<KpiVariant, { color: string; bg: string; border: string }> = {
  default: { color: theme.colors.primary, bg: theme.colors.primaryBg, border: theme.colors.primaryBorder },
  success: { color: theme.colors.success, bg: theme.colors.successBg, border: theme.colors.successBorder },
  error: { color: theme.colors.error, bg: theme.colors.errorBg, border: theme.colors.errorBorder },
};

const Card = styled(BaseCard)`
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Header = styled.div`
  padding: 1.5rem 1.75rem;
  padding-top: 4rem;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  position: relative;
`;

const BadgeTag = styled.div<{ $color: string }>`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  border-radius: ${theme.radius.tag};
  font-size: 0.7rem;
  font-weight: ${theme.fontWeight.bold};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${({ $color }) => $color};
  color: white;

  i {
    font-size: 0.7rem;
  }
`;

const HeaderIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  background: ${({ $color }) => $color};
  color: white;
  font-size: 1.5rem;
`;

const ValueText = styled.div<{ $color: string }>`
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: ${({ $color }) => $color};
`;

const LabelText = styled.div`
  font-size: ${theme.fontSize.sm};
  margin-top: 0.5rem;
  font-weight: ${theme.fontWeight.medium};
`;

const DescriptionText = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-top: 0.25rem;
`;

const FooterWrapper = styled.div<{ $bg: string }>`
  padding: 1rem 1.5rem;
  background: ${({ $bg }) => $bg};
`;

const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.75rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid ${theme.colors.border};
  background: ${theme.colors.backgroundSubtle};
`;

const MetricRow = styled.div`
  display: flex;
  align-items: stretch;

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const MetricItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 1rem;
`;

const MetricDivider = styled.div<{ $border: string }>`
  width: 1px;
  background: ${({ $border }) => $border};
  align-self: stretch;

  @media (max-width: 576px) {
    width: 100%;
    height: 1px;
    margin: 0.75rem 0;
  }
`;

const MetricIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color};
  color: white;
  flex-shrink: 0;

  i {
    font-size: 0.85rem;
  }
`;

const MetricContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
`;

const MetricLabel = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  font-weight: ${theme.fontWeight.medium};
`;

const MetricValueText = styled.span`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
`;

const PeriodRow = styled.div<{ $centered?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $centered }) => ($centered ? "center" : "space-between")};
`;

const PeriodLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: ${theme.fontWeight.semibold};
`;

const ConnectorWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
  position: relative;
`;

const ConnectorLine = styled.div<{ $border: string }>`
  width: 100%;
  max-width: 60px;
  height: 2px;
  background: ${({ $border }) => $border};
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $border }) => $border};
  }

  &::before {
    left: 0;
  }

  &::after {
    right: 0;
  }
`;

const ConnectorBadge = styled.div<{ $color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: white;
  border: 2px solid ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  font-size: 0.7rem;
`;

const MetricFooter: React.FC<{
  items: [KpiMetricItem, KpiMetricItem];
  color: string;
  border: string;
}> = ({ items, color, border }) => (
  <MetricRow>
    <MetricItem>
      <MetricIcon $color={color}>
        <i className={items[0].icon} />
      </MetricIcon>
      <MetricContent>
        <MetricLabel>{items[0].label}</MetricLabel>
        <MetricValueText>{items[0].value}</MetricValueText>
      </MetricContent>
    </MetricItem>
    <MetricDivider $border={border} />
    <MetricItem>
      <MetricIcon $color={color}>
        <i className={items[1].icon} />
      </MetricIcon>
      <MetricContent>
        <MetricLabel>{items[1].label}</MetricLabel>
        <MetricValueText>{items[1].value}</MetricValueText>
      </MetricContent>
    </MetricItem>
  </MetricRow>
);

const PeriodFooter: React.FC<{
  periods: KpiPeriodItem[];
  color: string;
  border: string;
}> = ({ periods, color, border }) => {
  const isSinglePeriod = periods.length === 1;

  return (
    <PeriodRow $centered={isSinglePeriod}>
      {periods.map((period, index) => {
        const isLast = index === periods.length - 1;
        const badgeColor = period.active !== false ? color : border;

        return (
          <React.Fragment key={index}>
            <PeriodLabel>{period.label}</PeriodLabel>
            {!isLast && (
              <ConnectorWrapper>
                <ConnectorLine $border={border} />
                <ConnectorBadge $color={badgeColor}>
                  <i className="bi bi-chevron-right" />
                </ConnectorBadge>
              </ConnectorWrapper>
            )}
          </React.Fragment>
        );
      })}
    </PeriodRow>
  );
};

const MiniChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const MiniChartRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const MiniChartLabel = styled.span`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.textLight};
`;

const MiniChartBarRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const MiniChartTrack = styled.div`
  flex: 1;
  min-width: 0;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: ${theme.radius.tag};
  overflow: hidden;
`;

const MiniChartValue = styled.span<{ $color: string }>`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.bold};
  color: ${({ $color }) => $color};
  flex-shrink: 0;
  min-width: 70px;
  text-align: right;
`;

const MiniChartBar = styled.div<{ $width: number; $color: string; $hidden?: boolean }>`
  height: 100%;
  width: ${({ $width, $hidden }) => ($hidden ? 0 : Math.max($width, 3))}%;
  background: ${({ $color }) => $color};
  border-radius: ${theme.radius.tag};
  transition: width 0.4s ease;
`;

const MiniChartFooter: React.FC<{
  bars: [KpiMiniChartBar, KpiMiniChartBar];
  unit?: string;
  color: string;
}> = ({ bars, unit = "", color }) => {
  const validValues = bars.map((b) => b.value).filter((v): v is number => v !== null);
  const maxValue = Math.max(...validValues, 0.001);

  const formatValue = (value: number | null) => {
    if (value === null) return "—";
    const formatted = value.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
    return unit ? `${formatted} ${unit}` : formatted;
  };

  const barColors = [theme.colors.textMuted, color];

  return (
    <MiniChartWrapper>
      {bars.map((bar, index) => (
        <MiniChartRow key={index}>
          <MiniChartLabel>{bar.label}</MiniChartLabel>
          <MiniChartBarRow>
            <MiniChartTrack>
              <MiniChartBar
                $width={bar.value !== null ? (bar.value / maxValue) * 100 : 0}
                $color={barColors[index]}
                $hidden={bar.value === null}
              />
            </MiniChartTrack>
            <MiniChartValue $color={barColors[index]}>
              {formatValue(bar.value)}
            </MiniChartValue>
          </MiniChartBarRow>
        </MiniChartRow>
      ))}
    </MiniChartWrapper>
  );
};

const Kpi: React.FC<KpiProps> = ({
  icon,
  label,
  value,
  description,
  variant,
  badge,
  footer,
  action,
}) => {
  const config = variantConfig[variant];

  return (
    <Card>
      <Header>
        {badge && (
          <BadgeTag $color={config.color}>
            <i className="bi bi-lightning-charge-fill" />
            {badge}
          </BadgeTag>
        )}
        <HeaderIcon $color={config.color}>
          <i className={icon} />
        </HeaderIcon>
        <ValueText $color={config.color}>{value}</ValueText>
        <LabelText>{label}</LabelText>
        {description && <DescriptionText>{description}</DescriptionText>}
      </Header>
      {footer && (
        <FooterWrapper $bg={config.bg}>
          {footer.type === "metric" && (
            <MetricFooter items={footer.items} color={config.color} border={config.border} />
          )}
          {footer.type === "period" && (
            <PeriodFooter periods={footer.periods} color={config.color} border={config.border} />
          )}
          {footer.type === "minichart" && (
            <MiniChartFooter bars={footer.bars} unit={footer.unit} color={config.color} />
          )}
        </FooterWrapper>
      )}
      {action && (
        <ActionWrapper>
            <Button
              variant="link"
              to={action.to}
              onClick={action.onClick}
              icon="bi bi-arrow-right"
              iconPosition="right"
            >
              {action.label}
            </Button>
        </ActionWrapper>
      )}
    </Card>
  );
};

export default Kpi;
