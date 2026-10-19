import type * as Highcharts from 'highcharts';
import { showErrorToast } from '@components/ui/Toast';

/**
 * Télécharge un graphique en PNG, entièrement côté navigateur.
 * Aucun repli vers export.highcharts.com : en cas d'échec, l'utilisateur est prévenu par un toast.
 */
export const downloadChartPng = (chart?: Highcharts.Chart | null) => {
  if (!chart) return;
  chart.exportChartLocal({
    type: 'image/png',
    fallbackToExportServer: false,
    error: () => showErrorToast(
      "Le téléchargement de l'image a échoué",
      'Votre navigateur ne permet pas de générer ce graphique en PNG.',
    ),
  });
};
