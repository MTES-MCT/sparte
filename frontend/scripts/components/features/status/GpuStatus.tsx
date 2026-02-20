import React from 'react';
import StatusNotice from './StatusNotice';

const GpuStatus: React.FC = () => (
  <StatusNotice
    title="Données de zonages d'urbanisme non disponibles"
    description="Les données de zonages d'urbanisme issus du GPU (Géoportail de l'Urbanisme) ne sont pas disponibles sur ce territoire."
  />
);

export default GpuStatus;
