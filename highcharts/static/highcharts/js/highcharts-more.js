/*
 Highcharts JS v10.3.2 (2022-11-28)

 (c) 2009-2021 Torstein Honsi

 License: www.highcharts.com/license
*/
(function (d) {
  "object" === typeof module && module.exports
    ? ((d["default"] = d), (module.exports = d))
    : "function" === typeof define && define.amd
      ? define("highcharts/highcharts-more", ["highcharts"], function (D) {
          d(D);
          d.Highcharts = D;
          return d;
        })
      : d("undefined" !== typeof Highcharts ? Highcharts : void 0);
})(function (d) {
  function D(b, c, h, a) {
    b.hasOwnProperty(c) ||
      ((b[c] = a.apply(null, h)),
      "function" === typeof CustomEvent &&
        window.dispatchEvent(
          new CustomEvent("HighchartsModuleLoaded", {
            detail: { path: c, module: b[c] },
          }),
        ));
  }
  d = d ? d._modules : {};
  D(
    d,
    "Extensions/Pane.js",
    [
      d["Core/Chart/Chart.js"],
      d["Series/CenteredUtilities.js"],
      d["Core/Globals.js"],
      d["Core/Pointer.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a, f) {
      function y(g, l, e, a, H) {
        var k = !0,
          c = e[0],
          v = e[1],
          J = Math.sqrt(Math.pow(g - c, 2) + Math.pow(l - v, 2));
        n(a) &&
          n(H) &&
          ((g = Math.atan2(q(l - v, 8), q(g - c, 8))),
          H !== a &&
            (k =
              a > H
                ? (g >= a && g <= Math.PI) || (g <= H && g >= -Math.PI)
                : g >= a && g <= q(H, 8)));
        return J <= Math.ceil(e[2] / 2) && k;
      }
      var d = f.addEvent,
        q = f.correctFloat,
        n = f.defined,
        E = f.extend,
        t = f.merge,
        p = f.pick,
        e = f.splat;
      b.prototype.collectionsWithUpdate.push("pane");
      f = (function () {
        function g(l, g) {
          this.options = this.chart = this.center = this.background = void 0;
          this.coll = "pane";
          this.defaultOptions = {
            center: ["50%", "50%"],
            size: "85%",
            innerSize: "0%",
            startAngle: 0,
          };
          this.defaultBackgroundOptions = {
            shape: "circle",
            borderWidth: 1,
            borderColor: "#cccccc",
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "#ffffff"],
                [1, "#e6e6e6"],
              ],
            },
            from: -Number.MAX_VALUE,
            innerRadius: 0,
            to: Number.MAX_VALUE,
            outerRadius: "105%",
          };
          this.init(l, g);
        }
        g.prototype.init = function (l, g) {
          this.chart = g;
          this.background = [];
          g.pane.push(this);
          this.setOptions(l);
        };
        g.prototype.setOptions = function (l) {
          this.options = t(
            this.defaultOptions,
            this.chart.angular ? { background: {} } : void 0,
            l,
          );
        };
        g.prototype.render = function () {
          var l = this.options,
            g = this.options.background,
            a = this.chart.renderer;
          this.group ||
            (this.group = a
              .g("pane-group")
              .attr({ zIndex: l.zIndex || 0 })
              .add());
          this.updateCenter();
          if (g)
            for (
              g = e(g),
                l = Math.max(g.length, this.background.length || 0),
                a = 0;
              a < l;
              a++
            )
              g[a] && this.axis
                ? this.renderBackground(
                    t(this.defaultBackgroundOptions, g[a]),
                    a,
                  )
                : this.background[a] &&
                  ((this.background[a] = this.background[a].destroy()),
                  this.background.splice(a, 1));
        };
        g.prototype.renderBackground = function (g, e) {
          var l = "animate",
            k = { class: "highcharts-pane " + (g.className || "") };
          this.chart.styledMode ||
            E(k, {
              fill: g.backgroundColor,
              stroke: g.borderColor,
              "stroke-width": g.borderWidth,
            });
          this.background[e] ||
            ((this.background[e] = this.chart.renderer.path().add(this.group)),
            (l = "attr"));
          this.background[e][l]({
            d: this.axis.getPlotBandPath(g.from, g.to, g),
          }).attr(k);
        };
        g.prototype.updateCenter = function (g) {
          this.center = (g || this.axis || {}).center = c.getCenter.call(this);
        };
        g.prototype.update = function (g, e) {
          t(!0, this.options, g);
          this.setOptions(this.options);
          this.render();
          this.chart.axes.forEach(function (g) {
            g.pane === this && ((g.pane = null), g.update({}, e));
          }, this);
        };
        return g;
      })();
      b.prototype.getHoverPane = function (g) {
        var e = this,
          k;
        g &&
          e.pane.forEach(function (l) {
            y(g.chartX - e.plotLeft, g.chartY - e.plotTop, l.center) && (k = l);
          });
        return k;
      };
      d(b, "afterIsInsidePlot", function (g) {
        if (this.polar) {
          var e = g.x - (g.options.paneCoordinates ? this.plotLeft : 0),
            k = g.y - (g.options.paneCoordinates ? this.plotTop : 0);
          if (g.options.inverted) {
            var a = [k, e];
            e = a[0];
            k = a[1];
          }
          g.isInsidePlot = this.pane.some(function (g) {
            return y(
              e,
              k,
              g.center,
              g.axis && g.axis.normalizedStartAngleRad,
              g.axis && g.axis.normalizedEndAngleRad,
            );
          });
        }
      });
      d(a, "beforeGetHoverData", function (g) {
        var e = this.chart;
        e.polar
          ? ((e.hoverPane = e.getHoverPane(g)),
            (g.filter = function (l) {
              return (
                l.visible &&
                !(!g.shared && l.directTouch) &&
                p(l.options.enableMouseTracking, !0) &&
                (!e.hoverPane || l.xAxis.pane === e.hoverPane)
              );
            }))
          : (e.hoverPane = void 0);
      });
      d(a, "afterGetHoverData", function (g) {
        var e = this.chart;
        g.hoverPoint &&
          g.hoverPoint.plotX &&
          g.hoverPoint.plotY &&
          e.hoverPane &&
          !y(g.hoverPoint.plotX, g.hoverPoint.plotY, e.hoverPane.center) &&
          (g.hoverPoint = void 0);
      });
      h.Pane = f;
      return h.Pane;
    },
  );
  D(
    d,
    "Series/AreaRange/AreaRangePoint.js",
    [d["Core/Series/SeriesRegistry.js"], d["Core/Utilities.js"]],
    function (b, c) {
      var h =
        (this && this.__extends) ||
        (function () {
          var a = function (c, b) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, c) {
                  a.__proto__ = c;
                }) ||
              function (a, c) {
                for (var b in c) c.hasOwnProperty(b) && (a[b] = c[b]);
              };
            return a(c, b);
          };
          return function (c, b) {
            function f() {
              this.constructor = c;
            }
            a(c, b);
            c.prototype =
              null === b
                ? Object.create(b)
                : ((f.prototype = b.prototype), new f());
          };
        })();
      b = b.seriesTypes.area.prototype;
      var a = b.pointClass.prototype,
        f = c.defined,
        d = c.isNumber;
      return (function (c) {
        function b() {
          var a = (null !== c && c.apply(this, arguments)) || this;
          a.high = void 0;
          a.low = void 0;
          a.options = void 0;
          a.plotX = void 0;
          a.series = void 0;
          return a;
        }
        h(b, c);
        b.prototype.setState = function () {
          var c = this.state,
            b = this.series,
            h = b.chart.polar;
          f(this.plotHigh) || (this.plotHigh = b.yAxis.toPixels(this.high, !0));
          f(this.plotLow) ||
            (this.plotLow = this.plotY = b.yAxis.toPixels(this.low, !0));
          b.stateMarkerGraphic &&
            ((b.lowerStateMarkerGraphic = b.stateMarkerGraphic),
            (b.stateMarkerGraphic = b.upperStateMarkerGraphic));
          this.graphic = this.graphics && this.graphics[1];
          this.plotY = this.plotHigh;
          h && d(this.plotHighX) && (this.plotX = this.plotHighX);
          a.setState.apply(this, arguments);
          this.state = c;
          this.plotY = this.plotLow;
          this.graphic = this.graphics && this.graphics[0];
          h && d(this.plotLowX) && (this.plotX = this.plotLowX);
          b.stateMarkerGraphic &&
            ((b.upperStateMarkerGraphic = b.stateMarkerGraphic),
            (b.stateMarkerGraphic = b.lowerStateMarkerGraphic),
            (b.lowerStateMarkerGraphic = void 0));
          a.setState.apply(this, arguments);
        };
        b.prototype.haloPath = function () {
          var b = this.series.chart.polar,
            c = [];
          this.plotY = this.plotLow;
          b && d(this.plotLowX) && (this.plotX = this.plotLowX);
          this.isInside && (c = a.haloPath.apply(this, arguments));
          this.plotY = this.plotHigh;
          b && d(this.plotHighX) && (this.plotX = this.plotHighX);
          this.isTopInside && (c = c.concat(a.haloPath.apply(this, arguments)));
          return c;
        };
        b.prototype.isValid = function () {
          return d(this.low) && d(this.high);
        };
        return b;
      })(b.pointClass);
    },
  );
  D(
    d,
    "Series/AreaRange/AreaRangeSeries.js",
    [
      d["Series/AreaRange/AreaRangePoint.js"],
      d["Core/Globals.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a) {
      var f =
        (this && this.__extends) ||
        (function () {
          var g = function (e, l) {
            g =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (g, e) {
                  g.__proto__ = e;
                }) ||
              function (g, e) {
                for (var l in e) e.hasOwnProperty(l) && (g[l] = e[l]);
              };
            return g(e, l);
          };
          return function (e, l) {
            function k() {
              this.constructor = e;
            }
            g(e, l);
            e.prototype =
              null === l
                ? Object.create(l)
                : ((k.prototype = l.prototype), new k());
          };
        })();
      c = c.noop;
      var d = h.seriesTypes,
        m = d.area,
        q = d.area.prototype,
        n = d.column.prototype;
      d = a.addEvent;
      var E = a.defined,
        t = a.extend,
        p = a.isArray,
        e = a.isNumber,
        g = a.pick,
        l = a.merge,
        k = {
          lineWidth: 1,
          threshold: null,
          tooltip: {
            pointFormat:
              '<span style="color:{series.color}">\u25cf</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>',
          },
          trackByArea: !0,
          dataLabels: {
            align: void 0,
            verticalAlign: void 0,
            xLow: 0,
            xHigh: 0,
            yLow: 0,
            yHigh: 0,
          },
        };
      a = (function (e) {
        function a() {
          var g = (null !== e && e.apply(this, arguments)) || this;
          g.data = void 0;
          g.options = void 0;
          g.points = void 0;
          g.lowerStateMarkerGraphic = void 0;
          g.xAxis = void 0;
          return g;
        }
        f(a, e);
        a.prototype.toYData = function (g) {
          return [g.low, g.high];
        };
        a.prototype.highToXY = function (g) {
          var e = this.chart,
            l = this.xAxis.postTranslate(
              g.rectPlotX || 0,
              this.yAxis.len - (g.plotHigh || 0),
            );
          g.plotHighX = l.x - e.plotLeft;
          g.plotHigh = l.y - e.plotTop;
          g.plotLowX = g.plotX;
        };
        a.prototype.getGraphPath = function (e) {
          var l = [],
            a = [],
            k = q.getGraphPath,
            b = this.options,
            c = this.chart.polar,
            w = c && !1 !== b.connectEnds,
            B = b.connectNulls,
            z,
            f = b.step;
          e = e || this.points;
          for (z = e.length; z--; ) {
            var r = e[z];
            var p = c
              ? { plotX: r.rectPlotX, plotY: r.yBottom, doCurve: !1 }
              : { plotX: r.plotX, plotY: r.plotY, doCurve: !1 };
            r.isNull || w || B || (e[z + 1] && !e[z + 1].isNull) || a.push(p);
            var h = {
              polarPlotY: r.polarPlotY,
              rectPlotX: r.rectPlotX,
              yBottom: r.yBottom,
              plotX: g(r.plotHighX, r.plotX),
              plotY: r.plotHigh,
              isNull: r.isNull,
            };
            a.push(h);
            l.push(h);
            r.isNull || w || B || (e[z - 1] && !e[z - 1].isNull) || a.push(p);
          }
          e = k.call(this, e);
          f &&
            (!0 === f && (f = "left"),
            (b.step = { left: "right", center: "center", right: "left" }[f]));
          l = k.call(this, l);
          a = k.call(this, a);
          b.step = f;
          b = [].concat(e, l);
          !this.chart.polar &&
            a[0] &&
            "M" === a[0][0] &&
            (a[0] = ["L", a[0][1], a[0][2]]);
          this.graphPath = b;
          this.areaPath = e.concat(a);
          b.isArea = !0;
          b.xMap = e.xMap;
          this.areaPath.xMap = e.xMap;
          return b;
        };
        a.prototype.drawDataLabels = function () {
          var g = this.points,
            e = g.length,
            l = [],
            a = this.options.dataLabels,
            k = this.chart.inverted,
            b,
            w;
          if (a) {
            if (p(a)) {
              var c = a[0] || { enabled: !1 };
              var z = a[1] || { enabled: !1 };
            } else
              (c = t({}, a)),
                (c.x = a.xHigh),
                (c.y = a.yHigh),
                (z = t({}, a)),
                (z.x = a.xLow),
                (z.y = a.yLow);
            if (c.enabled || this._hasPointLabels) {
              for (b = e; b--; )
                if ((w = g[b])) {
                  var f = w.plotHigh;
                  f = void 0 === f ? 0 : f;
                  var r = w.plotLow;
                  r = void 0 === r ? 0 : r;
                  r = c.inside ? f < r : f > r;
                  w.y = w.high;
                  w._plotY = w.plotY;
                  w.plotY = f;
                  l[b] = w.dataLabel;
                  w.dataLabel = w.dataLabelUpper;
                  w.below = r;
                  k
                    ? c.align || (c.align = r ? "right" : "left")
                    : c.verticalAlign ||
                      (c.verticalAlign = r ? "top" : "bottom");
                }
              this.options.dataLabels = c;
              q.drawDataLabels && q.drawDataLabels.apply(this, arguments);
              for (b = e; b--; )
                if ((w = g[b]))
                  (w.dataLabelUpper = w.dataLabel),
                    (w.dataLabel = l[b]),
                    delete w.dataLabels,
                    (w.y = w.low),
                    (w.plotY = w._plotY);
            }
            if (z.enabled || this._hasPointLabels) {
              for (b = e; b--; )
                if ((w = g[b]))
                  (l = w.plotHigh),
                    (f = void 0 === l ? 0 : l),
                    (l = w.plotLow),
                    (r = void 0 === l ? 0 : l),
                    (r = z.inside ? f < r : f > r),
                    (w.below = !r),
                    k
                      ? z.align || (z.align = r ? "left" : "right")
                      : z.verticalAlign ||
                        (z.verticalAlign = r ? "bottom" : "top");
              this.options.dataLabels = z;
              q.drawDataLabels && q.drawDataLabels.apply(this, arguments);
            }
            if (c.enabled)
              for (b = e; b--; )
                if ((w = g[b]))
                  w.dataLabels = [w.dataLabelUpper, w.dataLabel].filter(
                    function (g) {
                      return !!g;
                    },
                  );
            this.options.dataLabels = a;
          }
        };
        a.prototype.alignDataLabel = function () {
          n.alignDataLabel.apply(this, arguments);
        };
        a.prototype.drawPoints = function () {
          var e = this.points.length,
            l;
          q.drawPoints.apply(this, arguments);
          for (l = 0; l < e; ) {
            var a = this.points[l];
            a.graphics = a.graphics || [];
            a.origProps = {
              plotY: a.plotY,
              plotX: a.plotX,
              isInside: a.isInside,
              negative: a.negative,
              zone: a.zone,
              y: a.y,
            };
            a.graphic && (a.graphics[0] = a.graphic);
            a.graphic = a.graphics[1];
            a.plotY = a.plotHigh;
            E(a.plotHighX) && (a.plotX = a.plotHighX);
            a.y = g(a.high, a.origProps.y);
            a.negative = a.y < (this.options.threshold || 0);
            this.zones.length && (a.zone = a.getZone());
            this.chart.polar ||
              (a.isInside = a.isTopInside =
                "undefined" !== typeof a.plotY &&
                0 <= a.plotY &&
                a.plotY <= this.yAxis.len &&
                0 <= a.plotX &&
                a.plotX <= this.xAxis.len);
            l++;
          }
          q.drawPoints.apply(this, arguments);
          for (l = 0; l < e; )
            (a = this.points[l]),
              (a.graphics = a.graphics || []),
              a.graphic && (a.graphics[1] = a.graphic),
              (a.graphic = a.graphics[0]),
              a.origProps && (t(a, a.origProps), delete a.origProps),
              l++;
        };
        a.defaultOptions = l(m.defaultOptions, k);
        return a;
      })(m);
      d(
        a,
        "afterTranslate",
        function () {
          var g = this;
          "low,high" === this.pointArrayMap.join(",") &&
            this.points.forEach(function (a) {
              var l = a.high,
                k = a.plotY;
              a.isNull
                ? (a.plotY = void 0)
                : ((a.plotLow = k),
                  (a.plotHigh = e(l)
                    ? g.yAxis.translate(
                        g.dataModify ? g.dataModify.modifyValue(l) : l,
                        !1,
                        !0,
                        void 0,
                        !0,
                      )
                    : void 0),
                  g.dataModify && (a.yBottom = a.plotHigh));
            });
        },
        { order: 0 },
      );
      d(
        a,
        "afterTranslate",
        function () {
          var g = this;
          this.chart.polar &&
            this.points.forEach(function (e) {
              g.highToXY(e);
              e.plotLow = e.plotY;
              e.tooltipPos = [
                ((e.plotHighX || 0) + (e.plotLowX || 0)) / 2,
                ((e.plotHigh || 0) + (e.plotLow || 0)) / 2,
              ];
            });
        },
        { order: 3 },
      );
      t(a.prototype, {
        deferTranslatePolar: !0,
        pointArrayMap: ["low", "high"],
        pointClass: b,
        pointValKey: "low",
        setStackedPoints: c,
      });
      h.registerSeriesType("arearange", a);
      ("");
      return a;
    },
  );
  D(
    d,
    "Series/AreaSplineRange/AreaSplineRangeSeries.js",
    [
      d["Series/AreaRange/AreaRangeSeries.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h) {
      var a =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var e in b) b.hasOwnProperty(e) && (a[e] = b[e]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function f() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((f.prototype = c.prototype), new f());
            };
          })(),
        f = c.seriesTypes.spline.prototype,
        d = h.merge;
      h = h.extend;
      var m = (function (c) {
        function f() {
          var a = (null !== c && c.apply(this, arguments)) || this;
          a.options = void 0;
          a.data = void 0;
          a.points = void 0;
          return a;
        }
        a(f, c);
        f.defaultOptions = d(b.defaultOptions);
        return f;
      })(b);
      h(m.prototype, { getPointSpline: f.getPointSpline });
      c.registerSeriesType("areasplinerange", m);
      ("");
      return m;
    },
  );
  D(
    d,
    "Series/BoxPlot/BoxPlotSeries.js",
    [
      d["Series/Column/ColumnSeries.js"],
      d["Core/Globals.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a) {
      var f =
        (this && this.__extends) ||
        (function () {
          var a = function (b, c) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, e) {
                  a.__proto__ = e;
                }) ||
              function (a, e) {
                for (var g in e) e.hasOwnProperty(g) && (a[g] = e[g]);
              };
            return a(b, c);
          };
          return function (b, c) {
            function f() {
              this.constructor = b;
            }
            a(b, c);
            b.prototype =
              null === c
                ? Object.create(c)
                : ((f.prototype = c.prototype), new f());
          };
        })();
      c = c.noop;
      var d = a.extend,
        m = a.merge,
        q = a.pick;
      a = (function (a) {
        function c() {
          var b = (null !== a && a.apply(this, arguments)) || this;
          b.data = void 0;
          b.options = void 0;
          b.points = void 0;
          return b;
        }
        f(c, a);
        c.prototype.pointAttribs = function () {
          return {};
        };
        c.prototype.translate = function () {
          var b = this.yAxis,
            c = this.pointArrayMap;
          a.prototype.translate.apply(this);
          this.points.forEach(function (a) {
            c.forEach(function (g) {
              null !== a[g] && (a[g + "Plot"] = b.translate(a[g], 0, 1, 0, 1));
            });
            a.plotHigh = a.highPlot;
          });
        };
        c.prototype.drawPoints = function () {
          var a = this,
            b = a.options,
            e = a.chart,
            g = e.renderer,
            l,
            c,
            f,
            h,
            d,
            F,
            v = 0,
            m,
            I,
            L,
            w,
            B = !1 !== a.doQuartiles,
            z,
            G = a.options.whiskerLength;
          a.points.forEach(function (k) {
            var r = k.graphic,
              H = r ? "animate" : "attr",
              J = k.shapeArgs,
              M = {},
              p = {},
              y = {},
              u = {},
              C = k.color || a.color;
            "undefined" !== typeof k.plotY &&
              ((m = Math.round(J.width)),
              (I = Math.floor(J.x)),
              (L = I + m),
              (w = Math.round(m / 2)),
              (l = Math.floor(B ? k.q1Plot : k.lowPlot)),
              (c = Math.floor(B ? k.q3Plot : k.lowPlot)),
              (f = Math.floor(k.highPlot)),
              (h = Math.floor(k.lowPlot)),
              r ||
                ((k.graphic = r = g.g("point").add(a.group)),
                (k.stem = g.path().addClass("highcharts-boxplot-stem").add(r)),
                G &&
                  (k.whiskers = g
                    .path()
                    .addClass("highcharts-boxplot-whisker")
                    .add(r)),
                B &&
                  (k.box = g
                    .path(void 0)
                    .addClass("highcharts-boxplot-box")
                    .add(r)),
                (k.medianShape = g
                  .path(void 0)
                  .addClass("highcharts-boxplot-median")
                  .add(r))),
              e.styledMode ||
                ((p.stroke = k.stemColor || b.stemColor || C),
                (p["stroke-width"] = q(k.stemWidth, b.stemWidth, b.lineWidth)),
                (p.dashstyle =
                  k.stemDashStyle || b.stemDashStyle || b.dashStyle),
                k.stem.attr(p),
                G &&
                  ((y.stroke = k.whiskerColor || b.whiskerColor || C),
                  (y["stroke-width"] = q(
                    k.whiskerWidth,
                    b.whiskerWidth,
                    b.lineWidth,
                  )),
                  (y.dashstyle =
                    k.whiskerDashStyle || b.whiskerDashStyle || b.dashStyle),
                  k.whiskers.attr(y)),
                B &&
                  ((M.fill = k.fillColor || b.fillColor || C),
                  (M.stroke = b.lineColor || C),
                  (M["stroke-width"] = b.lineWidth || 0),
                  (M.dashstyle =
                    k.boxDashStyle || b.boxDashStyle || b.dashStyle),
                  k.box.attr(M)),
                (u.stroke = k.medianColor || b.medianColor || C),
                (u["stroke-width"] = q(
                  k.medianWidth,
                  b.medianWidth,
                  b.lineWidth,
                )),
                (u.dashstyle =
                  k.medianDashStyle || b.medianDashStyle || b.dashStyle),
                k.medianShape.attr(u)),
              (F = (k.stem.strokeWidth() % 2) / 2),
              (v = I + w + F),
              (r = [
                ["M", v, c],
                ["L", v, f],
                ["M", v, l],
                ["L", v, h],
              ]),
              k.stem[H]({ d: r }),
              B &&
                ((F = (k.box.strokeWidth() % 2) / 2),
                (l = Math.floor(l) + F),
                (c = Math.floor(c) + F),
                (I += F),
                (L += F),
                (r = [
                  ["M", I, c],
                  ["L", I, l],
                  ["L", L, l],
                  ["L", L, c],
                  ["L", I, c],
                  ["Z"],
                ]),
                k.box[H]({ d: r })),
              G &&
                ((F = (k.whiskers.strokeWidth() % 2) / 2),
                (f += F),
                (h += F),
                (z = /%$/.test(G) ? (w * parseFloat(G)) / 100 : G / 2),
                (r = [
                  ["M", v - z, f],
                  ["L", v + z, f],
                  ["M", v - z, h],
                  ["L", v + z, h],
                ]),
                k.whiskers[H]({ d: r })),
              (d = Math.round(k.medianPlot)),
              (F = (k.medianShape.strokeWidth() % 2) / 2),
              (d += F),
              (r = [
                ["M", I, d],
                ["L", L, d],
              ]),
              k.medianShape[H]({ d: r }));
          });
        };
        c.prototype.toYData = function (a) {
          return [a.low, a.q1, a.median, a.q3, a.high];
        };
        c.defaultOptions = m(b.defaultOptions, {
          threshold: null,
          tooltip: {
            pointFormat:
              '<span style="color:{point.color}">\u25cf</span> <b>{series.name}</b><br/>Maximum: {point.high}<br/>Upper quartile: {point.q3}<br/>Median: {point.median}<br/>Lower quartile: {point.q1}<br/>Minimum: {point.low}<br/>',
          },
          whiskerLength: "50%",
          fillColor: "#ffffff",
          lineWidth: 1,
          medianWidth: 2,
          whiskerWidth: 2,
        });
        return c;
      })(b);
      d(a.prototype, {
        pointArrayMap: ["low", "q1", "median", "q3", "high"],
        pointValKey: "high",
        drawDataLabels: c,
        setStackedPoints: c,
      });
      h.registerSeriesType("boxplot", a);
      ("");
      return a;
    },
  );
  D(d, "Series/Bubble/BubbleLegendDefaults.js", [], function () {
    return {
      borderColor: void 0,
      borderWidth: 2,
      className: void 0,
      color: void 0,
      connectorClassName: void 0,
      connectorColor: void 0,
      connectorDistance: 60,
      connectorWidth: 1,
      enabled: !1,
      labels: {
        className: void 0,
        allowOverlap: !1,
        format: "",
        formatter: void 0,
        align: "right",
        style: { fontSize: "10px", color: "#000000" },
        x: 0,
        y: 0,
      },
      maxSize: 60,
      minSize: 10,
      legendIndex: 0,
      ranges: {
        value: void 0,
        borderColor: void 0,
        color: void 0,
        connectorColor: void 0,
      },
      sizeBy: "area",
      sizeByAbsoluteValue: !1,
      zIndex: 1,
      zThreshold: 0,
    };
  });
  D(
    d,
    "Series/Bubble/BubbleLegendItem.js",
    [
      d["Core/Color/Color.js"],
      d["Core/FormatUtilities.js"],
      d["Core/Globals.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a) {
      var f = b.parse,
        d = h.noop,
        m = a.arrayMax,
        q = a.arrayMin,
        n = a.isNumber,
        E = a.merge,
        t = a.pick,
        p = a.stableSort;
      b = (function () {
        function a(a, e) {
          this.options =
            this.symbols =
            this.visible =
            this.selected =
            this.ranges =
            this.movementX =
            this.maxLabel =
            this.legend =
            this.fontMetrics =
            this.chart =
              void 0;
          this.setState = d;
          this.init(a, e);
        }
        a.prototype.init = function (a, e) {
          this.options = a;
          this.visible = !0;
          this.chart = e.chart;
          this.legend = e;
        };
        a.prototype.addToLegend = function (a) {
          a.splice(this.options.legendIndex, 0, this);
        };
        a.prototype.drawLegendSymbol = function (a) {
          var g = this.chart,
            e = t(a.options.itemDistance, 20),
            b = this.legendItem || {},
            c = this.options,
            f = c.ranges,
            h = c.connectorDistance;
          this.fontMetrics = g.renderer.fontMetrics(c.labels.style.fontSize);
          f && f.length && n(f[0].value)
            ? (p(f, function (a, g) {
                return g.value - a.value;
              }),
              (this.ranges = f),
              this.setOptions(),
              this.render(),
              (a = this.getMaxLabelSize()),
              (f = this.ranges[0].radius),
              (g = 2 * f),
              (h = h - f + a.width),
              (h = 0 < h ? h : 0),
              (this.maxLabel = a),
              (this.movementX = "left" === c.labels.align ? h : 0),
              (b.labelWidth = g + h + e),
              (b.labelHeight = g + this.fontMetrics.h / 2))
            : (a.options.bubbleLegend.autoRanges = !0);
        };
        a.prototype.setOptions = function () {
          var a = this.ranges,
            e = this.options,
            b = this.chart.series[e.seriesIndex],
            c = this.legend.baseline,
            h = { zIndex: e.zIndex, "stroke-width": e.borderWidth },
            d = { zIndex: e.zIndex, "stroke-width": e.connectorWidth },
            p = {
              align:
                this.legend.options.rtl || "left" === e.labels.align
                  ? "right"
                  : "left",
              zIndex: e.zIndex,
            },
            v = b.options.marker.fillOpacity,
            m = this.chart.styledMode;
          a.forEach(function (g, l) {
            m ||
              ((h.stroke = t(g.borderColor, e.borderColor, b.color)),
              (h.fill = t(
                g.color,
                e.color,
                1 !== v ? f(b.color).setOpacity(v).get("rgba") : b.color,
              )),
              (d.stroke = t(g.connectorColor, e.connectorColor, b.color)));
            a[l].radius = this.getRangeRadius(g.value);
            a[l] = E(a[l], { center: a[0].radius - a[l].radius + c });
            m ||
              E(!0, a[l], {
                bubbleAttribs: E(h),
                connectorAttribs: E(d),
                labelAttribs: p,
              });
          }, this);
        };
        a.prototype.getRangeRadius = function (a) {
          var e = this.options;
          return this.chart.series[this.options.seriesIndex].getRadius.call(
            this,
            e.ranges[e.ranges.length - 1].value,
            e.ranges[0].value,
            e.minSize,
            e.maxSize,
            a,
          );
        };
        a.prototype.render = function () {
          var a = this.legendItem || {},
            e = this.chart.renderer,
            b = this.options.zThreshold;
          this.symbols ||
            (this.symbols = { connectors: [], bubbleItems: [], labels: [] });
          a.symbol = e.g("bubble-legend");
          a.label = e.g("bubble-legend-item");
          a.symbol.translateX = 0;
          e = a.symbol.translateY = 0;
          for (var c = this.ranges; e < c.length; e++) {
            var f = c[e];
            f.value >= b && this.renderRange(f);
          }
          a.symbol.add(a.label);
          a.label.add(a.group);
          this.hideOverlappingLabels();
        };
        a.prototype.renderRange = function (a) {
          var e = this.options,
            g = e.labels,
            b = this.chart,
            c = b.series[e.seriesIndex],
            f = b.renderer,
            h = this.symbols;
          b = h.labels;
          var d = a.center,
            p = Math.abs(a.radius),
            I = e.connectorDistance || 0,
            L = g.align,
            w = e.connectorWidth,
            B = this.ranges[0].radius || 0,
            z = d - p - e.borderWidth / 2 + w / 2,
            G = this.fontMetrics;
          G = G.f / 2 - (G.h - G.f) / 2;
          var r = f.styledMode;
          I = this.legend.options.rtl || "left" === L ? -I : I;
          "center" === L &&
            ((I = 0),
            (e.connectorDistance = 0),
            (a.labelAttribs.align = "center"));
          L = z + e.labels.y;
          var m = B + I + e.labels.x;
          h.bubbleItems.push(
            f
              .circle(B, d + ((z % 1 ? 1 : 0.5) - (w % 2 ? 0 : 0.5)), p)
              .attr(r ? {} : a.bubbleAttribs)
              .addClass(
                (r ? "highcharts-color-" + c.colorIndex + " " : "") +
                  "highcharts-bubble-legend-symbol " +
                  (e.className || ""),
              )
              .add(this.legendItem.symbol),
          );
          h.connectors.push(
            f
              .path(
                f.crispLine(
                  [
                    ["M", B, z],
                    ["L", B + I, z],
                  ],
                  e.connectorWidth,
                ),
              )
              .attr(r ? {} : a.connectorAttribs)
              .addClass(
                (r
                  ? "highcharts-color-" + this.options.seriesIndex + " "
                  : "") +
                  "highcharts-bubble-legend-connectors " +
                  (e.connectorClassName || ""),
              )
              .add(this.legendItem.symbol),
          );
          a = f
            .text(this.formatLabel(a), m, L + G)
            .attr(r ? {} : a.labelAttribs)
            .css(r ? {} : g.style)
            .addClass(
              "highcharts-bubble-legend-labels " + (e.labels.className || ""),
            )
            .add(this.legendItem.symbol);
          b.push(a);
          a.placed = !0;
          a.alignAttr = { x: m, y: L + G };
        };
        a.prototype.getMaxLabelSize = function () {
          var a, e;
          this.symbols.labels.forEach(function (g) {
            e = g.getBBox(!0);
            a = a ? (e.width > a.width ? e : a) : e;
          });
          return a || {};
        };
        a.prototype.formatLabel = function (a) {
          var e = this.options,
            g = e.labels.formatter;
          e = e.labels.format;
          var b = this.chart.numberFormatter;
          return e ? c.format(e, a) : g ? g.call(a) : b(a.value, 1);
        };
        a.prototype.hideOverlappingLabels = function () {
          var a = this.chart,
            e = this.symbols;
          !this.options.labels.allowOverlap &&
            e &&
            (a.hideOverlappingLabels(e.labels),
            e.labels.forEach(function (a, g) {
              a.newOpacity
                ? a.newOpacity !== a.oldOpacity && e.connectors[g].show()
                : e.connectors[g].hide();
            }));
        };
        a.prototype.getRanges = function () {
          var a = this.legend.bubbleLegend,
            e = a.options.ranges,
            b,
            c = Number.MAX_VALUE,
            f = -Number.MAX_VALUE;
          a.chart.series.forEach(function (a) {
            a.isBubble &&
              !a.ignoreSeries &&
              ((b = a.zData.filter(n)),
              b.length &&
                ((c = t(
                  a.options.zMin,
                  Math.min(
                    c,
                    Math.max(
                      q(b),
                      !1 === a.options.displayNegative
                        ? a.options.zThreshold
                        : -Number.MAX_VALUE,
                    ),
                  ),
                )),
                (f = t(a.options.zMax, Math.max(f, m(b))))));
          });
          var h =
            c === f
              ? [{ value: f }]
              : [
                  { value: c },
                  { value: (c + f) / 2 },
                  { value: f, autoRanges: !0 },
                ];
          e.length && e[0].radius && h.reverse();
          h.forEach(function (a, g) {
            e && e[g] && (h[g] = E(e[g], a));
          });
          return h;
        };
        a.prototype.predictBubbleSizes = function () {
          var a = this.chart,
            e = this.fontMetrics,
            b = a.legend.options,
            c = b.floating,
            f = (b = "horizontal" === b.layout) ? a.legend.lastLineHeight : 0,
            h = a.plotSizeX,
            d = a.plotSizeY,
            v = a.series[this.options.seriesIndex],
            p = v.getPxExtremes();
          a = Math.ceil(p.minPxSize);
          p = Math.ceil(p.maxPxSize);
          var I = Math.min(d, h);
          v = v.options.maxSize;
          if (c || !/%$/.test(v)) e = p;
          else if (
            ((v = parseFloat(v)),
            (e = ((I + f - e.h / 2) * v) / 100 / (v / 100 + 1)),
            (b && d - e >= h) || (!b && h - e >= d))
          )
            e = p;
          return [a, Math.ceil(e)];
        };
        a.prototype.updateRanges = function (a, e) {
          var b = this.legend.options.bubbleLegend;
          b.minSize = a;
          b.maxSize = e;
          b.ranges = this.getRanges();
        };
        a.prototype.correctSizes = function () {
          var a = this.legend,
            e = this.chart.series[this.options.seriesIndex].getPxExtremes();
          1 < Math.abs(Math.ceil(e.maxPxSize) - this.options.maxSize) &&
            (this.updateRanges(this.options.minSize, e.maxPxSize), a.render());
        };
        return a;
      })();
      ("");
      return b;
    },
  );
  D(
    d,
    "Series/Bubble/BubbleLegendComposition.js",
    [
      d["Series/Bubble/BubbleLegendDefaults.js"],
      d["Series/Bubble/BubbleLegendItem.js"],
      d["Core/Defaults.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a) {
      function f(a, b, g) {
        var c = this.legend,
          k = 0 <= d(this),
          f;
        if (
          c &&
          c.options.enabled &&
          c.bubbleLegend &&
          c.options.bubbleLegend.autoRanges &&
          k
        ) {
          var l = c.bubbleLegend.options;
          k = c.bubbleLegend.predictBubbleSizes();
          c.bubbleLegend.updateRanges(k[0], k[1]);
          l.placed ||
            ((c.group.placed = !1),
            c.allItems.forEach(function (a) {
              f = a.legendItem || {};
              f.group && (f.group.translateY = null);
            }));
          c.render();
          this.getMargins();
          this.axes.forEach(function (a) {
            a.visible && a.render();
            l.placed ||
              (a.setScale(),
              a.updateNames(),
              e(a.ticks, function (a) {
                a.isNew = !0;
                a.isNewLabel = !0;
              }));
          });
          l.placed = !0;
          this.getMargins();
          a.call(this, b, g);
          c.bubbleLegend.correctSizes();
          E(c, m(c));
        } else
          a.call(this, b, g),
            c &&
              c.options.enabled &&
              c.bubbleLegend &&
              (c.render(), E(c, m(c)));
      }
      function d(a) {
        a = a.series;
        for (var e = 0; e < a.length; ) {
          if (a[e] && a[e].isBubble && a[e].visible && a[e].zData.length)
            return e;
          e++;
        }
        return -1;
      }
      function m(a) {
        a = a.allItems;
        var e = [],
          b = a.length,
          g,
          c = 0;
        for (g = 0; g < b; g++) {
          var f = a[g].legendItem || {};
          var l = (a[g + 1] || {}).legendItem || {};
          f.labelHeight && (a[g].itemHeight = f.labelHeight);
          if (a[g] === a[b - 1] || f.y !== l.y) {
            e.push({ height: 0 });
            f = e[e.length - 1];
            for (c; c <= g; c++)
              a[c].itemHeight > f.height && (f.height = a[c].itemHeight);
            f.step = g;
          }
        }
        return e;
      }
      function q(a) {
        var e = this.bubbleLegend,
          b = this.options,
          g = b.bubbleLegend,
          f = d(this.chart);
        e &&
          e.ranges &&
          e.ranges.length &&
          (g.ranges.length && (g.autoRanges = !!g.ranges[0].autoRanges),
          this.destroyItem(e));
        0 <= f &&
          b.enabled &&
          g.enabled &&
          ((g.seriesIndex = f),
          (this.bubbleLegend = new c(g, this)),
          this.bubbleLegend.addToLegend(a.allItems));
      }
      function n() {
        var a = this.chart,
          e = this.visible,
          b = this.chart.legend;
        b &&
          b.bubbleLegend &&
          ((this.visible = !e),
          (this.ignoreSeries = e),
          (a = 0 <= d(a)),
          b.bubbleLegend.visible !== a &&
            (b.update({ bubbleLegend: { enabled: a } }),
            (b.bubbleLegend.visible = a)),
          (this.visible = e));
      }
      function E(a, e) {
        var b = a.options.rtl,
          g,
          c,
          f,
          l,
          k = 0;
        a.allItems.forEach(function (a, w) {
          l = a.legendItem || {};
          if (l.group) {
            g = l.group.translateX || 0;
            c = l.y || 0;
            if ((f = a.movementX) || (b && a.ranges))
              (f = b ? g - a.options.maxSize / 2 : g + f),
                l.group.attr({ translateX: f });
            w > e[k].step && k++;
            l.group.attr({ translateY: Math.round(c + e[k].height / 2) });
            l.y = c + e[k].height / 2;
          }
        });
      }
      var t = h.setOptions,
        p = a.addEvent,
        e = a.objectEach,
        g = a.wrap,
        l = [];
      return {
        compose: function (a, e, c) {
          -1 === l.indexOf(a) &&
            (l.push(a),
            t({ legend: { bubbleLegend: b } }),
            g(a.prototype, "drawChartBox", f));
          -1 === l.indexOf(e) && (l.push(e), p(e, "afterGetAllItems", q));
          -1 === l.indexOf(c) && (l.push(c), p(c, "legendItemClick", n));
        },
      };
    },
  );
  D(
    d,
    "Series/Bubble/BubblePoint.js",
    [
      d["Core/Series/Point.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h) {
      var a =
        (this && this.__extends) ||
        (function () {
          var a = function (b, c) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, b) {
                  a.__proto__ = b;
                }) ||
              function (a, b) {
                for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
              };
            return a(b, c);
          };
          return function (b, c) {
            function f() {
              this.constructor = b;
            }
            a(b, c);
            b.prototype =
              null === c
                ? Object.create(c)
                : ((f.prototype = c.prototype), new f());
          };
        })();
      h = h.extend;
      c = (function (c) {
        function f() {
          var a = (null !== c && c.apply(this, arguments)) || this;
          a.options = void 0;
          a.series = void 0;
          return a;
        }
        a(f, c);
        f.prototype.haloPath = function (a) {
          return b.prototype.haloPath.call(
            this,
            0 === a ? 0 : (this.marker ? this.marker.radius || 0 : 0) + a,
          );
        };
        return f;
      })(c.seriesTypes.scatter.prototype.pointClass);
      h(c.prototype, { ttBelow: !1 });
      return c;
    },
  );
  D(
    d,
    "Series/Bubble/BubbleSeries.js",
    [
      d["Series/Bubble/BubbleLegendComposition.js"],
      d["Series/Bubble/BubblePoint.js"],
      d["Core/Color/Color.js"],
      d["Core/Globals.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a, f, d) {
      function m() {
        var a = this,
          e = this.len,
          b = this.chart,
          c = this.isXAxis,
          g = c ? "xData" : "yData",
          f = this.min,
          l = this.max - f,
          k = 0,
          h = e,
          d = e / l,
          p;
        this.series.forEach(function (e) {
          if (
            e.bubblePadding &&
            (e.visible || !b.options.chart.ignoreHiddenSeries)
          ) {
            p = a.allowZoomOutside = !0;
            var w = e[g];
            c &&
              ((e.onPoint || e).getRadii(0, 0, e),
              e.onPoint && (e.radii = e.onPoint.radii));
            if (0 < l)
              for (var B = w.length; B--; )
                if (J(w[B]) && a.dataMin <= w[B] && w[B] <= a.max) {
                  var z = (e.radii && e.radii[B]) || 0;
                  k = Math.min((w[B] - f) * d - z, k);
                  h = Math.max((w[B] - f) * d + z, h);
                }
          }
        });
        p &&
          0 < l &&
          !this.logarithmic &&
          ((h -= e),
          (d *= (e + Math.max(0, k) - Math.min(h, e)) / e),
          [
            ["min", "userMin", k],
            ["max", "userMax", h],
          ].forEach(function (e) {
            "undefined" === typeof M(a.options[e[0]], a[e[1]]) &&
              (a[e[0]] += e[2] / d);
          }));
      }
      var y =
          (this && this.__extends) ||
          (function () {
            var a = function (e, b) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, e) {
                    a.__proto__ = e;
                  }) ||
                function (a, e) {
                  for (var b in e) e.hasOwnProperty(b) && (a[b] = e[b]);
                };
              return a(e, b);
            };
            return function (e, b) {
              function c() {
                this.constructor = e;
              }
              a(e, b);
              e.prototype =
                null === b
                  ? Object.create(b)
                  : ((c.prototype = b.prototype), new c());
            };
          })(),
        n = h.parse;
      h = a.noop;
      var E = f.series,
        t = f.seriesTypes;
      a = t.column.prototype;
      var p = t.scatter;
      t = d.addEvent;
      var e = d.arrayMax,
        g = d.arrayMin,
        l = d.clamp,
        k = d.extend,
        J = d.isNumber,
        H = d.merge,
        M = d.pick,
        F = [];
      d = (function (a) {
        function c() {
          var e = (null !== a && a.apply(this, arguments)) || this;
          e.data = void 0;
          e.maxPxSize = void 0;
          e.minPxSize = void 0;
          e.options = void 0;
          e.points = void 0;
          e.radii = void 0;
          e.yData = void 0;
          e.zData = void 0;
          return e;
        }
        y(c, a);
        c.compose = function (a, e, c, g) {
          b.compose(e, c, g);
          -1 === F.indexOf(a) && (F.push(a), (a.prototype.beforePadding = m));
        };
        c.prototype.animate = function (a) {
          !a &&
            this.points.length < this.options.animationLimit &&
            this.points.forEach(function (a) {
              var e = a.graphic;
              e &&
                e.width &&
                (this.hasRendered ||
                  e.attr({ x: a.plotX, y: a.plotY, width: 1, height: 1 }),
                e.animate(this.markerAttribs(a), this.options.animation));
            }, this);
        };
        c.prototype.getRadii = function () {
          var a = this,
            e = this.zData,
            b = this.yData,
            c = [],
            g = this.chart.bubbleZExtremes;
          var f = this.getPxExtremes();
          var l = f.minPxSize,
            k = f.maxPxSize;
          if (!g) {
            var h = Number.MAX_VALUE,
              d = -Number.MAX_VALUE,
              p;
            this.chart.series.forEach(function (e) {
              e.bubblePadding &&
                (e.visible || !a.chart.options.chart.ignoreHiddenSeries) &&
                (e = (e.onPoint || e).getZExtremes()) &&
                ((h = Math.min(h || e.zMin, e.zMin)),
                (d = Math.max(d || e.zMax, e.zMax)),
                (p = !0));
            });
            p
              ? ((g = { zMin: h, zMax: d }), (this.chart.bubbleZExtremes = g))
              : (g = { zMin: 0, zMax: 0 });
          }
          var m = 0;
          for (f = e.length; m < f; m++) {
            var v = e[m];
            c.push(this.getRadius(g.zMin, g.zMax, l, k, v, b && b[m]));
          }
          this.radii = c;
        };
        c.prototype.getRadius = function (a, e, b, c, g, f) {
          var w = this.options,
            l = "width" !== w.sizeBy,
            k = w.zThreshold,
            h = e - a,
            d = 0.5;
          if (null === f || null === g) return null;
          if (J(g)) {
            w.sizeByAbsoluteValue &&
              ((g = Math.abs(g - k)),
              (h = Math.max(e - k, Math.abs(a - k))),
              (a = 0));
            if (g < a) return b / 2 - 1;
            0 < h && (d = (g - a) / h);
          }
          l && 0 <= d && (d = Math.sqrt(d));
          return Math.ceil(b + d * (c - b)) / 2;
        };
        c.prototype.hasData = function () {
          return !!this.processedXData.length;
        };
        c.prototype.pointAttribs = function (a, e) {
          var b = this.options.marker.fillOpacity;
          a = E.prototype.pointAttribs.call(this, a, e);
          1 !== b && (a.fill = n(a.fill).setOpacity(b).get("rgba"));
          return a;
        };
        c.prototype.translate = function () {
          a.prototype.translate.call(this);
          this.getRadii();
          this.translateBubble();
        };
        c.prototype.translateBubble = function () {
          for (
            var a = this.data,
              e = this.radii,
              b = this.getPxExtremes().minPxSize,
              c = a.length;
            c--;

          ) {
            var g = a[c],
              f = e ? e[c] : 0;
            J(f) && f >= b / 2
              ? ((g.marker = k(g.marker, {
                  radius: f,
                  width: 2 * f,
                  height: 2 * f,
                })),
                (g.dlBox = {
                  x: g.plotX - f,
                  y: g.plotY - f,
                  width: 2 * f,
                  height: 2 * f,
                }))
              : ((g.shapeArgs = g.plotY = g.dlBox = void 0), (g.isInside = !1));
          }
        };
        c.prototype.getPxExtremes = function () {
          var a = Math.min(this.chart.plotWidth, this.chart.plotHeight),
            e = function (e) {
              if ("string" === typeof e) {
                var b = /%$/.test(e);
                e = parseInt(e, 10);
              }
              return b ? (a * e) / 100 : e;
            },
            b = e(M(this.options.minSize, 8));
          e = Math.max(e(M(this.options.maxSize, "20%")), b);
          return { minPxSize: b, maxPxSize: e };
        };
        c.prototype.getZExtremes = function () {
          var a = this.options,
            b = (this.zData || []).filter(J);
          if (b.length) {
            var c = M(
              a.zMin,
              l(
                g(b),
                !1 === a.displayNegative
                  ? a.zThreshold || 0
                  : -Number.MAX_VALUE,
                Number.MAX_VALUE,
              ),
            );
            a = M(a.zMax, e(b));
            if (J(c) && J(a)) return { zMin: c, zMax: a };
          }
        };
        c.defaultOptions = H(p.defaultOptions, {
          dataLabels: {
            formatter: function () {
              var a = this.series.chart.numberFormatter,
                e = this.point.z;
              return J(e) ? a(e, -1) : "";
            },
            inside: !0,
            verticalAlign: "middle",
          },
          animationLimit: 250,
          marker: {
            lineColor: null,
            lineWidth: 1,
            fillOpacity: 0.5,
            radius: null,
            states: { hover: { radiusPlus: 0 } },
            symbol: "circle",
          },
          minSize: 8,
          maxSize: "20%",
          softThreshold: !1,
          states: { hover: { halo: { size: 5 } } },
          tooltip: { pointFormat: "({point.x}, {point.y}), Size: {point.z}" },
          turboThreshold: 0,
          zThreshold: 0,
          zoneAxis: "z",
        });
        return c;
      })(p);
      k(d.prototype, {
        alignDataLabel: a.alignDataLabel,
        applyZones: h,
        bubblePadding: !0,
        buildKDTree: h,
        directTouch: !0,
        isBubble: !0,
        pointArrayMap: ["y", "z"],
        pointClass: c,
        parallelArrays: ["x", "y", "z"],
        trackerGroups: ["group", "dataLabelsGroup"],
        specialGroup: "group",
        zoneAxis: "z",
      });
      t(d, "updatedData", function (a) {
        delete a.target.chart.bubbleZExtremes;
      });
      t(d, "remove", function (a) {
        delete a.target.chart.bubbleZExtremes;
      });
      f.registerSeriesType("bubble", d);
      ("");
      ("");
      return d;
    },
  );
  D(
    d,
    "Series/ColumnRange/ColumnRangePoint.js",
    [d["Core/Series/SeriesRegistry.js"], d["Core/Utilities.js"]],
    function (b, c) {
      var h =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function f() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((f.prototype = c.prototype), new f());
            };
          })(),
        a = b.seriesTypes;
      b = a.column.prototype.pointClass.prototype;
      var f = c.extend,
        d = c.isNumber;
      c = (function (a) {
        function b() {
          var b = (null !== a && a.apply(this, arguments)) || this;
          b.options = void 0;
          b.series = void 0;
          return b;
        }
        h(b, a);
        b.prototype.isValid = function () {
          return d(this.low);
        };
        return b;
      })(a.arearange.prototype.pointClass);
      f(c.prototype, { setState: b.setState });
      return c;
    },
  );
  D(
    d,
    "Series/ColumnRange/ColumnRangeSeries.js",
    [
      d["Series/ColumnRange/ColumnRangePoint.js"],
      d["Core/Globals.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d, a) {
      var f =
        (this && this.__extends) ||
        (function () {
          var a = function (e, b) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, e) {
                  a.__proto__ = e;
                }) ||
              function (a, e) {
                for (var b in e) e.hasOwnProperty(b) && (a[b] = e[b]);
              };
            return a(e, b);
          };
          return function (e, b) {
            function c() {
              this.constructor = e;
            }
            a(e, b);
            e.prototype =
              null === b
                ? Object.create(b)
                : ((c.prototype = b.prototype), new c());
          };
        })();
      c = c.noop;
      var h = d.seriesTypes,
        m = h.arearange,
        q = h.column,
        n = h.column.prototype,
        E = a.clamp;
      h = a.extend;
      var t = a.isNumber,
        p = a.merge,
        e = a.pick,
        g = { pointRange: null, marker: null, states: { hover: { halo: !1 } } };
      a = (function (a) {
        function b() {
          return (null !== a && a.apply(this, arguments)) || this;
        }
        f(b, a);
        b.prototype.setOptions = function () {
          p(!0, arguments[0], { stacking: void 0 });
          return m.prototype.setOptions.apply(this, arguments);
        };
        b.prototype.translate = function () {
          var a = this,
            b = this.yAxis,
            c = this.xAxis,
            g = c.startAngleRad,
            f = this.chart,
            l = this.xAxis.isRadial,
            d = Math.max(f.chartWidth, f.chartHeight) + 999,
            h,
            w,
            k,
            p;
          n.translate.apply(this);
          this.points.forEach(function (B) {
            var r = B.shapeArgs || {},
              z = a.options.minPointLength,
              m = B.plotY,
              G = b.translate(B.high, 0, 1, 0, 1);
            t(G) &&
              t(m) &&
              ((B.plotHigh = E(G, -d, d)),
              (B.plotLow = E(m, -d, d)),
              (p = B.plotHigh),
              (h = e(B.rectPlotY, B.plotY) - B.plotHigh),
              Math.abs(h) < z
                ? ((w = z - h), (h += w), (p -= w / 2))
                : 0 > h && ((h *= -1), (p -= h)),
              l && a.polar
                ? ((k = B.barX + g),
                  (B.shapeType = "arc"),
                  (B.shapeArgs = a.polar.arc(p + h, p, k, k + B.pointWidth)))
                : ((r.height = h),
                  (r.y = p),
                  (z = r.x),
                  (z = void 0 === z ? 0 : z),
                  (r = r.width),
                  (r = void 0 === r ? 0 : r),
                  (B.tooltipPos = f.inverted
                    ? [
                        b.len + b.pos - f.plotLeft - p - h / 2,
                        c.len + c.pos - f.plotTop - z - r / 2,
                        h,
                      ]
                    : [
                        c.left - f.plotLeft + z + r / 2,
                        b.pos - f.plotTop + p + h / 2,
                        h,
                      ])));
          });
        };
        b.prototype.pointAttribs = function () {
          return n.pointAttribs.apply(this, arguments);
        };
        b.prototype.translate3dPoints = function () {
          return n.translate3dPoints.apply(this, arguments);
        };
        b.prototype.translate3dShapes = function () {
          return n.translate3dShapes.apply(this, arguments);
        };
        b.defaultOptions = p(q.defaultOptions, m.defaultOptions, g);
        return b;
      })(m);
      h(a.prototype, {
        directTouch: !0,
        pointClass: b,
        trackerGroups: ["group", "dataLabelsGroup"],
        adjustForMissingColumns: n.adjustForMissingColumns,
        animate: n.animate,
        crispCol: n.crispCol,
        drawGraph: c,
        drawPoints: n.drawPoints,
        getSymbol: c,
        drawTracker: n.drawTracker,
        getColumnMetrics: n.getColumnMetrics,
      });
      d.registerSeriesType("columnrange", a);
      ("");
      return a;
    },
  );
  D(
    d,
    "Series/ColumnPyramid/ColumnPyramidSeries.js",
    [
      d["Series/Column/ColumnSeries.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h) {
      var a =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, e) {
                    a.__proto__ = e;
                  }) ||
                function (a, e) {
                  for (var b in e) e.hasOwnProperty(b) && (a[b] = e[b]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function f() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((f.prototype = c.prototype), new f());
            };
          })(),
        f = b.prototype,
        d = h.clamp,
        m = h.merge,
        q = h.pick;
      h = (function (c) {
        function h() {
          var a = (null !== c && c.apply(this, arguments)) || this;
          a.data = void 0;
          a.options = void 0;
          a.points = void 0;
          return a;
        }
        a(h, c);
        h.prototype.translate = function () {
          var a = this,
            b = a.chart,
            e = a.options,
            c = (a.dense = 2 > a.closestPointRange * a.xAxis.transA);
          c = a.borderWidth = q(e.borderWidth, c ? 0 : 1);
          var l = a.yAxis,
            h = e.threshold,
            m = (a.translatedThreshold = l.getThreshold(h)),
            y = q(e.minPointLength, 5),
            n = a.getColumnMetrics(),
            F = n.width,
            v = (a.barW = Math.max(F, 1 + 2 * c)),
            E = (a.pointXOffset = n.offset);
          b.inverted && (m -= 0.5);
          e.pointPadding && (v = Math.ceil(v));
          f.translate.apply(a);
          a.points.forEach(function (c) {
            var g = q(c.yBottom, m),
              f = 999 + Math.abs(g),
              k = d(c.plotY, -f, l.len + f);
            f = c.plotX + E;
            var z = v / 2,
              p = Math.min(k, g);
            g = Math.max(k, g) - p;
            var r;
            c.barX = f;
            c.pointWidth = F;
            c.tooltipPos = b.inverted
              ? [l.len + l.pos - b.plotLeft - k, a.xAxis.len - f - z, g]
              : [f + z, k + l.pos - b.plotTop, g];
            k = h + (c.total || c.y);
            "percent" === e.stacking && (k = h + (0 > c.y) ? -100 : 100);
            k = l.toPixels(k, !0);
            var K = (r = b.plotHeight - k - (b.plotHeight - m))
              ? (z * (p - k)) / r
              : 0;
            var n = r ? (z * (p + g - k)) / r : 0;
            r = f - K + z;
            K = f + K + z;
            var H = f + n + z;
            n = f - n + z;
            var A = p - y;
            var t = p + g;
            0 > c.y && ((A = p), (t = p + g + y));
            b.inverted &&
              ((H = l.width - p),
              (r = k - (l.width - m)),
              (K = (z * (k - H)) / r),
              (n = (z * (k - (H - g))) / r),
              (r = f + z + K),
              (K = r - 2 * K),
              (H = f - n + z),
              (n = f + n + z),
              (A = p),
              (t = p + g - y),
              0 > c.y && (t = p + g + y));
            c.shapeType = "path";
            c.shapeArgs = {
              x: r,
              y: A,
              width: K - r,
              height: g,
              d: [["M", r, A], ["L", K, A], ["L", H, t], ["L", n, t], ["Z"]],
            };
          });
        };
        h.defaultOptions = m(b.defaultOptions, {});
        return h;
      })(b);
      c.registerSeriesType("columnpyramid", h);
      ("");
      return h;
    },
  );
  D(d, "Series/ErrorBar/ErrorBarSeriesDefaults.js", [], function () {
    "";
    return {
      color: "#000000",
      grouping: !1,
      linkedTo: ":previous",
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>',
      },
      whiskerWidth: null,
    };
  });
  D(
    d,
    "Series/ErrorBar/ErrorBarSeries.js",
    [
      d["Series/BoxPlot/BoxPlotSeries.js"],
      d["Series/Column/ColumnSeries.js"],
      d["Series/ErrorBar/ErrorBarSeriesDefaults.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a, f) {
      var d =
          (this && this.__extends) ||
          (function () {
            var a = function (b, e) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, e) {
                    a.__proto__ = e;
                  }) ||
                function (a, e) {
                  for (var b in e) e.hasOwnProperty(b) && (a[b] = e[b]);
                };
              return a(b, e);
            };
            return function (b, e) {
              function c() {
                this.constructor = b;
              }
              a(b, e);
              b.prototype =
                null === e
                  ? Object.create(e)
                  : ((c.prototype = e.prototype), new c());
            };
          })(),
        m = a.seriesTypes.arearange,
        q = f.addEvent,
        n = f.merge;
      f = f.extend;
      var E = (function (a) {
        function f() {
          var e = (null !== a && a.apply(this, arguments)) || this;
          e.data = void 0;
          e.options = void 0;
          e.points = void 0;
          return e;
        }
        d(f, a);
        f.prototype.getColumnMetrics = function () {
          return (
            (this.linkedParent && this.linkedParent.columnMetrics) ||
            c.prototype.getColumnMetrics.call(this)
          );
        };
        f.prototype.drawDataLabels = function () {
          var a = this.pointValKey;
          m &&
            (m.prototype.drawDataLabels.call(this),
            this.data.forEach(function (e) {
              e.y = e[a];
            }));
        };
        f.prototype.toYData = function (a) {
          return [a.low, a.high];
        };
        f.defaultOptions = n(b.defaultOptions, h);
        return f;
      })(b);
      q(
        E,
        "afterTranslate",
        function () {
          this.points.forEach(function (a) {
            a.plotLow = a.plotY;
          });
        },
        { order: 0 },
      );
      f(E.prototype, {
        pointArrayMap: ["low", "high"],
        pointValKey: "high",
        doQuartiles: !1,
      });
      a.registerSeriesType("errorbar", E);
      return E;
    },
  );
  D(
    d,
    "Series/Gauge/GaugePoint.js",
    [d["Core/Series/SeriesRegistry.js"]],
    function (b) {
      var c =
        (this && this.__extends) ||
        (function () {
          var b = function (a, c) {
            b =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, b) {
                  a.__proto__ = b;
                }) ||
              function (a, b) {
                for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
              };
            return b(a, c);
          };
          return function (a, c) {
            function f() {
              this.constructor = a;
            }
            b(a, c);
            a.prototype =
              null === c
                ? Object.create(c)
                : ((f.prototype = c.prototype), new f());
          };
        })();
      return (function (b) {
        function a() {
          var a = (null !== b && b.apply(this, arguments)) || this;
          a.options = void 0;
          a.series = void 0;
          a.shapeArgs = void 0;
          return a;
        }
        c(a, b);
        a.prototype.setState = function (a) {
          this.state = a;
        };
        return a;
      })(b.series.prototype.pointClass);
    },
  );
  D(
    d,
    "Series/Gauge/GaugeSeries.js",
    [
      d["Series/Gauge/GaugePoint.js"],
      d["Core/Globals.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, h, a) {
      var f =
        (this && this.__extends) ||
        (function () {
          var a = function (e, b) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, e) {
                  a.__proto__ = e;
                }) ||
              function (a, e) {
                for (var b in e) e.hasOwnProperty(b) && (a[b] = e[b]);
              };
            return a(e, b);
          };
          return function (e, b) {
            function c() {
              this.constructor = e;
            }
            a(e, b);
            e.prototype =
              null === b
                ? Object.create(b)
                : ((c.prototype = b.prototype), new c());
          };
        })();
      c = c.noop;
      var d = h.series,
        m = h.seriesTypes.column,
        q = a.clamp,
        n = a.isNumber,
        E = a.extend,
        t = a.merge,
        p = a.pick,
        e = a.pInt;
      a = (function (a) {
        function b() {
          var e = (null !== a && a.apply(this, arguments)) || this;
          e.data = void 0;
          e.points = void 0;
          e.options = void 0;
          e.yAxis = void 0;
          return e;
        }
        f(b, a);
        b.prototype.translate = function () {
          var a = this.yAxis,
            b = this.options,
            c = a.center;
          this.generatePoints();
          this.points.forEach(function (g) {
            var f = t(b.dial, g.dial),
              h = (e(f.radius) * c[2]) / 200,
              d = (e(f.baseLength) * h) / 100,
              l = (e(f.rearLength) * h) / 100,
              k = f.baseWidth,
              w = f.topWidth,
              B = b.overshoot,
              z =
                a.startAngleRad + a.translate(g.y, void 0, void 0, void 0, !0);
            if (n(B) || !1 === b.wrap)
              (B = n(B) ? (B / 180) * Math.PI : 0),
                (z = q(z, a.startAngleRad - B, a.endAngleRad + B));
            z = (180 * z) / Math.PI;
            g.shapeType = "path";
            g.shapeArgs = {
              d: f.path || [
                ["M", -l, -k / 2],
                ["L", d, -k / 2],
                ["L", h, -w / 2],
                ["L", h, w / 2],
                ["L", d, k / 2],
                ["L", -l, k / 2],
                ["Z"],
              ],
              translateX: c[0],
              translateY: c[1],
              rotation: z,
            };
            g.plotX = c[0];
            g.plotY = c[1];
          });
        };
        b.prototype.drawPoints = function () {
          var a = this,
            e = a.chart,
            b = a.yAxis.center,
            c = a.pivot,
            g = a.options,
            f = g.pivot,
            h = e.renderer;
          a.points.forEach(function (b) {
            var c = b.graphic,
              f = b.shapeArgs,
              d = f.d,
              l = t(g.dial, b.dial);
            c
              ? (c.animate(f), (f.d = d))
              : (b.graphic = h[b.shapeType](f)
                  .attr({ rotation: f.rotation, zIndex: 1 })
                  .addClass("highcharts-dial")
                  .add(a.group));
            if (!e.styledMode)
              b.graphic[c ? "animate" : "attr"]({
                stroke: l.borderColor,
                "stroke-width": l.borderWidth,
                fill: l.backgroundColor,
              });
          });
          c
            ? c.animate({ translateX: b[0], translateY: b[1] })
            : f &&
              ((a.pivot = h
                .circle(0, 0, f.radius)
                .attr({ zIndex: 2 })
                .addClass("highcharts-pivot")
                .translate(b[0], b[1])
                .add(a.group)),
              e.styledMode ||
                a.pivot.attr({
                  fill: f.backgroundColor,
                  stroke: f.borderColor,
                  "stroke-width": f.borderWidth,
                }));
        };
        b.prototype.animate = function (a) {
          var e = this;
          a ||
            e.points.forEach(function (a) {
              var b = a.graphic;
              b &&
                (b.attr({ rotation: (180 * e.yAxis.startAngleRad) / Math.PI }),
                b.animate(
                  { rotation: a.shapeArgs.rotation },
                  e.options.animation,
                ));
            });
        };
        b.prototype.render = function () {
          this.group = this.plotGroup(
            "group",
            "series",
            this.visible ? "inherit" : "hidden",
            this.options.zIndex,
            this.chart.seriesGroup,
          );
          d.prototype.render.call(this);
          this.group.clip(this.chart.clipRect);
        };
        b.prototype.setData = function (a, e) {
          d.prototype.setData.call(this, a, !1);
          this.processData();
          this.generatePoints();
          p(e, !0) && this.chart.redraw();
        };
        b.prototype.hasData = function () {
          return !!this.points.length;
        };
        b.defaultOptions = t(d.defaultOptions, {
          dataLabels: {
            borderColor: "#cccccc",
            borderRadius: 3,
            borderWidth: 1,
            crop: !1,
            defer: !1,
            enabled: !0,
            verticalAlign: "top",
            y: 15,
            zIndex: 2,
          },
          dial: {
            backgroundColor: "#000000",
            baseLength: "70%",
            baseWidth: 3,
            borderColor: "#cccccc",
            borderWidth: 0,
            radius: "80%",
            rearLength: "10%",
            topWidth: 1,
          },
          pivot: {
            radius: 5,
            borderWidth: 0,
            borderColor: "#cccccc",
            backgroundColor: "#000000",
          },
          tooltip: { headerFormat: "" },
          showInLegend: !1,
        });
        return b;
      })(d);
      E(a.prototype, {
        angular: !0,
        directTouch: !0,
        drawGraph: c,
        drawTracker: m.prototype.drawTracker,
        fixedBox: !0,
        forceDL: !0,
        noSharedTooltip: !0,
        pointClass: b,
        trackerGroups: ["group", "dataLabelsGroup"],
      });
      h.registerSeriesType("gauge", a);
      ("");
      return a;
    },
  );
  D(
    d,
    "Series/DragNodesComposition.js",
    [d["Core/Utilities.js"]],
    function (b) {
      function c() {
        var a = this,
          b,
          c,
          d;
        a.container &&
          (b = h(a.container, "mousedown", function (b) {
            var f = a.hoverPoint;
            f &&
              f.series &&
              f.series.hasDraggableNodes &&
              f.series.options.draggable &&
              (f.series.onMouseDown(f, b),
              (c = h(a.container, "mousemove", function (a) {
                return f && f.series && f.series.onMouseMove(f, a);
              })),
              (d = h(a.container.ownerDocument, "mouseup", function (a) {
                c();
                d();
                return f && f.series && f.series.onMouseUp(f, a);
              })));
          }));
        h(a, "destroy", function () {
          b();
        });
      }
      var h = b.addEvent,
        a = [];
      return {
        compose: function (b) {
          -1 === a.indexOf(b) && (a.push(b), h(b, "load", c));
        },
        onMouseDown: function (a, b) {
          b = this.chart.pointer.normalize(b);
          a.fixedPosition = {
            chartX: b.chartX,
            chartY: b.chartY,
            plotX: a.plotX,
            plotY: a.plotY,
          };
          a.inDragMode = !0;
        },
        onMouseMove: function (a, b) {
          if (a.fixedPosition && a.inDragMode) {
            var c = this.chart,
              f = c.pointer.normalize(b);
            b = a.fixedPosition.chartX - f.chartX;
            f = a.fixedPosition.chartY - f.chartY;
            var h = c.graphLayoutsLookup,
              d = void 0,
              y = void 0;
            if (5 < Math.abs(b) || 5 < Math.abs(f))
              (d = a.fixedPosition.plotX - b),
                (y = a.fixedPosition.plotY - f),
                c.isInsidePlot(d, y) &&
                  ((a.plotX = d),
                  (a.plotY = y),
                  (a.hasDragged = !0),
                  this.redrawHalo(a),
                  h.forEach(function (a) {
                    a.restartSimulation();
                  }));
          }
        },
        onMouseUp: function (a, b) {
          a.fixedPosition &&
            (a.hasDragged &&
              (this.layout.enableSimulation
                ? this.layout.start()
                : this.chart.redraw()),
            (a.inDragMode = a.hasDragged = !1),
            this.options.fixedDraggable || delete a.fixedPosition);
        },
        redrawHalo: function (a) {
          a &&
            this.halo &&
            this.halo.attr({
              d: a.haloPath(this.options.states.hover.halo.size),
            });
        },
      };
    },
  );
  D(
    d,
    "Series/GraphLayoutComposition.js",
    [d["Core/Animation/AnimationUtilities.js"], d["Core/Utilities.js"]],
    function (b, c) {
      function d() {
        this.graphLayoutsLookup &&
          (this.graphLayoutsLookup.forEach(function (a) {
            a.updateSimulation();
          }),
          this.redraw());
      }
      function a() {
        this.graphLayoutsLookup &&
          (this.graphLayoutsLookup.forEach(function (a) {
            a.updateSimulation(!1);
          }),
          this.redraw());
      }
      function f() {
        this.graphLayoutsLookup &&
          this.graphLayoutsLookup.forEach(function (a) {
            a.stop();
          });
      }
      function y() {
        var a = !1,
          b = function (e) {
            e.maxIterations-- &&
              isFinite(e.temperature) &&
              !e.isStable() &&
              !e.enableSimulation &&
              (e.beforeStep && e.beforeStep(), e.step(), (c = !1), (a = !0));
          };
        if (this.graphLayoutsLookup) {
          m(!1, this);
          for (
            this.graphLayoutsLookup.forEach(function (a) {
              return a.start();
            });
            !c;

          ) {
            var c = !0;
            this.graphLayoutsLookup.forEach(b);
          }
          a &&
            this.series.forEach(function (a) {
              a && a.layout && a.render();
            });
        }
      }
      var m = b.setAnimation,
        q = c.addEvent,
        n = [];
      return {
        compose: function (b) {
          n.indexOf(b) &&
            (n.push(b),
            q(b, "afterPrint", d),
            q(b, "beforePrint", a),
            q(b, "predraw", f),
            q(b, "render", y));
        },
        integrations: {},
        layouts: {},
      };
    },
  );
  D(
    d,
    "Series/PackedBubble/PackedBubblePoint.js",
    [
      d["Core/Chart/Chart.js"],
      d["Core/Series/Point.js"],
      d["Core/Series/SeriesRegistry.js"],
    ],
    function (b, c, d) {
      var a =
        (this && this.__extends) ||
        (function () {
          var a = function (b, c) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, b) {
                  a.__proto__ = b;
                }) ||
              function (a, b) {
                for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
              };
            return a(b, c);
          };
          return function (b, c) {
            function f() {
              this.constructor = b;
            }
            a(b, c);
            b.prototype =
              null === c
                ? Object.create(c)
                : ((f.prototype = c.prototype), new f());
          };
        })();
      return (function (f) {
        function d() {
          var a = (null !== f && f.apply(this, arguments)) || this;
          a.degree = NaN;
          a.mass = NaN;
          a.radius = NaN;
          a.options = void 0;
          a.series = void 0;
          a.value = null;
          return a;
        }
        a(d, f);
        d.prototype.destroy = function () {
          this.series.layout &&
            this.series.layout.removeElementFromCollection(
              this,
              this.series.layout.nodes,
            );
          return c.prototype.destroy.apply(this, arguments);
        };
        d.prototype.firePointEvent = function () {
          var a = this.series.options;
          if (this.isParentNode && a.parentNode) {
            var b = a.allowPointSelect;
            a.allowPointSelect = a.parentNode.allowPointSelect;
            c.prototype.firePointEvent.apply(this, arguments);
            a.allowPointSelect = b;
          } else c.prototype.firePointEvent.apply(this, arguments);
        };
        d.prototype.select = function () {
          var a = this.series.chart;
          this.isParentNode
            ? ((a.getSelectedPoints = a.getSelectedParentNodes),
              c.prototype.select.apply(this, arguments),
              (a.getSelectedPoints = b.prototype.getSelectedPoints))
            : c.prototype.select.apply(this, arguments);
        };
        return d;
      })(d.seriesTypes.bubble.prototype.pointClass);
    },
  );
  D(
    d,
    "Series/PackedBubble/PackedBubbleSeriesDefaults.js",
    [d["Core/Utilities.js"]],
    function (b) {
      var c = b.isNumber;
      ("");
      return {
        minSize: "10%",
        maxSize: "50%",
        sizeBy: "area",
        zoneAxis: "y",
        crisp: !1,
        tooltip: { pointFormat: "Value: {point.value}" },
        draggable: !0,
        useSimulation: !0,
        parentNode: { allowPointSelect: !1 },
        dataLabels: {
          formatter: function () {
            var b = this.series.chart.numberFormatter,
              a = this.point.value;
            return c(a) ? b(a, -1) : "";
          },
          parentNodeFormatter: function () {
            return this.name;
          },
          parentNodeTextPath: { enabled: !0 },
          padding: 0,
          style: { transition: "opacity 2000ms" },
        },
        layoutAlgorithm: {
          initialPositions: "circle",
          initialPositionRadius: 20,
          bubblePadding: 5,
          parentNodeLimit: !1,
          seriesInteraction: !0,
          dragBetweenSeries: !1,
          parentNodeOptions: {
            maxIterations: 400,
            gravitationalConstant: 0.03,
            maxSpeed: 50,
            initialPositionRadius: 100,
            seriesInteraction: !0,
            marker: {
              fillColor: null,
              fillOpacity: 1,
              lineWidth: null,
              lineColor: null,
              symbol: "circle",
            },
          },
          enableSimulation: !0,
          type: "packedbubble",
          integration: "packedbubble",
          maxIterations: 1e3,
          splitSeries: !1,
          maxSpeed: 5,
          gravitationalConstant: 0.01,
          friction: -0.981,
        },
      };
    },
  );
  D(d, "Series/Networkgraph/VerletIntegration.js", [], function () {
    return {
      attractive: function (b, c, d) {
        var a = b.getMass(),
          f = -d.x * c * this.diffTemperature;
        c = -d.y * c * this.diffTemperature;
        b.fromNode.fixedPosition ||
          ((b.fromNode.plotX -= (f * a.fromNode) / b.fromNode.degree),
          (b.fromNode.plotY -= (c * a.fromNode) / b.fromNode.degree));
        b.toNode.fixedPosition ||
          ((b.toNode.plotX += (f * a.toNode) / b.toNode.degree),
          (b.toNode.plotY += (c * a.toNode) / b.toNode.degree));
      },
      attractiveForceFunction: function (b, c) {
        return (c - b) / b;
      },
      barycenter: function () {
        var b = this.options.gravitationalConstant,
          c = this.barycenter.xFactor,
          d = this.barycenter.yFactor;
        c = (c - (this.box.left + this.box.width) / 2) * b;
        d = (d - (this.box.top + this.box.height) / 2) * b;
        this.nodes.forEach(function (a) {
          a.fixedPosition ||
            ((a.plotX -= c / a.mass / a.degree),
            (a.plotY -= d / a.mass / a.degree));
        });
      },
      getK: function (b) {
        return Math.pow((b.box.width * b.box.height) / b.nodes.length, 0.5);
      },
      integrate: function (b, c) {
        var d = -b.options.friction,
          a = b.options.maxSpeed,
          f = (c.plotX + c.dispX - c.prevX) * d;
        d *= c.plotY + c.dispY - c.prevY;
        var y = Math.abs,
          m = y(f) / (f || 1);
        y = y(d) / (d || 1);
        f = m * Math.min(a, Math.abs(f));
        d = y * Math.min(a, Math.abs(d));
        c.prevX = c.plotX + c.dispX;
        c.prevY = c.plotY + c.dispY;
        c.plotX += f;
        c.plotY += d;
        c.temperature = b.vectorLength({ x: f, y: d });
      },
      repulsive: function (b, c, d) {
        c = (c * this.diffTemperature) / b.mass / b.degree;
        b.fixedPosition || ((b.plotX += d.x * c), (b.plotY += d.y * c));
      },
      repulsiveForceFunction: function (b, c) {
        return ((c - b) / b) * (c > b ? 1 : 0);
      },
    };
  });
  D(
    d,
    "Series/PackedBubble/PackedBubbleIntegration.js",
    [d["Core/Globals.js"], d["Series/Networkgraph/VerletIntegration.js"]],
    function (b, c) {
      return {
        barycenter: function () {
          for (
            var b = this.options.gravitationalConstant,
              a = this.box,
              c = this.nodes,
              d,
              m,
              q = 0;
            q < c.length;
            q++
          ) {
            var n = c[q];
            this.options.splitSeries && !n.isParentNode
              ? ((d = n.series.parentNode.plotX),
                (m = n.series.parentNode.plotY))
              : ((d = a.width / 2), (m = a.height / 2));
            n.fixedPosition ||
              ((n.plotX -=
                ((n.plotX - d) * b) / (n.mass * Math.sqrt(c.length))),
              (n.plotY -=
                ((n.plotY - m) * b) / (n.mass * Math.sqrt(c.length))));
          }
        },
        getK: b.noop,
        integrate: c.integrate,
        repulsive: function (b, a, c, d) {
          var f = (a * this.diffTemperature) / b.mass / b.degree;
          a = c.x * f;
          c = c.y * f;
          b.fixedPosition || ((b.plotX += a), (b.plotY += c));
          d.fixedPosition || ((d.plotX -= a), (d.plotY -= c));
        },
        repulsiveForceFunction: function (b, a, c, d) {
          return Math.min(b, (c.marker.radius + d.marker.radius) / 2);
        },
      };
    },
  );
  D(d, "Series/Networkgraph/EulerIntegration.js", [], function () {
    return {
      attractive: function (b, c, d, a) {
        var f = b.getMass(),
          h = (d.x / a) * c;
        c *= d.y / a;
        b.fromNode.fixedPosition ||
          ((b.fromNode.dispX -= (h * f.fromNode) / b.fromNode.degree),
          (b.fromNode.dispY -= (c * f.fromNode) / b.fromNode.degree));
        b.toNode.fixedPosition ||
          ((b.toNode.dispX += (h * f.toNode) / b.toNode.degree),
          (b.toNode.dispY += (c * f.toNode) / b.toNode.degree));
      },
      attractiveForceFunction: function (b, c) {
        return (b * b) / c;
      },
      barycenter: function () {
        var b = this.options.gravitationalConstant,
          c = this.barycenter.xFactor,
          d = this.barycenter.yFactor;
        this.nodes.forEach(function (a) {
          if (!a.fixedPosition) {
            var f = a.getDegree();
            f *= 1 + f / 2;
            a.dispX += ((c - a.plotX) * b * f) / a.degree;
            a.dispY += ((d - a.plotY) * b * f) / a.degree;
          }
        });
      },
      getK: function (b) {
        return Math.pow((b.box.width * b.box.height) / b.nodes.length, 0.3);
      },
      integrate: function (b, c) {
        c.dispX += c.dispX * b.options.friction;
        c.dispY += c.dispY * b.options.friction;
        var d = (c.temperature = b.vectorLength({ x: c.dispX, y: c.dispY }));
        0 !== d &&
          ((c.plotX +=
            (c.dispX / d) * Math.min(Math.abs(c.dispX), b.temperature)),
          (c.plotY +=
            (c.dispY / d) * Math.min(Math.abs(c.dispY), b.temperature)));
      },
      repulsive: function (b, c, d, a) {
        b.dispX += ((d.x / a) * c) / b.degree;
        b.dispY += ((d.y / a) * c) / b.degree;
      },
      repulsiveForceFunction: function (b, c) {
        return (c * c) / b;
      },
    };
  });
  D(d, "Series/Networkgraph/QuadTreeNode.js", [], function () {
    return (function () {
      function b(b) {
        this.isInternal = this.isEmpty = this.body = !1;
        this.nodes = [];
        this.box = b;
        this.boxSize = Math.min(b.width, b.height);
      }
      b.prototype.divideBox = function () {
        var c = this.box.width / 2,
          d = this.box.height / 2;
        this.nodes[0] = new b({
          left: this.box.left,
          top: this.box.top,
          width: c,
          height: d,
        });
        this.nodes[1] = new b({
          left: this.box.left + c,
          top: this.box.top,
          width: c,
          height: d,
        });
        this.nodes[2] = new b({
          left: this.box.left + c,
          top: this.box.top + d,
          width: c,
          height: d,
        });
        this.nodes[3] = new b({
          left: this.box.left,
          top: this.box.top + d,
          width: c,
          height: d,
        });
      };
      b.prototype.getBoxPosition = function (b) {
        var c = b.plotY < this.box.top + this.box.height / 2;
        return b.plotX < this.box.left + this.box.width / 2
          ? c
            ? 0
            : 3
          : c
            ? 1
            : 2;
      };
      b.prototype.insert = function (c, d) {
        this.isInternal
          ? this.nodes[this.getBoxPosition(c)].insert(c, d - 1)
          : ((this.isEmpty = !1),
            this.body
              ? d
                ? ((this.isInternal = !0),
                  this.divideBox(),
                  !0 !== this.body &&
                    (this.nodes[this.getBoxPosition(this.body)].insert(
                      this.body,
                      d - 1,
                    ),
                    (this.body = !0)),
                  this.nodes[this.getBoxPosition(c)].insert(c, d - 1))
                : ((d = new b({
                    top: c.plotX || NaN,
                    left: c.plotY || NaN,
                    width: 0.1,
                    height: 0.1,
                  })),
                  (d.body = c),
                  (d.isInternal = !1),
                  this.nodes.push(d))
              : ((this.isInternal = !1), (this.body = c)));
      };
      b.prototype.updateMassAndCenter = function () {
        var b = 0,
          d = 0,
          a = 0;
        if (this.isInternal) {
          for (var f = 0, y = this.nodes; f < y.length; f++) {
            var m = y[f];
            m.isEmpty ||
              ((b += m.mass), (d += m.plotX * m.mass), (a += m.plotY * m.mass));
          }
          d /= b;
          a /= b;
        } else
          this.body &&
            ((b = this.body.mass),
            (d = this.body.plotX),
            (a = this.body.plotY));
        this.mass = b;
        this.plotX = d;
        this.plotY = a;
      };
      return b;
    })();
  });
  D(
    d,
    "Series/Networkgraph/QuadTree.js",
    [d["Series/Networkgraph/QuadTreeNode.js"]],
    function (b) {
      return (function () {
        function c(c, a, d, y) {
          this.box = { left: c, top: a, width: d, height: y };
          this.maxDepth = 25;
          this.root = new b(this.box);
          this.root.isInternal = !0;
          this.root.isRoot = !0;
          this.root.divideBox();
        }
        c.prototype.calculateMassAndCenter = function () {
          this.visitNodeRecursive(null, null, function (b) {
            b.updateMassAndCenter();
          });
        };
        c.prototype.insertNodes = function (b) {
          for (var a = 0; a < b.length; a++)
            this.root.insert(b[a], this.maxDepth);
        };
        c.prototype.visitNodeRecursive = function (b, a, c) {
          var d;
          b || (b = this.root);
          b === this.root && a && (d = a(b));
          if (!1 !== d) {
            for (var f = 0, h = b.nodes; f < h.length; f++) {
              var n = h[f];
              if (n.isInternal) {
                a && (d = a(n));
                if (!1 === d) continue;
                this.visitNodeRecursive(n, a, c);
              } else n.body && a && a(n.body);
              c && c(n);
            }
            b === this.root && c && c(b);
          }
        };
        return c;
      })();
    },
  );
  D(
    d,
    "Series/Networkgraph/ReingoldFruchtermanLayout.js",
    [
      d["Series/Networkgraph/EulerIntegration.js"],
      d["Core/Globals.js"],
      d["Series/GraphLayoutComposition.js"],
      d["Series/Networkgraph/QuadTree.js"],
      d["Core/Utilities.js"],
      d["Series/Networkgraph/VerletIntegration.js"],
    ],
    function (b, c, d, a, f, y) {
      var h = c.win,
        q = f.clamp,
        n = f.defined,
        E = f.isFunction,
        t = f.pick;
      return (function () {
        function c() {
          this.attractiveForce = void 0;
          this.box = {};
          this.currentStep = 0;
          this.initialRendering = !0;
          this.integration = void 0;
          this.links = [];
          this.nodes = [];
          this.repulsiveForce = this.quadTree = this.options = void 0;
          this.series = [];
          this.simulation = !1;
        }
        c.compose = function (a) {
          d.compose(a);
          d.integrations.euler = b;
          d.integrations.verlet = y;
          d.layouts["reingold-fruchterman"] = c;
        };
        c.prototype.init = function (a) {
          this.options = a;
          this.nodes = [];
          this.links = [];
          this.series = [];
          this.box = { x: 0, y: 0, width: 0, height: 0 };
          this.setInitialRendering(!0);
          this.integration = d.integrations[a.integration];
          this.enableSimulation = a.enableSimulation;
          this.attractiveForce = t(
            a.attractiveForce,
            this.integration.attractiveForceFunction,
          );
          this.repulsiveForce = t(
            a.repulsiveForce,
            this.integration.repulsiveForceFunction,
          );
          this.approximation = a.approximation;
        };
        c.prototype.updateSimulation = function (a) {
          this.enableSimulation = t(a, this.options.enableSimulation);
        };
        c.prototype.start = function () {
          var a = this.series,
            b = this.options;
          this.currentStep = 0;
          this.forces = (a[0] && a[0].forces) || [];
          this.chart = a[0] && a[0].chart;
          this.initialRendering &&
            (this.initPositions(),
            a.forEach(function (a) {
              a.finishedAnimating = !0;
              a.render();
            }));
          this.setK();
          this.resetSimulation(b);
          this.enableSimulation && this.step();
        };
        c.prototype.step = function () {
          var a = this,
            b = this.series;
          this.currentStep++;
          "barnes-hut" === this.approximation &&
            (this.createQuadTree(), this.quadTree.calculateMassAndCenter());
          for (var c = 0, d = this.forces || []; c < d.length; c++)
            this[d[c] + "Forces"](this.temperature);
          this.applyLimits();
          this.temperature = this.coolDown(
            this.startTemperature,
            this.diffTemperature,
            this.currentStep,
          );
          this.prevSystemTemperature = this.systemTemperature;
          this.systemTemperature = this.getSystemTemperature();
          if (this.enableSimulation) {
            for (c = 0; c < b.length; c++) (d = b[c]), d.chart && d.render();
            this.maxIterations-- &&
            isFinite(this.temperature) &&
            !this.isStable()
              ? (this.simulation && h.cancelAnimationFrame(this.simulation),
                (this.simulation = h.requestAnimationFrame(function () {
                  return a.step();
                })))
              : (this.simulation = !1);
          }
        };
        c.prototype.stop = function () {
          this.simulation && h.cancelAnimationFrame(this.simulation);
        };
        c.prototype.setArea = function (a, b, c, d) {
          this.box = { left: a, top: b, width: c, height: d };
        };
        c.prototype.setK = function () {
          this.k = this.options.linkLength || this.integration.getK(this);
        };
        c.prototype.addElementsToCollection = function (a, b) {
          for (var e = 0; e < a.length; e++) {
            var c = a[e];
            -1 === b.indexOf(c) && b.push(c);
          }
        };
        c.prototype.removeElementFromCollection = function (a, b) {
          a = b.indexOf(a);
          -1 !== a && b.splice(a, 1);
        };
        c.prototype.clear = function () {
          this.nodes.length = 0;
          this.links.length = 0;
          this.series.length = 0;
          this.resetSimulation();
        };
        c.prototype.resetSimulation = function () {
          this.forcedStop = !1;
          this.systemTemperature = 0;
          this.setMaxIterations();
          this.setTemperature();
          this.setDiffTemperature();
        };
        c.prototype.restartSimulation = function () {
          this.simulation
            ? this.resetSimulation()
            : (this.setInitialRendering(!1),
              this.enableSimulation ? this.start() : this.setMaxIterations(1),
              this.chart && this.chart.redraw(),
              this.setInitialRendering(!0));
        };
        c.prototype.setMaxIterations = function (a) {
          this.maxIterations = t(a, this.options.maxIterations);
        };
        c.prototype.setTemperature = function () {
          this.temperature = this.startTemperature = Math.sqrt(
            this.nodes.length,
          );
        };
        c.prototype.setDiffTemperature = function () {
          this.diffTemperature =
            this.startTemperature / (this.options.maxIterations + 1);
        };
        c.prototype.setInitialRendering = function (a) {
          this.initialRendering = a;
        };
        c.prototype.createQuadTree = function () {
          this.quadTree = new a(
            this.box.left,
            this.box.top,
            this.box.width,
            this.box.height,
          );
          this.quadTree.insertNodes(this.nodes);
        };
        c.prototype.initPositions = function () {
          var a = this.options.initialPositions;
          if (E(a)) {
            a.call(this);
            a = 0;
            for (var b = this.nodes; a < b.length; a++) {
              var c = b[a];
              n(c.prevX) || (c.prevX = c.plotX);
              n(c.prevY) || (c.prevY = c.plotY);
              c.dispX = 0;
              c.dispY = 0;
            }
          } else
            "circle" === a
              ? this.setCircularPositions()
              : this.setRandomPositions();
        };
        c.prototype.setCircularPositions = function () {
          for (
            var a = this.box,
              b = this.nodes,
              c = (2 * Math.PI) / (b.length + 1),
              d = b.filter(function (a) {
                return 0 === a.linksTo.length;
              }),
              f = {},
              h = this.options.initialPositionRadius,
              p = function (a) {
                var b = 0;
                for (a = a.linksFrom || []; b < a.length; b++) {
                  var c = a[b];
                  f[c.toNode.id] ||
                    ((f[c.toNode.id] = !0), n.push(c.toNode), p(c.toNode));
                }
              },
              n = [],
              v = 0;
            v < d.length;
            v++
          ) {
            var m = d[v];
            n.push(m);
            p(m);
          }
          if (n.length)
            for (d = 0; d < b.length; d++)
              (v = b[d]), -1 === n.indexOf(v) && n.push(v);
          else n = b;
          d = 0;
          for (v = n.length; d < v; ++d)
            (b = n[d]),
              (b.plotX = b.prevX =
                t(b.plotX, a.width / 2 + h * Math.cos(d * c))),
              (b.plotY = b.prevY =
                t(b.plotY, a.height / 2 + h * Math.sin(d * c))),
              (b.dispX = 0),
              (b.dispY = 0);
        };
        c.prototype.setRandomPositions = function () {
          for (
            var a = this.box,
              b = this.nodes,
              c = b.length + 1,
              d = function (a) {
                a = (a * a) / Math.PI;
                return (a -= Math.floor(a));
              },
              f,
              h = 0,
              p = b.length;
            h < p;
            ++h
          )
            (f = b[h]),
              (f.plotX = f.prevX = t(f.plotX, a.width * d(h))),
              (f.plotY = f.prevY = t(f.plotY, a.height * d(c + h))),
              (f.dispX = 0),
              (f.dispY = 0);
        };
        c.prototype.force = function (a) {
          for (var b = [], c = 1; c < arguments.length; c++)
            b[c - 1] = arguments[c];
          this.integration[a].apply(this, b);
        };
        c.prototype.barycenterForces = function () {
          this.getBarycenter();
          this.force("barycenter");
        };
        c.prototype.getBarycenter = function () {
          for (
            var a = 0, b = 0, c = 0, d = 0, f = this.nodes;
            d < f.length;
            d++
          ) {
            var h = f[d];
            b += h.plotX * h.mass;
            c += h.plotY * h.mass;
            a += h.mass;
          }
          return (this.barycenter = {
            x: b,
            y: c,
            xFactor: b / a,
            yFactor: c / a,
          });
        };
        c.prototype.barnesHutApproximation = function (a, b) {
          var c = this.getDistXY(a, b),
            e = this.vectorLength(c);
          if (a !== b && 0 !== e)
            if (b.isInternal)
              if (b.boxSize / e < this.options.theta && 0 !== e) {
                var d = this.repulsiveForce(e, this.k);
                this.force("repulsive", a, d * b.mass, c, e);
                var g = !1;
              } else g = !0;
            else
              (d = this.repulsiveForce(e, this.k)),
                this.force("repulsive", a, d * b.mass, c, e);
          return g;
        };
        c.prototype.repulsiveForces = function () {
          var a = this;
          if ("barnes-hut" === this.approximation)
            for (
              var b = function (b) {
                  c.quadTree.visitNodeRecursive(null, function (c) {
                    return a.barnesHutApproximation(b, c);
                  });
                },
                c = this,
                d = 0,
                f = this.nodes;
              d < f.length;
              d++
            ) {
              var h = f[d];
              b(h);
            }
          else {
            f = d = b = void 0;
            for (var p = 0, n = this.nodes; p < n.length; p++) {
              h = n[p];
              for (var v = 0, m = this.nodes; v < m.length; v++) {
                var q = m[v];
                h === q ||
                  h.fixedPosition ||
                  ((f = this.getDistXY(h, q)),
                  (d = this.vectorLength(f)),
                  0 !== d &&
                    ((b = this.repulsiveForce(d, this.k)),
                    this.force("repulsive", h, b * q.mass, f, d)));
              }
            }
          }
        };
        c.prototype.attractiveForces = function () {
          for (var a, b, c, d = 0, f = this.links; d < f.length; d++) {
            var h = f[d];
            h.fromNode &&
              h.toNode &&
              ((a = this.getDistXY(h.fromNode, h.toNode)),
              (b = this.vectorLength(a)),
              0 !== b &&
                ((c = this.attractiveForce(b, this.k)),
                this.force("attractive", h, c, a, b)));
          }
        };
        c.prototype.applyLimits = function () {
          for (var a = 0, b = this.nodes; a < b.length; a++) {
            var c = b[a];
            if (c.fixedPosition) break;
            this.integration.integrate(this, c);
            this.applyLimitBox(c, this.box);
            c.dispX = 0;
            c.dispY = 0;
          }
        };
        c.prototype.applyLimitBox = function (a, b) {
          var c = a.radius;
          a.plotX = q(a.plotX, b.left + c, b.width - c);
          a.plotY = q(a.plotY, b.top + c, b.height - c);
        };
        c.prototype.coolDown = function (a, b, c) {
          return a - b * c;
        };
        c.prototype.isStable = function () {
          return (
            0.00001 >
              Math.abs(this.systemTemperature - this.prevSystemTemperature) ||
            0 >= this.temperature
          );
        };
        c.prototype.getSystemTemperature = function () {
          for (var a = 0, b = 0, c = this.nodes; b < c.length; b++)
            a += c[b].temperature;
          return a;
        };
        c.prototype.vectorLength = function (a) {
          return Math.sqrt(a.x * a.x + a.y * a.y);
        };
        c.prototype.getDistR = function (a, b) {
          a = this.getDistXY(a, b);
          return this.vectorLength(a);
        };
        c.prototype.getDistXY = function (a, b) {
          var c = a.plotX - b.plotX;
          a = a.plotY - b.plotY;
          return { x: c, y: a, absX: Math.abs(c), absY: Math.abs(a) };
        };
        return c;
      })();
    },
  );
  D(
    d,
    "Series/PackedBubble/PackedBubbleLayout.js",
    [
      d["Series/GraphLayoutComposition.js"],
      d["Series/PackedBubble/PackedBubbleIntegration.js"],
      d["Series/Networkgraph/ReingoldFruchtermanLayout.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d, a) {
      function f() {
        var a = [];
        this.series.forEach(function (b) {
          b.parentNode && b.parentNode.selected && a.push(b.parentNode);
        });
        return a;
      }
      function h() {
        this.allDataPoints && delete this.allDataPoints;
      }
      var m =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function e() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((e.prototype = c.prototype), new e());
            };
          })(),
        q = a.addEvent,
        n = a.pick,
        E = [];
      a = (function (a) {
        function p() {
          var b = (null !== a && a.apply(this, arguments)) || this;
          b.index = NaN;
          b.nodes = [];
          b.options = void 0;
          b.series = [];
          return b;
        }
        m(p, a);
        p.compose = function (a) {
          d.compose(a);
          b.integrations.packedbubble = c;
          b.layouts.packedbubble = p;
          -1 === E.indexOf(a) &&
            (E.push(a),
            q(a, "beforeRedraw", h),
            (a.prototype.getSelectedParentNodes = f));
        };
        p.prototype.beforeStep = function () {
          this.options.marker &&
            this.series.forEach(function (a) {
              a && a.calculateParentRadius();
            });
        };
        p.prototype.isStable = function () {
          var a = Math.abs(this.prevSystemTemperature - this.systemTemperature);
          return (
            (1 >
              Math.abs(
                (10 * this.systemTemperature) / Math.sqrt(this.nodes.length),
              ) &&
              0.00001 > a) ||
            0 >= this.temperature
          );
        };
        p.prototype.setCircularPositions = function () {
          for (
            var a = this.box,
              b = this.nodes,
              c = (2 * Math.PI) / (b.length + 1),
              d = this.options.initialPositionRadius,
              f,
              h,
              p = 0,
              m = 0;
            m < b.length;
            m++
          ) {
            var v = b[m];
            this.options.splitSeries && !v.isParentNode
              ? ((f = v.series.parentNode.plotX),
                (h = v.series.parentNode.plotY))
              : ((f = a.width / 2), (h = a.height / 2));
            v.plotX = v.prevX = n(v.plotX, f + d * Math.cos(v.index || p * c));
            v.plotY = v.prevY = n(v.plotY, h + d * Math.sin(v.index || p * c));
            v.dispX = 0;
            v.dispY = 0;
            p++;
          }
        };
        p.prototype.repulsiveForces = function () {
          var a = this,
            b = a.options.bubblePadding,
            c,
            d,
            f;
          a.nodes.forEach(function (e) {
            e.degree = e.mass;
            e.neighbours = 0;
            a.nodes.forEach(function (g) {
              c = 0;
              e === g ||
                e.fixedPosition ||
                (!a.options.seriesInteraction && e.series !== g.series) ||
                ((f = a.getDistXY(e, g)),
                (d =
                  a.vectorLength(f) - (e.marker.radius + g.marker.radius + b)),
                0 > d &&
                  ((e.degree += 0.01),
                  e.neighbours++,
                  (c = a.repulsiveForce(
                    -d / Math.sqrt(e.neighbours),
                    a.k,
                    e,
                    g,
                  ))),
                a.force("repulsive", e, c * g.mass, f, g, d));
            });
          });
        };
        p.prototype.applyLimitBox = function (b, c) {
          if (
            this.options.splitSeries &&
            !b.isParentNode &&
            this.options.parentNodeLimit
          ) {
            var e = this.getDistXY(b, b.series.parentNode);
            var d =
              b.series.parentNodeRadius -
              b.marker.radius -
              this.vectorLength(e);
            0 > d &&
              d > -2 * b.marker.radius &&
              ((b.plotX -= 0.01 * e.x), (b.plotY -= 0.01 * e.y));
          }
          a.prototype.applyLimitBox.call(this, b, c);
        };
        return p;
      })(d);
      return (b.layouts.packedbubble = a);
    },
  );
  D(
    d,
    "Series/PackedBubble/PackedBubbleSeries.js",
    [
      d["Core/Color/Color.js"],
      d["Series/DragNodesComposition.js"],
      d["Series/GraphLayoutComposition.js"],
      d["Core/Globals.js"],
      d["Series/PackedBubble/PackedBubblePoint.js"],
      d["Series/PackedBubble/PackedBubbleSeriesDefaults.js"],
      d["Series/PackedBubble/PackedBubbleLayout.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d, a, f, y, m, q, n) {
      var h =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function e() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((e.prototype = c.prototype), new e());
            };
          })(),
        t = b.parse;
      b = a.noop;
      var p = q.series.prototype,
        e = q.seriesTypes.bubble,
        g = n.addEvent,
        l = n.clamp,
        k = n.defined,
        D = n.extend,
        H = n.fireEvent,
        M = n.isArray,
        F = n.isNumber,
        v = n.merge,
        Q = n.pick;
      n = (function (a) {
        function b() {
          var b = (null !== a && a.apply(this, arguments)) || this;
          b.chart = void 0;
          b.data = void 0;
          b.layout = void 0;
          b.options = void 0;
          b.parentNodeMass = 0;
          b.points = void 0;
          b.xData = void 0;
          return b;
        }
        h(b, a);
        b.compose = function (a, b, d, f) {
          e.compose(a, b, d, f);
          c.compose(b);
          m.compose(b);
        };
        b.prototype.accumulateAllPoints = function () {
          for (
            var a = this.chart, b = [], c, e = 0, d = a.series;
            e < d.length;
            e++
          ) {
            var f = d[e];
            if (
              (f.is("packedbubble") && f.visible) ||
              !a.options.chart.ignoreHiddenSeries
            ) {
              c = f.yData || [];
              for (var g = 0; g < c.length; g++)
                b.push([
                  null,
                  null,
                  c[g],
                  f.index,
                  g,
                  { id: g, marker: { radius: 0 } },
                ]);
            }
          }
          return b;
        };
        b.prototype.addLayout = function () {
          var a = (this.options.layoutAlgorithm =
              this.options.layoutAlgorithm || {}),
            b = a.type || "packedbubble",
            c = this.chart.options.chart,
            e = this.chart.graphLayoutsStorage,
            f = this.chart.graphLayoutsLookup;
          e ||
            ((this.chart.graphLayoutsStorage = e = {}),
            (this.chart.graphLayoutsLookup = f = []));
          var g = e[b];
          g ||
            ((a.enableSimulation = k(c.forExport)
              ? !c.forExport
              : a.enableSimulation),
            (e[b] = g = new d.layouts[b]()),
            g.init(a),
            f.splice(g.index, 0, g));
          this.layout = g;
          this.points.forEach(function (a) {
            a.mass = 2;
            a.degree = 1;
            a.collisionNmb = 1;
          });
          g.setArea(0, 0, this.chart.plotWidth, this.chart.plotHeight);
          g.addElementsToCollection([this], g.series);
          g.addElementsToCollection(this.points, g.nodes);
        };
        b.prototype.addSeriesLayout = function () {
          var a = (this.options.layoutAlgorithm =
              this.options.layoutAlgorithm || {}),
            b = a.type || "packedbubble",
            c = this.chart.graphLayoutsStorage,
            e = this.chart.graphLayoutsLookup;
          a = v(a, a.parentNodeOptions, {
            enableSimulation: this.layout.options.enableSimulation,
          });
          var f = c[b + "-series"];
          f ||
            ((c[b + "-series"] = f = new d.layouts[b]()),
            f.init(a),
            e.splice(f.index, 0, f));
          this.parentNodeLayout = f;
          this.createParentNodes();
        };
        b.prototype.calculateParentRadius = function () {
          var a = this.seriesBox();
          this.parentNodeRadius = l(
            Math.sqrt((2 * this.parentNodeMass) / Math.PI) + 20,
            20,
            a
              ? Math.max(
                  Math.sqrt(Math.pow(a.width, 2) + Math.pow(a.height, 2)) / 2 +
                    20,
                  20,
                )
              : Math.sqrt((2 * this.parentNodeMass) / Math.PI) + 20,
          );
          this.parentNode &&
            (this.parentNode.marker.radius = this.parentNode.radius =
              this.parentNodeRadius);
        };
        b.prototype.calculateZExtremes = function () {
          var a = this.options.zMin,
            b = this.options.zMax,
            c = Infinity,
            e = -Infinity;
          if (a && b) return [a, b];
          this.chart.series.forEach(function (a) {
            a.yData.forEach(function (a) {
              k(a) && (a > e && (e = a), a < c && (c = a));
            });
          });
          a = Q(a, c);
          b = Q(b, e);
          return [a, b];
        };
        b.prototype.checkOverlap = function (a, b) {
          var c = a[0] - b[0],
            e = a[1] - b[1];
          return -0.001 > Math.sqrt(c * c + e * e) - Math.abs(a[2] + b[2]);
        };
        b.prototype.createParentNodes = function () {
          var a = this,
            b = this.pointClass,
            c = this.chart,
            e = this.parentNodeLayout,
            d = this.layout.options,
            f,
            g = this.parentNode,
            h = {
              radius: this.parentNodeRadius,
              lineColor: this.color,
              fillColor: t(this.color).brighten(0.4).get(),
            };
          d.parentNodeOptions && (h = v(d.parentNodeOptions.marker || {}, h));
          this.parentNodeMass = 0;
          this.points.forEach(function (b) {
            a.parentNodeMass += Math.PI * Math.pow(b.marker.radius, 2);
          });
          this.calculateParentRadius();
          e.nodes.forEach(function (b) {
            b.seriesIndex === a.index && (f = !0);
          });
          e.setArea(0, 0, c.plotWidth, c.plotHeight);
          f ||
            (g ||
              (g = new b().init(this, {
                mass: this.parentNodeRadius / 2,
                marker: h,
                dataLabels: { inside: !1 },
                states: { normal: { marker: h }, hover: { marker: h } },
                dataLabelOnNull: !0,
                degree: this.parentNodeRadius,
                isParentNode: !0,
                seriesIndex: this.index,
              })),
            this.parentNode &&
              ((g.plotX = this.parentNode.plotX),
              (g.plotY = this.parentNode.plotY)),
            (this.parentNode = g),
            e.addElementsToCollection([this], e.series),
            e.addElementsToCollection([g], e.nodes));
        };
        b.prototype.deferLayout = function () {
          var a = this.options.layoutAlgorithm;
          this.visible &&
            (this.addLayout(), a.splitSeries && this.addSeriesLayout());
        };
        b.prototype.destroy = function () {
          var a = this;
          this.chart.graphLayoutsLookup &&
            this.chart.graphLayoutsLookup.forEach(function (b) {
              b.removeElementFromCollection(a, b.series);
            }, this);
          this.parentNode &&
            this.parentNodeLayout &&
            (this.parentNodeLayout.removeElementFromCollection(
              this.parentNode,
              this.parentNodeLayout.nodes,
            ),
            this.parentNode.dataLabel &&
              (this.parentNode.dataLabel =
                this.parentNode.dataLabel.destroy()));
          p.destroy.apply(this, arguments);
        };
        b.prototype.drawDataLabels = function () {
          p.drawDataLabels.call(this, this.points);
          this.parentNode &&
            ((this.parentNode.formatPrefix = "parentNode"),
            p.drawDataLabels.call(this, [this.parentNode]));
        };
        b.prototype.drawGraph = function () {
          if (this.layout && this.layout.options.splitSeries) {
            var a = this.chart,
              b = this.layout.options.parentNodeOptions.marker;
            b = {
              fill: b.fillColor || t(this.color).brighten(0.4).get(),
              opacity: b.fillOpacity,
              stroke: b.lineColor || this.color,
              "stroke-width": Q(b.lineWidth, this.options.lineWidth),
            };
            this.parentNodesGroup ||
              ((this.parentNodesGroup = this.plotGroup(
                "parentNodesGroup",
                "parentNode",
                this.visible ? "inherit" : "hidden",
                0.1,
                a.seriesGroup,
              )),
              this.group.attr({ zIndex: 2 }));
            this.calculateParentRadius();
            var c = v(
              {
                x: this.parentNode.plotX - this.parentNodeRadius,
                y: this.parentNode.plotY - this.parentNodeRadius,
                width: 2 * this.parentNodeRadius,
                height: 2 * this.parentNodeRadius,
              },
              b,
            );
            this.parentNode.graphic ||
              (this.graph = this.parentNode.graphic =
                a.renderer.symbol(b.symbol).add(this.parentNodesGroup));
            this.parentNode.graphic.attr(c);
          }
        };
        b.prototype.drawTracker = function () {
          var b = this.parentNode;
          a.prototype.drawTracker.call(this);
          if (b) {
            var c = M(b.dataLabels)
              ? b.dataLabels
              : b.dataLabel
                ? [b.dataLabel]
                : [];
            b.graphic && (b.graphic.element.point = b);
            c.forEach(function (a) {
              a.div ? (a.div.point = b) : (a.element.point = b);
            });
          }
        };
        b.prototype.getPointRadius = function () {
          var a = this,
            b = this.chart,
            c = this.options,
            e = c.useSimulation,
            d = Math.min(b.plotWidth, b.plotHeight),
            f = {},
            g = [],
            h = b.allDataPoints || [],
            k = h.length,
            p,
            n,
            u,
            C;
          ["minSize", "maxSize"].forEach(function (a) {
            var b = parseInt(c[a], 10),
              e = /%$/.test(c[a]);
            f[a] = e ? (d * b) / 100 : b * Math.sqrt(k);
          });
          b.minRadius = p = f.minSize / Math.sqrt(k);
          b.maxRadius = n = f.maxSize / Math.sqrt(k);
          var x = e ? this.calculateZExtremes() : [p, n];
          h.forEach(function (b, c) {
            u = e ? l(b[2], x[0], x[1]) : b[2];
            C = a.getRadius(x[0], x[1], p, n, u);
            0 === C && (C = null);
            h[c][2] = C;
            g.push(C);
          });
          this.radii = g;
        };
        b.prototype.init = function () {
          p.init.apply(this, arguments);
          this.eventsToUnbind.push(
            g(this, "updatedData", function () {
              var a = this;
              this.chart.series.forEach(function (b) {
                b.type === a.type && (b.isDirty = !0);
              }, this);
            }),
          );
          return this;
        };
        b.prototype.onMouseUp = function (a) {
          var b = a;
          if (b.fixedPosition && !b.removed) {
            var e = this.layout,
              d = this.parentNodeLayout,
              f,
              g;
            d &&
              e.options.dragBetweenSeries &&
              d.nodes.forEach(function (a) {
                b &&
                  b.marker &&
                  a !== b.series.parentNode &&
                  ((f = e.getDistXY(b, a)),
                  (g = e.vectorLength(f) - a.marker.radius - b.marker.radius),
                  0 > g &&
                    (a.series.addPoint(
                      v(b.options, { plotX: b.plotX, plotY: b.plotY }),
                      !1,
                    ),
                    e.removeElementFromCollection(b, e.nodes),
                    b.remove()));
              });
            c.onMouseUp.apply(this, arguments);
          }
        };
        b.prototype.placeBubbles = function (a) {
          var b = this.checkOverlap,
            c = this.positionBubble,
            e = [],
            d = 1,
            f = 0,
            g = 0;
          var h = [];
          var l;
          a = a.sort(function (a, b) {
            return b[2] - a[2];
          });
          if (a.length) {
            e.push([[0, 0, a[0][2], a[0][3], a[0][4]]]);
            if (1 < a.length)
              for (
                e.push([[0, 0 - a[1][2] - a[0][2], a[1][2], a[1][3], a[1][4]]]),
                  l = 2;
                l < a.length;
                l++
              )
                (a[l][2] = a[l][2] || 1),
                  (h = c(e[d][f], e[d - 1][g], a[l])),
                  b(h, e[d][0])
                    ? (e.push([]),
                      (g = 0),
                      e[d + 1].push(c(e[d][f], e[d][0], a[l])),
                      d++,
                      (f = 0))
                    : 1 < d && e[d - 1][g + 1] && b(h, e[d - 1][g + 1])
                      ? (g++, e[d].push(c(e[d][f], e[d - 1][g], a[l])), f++)
                      : (f++, e[d].push(h));
            this.chart.stages = e;
            this.chart.rawPositions = [].concat.apply([], e);
            this.resizeRadius();
            h = this.chart.rawPositions;
          }
          return h;
        };
        b.prototype.pointAttribs = function (a, b) {
          var c = this.options,
            e = c.marker;
          a &&
            a.isParentNode &&
            c.layoutAlgorithm &&
            c.layoutAlgorithm.parentNodeOptions &&
            (e = c.layoutAlgorithm.parentNodeOptions.marker);
          c = e.fillOpacity;
          a = p.pointAttribs.call(this, a, b);
          1 !== c && (a["fill-opacity"] = c);
          return a;
        };
        b.prototype.positionBubble = function (a, b, c) {
          var e = Math.sqrt,
            d = Math.asin,
            f = Math.acos,
            g = Math.pow,
            h = Math.abs;
          e = e(g(a[0] - b[0], 2) + g(a[1] - b[1], 2));
          f = f(
            (g(e, 2) + g(c[2] + b[2], 2) - g(c[2] + a[2], 2)) /
              (2 * (c[2] + b[2]) * e),
          );
          d = d(h(a[0] - b[0]) / e);
          a =
            (0 > a[1] - b[1] ? 0 : Math.PI) +
            f +
            d * (0 > (a[0] - b[0]) * (a[1] - b[1]) ? 1 : -1);
          return [
            b[0] + (b[2] + c[2]) * Math.sin(a),
            b[1] - (b[2] + c[2]) * Math.cos(a),
            c[2],
            c[3],
            c[4],
          ];
        };
        b.prototype.render = function () {
          var a = [];
          p.render.apply(this, arguments);
          this.options.dataLabels.allowOverlap ||
            (this.data.forEach(function (b) {
              M(b.dataLabels) &&
                b.dataLabels.forEach(function (b) {
                  a.push(b);
                });
            }),
            this.options.useSimulation && this.chart.hideOverlappingLabels(a));
        };
        b.prototype.resizeRadius = function () {
          var a = this.chart,
            b = a.rawPositions,
            c = Math.min,
            e = Math.max,
            d = a.plotLeft,
            f = a.plotTop,
            g = a.plotHeight,
            h = a.plotWidth,
            l,
            k;
          var p = (l = Number.POSITIVE_INFINITY);
          var u = (k = Number.NEGATIVE_INFINITY);
          for (var C = 0; C < b.length; C++) {
            var x = b[C];
            var n = x[2];
            p = c(p, x[0] - n);
            u = e(u, x[0] + n);
            l = c(l, x[1] - n);
            k = e(k, x[1] + n);
          }
          x = [u - p, k - l];
          c = c.apply([], [(h - d) / x[0], (g - f) / x[1]]);
          if (1e-10 < Math.abs(c - 1)) {
            for (a = 0; a < b.length; a++) (x = b[a]), (x[2] *= c);
            this.placeBubbles(b);
          } else
            (a.diffY = g / 2 + f - l - (k - l) / 2),
              (a.diffX = h / 2 + d - p - (u - p) / 2);
        };
        b.prototype.seriesBox = function () {
          var a = this.chart,
            b = Math.max,
            c = Math.min,
            e = [
              a.plotLeft,
              a.plotLeft + a.plotWidth,
              a.plotTop,
              a.plotTop + a.plotHeight,
            ],
            d;
          this.data.forEach(function (a) {
            k(a.plotX) &&
              k(a.plotY) &&
              a.marker.radius &&
              ((d = a.marker.radius),
              (e[0] = c(e[0], a.plotX - d)),
              (e[1] = b(e[1], a.plotX + d)),
              (e[2] = c(e[2], a.plotY - d)),
              (e[3] = b(e[3], a.plotY + d)));
          });
          return F(e.width / e.height) ? e : null;
        };
        b.prototype.setVisible = function () {
          var a = this;
          p.setVisible.apply(a, arguments);
          a.parentNodeLayout && a.graph
            ? a.visible
              ? (a.graph.show(),
                a.parentNode.dataLabel && a.parentNode.dataLabel.show())
              : (a.graph.hide(),
                a.parentNodeLayout.removeElementFromCollection(
                  a.parentNode,
                  a.parentNodeLayout.nodes,
                ),
                a.parentNode.dataLabel && a.parentNode.dataLabel.hide())
            : a.layout &&
              (a.visible
                ? a.layout.addElementsToCollection(a.points, a.layout.nodes)
                : a.points.forEach(function (b) {
                    a.layout.removeElementFromCollection(b, a.layout.nodes);
                  }));
        };
        b.prototype.translate = function () {
          var a = this.chart,
            b = this.data,
            c = this.index,
            e = this.options.useSimulation;
          this.processedXData = this.xData;
          this.generatePoints();
          k(a.allDataPoints) ||
            ((a.allDataPoints = this.accumulateAllPoints()),
            this.getPointRadius());
          if (e) var d = a.allDataPoints;
          else
            (d = this.placeBubbles(a.allDataPoints)),
              (this.options.draggable = !1);
          for (var f = 0, g = d; f < g.length; f++) {
            var h = g[f];
            if (h[3] === c) {
              d = b[h[4]];
              var l = Q(h[2], void 0);
              e ||
                ((d.plotX = h[0] - a.plotLeft + a.diffX),
                (d.plotY = h[1] - a.plotTop + a.diffY));
              F(l) &&
                ((d.marker = D(d.marker, {
                  radius: l,
                  width: 2 * l,
                  height: 2 * l,
                })),
                (d.radius = l));
            }
          }
          e && this.deferLayout();
          H(this, "afterTranslate");
        };
        b.defaultOptions = v(e.defaultOptions, y);
        return b;
      })(e);
      D(n.prototype, {
        pointClass: f,
        axisTypes: [],
        directTouch: !0,
        forces: ["barycenter", "repulsive"],
        hasDraggableNodes: !0,
        isCartesian: !1,
        noSharedTooltip: !0,
        pointArrayMap: ["value"],
        pointValKey: "value",
        requireSorting: !1,
        trackerGroups: ["group", "dataLabelsGroup", "parentNodesGroup"],
        alignDataLabel: p.alignDataLabel,
        indexateNodes: b,
        onMouseDown: c.onMouseDown,
        onMouseMove: c.onMouseMove,
        redrawHalo: c.redrawHalo,
        searchPoint: b,
      });
      q.registerSeriesType("packedbubble", n);
      ("");
      return n;
    },
  );
  D(
    d,
    "Series/Polygon/PolygonSeries.js",
    [
      d["Core/Globals.js"],
      d["Core/Legend/LegendSymbol.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d, a) {
      var f =
        (this && this.__extends) ||
        (function () {
          var a = function (b, c) {
            a =
              Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array &&
                function (a, b) {
                  a.__proto__ = b;
                }) ||
              function (a, b) {
                for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
              };
            return a(b, c);
          };
          return function (b, c) {
            function e() {
              this.constructor = b;
            }
            a(b, c);
            b.prototype =
              null === c
                ? Object.create(c)
                : ((e.prototype = c.prototype), new e());
          };
        })();
      b = b.noop;
      var h = d.series,
        m = d.seriesTypes,
        q = m.area,
        n = m.line,
        E = m.scatter;
      m = a.extend;
      var t = a.merge;
      a = (function (a) {
        function b() {
          var b = (null !== a && a.apply(this, arguments)) || this;
          b.data = void 0;
          b.options = void 0;
          b.points = void 0;
          return b;
        }
        f(b, a);
        b.prototype.getGraphPath = function () {
          for (
            var a = n.prototype.getGraphPath.call(this), b = a.length + 1;
            b--;

          )
            (b === a.length || "M" === a[b][0]) &&
              0 < b &&
              a.splice(b, 0, ["Z"]);
          return (this.areaPath = a);
        };
        b.prototype.drawGraph = function () {
          this.options.fillColor = this.color;
          q.prototype.drawGraph.call(this);
        };
        b.defaultOptions = t(E.defaultOptions, {
          marker: { enabled: !1, states: { hover: { enabled: !1 } } },
          stickyTracking: !1,
          tooltip: { followPointer: !0, pointFormat: "" },
          trackByArea: !0,
        });
        return b;
      })(E);
      m(a.prototype, {
        type: "polygon",
        drawLegendSymbol: c.drawRectangle,
        drawTracker: h.prototype.drawTracker,
        setStackedPoints: b,
      });
      d.registerSeriesType("polygon", a);
      ("");
      return a;
    },
  );
  D(
    d,
    "Core/Axis/WaterfallAxis.js",
    [d["Core/Axis/Stacking/StackItem.js"], d["Core/Utilities.js"]],
    function (b, c) {
      var d = c.addEvent,
        a = c.objectEach,
        f;
      (function (c) {
        function f() {
          var a = this.waterfall.stacks;
          a && ((a.changed = !1), delete a.alreadyChanged);
        }
        function h() {
          var a = this.options.stackLabels;
          a &&
            a.enabled &&
            this.waterfall.stacks &&
            this.waterfall.renderStackTotals();
        }
        function n() {
          for (var a = this.axes, b = this.series, c = b.length; c--; )
            b[c].options.stacking &&
              (a.forEach(function (a) {
                a.isXAxis || (a.waterfall.stacks.changed = !0);
              }),
              (c = 0));
        }
        function y() {
          this.waterfall || (this.waterfall = new t(this));
        }
        var t = (function () {
          function c(a) {
            this.axis = a;
            this.stacks = { changed: !1 };
          }
          c.prototype.renderStackTotals = function () {
            var c = this.axis,
              d = c.waterfall.stacks,
              f = c.stacking && c.stacking.stackTotalGroup,
              h = new b(c, c.options.stackLabels || {}, !1, 0, void 0);
            this.dummyStackItem = h;
            f &&
              a(d, function (c) {
                a(c, function (a, c) {
                  h.total = a.stackTotal;
                  h.x = +c;
                  a.label && (h.label = a.label);
                  b.prototype.render.call(h, f);
                  a.label = h.label;
                  delete h.label;
                });
              });
            h.total = null;
          };
          return c;
        })();
        c.Composition = t;
        c.compose = function (a, b) {
          d(a, "init", y);
          d(a, "afterBuildStacks", f);
          d(a, "afterRender", h);
          d(b, "beforeRedraw", n);
        };
      })(f || (f = {}));
      return f;
    },
  );
  D(
    d,
    "Series/Waterfall/WaterfallPoint.js",
    [
      d["Series/Column/ColumnSeries.js"],
      d["Core/Series/Point.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d) {
      var a =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function d() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((d.prototype = c.prototype), new d());
            };
          })(),
        f = d.isNumber;
      return (function (b) {
        function d() {
          var a = (null !== b && b.apply(this, arguments)) || this;
          a.options = void 0;
          a.series = void 0;
          return a;
        }
        a(d, b);
        d.prototype.getClassName = function () {
          var a = c.prototype.getClassName.call(this);
          this.isSum
            ? (a += " highcharts-sum")
            : this.isIntermediateSum && (a += " highcharts-intermediate-sum");
          return a;
        };
        d.prototype.isValid = function () {
          return f(this.y) || this.isSum || !!this.isIntermediateSum;
        };
        return d;
      })(b.prototype.pointClass);
    },
  );
  D(
    d,
    "Series/Waterfall/WaterfallSeries.js",
    [
      d["Core/Axis/Axis.js"],
      d["Core/Chart/Chart.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Core/Utilities.js"],
      d["Core/Axis/WaterfallAxis.js"],
      d["Series/Waterfall/WaterfallPoint.js"],
    ],
    function (b, c, d, a, f, y) {
      var h =
          (this && this.__extends) ||
          (function () {
            var a = function (b, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                };
              return a(b, c);
            };
            return function (b, c) {
              function e() {
                this.constructor = b;
              }
              a(b, c);
              b.prototype =
                null === c
                  ? Object.create(c)
                  : ((e.prototype = c.prototype), new e());
            };
          })(),
        q = d.seriesTypes,
        n = q.column,
        D = q.line,
        t = a.arrayMax,
        p = a.arrayMin,
        e = a.correctFloat;
      q = a.extend;
      var g = a.isNumber,
        l = a.merge,
        k = a.objectEach,
        J = a.pick;
      a = (function (a) {
        function b() {
          var b = (null !== a && a.apply(this, arguments)) || this;
          b.chart = void 0;
          b.data = void 0;
          b.options = void 0;
          b.points = void 0;
          b.stackedYNeg = void 0;
          b.stackedYPos = void 0;
          b.stackKey = void 0;
          b.xData = void 0;
          b.yAxis = void 0;
          b.yData = void 0;
          return b;
        }
        h(b, a);
        b.prototype.generatePoints = function () {
          n.prototype.generatePoints.apply(this);
          for (var a = 0, b = this.points.length; a < b; a++) {
            var c = this.points[a],
              d = this.processedYData[a];
            g(d) && (c.isIntermediateSum || c.isSum) && (c.y = e(d));
          }
        };
        b.prototype.translate = function () {
          var a = this.options,
            b = this.yAxis,
            c = J(a.minPointLength, 5),
            e = c / 2,
            d = a.threshold || 0;
          a = a.stacking;
          var f = b.waterfall.stacks[this.stackKey],
            h = d,
            l = d;
          n.prototype.translate.apply(this);
          for (var k = this.points, r = 0; r < k.length; r++) {
            var p = k[r];
            var m = this.processedYData[r];
            var q = p.shapeArgs;
            if (q && g(m)) {
              var A = [0, m];
              var t = p.y;
              if (a) {
                if (f) {
                  A = f[r];
                  if ("overlap" === a) {
                    var y = A.stackState[A.stateIndex--];
                    y = 0 <= t ? y : y - t;
                    Object.hasOwnProperty.call(A, "absolutePos") &&
                      delete A.absolutePos;
                    Object.hasOwnProperty.call(A, "absoluteNeg") &&
                      delete A.absoluteNeg;
                  } else
                    0 <= t
                      ? ((y = A.threshold + A.posTotal), (A.posTotal -= t))
                      : ((y = A.threshold + A.negTotal),
                        (A.negTotal -= t),
                        (y -= t)),
                      !A.posTotal &&
                        g(A.absolutePos) &&
                        Object.hasOwnProperty.call(A, "absolutePos") &&
                        ((A.posTotal = A.absolutePos), delete A.absolutePos),
                      !A.negTotal &&
                        g(A.absoluteNeg) &&
                        Object.hasOwnProperty.call(A, "absoluteNeg") &&
                        ((A.negTotal = A.absoluteNeg), delete A.absoluteNeg);
                  p.isSum ||
                    (A.connectorThreshold = A.threshold + A.stackTotal);
                  b.reversed
                    ? ((m = 0 <= t ? y - t : y + t), (t = y))
                    : ((m = y), (t = y - t));
                  p.below = m <= d;
                  q.y = b.translate(m, !1, !0, !1, !0);
                  q.height = Math.abs(q.y - b.translate(t, !1, !0, !1, !0));
                  if ((t = b.waterfall.dummyStackItem))
                    (t.x = r),
                      (t.label = f[r].label),
                      t.setOffset(
                        this.pointXOffset || 0,
                        this.barW || 0,
                        this.stackedYNeg[r],
                        this.stackedYPos[r],
                      );
                }
              } else
                (y = Math.max(l, l + t) + A[0]),
                  (q.y = b.translate(y, !1, !0, !1, !0)),
                  p.isSum
                    ? ((q.y = b.translate(A[1], !1, !0, !1, !0)),
                      (q.height =
                        Math.min(b.translate(A[0], !1, !0, !1, !0), b.len) -
                        q.y),
                      (p.below = A[1] <= d))
                    : p.isIntermediateSum
                      ? (0 <= t
                          ? ((m = A[1] + h), (t = h))
                          : ((m = h), (t = A[1] + h)),
                        b.reversed && ((m ^= t), (t ^= m), (m ^= t)),
                        (q.y = b.translate(m, !1, !0, !1, !0)),
                        (q.height = Math.abs(
                          q.y - Math.min(b.translate(t, !1, !0, !1, !0), b.len),
                        )),
                        (h += A[1]),
                        (p.below = m <= d))
                      : ((q.height =
                          0 < m
                            ? b.translate(l, !1, !0, !1, !0) - q.y
                            : b.translate(l, !1, !0, !1, !0) -
                              b.translate(l - m, !1, !0, !1, !0)),
                        (l += m),
                        (p.below = l < d)),
                  0 > q.height && ((q.y += q.height), (q.height *= -1));
              p.plotY = q.y = Math.round(q.y || 0) - (this.borderWidth % 2) / 2;
              q.height = Math.max(Math.round(q.height || 0), 0.001);
              p.yBottom = q.y + q.height;
              q.height <= c && !p.isNull
                ? ((q.height = c),
                  (q.y -= e),
                  (p.plotY = q.y),
                  (p.minPointLengthOffset = 0 > p.y ? -e : e))
                : (p.isNull && (q.width = 0), (p.minPointLengthOffset = 0));
              t = p.plotY + (p.negative ? q.height : 0);
              p.below && (p.plotY += q.height);
              p.tooltipPos &&
                (this.chart.inverted
                  ? (p.tooltipPos[0] = b.len - t)
                  : (p.tooltipPos[1] = t));
              p.isInside = this.isPointInside(p);
            }
          }
        };
        b.prototype.processData = function (b) {
          var c = this.options,
            d = this.yData,
            f = c.data,
            g = d.length,
            h = c.threshold || 0,
            l,
            k,
            p,
            n,
            m;
          for (m = k = l = p = n = 0; m < g; m++) {
            var q = d[m];
            var t = f && f[m] ? f[m] : {};
            "sum" === q || t.isSum
              ? (d[m] = e(k))
              : "intermediateSum" === q || t.isIntermediateSum
                ? ((d[m] = e(l)), (l = 0))
                : ((k += q), (l += q));
            p = Math.min(k, p);
            n = Math.max(k, n);
          }
          a.prototype.processData.call(this, b);
          c.stacking || ((this.dataMin = p + h), (this.dataMax = n));
        };
        b.prototype.toYData = function (a) {
          return a.isSum
            ? "sum"
            : a.isIntermediateSum
              ? "intermediateSum"
              : a.y;
        };
        b.prototype.updateParallelArrays = function (b, c) {
          a.prototype.updateParallelArrays.call(this, b, c);
          if ("sum" === this.yData[0] || "intermediateSum" === this.yData[0])
            this.yData[0] = null;
        };
        b.prototype.pointAttribs = function (a, b) {
          var c = this.options.upColor;
          c && !a.options.color && (a.color = 0 < a.y ? c : void 0);
          a = n.prototype.pointAttribs.call(this, a, b);
          delete a.dashstyle;
          return a;
        };
        b.prototype.getGraphPath = function () {
          return [["M", 0, 0]];
        };
        b.prototype.getCrispPath = function () {
          var a = this.data,
            b = this.yAxis,
            c = a.length,
            e = (Math.round(this.graph.strokeWidth()) % 2) / 2,
            d = (Math.round(this.borderWidth) % 2) / 2,
            f = this.xAxis.reversed,
            g = this.yAxis.reversed,
            h = this.options.stacking,
            l = [],
            k;
          for (k = 1; k < c; k++) {
            var p = a[k].shapeArgs;
            var n = a[k - 1];
            var m = a[k - 1].shapeArgs;
            var q = b.waterfall.stacks[this.stackKey];
            var t = 0 < n.y ? -m.height : 0;
            q &&
              m &&
              p &&
              ((q = q[k - 1]),
              h
                ? ((q = q.connectorThreshold),
                  (t =
                    Math.round(b.translate(q, !1, !0, !1, !0) + (g ? t : 0)) -
                    e))
                : (t = m.y + n.minPointLengthOffset + d - e),
              l.push(
                ["M", (m.x || 0) + (f ? 0 : m.width || 0), t],
                ["L", (p.x || 0) + (f ? p.width || 0 : 0), t],
              ));
            m &&
              l.length &&
              ((!h && 0 > n.y && !g) || (0 < n.y && g)) &&
              ((n = l[l.length - 2]) &&
                "number" === typeof n[2] &&
                (n[2] += m.height || 0),
              (n = l[l.length - 1]) &&
                "number" === typeof n[2] &&
                (n[2] += m.height || 0));
          }
          return l;
        };
        b.prototype.drawGraph = function () {
          D.prototype.drawGraph.call(this);
          this.graph && this.graph.attr({ d: this.getCrispPath() });
        };
        b.prototype.setStackedPoints = function () {
          function a(a, b, c, e) {
            if (u) {
              if (R) for (c; c < R; c++) u.stackState[c] += e;
              else (u.stackState[0] = a), (R = u.stackState.length);
              u.stackState.push(u.stackState[R - 1] + b);
            }
          }
          var b = this.options,
            c = this.yAxis.waterfall.stacks,
            e = b.threshold || 0,
            d = e,
            f = d,
            g = this.stackKey,
            h = this.xData,
            l = h.length,
            k,
            p,
            n;
          this.yAxis.stacking.usePercentage = !1;
          var m = (k = p = d);
          if (this.visible || !this.chart.options.chart.ignoreHiddenSeries) {
            var q = c.changed;
            (n = c.alreadyChanged) && 0 > n.indexOf(g) && (q = !0);
            c[g] || (c[g] = {});
            if ((n = c[g]))
              for (var t = 0; t < l; t++) {
                var y = h[t];
                if (!n[y] || q)
                  n[y] = {
                    negTotal: 0,
                    posTotal: 0,
                    stackTotal: 0,
                    threshold: 0,
                    stateIndex: 0,
                    stackState: [],
                    label: q && n[y] ? n[y].label : void 0,
                  };
                var u = n[y];
                var C = this.yData[t];
                0 <= C ? (u.posTotal += C) : (u.negTotal += C);
                var x = b.data[t];
                y = u.absolutePos = u.posTotal;
                var P = (u.absoluteNeg = u.negTotal);
                u.stackTotal = y + P;
                var R = u.stackState.length;
                x && x.isIntermediateSum
                  ? (a(p, k, 0, p),
                    (p = k),
                    (k = e),
                    (d ^= f),
                    (f ^= d),
                    (d ^= f))
                  : x && x.isSum
                    ? (a(e, m, R, 0), (d = e))
                    : (a(d, C, 0, m), x && ((m += C), (k += C)));
                u.stateIndex++;
                u.threshold = d;
                d += u.stackTotal;
              }
            c.changed = !1;
            c.alreadyChanged || (c.alreadyChanged = []);
            c.alreadyChanged.push(g);
          }
        };
        b.prototype.getExtremes = function () {
          var a = this.options.stacking;
          if (a) {
            var b = this.yAxis;
            b = b.waterfall.stacks;
            var c = (this.stackedYNeg = []);
            var e = (this.stackedYPos = []);
            "overlap" === a
              ? k(b[this.stackKey], function (a) {
                  c.push(p(a.stackState));
                  e.push(t(a.stackState));
                })
              : k(b[this.stackKey], function (a) {
                  c.push(a.negTotal + a.threshold);
                  e.push(a.posTotal + a.threshold);
                });
            return { dataMin: p(c), dataMax: t(e) };
          }
          return { dataMin: this.dataMin, dataMax: this.dataMax };
        };
        b.defaultOptions = l(n.defaultOptions, {
          dataLabels: { inside: !0 },
          lineWidth: 1,
          lineColor: "#333333",
          dashStyle: "Dot",
          borderColor: "#333333",
          states: { hover: { lineWidthPlus: 0 } },
        });
        return b;
      })(n);
      q(a.prototype, {
        getZonesGraphs: D.prototype.getZonesGraphs,
        pointValKey: "y",
        showLine: !0,
        pointClass: y,
      });
      d.registerSeriesType("waterfall", a);
      f.compose(b, c);
      ("");
      return a;
    },
  );
  D(
    d,
    "Core/Axis/RadialAxis.js",
    [
      d["Core/Axis/AxisDefaults.js"],
      d["Core/Defaults.js"],
      d["Core/Globals.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d, a) {
      var f = c.defaultOptions,
        h = d.noop,
        m = a.addEvent,
        q = a.correctFloat,
        n = a.defined,
        D = a.extend,
        t = a.fireEvent,
        p = a.merge,
        e = a.pick,
        g = a.relativeLength,
        l = a.wrap,
        k;
      (function (a) {
        function c() {
          this.autoConnect =
            this.isCircular &&
            "undefined" === typeof e(this.userMax, this.options.max) &&
            q(this.endAngleRad - this.startAngleRad) === q(2 * Math.PI);
          !this.isCircular && this.chart.inverted && this.max++;
          this.autoConnect &&
            (this.max +=
              (this.categories && 1) ||
              this.pointRange ||
              this.closestPointRange ||
              0);
        }
        function d() {
          var a = this;
          return function () {
            if (
              a.isRadial &&
              a.tickPositions &&
              a.options.labels &&
              !0 !== a.options.labels.allowOverlap
            )
              return a.tickPositions
                .map(function (b) {
                  return a.ticks[b] && a.ticks[b].label;
                })
                .filter(function (a) {
                  return !!a;
                });
          };
        }
        function k() {
          return h;
        }
        function v(a, b, c) {
          var e = this.pane.center,
            d = a.value;
          if (this.isCircular) {
            if (n(d))
              a.point &&
                ((f = a.point.shapeArgs || {}),
                f.start &&
                  (d = this.chart.inverted
                    ? this.translate(a.point.rectPlotY, !0)
                    : a.point.x));
            else {
              var f = a.chartX || 0;
              var g = a.chartY || 0;
              d = this.translate(
                Math.atan2(g - c, f - b) - this.startAngleRad,
                !0,
              );
            }
            a = this.getPosition(d);
            f = a.x;
            g = a.y;
          } else
            n(d) || ((f = a.chartX), (g = a.chartY)),
              n(f) &&
                n(g) &&
                ((c = e[1] + this.chart.plotTop),
                (d = this.translate(
                  Math.min(
                    Math.sqrt(Math.pow(f - b, 2) + Math.pow(g - c, 2)),
                    e[2] / 2,
                  ) -
                    e[3] / 2,
                  !0,
                )));
          return [d, f || 0, g || 0];
        }
        function y(a, b, c) {
          a = this.pane.center;
          var d = this.chart,
            f = this.left || 0,
            g = this.top || 0,
            h = e(b, a[2] / 2 - this.offset);
          "undefined" === typeof c &&
            (c = this.horiz ? 0 : this.center && -this.center[3] / 2);
          c && (h += c);
          this.isCircular || "undefined" !== typeof b
            ? ((b = this.chart.renderer.symbols.arc(f + a[0], g + a[1], h, h, {
                start: this.startAngleRad,
                end: this.endAngleRad,
                open: !0,
                innerR: 0,
              })),
              (b.xBounds = [f + a[0]]),
              (b.yBounds = [g + a[1] - h]))
            : ((b = this.postTranslate(this.angleRad, h)),
              (b = [
                ["M", this.center[0] + d.plotLeft, this.center[1] + d.plotTop],
                ["L", b.x, b.y],
              ]));
          return b;
        }
        function E() {
          this.constructor.prototype.getOffset.call(this);
          this.chart.axisOffset[this.side] = 0;
        }
        function L(a, b, c) {
          var d = this.chart,
            f = function (a) {
              if ("string" === typeof a) {
                var b = parseInt(a, 10);
                n.test(a) && (b = (b * C) / 100);
                return b;
              }
              return a;
            },
            g = this.center,
            h = this.startAngleRad,
            C = g[2] / 2,
            l = Math.min(this.offset, 0),
            k = this.left || 0,
            p = this.top || 0,
            n = /%$/,
            u = this.isCircular,
            x = e(f(c.outerRadius), C),
            m = f(c.innerRadius);
          f = e(f(c.thickness), 10);
          if ("polygon" === this.options.gridLineInterpolation)
            l = this.getPlotLinePath({ value: a }).concat(
              this.getPlotLinePath({ value: b, reverse: !0 }),
            );
          else {
            a = Math.max(a, this.min);
            b = Math.min(b, this.max);
            a = this.translate(a);
            b = this.translate(b);
            u || ((x = a || 0), (m = b || 0));
            if ("circle" !== c.shape && u) (c = h + (a || 0)), (h += b || 0);
            else {
              c = -Math.PI / 2;
              h = 1.5 * Math.PI;
              var O = !0;
            }
            x -= l;
            l = d.renderer.symbols.arc(k + g[0], p + g[1], x, x, {
              start: Math.min(c, h),
              end: Math.max(c, h),
              innerR: e(m, x - (f - l)),
              open: O,
            });
            u &&
              ((u = (h + c) / 2),
              (k = k + g[0] + (g[2] / 2) * Math.cos(u)),
              (l.xBounds =
                u > -Math.PI / 2 && u < Math.PI / 2
                  ? [k, d.plotWidth]
                  : [0, k]),
              (l.yBounds = [p + g[1] + (g[2] / 2) * Math.sin(u)]),
              (l.yBounds[0] +=
                (u > -Math.PI && 0 > u) || u > Math.PI ? -10 : 10));
          }
          return l;
        }
        function w(a) {
          var b = this,
            c = this.pane.center,
            e = this.chart,
            d = e.inverted,
            f = a.reverse,
            h = this.pane.options.background
              ? this.pane.options.background[0] || this.pane.options.background
              : {},
            C = h.innerRadius || "0%",
            l = h.outerRadius || "100%",
            k = c[0] + e.plotLeft,
            u = c[1] + e.plotTop,
            p = this.height,
            n = a.isCrosshair;
          h = c[3] / 2;
          var x = a.value,
            m;
          var O = this.getPosition(x);
          var q = O.x;
          O = O.y;
          n &&
            ((O = this.getCrosshairPosition(a, k, u)),
            (x = O[0]),
            (q = O[1]),
            (O = O[2]));
          if (this.isCircular)
            (x = Math.sqrt(Math.pow(q - k, 2) + Math.pow(O - u, 2))),
              (f = "string" === typeof C ? g(C, 1) : C / x),
              (e = "string" === typeof l ? g(l, 1) : l / x),
              c && h && ((h /= x), f < h && (f = h), e < h && (e = h)),
              (c = [
                ["M", k + f * (q - k), u - f * (u - O)],
                ["L", q - (1 - e) * (q - k), O + (1 - e) * (u - O)],
              ]);
          else if (
            ((x = this.translate(x)) && (0 > x || x > p) && (x = 0),
            "circle" === this.options.gridLineInterpolation)
          )
            c = this.getLinePath(0, x, h);
          else if (
            ((c = []),
            e[d ? "yAxis" : "xAxis"].forEach(function (a) {
              a.pane === b.pane && (m = a);
            }),
            m)
          )
            for (
              k = m.tickPositions,
                m.autoConnect && (k = k.concat([k[0]])),
                f && (k = k.slice().reverse()),
                x && (x += h),
                u = 0;
              u < k.length;
              u++
            )
              (h = m.getPosition(k[u], x)),
                c.push(u ? ["L", h.x, h.y] : ["M", h.x, h.y]);
          return c;
        }
        function B(a, b) {
          a = this.translate(a);
          return this.postTranslate(
            this.isCircular ? a : this.angleRad,
            e(this.isCircular ? b : 0 > a ? 0 : a, this.center[2] / 2) -
              this.offset,
          );
        }
        function z() {
          var a = this.center,
            b = this.chart,
            c = this.options.title;
          return {
            x: b.plotLeft + a[0] + (c.x || 0),
            y:
              b.plotTop +
              a[1] -
              { high: 0.5, middle: 0.25, low: 0 }[c.align] * a[2] +
              (c.y || 0),
          };
        }
        function G(a) {
          a.beforeSetTickPositions = c;
          a.createLabelCollector = d;
          a.getCrosshairPosition = v;
          a.getLinePath = y;
          a.getOffset = E;
          a.getPlotBandPath = L;
          a.getPlotLinePath = w;
          a.getPosition = B;
          a.getTitlePosition = z;
          a.postTranslate = u;
          a.setAxisSize = x;
          a.setAxisTranslation = P;
          a.setOptions = R;
        }
        function r() {
          var a = this.chart,
            b = this.options,
            c = this.pane,
            d = c && c.options;
          (a.angular && this.isXAxis) ||
            !c ||
            (!a.angular && !a.polar) ||
            ((a = 2 * Math.PI),
            (c = ((e(d.startAngle, 0) - 90) * Math.PI) / 180),
            (d =
              ((e(d.endAngle, e(d.startAngle, 0) + 360) - 90) * Math.PI) / 180),
            (this.angleRad = ((b.angle || 0) * Math.PI) / 180),
            (this.startAngleRad = c),
            (this.endAngleRad = d),
            (this.offset = b.offset || 0),
            (b = ((c % a) + a) % a),
            (d = ((d % a) + a) % a),
            b > Math.PI && (b -= a),
            d > Math.PI && (d -= a),
            (this.normalizedStartAngleRad = b),
            (this.normalizedEndAngleRad = d));
        }
        function K(a) {
          this.isRadial && ((a.align = void 0), a.preventDefault());
        }
        function J() {
          if (this.chart && this.chart.labelCollectors) {
            var a = this.labelCollector
              ? this.chart.labelCollectors.indexOf(this.labelCollector)
              : -1;
            0 <= a && this.chart.labelCollectors.splice(a, 1);
          }
        }
        function U(a) {
          var c = this.chart,
            e = c.inverted,
            d = c.angular,
            f = c.polar,
            g = this.isXAxis,
            l = this.coll,
            u = d && g;
          a = a.userOptions.pane || 0;
          a = this.pane = c.pane && c.pane[a];
          var x;
          if ("colorAxis" === l) this.isRadial = !1;
          else {
            if (d) {
              if (
                (u
                  ? ((this.isHidden = !0),
                    (this.createLabelCollector = k),
                    (this.getOffset = h),
                    (this.render = this.redraw = C),
                    (this.setTitle = this.setCategories = this.setScale = h))
                  : G(this),
                (x = !g))
              )
                this.defaultPolarOptions = Y;
            } else
              f &&
                (G(this),
                (this.defaultPolarOptions = (x = this.horiz)
                  ? X
                  : p(
                      "xAxis" === l
                        ? b.defaultXAxisOptions
                        : b.defaultYAxisOptions,
                      Z,
                    )),
                e &&
                  "yAxis" === l &&
                  ((this.defaultPolarOptions.stackLabels =
                    b.defaultYAxisOptions.stackLabels),
                  (this.defaultPolarOptions.reversedStacks = !0)));
            d || f
              ? ((this.isRadial = !0),
                this.labelCollector ||
                  (this.labelCollector = this.createLabelCollector()),
                this.labelCollector &&
                  c.labelCollectors.push(this.labelCollector))
              : (this.isRadial = !1);
            a && x && (a.axis = this);
            this.isCircular = x;
          }
        }
        function A() {
          this.isRadial && this.beforeSetTickPositions();
        }
        function N(a) {
          var b = this.label;
          if (b) {
            var c = this.axis,
              d = b.getBBox(),
              f = c.options.labels,
              h =
                (((c.translate(this.pos) + c.startAngleRad + Math.PI / 2) /
                  Math.PI) *
                  180) %
                360,
              C = Math.round(h),
              l = n(f.y) ? 0 : 0.3 * -d.height,
              k = f.y,
              u = 20,
              x = f.align,
              p = "end",
              m = 0 > C ? C + 360 : C,
              q = m,
              P = 0,
              t = 0;
            if (c.isRadial) {
              var r = c.getPosition(
                this.pos,
                c.center[2] / 2 +
                  g(e(f.distance, -25), c.center[2] / 2, -c.center[2] / 2),
              );
              "auto" === f.rotation
                ? b.attr({ rotation: h })
                : n(k) ||
                  (k =
                    c.chart.renderer.fontMetrics(b.styles && b.styles.fontSize)
                      .b -
                    d.height / 2);
              n(x) ||
                (c.isCircular
                  ? (d.width > (c.len * c.tickInterval) / (c.max - c.min) &&
                      (u = 0),
                    (x =
                      h > u && h < 180 - u
                        ? "left"
                        : h > 180 + u && h < 360 - u
                          ? "right"
                          : "center"))
                  : (x = "center"),
                b.attr({ align: x }));
              if (
                "auto" === x &&
                2 === c.tickPositions.length &&
                c.isCircular
              ) {
                90 < m && 180 > m
                  ? (m = 180 - m)
                  : 270 < m && 360 >= m && (m = 540 - m);
                180 < q && 360 >= q && (q = 360 - q);
                if (
                  c.pane.options.startAngle === C ||
                  c.pane.options.startAngle === C + 360 ||
                  c.pane.options.startAngle === C - 360
                )
                  p = "start";
                x =
                  (-90 <= C && 90 >= C) ||
                  (-360 <= C && -270 >= C) ||
                  (270 <= C && 360 >= C)
                    ? "start" === p
                      ? "right"
                      : "left"
                    : "start" === p
                      ? "left"
                      : "right";
                70 < q && 110 > q && (x = "center");
                15 > m || (180 <= m && 195 > m)
                  ? (P = 0.3 * d.height)
                  : 15 <= m && 35 >= m
                    ? (P = "start" === p ? 0 : 0.75 * d.height)
                    : 195 <= m && 215 >= m
                      ? (P = "start" === p ? 0.75 * d.height : 0)
                      : 35 < m && 90 >= m
                        ? (P = "start" === p ? 0.25 * -d.height : d.height)
                        : 215 < m &&
                          270 >= m &&
                          (P = "start" === p ? d.height : 0.25 * -d.height);
                15 > q
                  ? (t = "start" === p ? 0.15 * -d.height : 0.15 * d.height)
                  : 165 < q &&
                    180 >= q &&
                    (t = "start" === p ? 0.15 * d.height : 0.15 * -d.height);
                b.attr({ align: x });
                b.translate(t, P + l);
              }
              a.pos.x = r.x + (f.x || 0);
              a.pos.y = r.y + (k || 0);
            }
          }
        }
        function S(a) {
          this.axis.getPosition && D(a.pos, this.axis.getPosition(this.pos));
        }
        function u(a, b) {
          var c = this.chart,
            e = this.center;
          a = this.startAngleRad + a;
          return {
            x: c.plotLeft + e[0] + Math.cos(a) * b,
            y: c.plotTop + e[1] + Math.sin(a) * b,
          };
        }
        function C() {
          this.isDirty = !1;
        }
        function x() {
          this.constructor.prototype.setAxisSize.call(this);
          if (this.isRadial) {
            this.pane.updateCenter(this);
            var a = (this.center = this.pane.center.slice());
            if (this.isCircular)
              this.sector = this.endAngleRad - this.startAngleRad;
            else {
              var b = this.postTranslate(this.angleRad, a[3] / 2);
              a[0] = b.x - this.chart.plotLeft;
              a[1] = b.y - this.chart.plotTop;
            }
            this.len =
              this.width =
              this.height =
                ((a[2] - a[3]) * e(this.sector, 1)) / 2;
          }
        }
        function P() {
          this.constructor.prototype.setAxisTranslation.call(this);
          this.center &&
            ((this.transA = this.isCircular
              ? (this.endAngleRad - this.startAngleRad) /
                (this.max - this.min || 1)
              : (this.center[2] - this.center[3]) /
                2 /
                (this.max - this.min || 1)),
            (this.minPixelPadding = this.isXAxis
              ? this.transA * this.minPointOffset
              : 0));
        }
        function R(a) {
          a = this.options = p(
            this.constructor.defaultOptions,
            this.defaultPolarOptions,
            f[this.coll],
            a,
          );
          a.plotBands || (a.plotBands = []);
          t(this, "afterSetOptions");
        }
        function W(a, b, c, e, d, f, g) {
          var h = this.axis;
          h.isRadial
            ? ((a = h.getPosition(this.pos, h.center[2] / 2 + e)),
              (b = ["M", b, c, "L", a.x, a.y]))
            : (b = a.call(this, b, c, e, d, f, g));
          return b;
        }
        var T = [],
          X = {
            gridLineWidth: 1,
            labels: {
              align: void 0,
              distance: 15,
              x: 0,
              y: void 0,
              style: { textOverflow: "none" },
            },
            maxPadding: 0,
            minPadding: 0,
            showLastLabel: !1,
            tickLength: 0,
          },
          Y = {
            labels: { align: "center", x: 0, y: void 0 },
            minorGridLineWidth: 0,
            minorTickInterval: "auto",
            minorTickLength: 10,
            minorTickPosition: "inside",
            minorTickWidth: 1,
            tickLength: 10,
            tickPosition: "inside",
            tickWidth: 2,
            title: { rotation: 0 },
            zIndex: 2,
          },
          Z = {
            gridLineInterpolation: "circle",
            gridLineWidth: 1,
            labels: { align: "right", x: -3, y: -2 },
            showLastLabel: !1,
            title: { x: 4, text: null, rotation: 90 },
          };
        a.compose = function (a, b) {
          -1 === T.indexOf(a) &&
            (T.push(a),
            m(a, "afterInit", r),
            m(a, "autoLabelAlign", K),
            m(a, "destroy", J),
            m(a, "init", U),
            m(a, "initialAxisTranslation", A));
          -1 === T.indexOf(b) &&
            (T.push(b),
            m(b, "afterGetLabelPosition", N),
            m(b, "afterGetPosition", S),
            l(b.prototype, "getMarkPath", W));
          return a;
        };
      })(k || (k = {}));
      return k;
    },
  );
  D(
    d,
    "Series/PolarComposition.js",
    [
      d["Core/Animation/AnimationUtilities.js"],
      d["Core/Globals.js"],
      d["Extensions/Pane.js"],
      d["Core/Axis/RadialAxis.js"],
      d["Core/Utilities.js"],
    ],
    function (b, c, d, a, f) {
      function h(a, b, c, e) {
        var d = e ? 1 : 0;
        var f = 0 <= b && b <= a.length - 1 ? b : 0 > b ? a.length - 1 + b : 0;
        b = 0 > f - 1 ? a.length - (1 + d) : f - 1;
        var g = a[b];
        d = a[f + 1 > a.length - 1 ? d : f + 1];
        var C = g.plotY;
        var l = d.plotX;
        var k = d.plotY;
        d = a[f].plotX;
        f = a[f].plotY;
        g = (1.5 * d + g.plotX) / 2.5;
        C = (1.5 * f + C) / 2.5;
        l = (1.5 * d + l) / 2.5;
        var x = (1.5 * f + k) / 2.5;
        k = Math.sqrt(Math.pow(g - d, 2) + Math.pow(C - f, 2));
        var u = Math.sqrt(Math.pow(l - d, 2) + Math.pow(x - f, 2));
        g = Math.atan2(C - f, g - d);
        x = Math.PI / 2 + (g + Math.atan2(x - f, l - d)) / 2;
        Math.abs(g - x) > Math.PI / 2 && (x -= Math.PI);
        g = d + Math.cos(x) * k;
        C = f + Math.sin(x) * k;
        l = d + Math.cos(Math.PI + x) * u;
        x = f + Math.sin(Math.PI + x) * u;
        d = {
          rightContX: l,
          rightContY: x,
          leftContX: g,
          leftContY: C,
          plotX: d,
          plotY: f,
        };
        c && (d.prevPointCont = h(a, b, !1, e));
        return d;
      }
      function m() {
        (this.pane || []).forEach(function (a) {
          a.render();
        });
      }
      function q(a) {
        var b = a.args[0].xAxis,
          c = a.args[0].yAxis;
        a = a.args[0].chart;
        b &&
          c &&
          ("polygon" === c.gridLineInterpolation
            ? ((b.startOnTick = !0), (b.endOnTick = !0))
            : "polygon" === b.gridLineInterpolation &&
              a.inverted &&
              ((c.startOnTick = !0), (c.endOnTick = !0)));
      }
      function n() {
        var a = this;
        this.pane || (this.pane = []);
        this.options.pane = V(this.options.pane);
        this.options.pane.forEach(function (b) {
          new d(b, a);
        }, this);
      }
      function D(a) {
        var b = a.args.marker,
          c = this.chart.xAxis[0],
          d = this.chart.yAxis[0],
          e = this.chart.inverted,
          f = e ? d : c;
        c = e ? c : d;
        if (this.chart.polar) {
          a.preventDefault();
          d = (b.attr ? b.attr("start") : b.start) - f.startAngleRad;
          e = b.attr ? b.attr("r") : b.r;
          var g = (b.attr ? b.attr("end") : b.end) - f.startAngleRad;
          b = b.attr ? b.attr("innerR") : b.innerR;
          a.result.x = d + f.pos;
          a.result.width = g - d;
          a.result.y = c.len + c.pos - b;
          a.result.height = b - e;
        }
      }
      function t(a) {
        var b = this.chart;
        if (b.polar && b.hoverPane && b.hoverPane.axis) {
          a.preventDefault();
          var c = b.hoverPane.center,
            d = this.mouseDownX || 0,
            e = this.mouseDownY || 0,
            f = a.args.chartY,
            g = a.args.chartX,
            h = 2 * Math.PI,
            k = b.hoverPane.axis.startAngleRad,
            p = b.hoverPane.axis.endAngleRad,
            m = b.inverted ? b.xAxis[0] : b.yAxis[0],
            n = {},
            u = "arc";
          n.x = c[0] + b.plotLeft;
          n.y = c[1] + b.plotTop;
          if (this.zoomHor) {
            var q = 0 < k ? p - k : Math.abs(k) + Math.abs(p),
              t = Math.atan2(e - b.plotTop - c[1], d - b.plotLeft - c[0]) - k,
              r = Math.atan2(f - b.plotTop - c[1], g - b.plotLeft - c[0]) - k;
            n.r = c[2] / 2;
            n.innerR = c[3] / 2;
            0 >= t && (t += h);
            0 >= r && (r += h);
            r < t && (r = [t, (t = r)][0]);
            q < h && k + r > p + (h - q) / 2 && ((r = t), (t = 0 >= k ? k : 0));
            h = n.start = Math.max(t + k, k);
            t = n.end = Math.min(r + k, p);
            "polygon" === m.options.gridLineInterpolation &&
              ((r = b.hoverPane.axis),
              (q = h - r.startAngleRad + r.pos),
              (t -= h),
              (u = m.getPlotLinePath({ value: m.max })),
              (h = r.toValue(q)),
              (q = r.toValue(q + t)),
              h < r.getExtremes().min &&
                ((t = r.getExtremes()), (h = t.max - (t.min - h))),
              q < r.getExtremes().min &&
                ((t = r.getExtremes()), (q = t.max - (t.min - q))),
              q < h && (q = [h, (h = q)][0]),
              (u = l(u, h, q, r)),
              u.push(["L", c[0] + b.plotLeft, b.plotTop + c[1]]),
              (n.d = u),
              (u = "path"));
          }
          this.zoomVert &&
            ((r = b.inverted ? b.xAxis[0] : b.yAxis[0]),
            (d = Math.sqrt(
              Math.pow(d - b.plotLeft - c[0], 2) +
                Math.pow(e - b.plotTop - c[1], 2),
            )),
            (f = Math.sqrt(
              Math.pow(g - b.plotLeft - c[0], 2) +
                Math.pow(f - b.plotTop - c[1], 2),
            )),
            f < d && (d = [f, (f = d)][0]),
            f > c[2] / 2 && (f = c[2] / 2),
            d < c[3] / 2 && (d = c[3] / 2),
            this.zoomHor || ((n.start = k), (n.end = p)),
            (n.r = f),
            (n.innerR = d),
            "polygon" === r.options.gridLineInterpolation &&
              ((t = r.toValue(r.len + r.pos - d)),
              (h = r.toValue(r.len + r.pos - f)),
              (u = r
                .getPlotLinePath({ value: h })
                .concat(r.getPlotLinePath({ value: t, reverse: !0 }))),
              (n.d = u),
              (u = "path")));
          this.zoomHor &&
            this.zoomVert &&
            "polygon" === m.options.gridLineInterpolation &&
            ((r = b.hoverPane.axis),
            (h = n.start || 0),
            (t = n.end || 0),
            (q = h - r.startAngleRad + r.pos),
            (t -= h),
            (h = r.toValue(q)),
            (q = r.toValue(q + t)),
            n.d instanceof Array &&
              ((c = n.d.slice(0, n.d.length / 2)),
              (k = n.d.slice(n.d.length / 2, n.d.length)),
              (k = L([], k, !0).reverse()),
              (b = b.hoverPane.axis),
              (c = l(c, h, q, b)),
              (k = l(k, h, q, b)) && (k[0][0] = "L"),
              (k = L([], k, !0).reverse()),
              (n.d = c.concat(k)),
              (u = "path")));
          a.attrs = n;
          a.shapeType = u;
        }
      }
      function p() {
        var a = this.chart;
        a.polar &&
          ((this.polar = new S(this)),
          a.inverted &&
            ((this.isRadialSeries = !0),
            this.is("column") && (this.isRadialBar = !0)));
      }
      function e() {
        if (this.chart.polar && this.xAxis) {
          var a = this.chart;
          (this.kdByAngle = a.tooltip && a.tooltip.shared)
            ? (this.searchPoint = g)
            : (this.options.findNearestPointBy = "xy");
          for (var b = this.points, d = b.length; d--; )
            this.preventPostTranslate || this.polar.toXY(b[d]),
              a.hasParallelCoordinates ||
                this.yAxis.reversed ||
                (K(b[d].y, Number.MIN_VALUE) < this.yAxis.min ||
                b[d].x < this.xAxis.min ||
                b[d].x > this.xAxis.max
                  ? ((b[d].isNull = !0), (b[d].plotY = NaN))
                  : (b[d].isNull = b[d].isValid && !b[d].isValid()));
          this.hasClipCircleSetter ||
            (this.hasClipCircleSetter = !!this.eventsToUnbind.push(
              B(this, "afterRender", function () {
                if (a.polar) {
                  var b = this.yAxis.pane.center;
                  if (this.clipCircle)
                    this.clipCircle.animate({
                      x: b[0],
                      y: b[1],
                      r: b[2] / 2,
                      innerR: b[3] / 2,
                    });
                  else {
                    var d = a.renderer,
                      e = b[0],
                      f = b[1],
                      g = b[2] / 2,
                      h = b[3] / 2;
                    b = U();
                    var k = d
                      .createElement("clipPath")
                      .attr({ id: b })
                      .add(d.defs);
                    d = h
                      ? d.arc(e, f, g, h, 0, 2 * Math.PI).add(k)
                      : d.circle(e, f, g).add(k);
                    d.id = b;
                    d.clipPath = k;
                    this.clipCircle = d;
                  }
                  this.group.clip(this.clipCircle);
                  this.setClip = c.noop;
                }
              }),
            ));
        }
      }
      function g(a) {
        var b = this.chart,
          c = this.xAxis;
        c = c.pane && c.pane.center;
        return this.searchKDTree({
          clientX:
            180 +
            (-180 / Math.PI) *
              Math.atan2(
                a.chartX - ((c && c[0]) || 0) - b.plotLeft,
                a.chartY - ((c && c[1]) || 0) - b.plotTop,
              ),
        });
      }
      function l(a, b, c, d) {
        var e = d.tickInterval;
        d = d.tickPositions;
        var f = G(d, function (a) {
            return a >= c;
          }),
          g = G(L([], d, !0).reverse(), function (a) {
            return a <= b;
          });
        z(f) || (f = d[d.length - 1]);
        z(g) ||
          ((g = d[0]), (f += e), (a[0][0] = "L"), a.unshift(a[a.length - 3]));
        a = a.slice(d.indexOf(g), d.indexOf(f) + 1);
        a[0][0] = "M";
        return a;
      }
      function k(a, b) {
        return (
          G(this.pane || [], function (a) {
            return a.options.id === b;
          }) || a.call(this, b)
        );
      }
      function J(a, b, c, d, e, f) {
        var g = this.chart,
          h = K(d.inside, !!this.options.stacking);
        g.polar
          ? ((a = (b.rectPlotX / Math.PI) * 180),
            g.inverted
              ? ((this.forceDL = g.isInsidePlot(b.plotX, b.plotY)),
                h && b.shapeArgs
                  ? ((e = b.shapeArgs),
                    (e = this.yAxis.postTranslate(
                      ((e.start || 0) + (e.end || 0)) / 2 -
                        this.xAxis.startAngleRad,
                      b.barX + b.pointWidth / 2,
                    )),
                    (e = { x: e.x - g.plotLeft, y: e.y - g.plotTop }))
                  : b.tooltipPos &&
                    (e = { x: b.tooltipPos[0], y: b.tooltipPos[1] }),
                (d.align = K(d.align, "center")),
                (d.verticalAlign = K(d.verticalAlign, "middle")))
              : (null === d.align &&
                  (d.align =
                    20 < a && 160 > a
                      ? "left"
                      : 200 < a && 340 > a
                        ? "right"
                        : "center"),
                null === d.verticalAlign &&
                  (d.verticalAlign =
                    45 > a || 315 < a
                      ? "bottom"
                      : 135 < a && 225 > a
                        ? "top"
                        : "middle")),
            Object.getPrototypeOf(
              Object.getPrototypeOf(this),
            ).alignDataLabel.call(this, b, c, d, e, f),
            this.isRadialBar &&
            b.shapeArgs &&
            b.shapeArgs.start === b.shapeArgs.end
              ? c.hide()
              : c.show())
          : a.call(this, b, c, d, e, f);
      }
      function H(a) {
        var b = this.options,
          c = b.stacking,
          d = this.chart,
          e = this.xAxis,
          g = this.yAxis,
          h = g.reversed,
          k = g.center,
          l = e.startAngleRad,
          n = e.endAngleRad - l,
          p = 0,
          m = 0,
          q = 0;
        this.preventPostTranslate = !0;
        a.call(this);
        if (e.isRadial) {
          a = this.points;
          e = a.length;
          var t = g.translate(g.min);
          var u = g.translate(g.max);
          b = b.threshold || 0;
          d.inverted &&
            r(b) &&
            ((p = g.translate(b)),
            z(p) &&
              (0 > p ? (p = 0) : p > n && (p = n),
              (this.translatedThreshold = p + l)));
          for (; e--; ) {
            b = a[e];
            var v = b.barX;
            var y = b.x;
            var w = b.y;
            b.shapeType = "arc";
            if (d.inverted) {
              b.plotY = g.translate(w);
              c && g.stacking
                ? ((w = g.stacking.stacks[(0 > w ? "-" : "") + this.stackKey]),
                  this.visible &&
                    w &&
                    w[y] &&
                    !b.isNull &&
                    ((q =
                      w[y].points[
                        this.getStackIndicator(void 0, y, this.index).key
                      ]),
                    (m = g.translate(q[0])),
                    (q = g.translate(q[1])),
                    z(m) && (m = f.clamp(m, 0, n))))
                : ((m = p), (q = b.plotY));
              m > q && (q = [m, (m = q)][0]);
              if (!h)
                if (m < t) m = t;
                else if (q > u) q = u;
                else {
                  if (q < t || m > u) m = q = 0;
                }
              else if (q > t) q = t;
              else if (m < u) m = u;
              else if (m > t || q < u) m = q = n;
              g.min > g.max && (m = q = h ? n : 0);
              m += l;
              q += l;
              k && (b.barX = v += k[3] / 2);
              y = Math.max(v, 0);
              w = Math.max(v + b.pointWidth, 0);
              b.shapeArgs = {
                x: k && k[0],
                y: k && k[1],
                r: w,
                innerR: y,
                start: m,
                end: q,
              };
              b.opacity = m === q ? 0 : void 0;
              b.plotY =
                (z(this.translatedThreshold) &&
                  (m < this.translatedThreshold ? m : q)) - l;
            } else
              (m = v + l),
                (b.shapeArgs = this.polar.arc(
                  b.yBottom,
                  b.plotY,
                  m,
                  m + b.pointWidth,
                ));
            this.polar.toXY(b);
            d.inverted
              ? ((v = g.postTranslate(b.rectPlotY, v + b.pointWidth / 2)),
                (b.tooltipPos = [v.x - d.plotLeft, v.y - d.plotTop]))
              : (b.tooltipPos = [b.plotX, b.plotY]);
            k && (b.ttBelow = b.plotY > k[1]);
          }
        }
      }
      function M(a, b) {
        var c = this;
        if (this.chart.polar) {
          b = b || this.points;
          for (var d = 0; d < b.length; d++)
            if (!b[d].isNull) {
              var e = d;
              break;
            }
          if (!1 !== this.options.connectEnds && "undefined" !== typeof e) {
            this.connectEnds = !0;
            b.splice(b.length, 0, b[e]);
            var f = !0;
          }
          b.forEach(function (a) {
            "undefined" === typeof a.polarPlotY && c.polar.toXY(a);
          });
        }
        e = a.apply(this, [].slice.call(arguments, 1));
        f && b.pop();
        return e;
      }
      function F(a, b) {
        var c = this.chart,
          d = { xAxis: [], yAxis: [] };
        c.polar
          ? c.axes.forEach(function (a) {
              if ("colorAxis" !== a.coll) {
                var e = a.isXAxis,
                  f = a.center,
                  g = b.chartX - f[0] - c.plotLeft;
                f = b.chartY - f[1] - c.plotTop;
                d[e ? "xAxis" : "yAxis"].push({
                  axis: a,
                  value: a.translate(
                    e
                      ? Math.PI - Math.atan2(g, f)
                      : Math.sqrt(Math.pow(g, 2) + Math.pow(f, 2)),
                    !0,
                  ),
                });
              }
            })
          : (d = a.call(this, b));
        return d;
      }
      function v(a, b) {
        this.chart.polar || a.call(this, b);
      }
      function Q(a, b) {
        var d = this,
          e = this.chart,
          f = this.group,
          g = this.markerGroup,
          h = this.xAxis && this.xAxis.center,
          k = e.plotLeft,
          l = e.plotTop,
          m = this.options.animation,
          p,
          n,
          q,
          t;
        if (e.polar)
          if (d.isRadialBar)
            b ||
              ((d.startAngleRad = K(
                d.translatedThreshold,
                d.xAxis.startAngleRad,
              )),
              c.seriesTypes.pie.prototype.animate.call(d, b));
          else {
            if (e.renderer.isSVG)
              if (((m = w(m)), d.is("column"))) {
                if (!b) {
                  var r = h[3] / 2;
                  d.points.forEach(function (a) {
                    p = a.graphic;
                    q = (n = a.shapeArgs) && n.r;
                    t = n && n.innerR;
                    p &&
                      n &&
                      (p.attr({ r: r, innerR: r }),
                      p.animate({ r: q, innerR: t }, d.options.animation));
                  });
                }
              } else
                b
                  ? ((a = {
                      translateX: h[0] + k,
                      translateY: h[1] + l,
                      scaleX: 0.001,
                      scaleY: 0.001,
                    }),
                    f.attr(a),
                    g && g.attr(a))
                  : ((a = {
                      translateX: k,
                      translateY: l,
                      scaleX: 1,
                      scaleY: 1,
                    }),
                    f.animate(a, m),
                    g && g.animate(a, m));
          }
        else a.call(this, b);
      }
      function I(a, b, c, d) {
        this.chart.polar
          ? d
            ? ((a = h(b, d, !0, this.connectEnds)),
              (b = a.prevPointCont && a.prevPointCont.rightContX),
              (c = a.prevPointCont && a.prevPointCont.rightContY),
              (a = [
                "C",
                r(b) ? b : a.plotX,
                r(c) ? c : a.plotY,
                r(a.leftContX) ? a.leftContX : a.plotX,
                r(a.leftContY) ? a.leftContY : a.plotY,
                a.plotX,
                a.plotY,
              ]))
            : (a = ["M", c.plotX, c.plotY])
          : (a = a.call(this, b, c, d));
        return a;
      }
      var L =
          (this && this.__spreadArray) ||
          function (a, b, c) {
            if (c || 2 === arguments.length)
              for (var d = 0, e = b.length, f; d < e; d++)
                (!f && d in b) ||
                  (f || (f = Array.prototype.slice.call(b, 0, d)),
                  (f[d] = b[d]));
            return a.concat(f || Array.prototype.slice.call(b));
          },
        w = b.animObject,
        B = f.addEvent,
        z = f.defined,
        G = f.find,
        r = f.isNumber,
        K = f.pick,
        V = f.splat,
        U = f.uniqueKey,
        A = f.wrap,
        N = [],
        S = (function () {
          function b(a) {
            this.series = a;
          }
          b.compose = function (b, c, d, f, g, h, l, r, u) {
            a.compose(b, g);
            -1 === N.indexOf(c) &&
              (N.push(c),
              B(c, "afterDrawChartBox", m),
              B(c, "getAxes", n),
              B(c, "init", q),
              A(c.prototype, "get", k));
            -1 === N.indexOf(d) &&
              (N.push(d),
              (b = d.prototype),
              A(b, "getCoordinates", F),
              A(b, "pinch", v),
              B(d, "getSelectionMarkerAttrs", t),
              B(d, "getSelectionBox", D));
            -1 === N.indexOf(f) &&
              (N.push(f),
              B(f, "afterInit", p),
              B(f, "afterTranslate", e, { order: 2 }),
              A(f.prototype, "animate", Q));
            l &&
              -1 === N.indexOf(l) &&
              (N.push(l),
              (d = l.prototype),
              A(d, "alignDataLabel", J),
              A(d, "animate", Q),
              A(d, "translate", H));
            r &&
              -1 === N.indexOf(r) &&
              (N.push(r), A(r.prototype, "getGraphPath", M));
            u &&
              -1 === N.indexOf(u) &&
              (N.push(u),
              (r = u.prototype),
              A(r, "getPointSpline", I),
              h &&
                -1 === N.indexOf(h) &&
                (N.push(h), (h.prototype.getPointSpline = r.getPointSpline)));
          };
          b.prototype.arc = function (a, b, c, d) {
            var e = this.series,
              f = e.xAxis.center,
              g = e.yAxis.len,
              h = f[3] / 2;
            b = g - b + h;
            a = g - K(a, g) + h;
            e.yAxis.reversed && (0 > b && (b = h), 0 > a && (a = h));
            return { x: f[0], y: f[1], r: b, innerR: a, start: c, end: d };
          };
          b.prototype.toXY = function (a) {
            var b = this.series,
              c = b.chart,
              d = b.xAxis,
              e = b.yAxis,
              f = a.plotX,
              g = c.inverted,
              h = a.y,
              k = a.plotY,
              l = g ? f : e.len - k;
            g &&
              b &&
              !b.isRadialBar &&
              (a.plotY = k = r(h) ? e.translate(h) : 0);
            a.rectPlotX = f;
            a.rectPlotY = k;
            e.center && (l += e.center[3] / 2);
            r(k) &&
              ((e = g ? e.postTranslate(k, l) : d.postTranslate(f, l)),
              (a.plotX = a.polarPlotX = e.x - c.plotLeft),
              (a.plotY = a.polarPlotY = e.y - c.plotTop));
            b.kdByAngle
              ? ((b = ((f / Math.PI) * 180 + d.pane.options.startAngle) % 360),
                0 > b && (b += 360),
                (a.clientX = b))
              : (a.clientX = a.plotX);
          };
          return b;
        })();
      return S;
    },
  );
  D(
    d,
    "masters/highcharts-more.src.js",
    [
      d["Core/Globals.js"],
      d["Core/Series/SeriesRegistry.js"],
      d["Series/Bubble/BubbleSeries.js"],
      d["Series/PackedBubble/PackedBubbleSeries.js"],
      d["Series/PolarComposition.js"],
    ],
    function (b, c, d, a, f) {
      d.compose(b.Axis, b.Chart, b.Legend, b.Series);
      a.compose(b.Axis, b.Chart, b.Legend, b.Series);
      f.compose(
        b.Axis,
        b.Chart,
        b.Pointer,
        b.Series,
        b.Tick,
        c.seriesTypes.areasplinerange,
        c.seriesTypes.column,
        c.seriesTypes.line,
        c.seriesTypes.spline,
      );
    },
  );
});
//# sourceMappingURL=highcharts-more.js.map
