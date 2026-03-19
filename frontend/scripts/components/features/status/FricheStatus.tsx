import React from 'react';
import Notice from '@components/ui/Notice';

const FricheStatus: React.FC = () => (
  <Notice
    type="warning"
    title="Données de friches non disponibles."
    description="Les données de friches issues des données Cartofriches ne sont pas disponibles sur ce territoire."
  />
);

export default FricheStatus;
