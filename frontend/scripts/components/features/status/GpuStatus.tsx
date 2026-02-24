import React from 'react';
import Notice from '@components/ui/Notice';

const GpuStatus: React.FC = () => (
  <Notice
    type="default"
    title="Données de zonages d'urbanisme non disponibles"
    message="Les données de zonages d'urbanisme issus du GPU (Géoportail de l'Urbanisme) ne sont pas disponibles sur ce territoire."
  />
);

export default GpuStatus;
