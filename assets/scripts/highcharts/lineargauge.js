import Highcharts from "highcharts";

(function lineargaugeModule(H) {
  H.seriesType("lineargauge", "column", null, {
    setVisible(...args) {
      H.seriesTypes.column.prototype.setVisible.apply(this, args);
      if (this.markLine) {
        this.markLine[this.visible ? "show" : "hide"]();
      }
    },
    drawPoints() {
      const series = this;
      const { chart } = this;
      const { inverted } = chart;
      const { xAxis } = this;
      const { yAxis } = this;
      const point = this.points[0];

      // Hide the column as it is unused for display purposes
      if (point.graphic) {
        point.graphic.hide();
      }

      // Create or animate the marker
      if (!this.markLine) {
        const path = inverted
          ? ["M", 0, 0, "L", -5, -5, "L", 5, -5, "L", 0, 0, "L", 0, xAxis.len]
          : ["M", 0, 0, "L", -5, -5, "L", -5, 5, "L", 0, 0, "L", xAxis.len, 0];

        this.markLine = chart.renderer
          .path(path)
          .attr({
            fill: series.color,
            stroke: series.color,
            "stroke-width": 1,
          })
          .add();
      }

      // Update position
      this.markLine.animate({
        translateX: inverted
          ? xAxis.left + yAxis.translate(point.y)
          : xAxis.left,
        translateY: inverted
          ? xAxis.top
          : yAxis.top + yAxis.len - yAxis.translate(point.y),
      });
    },
  });
})(Highcharts);
