import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";
import BaseCard from "@components/ui/BaseCard";
import Button from "@components/ui/Button";
import Tag from "@components/ui/Tag";

type KpiVariant = "default" | "success" | "error" | "highlight";

export interface KpiMetricItem {
  icon: string;
  label: string;
  value: string;
  iconVariant?: KpiVariant;
}

type KpiFooter =
  | { type: "metric"; items: [KpiMetricItem, KpiMetricItem] }
  | { type: "period"; from: string; to?: string };

interface KpiAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

export interface KpiProps {
  icon: string;
  label?: string;
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
  highlight: { color: theme.colors.purple, bg: theme.colors.purpleBg, border: theme.colors.purpleBorder },
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

const TagWrapper = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  text-transform: uppercase;
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
  font-size: ${theme.fontSize.sm};
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
  justify-content: space-between;
`;

const PeriodLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
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
}> = ({ items, color, border }) => {
  const getIconColor = (item: KpiMetricItem) =>
    item.iconVariant ? variantConfig[item.iconVariant].color : color;

  return (
    <MetricRow>
      <MetricItem>
        <MetricIcon $color={getIconColor(items[0])}>
          <i className={items[0].icon} />
        </MetricIcon>
        <MetricContent>
          <MetricLabel>{items[0].label}</MetricLabel>
          <MetricValueText>{items[0].value}</MetricValueText>
        </MetricContent>
      </MetricItem>
      <MetricDivider $border={border} />
      <MetricItem>
        <MetricIcon $color={getIconColor(items[1])}>
          <i className={items[1].icon} />
        </MetricIcon>
        <MetricContent>
          <MetricLabel>{items[1].label}</MetricLabel>
          <MetricValueText>{items[1].value}</MetricValueText>
        </MetricContent>
      </MetricItem>
    </MetricRow>
  );
};

const SingleDateRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PeriodFooter: React.FC<{
  from: string;
  to?: string;
  color: string;
  border: string;
}> = ({ from, to, color, border }) => {
  if (!to) {
    return (
      <SingleDateRow>
        <PeriodLabel>{from}</PeriodLabel>
      </SingleDateRow>
    );
  }

  return (
    <PeriodRow>
      <PeriodLabel>{from}</PeriodLabel>
      <ConnectorWrapper>
        <ConnectorLine $border={border} />
        <ConnectorBadge $color={color}>
          <i className="bi bi-chevron-right" />
        </ConnectorBadge>
      </ConnectorWrapper>
      <PeriodLabel>{to}</PeriodLabel>
    </PeriodRow>
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
          <TagWrapper>
            <Tag
              variant={variant === "default" ? "primary" : variant === "highlight" ? "highlight" : variant}
              size="sm"
              icon="bi bi-lightning-charge-fill"
            >
              {badge}
            </Tag>
          </TagWrapper>
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
            <PeriodFooter from={footer.from} to={footer.to} color={config.color} border={config.border} />
          )}
        </FooterWrapper>
      )}
      {action && (
        <ActionWrapper>
            <Button
              variant="tertiary" noBackground noPadding
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
