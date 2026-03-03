import React, { ReactNode } from "react";
import styled from "styled-components";
import { theme } from "@theme";

interface TimelinePhase {
  badge?: ReactNode;
  title: string;
  description?: string;
  content?: ReactNode;
}

interface TimelineProps {
  phases: TimelinePhase[];
}

const TimelineWrapper = styled.div`
  position: relative;
  padding-left: 2rem;

  &::before {
    content: "";
    position: absolute;
    left: 5px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${theme.colors.border};
  }
`;

const TimelineEndpoint = styled.div<{ $position: "start" | "end" }>`
  position: absolute;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${theme.colors.border};
  ${({ $position }) =>
    $position === "start" ? "top: -6px;" : "bottom: -6px;"}
`;

const PhaseBlock = styled.div<{ $isLast: boolean }>`
  position: relative;
  ${({ $isLast }) => !$isLast && `margin-bottom: ${theme.spacing.xxl};`}
`;

const MarkerDot = styled.div`
  position: absolute;
  left: -2rem;
  top: 1rem;
  transform: translate(-50%, -50%);
  margin-left: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  border: 2px solid white;
  box-shadow: 0 0 0 2px ${theme.colors.primaryBg};
`;

const PhaseTitle = styled.h3`
  margin: 0;
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
`;

const PhaseDescription = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textLight};
  margin: 0;
`;

const PhaseContent = styled.div`
  margin-top: 1rem;
`;

const Timeline: React.FC<TimelineProps> = ({ phases }) => {
  return (
    <TimelineWrapper className="fr-pt-4w">
      <TimelineEndpoint $position="start" />

      {phases.map((phase, index) => (
        <PhaseBlock key={index} $isLast={index === phases.length - 1}>
          <MarkerDot />
          {phase.badge}
          <PhaseTitle>{phase.title}</PhaseTitle>
          {phase.description && (
            <PhaseDescription>{phase.description}</PhaseDescription>
          )}
          {phase.content && <PhaseContent>{phase.content}</PhaseContent>}
        </PhaseBlock>
      ))}

      <TimelineEndpoint $position="end" />
    </TimelineWrapper>
  );
};

export default Timeline;
