import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";

type KpiVariant = "info" | "success" | "error";

interface KpiMetricItem {
  icon: string;
  label: string;
  value: string;
}

interface KpiPeriod {
  label: string;
  value?: string;
}

type KpiFooter =
  | { type: "metric"; items: [KpiMetricItem, KpiMetricItem] }
  | { type: "period"; direction: "up" | "down" | "neutral"; from: KpiPeriod; to: KpiPeriod };

export interface KpiProps {
  icon: string;
  label: string;
  value: ReactNode;
  description?: ReactNode;
  detail?: ReactNode;
  variant: KpiVariant;
  badge?: string;
  footer?: KpiFooter;
}

const variantConfig: Record<KpiVariant, { color: string; bg: string; border: string }> = {
  info: { color: theme.colors.info, bg: theme.colors.infoBg, border: theme.colors.infoBorder },
  success: { color: theme.colors.success, bg: theme.colors.successBg, border: theme.colors.successBorder },
  error: { color: theme.colors.error, bg: theme.colors.errorBg, border: theme.colors.errorBorder },
};

const Card = styled(BaseCard)`
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  padding: 2rem 1.75rem;
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
  border-radius: 100px;
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
  color: ${theme.colors.textMuted};
  margin-top: 0.5rem;
  font-weight: ${theme.fontWeight.medium};
`;

const DescriptionText = styled.div`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textLight};
  margin-top: 0.25rem;
`;

const DetailText = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  margin-top: 0.25rem;
`;

const FooterWrapper = styled.div<{ $bg: string }>`
  padding: 1rem 1.5rem;
  background: ${({ $bg }) => $bg};
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

const PeriodRow = styled.div`
  display: flex;
  align-items: center;
`;

const PeriodBlock = styled.div<{ $align: "left" | "right" }>`
  flex: 1;
  text-align: ${({ $align }) => $align};
`;

const PeriodLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: ${theme.fontWeight.semibold};
`;

const PeriodValue = styled.div`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};

  span {
    font-size: ${theme.fontSize.sm};
    font-weight: ${theme.fontWeight.medium};
    color: ${theme.colors.textLight};
    margin-left: 0.15rem;
  }
`;

const ConnectorWrapper = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  position: relative;
`;

const ConnectorLine = styled.div<{ $border: string }>`
  width: 60px;
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
  from: KpiPeriod;
  to: KpiPeriod;
  color: string;
  border: string;
}> = ({ from, to, color, border }) => (
  <PeriodRow>
    <PeriodBlock $align="left">
      <PeriodLabel>{from.label}</PeriodLabel>
      {from.value && <PeriodValue>{from.value}</PeriodValue>}
    </PeriodBlock>
    <ConnectorWrapper>
      <ConnectorLine $border={border} />
      <ConnectorBadge $color={color}>
        <i className="bi bi-chevron-right" />
      </ConnectorBadge>
    </ConnectorWrapper>
    <PeriodBlock $align="right">
      <PeriodLabel>{to.label}</PeriodLabel>
      {to.value && <PeriodValue>{to.value}</PeriodValue>}
    </PeriodBlock>
  </PeriodRow>
);

const Kpi: React.FC<KpiProps> = ({
  icon,
  label,
  value,
  description,
  detail,
  variant,
  badge,
  footer,
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
        {detail && <DetailText>{detail}</DetailText>}
      </Header>
      {footer && (
        <FooterWrapper $bg={config.bg}>
          {footer.type === "metric" && (
            <MetricFooter items={footer.items} color={config.color} border={config.border} />
          )}
          {footer.type === "period" && (
            <PeriodFooter from={footer.from} to={footer.to} color={config.color} border={config.border} />
          )}
        </FooterWrapper>
      )}
    </Card>
  );
};

export default Kpi;
