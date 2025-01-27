/*
 Highcharts JS v10.3.2 (2022-11-28)

 Sankey diagram module

 (c) 2010-2021 Torstein Honsi

 License: www.highcharts.com/license
*/
(function (b) {
  "object" === typeof module && module.exports
    ? ((b["default"] = b), (module.exports = b))
    : "function" === typeof define && define.amd
      ? define("highcharts/modules/sankey", ["highcharts"], function (p) {
          b(p);
          b.Highcharts = p;
          return b;
        })
      : b("undefined" !== typeof Highcharts ? Highcharts : void 0);
})(function (b) {
  function p(b, h, m, l) {
    b.hasOwnProperty(h) ||
      ((b[h] = l.apply(null, m)),
      "function" === typeof CustomEvent &&
        window.dispatchEvent(
          new CustomEvent("HighchartsModuleLoaded", {
            detail: { path: h, module: b[h] },
          }),
        ));
  }
  b = b ? b._modules : {};
  p(
    b,
    "Series/NodesComposition.js",
    [b["Core/Series/SeriesRegistry.js"], b["Core/Utilities.js"]],
    function (b, h) {
      b = b.series;
      var m = b.prototype,
        l = b.prototype.pointClass.prototype,
        z = h.defined,
        x = h.extend,
        k = h.find,
        c = h.merge,
        e = h.pick,
        a;
      (function (a) {
        function f() {
          this.data = [].concat(this.points || [], this.nodes);
          return m.destroy.apply(this, arguments);
        }
        function b() {
          this.nodes &&
            (this.nodes.forEach(function (a) {
              a.destroy();
            }),
            (this.nodes.length = 0));
          m.setData.apply(this, arguments);
        }
        function v(a) {
          var c = arguments,
            e = this.isNode
              ? this.linksTo.concat(this.linksFrom)
              : [this.fromNode, this.toNode];
          "select" !== a &&
            e.forEach(function (a) {
              a &&
                a.series &&
                (l.setState.apply(a, c),
                a.isNode ||
                  (a.fromNode.graphic && l.setState.apply(a.fromNode, c),
                  a.toNode &&
                    a.toNode.graphic &&
                    l.setState.apply(a.toNode, c)));
            });
          l.setState.apply(this, c);
        }
        function r(a, f, b, d) {
          var g = this,
            y = this.series.options.nodes,
            A = this.series.options.data,
            C = (A && A.length) || 0,
            q = A && A[this.index];
          l.update.call(this, a, this.isNode ? !1 : f, b, d);
          this.isNode &&
            ((a = (y || []).reduce(function (a, y, d) {
              return g.id === y.id ? d : a;
            }, -1)),
            (d = c((y && y[a]) || {}, (A && A[this.index]) || {})),
            A && (q ? (A[this.index] = q) : (A.length = C)),
            y
              ? 0 <= a
                ? (y[a] = d)
                : y.push(d)
              : (this.series.options.nodes = [d]),
            e(f, !0) && this.series.chart.redraw(b));
        }
        var n = [];
        a.compose = function (a, c) {
          -1 === n.indexOf(a) &&
            (n.push(a),
            (a = a.prototype),
            (a.setNodeState = v),
            (a.setState = v),
            (a.update = r));
          -1 === n.indexOf(c) &&
            (n.push(c), (a = c.prototype), (a.destroy = f), (a.setData = b));
          return c;
        };
        a.createNode = function (a) {
          var c = this.pointClass,
            f = function (g, a) {
              return k(g, function (g) {
                return g.id === a;
              });
            },
            d = f(this.nodes, a);
          if (!d) {
            f = this.options.nodes && f(this.options.nodes, a);
            var g = new c().init(
              this,
              x({ className: "highcharts-node", isNode: !0, id: a, y: 1 }, f),
            );
            g.linksTo = [];
            g.linksFrom = [];
            g.getSum = function () {
              var a = 0,
                d = 0;
              g.linksTo.forEach(function (g) {
                a += g.weight || 0;
              });
              g.linksFrom.forEach(function (g) {
                d += g.weight || 0;
              });
              return Math.max(a, d);
            };
            g.offset = function (a, d) {
              for (var y = 0, c = 0; c < g[d].length; c++) {
                if (g[d][c] === a) return y;
                y += g[d][c].weight;
              }
            };
            g.hasShape = function () {
              var a = 0;
              g.linksTo.forEach(function (g) {
                g.outgoing && a++;
              });
              return !g.linksTo.length || a !== g.linksTo.length;
            };
            g.index = this.nodes.push(g) - 1;
            d = g;
          }
          d.formatPrefix = "node";
          d.name = d.name || d.options.id || "";
          d.mass = e(
            d.options.mass,
            d.options.marker && d.options.marker.radius,
            this.options.marker && this.options.marker.radius,
            4,
          );
          return d;
        };
        a.destroy = f;
        a.generatePoints = function () {
          var a = this,
            c = this.chart,
            f = {};
          m.generatePoints.call(this);
          this.nodes || (this.nodes = []);
          this.colorCounter = 0;
          this.nodes.forEach(function (a) {
            a.linksFrom.length = 0;
            a.linksTo.length = 0;
            a.level = a.options.level;
          });
          this.points.forEach(function (d) {
            z(d.from) &&
              (f[d.from] || (f[d.from] = a.createNode(d.from)),
              f[d.from].linksFrom.push(d),
              (d.fromNode = f[d.from]),
              c.styledMode
                ? (d.colorIndex = e(d.options.colorIndex, f[d.from].colorIndex))
                : (d.color = d.options.color || f[d.from].color));
            z(d.to) &&
              (f[d.to] || (f[d.to] = a.createNode(d.to)),
              f[d.to].linksTo.push(d),
              (d.toNode = f[d.to]));
            d.name = d.name || d.id;
          }, this);
          this.nodeLookup = f;
        };
        a.setNodeState = v;
        a.updateNode = r;
      })(a || (a = {}));
      return a;
    },
  );
  p(
    b,
    "Series/Sankey/SankeyPoint.js",
    [
      b["Core/Series/Point.js"],
      b["Core/Series/SeriesRegistry.js"],
      b["Core/Utilities.js"],
    ],
    function (b, h, m) {
      var l =
          (this && this.__extends) ||
          (function () {
            var b = function (k, c) {
              b =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (c, a) {
                    c.__proto__ = a;
                  }) ||
                function (c, a) {
                  for (var f in a) a.hasOwnProperty(f) && (c[f] = a[f]);
                };
              return b(k, c);
            };
            return function (k, c) {
              function e() {
                this.constructor = k;
              }
              b(k, c);
              k.prototype =
                null === c
                  ? Object.create(c)
                  : ((e.prototype = c.prototype), new e());
            };
          })(),
        z = m.defined;
      return (function (h) {
        function k() {
          var c = (null !== h && h.apply(this, arguments)) || this;
          c.className = void 0;
          c.fromNode = void 0;
          c.level = void 0;
          c.linkBase = void 0;
          c.linksFrom = void 0;
          c.linksTo = void 0;
          c.mass = void 0;
          c.nodeX = void 0;
          c.nodeY = void 0;
          c.options = void 0;
          c.series = void 0;
          c.toNode = void 0;
          return c;
        }
        l(k, h);
        k.prototype.applyOptions = function (c, e) {
          b.prototype.applyOptions.call(this, c, e);
          z(this.options.level) &&
            (this.options.column = this.column = this.options.level);
          return this;
        };
        k.prototype.getClassName = function () {
          return (
            (this.isNode ? "highcharts-node " : "highcharts-link ") +
            b.prototype.getClassName.call(this)
          );
        };
        k.prototype.getFromNode = function () {
          for (var c = -1, e, a = 0; a < this.linksTo.length; a++) {
            var f = this.linksTo[a];
            f.fromNode.column > c &&
              f.fromNode !== this &&
              ((e = f.fromNode), (c = e.column));
          }
          return { fromNode: e, fromColumn: c };
        };
        k.prototype.setNodeColumn = function () {
          z(this.options.column) ||
            (this.column =
              0 === this.linksTo.length
                ? 0
                : this.getFromNode().fromColumn + 1);
        };
        k.prototype.isValid = function () {
          return this.isNode || "number" === typeof this.weight;
        };
        return k;
      })(h.seriesTypes.column.prototype.pointClass);
    },
  );
  p(b, "Series/Sankey/SankeySeriesDefaults.js", [], function () {
    "";
    return {
      borderWidth: 0,
      colorByPoint: !0,
      curveFactor: 0.33,
      dataLabels: {
        enabled: !0,
        backgroundColor: "none",
        crop: !1,
        nodeFormat: void 0,
        nodeFormatter: function () {
          return this.point.name;
        },
        format: void 0,
        formatter: function () {},
        inside: !0,
      },
      inactiveOtherPoints: !0,
      linkOpacity: 0.5,
      opacity: 1,
      minLinkWidth: 0,
      nodeWidth: 20,
      nodePadding: 10,
      showInLegend: !1,
      states: {
        hover: { linkOpacity: 1, opacity: 1 },
        inactive: {
          linkOpacity: 0.1,
          opacity: 0.1,
          animation: { duration: 50 },
        },
      },
      tooltip: {
        followPointer: !0,
        headerFormat: '<span style="font-size: 10px">{series.name}</span><br/>',
        pointFormat:
          "{point.fromNode.name} \u2192 {point.toNode.name}: <b>{point.weight}</b><br/>",
        nodeFormat: "{point.name}: <b>{point.sum}</b><br/>",
      },
    };
  });
  p(
    b,
    "Series/Sankey/SankeyColumnComposition.js",
    [b["Core/Utilities.js"]],
    function (b) {
      var h = b.defined,
        m = b.relativeLength,
        l;
      (function (b) {
        b.compose = function (b, c) {
          b.sankeyColumn = new l(b, c);
          return b;
        };
        var l = (function () {
          function b(c, b) {
            this.points = c;
            this.series = b;
          }
          b.prototype.getTranslationFactor = function (c) {
            for (
              var b = this.points,
                a = b.slice(),
                f = c.options.minLinkWidth || 0,
                t = 0,
                h,
                k =
                  (c.chart.plotSizeY || 0) -
                  (c.options.borderWidth || 0) -
                  (b.length - 1) * c.nodePadding;
              b.length;

            ) {
              t = k / b.sankeyColumn.sum();
              c = !1;
              for (h = b.length; h--; )
                b[h].getSum() * t < f && (b.splice(h, 1), (k -= f), (c = !0));
              if (!c) break;
            }
            b.length = 0;
            a.forEach(function (a) {
              b.push(a);
            });
            return t;
          };
          b.prototype.top = function (b) {
            var c = this.series,
              a = c.nodePadding,
              f = this.points.reduce(function (f, e) {
                0 < f && (f += a);
                e = Math.max(e.getSum() * b, c.options.minLinkWidth || 0);
                return f + e;
              }, 0);
            return ((c.chart.plotSizeY || 0) - f) / 2;
          };
          b.prototype.left = function (b) {
            var c = this.series,
              a = c.chart,
              f = c.options.equalNodes,
              h = a.inverted ? a.plotHeight : a.plotWidth,
              k = c.nodePadding,
              v = this.points.reduce(function (a, e) {
                0 < a && (a += k);
                e = f
                  ? h / e.series.nodes.length - k
                  : Math.max(e.getSum() * b, c.options.minLinkWidth || 0);
                return a + e;
              }, 0);
            return ((a.plotSizeX || 0) - Math.round(v)) / 2;
          };
          b.prototype.sum = function () {
            return this.points.reduce(function (b, e) {
              return b + e.getSum();
            }, 0);
          };
          b.prototype.offset = function (b, e) {
            var a = this.points,
              c = this.series,
              k = c.nodePadding,
              l = 0;
            if (c.is("organization") && b.hangsFrom)
              return { absoluteTop: b.hangsFrom.nodeY };
            for (var v = 0; v < a.length; v++) {
              var r = a[v].getSum();
              var n = Math.max(r * e, c.options.minLinkWidth || 0),
                q =
                  b.options[
                    c.chart.inverted ? "offsetHorizontal" : "offsetVertical"
                  ],
                w = b.options.offset || 0;
              r = r ? n + k : 0;
              if (a[v] === b)
                return { relativeTop: l + (h(q) ? m(q, n) : m(w, r)) };
              l += r;
            }
          };
          return b;
        })();
        b.SankeyColumnAdditions = l;
      })(l || (l = {}));
      return l;
    },
  );
  p(
    b,
    "Series/TreeUtilities.js",
    [b["Core/Color/Color.js"], b["Core/Utilities.js"]],
    function (b, h) {
      function m(a, b) {
        var c = b.before,
          f = b.idRoot,
          k = b.mapIdToNode[f],
          h = b.points[a.i],
          n = (h && h.options) || {},
          q = [],
          w = 0;
        a.levelDynamic = a.level - (!1 !== b.levelIsConstant ? 0 : k.level);
        a.name = e(h && h.name, "");
        a.visible = f === a.id || !0 === b.visible;
        "function" === typeof c && (a = c(a, b));
        a.children.forEach(function (c, d) {
          var g = l({}, b);
          l(g, { index: d, siblings: a.children.length, visible: a.visible });
          c = m(c, g);
          q.push(c);
          c.visible && (w += c.val);
        });
        c = e(n.value, w);
        a.visible = 0 <= c && (0 < w || a.visible);
        a.children = q;
        a.childrenTotal = w;
        a.isLeaf = a.visible && !w;
        a.val = c;
        return a;
      }
      var l = h.extend,
        p = h.isArray,
        x = h.isNumber,
        k = h.isObject,
        c = h.merge,
        e = h.pick;
      return {
        getColor: function (a, c) {
          var f = c.index,
            h = c.mapOptionsToLevel,
            k = c.parentColor,
            l = c.parentColorIndex,
            n = c.series,
            q = c.colors,
            w = c.siblings,
            u = n.points,
            d = n.chart.options.chart,
            g;
          if (a) {
            u = u[a.i];
            a = h[a.level] || {};
            if ((h = u && a.colorByPoint)) {
              var y = u.index % (q ? q.length : d.colorCount);
              var A = q && q[y];
            }
            if (!n.chart.styledMode) {
              q = u && u.options.color;
              d = a && a.color;
              if ((g = k))
                g =
                  (g = a && a.colorVariation) &&
                  "brightness" === g.key &&
                  f &&
                  w
                    ? b
                        .parse(k)
                        .brighten((f / w) * g.to)
                        .get()
                    : k;
              g = e(q, d, A, g, n.color);
            }
            var C = e(
              u && u.options.colorIndex,
              a && a.colorIndex,
              y,
              l,
              c.colorIndex,
            );
          }
          return { color: g, colorIndex: C };
        },
        getLevelOptions: function (a) {
          var b = {};
          if (k(a)) {
            var h = x(a.from) ? a.from : 1;
            var l = a.levels;
            var m = {};
            var r = k(a.defaults) ? a.defaults : {};
            p(l) &&
              (m = l.reduce(function (a, b) {
                if (k(b) && x(b.level)) {
                  var f = c({}, b);
                  var l = e(f.levelIsConstant, r.levelIsConstant);
                  delete f.levelIsConstant;
                  delete f.level;
                  b = b.level + (l ? 0 : h - 1);
                  k(a[b]) ? c(!0, a[b], f) : (a[b] = f);
                }
                return a;
              }, {}));
            l = x(a.to) ? a.to : 1;
            for (a = 0; a <= l; a++) b[a] = c({}, r, k(m[a]) ? m[a] : {});
          }
          return b;
        },
        setTreeValues: m,
        updateRootId: function (a) {
          if (k(a)) {
            var b = k(a.options) ? a.options : {};
            b = e(a.rootNode, b.rootId, "");
            k(a.userOptions) && (a.userOptions.rootId = b);
            a.rootNode = b;
          }
          return b;
        },
      };
    },
  );
  p(
    b,
    "Series/Sankey/SankeySeries.js",
    [
      b["Core/Color/Color.js"],
      b["Core/Globals.js"],
      b["Series/NodesComposition.js"],
      b["Series/Sankey/SankeyPoint.js"],
      b["Series/Sankey/SankeySeriesDefaults.js"],
      b["Core/Series/SeriesRegistry.js"],
      b["Series/Sankey/SankeyColumnComposition.js"],
      b["Series/TreeUtilities.js"],
      b["Core/Utilities.js"],
    ],
    function (b, h, m, l, p, x, k, c, e) {
      var a =
          (this && this.__extends) ||
          (function () {
            var a = function (b, g) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, g) {
                    a.__proto__ = g;
                  }) ||
                function (a, g) {
                  for (var b in g) g.hasOwnProperty(b) && (a[b] = g[b]);
                };
              return a(b, g);
            };
            return function (b, g) {
              function c() {
                this.constructor = b;
              }
              a(b, g);
              b.prototype =
                null === g
                  ? Object.create(g)
                  : ((c.prototype = g.prototype), new c());
            };
          })(),
        f = x.series,
        t = x.seriesTypes.column,
        z = c.getLevelOptions;
      c = e.extend;
      var v = e.isObject,
        r = e.merge,
        n = e.pick,
        q = e.relativeLength,
        w = e.stableSort;
      e = (function (c) {
        function d() {
          var a = (null !== c && c.apply(this, arguments)) || this;
          a.colDistance = void 0;
          a.data = void 0;
          a.group = void 0;
          a.nodeLookup = void 0;
          a.nodePadding = void 0;
          a.nodes = void 0;
          a.nodeWidth = void 0;
          a.options = void 0;
          a.points = void 0;
          a.translationFactor = void 0;
          return a;
        }
        a(d, c);
        d.getDLOptions = function (a) {
          var b = v(a.optionsPoint) ? a.optionsPoint.dataLabels : {};
          a = v(a.level) ? a.level.dataLabels : {};
          return r({ style: {} }, a, b);
        };
        d.prototype.createNodeColumns = function () {
          var a = [];
          this.nodes.forEach(function (b) {
            b.setNodeColumn();
            a[b.column] || (a[b.column] = k.compose([], this));
            a[b.column].push(b);
          }, this);
          for (var b = 0; b < a.length; b++)
            "undefined" === typeof a[b] && (a[b] = k.compose([], this));
          return a;
        };
        d.prototype.order = function (a, b) {
          var g = this;
          "undefined" === typeof a.level &&
            ((a.level = b),
            a.linksFrom.forEach(function (a) {
              a.toNode && g.order(a.toNode, b + 1);
            }));
        };
        d.prototype.generatePoints = function () {
          m.generatePoints.apply(this, arguments);
          var a = this;
          this.orderNodes &&
            (this.nodes
              .filter(function (a) {
                return 0 === a.linksTo.length;
              })
              .forEach(function (b) {
                a.order(b, 0);
              }),
            w(this.nodes, function (a, b) {
              return a.level - b.level;
            }));
        };
        d.prototype.getNodePadding = function () {
          var a = this.options.nodePadding || 0;
          if (this.nodeColumns) {
            var b = this.nodeColumns.reduce(function (a, b) {
              return Math.max(a, b.length);
            }, 0);
            b * a > this.chart.plotSizeY && (a = this.chart.plotSizeY / b);
          }
          return a;
        };
        d.prototype.hasData = function () {
          return !!this.processedXData.length;
        };
        d.prototype.pointAttribs = function (a, c) {
          if (!a) return {};
          var g = this,
            d =
              g.mapOptionsToLevel[
                (a.isNode ? a.level : a.fromNode.level) || 0
              ] || {},
            f = a.options,
            e = (d.states && d.states[c || ""]) || {};
          c = [
            "colorByPoint",
            "borderColor",
            "borderWidth",
            "linkOpacity",
            "opacity",
          ].reduce(function (a, b) {
            a[b] = n(e[b], f[b], d[b], g.options[b]);
            return a;
          }, {});
          var h = n(e.color, f.color, c.colorByPoint ? a.color : d.color);
          return a.isNode
            ? {
                fill: h,
                stroke: c.borderColor,
                "stroke-width": c.borderWidth,
                opacity: c.opacity,
              }
            : { fill: b.parse(h).setOpacity(c.linkOpacity).get() };
        };
        d.prototype.drawTracker = function () {
          t.prototype.drawTracker.call(this, this.points);
          t.prototype.drawTracker.call(this, this.nodes);
        };
        d.prototype.drawPoints = function () {
          t.prototype.drawPoints.call(this, this.points);
          t.prototype.drawPoints.call(this, this.nodes);
        };
        d.prototype.drawDataLabels = function () {
          t.prototype.drawDataLabels.call(this, this.points);
          t.prototype.drawDataLabels.call(this, this.nodes);
        };
        d.prototype.translate = function () {
          this.processedXData || this.processData();
          this.generatePoints();
          this.nodeColumns = this.createNodeColumns();
          this.nodeWidth = q(this.options.nodeWidth, this.chart.plotSizeX);
          var a = this,
            b = this.chart,
            c = this.options,
            d = this.nodeWidth,
            f = this.nodeColumns;
          this.nodePadding = this.getNodePadding();
          this.translationFactor = f.reduce(function (b, c) {
            return Math.min(b, c.sankeyColumn.getTranslationFactor(a));
          }, Infinity);
          this.colDistance =
            (b.plotSizeX - d - c.borderWidth) / Math.max(1, f.length - 1);
          a.mapOptionsToLevel = z({
            from: 1,
            levels: c.levels,
            to: f.length - 1,
            defaults: {
              borderColor: c.borderColor,
              borderRadius: c.borderRadius,
              borderWidth: c.borderWidth,
              color: a.color,
              colorByPoint: c.colorByPoint,
              levelIsConstant: !0,
              linkColor: c.linkColor,
              linkLineWidth: c.linkLineWidth,
              linkOpacity: c.linkOpacity,
              states: c.states,
            },
          });
          f.forEach(function (b) {
            b.forEach(function (c) {
              a.translateNode(c, b);
            });
          }, this);
          this.nodes.forEach(function (b) {
            b.linksFrom.forEach(function (b) {
              (b.weight || b.isNull) &&
                b.to &&
                (a.translateLink(b), (b.allowShadow = !1));
            });
          });
        };
        d.prototype.translateLink = function (a) {
          var b = function (b, c) {
              c = b.offset(a, c) * f;
              return Math.min(
                b.nodeY + c,
                b.nodeY + ((b.shapeArgs && b.shapeArgs.height) || 0) - e,
              );
            },
            c = a.fromNode,
            d = a.toNode,
            g = this.chart,
            f = this.translationFactor,
            e = Math.max(a.weight * f, this.options.minLinkWidth),
            h =
              (g.inverted ? -this.colDistance : this.colDistance) *
              this.options.curveFactor,
            k = b(c, "linksFrom");
          b = b(d, "linksTo");
          var l = c.nodeX,
            m = this.nodeWidth;
          d = d.nodeX;
          var q = a.outgoing,
            n = d > l + m;
          g.inverted &&
            ((k = g.plotSizeY - k),
            (b = (g.plotSizeY || 0) - b),
            (m = -m),
            (e = -e),
            (n = l > d));
          a.shapeType = "path";
          a.linkBase = [k, k + e, b, b + e];
          if (n && "number" === typeof b)
            a.shapeArgs = {
              d: [
                ["M", l + m, k],
                ["C", l + m + h, k, d - h, b, d, b],
                ["L", d + (q ? m : 0), b + e / 2],
                ["L", d, b + e],
                ["C", d - h, b + e, l + m + h, k + e, l + m, k + e],
                ["Z"],
              ],
            };
          else if ("number" === typeof b) {
            h = d - 20 - e;
            q = d - 20;
            n = l + m;
            var p = n + 20,
              r = p + e,
              v = k,
              t = k + e,
              w = t + 20,
              x = w + (g.plotHeight - k - e),
              u = x + 20,
              z = u + e,
              D = b,
              B = D + e,
              E = B + 20,
              F = u + 0.7 * e,
              G = d - 0.7 * e,
              H = n + 0.7 * e;
            a.shapeArgs = {
              d: [
                ["M", n, v],
                ["C", H, v, r, t - 0.7 * e, r, w],
                ["L", r, x],
                ["C", r, F, H, z, n, z],
                ["L", d, z],
                ["C", G, z, h, F, h, x],
                ["L", h, E],
                ["C", h, B - 0.7 * e, G, D, d, D],
                ["L", d, B],
                ["C", q, B, q, B, q, E],
                ["L", q, x],
                ["C", q, u, q, u, d, u],
                ["L", n, u],
                ["C", p, u, p, u, p, x],
                ["L", p, w],
                ["C", p, t, p, t, n, t],
                ["Z"],
              ],
            };
          }
          a.dlBox = {
            x: l + (d - l + m) / 2,
            y: k + (b - k) / 2,
            height: e,
            width: 0,
          };
          a.tooltipPos = g.inverted
            ? [g.plotSizeY - a.dlBox.y - e / 2, g.plotSizeX - a.dlBox.x]
            : [a.dlBox.x, a.dlBox.y + e / 2];
          a.y = a.plotY = 1;
          a.x = a.plotX = 1;
          a.color || (a.color = c.color);
        };
        d.prototype.translateNode = function (a, b) {
          var c = this.translationFactor,
            e = this.chart,
            g = this.options,
            f = a.getSum(),
            h = Math.max(Math.round(f * c), this.options.minLinkWidth),
            k = Math.round(this.nodeWidth),
            l = (Math.round(g.borderWidth) % 2) / 2,
            m = b.sankeyColumn.offset(a, c);
          b =
            Math.floor(
              n(m.absoluteTop, b.sankeyColumn.top(c) + m.relativeTop),
            ) + l;
          l =
            Math.floor(this.colDistance * a.column + g.borderWidth / 2) +
            q(a.options.offsetHorizontal || 0, k) +
            l;
          l = e.inverted ? e.plotSizeX - l : l;
          if ((a.sum = f)) {
            a.shapeType = "rect";
            a.nodeX = l;
            a.nodeY = b;
            f = l;
            c = b;
            m = a.options.width || g.width || k;
            var p = a.options.height || g.height || h;
            e.inverted &&
              ((f = l - k),
              (c = e.plotSizeY - b - h),
              (m = a.options.height || g.height || k),
              (p = a.options.width || g.width || h));
            a.dlOptions = d.getDLOptions({
              level: this.mapOptionsToLevel[a.level],
              optionsPoint: a.options,
            });
            a.plotX = 1;
            a.plotY = 1;
            a.tooltipPos = e.inverted
              ? [e.plotSizeY - c - p / 2, e.plotSizeX - f - m / 2]
              : [f + m / 2, c + p / 2];
            a.shapeArgs = {
              x: f,
              y: c,
              width: m,
              height: p,
              display: a.hasShape() ? "" : "none",
            };
          } else a.dlOptions = { enabled: !1 };
        };
        d.defaultOptions = r(t.defaultOptions, p);
        return d;
      })(t);
      m.compose(l, e);
      c(e.prototype, {
        animate: f.prototype.animate,
        createNode: m.createNode,
        forceDL: !0,
        invertible: !0,
        isCartesian: !1,
        orderNodes: !0,
        noSharedTooltip: !0,
        pointArrayMap: ["from", "to", "weight"],
        pointClass: l,
        searchPoint: h.noop,
      });
      x.registerSeriesType("sankey", e);
      ("");
      return e;
    },
  );
  p(b, "masters/modules/sankey.src.js", [], function () {});
});
//# sourceMappingURL=sankey.js.map
