import React from 'react';
import StatusNotice from './StatusNotice';

const FricheStatus: React.FC = () => (
  <StatusNotice
    title="Données de friches non disponibles"
    description="Les données de friches issues des données Cartofriches ne sont pas disponibles sur ce territoire."
  />
);

export default FricheStatus;
