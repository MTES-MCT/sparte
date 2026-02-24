import React from 'react';
import Notice from '@components/ui/Notice';

const FricheStatus: React.FC = () => (
  <Notice
    type="default"
    title="Données de friches non disponibles"
    message="Les données de friches issues des données Cartofriches ne sont pas disponibles sur ce territoire."
  />
);

export default FricheStatus;
