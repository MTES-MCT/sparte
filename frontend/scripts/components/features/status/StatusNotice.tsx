import React from 'react';
import BaseCard from '@components/ui/BaseCard';

interface StatusNoticeProps {
  title: string;
  description: string;
}

const StatusNotice: React.FC<StatusNoticeProps> = ({ title, description }) => (
  <BaseCard>
    <div className="fr-notice fr-notice--info">
      <div className="fr-container--fluid fr-p-3w">
        <div className="fr-notice__body" style={{ flexDirection: 'column', display: 'flex', gap: '0.5rem' }}>
          <p className="fr-notice__title">{title}</p>
          <p className="fr-notice__desc fr-text--sm">{description}</p>
        </div>
      </div>
    </div>
  </BaseCard>
);

export default StatusNotice;
