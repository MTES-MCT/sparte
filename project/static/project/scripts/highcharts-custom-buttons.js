window.htmx.onLoad(() =>
{
  // Trigger full screen chart
  document.querySelectorAll('.fullscreen-chart').forEach((button) =>
  {
    button.onclick = () =>
    {
      const target = button.dataset.chartTarget
      const chartDom = document.getElementById(target)
      const chart = Highcharts.charts[Highcharts.attr(chartDom, 'data-highcharts-chart')]

      chart.fullscreen.toggle()
    }
  })

  // Export chart
  document.querySelectorAll('.export-chart').forEach((button) =>
  {
    button.onclick = (e) =>
    {
      const target = button.dataset.chartTarget
      const chartDom = document.getElementById(target)
      const chart = Highcharts.charts[Highcharts.attr(chartDom, 'data-highcharts-chart')]

      e.preventDefault()

      chart.exportChart({
        type: button.dataset.type,
        scale: 3,
      })
    }
  })
})
