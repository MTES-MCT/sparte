/*
 Highcharts JS v10.3.2 (2022-11-28)

 (c) 2009-2021 Torstein Honsi

 License: www.highcharts.com/license
*/
(function (aa, K) {
  "object" === typeof module && module.exports
    ? ((K["default"] = K), (module.exports = aa.document ? K(aa) : K))
    : "function" === typeof define && define.amd
      ? define("highcharts/highcharts", function () {
          return K(aa);
        })
      : (aa.Highcharts && aa.Highcharts.error(16, !0), (aa.Highcharts = K(aa)));
})("undefined" !== typeof window ? window : this, function (aa) {
  function K(a, v, g, E) {
    a.hasOwnProperty(v) ||
      ((a[v] = E.apply(null, g)),
      "function" === typeof CustomEvent &&
        aa.dispatchEvent(
          new CustomEvent("HighchartsModuleLoaded", {
            detail: { path: v, module: a[v] },
          }),
        ));
  }
  var g = {};
  K(g, "Core/Globals.js", [], function () {
    var a;
    (function (a) {
      a.SVG_NS = "http://www.w3.org/2000/svg";
      a.product = "Highcharts";
      a.version = "10.3.2";
      a.win = "undefined" !== typeof aa ? aa : {};
      a.doc = a.win.document;
      a.svg =
        a.doc &&
        a.doc.createElementNS &&
        !!a.doc.createElementNS(a.SVG_NS, "svg").createSVGRect;
      a.userAgent = (a.win.navigator && a.win.navigator.userAgent) || "";
      a.isChrome = -1 !== a.userAgent.indexOf("Chrome");
      a.isFirefox = -1 !== a.userAgent.indexOf("Firefox");
      a.isMS = /(edge|msie|trident)/i.test(a.userAgent) && !a.win.opera;
      a.isSafari = !a.isChrome && -1 !== a.userAgent.indexOf("Safari");
      a.isTouchDevice = /(Mobile|Android|Windows Phone)/.test(a.userAgent);
      a.isWebKit = -1 !== a.userAgent.indexOf("AppleWebKit");
      a.deg2rad = (2 * Math.PI) / 360;
      a.hasBidiBug =
        a.isFirefox && 4 > parseInt(a.userAgent.split("Firefox/")[1], 10);
      a.hasTouch = !!a.win.TouchEvent;
      a.marginNames = ["plotTop", "marginRight", "marginBottom", "plotLeft"];
      a.noop = function () {};
      a.supportsPassiveEvents = (function () {
        var g = !1;
        if (!a.isMS) {
          var v = Object.defineProperty({}, "passive", {
            get: function () {
              g = !0;
            },
          });
          a.win.addEventListener &&
            a.win.removeEventListener &&
            (a.win.addEventListener("testPassive", a.noop, v),
            a.win.removeEventListener("testPassive", a.noop, v));
        }
        return g;
      })();
      a.charts = [];
      a.dateFormats = {};
      a.seriesTypes = {};
      a.symbolSizes = {};
      a.chartCount = 0;
    })(a || (a = {}));
    ("");
    return a;
  });
  K(g, "Core/Utilities.js", [g["Core/Globals.js"]], function (a) {
    function g(b, d, k, H) {
      var z = d ? "Highcharts error" : "Highcharts warning";
      32 === b && (b = "" + z + ": Deprecated member");
      var w = n(b),
        p = w
          ? "" + z + " #" + b + ": www.highcharts.com/errors/" + b + "/"
          : b.toString();
      if ("undefined" !== typeof H) {
        var q = "";
        w && (p += "?");
        I(H, function (b, z) {
          q += "\n - ".concat(z, ": ").concat(b);
          w && (p += encodeURI(z) + "=" + encodeURI(b));
        });
        p += q;
      }
      A(
        a,
        "displayError",
        { chart: k, code: b, message: p, params: H },
        function () {
          if (d) throw Error(p);
          h.console && -1 === g.messages.indexOf(p) && console.warn(p);
        },
      );
      g.messages.push(p);
    }
    function x(b, h) {
      var z = {};
      I(b, function (d, w) {
        if (G(b[w], !0) && !b.nodeType && h[w])
          (d = x(b[w], h[w])), Object.keys(d).length && (z[w] = d);
        else if (G(b[w]) || b[w] !== h[w] || (w in b && !(w in h))) z[w] = b[w];
      });
      return z;
    }
    function E(b, h) {
      return parseInt(b, h || 10);
    }
    function D(b) {
      return "string" === typeof b;
    }
    function B(b) {
      b = Object.prototype.toString.call(b);
      return "[object Array]" === b || "[object Array Iterator]" === b;
    }
    function G(b, h) {
      return !!b && "object" === typeof b && (!h || !B(b));
    }
    function r(b) {
      return G(b) && "number" === typeof b.nodeType;
    }
    function t(b) {
      var h = b && b.constructor;
      return !(!G(b, !0) || r(b) || !h || !h.name || "Object" === h.name);
    }
    function n(b) {
      return (
        "number" === typeof b && !isNaN(b) && Infinity > b && -Infinity < b
      );
    }
    function f(b) {
      return "undefined" !== typeof b && null !== b;
    }
    function c(b, h, d) {
      var z = D(h) && !f(d),
        w,
        k = function (h, d) {
          f(h)
            ? b.setAttribute(d, h)
            : z
              ? (w = b.getAttribute(d)) ||
                "class" !== d ||
                (w = b.getAttribute(d + "Name"))
              : b.removeAttribute(d);
        };
      D(h) ? k(d, h) : I(h, k);
      return w;
    }
    function l(b, h) {
      var d;
      b || (b = {});
      for (d in h) b[d] = h[d];
      return b;
    }
    function m() {
      for (var b = arguments, h = b.length, d = 0; d < h; d++) {
        var H = b[d];
        if ("undefined" !== typeof H && null !== H) return H;
      }
    }
    function e(b, h) {
      a.isMS &&
        !a.svg &&
        h &&
        f(h.opacity) &&
        (h.filter = "alpha(opacity=".concat(100 * h.opacity, ")"));
      l(b.style, h);
    }
    function u(b) {
      return Math.pow(10, Math.floor(Math.log(b) / Math.LN10));
    }
    function C(b, h) {
      return 1e14 < b ? b : parseFloat(b.toPrecision(h || 14));
    }
    function J(b, d, k) {
      var z = a.getStyle || J;
      if ("width" === d)
        return (
          (d = Math.min(b.offsetWidth, b.scrollWidth)),
          (k = b.getBoundingClientRect && b.getBoundingClientRect().width),
          k < d && k >= d - 1 && (d = Math.floor(k)),
          Math.max(
            0,
            d -
              (z(b, "padding-left", !0) || 0) -
              (z(b, "padding-right", !0) || 0),
          )
        );
      if ("height" === d)
        return Math.max(
          0,
          Math.min(b.offsetHeight, b.scrollHeight) -
            (z(b, "padding-top", !0) || 0) -
            (z(b, "padding-bottom", !0) || 0),
        );
      h.getComputedStyle || g(27, !0);
      if ((b = h.getComputedStyle(b, void 0))) {
        var w = b.getPropertyValue(d);
        m(k, "opacity" !== d) && (w = E(w));
      }
      return w;
    }
    function I(b, h, d) {
      for (var z in b)
        Object.hasOwnProperty.call(b, z) && h.call(d || b[z], b[z], z, b);
    }
    function L(b, h, d) {
      function z(h, y) {
        var d = b.removeEventListener || a.removeEventListenerPolyfill;
        d && d.call(b, h, y, !1);
      }
      function w(d) {
        var y;
        if (b.nodeName) {
          if (h) {
            var H = {};
            H[h] = !0;
          } else H = d;
          I(H, function (b, h) {
            if (d[h]) for (y = d[h].length; y--; ) z(h, d[h][y].fn);
          });
        }
      }
      var k = ("function" === typeof b && b.prototype) || b;
      if (Object.hasOwnProperty.call(k, "hcEvents")) {
        var p = k.hcEvents;
        h
          ? ((k = p[h] || []),
            d
              ? ((p[h] = k.filter(function (b) {
                  return d !== b.fn;
                })),
                z(h, d))
              : (w(p), (p[h] = [])))
          : (w(p), delete k.hcEvents);
      }
    }
    function A(b, h, d, H) {
      d = d || {};
      if (q.createEvent && (b.dispatchEvent || (b.fireEvent && b !== a))) {
        var z = q.createEvent("Events");
        z.initEvent(h, !0, !0);
        d = l(z, d);
        b.dispatchEvent ? b.dispatchEvent(d) : b.fireEvent(h, d);
      } else if (b.hcEvents) {
        d.target ||
          l(d, {
            preventDefault: function () {
              d.defaultPrevented = !0;
            },
            target: b,
            type: h,
          });
        z = [];
        for (var w = b, k = !1; w.hcEvents; )
          Object.hasOwnProperty.call(w, "hcEvents") &&
            w.hcEvents[h] &&
            (z.length && (k = !0), z.unshift.apply(z, w.hcEvents[h])),
            (w = Object.getPrototypeOf(w));
        k &&
          z.sort(function (b, h) {
            return b.order - h.order;
          });
        z.forEach(function (h) {
          !1 === h.fn.call(b, d) && d.preventDefault();
        });
      }
      H && !d.defaultPrevented && H.call(b, d);
    }
    var d = a.charts,
      q = a.doc,
      h = a.win;
    (g || (g = {})).messages = [];
    Math.easeInOutSine = function (b) {
      return -0.5 * (Math.cos(Math.PI * b) - 1);
    };
    var k = Array.prototype.find
      ? function (b, h) {
          return b.find(h);
        }
      : function (b, h) {
          var d,
            z = b.length;
          for (d = 0; d < z; d++) if (h(b[d], d)) return b[d];
        };
    I(
      {
        map: "map",
        each: "forEach",
        grep: "filter",
        reduce: "reduce",
        some: "some",
      },
      function (b, h) {
        a[h] = function (d) {
          var z;
          g(
            32,
            !1,
            void 0,
            ((z = {}),
            (z["Highcharts.".concat(h)] = "use Array.".concat(b)),
            z),
          );
          return Array.prototype[b].apply(d, [].slice.call(arguments, 1));
        };
      },
    );
    var b,
      p = (function () {
        var h = Math.random().toString(36).substring(2, 9) + "-",
          d = 0;
        return function () {
          return "highcharts-" + (b ? "" : h) + d++;
        };
      })();
    h.jQuery &&
      (h.jQuery.fn.highcharts = function () {
        var b = [].slice.call(arguments);
        if (this[0])
          return b[0]
            ? (new a[D(b[0]) ? b.shift() : "Chart"](this[0], b[0], b[1]), this)
            : d[c(this[0], "data-highcharts-chart")];
      });
    k = {
      addEvent: function (b, h, d, H) {
        void 0 === H && (H = {});
        var k = ("function" === typeof b && b.prototype) || b;
        Object.hasOwnProperty.call(k, "hcEvents") || (k.hcEvents = {});
        k = k.hcEvents;
        a.Point &&
          b instanceof a.Point &&
          b.series &&
          b.series.chart &&
          (b.series.chart.runTrackerClick = !0);
        var z = b.addEventListener || a.addEventListenerPolyfill;
        z &&
          z.call(
            b,
            h,
            d,
            a.supportsPassiveEvents
              ? {
                  passive:
                    void 0 === H.passive
                      ? -1 !== h.indexOf("touch")
                      : H.passive,
                  capture: !1,
                }
              : !1,
          );
        k[h] || (k[h] = []);
        k[h].push({
          fn: d,
          order: "number" === typeof H.order ? H.order : Infinity,
        });
        k[h].sort(function (b, h) {
          return b.order - h.order;
        });
        return function () {
          L(b, h, d);
        };
      },
      arrayMax: function (b) {
        for (var h = b.length, d = b[0]; h--; ) b[h] > d && (d = b[h]);
        return d;
      },
      arrayMin: function (b) {
        for (var h = b.length, d = b[0]; h--; ) b[h] < d && (d = b[h]);
        return d;
      },
      attr: c,
      clamp: function (b, h, d) {
        return b > h ? (b < d ? b : d) : h;
      },
      cleanRecursively: x,
      clearTimeout: function (b) {
        f(b) && clearTimeout(b);
      },
      correctFloat: C,
      createElement: function (b, h, d, k, p) {
        b = q.createElement(b);
        h && l(b, h);
        p && e(b, { padding: "0", border: "none", margin: "0" });
        d && e(b, d);
        k && k.appendChild(b);
        return b;
      },
      css: e,
      defined: f,
      destroyObjectProperties: function (b, h) {
        I(b, function (d, k) {
          d && d !== h && d.destroy && d.destroy();
          delete b[k];
        });
      },
      discardElement: function (b) {
        b && b.parentElement && b.parentElement.removeChild(b);
      },
      erase: function (b, h) {
        for (var d = b.length; d--; )
          if (b[d] === h) {
            b.splice(d, 1);
            break;
          }
      },
      error: g,
      extend: l,
      extendClass: function (b, h) {
        var d = function () {};
        d.prototype = new b();
        l(d.prototype, h);
        return d;
      },
      find: k,
      fireEvent: A,
      getMagnitude: u,
      getNestedProperty: function (b, d) {
        for (b = b.split("."); b.length && f(d); ) {
          var k = b.shift();
          if ("undefined" === typeof k || "__proto__" === k) return;
          d = d[k];
          if (
            !f(d) ||
            "function" === typeof d ||
            "number" === typeof d.nodeType ||
            d === h
          )
            return;
        }
        return d;
      },
      getStyle: J,
      inArray: function (b, d, h) {
        g(32, !1, void 0, { "Highcharts.inArray": "use Array.indexOf" });
        return d.indexOf(b, h);
      },
      isArray: B,
      isClass: t,
      isDOMElement: r,
      isFunction: function (b) {
        return "function" === typeof b;
      },
      isNumber: n,
      isObject: G,
      isString: D,
      keys: function (b) {
        g(32, !1, void 0, { "Highcharts.keys": "use Object.keys" });
        return Object.keys(b);
      },
      merge: function () {
        var b,
          d = arguments,
          h = {},
          k = function (b, d) {
            "object" !== typeof b && (b = {});
            I(d, function (h, y) {
              "__proto__" !== y &&
                "constructor" !== y &&
                (!G(h, !0) || t(h) || r(h)
                  ? (b[y] = d[y])
                  : (b[y] = k(b[y] || {}, h)));
            });
            return b;
          };
        !0 === d[0] && ((h = d[1]), (d = Array.prototype.slice.call(d, 2)));
        var p = d.length;
        for (b = 0; b < p; b++) h = k(h, d[b]);
        return h;
      },
      normalizeTickInterval: function (b, d, h, k, p) {
        var H = b;
        h = m(h, u(b));
        var w = b / h;
        d ||
          ((d = p
            ? [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
            : [1, 2, 2.5, 5, 10]),
          !1 === k &&
            (1 === h
              ? (d = d.filter(function (b) {
                  return 0 === b % 1;
                }))
              : 0.1 >= h && (d = [1 / h])));
        for (
          k = 0;
          k < d.length &&
          !((H = d[k]),
          (p && H * h >= b) || (!p && w <= (d[k] + (d[k + 1] || d[k])) / 2));
          k++
        );
        return (H = C(H * h, -Math.round(Math.log(0.001) / Math.LN10)));
      },
      objectEach: I,
      offset: function (b) {
        var d = q.documentElement;
        b =
          b.parentElement || b.parentNode
            ? b.getBoundingClientRect()
            : { top: 0, left: 0, width: 0, height: 0 };
        return {
          top: b.top + (h.pageYOffset || d.scrollTop) - (d.clientTop || 0),
          left: b.left + (h.pageXOffset || d.scrollLeft) - (d.clientLeft || 0),
          width: b.width,
          height: b.height,
        };
      },
      pad: function (b, d, h) {
        return (
          Array((d || 2) + 1 - String(b).replace("-", "").length).join(
            h || "0",
          ) + b
        );
      },
      pick: m,
      pInt: E,
      relativeLength: function (b, d, h) {
        return /%$/.test(b)
          ? (d * parseFloat(b)) / 100 + (h || 0)
          : parseFloat(b);
      },
      removeEvent: L,
      splat: function (b) {
        return B(b) ? b : [b];
      },
      stableSort: function (b, d) {
        var h = b.length,
          k,
          p;
        for (p = 0; p < h; p++) b[p].safeI = p;
        b.sort(function (b, h) {
          k = d(b, h);
          return 0 === k ? b.safeI - h.safeI : k;
        });
        for (p = 0; p < h; p++) delete b[p].safeI;
      },
      syncTimeout: function (b, d, h) {
        if (0 < d) return setTimeout(b, d, h);
        b.call(0, h);
        return -1;
      },
      timeUnits: {
        millisecond: 1,
        second: 1e3,
        minute: 6e4,
        hour: 36e5,
        day: 864e5,
        week: 6048e5,
        month: 24192e5,
        year: 314496e5,
      },
      uniqueKey: p,
      useSerialIds: function (d) {
        return (b = m(d, b));
      },
      wrap: function (b, d, h) {
        var k = b[d];
        b[d] = function () {
          var b = arguments,
            d = this;
          return h.apply(
            this,
            [
              function () {
                return k.apply(d, arguments.length ? arguments : b);
              },
            ].concat([].slice.call(arguments)),
          );
        };
      },
    };
    ("");
    return k;
  });
  K(g, "Core/Chart/ChartDefaults.js", [], function () {
    return {
      alignThresholds: !1,
      panning: { enabled: !1, type: "x" },
      styledMode: !1,
      borderRadius: 0,
      colorCount: 10,
      allowMutatingData: !0,
      defaultSeriesType: "line",
      ignoreHiddenSeries: !0,
      spacing: [10, 10, 15, 10],
      resetZoomButton: {
        theme: { zIndex: 6 },
        position: { align: "right", x: -10, y: 10 },
      },
      zoomBySingleTouch: !1,
      zooming: {
        singleTouch: !1,
        resetButton: {
          theme: { zIndex: 6 },
          position: { align: "right", x: -10, y: 10 },
        },
      },
      width: null,
      height: null,
      borderColor: "#335cad",
      backgroundColor: "#ffffff",
      plotBorderColor: "#cccccc",
    };
  });
  K(
    g,
    "Core/Color/Color.js",
    [g["Core/Globals.js"], g["Core/Utilities.js"]],
    function (a, g) {
      var v = g.isNumber,
        E = g.merge,
        D = g.pInt;
      g = (function () {
        function g(v) {
          this.rgba = [NaN, NaN, NaN, NaN];
          this.input = v;
          var r = a.Color;
          if (r && r !== g) return new r(v);
          if (!(this instanceof g)) return new g(v);
          this.init(v);
        }
        g.parse = function (a) {
          return a ? new g(a) : g.None;
        };
        g.prototype.init = function (a) {
          var r;
          if ("object" === typeof a && "undefined" !== typeof a.stops)
            this.stops = a.stops.map(function (c) {
              return new g(c[1]);
            });
          else if ("string" === typeof a) {
            this.input = a = g.names[a.toLowerCase()] || a;
            if ("#" === a.charAt(0)) {
              var t = a.length;
              var n = parseInt(a.substr(1), 16);
              7 === t
                ? (r = [(n & 16711680) >> 16, (n & 65280) >> 8, n & 255, 1])
                : 4 === t &&
                  (r = [
                    ((n & 3840) >> 4) | ((n & 3840) >> 8),
                    ((n & 240) >> 4) | (n & 240),
                    ((n & 15) << 4) | (n & 15),
                    1,
                  ]);
            }
            if (!r)
              for (n = g.parsers.length; n-- && !r; ) {
                var f = g.parsers[n];
                (t = f.regex.exec(a)) && (r = f.parse(t));
              }
          }
          r && (this.rgba = r);
        };
        g.prototype.get = function (a) {
          var r = this.input,
            t = this.rgba;
          if ("object" === typeof r && "undefined" !== typeof this.stops) {
            var n = E(r);
            n.stops = [].slice.call(n.stops);
            this.stops.forEach(function (f, c) {
              n.stops[c] = [n.stops[c][0], f.get(a)];
            });
            return n;
          }
          return t && v(t[0])
            ? "rgb" === a || (!a && 1 === t[3])
              ? "rgb(" + t[0] + "," + t[1] + "," + t[2] + ")"
              : "a" === a
                ? "".concat(t[3])
                : "rgba(" + t.join(",") + ")"
            : r;
        };
        g.prototype.brighten = function (a) {
          var r = this.rgba;
          if (this.stops)
            this.stops.forEach(function (n) {
              n.brighten(a);
            });
          else if (v(a) && 0 !== a)
            for (var t = 0; 3 > t; t++)
              (r[t] += D(255 * a)),
                0 > r[t] && (r[t] = 0),
                255 < r[t] && (r[t] = 255);
          return this;
        };
        g.prototype.setOpacity = function (a) {
          this.rgba[3] = a;
          return this;
        };
        g.prototype.tweenTo = function (a, r) {
          var t = this.rgba,
            n = a.rgba;
          if (!v(t[0]) || !v(n[0])) return a.input || "none";
          a = 1 !== n[3] || 1 !== t[3];
          return (
            (a ? "rgba(" : "rgb(") +
            Math.round(n[0] + (t[0] - n[0]) * (1 - r)) +
            "," +
            Math.round(n[1] + (t[1] - n[1]) * (1 - r)) +
            "," +
            Math.round(n[2] + (t[2] - n[2]) * (1 - r)) +
            (a ? "," + (n[3] + (t[3] - n[3]) * (1 - r)) : "") +
            ")"
          );
        };
        g.names = { white: "#ffffff", black: "#000000" };
        g.parsers = [
          {
            regex:
              /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/,
            parse: function (a) {
              return [D(a[1]), D(a[2]), D(a[3]), parseFloat(a[4], 10)];
            },
          },
          {
            regex:
              /rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/,
            parse: function (a) {
              return [D(a[1]), D(a[2]), D(a[3]), 1];
            },
          },
        ];
        g.None = new g("");
        return g;
      })();
      ("");
      return g;
    },
  );
  K(g, "Core/Color/Palettes.js", [], function () {
    return {
      colors:
        "#7cb5ec #434348 #90ed7d #f7a35c #8085e9 #f15c80 #e4d354 #2b908f #f45b5b #91e8e1".split(
          " ",
        ),
    };
  });
  K(
    g,
    "Core/Time.js",
    [g["Core/Globals.js"], g["Core/Utilities.js"]],
    function (a, g) {
      var v = a.win,
        E = g.defined,
        D = g.error,
        B = g.extend,
        G = g.isObject,
        r = g.merge,
        t = g.objectEach,
        n = g.pad,
        f = g.pick,
        c = g.splat,
        l = g.timeUnits,
        m = a.isSafari && v.Intl && v.Intl.DateTimeFormat.prototype.formatRange,
        e =
          a.isSafari && v.Intl && !v.Intl.DateTimeFormat.prototype.formatRange;
      g = (function () {
        function u(c) {
          this.options = {};
          this.variableTimezone = this.useUTC = !1;
          this.Date = v.Date;
          this.getTimezoneOffset = this.timezoneOffsetFunction();
          this.update(c);
        }
        u.prototype.get = function (c, e) {
          if (this.variableTimezone || this.timezoneOffset) {
            var m = e.getTime(),
              l = m - this.getTimezoneOffset(e);
            e.setTime(l);
            c = e["getUTC" + c]();
            e.setTime(m);
            return c;
          }
          return this.useUTC ? e["getUTC" + c]() : e["get" + c]();
        };
        u.prototype.set = function (c, e, l) {
          if (this.variableTimezone || this.timezoneOffset) {
            if (
              "Milliseconds" === c ||
              "Seconds" === c ||
              ("Minutes" === c && 0 === this.getTimezoneOffset(e) % 36e5)
            )
              return e["setUTC" + c](l);
            var f = this.getTimezoneOffset(e);
            f = e.getTime() - f;
            e.setTime(f);
            e["setUTC" + c](l);
            c = this.getTimezoneOffset(e);
            f = e.getTime() + c;
            return e.setTime(f);
          }
          return this.useUTC || (m && "FullYear" === c)
            ? e["setUTC" + c](l)
            : e["set" + c](l);
        };
        u.prototype.update = function (c) {
          void 0 === c && (c = {});
          var e = f(c.useUTC, !0);
          this.options = c = r(!0, this.options, c);
          this.Date = c.Date || v.Date || Date;
          this.timezoneOffset =
            ((this.useUTC = e) && c.timezoneOffset) || void 0;
          this.getTimezoneOffset = this.timezoneOffsetFunction();
          this.variableTimezone = e && !(!c.getTimezoneOffset && !c.timezone);
        };
        u.prototype.makeTime = function (c, m, l, u, A, d) {
          if (this.useUTC) {
            var q = this.Date.UTC.apply(0, arguments);
            var h = this.getTimezoneOffset(q);
            q += h;
            var k = this.getTimezoneOffset(q);
            h !== k
              ? (q += k - h)
              : h - 36e5 !== this.getTimezoneOffset(q - 36e5) ||
                e ||
                (q -= 36e5);
          } else
            q = new this.Date(
              c,
              m,
              f(l, 1),
              f(u, 0),
              f(A, 0),
              f(d, 0),
            ).getTime();
          return q;
        };
        u.prototype.timezoneOffsetFunction = function () {
          var c = this,
            e = this.options,
            m = e.getTimezoneOffset,
            l = e.moment || v.moment;
          if (!this.useUTC)
            return function (c) {
              return 6e4 * new Date(c.toString()).getTimezoneOffset();
            };
          if (e.timezone) {
            if (l)
              return function (c) {
                return 6e4 * -l.tz(c, e.timezone).utcOffset();
              };
            D(25);
          }
          return this.useUTC && m
            ? function (c) {
                return 6e4 * m(c.valueOf());
              }
            : function () {
                return 6e4 * (c.timezoneOffset || 0);
              };
        };
        u.prototype.dateFormat = function (c, e, m) {
          if (!E(e) || isNaN(e))
            return (
              (a.defaultOptions.lang && a.defaultOptions.lang.invalidDate) || ""
            );
          c = f(c, "%Y-%m-%d %H:%M:%S");
          var l = this,
            u = new this.Date(e),
            d = this.get("Hours", u),
            q = this.get("Day", u),
            h = this.get("Date", u),
            k = this.get("Month", u),
            b = this.get("FullYear", u),
            p = a.defaultOptions.lang,
            z = p && p.weekdays,
            w = p && p.shortWeekdays;
          u = B(
            {
              a: w ? w[q] : z[q].substr(0, 3),
              A: z[q],
              d: n(h),
              e: n(h, 2, " "),
              w: q,
              b: p.shortMonths[k],
              B: p.months[k],
              m: n(k + 1),
              o: k + 1,
              y: b.toString().substr(2, 2),
              Y: b,
              H: n(d),
              k: d,
              I: n(d % 12 || 12),
              l: d % 12 || 12,
              M: n(this.get("Minutes", u)),
              p: 12 > d ? "AM" : "PM",
              P: 12 > d ? "am" : "pm",
              S: n(u.getSeconds()),
              L: n(Math.floor(e % 1e3), 3),
            },
            a.dateFormats,
          );
          t(u, function (b, d) {
            for (; -1 !== c.indexOf("%" + d); )
              c = c.replace(
                "%" + d,
                "function" === typeof b ? b.call(l, e) : b,
              );
          });
          return m ? c.substr(0, 1).toUpperCase() + c.substr(1) : c;
        };
        u.prototype.resolveDTLFormat = function (e) {
          return G(e, !0)
            ? e
            : ((e = c(e)), { main: e[0], from: e[1], to: e[2] });
        };
        u.prototype.getTimeTicks = function (c, e, m, u) {
          var A = this,
            d = [],
            q = {},
            h = new A.Date(e),
            k = c.unitRange,
            b = c.count || 1,
            p;
          u = f(u, 1);
          if (E(e)) {
            A.set(
              "Milliseconds",
              h,
              k >= l.second ? 0 : b * Math.floor(A.get("Milliseconds", h) / b),
            );
            k >= l.second &&
              A.set(
                "Seconds",
                h,
                k >= l.minute ? 0 : b * Math.floor(A.get("Seconds", h) / b),
              );
            k >= l.minute &&
              A.set(
                "Minutes",
                h,
                k >= l.hour ? 0 : b * Math.floor(A.get("Minutes", h) / b),
              );
            k >= l.hour &&
              A.set(
                "Hours",
                h,
                k >= l.day ? 0 : b * Math.floor(A.get("Hours", h) / b),
              );
            k >= l.day &&
              A.set(
                "Date",
                h,
                k >= l.month
                  ? 1
                  : Math.max(1, b * Math.floor(A.get("Date", h) / b)),
              );
            if (k >= l.month) {
              A.set(
                "Month",
                h,
                k >= l.year ? 0 : b * Math.floor(A.get("Month", h) / b),
              );
              var z = A.get("FullYear", h);
            }
            k >= l.year && A.set("FullYear", h, z - (z % b));
            k === l.week &&
              ((z = A.get("Day", h)),
              A.set("Date", h, A.get("Date", h) - z + u + (z < u ? -7 : 0)));
            z = A.get("FullYear", h);
            u = A.get("Month", h);
            var w = A.get("Date", h),
              C = A.get("Hours", h);
            e = h.getTime();
            (!A.variableTimezone && A.useUTC) ||
              !E(m) ||
              (p =
                m - e > 4 * l.month ||
                A.getTimezoneOffset(e) !== A.getTimezoneOffset(m));
            e = h.getTime();
            for (h = 1; e < m; )
              d.push(e),
                (e =
                  k === l.year
                    ? A.makeTime(z + h * b, 0)
                    : k === l.month
                      ? A.makeTime(z, u + h * b)
                      : !p || (k !== l.day && k !== l.week)
                        ? p && k === l.hour && 1 < b
                          ? A.makeTime(z, u, w, C + h * b)
                          : e + k * b
                        : A.makeTime(z, u, w + h * b * (k === l.day ? 1 : 7))),
                h++;
            d.push(e);
            k <= l.hour &&
              1e4 > d.length &&
              d.forEach(function (b) {
                0 === b % 18e5 &&
                  "000000000" === A.dateFormat("%H%M%S%L", b) &&
                  (q[b] = "day");
              });
          }
          d.info = B(c, { higherRanks: q, totalRange: k * b });
          return d;
        };
        u.prototype.getDateFormat = function (c, e, m, u) {
          var f = this.dateFormat("%m-%d %H:%M:%S.%L", e),
            d = { millisecond: 15, second: 12, minute: 9, hour: 6, day: 3 },
            q = "millisecond";
          for (h in l) {
            if (
              c === l.week &&
              +this.dateFormat("%w", e) === m &&
              "00:00:00.000" === f.substr(6)
            ) {
              var h = "week";
              break;
            }
            if (l[h] > c) {
              h = q;
              break;
            }
            if (d[h] && f.substr(d[h]) !== "01-01 00:00:00.000".substr(d[h]))
              break;
            "week" !== h && (q = h);
          }
          return this.resolveDTLFormat(u[h]).main;
        };
        return u;
      })();
      ("");
      return g;
    },
  );
  K(
    g,
    "Core/Defaults.js",
    [
      g["Core/Chart/ChartDefaults.js"],
      g["Core/Color/Color.js"],
      g["Core/Globals.js"],
      g["Core/Color/Palettes.js"],
      g["Core/Time.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B) {
      g = g.parse;
      var v = B.merge,
        r = {
          colors: E.colors,
          symbols: ["circle", "diamond", "square", "triangle", "triangle-down"],
          lang: {
            loading: "Loading...",
            months:
              "January February March April May June July August September October November December".split(
                " ",
              ),
            shortMonths:
              "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
            weekdays:
              "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(
                " ",
              ),
            decimalPoint: ".",
            numericSymbols: "kMGTPE".split(""),
            resetZoom: "Reset zoom",
            resetZoomTitle: "Reset zoom level 1:1",
            thousandsSep: " ",
          },
          global: {},
          time: {
            Date: void 0,
            getTimezoneOffset: void 0,
            timezone: void 0,
            timezoneOffset: 0,
            useUTC: !0,
          },
          chart: a,
          title: {
            text: "Chart title",
            align: "center",
            margin: 15,
            widthAdjust: -44,
          },
          subtitle: { text: "", align: "center", widthAdjust: -44 },
          caption: {
            margin: 15,
            text: "",
            align: "left",
            verticalAlign: "bottom",
          },
          plotOptions: {},
          labels: { style: { position: "absolute", color: "#333333" } },
          legend: {
            enabled: !0,
            align: "center",
            alignColumns: !0,
            className: "highcharts-no-tooltip",
            layout: "horizontal",
            labelFormatter: function () {
              return this.name;
            },
            borderColor: "#999999",
            borderRadius: 0,
            navigation: { activeColor: "#003399", inactiveColor: "#cccccc" },
            itemStyle: {
              color: "#333333",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
              textOverflow: "ellipsis",
            },
            itemHoverStyle: { color: "#000000" },
            itemHiddenStyle: { color: "#cccccc" },
            shadow: !1,
            itemCheckboxStyle: {
              position: "absolute",
              width: "13px",
              height: "13px",
            },
            squareSymbol: !0,
            symbolPadding: 5,
            verticalAlign: "bottom",
            x: 0,
            y: 0,
            title: { style: { fontWeight: "bold" } },
          },
          loading: {
            labelStyle: {
              fontWeight: "bold",
              position: "relative",
              top: "45%",
            },
            style: {
              position: "absolute",
              backgroundColor: "#ffffff",
              opacity: 0.5,
              textAlign: "center",
            },
          },
          tooltip: {
            enabled: !0,
            animation: x.svg,
            borderRadius: 3,
            dateTimeLabelFormats: {
              millisecond: "%A, %b %e, %H:%M:%S.%L",
              second: "%A, %b %e, %H:%M:%S",
              minute: "%A, %b %e, %H:%M",
              hour: "%A, %b %e, %H:%M",
              day: "%A, %b %e, %Y",
              week: "Week from %A, %b %e, %Y",
              month: "%B %Y",
              year: "%Y",
            },
            footerFormat: "",
            headerShape: "callout",
            hideDelay: 500,
            padding: 8,
            shape: "callout",
            shared: !1,
            snap: x.isTouchDevice ? 25 : 10,
            headerFormat:
              '<span style="font-size: 10px">{point.key}</span><br/>',
            pointFormat:
              '<span style="color:{point.color}">\u25cf</span> {series.name}: <b>{point.y}</b><br/>',
            backgroundColor: g("#f7f7f7").setOpacity(0.85).get(),
            borderWidth: 1,
            shadow: !0,
            stickOnContact: !1,
            style: {
              color: "#333333",
              cursor: "default",
              fontSize: "12px",
              whiteSpace: "nowrap",
            },
            useHTML: !1,
          },
          credits: {
            enabled: !0,
            href: "https://www.highcharts.com?credits",
            position: {
              align: "right",
              x: -10,
              verticalAlign: "bottom",
              y: -5,
            },
            style: { cursor: "pointer", color: "#999999", fontSize: "9px" },
            text: "Highcharts.com",
          },
        };
      r.chart.styledMode = !1;
      ("");
      var t = new D(v(r.global, r.time));
      a = {
        defaultOptions: r,
        defaultTime: t,
        getOptions: function () {
          return r;
        },
        setOptions: function (a) {
          v(!0, r, a);
          if (a.time || a.global)
            x.time
              ? x.time.update(v(r.global, r.time, a.global, a.time))
              : (x.time = t);
          return r;
        },
      };
      ("");
      return a;
    },
  );
  K(
    g,
    "Core/Animation/Fx.js",
    [g["Core/Color/Color.js"], g["Core/Globals.js"], g["Core/Utilities.js"]],
    function (a, g, x) {
      var v = a.parse,
        D = g.win,
        B = x.isNumber,
        G = x.objectEach;
      return (function () {
        function a(a, n, f) {
          this.pos = NaN;
          this.options = n;
          this.elem = a;
          this.prop = f;
        }
        a.prototype.dSetter = function () {
          var a = this.paths,
            n = a && a[0];
          a = a && a[1];
          var f = this.now || 0,
            c = [];
          if (1 !== f && n && a)
            if (n.length === a.length && 1 > f)
              for (var l = 0; l < a.length; l++) {
                for (var m = n[l], e = a[l], u = [], C = 0; C < e.length; C++) {
                  var J = m[C],
                    I = e[C];
                  B(J) && B(I) && ("A" !== e[0] || (4 !== C && 5 !== C))
                    ? (u[C] = J + f * (I - J))
                    : (u[C] = I);
                }
                c.push(u);
              }
            else c = a;
          else c = this.toD || [];
          this.elem.attr("d", c, void 0, !0);
        };
        a.prototype.update = function () {
          var a = this.elem,
            n = this.prop,
            f = this.now,
            c = this.options.step;
          if (this[n + "Setter"]) this[n + "Setter"]();
          else
            a.attr
              ? a.element && a.attr(n, f, null, !0)
              : (a.style[n] = f + this.unit);
          c && c.call(a, f, this);
        };
        a.prototype.run = function (r, n, f) {
          var c = this,
            l = c.options,
            m = function (e) {
              return m.stopped ? !1 : c.step(e);
            },
            e =
              D.requestAnimationFrame ||
              function (c) {
                setTimeout(c, 13);
              },
            u = function () {
              for (var c = 0; c < a.timers.length; c++)
                a.timers[c]() || a.timers.splice(c--, 1);
              a.timers.length && e(u);
            };
          r !== n || this.elem["forceAnimate:" + this.prop]
            ? ((this.startTime = +new Date()),
              (this.start = r),
              (this.end = n),
              (this.unit = f),
              (this.now = this.start),
              (this.pos = 0),
              (m.elem = this.elem),
              (m.prop = this.prop),
              m() && 1 === a.timers.push(m) && e(u))
            : (delete l.curAnim[this.prop],
              l.complete &&
                0 === Object.keys(l.curAnim).length &&
                l.complete.call(this.elem));
        };
        a.prototype.step = function (a) {
          var n = +new Date(),
            f = this.options,
            c = this.elem,
            l = f.complete,
            m = f.duration,
            e = f.curAnim;
          if (c.attr && !c.element) a = !1;
          else if (a || n >= m + this.startTime) {
            this.now = this.end;
            this.pos = 1;
            this.update();
            var u = (e[this.prop] = !0);
            G(e, function (c) {
              !0 !== c && (u = !1);
            });
            u && l && l.call(c);
            a = !1;
          } else
            (this.pos = f.easing((n - this.startTime) / m)),
              (this.now = this.start + (this.end - this.start) * this.pos),
              this.update(),
              (a = !0);
          return a;
        };
        a.prototype.initPath = function (a, n, f) {
          function c(c, d) {
            for (; c.length < r; ) {
              var e = c[0],
                h = d[r - c.length];
              h &&
                "M" === e[0] &&
                (c[0] =
                  "C" === h[0]
                    ? ["C", e[1], e[2], e[1], e[2], e[1], e[2]]
                    : ["L", e[1], e[2]]);
              c.unshift(e);
              u && ((e = c.pop()), c.push(c[c.length - 1], e));
            }
          }
          function l(c, d) {
            for (; c.length < r; )
              if (
                ((d = c[Math.floor(c.length / C) - 1].slice()),
                "C" === d[0] && ((d[1] = d[5]), (d[2] = d[6])),
                u)
              ) {
                var e = c[Math.floor(c.length / C)].slice();
                c.splice(c.length / 2, 0, d, e);
              } else c.push(d);
          }
          var m = a.startX,
            e = a.endX;
          f = f.slice();
          var u = a.isArea,
            C = u ? 2 : 1;
          n = n && n.slice();
          if (!n) return [f, f];
          if (m && e && e.length) {
            for (a = 0; a < m.length; a++)
              if (m[a] === e[0]) {
                var J = a;
                break;
              } else if (m[0] === e[e.length - m.length + a]) {
                J = a;
                var I = !0;
                break;
              } else if (m[m.length - 1] === e[e.length - m.length + a]) {
                J = m.length - a;
                break;
              }
            "undefined" === typeof J && (n = []);
          }
          if (n.length && B(J)) {
            var r = f.length + J * C;
            I ? (c(n, f), l(f, n)) : (c(f, n), l(n, f));
          }
          return [n, f];
        };
        a.prototype.fillSetter = function () {
          a.prototype.strokeSetter.apply(this, arguments);
        };
        a.prototype.strokeSetter = function () {
          this.elem.attr(
            this.prop,
            v(this.start).tweenTo(v(this.end), this.pos),
            void 0,
            !0,
          );
        };
        a.timers = [];
        return a;
      })();
    },
  );
  K(
    g,
    "Core/Animation/AnimationUtilities.js",
    [g["Core/Animation/Fx.js"], g["Core/Utilities.js"]],
    function (a, g) {
      function v(c) {
        return t(c)
          ? n({ duration: 500, defer: 0 }, c)
          : { duration: c ? 500 : 0, defer: 0 };
      }
      function E(c, m) {
        for (var e = a.timers.length; e--; )
          a.timers[e].elem !== c ||
            (m && m !== a.timers[e].prop) ||
            (a.timers[e].stopped = !0);
      }
      var D = g.defined,
        B = g.getStyle,
        G = g.isArray,
        r = g.isNumber,
        t = g.isObject,
        n = g.merge,
        f = g.objectEach,
        c = g.pick;
      return {
        animate: function (c, m, e) {
          var u,
            l = "",
            J,
            I;
          if (!t(e)) {
            var g = arguments;
            e = { duration: g[2], easing: g[3], complete: g[4] };
          }
          r(e.duration) || (e.duration = 400);
          e.easing =
            "function" === typeof e.easing
              ? e.easing
              : Math[e.easing] || Math.easeInOutSine;
          e.curAnim = n(m);
          f(m, function (f, d) {
            E(c, d);
            I = new a(c, e, d);
            J = void 0;
            "d" === d && G(m.d)
              ? ((I.paths = I.initPath(c, c.pathArray, m.d)),
                (I.toD = m.d),
                (u = 0),
                (J = 1))
              : c.attr
                ? (u = c.attr(d))
                : ((u = parseFloat(B(c, d)) || 0),
                  "opacity" !== d && (l = "px"));
            J || (J = f);
            "string" === typeof J &&
              J.match("px") &&
              (J = J.replace(/px/g, ""));
            I.run(u, J, l);
          });
        },
        animObject: v,
        getDeferredAnimation: function (c, m, e) {
          var u = v(m),
            f = 0,
            l = 0;
          (e ? [e] : c.series).forEach(function (c) {
            c = v(c.options.animation);
            f = m && D(m.defer) ? u.defer : Math.max(f, c.duration + c.defer);
            l = Math.min(u.duration, c.duration);
          });
          c.renderer.forExport && (f = 0);
          return { defer: Math.max(0, f - l), duration: Math.min(f, l) };
        },
        setAnimation: function (f, m) {
          m.renderer.globalAnimation = c(f, m.options.chart.animation, !0);
        },
        stop: E,
      };
    },
  );
  K(
    g,
    "Core/Renderer/HTML/AST.js",
    [g["Core/Globals.js"], g["Core/Utilities.js"]],
    function (a, g) {
      var v = a.SVG_NS,
        E = g.attr,
        D = g.createElement,
        B = g.css,
        G = g.error,
        r = g.isFunction,
        t = g.isString,
        n = g.objectEach,
        f = g.splat,
        c =
          (g = a.win.trustedTypes) &&
          r(g.createPolicy) &&
          g.createPolicy("highcharts", {
            createHTML: function (c) {
              return c;
            },
          }),
        l = c ? c.createHTML("") : "";
      try {
        var m = !!new DOMParser().parseFromString(l, "text/html");
      } catch (e) {
        m = !1;
      }
      r = (function () {
        function e(c) {
          this.nodes = "string" === typeof c ? this.parseMarkup(c) : c;
        }
        e.filterUserAttributes = function (c) {
          n(c, function (m, f) {
            var u = !0;
            -1 === e.allowedAttributes.indexOf(f) && (u = !1);
            -1 !==
              ["background", "dynsrc", "href", "lowsrc", "src"].indexOf(f) &&
              (u =
                t(m) &&
                e.allowedReferences.some(function (c) {
                  return 0 === m.indexOf(c);
                }));
            u ||
              (G(33, !1, void 0, {
                "Invalid attribute in config": "".concat(f),
              }),
              delete c[f]);
            t(m) && c[f] && (c[f] = m.replace(/</g, "&lt;"));
          });
          return c;
        };
        e.parseStyle = function (c) {
          return c.split(";").reduce(function (c, e) {
            e = e.split(":").map(function (c) {
              return c.trim();
            });
            var m = e.shift();
            m &&
              e.length &&
              (c[
                m.replace(/-([a-z])/g, function (c) {
                  return c[1].toUpperCase();
                })
              ] = e.join(":"));
            return c;
          }, {});
        };
        e.setElementHTML = function (c, m) {
          c.innerHTML = e.emptyHTML;
          m && new e(m).addToDOM(c);
        };
        e.prototype.addToDOM = function (c) {
          function m(c, u) {
            var l;
            f(c).forEach(function (c) {
              var d = c.tagName,
                q = c.textContent
                  ? a.doc.createTextNode(c.textContent)
                  : void 0,
                h = e.bypassHTMLFiltering;
              if (d)
                if ("#text" === d) var k = q;
                else if (-1 !== e.allowedTags.indexOf(d) || h) {
                  d = a.doc.createElementNS(
                    "svg" === d ? v : u.namespaceURI || v,
                    d,
                  );
                  var b = c.attributes || {};
                  n(c, function (d, h) {
                    "tagName" !== h &&
                      "attributes" !== h &&
                      "children" !== h &&
                      "style" !== h &&
                      "textContent" !== h &&
                      (b[h] = d);
                  });
                  E(d, h ? b : e.filterUserAttributes(b));
                  c.style && B(d, c.style);
                  q && d.appendChild(q);
                  m(c.children || [], d);
                  k = d;
                } else G(33, !1, void 0, { "Invalid tagName in config": d });
              k && u.appendChild(k);
              l = k;
            });
            return l;
          }
          return m(this.nodes, c);
        };
        e.prototype.parseMarkup = function (f) {
          var l = [];
          f = f.trim().replace(/ style=(["'])/g, " data-style=$1");
          if (m)
            f = new DOMParser().parseFromString(
              c ? c.createHTML(f) : f,
              "text/html",
            );
          else {
            var u = D("div");
            u.innerHTML = f;
            f = { body: u };
          }
          var a = function (c, m) {
            var d = c.nodeName.toLowerCase(),
              f = { tagName: d };
            "#text" === d && (f.textContent = c.textContent || "");
            if ((d = c.attributes)) {
              var h = {};
              [].forEach.call(d, function (b) {
                "data-style" === b.name
                  ? (f.style = e.parseStyle(b.value))
                  : (h[b.name] = b.value);
              });
              f.attributes = h;
            }
            if (c.childNodes.length) {
              var k = [];
              [].forEach.call(c.childNodes, function (b) {
                a(b, k);
              });
              k.length && (f.children = k);
            }
            m.push(f);
          };
          [].forEach.call(f.body.childNodes, function (c) {
            return a(c, l);
          });
          return l;
        };
        e.allowedAttributes =
          "aria-controls aria-describedby aria-expanded aria-haspopup aria-hidden aria-label aria-labelledby aria-live aria-pressed aria-readonly aria-roledescription aria-selected class clip-path color colspan cx cy d dx dy disabled fill height href id in markerHeight markerWidth offset opacity orient padding paddingLeft paddingRight patternUnits r refX refY role scope slope src startOffset stdDeviation stroke stroke-linecap stroke-width style tableValues result rowspan summary target tabindex text-align text-anchor textAnchor textLength title type valign width x x1 x2 xlink:href y y1 y2 zIndex".split(
            " ",
          );
        e.allowedReferences = "https:// http:// mailto: / ../ ./ #".split(" ");
        e.allowedTags =
          "a abbr b br button caption circle clipPath code dd defs div dl dt em feComponentTransfer feFuncA feFuncB feFuncG feFuncR feGaussianBlur feOffset feMerge feMergeNode filter h1 h2 h3 h4 h5 h6 hr i img li linearGradient marker ol p path pattern pre rect small span stop strong style sub sup svg table text textPath thead title tbody tspan td th tr u ul #text".split(
            " ",
          );
        e.emptyHTML = l;
        e.bypassHTMLFiltering = !1;
        return e;
      })();
      ("");
      return r;
    },
  );
  K(
    g,
    "Core/FormatUtilities.js",
    [g["Core/Defaults.js"], g["Core/Utilities.js"]],
    function (a, g) {
      function v(a, f, c, l) {
        a = +a || 0;
        f = +f;
        var m = E.lang,
          e = (a.toString().split(".")[1] || "").split("e")[0].length,
          u = a.toString().split("e"),
          C = f;
        if (-1 === f) f = Math.min(e, 20);
        else if (!G(f)) f = 2;
        else if (f && u[1] && 0 > u[1]) {
          var g = f + +u[1];
          0 <= g
            ? ((u[0] = (+u[0]).toExponential(g).split("e")[0]), (f = g))
            : ((u[0] = u[0].split(".")[0] || 0),
              (a = 20 > f ? (u[0] * Math.pow(10, u[1])).toFixed(f) : 0),
              (u[1] = 0));
        }
        g = (
          Math.abs(u[1] ? u[0] : a) + Math.pow(10, -Math.max(f, e) - 1)
        ).toFixed(f);
        e = String(t(g));
        var n = 3 < e.length ? e.length % 3 : 0;
        c = r(c, m.decimalPoint);
        l = r(l, m.thousandsSep);
        a = (0 > a ? "-" : "") + (n ? e.substr(0, n) + l : "");
        a =
          0 > +u[1] && !C
            ? "0"
            : a + e.substr(n).replace(/(\d{3})(?=\d)/g, "$1" + l);
        f && (a += c + g.slice(-f));
        u[1] && 0 !== +a && (a += "e" + u[1]);
        return a;
      }
      var E = a.defaultOptions,
        D = a.defaultTime,
        B = g.getNestedProperty,
        G = g.isNumber,
        r = g.pick,
        t = g.pInt;
      return {
        dateFormat: function (a, f, c) {
          return D.dateFormat(a, f, c);
        },
        format: function (a, f, c) {
          var l = "{",
            m = !1,
            e = /f$/,
            u = /\.([0-9])/,
            C = E.lang,
            g = (c && c.time) || D;
          c = (c && c.numberFormatter) || v;
          for (var n = []; a; ) {
            var r = a.indexOf(l);
            if (-1 === r) break;
            var A = a.slice(0, r);
            if (m) {
              A = A.split(":");
              l = B(A.shift() || "", f);
              if (A.length && "number" === typeof l)
                if (((A = A.join(":")), e.test(A))) {
                  var d = parseInt((A.match(u) || ["", "-1"])[1], 10);
                  null !== l &&
                    (l = c(
                      l,
                      d,
                      C.decimalPoint,
                      -1 < A.indexOf(",") ? C.thousandsSep : "",
                    ));
                } else l = g.dateFormat(A, l);
              n.push(l);
            } else n.push(A);
            a = a.slice(r + 1);
            l = (m = !m) ? "}" : "{";
          }
          n.push(a);
          return n.join("");
        },
        numberFormat: v,
      };
    },
  );
  K(
    g,
    "Core/Renderer/RendererUtilities.js",
    [g["Core/Utilities.js"]],
    function (a) {
      var g = a.clamp,
        x = a.pick,
        E = a.stableSort,
        D;
      (function (a) {
        function v(a, t, n) {
          var f = a,
            c = f.reducedLen || t,
            l = function (c, e) {
              return (e.rank || 0) - (c.rank || 0);
            },
            m = function (c, e) {
              return c.target - e.target;
            },
            e,
            u = !0,
            C = [],
            J = 0;
          for (e = a.length; e--; ) J += a[e].size;
          if (J > c) {
            E(a, l);
            for (J = e = 0; J <= c; ) (J += a[e].size), e++;
            C = a.splice(e - 1, a.length);
          }
          E(a, m);
          for (
            a = a.map(function (c) {
              return {
                size: c.size,
                targets: [c.target],
                align: x(c.align, 0.5),
              };
            });
            u;

          ) {
            for (e = a.length; e--; )
              (c = a[e]),
                (l =
                  (Math.min.apply(0, c.targets) +
                    Math.max.apply(0, c.targets)) /
                  2),
                (c.pos = g(l - c.size * c.align, 0, t - c.size));
            e = a.length;
            for (u = !1; e--; )
              0 < e &&
                a[e - 1].pos + a[e - 1].size > a[e].pos &&
                ((a[e - 1].size += a[e].size),
                (a[e - 1].targets = a[e - 1].targets.concat(a[e].targets)),
                (a[e - 1].align = 0.5),
                a[e - 1].pos + a[e - 1].size > t &&
                  (a[e - 1].pos = t - a[e - 1].size),
                a.splice(e, 1),
                (u = !0));
          }
          f.push.apply(f, C);
          e = 0;
          a.some(function (c) {
            var m = 0;
            return (c.targets || []).some(function () {
              f[e].pos = c.pos + m;
              if (
                "undefined" !== typeof n &&
                Math.abs(f[e].pos - f[e].target) > n
              )
                return (
                  f.slice(0, e + 1).forEach(function (c) {
                    return delete c.pos;
                  }),
                  (f.reducedLen = (f.reducedLen || t) - 0.1 * t),
                  f.reducedLen > 0.1 * t && v(f, t, n),
                  !0
                );
              m += f[e].size;
              e++;
              return !1;
            });
          });
          E(f, m);
          return f;
        }
        a.distribute = v;
      })(D || (D = {}));
      return D;
    },
  );
  K(
    g,
    "Core/Renderer/SVG/SVGElement.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Color/Color.js"],
      g["Core/Globals.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E) {
      var v = a.animate,
        B = a.animObject,
        G = a.stop,
        r = x.deg2rad,
        t = x.doc,
        n = x.svg,
        f = x.SVG_NS,
        c = x.win,
        l = E.addEvent,
        m = E.attr,
        e = E.createElement,
        u = E.css,
        C = E.defined,
        J = E.erase,
        I = E.extend,
        L = E.fireEvent,
        A = E.isArray,
        d = E.isFunction,
        q = E.isString,
        h = E.merge,
        k = E.objectEach,
        b = E.pick,
        p = E.pInt,
        z = E.syncTimeout,
        w = E.uniqueKey;
      a = (function () {
        function a() {
          this.element = void 0;
          this.onEvents = {};
          this.opacity = 1;
          this.renderer = void 0;
          this.SVG_NS = f;
          this.symbolCustomAttribs =
            "x y width height r start end innerR anchorX anchorY rounded".split(
              " ",
            );
        }
        a.prototype._defaultGetter = function (d) {
          d = b(
            this[d + "Value"],
            this[d],
            this.element ? this.element.getAttribute(d) : null,
            0,
          );
          /^[\-0-9\.]+$/.test(d) && (d = parseFloat(d));
          return d;
        };
        a.prototype._defaultSetter = function (b, d, h) {
          h.setAttribute(d, b);
        };
        a.prototype.add = function (b) {
          var d = this.renderer,
            h = this.element;
          b && (this.parentGroup = b);
          "undefined" !== typeof this.textStr &&
            "text" === this.element.nodeName &&
            d.buildText(this);
          this.added = !0;
          if (!b || b.handleZ || this.zIndex) var c = this.zIndexSetter();
          c || (b ? b.element : d.box).appendChild(h);
          if (this.onAdd) this.onAdd();
          return this;
        };
        a.prototype.addClass = function (b, d) {
          var h = d ? "" : this.attr("class") || "";
          b = (b || "")
            .split(/ /g)
            .reduce(
              function (b, d) {
                -1 === h.indexOf(d) && b.push(d);
                return b;
              },
              h ? [h] : [],
            )
            .join(" ");
          b !== h && this.attr("class", b);
          return this;
        };
        a.prototype.afterSetters = function () {
          this.doTransform && (this.updateTransform(), (this.doTransform = !1));
        };
        a.prototype.align = function (d, h, c) {
          var k = {},
            e = this.renderer,
            y = e.alignedObjects,
            p,
            H,
            a;
          if (d) {
            if (
              ((this.alignOptions = d), (this.alignByTranslate = h), !c || q(c))
            )
              (this.alignTo = p = c || "renderer"),
                J(y, this),
                y.push(this),
                (c = void 0);
          } else
            (d = this.alignOptions),
              (h = this.alignByTranslate),
              (p = this.alignTo);
          c = b(c, e[p], "scrollablePlotBox" === p ? e.plotBox : void 0, e);
          p = d.align;
          var w = d.verticalAlign;
          e = (c.x || 0) + (d.x || 0);
          y = (c.y || 0) + (d.y || 0);
          "right" === p ? (H = 1) : "center" === p && (H = 2);
          H && (e += (c.width - (d.width || 0)) / H);
          k[h ? "translateX" : "x"] = Math.round(e);
          "bottom" === w ? (a = 1) : "middle" === w && (a = 2);
          a && (y += (c.height - (d.height || 0)) / a);
          k[h ? "translateY" : "y"] = Math.round(y);
          this[this.placed ? "animate" : "attr"](k);
          this.placed = !0;
          this.alignAttr = k;
          return this;
        };
        a.prototype.alignSetter = function (b) {
          var d = { left: "start", center: "middle", right: "end" };
          d[b] &&
            ((this.alignValue = b),
            this.element.setAttribute("text-anchor", d[b]));
        };
        a.prototype.animate = function (d, h, c) {
          var e = this,
            p = B(b(h, this.renderer.globalAnimation, !0));
          h = p.defer;
          b(t.hidden, t.msHidden, t.webkitHidden, !1) && (p.duration = 0);
          0 !== p.duration
            ? (c && (p.complete = c),
              z(function () {
                e.element && v(e, d, p);
              }, h))
            : (this.attr(d, void 0, c || p.complete),
              k(
                d,
                function (b, d) {
                  p.step &&
                    p.step.call(this, b, { prop: d, pos: 1, elem: this });
                },
                this,
              ));
          return this;
        };
        a.prototype.applyTextOutline = function (b) {
          var d = this.element;
          -1 !== b.indexOf("contrast") &&
            (b = b.replace(
              /contrast/g,
              this.renderer.getContrast(d.style.fill),
            ));
          var h = b.split(" ");
          b = h[h.length - 1];
          if ((h = h[0]) && "none" !== h && x.svg) {
            this.fakeTS = !0;
            h = h.replace(/(^[\d\.]+)(.*?)$/g, function (b, d, h) {
              return 2 * Number(d) + h;
            });
            this.removeTextOutline();
            var c = t.createElementNS(f, "tspan");
            m(c, {
              class: "highcharts-text-outline",
              fill: b,
              stroke: b,
              "stroke-width": h,
              "stroke-linejoin": "round",
            });
            b = d.querySelector("textPath") || d;
            [].forEach.call(b.childNodes, function (b) {
              var d = b.cloneNode(!0);
              d.removeAttribute &&
                ["fill", "stroke", "stroke-width", "stroke"].forEach(
                  function (b) {
                    return d.removeAttribute(b);
                  },
                );
              c.appendChild(d);
            });
            var k = 0;
            [].forEach.call(b.querySelectorAll("text tspan"), function (b) {
              k += Number(b.getAttribute("dy"));
            });
            h = t.createElementNS(f, "tspan");
            h.textContent = "\u200b";
            m(h, { x: Number(d.getAttribute("x")), dy: -k });
            c.appendChild(h);
            b.insertBefore(c, b.firstChild);
          }
        };
        a.prototype.attr = function (b, d, h, c) {
          var p = this.element,
            y = this.symbolCustomAttribs,
            e,
            a = this,
            w,
            H;
          if ("string" === typeof b && "undefined" !== typeof d) {
            var F = b;
            b = {};
            b[F] = d;
          }
          "string" === typeof b
            ? (a = (this[b + "Getter"] || this._defaultGetter).call(this, b, p))
            : (k(
                b,
                function (d, h) {
                  w = !1;
                  c || G(this, h);
                  this.symbolName &&
                    -1 !== y.indexOf(h) &&
                    (e || (this.symbolAttr(b), (e = !0)), (w = !0));
                  !this.rotation ||
                    ("x" !== h && "y" !== h) ||
                    (this.doTransform = !0);
                  w ||
                    ((H = this[h + "Setter"] || this._defaultSetter),
                    H.call(this, d, h, p),
                    !this.styledMode &&
                      this.shadows &&
                      /^(width|height|visibility|x|y|d|transform|cx|cy|r)$/.test(
                        h,
                      ) &&
                      this.updateShadows(h, d, H));
                },
                this,
              ),
              this.afterSetters());
          h && h.call(this);
          return a;
        };
        a.prototype.clip = function (b) {
          return this.attr(
            "clip-path",
            b ? "url(" + this.renderer.url + "#" + b.id + ")" : "none",
          );
        };
        a.prototype.crisp = function (b, d) {
          d = d || b.strokeWidth || 0;
          var h = (Math.round(d) % 2) / 2;
          b.x = Math.floor(b.x || this.x || 0) + h;
          b.y = Math.floor(b.y || this.y || 0) + h;
          b.width = Math.floor((b.width || this.width || 0) - 2 * h);
          b.height = Math.floor((b.height || this.height || 0) - 2 * h);
          C(b.strokeWidth) && (b.strokeWidth = d);
          return b;
        };
        a.prototype.complexColor = function (b, d, c) {
          var p = this.renderer,
            e,
            y,
            a,
            m,
            f,
            H,
            F,
            z,
            M,
            q,
            l = [],
            u;
          L(this.renderer, "complexColor", { args: arguments }, function () {
            b.radialGradient
              ? (y = "radialGradient")
              : b.linearGradient && (y = "linearGradient");
            if (y) {
              a = b[y];
              f = p.gradients;
              H = b.stops;
              M = c.radialReference;
              A(a) &&
                (b[y] = a =
                  {
                    x1: a[0],
                    y1: a[1],
                    x2: a[2],
                    y2: a[3],
                    gradientUnits: "userSpaceOnUse",
                  });
              "radialGradient" === y &&
                M &&
                !C(a.gradientUnits) &&
                ((m = a),
                (a = h(a, p.getRadialAttr(M, m), {
                  gradientUnits: "userSpaceOnUse",
                })));
              k(a, function (b, d) {
                "id" !== d && l.push(d, b);
              });
              k(H, function (b) {
                l.push(b);
              });
              l = l.join(",");
              if (f[l]) q = f[l].attr("id");
              else {
                a.id = q = w();
                var T = (f[l] = p.createElement(y).attr(a).add(p.defs));
                T.radAttr = m;
                T.stops = [];
                H.forEach(function (b) {
                  0 === b[1].indexOf("rgba")
                    ? ((e = g.parse(b[1])),
                      (F = e.get("rgb")),
                      (z = e.get("a")))
                    : ((F = b[1]), (z = 1));
                  b = p
                    .createElement("stop")
                    .attr({ offset: b[0], "stop-color": F, "stop-opacity": z })
                    .add(T);
                  T.stops.push(b);
                });
              }
              u = "url(" + p.url + "#" + q + ")";
              c.setAttribute(d, u);
              c.gradient = l;
              b.toString = function () {
                return u;
              };
            }
          });
        };
        a.prototype.css = function (b) {
          var d = this.styles,
            c = {},
            e = this.element,
            a = !d;
          b.color && (b.fill = b.color);
          d &&
            k(b, function (b, h) {
              d && d[h] !== b && ((c[h] = b), (a = !0));
            });
          if (a) {
            d && (b = I(d, c));
            if (null === b.width || "auto" === b.width) delete this.textWidth;
            else if ("text" === e.nodeName.toLowerCase() && b.width)
              var y = (this.textWidth = p(b.width));
            this.styles = b;
            y && !n && this.renderer.forExport && delete b.width;
            var w = h(b);
            e.namespaceURI === this.SVG_NS &&
              ["textOutline", "textOverflow", "width"].forEach(function (b) {
                return w && delete w[b];
              });
            u(e, w);
            this.added &&
              ("text" === this.element.nodeName &&
                this.renderer.buildText(this),
              b.textOutline && this.applyTextOutline(b.textOutline));
          }
          return this;
        };
        a.prototype.dashstyleSetter = function (d) {
          var h = this["stroke-width"];
          "inherit" === h && (h = 1);
          if ((d = d && d.toLowerCase())) {
            var c = d
              .replace("shortdashdotdot", "3,1,1,1,1,1,")
              .replace("shortdashdot", "3,1,1,1")
              .replace("shortdot", "1,1,")
              .replace("shortdash", "3,1,")
              .replace("longdash", "8,3,")
              .replace(/dot/g, "1,3,")
              .replace("dash", "4,3,")
              .replace(/,$/, "")
              .split(",");
            for (d = c.length; d--; ) c[d] = "" + p(c[d]) * b(h, NaN);
            d = c.join(",").replace(/NaN/g, "none");
            this.element.setAttribute("stroke-dasharray", d);
          }
        };
        a.prototype.destroy = function () {
          var b = this,
            d = b.element || {},
            h = b.renderer,
            c = d.ownerSVGElement,
            p = (h.isSVG && "SPAN" === d.nodeName && b.parentGroup) || void 0;
          d.onclick =
            d.onmouseout =
            d.onmouseover =
            d.onmousemove =
            d.point =
              null;
          G(b);
          if (b.clipPath && c) {
            var y = b.clipPath;
            [].forEach.call(
              c.querySelectorAll("[clip-path],[CLIP-PATH]"),
              function (b) {
                -1 < b.getAttribute("clip-path").indexOf(y.element.id) &&
                  b.removeAttribute("clip-path");
              },
            );
            b.clipPath = y.destroy();
          }
          if (b.stops) {
            for (c = 0; c < b.stops.length; c++) b.stops[c].destroy();
            b.stops.length = 0;
            b.stops = void 0;
          }
          b.safeRemoveChild(d);
          for (
            h.styledMode || b.destroyShadows();
            p && p.div && 0 === p.div.childNodes.length;

          )
            (d = p.parentGroup),
              b.safeRemoveChild(p.div),
              delete p.div,
              (p = d);
          b.alignTo && J(h.alignedObjects, b);
          k(b, function (d, h) {
            b[h] && b[h].parentGroup === b && b[h].destroy && b[h].destroy();
            delete b[h];
          });
        };
        a.prototype.destroyShadows = function () {
          (this.shadows || []).forEach(function (b) {
            this.safeRemoveChild(b);
          }, this);
          this.shadows = void 0;
        };
        a.prototype.dSetter = function (b, d, h) {
          A(b) &&
            ("string" === typeof b[0] && (b = this.renderer.pathToSegments(b)),
            (this.pathArray = b),
            (b = b.reduce(function (b, d, h) {
              return d && d.join
                ? (h ? b + " " : "") + d.join(" ")
                : (d || "").toString();
            }, "")));
          /(NaN| {2}|^$)/.test(b) && (b = "M 0 0");
          this[d] !== b && (h.setAttribute(d, b), (this[d] = b));
        };
        a.prototype.fadeOut = function (d) {
          var h = this;
          h.animate(
            { opacity: 0 },
            {
              duration: b(d, 150),
              complete: function () {
                h.hide();
              },
            },
          );
        };
        a.prototype.fillSetter = function (b, d, h) {
          "string" === typeof b
            ? h.setAttribute(d, b)
            : b && this.complexColor(b, d, h);
        };
        a.prototype.getBBox = function (h, c) {
          var k = this.alignValue,
            p = this.element,
            e = this.renderer,
            y = this.styles,
            w = this.textStr,
            m = e.cache,
            f = e.cacheKeys,
            z = p.namespaceURI === this.SVG_NS;
          c = b(c, this.rotation, 0);
          var F = e.styledMode
              ? p && a.prototype.getStyle.call(p, "font-size")
              : y && y.fontSize,
            q;
          if (C(w)) {
            var M = w.toString();
            -1 === M.indexOf("<") && (M = M.replace(/[0-9]/g, "0"));
            M += [
              "",
              c,
              F,
              this.textWidth,
              k,
              y && y.textOverflow,
              y && y.fontWeight,
            ].join();
          }
          M && !h && (q = m[M]);
          if (!q) {
            if (z || e.forExport) {
              try {
                var l =
                  this.fakeTS &&
                  function (b) {
                    var d = p.querySelector(".highcharts-text-outline");
                    d && u(d, { display: b });
                  };
                d(l) && l("none");
                q = p.getBBox
                  ? I({}, p.getBBox())
                  : {
                      width: p.offsetWidth,
                      height: p.offsetHeight,
                      x: 0,
                      y: 0,
                    };
                d(l) && l("");
              } catch (U) {
                ("");
              }
              if (!q || 0 > q.width) q = { x: 0, y: 0, width: 0, height: 0 };
            } else q = this.htmlGetBBox();
            if (
              e.isSVG &&
              ((e = q.width),
              (h = q.height),
              z &&
                (q.height = h =
                  { "11px,17": 14, "13px,20": 16 }[
                    "" + (F || "") + ",".concat(Math.round(h))
                  ] || h),
              c)
            ) {
              z = Number(p.getAttribute("y") || 0) - q.y;
              k = { right: 1, center: 0.5 }[k || 0] || 0;
              y = c * r;
              F = (c - 90) * r;
              var H = e * Math.cos(y);
              c = e * Math.sin(y);
              l = Math.cos(F);
              y = Math.sin(F);
              e = q.x + k * (e - H) + z * l;
              F = e + H;
              l = F - h * l;
              H = l - H;
              z = q.y + z - k * c + z * y;
              k = z + c;
              h = k - h * y;
              c = h - c;
              q.x = Math.min(e, F, l, H);
              q.y = Math.min(z, k, h, c);
              q.width = Math.max(e, F, l, H) - q.x;
              q.height = Math.max(z, k, h, c) - q.y;
            }
            if (M && ("" === w || 0 < q.height)) {
              for (; 250 < f.length; ) delete m[f.shift()];
              m[M] || f.push(M);
              m[M] = q;
            }
          }
          return q;
        };
        a.prototype.getStyle = function (b) {
          return c
            .getComputedStyle(this.element || this, "")
            .getPropertyValue(b);
        };
        a.prototype.hasClass = function (b) {
          return -1 !== ("" + this.attr("class")).split(" ").indexOf(b);
        };
        a.prototype.hide = function () {
          return this.attr({ visibility: "hidden" });
        };
        a.prototype.htmlGetBBox = function () {
          return { height: 0, width: 0, x: 0, y: 0 };
        };
        a.prototype.init = function (b, d) {
          this.element =
            "span" === d ? e(d) : t.createElementNS(this.SVG_NS, d);
          this.renderer = b;
          L(this, "afterInit");
        };
        a.prototype.on = function (b, d) {
          var h = this.onEvents;
          if (h[b]) h[b]();
          h[b] = l(this.element, b, d);
          return this;
        };
        a.prototype.opacitySetter = function (b, d, h) {
          this.opacity = b = Number(Number(b).toFixed(3));
          h.setAttribute(d, b);
        };
        a.prototype.removeClass = function (b) {
          return this.attr(
            "class",
            ("" + this.attr("class"))
              .replace(q(b) ? new RegExp("(^| )".concat(b, "( |$)")) : b, " ")
              .replace(/ +/g, " ")
              .trim(),
          );
        };
        a.prototype.removeTextOutline = function () {
          var b = this.element.querySelector("tspan.highcharts-text-outline");
          b && this.safeRemoveChild(b);
        };
        a.prototype.safeRemoveChild = function (b) {
          var d = b.parentNode;
          d && d.removeChild(b);
        };
        a.prototype.setRadialReference = function (b) {
          var d =
            this.element.gradient &&
            this.renderer.gradients[this.element.gradient];
          this.element.radialReference = b;
          d &&
            d.radAttr &&
            d.animate(this.renderer.getRadialAttr(b, d.radAttr));
          return this;
        };
        a.prototype.setTextPath = function (b, d) {
          var c = this;
          d = h(
            !0,
            {
              enabled: !0,
              attributes: { dy: -5, startOffset: "50%", textAnchor: "middle" },
            },
            d,
          );
          var k = this.renderer.url,
            p = this.text || this,
            y = p.textPath,
            e = d.attributes,
            a = d.enabled;
          b = b || (y && y.path);
          y && y.undo();
          b && a
            ? ((d = l(p, "afterModifyTree", function (d) {
                if (b && a) {
                  var h = b.attr("id");
                  h || b.attr("id", (h = w()));
                  var y = { x: 0, y: 0 };
                  C(e.dx) && ((y.dx = e.dx), delete e.dx);
                  C(e.dy) && ((y.dy = e.dy), delete e.dy);
                  p.attr(y);
                  c.attr({ transform: "" });
                  c.box && (c.box = c.box.destroy());
                  y = d.nodes.slice(0);
                  d.nodes.length = 0;
                  d.nodes[0] = {
                    tagName: "textPath",
                    attributes: I(e, {
                      "text-anchor": e.textAnchor,
                      href: "" + k + "#".concat(h),
                    }),
                    children: y,
                  };
                }
              })),
              (p.textPath = { path: b, undo: d }))
            : (p.attr({ dx: 0, dy: 0 }), delete p.textPath);
          this.added && ((p.textCache = ""), this.renderer.buildText(p));
          return this;
        };
        a.prototype.shadow = function (b, d, h) {
          var c = [],
            p = this.element,
            y = this.oldShadowOptions,
            e = this.parentGroup,
            a = e && 90 === e.rotation;
          e = {
            color: "#000000",
            offsetX: a ? -1 : 1,
            offsetY: a ? -1 : 1,
            opacity: 0.15,
            width: 3,
          };
          var w = !1,
            q;
          !0 === b ? (q = e) : "object" === typeof b && (q = I(e, b));
          q &&
            (q &&
              y &&
              k(q, function (b, d) {
                b !== y[d] && (w = !0);
              }),
            w && this.destroyShadows(),
            (this.oldShadowOptions = q));
          if (!q) this.destroyShadows();
          else if (!this.shadows) {
            e = q.opacity / q.width;
            var F = a
              ? "translate(".concat(q.offsetY, ", ").concat(q.offsetX, ")")
              : "translate(".concat(q.offsetX, ", ").concat(q.offsetY, ")");
            for (a = 1; a <= q.width; a++) {
              var f = p.cloneNode(!1);
              var z = 2 * q.width + 1 - 2 * a;
              m(f, {
                stroke: b.color || "#000000",
                "stroke-opacity": e * a,
                "stroke-width": z,
                transform: F,
                fill: "none",
              });
              f.setAttribute(
                "class",
                (f.getAttribute("class") || "") + " highcharts-shadow",
              );
              h &&
                (m(f, "height", Math.max(m(f, "height") - z, 0)),
                (f.cutHeight = z));
              d
                ? d.element.appendChild(f)
                : p.parentNode && p.parentNode.insertBefore(f, p);
              c.push(f);
            }
            this.shadows = c;
          }
          return this;
        };
        a.prototype.show = function (b) {
          void 0 === b && (b = !0);
          return this.attr({ visibility: b ? "inherit" : "visible" });
        };
        a.prototype["stroke-widthSetter"] = function (b, d, h) {
          this[d] = b;
          h.setAttribute(d, b);
        };
        a.prototype.strokeWidth = function () {
          if (!this.renderer.styledMode) return this["stroke-width"] || 0;
          var b = this.getStyle("stroke-width"),
            d = 0;
          if (b.indexOf("px") === b.length - 2) d = p(b);
          else if ("" !== b) {
            var h = t.createElementNS(f, "rect");
            m(h, { width: b, "stroke-width": 0 });
            this.element.parentNode.appendChild(h);
            d = h.getBBox().width;
            h.parentNode.removeChild(h);
          }
          return d;
        };
        a.prototype.symbolAttr = function (d) {
          var h = this;
          "x y r start end width height innerR anchorX anchorY clockwise"
            .split(" ")
            .forEach(function (c) {
              h[c] = b(d[c], h[c]);
            });
          h.attr({
            d: h.renderer.symbols[h.symbolName](h.x, h.y, h.width, h.height, h),
          });
        };
        a.prototype.textSetter = function (b) {
          b !== this.textStr &&
            (delete this.textPxLength,
            (this.textStr = b),
            this.added && this.renderer.buildText(this));
        };
        a.prototype.titleSetter = function (d) {
          var h = this.element,
            c =
              h.getElementsByTagName("title")[0] ||
              t.createElementNS(this.SVG_NS, "title");
          h.insertBefore ? h.insertBefore(c, h.firstChild) : h.appendChild(c);
          c.textContent = String(b(d, ""))
            .replace(/<[^>]*>/g, "")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">");
        };
        a.prototype.toFront = function () {
          var b = this.element;
          b.parentNode.appendChild(b);
          return this;
        };
        a.prototype.translate = function (b, d) {
          return this.attr({ translateX: b, translateY: d });
        };
        a.prototype.updateShadows = function (b, d, h) {
          var c = this.shadows;
          if (c)
            for (var k = c.length; k--; )
              h.call(
                c[k],
                "height" === b
                  ? Math.max(d - (c[k].cutHeight || 0), 0)
                  : "d" === b
                    ? this.d
                    : d,
                b,
                c[k],
              );
        };
        a.prototype.updateTransform = function () {
          var d = this.element,
            h = this.matrix,
            c = this.rotation;
          c = void 0 === c ? 0 : c;
          var k = this.scaleX,
            p = this.scaleY,
            y = this.translateX,
            e = this.translateY;
          y = [
            "translate(" +
              (void 0 === y ? 0 : y) +
              "," +
              (void 0 === e ? 0 : e) +
              ")",
          ];
          C(h) && y.push("matrix(" + h.join(",") + ")");
          c &&
            y.push(
              "rotate(" +
                c +
                " " +
                b(this.rotationOriginX, d.getAttribute("x"), 0) +
                " " +
                b(this.rotationOriginY, d.getAttribute("y") || 0) +
                ")",
            );
          (C(k) || C(p)) && y.push("scale(" + b(k, 1) + " " + b(p, 1) + ")");
          y.length &&
            !(this.text || this).textPath &&
            d.setAttribute("transform", y.join(" "));
        };
        a.prototype.visibilitySetter = function (b, d, h) {
          "inherit" === b
            ? h.removeAttribute(d)
            : this[d] !== b && h.setAttribute(d, b);
          this[d] = b;
        };
        a.prototype.xGetter = function (b) {
          "circle" === this.element.nodeName &&
            ("x" === b ? (b = "cx") : "y" === b && (b = "cy"));
          return this._defaultGetter(b);
        };
        a.prototype.zIndexSetter = function (b, d) {
          var h = this.renderer,
            c = this.parentGroup,
            k = (c || h).element || h.box,
            y = this.element;
          h = k === h.box;
          var e = !1;
          var a = this.added;
          var w;
          C(b)
            ? (y.setAttribute("data-z-index", b),
              (b = +b),
              this[d] === b && (a = !1))
            : C(this[d]) && y.removeAttribute("data-z-index");
          this[d] = b;
          if (a) {
            (b = this.zIndex) && c && (c.handleZ = !0);
            d = k.childNodes;
            for (w = d.length - 1; 0 <= w && !e; w--) {
              c = d[w];
              a = c.getAttribute("data-z-index");
              var q = !C(a);
              if (c !== y)
                if (0 > b && q && !h && !w) k.insertBefore(y, d[w]), (e = !0);
                else if (p(a) <= b || (q && (!C(b) || 0 <= b)))
                  k.insertBefore(y, d[w + 1] || null), (e = !0);
            }
            e || (k.insertBefore(y, d[h ? 3 : 0] || null), (e = !0));
          }
          return e;
        };
        return a;
      })();
      a.prototype.strokeSetter = a.prototype.fillSetter;
      a.prototype.yGetter = a.prototype.xGetter;
      a.prototype.matrixSetter =
        a.prototype.rotationOriginXSetter =
        a.prototype.rotationOriginYSetter =
        a.prototype.rotationSetter =
        a.prototype.scaleXSetter =
        a.prototype.scaleYSetter =
        a.prototype.translateXSetter =
        a.prototype.translateYSetter =
        a.prototype.verticalAlignSetter =
          function (b, d) {
            this[d] = b;
            this.doTransform = !0;
          };
      ("");
      return a;
    },
  );
  K(
    g,
    "Core/Renderer/RendererRegistry.js",
    [g["Core/Globals.js"]],
    function (a) {
      var g;
      (function (g) {
        g.rendererTypes = {};
        var v;
        g.getRendererType = function (a) {
          void 0 === a && (a = v);
          return g.rendererTypes[a] || g.rendererTypes[v];
        };
        g.registerRendererType = function (x, B, E) {
          g.rendererTypes[x] = B;
          if (!v || E) (v = x), (a.Renderer = B);
        };
      })(g || (g = {}));
      return g;
    },
  );
  K(
    g,
    "Core/Renderer/SVG/SVGLabel.js",
    [g["Core/Renderer/SVG/SVGElement.js"], g["Core/Utilities.js"]],
    function (a, g) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (f, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (c, a) {
                    c.__proto__ = a;
                  }) ||
                function (c, a) {
                  for (var e in a) a.hasOwnProperty(e) && (c[e] = a[e]);
                };
              return a(f, c);
            };
            return function (f, c) {
              function l() {
                this.constructor = f;
              }
              a(f, c);
              f.prototype =
                null === c
                  ? Object.create(c)
                  : ((l.prototype = c.prototype), new l());
            };
          })(),
        E = g.defined,
        D = g.extend,
        B = g.isNumber,
        G = g.merge,
        r = g.pick,
        t = g.removeEvent;
      return (function (g) {
        function f(c, a, m, e, u, C, n, I, r, A) {
          var d = g.call(this) || this;
          d.paddingLeftSetter = d.paddingSetter;
          d.paddingRightSetter = d.paddingSetter;
          d.init(c, "g");
          d.textStr = a;
          d.x = m;
          d.y = e;
          d.anchorX = C;
          d.anchorY = n;
          d.baseline = r;
          d.className = A;
          d.addClass(
            "button" === A ? "highcharts-no-tooltip" : "highcharts-label",
          );
          A && d.addClass("highcharts-" + A);
          d.text = c.text(void 0, 0, 0, I).attr({ zIndex: 1 });
          var q;
          "string" === typeof u &&
            ((q = /^url\((.*?)\)$/.test(u)) || d.renderer.symbols[u]) &&
            (d.symbolKey = u);
          d.bBox = f.emptyBBox;
          d.padding = 3;
          d.baselineOffset = 0;
          d.needsBox = c.styledMode || q;
          d.deferredAttr = {};
          d.alignFactor = 0;
          return d;
        }
        v(f, g);
        f.prototype.alignSetter = function (c) {
          c = { left: 0, center: 0.5, right: 1 }[c];
          c !== this.alignFactor &&
            ((this.alignFactor = c),
            this.bBox && B(this.xSetting) && this.attr({ x: this.xSetting }));
        };
        f.prototype.anchorXSetter = function (c, a) {
          this.anchorX = c;
          this.boxAttr(
            a,
            Math.round(c) - this.getCrispAdjust() - this.xSetting,
          );
        };
        f.prototype.anchorYSetter = function (c, a) {
          this.anchorY = c;
          this.boxAttr(a, c - this.ySetting);
        };
        f.prototype.boxAttr = function (c, a) {
          this.box ? this.box.attr(c, a) : (this.deferredAttr[c] = a);
        };
        f.prototype.css = function (c) {
          if (c) {
            var l = {};
            c = G(c);
            f.textProps.forEach(function (e) {
              "undefined" !== typeof c[e] && ((l[e] = c[e]), delete c[e]);
            });
            this.text.css(l);
            var m = "width" in l;
            "fontSize" in l || "fontWeight" in l
              ? this.updateTextPadding()
              : m && this.updateBoxSize();
          }
          return a.prototype.css.call(this, c);
        };
        f.prototype.destroy = function () {
          t(this.element, "mouseenter");
          t(this.element, "mouseleave");
          this.text && this.text.destroy();
          this.box && (this.box = this.box.destroy());
          a.prototype.destroy.call(this);
        };
        f.prototype.fillSetter = function (c, a) {
          c && (this.needsBox = !0);
          this.fill = c;
          this.boxAttr(a, c);
        };
        f.prototype.getBBox = function () {
          this.textStr &&
            0 === this.bBox.width &&
            0 === this.bBox.height &&
            this.updateBoxSize();
          var c = this.padding,
            a = r(this.paddingLeft, c);
          return {
            width: this.width,
            height: this.height,
            x: this.bBox.x - a,
            y: this.bBox.y - c,
          };
        };
        f.prototype.getCrispAdjust = function () {
          return this.renderer.styledMode && this.box
            ? (this.box.strokeWidth() % 2) / 2
            : ((this["stroke-width"] ? parseInt(this["stroke-width"], 10) : 0) %
                2) /
                2;
        };
        f.prototype.heightSetter = function (c) {
          this.heightSetting = c;
        };
        f.prototype.onAdd = function () {
          this.text.add(this);
          this.attr({
            text: r(this.textStr, ""),
            x: this.x || 0,
            y: this.y || 0,
          });
          this.box &&
            E(this.anchorX) &&
            this.attr({ anchorX: this.anchorX, anchorY: this.anchorY });
        };
        f.prototype.paddingSetter = function (c, a) {
          B(c)
            ? c !== this[a] && ((this[a] = c), this.updateTextPadding())
            : (this[a] = void 0);
        };
        f.prototype.rSetter = function (c, a) {
          this.boxAttr(a, c);
        };
        f.prototype.shadow = function (c) {
          c &&
            !this.renderer.styledMode &&
            (this.updateBoxSize(), this.box && this.box.shadow(c));
          return this;
        };
        f.prototype.strokeSetter = function (c, a) {
          this.stroke = c;
          this.boxAttr(a, c);
        };
        f.prototype["stroke-widthSetter"] = function (c, a) {
          c && (this.needsBox = !0);
          this["stroke-width"] = c;
          this.boxAttr(a, c);
        };
        f.prototype["text-alignSetter"] = function (c) {
          this.textAlign = c;
        };
        f.prototype.textSetter = function (c) {
          "undefined" !== typeof c && this.text.attr({ text: c });
          this.updateTextPadding();
        };
        f.prototype.updateBoxSize = function () {
          var c = this.text,
            a = c.element.style,
            m = {},
            e = this.padding,
            u = (this.bBox =
              (B(this.widthSetting) &&
                B(this.heightSetting) &&
                !this.textAlign) ||
              !E(c.textStr)
                ? f.emptyBBox
                : c.getBBox());
          this.width = this.getPaddedWidth();
          this.height = (this.heightSetting || u.height || 0) + 2 * e;
          a = this.renderer.fontMetrics(a && a.fontSize, c);
          this.baselineOffset =
            e +
            Math.min((this.text.firstLineMetrics || a).b, u.height || Infinity);
          this.heightSetting &&
            (this.baselineOffset += (this.heightSetting - a.h) / 2);
          this.needsBox &&
            !c.textPath &&
            (this.box ||
              ((c = this.box =
                this.symbolKey
                  ? this.renderer.symbol(this.symbolKey)
                  : this.renderer.rect()),
              c.addClass(
                ("button" === this.className ? "" : "highcharts-label-box") +
                  (this.className
                    ? " highcharts-" + this.className + "-box"
                    : ""),
              ),
              c.add(this)),
            (c = this.getCrispAdjust()),
            (m.x = c),
            (m.y = (this.baseline ? -this.baselineOffset : 0) + c),
            (m.width = Math.round(this.width)),
            (m.height = Math.round(this.height)),
            this.box.attr(D(m, this.deferredAttr)),
            (this.deferredAttr = {}));
        };
        f.prototype.updateTextPadding = function () {
          var c = this.text;
          if (!c.textPath) {
            this.updateBoxSize();
            var a = this.baseline ? 0 : this.baselineOffset,
              f = r(this.paddingLeft, this.padding);
            E(this.widthSetting) &&
              this.bBox &&
              ("center" === this.textAlign || "right" === this.textAlign) &&
              (f +=
                { center: 0.5, right: 1 }[this.textAlign] *
                (this.widthSetting - this.bBox.width));
            if (f !== c.x || a !== c.y)
              c.attr("x", f),
                c.hasBoxWidthChanged && (this.bBox = c.getBBox(!0)),
                "undefined" !== typeof a && c.attr("y", a);
            c.x = f;
            c.y = a;
          }
        };
        f.prototype.widthSetter = function (c) {
          this.widthSetting = B(c) ? c : void 0;
        };
        f.prototype.getPaddedWidth = function () {
          var c = this.padding,
            a = r(this.paddingLeft, c);
          c = r(this.paddingRight, c);
          return (this.widthSetting || this.bBox.width || 0) + a + c;
        };
        f.prototype.xSetter = function (c) {
          this.x = c;
          this.alignFactor &&
            ((c -= this.alignFactor * this.getPaddedWidth()),
            (this["forceAnimate:x"] = !0));
          this.xSetting = Math.round(c);
          this.attr("translateX", this.xSetting);
        };
        f.prototype.ySetter = function (c) {
          this.ySetting = this.y = Math.round(c);
          this.attr("translateY", this.ySetting);
        };
        f.emptyBBox = { width: 0, height: 0, x: 0, y: 0 };
        f.textProps =
          "color direction fontFamily fontSize fontStyle fontWeight lineHeight textAlign textDecoration textOutline textOverflow width".split(
            " ",
          );
        return f;
      })(a);
    },
  );
  K(g, "Core/Renderer/SVG/Symbols.js", [g["Core/Utilities.js"]], function (a) {
    function g(a, g, n, f, c) {
      var l = [];
      if (c) {
        var m = c.start || 0,
          e = G(c.r, n);
        n = G(c.r, f || n);
        var u = (c.end || 0) - 0.001;
        f = c.innerR;
        var C = G(c.open, 0.001 > Math.abs((c.end || 0) - m - 2 * Math.PI)),
          J = Math.cos(m),
          I = Math.sin(m),
          r = Math.cos(u),
          A = Math.sin(u);
        m = G(c.longArc, 0.001 > u - m - Math.PI ? 0 : 1);
        l.push(
          ["M", a + e * J, g + n * I],
          ["A", e, n, 0, m, G(c.clockwise, 1), a + e * r, g + n * A],
        );
        D(f) &&
          l.push(
            C ? ["M", a + f * r, g + f * A] : ["L", a + f * r, g + f * A],
            [
              "A",
              f,
              f,
              0,
              m,
              D(c.clockwise) ? 1 - c.clockwise : 0,
              a + f * J,
              g + f * I,
            ],
          );
        C || l.push(["Z"]);
      }
      return l;
    }
    function x(a, g, n, f, c) {
      return c && c.r
        ? E(a, g, n, f, c)
        : [
            ["M", a, g],
            ["L", a + n, g],
            ["L", a + n, g + f],
            ["L", a, g + f],
            ["Z"],
          ];
    }
    function E(a, g, n, f, c) {
      c = (c && c.r) || 0;
      return [
        ["M", a + c, g],
        ["L", a + n - c, g],
        ["C", a + n, g, a + n, g, a + n, g + c],
        ["L", a + n, g + f - c],
        ["C", a + n, g + f, a + n, g + f, a + n - c, g + f],
        ["L", a + c, g + f],
        ["C", a, g + f, a, g + f, a, g + f - c],
        ["L", a, g + c],
        ["C", a, g, a, g, a + c, g],
      ];
    }
    var D = a.defined,
      B = a.isNumber,
      G = a.pick;
    return {
      arc: g,
      callout: function (a, g, n, f, c) {
        var l = Math.min((c && c.r) || 0, n, f),
          m = l + 6,
          e = c && c.anchorX;
        c = (c && c.anchorY) || 0;
        var u = E(a, g, n, f, { r: l });
        if (!B(e)) return u;
        a + e >= n
          ? c > g + m && c < g + f - m
            ? u.splice(
                3,
                1,
                ["L", a + n, c - 6],
                ["L", a + n + 6, c],
                ["L", a + n, c + 6],
                ["L", a + n, g + f - l],
              )
            : u.splice(
                3,
                1,
                ["L", a + n, f / 2],
                ["L", e, c],
                ["L", a + n, f / 2],
                ["L", a + n, g + f - l],
              )
          : 0 >= a + e
            ? c > g + m && c < g + f - m
              ? u.splice(
                  7,
                  1,
                  ["L", a, c + 6],
                  ["L", a - 6, c],
                  ["L", a, c - 6],
                  ["L", a, g + l],
                )
              : u.splice(
                  7,
                  1,
                  ["L", a, f / 2],
                  ["L", e, c],
                  ["L", a, f / 2],
                  ["L", a, g + l],
                )
            : c && c > f && e > a + m && e < a + n - m
              ? u.splice(
                  5,
                  1,
                  ["L", e + 6, g + f],
                  ["L", e, g + f + 6],
                  ["L", e - 6, g + f],
                  ["L", a + l, g + f],
                )
              : c &&
                0 > c &&
                e > a + m &&
                e < a + n - m &&
                u.splice(
                  1,
                  1,
                  ["L", e - 6, g],
                  ["L", e, g - 6],
                  ["L", e + 6, g],
                  ["L", n - l, g],
                );
        return u;
      },
      circle: function (a, t, n, f) {
        return g(a + n / 2, t + f / 2, n / 2, f / 2, {
          start: 0.5 * Math.PI,
          end: 2.5 * Math.PI,
          open: !1,
        });
      },
      diamond: function (a, g, n, f) {
        return [
          ["M", a + n / 2, g],
          ["L", a + n, g + f / 2],
          ["L", a + n / 2, g + f],
          ["L", a, g + f / 2],
          ["Z"],
        ];
      },
      rect: x,
      roundedRect: E,
      square: x,
      triangle: function (a, g, n, f) {
        return [
          ["M", a + n / 2, g],
          ["L", a + n, g + f],
          ["L", a, g + f],
          ["Z"],
        ];
      },
      "triangle-down": function (a, g, n, f) {
        return [["M", a, g], ["L", a + n, g], ["L", a + n / 2, g + f], ["Z"]];
      },
    };
  });
  K(
    g,
    "Core/Renderer/SVG/TextBuilder.js",
    [
      g["Core/Renderer/HTML/AST.js"],
      g["Core/Globals.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v = g.doc,
        D = g.SVG_NS,
        B = g.win,
        G = x.attr,
        r = x.extend,
        t = x.fireEvent,
        n = x.isString,
        f = x.objectEach,
        c = x.pick;
      return (function () {
        function l(c) {
          var a = c.styles;
          this.renderer = c.renderer;
          this.svgElement = c;
          this.width = c.textWidth;
          this.textLineHeight = a && a.lineHeight;
          this.textOutline = a && a.textOutline;
          this.ellipsis = !(!a || "ellipsis" !== a.textOverflow);
          this.noWrap = !(!a || "nowrap" !== a.whiteSpace);
          this.fontSize = a && a.fontSize;
        }
        l.prototype.buildSVG = function () {
          var f = this.svgElement,
            e = f.element,
            u = f.renderer,
            l = c(f.textStr, "").toString(),
            g = -1 !== l.indexOf("<"),
            I = e.childNodes;
          u = this.width && !f.added && u.box;
          var L = /<br.*?>/g,
            A = [
              l,
              this.ellipsis,
              this.noWrap,
              this.textLineHeight,
              this.textOutline,
              this.fontSize,
              this.width,
            ].join();
          if (A !== f.textCache) {
            f.textCache = A;
            delete f.actualWidth;
            for (A = I.length; A--; ) e.removeChild(I[A]);
            g ||
            this.ellipsis ||
            this.width ||
            f.textPath ||
            (-1 !== l.indexOf(" ") && (!this.noWrap || L.test(l)))
              ? "" !== l &&
                (u && u.appendChild(e),
                (l = new a(l)),
                this.modifyTree(l.nodes),
                l.addToDOM(e),
                this.modifyDOM(),
                this.ellipsis &&
                  -1 !== (e.textContent || "").indexOf("\u2026") &&
                  f.attr(
                    "title",
                    this.unescapeEntities(f.textStr || "", ["&lt;", "&gt;"]),
                  ),
                u && u.removeChild(e))
              : e.appendChild(v.createTextNode(this.unescapeEntities(l)));
            n(this.textOutline) &&
              f.applyTextOutline &&
              f.applyTextOutline(this.textOutline);
          }
        };
        l.prototype.modifyDOM = function () {
          var c = this,
            a = this.svgElement,
            f = G(a.element, "x");
          a.firstLineMetrics = void 0;
          for (var l; (l = a.element.firstChild); )
            if (/^[\s\u200B]*$/.test(l.textContent || " "))
              a.element.removeChild(l);
            else break;
          [].forEach.call(
            a.element.querySelectorAll("tspan.highcharts-br"),
            function (e, d) {
              e.nextSibling &&
                e.previousSibling &&
                (0 === d &&
                  1 === e.previousSibling.nodeType &&
                  (a.firstLineMetrics = a.renderer.fontMetrics(
                    void 0,
                    e.previousSibling,
                  )),
                G(e, { dy: c.getLineHeight(e.nextSibling), x: f }));
            },
          );
          var g = this.width || 0;
          if (g) {
            var n = function (e, d) {
                var q = e.textContent || "",
                  h = q.replace(/([^\^])-/g, "$1- ").split(" "),
                  k =
                    !c.noWrap &&
                    (1 < h.length || 1 < a.element.childNodes.length),
                  b = c.getLineHeight(d),
                  p = 0,
                  z = a.actualWidth;
                if (c.ellipsis)
                  q &&
                    c.truncate(
                      e,
                      q,
                      void 0,
                      0,
                      Math.max(0, g - parseInt(c.fontSize || 12, 10)),
                      function (b, d) {
                        return b.substring(0, d) + "\u2026";
                      },
                    );
                else if (k) {
                  q = [];
                  for (k = []; d.firstChild && d.firstChild !== e; )
                    k.push(d.firstChild), d.removeChild(d.firstChild);
                  for (; h.length; )
                    h.length &&
                      !c.noWrap &&
                      0 < p &&
                      (q.push(e.textContent || ""),
                      (e.textContent = h.join(" ").replace(/- /g, "-"))),
                      c.truncate(
                        e,
                        void 0,
                        h,
                        0 === p ? z || 0 : 0,
                        g,
                        function (b, d) {
                          return h.slice(0, d).join(" ").replace(/- /g, "-");
                        },
                      ),
                      (z = a.actualWidth),
                      p++;
                  k.forEach(function (b) {
                    d.insertBefore(b, e);
                  });
                  q.forEach(function (h) {
                    d.insertBefore(v.createTextNode(h), e);
                    h = v.createElementNS(D, "tspan");
                    h.textContent = "\u200b";
                    G(h, { dy: b, x: f });
                    d.insertBefore(h, e);
                  });
                }
              },
              L = function (c) {
                [].slice.call(c.childNodes).forEach(function (d) {
                  d.nodeType === B.Node.TEXT_NODE
                    ? n(d, c)
                    : (-1 !== d.className.baseVal.indexOf("highcharts-br") &&
                        (a.actualWidth = 0),
                      L(d));
                });
              };
            L(a.element);
          }
        };
        l.prototype.getLineHeight = function (c) {
          var a;
          c = c.nodeType === B.Node.TEXT_NODE ? c.parentElement : c;
          this.renderer.styledMode ||
            (a =
              c && /(px|em)$/.test(c.style.fontSize)
                ? c.style.fontSize
                : this.fontSize || this.renderer.style.fontSize || 12);
          return this.textLineHeight
            ? parseInt(this.textLineHeight.toString(), 10)
            : this.renderer.fontMetrics(a, c || this.svgElement.element).h;
        };
        l.prototype.modifyTree = function (c) {
          var a = this,
            f = function (e, l) {
              var m = e.attributes;
              m = void 0 === m ? {} : m;
              var u = e.children,
                g = e.style;
              g = void 0 === g ? {} : g;
              var d = e.tagName,
                q = a.renderer.styledMode;
              if ("b" === d || "strong" === d)
                q
                  ? (m["class"] = "highcharts-strong")
                  : (g.fontWeight = "bold");
              else if ("i" === d || "em" === d)
                q
                  ? (m["class"] = "highcharts-emphasized")
                  : (g.fontStyle = "italic");
              g && g.color && (g.fill = g.color);
              "br" === d
                ? ((m["class"] = "highcharts-br"),
                  (e.textContent = "\u200b"),
                  (l = c[l + 1]) &&
                    l.textContent &&
                    (l.textContent = l.textContent.replace(/^ +/gm, "")))
                : "a" === d &&
                  u &&
                  u.some(function (d) {
                    return "#text" === d.tagName;
                  }) &&
                  (e.children = [{ children: u, tagName: "tspan" }]);
              "#text" !== d && "a" !== d && (e.tagName = "tspan");
              r(e, { attributes: m, style: g });
              u &&
                u
                  .filter(function (d) {
                    return "#text" !== d.tagName;
                  })
                  .forEach(f);
            };
          c.forEach(f);
          t(this.svgElement, "afterModifyTree", { nodes: c });
        };
        l.prototype.truncate = function (c, a, f, l, g, n) {
          var e = this.svgElement,
            m = e.renderer,
            d = e.rotation,
            q = [],
            h = f ? 1 : 0,
            k = (a || f || "").length,
            b = k,
            p,
            z = function (b, d) {
              d = d || b;
              var h = c.parentNode;
              if (h && "undefined" === typeof q[d])
                if (h.getSubStringLength)
                  try {
                    q[d] = l + h.getSubStringLength(0, f ? d + 1 : d);
                  } catch (Q) {
                    ("");
                  }
                else
                  m.getSpanWidth &&
                    ((c.textContent = n(a || f, b)),
                    (q[d] = l + m.getSpanWidth(e, c)));
              return q[d];
            };
          e.rotation = 0;
          var w = z(c.textContent.length);
          if (l + w > g) {
            for (; h <= k; )
              (b = Math.ceil((h + k) / 2)),
                f && (p = n(f, b)),
                (w = z(b, p && p.length - 1)),
                h === k ? (h = k + 1) : w > g ? (k = b - 1) : (h = b);
            0 === k
              ? (c.textContent = "")
              : (a && k === a.length - 1) ||
                (c.textContent = p || n(a || f, b));
          }
          f && f.splice(0, b);
          e.actualWidth = w;
          e.rotation = d;
        };
        l.prototype.unescapeEntities = function (c, a) {
          f(this.renderer.escapes, function (e, f) {
            (a && -1 !== a.indexOf(e)) ||
              (c = c.toString().replace(new RegExp(e, "g"), f));
          });
          return c;
        };
        return l;
      })();
    },
  );
  K(
    g,
    "Core/Renderer/SVG/SVGRenderer.js",
    [
      g["Core/Renderer/HTML/AST.js"],
      g["Core/Color/Color.js"],
      g["Core/Globals.js"],
      g["Core/Renderer/RendererRegistry.js"],
      g["Core/Renderer/SVG/SVGElement.js"],
      g["Core/Renderer/SVG/SVGLabel.js"],
      g["Core/Renderer/SVG/Symbols.js"],
      g["Core/Renderer/SVG/TextBuilder.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B, G, r, t) {
      var n = x.charts,
        f = x.deg2rad,
        c = x.doc,
        l = x.isFirefox,
        m = x.isMS,
        e = x.isWebKit,
        u = x.noop,
        C = x.SVG_NS,
        J = x.symbolSizes,
        I = x.win,
        L = t.addEvent,
        A = t.attr,
        d = t.createElement,
        q = t.css,
        h = t.defined,
        k = t.destroyObjectProperties,
        b = t.extend,
        p = t.isArray,
        z = t.isNumber,
        w = t.isObject,
        N = t.isString,
        H = t.merge,
        O = t.pick,
        Q = t.pInt,
        v = t.uniqueKey,
        Y;
      x = (function () {
        function y(b, d, h, c, a, y, k) {
          this.width =
            this.url =
            this.style =
            this.isSVG =
            this.imgCount =
            this.height =
            this.gradients =
            this.globalAnimation =
            this.defs =
            this.chartIndex =
            this.cacheKeys =
            this.cache =
            this.boxWrapper =
            this.box =
            this.alignedObjects =
              void 0;
          this.init(b, d, h, c, a, y, k);
        }
        y.prototype.init = function (b, d, h, a, y, k, e) {
          var F = this.createElement("svg").attr({
              version: "1.1",
              class: "highcharts-root",
            }),
            p = F.element;
          e || F.css(this.getStyle(a));
          b.appendChild(p);
          A(b, "dir", "ltr");
          -1 === b.innerHTML.indexOf("xmlns") && A(p, "xmlns", this.SVG_NS);
          this.isSVG = !0;
          this.box = p;
          this.boxWrapper = F;
          this.alignedObjects = [];
          this.url = this.getReferenceURL();
          this.createElement("desc")
            .add()
            .element.appendChild(
              c.createTextNode("Created with Highcharts 10.3.2"),
            );
          this.defs = this.createElement("defs").add();
          this.allowHTML = k;
          this.forExport = y;
          this.styledMode = e;
          this.gradients = {};
          this.cache = {};
          this.cacheKeys = [];
          this.imgCount = 0;
          this.setSize(d, h, !1);
          var f;
          l &&
            b.getBoundingClientRect &&
            ((d = function () {
              q(b, { left: 0, top: 0 });
              f = b.getBoundingClientRect();
              q(b, {
                left: Math.ceil(f.left) - f.left + "px",
                top: Math.ceil(f.top) - f.top + "px",
              });
            }),
            d(),
            (this.unSubPixelFix = L(I, "resize", d)));
        };
        y.prototype.definition = function (b) {
          return new a([b]).addToDOM(this.defs.element);
        };
        y.prototype.getReferenceURL = function () {
          if ((l || e) && c.getElementsByTagName("base").length) {
            if (!h(Y)) {
              var b = v();
              b = new a([
                {
                  tagName: "svg",
                  attributes: { width: 8, height: 8 },
                  children: [
                    {
                      tagName: "defs",
                      children: [
                        {
                          tagName: "clipPath",
                          attributes: { id: b },
                          children: [
                            {
                              tagName: "rect",
                              attributes: { width: 4, height: 4 },
                            },
                          ],
                        },
                      ],
                    },
                    {
                      tagName: "rect",
                      attributes: {
                        id: "hitme",
                        width: 8,
                        height: 8,
                        "clip-path": "url(#".concat(b, ")"),
                        fill: "rgba(0,0,0,0.001)",
                      },
                    },
                  ],
                },
              ]).addToDOM(c.body);
              q(b, { position: "fixed", top: 0, left: 0, zIndex: 9e5 });
              var d = c.elementFromPoint(6, 6);
              Y = "hitme" === (d && d.id);
              c.body.removeChild(b);
            }
            if (Y)
              return I.location.href
                .split("#")[0]
                .replace(/<[^>]*>/g, "")
                .replace(/([\('\)])/g, "\\$1")
                .replace(/ /g, "%20");
          }
          return "";
        };
        y.prototype.getStyle = function (d) {
          return (this.style = b(
            {
              fontFamily:
                '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
              fontSize: "12px",
            },
            d,
          ));
        };
        y.prototype.setStyle = function (b) {
          this.boxWrapper.css(this.getStyle(b));
        };
        y.prototype.isHidden = function () {
          return !this.boxWrapper.getBBox().width;
        };
        y.prototype.destroy = function () {
          var b = this.defs;
          this.box = null;
          this.boxWrapper = this.boxWrapper.destroy();
          k(this.gradients || {});
          this.gradients = null;
          b && (this.defs = b.destroy());
          this.unSubPixelFix && this.unSubPixelFix();
          return (this.alignedObjects = null);
        };
        y.prototype.createElement = function (b) {
          var d = new this.Element();
          d.init(this, b);
          return d;
        };
        y.prototype.getRadialAttr = function (b, d) {
          return {
            cx: b[0] - b[2] / 2 + (d.cx || 0) * b[2],
            cy: b[1] - b[2] / 2 + (d.cy || 0) * b[2],
            r: (d.r || 0) * b[2],
          };
        };
        y.prototype.buildText = function (b) {
          new r(b).buildSVG();
        };
        y.prototype.getContrast = function (b) {
          b = g.parse(b).rgba.map(function (b) {
            b /= 255;
            return 0.03928 >= b
              ? b / 12.92
              : Math.pow((b + 0.055) / 1.055, 2.4);
          });
          b = 0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2];
          return 1.05 / (b + 0.05) > (b + 0.05) / 0.05 ? "#FFFFFF" : "#000000";
        };
        y.prototype.button = function (d, h, c, y, k, e, p, f, q, z) {
          void 0 === k && (k = {});
          var F = this.label(d, h, c, q, void 0, void 0, z, void 0, "button"),
            l = this.styledMode;
          d = k.states || {};
          var M = 0;
          k = H(k);
          delete k.states;
          var u = H(
            { color: "#333333", cursor: "pointer", fontWeight: "normal" },
            k.style,
          );
          delete k.style;
          var g = a.filterUserAttributes(k);
          F.attr(H({ padding: 8, r: 2 }, g));
          if (!l) {
            g = H({ fill: "#f7f7f7", stroke: "#cccccc", "stroke-width": 1 }, g);
            e = H(
              g,
              { fill: "#e6e6e6" },
              a.filterUserAttributes(e || d.hover || {}),
            );
            var P = e.style;
            delete e.style;
            p = H(
              g,
              {
                fill: "#e6ebf5",
                style: { color: "#000000", fontWeight: "bold" },
              },
              a.filterUserAttributes(p || d.select || {}),
            );
            var T = p.style;
            delete p.style;
            f = H(
              g,
              { style: { color: "#cccccc" } },
              a.filterUserAttributes(f || d.disabled || {}),
            );
            var A = f.style;
            delete f.style;
          }
          L(F.element, m ? "mouseover" : "mouseenter", function () {
            3 !== M && F.setState(1);
          });
          L(F.element, m ? "mouseout" : "mouseleave", function () {
            3 !== M && F.setState(M);
          });
          F.setState = function (b) {
            1 !== b && (F.state = M = b);
            F.removeClass(
              /highcharts-button-(normal|hover|pressed|disabled)/,
            ).addClass(
              "highcharts-button-" +
                ["normal", "hover", "pressed", "disabled"][b || 0],
            );
            l ||
              (F.attr([g, e, p, f][b || 0]),
              (b = [u, P, T, A][b || 0]),
              w(b) && F.css(b));
          };
          l ||
            (F.attr(g).css(b({ cursor: "default" }, u)),
            z && F.text.css({ pointerEvents: "none" }));
          return F.on("touchstart", function (b) {
            return b.stopPropagation();
          }).on("click", function (b) {
            3 !== M && y.call(F, b);
          });
        };
        y.prototype.crispLine = function (b, d, c) {
          void 0 === c && (c = "round");
          var a = b[0],
            y = b[1];
          h(a[1]) &&
            a[1] === y[1] &&
            (a[1] = y[1] = Math[c](a[1]) - (d % 2) / 2);
          h(a[2]) &&
            a[2] === y[2] &&
            (a[2] = y[2] = Math[c](a[2]) + (d % 2) / 2);
          return b;
        };
        y.prototype.path = function (d) {
          var h = this.styledMode ? {} : { fill: "none" };
          p(d) ? (h.d = d) : w(d) && b(h, d);
          return this.createElement("path").attr(h);
        };
        y.prototype.circle = function (b, d, h) {
          b = w(b) ? b : "undefined" === typeof b ? {} : { x: b, y: d, r: h };
          d = this.createElement("circle");
          d.xSetter = d.ySetter = function (b, d, h) {
            h.setAttribute("c" + d, b);
          };
          return d.attr(b);
        };
        y.prototype.arc = function (b, d, h, c, a, y) {
          w(b)
            ? ((c = b), (d = c.y), (h = c.r), (b = c.x))
            : (c = { innerR: c, start: a, end: y });
          b = this.symbol("arc", b, d, h, h, c);
          b.r = h;
          return b;
        };
        y.prototype.rect = function (b, d, h, c, a, y) {
          a = w(b) ? b.r : a;
          var k = this.createElement("rect");
          b = w(b)
            ? b
            : "undefined" === typeof b
              ? {}
              : { x: b, y: d, width: Math.max(h, 0), height: Math.max(c, 0) };
          this.styledMode ||
            ("undefined" !== typeof y &&
              ((b["stroke-width"] = y), (b = k.crisp(b))),
            (b.fill = "none"));
          a && (b.r = a);
          k.rSetter = function (b, d, h) {
            k.r = b;
            A(h, { rx: b, ry: b });
          };
          k.rGetter = function () {
            return k.r || 0;
          };
          return k.attr(b);
        };
        y.prototype.setSize = function (b, d, h) {
          this.width = b;
          this.height = d;
          this.boxWrapper.animate(
            { width: b, height: d },
            {
              step: function () {
                this.attr({
                  viewBox:
                    "0 0 " + this.attr("width") + " " + this.attr("height"),
                });
              },
              duration: O(h, !0) ? void 0 : 0,
            },
          );
          this.alignElements();
        };
        y.prototype.g = function (b) {
          var d = this.createElement("g");
          return b ? d.attr({ class: "highcharts-" + b }) : d;
        };
        y.prototype.image = function (b, d, h, c, a, y) {
          var k = { preserveAspectRatio: "none" },
            e = function (b, d) {
              b.setAttributeNS
                ? b.setAttributeNS("http://www.w3.org/1999/xlink", "href", d)
                : b.setAttribute("hc-svg-href", d);
            };
          z(d) && (k.x = d);
          z(h) && (k.y = h);
          z(c) && (k.width = c);
          z(a) && (k.height = a);
          var p = this.createElement("image").attr(k);
          d = function (d) {
            e(p.element, b);
            y.call(p, d);
          };
          y
            ? (e(
                p.element,
                "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
              ),
              (h = new I.Image()),
              L(h, "load", d),
              (h.src = b),
              h.complete && d({}))
            : e(p.element, b);
          return p;
        };
        y.prototype.symbol = function (a, y, k, p, e, f) {
          var F = this,
            w = /^url\((.*?)\)$/,
            z = w.test(a),
            l = !z && (this.symbols[a] ? a : "circle"),
            m = l && this.symbols[l],
            u;
          if (m) {
            "number" === typeof y &&
              (u = m.call(
                this.symbols,
                Math.round(y || 0),
                Math.round(k || 0),
                p || 0,
                e || 0,
                f,
              ));
            var g = this.path(u);
            F.styledMode || g.attr("fill", "none");
            b(g, { symbolName: l || void 0, x: y, y: k, width: p, height: e });
            f && b(g, f);
          } else if (z) {
            var P = a.match(w)[1];
            var T = (g = this.image(P));
            T.imgwidth = O(J[P] && J[P].width, f && f.width);
            T.imgheight = O(J[P] && J[P].height, f && f.height);
            var C = function (b) {
              return b.attr({ width: b.width, height: b.height });
            };
            ["width", "height"].forEach(function (b) {
              T[b + "Setter"] = function (b, d) {
                this[d] = b;
                b = this.alignByTranslate;
                var c = this.element,
                  a = this.width,
                  y = this.height,
                  k = this.imgwidth,
                  p = this.imgheight,
                  e = this["img" + d];
                if (h(e)) {
                  var F = 1;
                  f && "within" === f.backgroundSize && a && y
                    ? ((F = Math.min(a / k, y / p)),
                      (e = Math.round(e * F)),
                      A(c, {
                        width: Math.round(k * F),
                        height: Math.round(p * F),
                      }))
                    : c && c.setAttribute(d, e);
                  b ||
                    this.translate(
                      ((a || 0) - e * F) / 2,
                      ((y || 0) - e * F) / 2,
                    );
                }
              };
            });
            h(y) && T.attr({ x: y, y: k });
            T.isImg = !0;
            h(T.imgwidth) && h(T.imgheight)
              ? C(T)
              : (T.attr({ width: 0, height: 0 }),
                d("img", {
                  onload: function () {
                    var b = n[F.chartIndex];
                    0 === this.width &&
                      (q(this, { position: "absolute", top: "-999em" }),
                      c.body.appendChild(this));
                    J[P] = { width: this.width, height: this.height };
                    T.imgwidth = this.width;
                    T.imgheight = this.height;
                    T.element && C(T);
                    this.parentNode && this.parentNode.removeChild(this);
                    F.imgCount--;
                    if (!F.imgCount && b && !b.hasLoaded) b.onload();
                  },
                  src: P,
                }),
                this.imgCount++);
          }
          return g;
        };
        y.prototype.clipRect = function (b, d, h, c) {
          var a = v() + "-",
            y = this.createElement("clipPath").attr({ id: a }).add(this.defs);
          b = this.rect(b, d, h, c, 0).add(y);
          b.id = a;
          b.clipPath = y;
          b.count = 0;
          return b;
        };
        y.prototype.text = function (b, d, c, a) {
          var y = {};
          if (a && (this.allowHTML || !this.forExport))
            return this.html(b, d, c);
          y.x = Math.round(d || 0);
          c && (y.y = Math.round(c));
          h(b) && (y.text = b);
          b = this.createElement("text").attr(y);
          if (!a || (this.forExport && !this.allowHTML))
            b.xSetter = function (b, d, h) {
              for (
                var c = h.getElementsByTagName("tspan"),
                  a = h.getAttribute(d),
                  y = 0,
                  k;
                y < c.length;
                y++
              )
                (k = c[y]), k.getAttribute(d) === a && k.setAttribute(d, b);
              h.setAttribute(d, b);
            };
          return b;
        };
        y.prototype.fontMetrics = function (b, d) {
          b =
            (!this.styledMode && /px/.test(b)) || !I.getComputedStyle
              ? b ||
                (d && d.style && d.style.fontSize) ||
                (this.style && this.style.fontSize)
              : d && D.prototype.getStyle.call(d, "font-size");
          b = /px/.test(b) ? Q(b) : 12;
          d = 24 > b ? b + 3 : Math.round(1.2 * b);
          return { h: d, b: Math.round(0.8 * d), f: b };
        };
        y.prototype.rotCorr = function (b, d, h) {
          var c = b;
          d && h && (c = Math.max(c * Math.cos(d * f), 4));
          return { x: (-b / 3) * Math.sin(d * f), y: c };
        };
        y.prototype.pathToSegments = function (b) {
          for (
            var d = [],
              h = [],
              c = { A: 8, C: 7, H: 2, L: 3, M: 3, Q: 5, S: 5, T: 3, V: 2 },
              a = 0;
            a < b.length;
            a++
          )
            N(h[0]) &&
              z(b[a]) &&
              h.length === c[h[0].toUpperCase()] &&
              b.splice(a, 0, h[0].replace("M", "L").replace("m", "l")),
              "string" === typeof b[a] &&
                (h.length && d.push(h.slice(0)), (h.length = 0)),
              h.push(b[a]);
          d.push(h.slice(0));
          return d;
        };
        y.prototype.label = function (b, d, h, c, a, y, k, e, p) {
          return new B(this, b, d, h, c, a, y, k, e, p);
        };
        y.prototype.alignElements = function () {
          this.alignedObjects.forEach(function (b) {
            return b.align();
          });
        };
        return y;
      })();
      b(x.prototype, {
        Element: D,
        SVG_NS: C,
        escapes: {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        },
        symbols: G,
        draw: u,
      });
      E.registerRendererType("svg", x, !0);
      ("");
      return x;
    },
  );
  K(
    g,
    "Core/Renderer/HTML/HTMLElement.js",
    [
      g["Core/Globals.js"],
      g["Core/Renderer/SVG/SVGElement.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v =
          (this && this.__extends) ||
          (function () {
            var c = function (a, f) {
              c =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (c, a) {
                    c.__proto__ = a;
                  }) ||
                function (c, a) {
                  for (var e in a) a.hasOwnProperty(e) && (c[e] = a[e]);
                };
              return c(a, f);
            };
            return function (a, f) {
              function e() {
                this.constructor = a;
              }
              c(a, f);
              a.prototype =
                null === f
                  ? Object.create(f)
                  : ((e.prototype = f.prototype), new e());
            };
          })(),
        D = a.isFirefox,
        B = a.isMS,
        G = a.isWebKit,
        r = a.win,
        t = x.css,
        n = x.defined,
        f = x.extend,
        c = x.pick,
        l = x.pInt;
      return (function (a) {
        function e() {
          return (null !== a && a.apply(this, arguments)) || this;
        }
        v(e, a);
        e.compose = function (c) {
          if (-1 === e.composedClasses.indexOf(c)) {
            e.composedClasses.push(c);
            var a = e.prototype,
              f = c.prototype;
            f.getSpanCorrection = a.getSpanCorrection;
            f.htmlCss = a.htmlCss;
            f.htmlGetBBox = a.htmlGetBBox;
            f.htmlUpdateTransform = a.htmlUpdateTransform;
            f.setSpanRotation = a.setSpanRotation;
          }
          return c;
        };
        e.prototype.getSpanCorrection = function (c, a, e) {
          this.xCorr = -c * e;
          this.yCorr = -a;
        };
        e.prototype.htmlCss = function (a) {
          var e = "SPAN" === this.element.tagName && a && "width" in a,
            l = c(e && a.width, void 0);
          if (e) {
            delete a.width;
            this.textWidth = l;
            var g = !0;
          }
          a &&
            "ellipsis" === a.textOverflow &&
            ((a.whiteSpace = "nowrap"), (a.overflow = "hidden"));
          this.styles = f(this.styles, a);
          t(this.element, a);
          g && this.htmlUpdateTransform();
          return this;
        };
        e.prototype.htmlGetBBox = function () {
          var c = this.element;
          return {
            x: c.offsetLeft,
            y: c.offsetTop,
            width: c.offsetWidth,
            height: c.offsetHeight,
          };
        };
        e.prototype.htmlUpdateTransform = function () {
          if (this.added) {
            var c = this.renderer,
              a = this.element,
              e = this.translateX || 0,
              f = this.translateY || 0,
              g = this.x || 0,
              m = this.y || 0,
              d = this.textAlign || "left",
              q = { left: 0, center: 0.5, right: 1 }[d],
              h = this.styles;
            h = h && h.whiteSpace;
            t(a, { marginLeft: e, marginTop: f });
            !c.styledMode &&
              this.shadows &&
              this.shadows.forEach(function (b) {
                t(b, { marginLeft: e + 1, marginTop: f + 1 });
              });
            this.inverted &&
              [].forEach.call(a.childNodes, function (b) {
                c.invertChild(b, a);
              });
            if ("SPAN" === a.tagName) {
              var k = this.rotation,
                b = this.textWidth && l(this.textWidth),
                p = [k, d, a.innerHTML, this.textWidth, this.textAlign].join(),
                z = void 0;
              z = !1;
              if (b !== this.oldTextWidth) {
                if (this.textPxLength) var w = this.textPxLength;
                else
                  t(a, { width: "", whiteSpace: h || "nowrap" }),
                    (w = a.offsetWidth);
                (b > this.oldTextWidth || w > b) &&
                  (/[ \-]/.test(a.textContent || a.innerText) ||
                    "ellipsis" === a.style.textOverflow) &&
                  (t(a, {
                    width: w > b || k ? b + "px" : "auto",
                    display: "block",
                    whiteSpace: h || "normal",
                  }),
                  (this.oldTextWidth = b),
                  (z = !0));
              }
              this.hasBoxWidthChanged = z;
              p !== this.cTT &&
                ((z = c.fontMetrics(a.style.fontSize, a).b),
                !n(k) ||
                  (k === (this.oldRotation || 0) && d === this.oldAlign) ||
                  this.setSpanRotation(k, q, z),
                this.getSpanCorrection(
                  (!n(k) && this.textPxLength) || a.offsetWidth,
                  z,
                  q,
                  k,
                  d,
                ));
              t(a, {
                left: g + (this.xCorr || 0) + "px",
                top: m + (this.yCorr || 0) + "px",
              });
              this.cTT = p;
              this.oldRotation = k;
              this.oldAlign = d;
            }
          } else this.alignOnAdd = !0;
        };
        e.prototype.setSpanRotation = function (c, a, e) {
          var f = {},
            l =
              B && !/Edge/.test(r.navigator.userAgent)
                ? "-ms-transform"
                : G
                  ? "-webkit-transform"
                  : D
                    ? "MozTransform"
                    : r.opera
                      ? "-o-transform"
                      : void 0;
          l &&
            ((f[l] = f.transform = "rotate(" + c + "deg)"),
            (f[l + (D ? "Origin" : "-origin")] = f.transformOrigin =
              100 * a + "% " + e + "px"),
            t(this.element, f));
        };
        e.composedClasses = [];
        return e;
      })(g);
    },
  );
  K(
    g,
    "Core/Renderer/HTML/HTMLRenderer.js",
    [
      g["Core/Renderer/HTML/AST.js"],
      g["Core/Renderer/SVG/SVGElement.js"],
      g["Core/Renderer/SVG/SVGRenderer.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (f, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (c, a) {
                    c.__proto__ = a;
                  }) ||
                function (c, a) {
                  for (var e in a) a.hasOwnProperty(e) && (c[e] = a[e]);
                };
              return a(f, c);
            };
            return function (f, c) {
              function l() {
                this.constructor = f;
              }
              a(f, c);
              f.prototype =
                null === c
                  ? Object.create(c)
                  : ((l.prototype = c.prototype), new l());
            };
          })(),
        B = E.attr,
        G = E.createElement,
        r = E.extend,
        t = E.pick;
      return (function (n) {
        function f() {
          return (null !== n && n.apply(this, arguments)) || this;
        }
        v(f, n);
        f.compose = function (c) {
          -1 === f.composedClasses.indexOf(c) &&
            (f.composedClasses.push(c), (c.prototype.html = f.prototype.html));
          return c;
        };
        f.prototype.html = function (c, f, m) {
          var e = this.createElement("span"),
            l = e.element,
            n = e.renderer,
            J = n.isSVG,
            I = function (c, a) {
              ["opacity", "visibility"].forEach(function (d) {
                c[d + "Setter"] = function (e, h, k) {
                  var b = c.div ? c.div.style : a;
                  g.prototype[d + "Setter"].call(this, e, h, k);
                  b && (b[h] = e);
                };
              });
              c.addedSetters = !0;
            };
          e.textSetter = function (c) {
            c !== this.textStr &&
              (delete this.bBox,
              delete this.oldTextWidth,
              a.setElementHTML(this.element, t(c, "")),
              (this.textStr = c),
              (e.doTransform = !0));
          };
          J && I(e, e.element.style);
          e.xSetter =
            e.ySetter =
            e.alignSetter =
            e.rotationSetter =
              function (c, a) {
                "align" === a ? (e.alignValue = e.textAlign = c) : (e[a] = c);
                e.doTransform = !0;
              };
          e.afterSetters = function () {
            this.doTransform &&
              (this.htmlUpdateTransform(), (this.doTransform = !1));
          };
          e.attr({ text: c, x: Math.round(f), y: Math.round(m) }).css({
            position: "absolute",
          });
          n.styledMode ||
            e.css({
              fontFamily: this.style.fontFamily,
              fontSize: this.style.fontSize,
            });
          l.style.whiteSpace = "nowrap";
          e.css = e.htmlCss;
          J &&
            (e.add = function (c) {
              var a = n.box.parentNode,
                d = [];
              if ((this.parentGroup = c)) {
                var f = c.div;
                if (!f) {
                  for (; c; ) d.push(c), (c = c.parentGroup);
                  d.reverse().forEach(function (h) {
                    function c(b, d) {
                      h[d] = b;
                      "translateX" === d
                        ? (q.left = b + "px")
                        : (q.top = b + "px");
                      h.doTransform = !0;
                    }
                    var b = B(h.element, "class"),
                      p = h.styles || {};
                    f = h.div =
                      h.div ||
                      G(
                        "div",
                        b ? { className: b } : void 0,
                        {
                          position: "absolute",
                          left: (h.translateX || 0) + "px",
                          top: (h.translateY || 0) + "px",
                          display: h.display,
                          opacity: h.opacity,
                          cursor: p.cursor,
                          pointerEvents: p.pointerEvents,
                          visibility: h.visibility,
                        },
                        f || a,
                      );
                    var q = f.style;
                    r(h, {
                      classSetter: (function (b) {
                        return function (d) {
                          this.element.setAttribute("class", d);
                          b.className = d;
                        };
                      })(f),
                      on: function () {
                        d[0].div &&
                          e.on.apply(
                            { element: d[0].div, onEvents: h.onEvents },
                            arguments,
                          );
                        return h;
                      },
                      translateXSetter: c,
                      translateYSetter: c,
                    });
                    h.addedSetters || I(h);
                  });
                }
              } else f = a;
              f.appendChild(l);
              e.added = !0;
              e.alignOnAdd && e.htmlUpdateTransform();
              return e;
            });
          return e;
        };
        f.composedClasses = [];
        return f;
      })(x);
    },
  );
  K(g, "Core/Axis/AxisDefaults.js", [], function () {
    var a;
    (function (a) {
      a.defaultXAxisOptions = {
        alignTicks: !0,
        allowDecimals: void 0,
        panningEnabled: !0,
        zIndex: 2,
        zoomEnabled: !0,
        dateTimeLabelFormats: {
          millisecond: { main: "%H:%M:%S.%L", range: !1 },
          second: { main: "%H:%M:%S", range: !1 },
          minute: { main: "%H:%M", range: !1 },
          hour: { main: "%H:%M", range: !1 },
          day: { main: "%e. %b" },
          week: { main: "%e. %b" },
          month: { main: "%b '%y" },
          year: { main: "%Y" },
        },
        endOnTick: !1,
        gridLineDashStyle: "Solid",
        gridZIndex: 1,
        labels: {
          autoRotation: void 0,
          autoRotationLimit: 80,
          distance: void 0,
          enabled: !0,
          indentation: 10,
          overflow: "justify",
          padding: 5,
          reserveSpace: void 0,
          rotation: void 0,
          staggerLines: 0,
          step: 0,
          useHTML: !1,
          x: 0,
          zIndex: 7,
          style: { color: "#666666", cursor: "default", fontSize: "11px" },
        },
        maxPadding: 0.01,
        minorGridLineDashStyle: "Solid",
        minorTickLength: 2,
        minorTickPosition: "outside",
        minPadding: 0.01,
        offset: void 0,
        opposite: !1,
        reversed: void 0,
        reversedStacks: !1,
        showEmpty: !0,
        showFirstLabel: !0,
        showLastLabel: !0,
        startOfWeek: 1,
        startOnTick: !1,
        tickLength: 10,
        tickPixelInterval: 100,
        tickmarkPlacement: "between",
        tickPosition: "outside",
        title: {
          align: "middle",
          rotation: 0,
          useHTML: !1,
          x: 0,
          y: 0,
          style: { color: "#666666" },
        },
        type: "linear",
        uniqueNames: !0,
        visible: !0,
        minorGridLineColor: "#f2f2f2",
        minorGridLineWidth: 1,
        minorTickColor: "#999999",
        lineColor: "#ccd6eb",
        lineWidth: 1,
        gridLineColor: "#e6e6e6",
        gridLineWidth: void 0,
        tickColor: "#ccd6eb",
      };
      a.defaultYAxisOptions = {
        reversedStacks: !0,
        endOnTick: !0,
        maxPadding: 0.05,
        minPadding: 0.05,
        tickPixelInterval: 72,
        showLastLabel: !0,
        labels: { x: -8 },
        startOnTick: !0,
        title: { rotation: 270, text: "Values" },
        stackLabels: {
          animation: {},
          allowOverlap: !1,
          enabled: !1,
          crop: !0,
          overflow: "justify",
          formatter: function () {
            var a = this.axis.chart.numberFormatter;
            return a(this.total || 0, -1);
          },
          style: {
            color: "#000000",
            fontSize: "11px",
            fontWeight: "bold",
            textOutline: "1px contrast",
          },
        },
        gridLineWidth: 1,
        lineWidth: 0,
      };
      a.defaultLeftAxisOptions = {
        labels: { x: -15 },
        title: { rotation: 270 },
      };
      a.defaultRightAxisOptions = {
        labels: { x: 15 },
        title: { rotation: 90 },
      };
      a.defaultBottomAxisOptions = {
        labels: { autoRotation: [-45], x: 0 },
        margin: 15,
        title: { rotation: 0 },
      };
      a.defaultTopAxisOptions = {
        labels: { autoRotation: [-45], x: 0 },
        margin: 15,
        title: { rotation: 0 },
      };
    })(a || (a = {}));
    return a;
  });
  K(g, "Core/Foundation.js", [g["Core/Utilities.js"]], function (a) {
    var g = a.addEvent,
      x = a.isFunction,
      E = a.objectEach,
      D = a.removeEvent,
      B;
    (function (a) {
      a.registerEventOptions = function (a, t) {
        a.eventOptions = a.eventOptions || {};
        E(t.events, function (n, f) {
          a.eventOptions[f] !== n &&
            (a.eventOptions[f] &&
              (D(a, f, a.eventOptions[f]), delete a.eventOptions[f]),
            x(n) && ((a.eventOptions[f] = n), g(a, f, n)));
        });
      };
    })(B || (B = {}));
    return B;
  });
  K(
    g,
    "Core/Axis/Tick.js",
    [
      g["Core/FormatUtilities.js"],
      g["Core/Globals.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v = g.deg2rad,
        D = x.clamp,
        B = x.correctFloat,
        G = x.defined,
        r = x.destroyObjectProperties,
        t = x.extend,
        n = x.fireEvent,
        f = x.isNumber,
        c = x.merge,
        l = x.objectEach,
        m = x.pick;
      g = (function () {
        function e(c, a, e, f, l) {
          this.isNewLabel = this.isNew = !0;
          this.axis = c;
          this.pos = a;
          this.type = e || "";
          this.parameters = l || {};
          this.tickmarkOffset = this.parameters.tickmarkOffset;
          this.options = this.parameters.options;
          n(this, "init");
          e || f || this.addLabel();
        }
        e.prototype.addLabel = function () {
          var c = this,
            e = c.axis,
            l = e.options,
            g = e.chart,
            L = e.categories,
            A = e.logarithmic,
            d = e.names,
            q = c.pos,
            h = m(c.options && c.options.labels, l.labels),
            k = e.tickPositions,
            b = q === k[0],
            p = q === k[k.length - 1],
            z = (!h.step || 1 === h.step) && 1 === e.tickInterval;
          k = k.info;
          var w = c.label,
            N;
          L = this.parameters.category || (L ? m(L[q], d[q], q) : q);
          A && f(L) && (L = B(A.lin2log(L)));
          if (e.dateTime)
            if (k) {
              var H = g.time.resolveDTLFormat(
                l.dateTimeLabelFormats[
                  (!l.grid && k.higherRanks[q]) || k.unitName
                ],
              );
              var O = H.main;
            } else
              f(L) &&
                (O = e.dateTime.getXDateFormat(
                  L,
                  l.dateTimeLabelFormats || {},
                ));
          c.isFirst = b;
          c.isLast = p;
          var Q = {
            axis: e,
            chart: g,
            dateTimeLabelFormat: O,
            isFirst: b,
            isLast: p,
            pos: q,
            tick: c,
            tickPositionInfo: k,
            value: L,
          };
          n(this, "labelFormat", Q);
          var r = function (b) {
            return h.formatter
              ? h.formatter.call(b, b)
              : h.format
                ? ((b.text = e.defaultLabelFormatter.call(b, b)),
                  a.format(h.format, b, g))
                : e.defaultLabelFormatter.call(b, b);
          };
          l = r.call(Q, Q);
          var Y = H && H.list;
          c.shortenLabel = Y
            ? function () {
                for (N = 0; N < Y.length; N++)
                  if (
                    (t(Q, { dateTimeLabelFormat: Y[N] }),
                    w.attr({ text: r.call(Q, Q) }),
                    w.getBBox().width < e.getSlotWidth(c) - 2 * h.padding)
                  )
                    return;
                w.attr({ text: "" });
              }
            : void 0;
          z && e._addedPlotLB && c.moveLabel(l, h);
          G(w) || c.movedLabel
            ? w &&
              w.textStr !== l &&
              !z &&
              (!w.textWidth ||
                h.style.width ||
                w.styles.width ||
                w.css({ width: null }),
              w.attr({ text: l }),
              (w.textPxLength = w.getBBox().width))
            : ((c.label = w = c.createLabel({ x: 0, y: 0 }, l, h)),
              (c.rotation = 0));
        };
        e.prototype.createLabel = function (a, e, f) {
          var l = this.axis,
            g = l.chart;
          if (
            (a =
              G(e) && f.enabled
                ? g.renderer.text(e, a.x, a.y, f.useHTML).add(l.labelGroup)
                : null)
          )
            g.styledMode || a.css(c(f.style)),
              (a.textPxLength = a.getBBox().width);
          return a;
        };
        e.prototype.destroy = function () {
          r(this, this.axis);
        };
        e.prototype.getPosition = function (c, a, e, f) {
          var l = this.axis,
            g = l.chart,
            d = (f && g.oldChartHeight) || g.chartHeight;
          c = {
            x: c
              ? B(l.translate(a + e, void 0, void 0, f) + l.transB)
              : l.left +
                l.offset +
                (l.opposite
                  ? ((f && g.oldChartWidth) || g.chartWidth) - l.right - l.left
                  : 0),
            y: c
              ? d - l.bottom + l.offset - (l.opposite ? l.height : 0)
              : B(d - l.translate(a + e, void 0, void 0, f) - l.transB),
          };
          c.y = D(c.y, -1e5, 1e5);
          n(this, "afterGetPosition", { pos: c });
          return c;
        };
        e.prototype.getLabelPosition = function (c, a, e, f, l, g, d, q) {
          var h = this.axis,
            k = h.transA,
            b =
              h.isLinked && h.linkedParent
                ? h.linkedParent.reversed
                : h.reversed,
            p = h.staggerLines,
            z = h.tickRotCorr || { x: 0, y: 0 },
            w =
              f || h.reserveSpaceDefault
                ? 0
                : -h.labelOffset * ("center" === h.labelAlign ? 0.5 : 1),
            m = {};
          e =
            0 === h.side
              ? e.rotation
                ? -8
                : -e.getBBox().height
              : 2 === h.side
                ? z.y + 8
                : Math.cos(e.rotation * v) *
                  (z.y - e.getBBox(!1, 0).height / 2);
          G(l.y) && (e = 0 === h.side && h.horiz ? l.y + e : l.y);
          c = c + l.x + w + z.x - (g && f ? g * k * (b ? -1 : 1) : 0);
          a = a + e - (g && !f ? g * k * (b ? 1 : -1) : 0);
          p &&
            ((f = (d / (q || 1)) % p),
            h.opposite && (f = p - f - 1),
            (a += (h.labelOffset / p) * f));
          m.x = c;
          m.y = Math.round(a);
          n(this, "afterGetLabelPosition", {
            pos: m,
            tickmarkOffset: g,
            index: d,
          });
          return m;
        };
        e.prototype.getLabelSize = function () {
          return this.label
            ? this.label.getBBox()[this.axis.horiz ? "height" : "width"]
            : 0;
        };
        e.prototype.getMarkPath = function (c, a, e, f, l, g) {
          return g.crispLine(
            [
              ["M", c, a],
              ["L", c + (l ? 0 : -e), a + (l ? e : 0)],
            ],
            f,
          );
        };
        e.prototype.handleOverflow = function (c) {
          var a = this.axis,
            e = a.options.labels,
            f = c.x,
            l = a.chart.chartWidth,
            g = a.chart.spacing,
            d = m(a.labelLeft, Math.min(a.pos, g[3]));
          g = m(
            a.labelRight,
            Math.max(a.isRadial ? 0 : a.pos + a.len, l - g[1]),
          );
          var q = this.label,
            h = this.rotation,
            k = { left: 0, center: 0.5, right: 1 }[
              a.labelAlign || q.attr("align")
            ],
            b = q.getBBox().width,
            p = a.getSlotWidth(this),
            z = {},
            w = p,
            u = 1,
            n;
          if (h || "justify" !== e.overflow)
            0 > h && f - k * b < d
              ? (n = Math.round(f / Math.cos(h * v) - d))
              : 0 < h &&
                f + k * b > g &&
                (n = Math.round((l - f) / Math.cos(h * v)));
          else if (
            ((l = f + (1 - k) * b),
            f - k * b < d
              ? (w = c.x + w * (1 - k) - d)
              : l > g && ((w = g - c.x + w * k), (u = -1)),
            (w = Math.min(p, w)),
            w < p &&
              "center" === a.labelAlign &&
              (c.x += u * (p - w - k * (p - Math.min(b, w)))),
            b > w || (a.autoRotation && (q.styles || {}).width))
          )
            n = w;
          n &&
            (this.shortenLabel
              ? this.shortenLabel()
              : ((z.width = Math.floor(n) + "px"),
                (e.style || {}).textOverflow || (z.textOverflow = "ellipsis"),
                q.css(z)));
        };
        e.prototype.moveLabel = function (c, a) {
          var e = this,
            f = e.label,
            g = e.axis,
            m = g.reversed,
            d = !1;
          f && f.textStr === c
            ? ((e.movedLabel = f), (d = !0), delete e.label)
            : l(g.ticks, function (h) {
                d ||
                  h.isNew ||
                  h === e ||
                  !h.label ||
                  h.label.textStr !== c ||
                  ((e.movedLabel = h.label),
                  (d = !0),
                  (h.labelPos = e.movedLabel.xy),
                  delete h.label);
              });
          if (!d && (e.labelPos || f)) {
            var q = e.labelPos || f.xy;
            f = g.horiz ? (m ? 0 : g.width + g.left) : q.x;
            g = g.horiz ? q.y : m ? g.width + g.left : 0;
            e.movedLabel = e.createLabel({ x: f, y: g }, c, a);
            e.movedLabel && e.movedLabel.attr({ opacity: 0 });
          }
        };
        e.prototype.render = function (c, a, e) {
          var f = this.axis,
            l = f.horiz,
            g = this.pos,
            d = m(this.tickmarkOffset, f.tickmarkOffset);
          g = this.getPosition(l, g, d, a);
          d = g.x;
          var q = g.y;
          f = (l && d === f.pos + f.len) || (!l && q === f.pos) ? -1 : 1;
          l = m(e, this.label && this.label.newOpacity, 1);
          e = m(e, 1);
          this.isActive = !0;
          this.renderGridLine(a, e, f);
          this.renderMark(g, e, f);
          this.renderLabel(g, a, l, c);
          this.isNew = !1;
          n(this, "afterRender");
        };
        e.prototype.renderGridLine = function (c, a, e) {
          var f = this.axis,
            l = f.options,
            g = {},
            d = this.pos,
            q = this.type,
            h = m(this.tickmarkOffset, f.tickmarkOffset),
            k = f.chart.renderer,
            b = this.gridLine,
            p = l.gridLineWidth,
            z = l.gridLineColor,
            w = l.gridLineDashStyle;
          "minor" === this.type &&
            ((p = l.minorGridLineWidth),
            (z = l.minorGridLineColor),
            (w = l.minorGridLineDashStyle));
          b ||
            (f.chart.styledMode ||
              ((g.stroke = z), (g["stroke-width"] = p || 0), (g.dashstyle = w)),
            q || (g.zIndex = 1),
            c && (a = 0),
            (this.gridLine = b =
              k
                .path()
                .attr(g)
                .addClass("highcharts-" + (q ? q + "-" : "") + "grid-line")
                .add(f.gridGroup)));
          if (
            b &&
            (e = f.getPlotLinePath({
              value: d + h,
              lineWidth: b.strokeWidth() * e,
              force: "pass",
              old: c,
            }))
          )
            b[c || this.isNew ? "attr" : "animate"]({ d: e, opacity: a });
        };
        e.prototype.renderMark = function (c, a, e) {
          var f = this.axis,
            l = f.options,
            g = f.chart.renderer,
            d = this.type,
            q = f.tickSize(d ? d + "Tick" : "tick"),
            h = c.x;
          c = c.y;
          var k = m(
            l["minor" !== d ? "tickWidth" : "minorTickWidth"],
            !d && f.isXAxis ? 1 : 0,
          );
          l = l["minor" !== d ? "tickColor" : "minorTickColor"];
          var b = this.mark,
            p = !b;
          q &&
            (f.opposite && (q[0] = -q[0]),
            b ||
              ((this.mark = b =
                g
                  .path()
                  .addClass("highcharts-" + (d ? d + "-" : "") + "tick")
                  .add(f.axisGroup)),
              f.chart.styledMode || b.attr({ stroke: l, "stroke-width": k })),
            b[p ? "attr" : "animate"]({
              d: this.getMarkPath(h, c, q[0], b.strokeWidth() * e, f.horiz, g),
              opacity: a,
            }));
        };
        e.prototype.renderLabel = function (c, a, e, l) {
          var g = this.axis,
            u = g.horiz,
            d = g.options,
            q = this.label,
            h = d.labels,
            k = h.step;
          g = m(this.tickmarkOffset, g.tickmarkOffset);
          var b = c.x;
          c = c.y;
          var p = !0;
          q &&
            f(b) &&
            ((q.xy = c = this.getLabelPosition(b, c, q, u, h, g, l, k)),
            (this.isFirst && !this.isLast && !d.showFirstLabel) ||
            (this.isLast && !this.isFirst && !d.showLastLabel)
              ? (p = !1)
              : !u ||
                h.step ||
                h.rotation ||
                a ||
                0 === e ||
                this.handleOverflow(c),
            k && l % k && (p = !1),
            p && f(c.y)
              ? ((c.opacity = e),
                q[this.isNewLabel ? "attr" : "animate"](c).show(!0),
                (this.isNewLabel = !1))
              : (q.hide(), (this.isNewLabel = !0)));
        };
        e.prototype.replaceMovedLabel = function () {
          var c = this.label,
            a = this.axis,
            e = a.reversed;
          if (c && !this.isNew) {
            var f = a.horiz ? (e ? a.left : a.width + a.left) : c.xy.x;
            e = a.horiz ? c.xy.y : e ? a.width + a.top : a.top;
            c.animate({ x: f, y: e, opacity: 0 }, void 0, c.destroy);
            delete this.label;
          }
          a.isDirty = !0;
          this.label = this.movedLabel;
          delete this.movedLabel;
        };
        return e;
      })();
      ("");
      return g;
    },
  );
  K(
    g,
    "Core/Axis/Axis.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Axis/AxisDefaults.js"],
      g["Core/Color/Color.js"],
      g["Core/Defaults.js"],
      g["Core/Foundation.js"],
      g["Core/Globals.js"],
      g["Core/Axis/Tick.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B, G, r) {
      var t = a.animObject,
        n = E.defaultOptions,
        f = D.registerEventOptions,
        c = B.deg2rad,
        l = r.arrayMax,
        m = r.arrayMin,
        e = r.clamp,
        u = r.correctFloat,
        C = r.defined,
        J = r.destroyObjectProperties,
        I = r.erase,
        v = r.error,
        A = r.extend,
        d = r.fireEvent,
        q = r.isArray,
        h = r.isNumber,
        k = r.isString,
        b = r.merge,
        p = r.normalizeTickInterval,
        z = r.objectEach,
        w = r.pick,
        N = r.relativeLength,
        H = r.removeEvent,
        O = r.splat,
        Q = r.syncTimeout,
        S = function (b, d) {
          return p(
            d,
            void 0,
            void 0,
            w(b.options.allowDecimals, 0.5 > d || void 0 !== b.tickAmount),
            !!b.tickAmount,
          );
        };
      a = (function () {
        function a(b, d) {
          this.zoomEnabled =
            this.width =
            this.visible =
            this.userOptions =
            this.translationSlope =
            this.transB =
            this.transA =
            this.top =
            this.ticks =
            this.tickRotCorr =
            this.tickPositions =
            this.tickmarkOffset =
            this.tickInterval =
            this.tickAmount =
            this.side =
            this.series =
            this.right =
            this.positiveValuesOnly =
            this.pos =
            this.pointRangePadding =
            this.pointRange =
            this.plotLinesAndBandsGroups =
            this.plotLinesAndBands =
            this.paddedTicks =
            this.overlap =
            this.options =
            this.offset =
            this.names =
            this.minPixelPadding =
            this.minorTicks =
            this.minorTickInterval =
            this.min =
            this.maxLabelLength =
            this.max =
            this.len =
            this.left =
            this.labelFormatter =
            this.labelEdge =
            this.isLinked =
            this.height =
            this.hasVisibleSeries =
            this.hasNames =
            this.eventOptions =
            this.coll =
            this.closestPointRange =
            this.chart =
            this.bottom =
            this.alternateBands =
              void 0;
          this.init(b, d);
        }
        a.prototype.init = function (b, a) {
          var c = a.isX;
          this.chart = b;
          this.horiz = b.inverted && !this.isZAxis ? !c : c;
          this.isXAxis = c;
          this.coll = this.coll || (c ? "xAxis" : "yAxis");
          d(this, "init", { userOptions: a });
          this.opposite = w(a.opposite, this.opposite);
          this.side = w(
            a.side,
            this.side,
            this.horiz ? (this.opposite ? 0 : 2) : this.opposite ? 1 : 3,
          );
          this.setOptions(a);
          var e = this.options,
            y = e.labels,
            k = e.type;
          this.userOptions = a;
          this.minPixelPadding = 0;
          this.reversed = w(e.reversed, this.reversed);
          this.visible = e.visible;
          this.zoomEnabled = e.zoomEnabled;
          this.hasNames = "category" === k || !0 === e.categories;
          this.categories = e.categories || (this.hasNames ? [] : void 0);
          this.names || ((this.names = []), (this.names.keys = {}));
          this.plotLinesAndBandsGroups = {};
          this.positiveValuesOnly = !!this.logarithmic;
          this.isLinked = C(e.linkedTo);
          this.ticks = {};
          this.labelEdge = [];
          this.minorTicks = {};
          this.plotLinesAndBands = [];
          this.alternateBands = {};
          this.len = 0;
          this.minRange = this.userMinRange = e.minRange || e.maxZoom;
          this.range = e.range;
          this.offset = e.offset || 0;
          this.min = this.max = null;
          a = w(e.crosshair, O(b.options.tooltip.crosshairs)[c ? 0 : 1]);
          this.crosshair = !0 === a ? {} : a;
          -1 === b.axes.indexOf(this) &&
            (c ? b.axes.splice(b.xAxis.length, 0, this) : b.axes.push(this),
            b[this.coll].push(this));
          this.series = this.series || [];
          b.inverted &&
            !this.isZAxis &&
            c &&
            "undefined" === typeof this.reversed &&
            (this.reversed = !0);
          this.labelRotation = h(y.rotation) ? y.rotation : void 0;
          f(this, e);
          d(this, "afterInit");
        };
        a.prototype.setOptions = function (h) {
          this.options = b(
            g.defaultXAxisOptions,
            "yAxis" === this.coll && g.defaultYAxisOptions,
            [
              g.defaultTopAxisOptions,
              g.defaultRightAxisOptions,
              g.defaultBottomAxisOptions,
              g.defaultLeftAxisOptions,
            ][this.side],
            b(n[this.coll], h),
          );
          d(this, "afterSetOptions", { userOptions: h });
        };
        a.prototype.defaultLabelFormatter = function (b) {
          var d = this.axis;
          b = this.chart.numberFormatter;
          var a = h(this.value) ? this.value : NaN,
            c = d.chart.time,
            e = this.dateTimeLabelFormat,
            k = n.lang,
            y = k.numericSymbols;
          k = k.numericSymbolMagnitude || 1e3;
          var f = d.logarithmic ? Math.abs(a) : d.tickInterval,
            p = y && y.length;
          if (d.categories) var l = "".concat(this.value);
          else if (e) l = c.dateFormat(e, a);
          else if (p && 1e3 <= f)
            for (; p-- && "undefined" === typeof l; )
              (d = Math.pow(k, p + 1)),
                f >= d &&
                  0 === (10 * a) % d &&
                  null !== y[p] &&
                  0 !== a &&
                  (l = b(a / d, -1) + y[p]);
          "undefined" === typeof l &&
            (l = 1e4 <= Math.abs(a) ? b(a, -1) : b(a, -1, void 0, ""));
          return l;
        };
        a.prototype.getSeriesExtremes = function () {
          var b = this,
            a = b.chart,
            c;
          d(this, "getSeriesExtremes", null, function () {
            b.hasVisibleSeries = !1;
            b.dataMin = b.dataMax = b.threshold = null;
            b.softThreshold = !b.isXAxis;
            b.stacking && b.stacking.buildStacks();
            b.series.forEach(function (d) {
              if (d.visible || !a.options.chart.ignoreHiddenSeries) {
                var e = d.options,
                  k = e.threshold;
                b.hasVisibleSeries = !0;
                b.positiveValuesOnly && 0 >= k && (k = null);
                if (b.isXAxis) {
                  if (((e = d.xData), e.length)) {
                    e = b.logarithmic ? e.filter(b.validatePositiveValue) : e;
                    c = d.getXExtremes(e);
                    var y = c.min;
                    var f = c.max;
                    h(y) ||
                      y instanceof Date ||
                      ((e = e.filter(h)),
                      (c = d.getXExtremes(e)),
                      (y = c.min),
                      (f = c.max));
                    e.length &&
                      ((b.dataMin = Math.min(w(b.dataMin, y), y)),
                      (b.dataMax = Math.max(w(b.dataMax, f), f)));
                  }
                } else if (
                  ((d = d.applyExtremes()),
                  h(d.dataMin) &&
                    ((y = d.dataMin),
                    (b.dataMin = Math.min(w(b.dataMin, y), y))),
                  h(d.dataMax) &&
                    ((f = d.dataMax),
                    (b.dataMax = Math.max(w(b.dataMax, f), f))),
                  C(k) && (b.threshold = k),
                  !e.softThreshold || b.positiveValuesOnly)
                )
                  b.softThreshold = !1;
              }
            });
          });
          d(this, "afterGetSeriesExtremes");
        };
        a.prototype.translate = function (b, d, a, c, e, k) {
          var f = this.linkedParent || this,
            y = c && f.old ? f.old.min : f.min;
          if (!h(y)) return NaN;
          var p = f.minPixelPadding;
          e =
            (f.isOrdinal ||
              (f.brokenAxis && f.brokenAxis.hasBreaks) ||
              (f.logarithmic && e)) &&
            f.lin2val;
          var F = 1,
            l = 0;
          c = c && f.old ? f.old.transA : f.transA;
          c || (c = f.transA);
          a && ((F *= -1), (l = f.len));
          f.reversed && ((F *= -1), (l -= F * (f.sector || f.len)));
          d
            ? ((k = (b * F + l - p) / c + y), e && (k = f.lin2val(k)))
            : (e && (b = f.val2lin(b)),
              (b = F * (b - y) * c),
              (k = (f.isRadial ? b : u(b)) + l + F * p + (h(k) ? c * k : 0)));
          return k;
        };
        a.prototype.toPixels = function (b, d) {
          return (
            this.translate(b, !1, !this.horiz, void 0, !0) + (d ? 0 : this.pos)
          );
        };
        a.prototype.toValue = function (b, d) {
          return this.translate(
            b - (d ? 0 : this.pos),
            !0,
            !this.horiz,
            void 0,
            !0,
          );
        };
        a.prototype.getPlotLinePath = function (b) {
          function a(b, d, a) {
            if (("pass" !== n && b < d) || b > a)
              n ? (b = e(b, d, a)) : (C = !0);
            return b;
          }
          var c = this,
            k = c.chart,
            f = c.left,
            y = c.top,
            p = b.old,
            l = b.value,
            g = b.lineWidth,
            q = (p && k.oldChartHeight) || k.chartHeight,
            z = (p && k.oldChartWidth) || k.chartWidth,
            m = c.transB,
            u = b.translatedValue,
            n = b.force,
            A,
            H,
            N,
            O,
            C;
          b = {
            value: l,
            lineWidth: g,
            old: p,
            force: n,
            acrossPanes: b.acrossPanes,
            translatedValue: u,
          };
          d(this, "getPlotLinePath", b, function (b) {
            u = w(u, c.translate(l, void 0, void 0, p));
            u = e(u, -1e5, 1e5);
            A = N = Math.round(u + m);
            H = O = Math.round(q - u - m);
            h(u)
              ? c.horiz
                ? ((H = y), (O = q - c.bottom), (A = N = a(A, f, f + c.width)))
                : ((A = f), (N = z - c.right), (H = O = a(H, y, y + c.height)))
              : ((C = !0), (n = !1));
            b.path =
              C && !n
                ? null
                : k.renderer.crispLine(
                    [
                      ["M", A, H],
                      ["L", N, O],
                    ],
                    g || 1,
                  );
          });
          return b.path;
        };
        a.prototype.getLinearTickPositions = function (b, d, a) {
          var h = u(Math.floor(d / b) * b);
          a = u(Math.ceil(a / b) * b);
          var c = [],
            e;
          u(h + b) === h && (e = 20);
          if (this.single) return [d];
          for (d = h; d <= a; ) {
            c.push(d);
            d = u(d + b, e);
            if (d === k) break;
            var k = d;
          }
          return c;
        };
        a.prototype.getMinorTickInterval = function () {
          var b = this.options;
          return !0 === b.minorTicks
            ? w(b.minorTickInterval, "auto")
            : !1 === b.minorTicks
              ? null
              : b.minorTickInterval;
        };
        a.prototype.getMinorTickPositions = function () {
          var b = this.options,
            d = this.tickPositions,
            a = this.minorTickInterval,
            h = this.pointRangePadding || 0,
            c = this.min - h;
          h = this.max + h;
          var e = h - c,
            k = [];
          if (e && e / a < this.len / 3) {
            var f = this.logarithmic;
            if (f)
              this.paddedTicks.forEach(function (b, d, h) {
                d &&
                  k.push.apply(k, f.getLogTickPositions(a, h[d - 1], h[d], !0));
              });
            else if (this.dateTime && "auto" === this.getMinorTickInterval())
              k = k.concat(
                this.getTimeTicks(
                  this.dateTime.normalizeTimeTickInterval(a),
                  c,
                  h,
                  b.startOfWeek,
                ),
              );
            else
              for (b = c + ((d[0] - c) % a); b <= h && b !== k[0]; b += a)
                k.push(b);
          }
          0 !== k.length && this.trimTicks(k);
          return k;
        };
        a.prototype.adjustForMinRange = function () {
          var b = this.options,
            d = this.logarithmic,
            a = this.min,
            h = this.max,
            c = 0,
            e,
            k,
            f,
            p;
          this.isXAxis &&
            "undefined" === typeof this.minRange &&
            !d &&
            (C(b.min) || C(b.max) || C(b.floor) || C(b.ceiling)
              ? (this.minRange = null)
              : (this.series.forEach(function (b) {
                  f = b.xData;
                  p = b.xIncrement ? 1 : f.length - 1;
                  if (1 < f.length)
                    for (e = p; 0 < e; e--)
                      if (((k = f[e] - f[e - 1]), !c || k < c)) c = k;
                }),
                (this.minRange = Math.min(
                  5 * c,
                  this.dataMax - this.dataMin,
                ))));
          if (h - a < this.minRange) {
            var g = this.dataMax - this.dataMin >= this.minRange;
            var q = this.minRange;
            var z = (q - h + a) / 2;
            z = [a - z, w(b.min, a - z)];
            g &&
              (z[2] = this.logarithmic
                ? this.logarithmic.log2lin(this.dataMin)
                : this.dataMin);
            a = l(z);
            h = [a + q, w(b.max, a + q)];
            g && (h[2] = d ? d.log2lin(this.dataMax) : this.dataMax);
            h = m(h);
            h - a < q && ((z[0] = h - q), (z[1] = w(b.min, h - q)), (a = l(z)));
          }
          this.min = a;
          this.max = h;
        };
        a.prototype.getClosest = function () {
          var b;
          this.categories
            ? (b = 1)
            : this.series.forEach(function (d) {
                var a = d.closestPointRange,
                  h = d.visible || !d.chart.options.chart.ignoreHiddenSeries;
                !d.noSharedTooltip &&
                  C(a) &&
                  h &&
                  (b = C(b) ? Math.min(b, a) : a);
              });
          return b;
        };
        a.prototype.nameToX = function (b) {
          var d = q(this.options.categories),
            a = d ? this.categories : this.names,
            h = b.options.x;
          b.series.requireSorting = !1;
          C(h) ||
            (h =
              this.options.uniqueNames && a
                ? d
                  ? a.indexOf(b.name)
                  : w(a.keys[b.name], -1)
                : b.series.autoIncrement());
          if (-1 === h) {
            if (!d && a) var c = a.length;
          } else c = h;
          "undefined" !== typeof c
            ? ((this.names[c] = b.name), (this.names.keys[b.name] = c))
            : b.x && (c = b.x);
          return c;
        };
        a.prototype.updateNames = function () {
          var b = this,
            d = this.names;
          0 < d.length &&
            (Object.keys(d.keys).forEach(function (b) {
              delete d.keys[b];
            }),
            (d.length = 0),
            (this.minRange = this.userMinRange),
            (this.series || []).forEach(function (d) {
              d.xIncrement = null;
              if (!d.points || d.isDirtyData)
                (b.max = Math.max(b.max, d.xData.length - 1)),
                  d.processData(),
                  d.generatePoints();
              d.data.forEach(function (a, h) {
                if (a && a.options && "undefined" !== typeof a.name) {
                  var c = b.nameToX(a);
                  "undefined" !== typeof c &&
                    c !== a.x &&
                    ((a.x = c), (d.xData[h] = c));
                }
              });
            }));
        };
        a.prototype.setAxisTranslation = function () {
          var b = this,
            a = b.max - b.min,
            h = b.linkedParent,
            c = !!b.categories,
            e = b.isXAxis,
            f = b.axisPointRange || 0,
            p = 0,
            l = 0,
            g = b.transA;
          if (e || c || f) {
            var q = b.getClosest();
            h
              ? ((p = h.minPointOffset), (l = h.pointRangePadding))
              : b.series.forEach(function (d) {
                  var a = c
                      ? 1
                      : e
                        ? w(d.options.pointRange, q, 0)
                        : b.axisPointRange || 0,
                    h = d.options.pointPlacement;
                  f = Math.max(f, a);
                  if (!b.single || c)
                    (d = d.is("xrange") ? !e : e),
                      (p = Math.max(p, d && k(h) ? 0 : a / 2)),
                      (l = Math.max(l, d && "on" === h ? 0 : a));
                });
            h = b.ordinal && b.ordinal.slope && q ? b.ordinal.slope / q : 1;
            b.minPointOffset = p *= h;
            b.pointRangePadding = l *= h;
            b.pointRange = Math.min(f, b.single && c ? 1 : a);
            e && (b.closestPointRange = q);
          }
          b.translationSlope =
            b.transA =
            g =
              b.staticScale || b.len / (a + l || 1);
          b.transB = b.horiz ? b.left : b.bottom;
          b.minPixelPadding = g * p;
          d(this, "afterSetAxisTranslation");
        };
        a.prototype.minFromRange = function () {
          return this.max - this.range;
        };
        a.prototype.setTickInterval = function (b) {
          var a = this.chart,
            c = this.logarithmic,
            e = this.options,
            k = this.isXAxis,
            f = this.isLinked,
            p = e.tickPixelInterval,
            y = this.categories,
            l = this.softThreshold,
            g = e.maxPadding,
            q = e.minPadding,
            z =
              h(e.tickInterval) && 0 <= e.tickInterval
                ? e.tickInterval
                : void 0,
            m = h(this.threshold) ? this.threshold : null;
          this.dateTime || y || f || this.getTickAmount();
          var n = w(this.userMin, e.min);
          var A = w(this.userMax, e.max);
          if (f) {
            this.linkedParent = a[this.coll][e.linkedTo];
            var H = this.linkedParent.getExtremes();
            this.min = w(H.min, H.dataMin);
            this.max = w(H.max, H.dataMax);
            e.type !== this.linkedParent.options.type && v(11, 1, a);
          } else {
            if (l && C(m))
              if (this.dataMin >= m) (H = m), (q = 0);
              else if (this.dataMax <= m) {
                var N = m;
                g = 0;
              }
            this.min = w(n, H, this.dataMin);
            this.max = w(A, N, this.dataMax);
          }
          c &&
            (this.positiveValuesOnly &&
              !b &&
              0 >= Math.min(this.min, w(this.dataMin, this.min)) &&
              v(10, 1, a),
            (this.min = u(c.log2lin(this.min), 16)),
            (this.max = u(c.log2lin(this.max), 16)));
          this.range &&
            C(this.max) &&
            ((this.userMin =
              this.min =
              n =
                Math.max(this.dataMin, this.minFromRange())),
            (this.userMax = A = this.max),
            (this.range = null));
          d(this, "foundExtremes");
          this.beforePadding && this.beforePadding();
          this.adjustForMinRange();
          !(
            y ||
            this.axisPointRange ||
            (this.stacking && this.stacking.usePercentage) ||
            f
          ) &&
            C(this.min) &&
            C(this.max) &&
            (a = this.max - this.min) &&
            (!C(n) && q && (this.min -= a * q),
            !C(A) && g && (this.max += a * g));
          h(this.userMin) ||
            (h(e.softMin) && e.softMin < this.min && (this.min = n = e.softMin),
            h(e.floor) && (this.min = Math.max(this.min, e.floor)));
          h(this.userMax) ||
            (h(e.softMax) && e.softMax > this.max && (this.max = A = e.softMax),
            h(e.ceiling) && (this.max = Math.min(this.max, e.ceiling)));
          l &&
            C(this.dataMin) &&
            ((m = m || 0),
            !C(n) && this.min < m && this.dataMin >= m
              ? (this.min = this.options.minRange
                  ? Math.min(m, this.max - this.minRange)
                  : m)
              : !C(A) &&
                this.max > m &&
                this.dataMax <= m &&
                (this.max = this.options.minRange
                  ? Math.max(m, this.min + this.minRange)
                  : m));
          h(this.min) &&
            h(this.max) &&
            !this.chart.polar &&
            this.min > this.max &&
            (C(this.options.min)
              ? (this.max = this.min)
              : C(this.options.max) && (this.min = this.max));
          this.tickInterval =
            this.min === this.max ||
            "undefined" === typeof this.min ||
            "undefined" === typeof this.max
              ? 1
              : f &&
                  this.linkedParent &&
                  !z &&
                  p === this.linkedParent.options.tickPixelInterval
                ? (z = this.linkedParent.tickInterval)
                : w(
                    z,
                    this.tickAmount
                      ? (this.max - this.min) / Math.max(this.tickAmount - 1, 1)
                      : void 0,
                    y ? 1 : ((this.max - this.min) * p) / Math.max(this.len, p),
                  );
          if (k && !b) {
            var O =
              this.min !== (this.old && this.old.min) ||
              this.max !== (this.old && this.old.max);
            this.series.forEach(function (b) {
              b.forceCrop = b.forceCropping && b.forceCropping();
              b.processData(O);
            });
            d(this, "postProcessData", { hasExtremesChanged: O });
          }
          this.setAxisTranslation();
          d(this, "initialAxisTranslation");
          this.pointRange &&
            !z &&
            (this.tickInterval = Math.max(this.pointRange, this.tickInterval));
          b = w(
            e.minTickInterval,
            this.dateTime &&
              !this.series.some(function (b) {
                return b.noSharedTooltip;
              })
              ? this.closestPointRange
              : 0,
          );
          !z && this.tickInterval < b && (this.tickInterval = b);
          this.dateTime ||
            this.logarithmic ||
            z ||
            (this.tickInterval = S(this, this.tickInterval));
          this.tickAmount || (this.tickInterval = this.unsquish());
          this.setTickPositions();
        };
        a.prototype.setTickPositions = function () {
          var b = this.options,
            a = b.tickPositions,
            c = b.tickPositioner,
            e = this.getMinorTickInterval(),
            k = this.hasVerticalPanning(),
            f = "colorAxis" === this.coll,
            p = (f || !k) && b.startOnTick;
          k = (f || !k) && b.endOnTick;
          f = [];
          var l;
          this.tickmarkOffset =
            this.categories &&
            "between" === b.tickmarkPlacement &&
            1 === this.tickInterval
              ? 0.5
              : 0;
          this.minorTickInterval =
            "auto" === e && this.tickInterval ? this.tickInterval / 5 : e;
          this.single =
            this.min === this.max &&
            C(this.min) &&
            !this.tickAmount &&
            (parseInt(this.min, 10) === this.min || !1 !== b.allowDecimals);
          if (a) f = a.slice();
          else if (h(this.min) && h(this.max)) {
            if (
              (this.ordinal && this.ordinal.positions) ||
              !(
                (this.max - this.min) / this.tickInterval >
                Math.max(2 * this.len, 200)
              )
            )
              if (this.dateTime)
                f = this.getTimeTicks(
                  this.dateTime.normalizeTimeTickInterval(
                    this.tickInterval,
                    b.units,
                  ),
                  this.min,
                  this.max,
                  b.startOfWeek,
                  this.ordinal && this.ordinal.positions,
                  this.closestPointRange,
                  !0,
                );
              else if (this.logarithmic)
                f = this.logarithmic.getLogTickPositions(
                  this.tickInterval,
                  this.min,
                  this.max,
                );
              else
                for (e = b = this.tickInterval; e <= 2 * b; )
                  if (
                    ((f = this.getLinearTickPositions(
                      this.tickInterval,
                      this.min,
                      this.max,
                    )),
                    this.tickAmount && f.length > this.tickAmount)
                  )
                    this.tickInterval = S(this, (e *= 1.1));
                  else break;
            else (f = [this.min, this.max]), v(19, !1, this.chart);
            f.length > this.len &&
              ((f = [f[0], f[f.length - 1]]), f[0] === f[1] && (f.length = 1));
            c &&
              ((this.tickPositions = f),
              (l = c.apply(this, [this.min, this.max])) && (f = l));
          }
          this.tickPositions = f;
          this.paddedTicks = f.slice(0);
          this.trimTicks(f, p, k);
          !this.isLinked &&
            h(this.min) &&
            h(this.max) &&
            (this.single &&
              2 > f.length &&
              !this.categories &&
              !this.series.some(function (b) {
                return (
                  b.is("heatmap") && "between" === b.options.pointPlacement
                );
              }) &&
              ((this.min -= 0.5), (this.max += 0.5)),
            a || l || this.adjustTickAmount());
          d(this, "afterSetTickPositions");
        };
        a.prototype.trimTicks = function (b, a, h) {
          var c = b[0],
            e = b[b.length - 1],
            f = (!this.isOrdinal && this.minPointOffset) || 0;
          d(this, "trimTicks");
          if (!this.isLinked) {
            if (a && -Infinity !== c) this.min = c;
            else for (; this.min - f > b[0]; ) b.shift();
            if (h) this.max = e;
            else for (; this.max + f < b[b.length - 1]; ) b.pop();
            0 === b.length &&
              C(c) &&
              !this.options.tickPositions &&
              b.push((e + c) / 2);
          }
        };
        a.prototype.alignToOthers = function () {
          var b = this,
            d = [this],
            a = b.options,
            c =
              "yAxis" === this.coll && this.chart.options.chart.alignThresholds,
            e = [],
            f;
          b.thresholdAlignment = void 0;
          if (
            ((!1 !== this.chart.options.chart.alignTicks && a.alignTicks) ||
              c) &&
            !1 !== a.startOnTick &&
            !1 !== a.endOnTick &&
            !b.logarithmic
          ) {
            var k = function (b) {
                var d = b.options;
                return [
                  b.horiz ? d.left : d.top,
                  d.width,
                  d.height,
                  d.pane,
                ].join();
              },
              p = k(this);
            this.chart[this.coll].forEach(function (a) {
              var h = a.series;
              h.length &&
                h.some(function (b) {
                  return b.visible;
                }) &&
                a !== b &&
                k(a) === p &&
                ((f = !0), d.push(a));
            });
          }
          if (f && c) {
            d.forEach(function (d) {
              d = d.getThresholdAlignment(b);
              h(d) && e.push(d);
            });
            var l =
              1 < e.length
                ? e.reduce(function (b, d) {
                    return b + d;
                  }, 0) / e.length
                : void 0;
            d.forEach(function (b) {
              b.thresholdAlignment = l;
            });
          }
          return f;
        };
        a.prototype.getThresholdAlignment = function (b) {
          (!h(this.dataMin) ||
            (this !== b &&
              this.series.some(function (b) {
                return b.isDirty || b.isDirtyData;
              }))) &&
            this.getSeriesExtremes();
          if (h(this.threshold))
            return (
              (b = e(
                (this.threshold - (this.dataMin || 0)) /
                  ((this.dataMax || 0) - (this.dataMin || 0)),
                0,
                1,
              )),
              this.options.reversed && (b = 1 - b),
              b
            );
        };
        a.prototype.getTickAmount = function () {
          var b = this.options,
            d = b.tickPixelInterval,
            a = b.tickAmount;
          !C(b.tickInterval) &&
            !a &&
            this.len < d &&
            !this.isRadial &&
            !this.logarithmic &&
            b.startOnTick &&
            b.endOnTick &&
            (a = 2);
          !a && this.alignToOthers() && (a = Math.ceil(this.len / d) + 1);
          4 > a && ((this.finalTickAmt = a), (a = 5));
          this.tickAmount = a;
        };
        a.prototype.adjustTickAmount = function () {
          var b = this,
            d = b.finalTickAmt,
            a = b.max,
            c = b.min,
            e = b.options,
            f = b.tickPositions,
            k = b.tickAmount,
            p = b.thresholdAlignment,
            l = f && f.length,
            g = w(b.threshold, b.softThreshold ? 0 : null);
          var q = b.tickInterval;
          if (h(p)) {
            var z = 0.5 > p ? Math.ceil(p * (k - 1)) : Math.floor(p * (k - 1));
            e.reversed && (z = k - 1 - z);
          }
          if (b.hasData() && h(c) && h(a)) {
            p = function () {
              b.transA *= (l - 1) / (k - 1);
              b.min = e.startOnTick ? f[0] : Math.min(c, f[0]);
              b.max = e.endOnTick
                ? f[f.length - 1]
                : Math.max(a, f[f.length - 1]);
            };
            if (h(z) && h(b.threshold)) {
              for (
                ;
                f[z] !== g || f.length !== k || f[0] > c || f[f.length - 1] < a;

              ) {
                f.length = 0;
                for (f.push(b.threshold); f.length < k; )
                  void 0 === f[z] || f[z] > b.threshold
                    ? f.unshift(u(f[0] - q))
                    : f.push(u(f[f.length - 1] + q));
                if (q > 8 * b.tickInterval) break;
                q *= 2;
              }
              p();
            } else if (l < k) {
              for (; f.length < k; )
                f.length % 2 || c === g
                  ? f.push(u(f[f.length - 1] + q))
                  : f.unshift(u(f[0] - q));
              p();
            }
            if (C(d)) {
              for (q = g = f.length; q--; )
                ((3 === d && 1 === q % 2) || (2 >= d && 0 < q && q < g - 1)) &&
                  f.splice(q, 1);
              b.finalTickAmt = void 0;
            }
          }
        };
        a.prototype.setScale = function () {
          var b = !1,
            a = !1;
          this.series.forEach(function (d) {
            b = b || d.isDirtyData || d.isDirty;
            a = a || (d.xAxis && d.xAxis.isDirty) || !1;
          });
          this.setAxisSize();
          var h = this.len !== (this.old && this.old.len);
          h ||
          b ||
          a ||
          this.isLinked ||
          this.forceRedraw ||
          this.userMin !== (this.old && this.old.userMin) ||
          this.userMax !== (this.old && this.old.userMax) ||
          this.alignToOthers()
            ? (this.stacking && this.stacking.resetStacks(),
              (this.forceRedraw = !1),
              this.getSeriesExtremes(),
              this.setTickInterval(),
              this.isDirty ||
                (this.isDirty =
                  h ||
                  this.min !== (this.old && this.old.min) ||
                  this.max !== (this.old && this.old.max)))
            : this.stacking && this.stacking.cleanStacks();
          b && this.panningState && (this.panningState.isDirty = !0);
          d(this, "afterSetScale");
        };
        a.prototype.setExtremes = function (b, a, h, c, e) {
          var f = this,
            k = f.chart;
          h = w(h, !0);
          f.series.forEach(function (b) {
            delete b.kdTree;
          });
          e = A(e, { min: b, max: a });
          d(f, "setExtremes", e, function () {
            f.userMin = b;
            f.userMax = a;
            f.eventArgs = e;
            h && k.redraw(c);
          });
        };
        a.prototype.zoom = function (b, a) {
          var h = this,
            c = this.dataMin,
            e = this.dataMax,
            f = this.options,
            k = Math.min(c, w(f.min, c)),
            p = Math.max(e, w(f.max, e));
          b = { newMin: b, newMax: a };
          d(this, "zoom", b, function (b) {
            var d = b.newMin,
              a = b.newMax;
            if (d !== h.min || a !== h.max)
              h.allowZoomOutside ||
                (C(c) && (d < k && (d = k), d > p && (d = p)),
                C(e) && (a < k && (a = k), a > p && (a = p))),
                (h.displayBtn =
                  "undefined" !== typeof d || "undefined" !== typeof a),
                h.setExtremes(d, a, !1, void 0, { trigger: "zoom" });
            b.zoomed = !0;
          });
          return b.zoomed;
        };
        a.prototype.setAxisSize = function () {
          var b = this.chart,
            d = this.options,
            a = d.offsets || [0, 0, 0, 0],
            h = this.horiz,
            c = (this.width = Math.round(
              N(w(d.width, b.plotWidth - a[3] + a[1]), b.plotWidth),
            )),
            e = (this.height = Math.round(
              N(w(d.height, b.plotHeight - a[0] + a[2]), b.plotHeight),
            )),
            f = (this.top = Math.round(
              N(w(d.top, b.plotTop + a[0]), b.plotHeight, b.plotTop),
            ));
          d = this.left = Math.round(
            N(w(d.left, b.plotLeft + a[3]), b.plotWidth, b.plotLeft),
          );
          this.bottom = b.chartHeight - e - f;
          this.right = b.chartWidth - c - d;
          this.len = Math.max(h ? c : e, 0);
          this.pos = h ? d : f;
        };
        a.prototype.getExtremes = function () {
          var b = this.logarithmic;
          return {
            min: b ? u(b.lin2log(this.min)) : this.min,
            max: b ? u(b.lin2log(this.max)) : this.max,
            dataMin: this.dataMin,
            dataMax: this.dataMax,
            userMin: this.userMin,
            userMax: this.userMax,
          };
        };
        a.prototype.getThreshold = function (b) {
          var d = this.logarithmic,
            a = d ? d.lin2log(this.min) : this.min;
          d = d ? d.lin2log(this.max) : this.max;
          null === b || -Infinity === b
            ? (b = a)
            : Infinity === b
              ? (b = d)
              : a > b
                ? (b = a)
                : d < b && (b = d);
          return this.translate(b, 0, 1, 0, 1);
        };
        a.prototype.autoLabelAlign = function (b) {
          var a = (w(b, 0) - 90 * this.side + 720) % 360;
          b = { align: "center" };
          d(this, "autoLabelAlign", b, function (b) {
            15 < a && 165 > a
              ? (b.align = "right")
              : 195 < a && 345 > a && (b.align = "left");
          });
          return b.align;
        };
        a.prototype.tickSize = function (b) {
          var a = this.options,
            h = w(
              a["tick" === b ? "tickWidth" : "minorTickWidth"],
              "tick" === b && this.isXAxis && !this.categories ? 1 : 0,
            ),
            c = a["tick" === b ? "tickLength" : "minorTickLength"];
          if (h && c) {
            "inside" === a[b + "Position"] && (c = -c);
            var e = [c, h];
          }
          b = { tickSize: e };
          d(this, "afterTickSize", b);
          return b.tickSize;
        };
        a.prototype.labelMetrics = function () {
          var b = (this.tickPositions && this.tickPositions[0]) || 0;
          return this.chart.renderer.fontMetrics(
            this.options.labels.style.fontSize,
            this.ticks[b] && this.ticks[b].label,
          );
        };
        a.prototype.unsquish = function () {
          var b = this.options.labels,
            d = this.horiz,
            a = this.tickInterval,
            e =
              this.len /
              (((this.categories ? 1 : 0) + this.max - this.min) / a),
            f = b.rotation,
            k = this.labelMetrics(),
            p = Math.max(this.max - this.min, 0),
            l = function (b) {
              var d = b / (e || 1);
              d = 1 < d ? Math.ceil(d) : 1;
              d * a > p &&
                Infinity !== b &&
                Infinity !== e &&
                p &&
                (d = Math.ceil(p / a));
              return u(d * a);
            },
            g = a,
            q = Number.MAX_VALUE;
          if (d) {
            if (!b.staggerLines)
              if (h(f)) var z = [f];
              else e < b.autoRotationLimit && (z = b.autoRotation);
            if (z)
              for (var m = (d = void 0), n = 0, A = z; n < A.length; n++) {
                var H = A[n];
                if (H === f || (H && -90 <= H && 90 >= H))
                  if (
                    ((d = l(Math.abs(k.h / Math.sin(c * H)))),
                    (m = d + Math.abs(H / 360)),
                    m < q)
                  ) {
                    q = m;
                    var N = H;
                    g = d;
                  }
              }
          } else g = l(k.h);
          this.autoRotation = z;
          this.labelRotation = w(N, h(f) ? f : 0);
          return b.step ? a : g;
        };
        a.prototype.getSlotWidth = function (b) {
          var d = this.chart,
            a = this.horiz,
            c = this.options.labels,
            e = Math.max(
              this.tickPositions.length - (this.categories ? 0 : 1),
              1,
            ),
            f = d.margin[3];
          if (b && h(b.slotWidth)) return b.slotWidth;
          if (a && 2 > c.step)
            return c.rotation ? 0 : ((this.staggerLines || 1) * this.len) / e;
          if (!a) {
            b = c.style.width;
            if (void 0 !== b) return parseInt(String(b), 10);
            if (f) return f - d.spacing[3];
          }
          return 0.33 * d.chartWidth;
        };
        a.prototype.renderUnsquish = function () {
          var b = this.chart,
            d = b.renderer,
            a = this.tickPositions,
            h = this.ticks,
            c = this.options.labels,
            e = c.style,
            f = this.horiz,
            p = this.getSlotWidth(),
            l = Math.max(1, Math.round(p - 2 * c.padding)),
            g = {},
            q = this.labelMetrics(),
            z = e.textOverflow,
            w = 0;
          k(c.rotation) || (g.rotation = c.rotation || 0);
          a.forEach(function (b) {
            b = h[b];
            b.movedLabel && b.replaceMovedLabel();
            b &&
              b.label &&
              b.label.textPxLength > w &&
              (w = b.label.textPxLength);
          });
          this.maxLabelLength = w;
          if (this.autoRotation)
            w > l && w > q.h
              ? (g.rotation = this.labelRotation)
              : (this.labelRotation = 0);
          else if (p) {
            var m = l;
            if (!z) {
              var u = "clip";
              for (l = a.length; !f && l--; ) {
                var n = a[l];
                if ((n = h[n].label))
                  n.styles && "ellipsis" === n.styles.textOverflow
                    ? n.css({ textOverflow: "clip" })
                    : n.textPxLength > p && n.css({ width: p + "px" }),
                    n.getBBox().height > this.len / a.length - (q.h - q.f) &&
                      (n.specificTextOverflow = "ellipsis");
              }
            }
          }
          g.rotation &&
            ((m = w > 0.5 * b.chartHeight ? 0.33 * b.chartHeight : w),
            z || (u = "ellipsis"));
          if (
            (this.labelAlign =
              c.align || this.autoLabelAlign(this.labelRotation))
          )
            g.align = this.labelAlign;
          a.forEach(function (b) {
            var d = (b = h[b]) && b.label,
              a = e.width,
              c = {};
            d &&
              (d.attr(g),
              b.shortenLabel
                ? b.shortenLabel()
                : m &&
                    !a &&
                    "nowrap" !== e.whiteSpace &&
                    (m < d.textPxLength || "SPAN" === d.element.tagName)
                  ? ((c.width = m + "px"),
                    z || (c.textOverflow = d.specificTextOverflow || u),
                    d.css(c))
                  : d.styles &&
                    d.styles.width &&
                    !c.width &&
                    !a &&
                    d.css({ width: null }),
              delete d.specificTextOverflow,
              (b.rotation = g.rotation));
          }, this);
          this.tickRotCorr = d.rotCorr(
            q.b,
            this.labelRotation || 0,
            0 !== this.side,
          );
        };
        a.prototype.hasData = function () {
          return (
            this.series.some(function (b) {
              return b.hasData();
            }) ||
            (this.options.showEmpty && C(this.min) && C(this.max))
          );
        };
        a.prototype.addTitle = function (d) {
          var a = this.chart.renderer,
            c = this.horiz,
            h = this.opposite,
            e = this.options.title,
            f = this.chart.styledMode,
            k;
          this.axisTitle ||
            ((k = e.textAlign) ||
              (k = (
                c
                  ? { low: "left", middle: "center", high: "right" }
                  : {
                      low: h ? "right" : "left",
                      middle: "center",
                      high: h ? "left" : "right",
                    }
              )[e.align]),
            (this.axisTitle = a
              .text(e.text || "", 0, 0, e.useHTML)
              .attr({ zIndex: 7, rotation: e.rotation, align: k })
              .addClass("highcharts-axis-title")),
            f || this.axisTitle.css(b(e.style)),
            this.axisTitle.add(this.axisGroup),
            (this.axisTitle.isNew = !0));
          f ||
            e.style.width ||
            this.isRadial ||
            this.axisTitle.css({ width: this.len + "px" });
          this.axisTitle[d ? "show" : "hide"](d);
        };
        a.prototype.generateTick = function (b) {
          var d = this.ticks;
          d[b] ? d[b].addLabel() : (d[b] = new G(this, b));
        };
        a.prototype.getOffset = function () {
          var b = this,
            a = this,
            c = a.chart,
            h = a.horiz,
            e = a.options,
            f = a.side,
            k = a.ticks,
            p = a.tickPositions,
            l = a.coll,
            g = a.axisParent,
            q = c.renderer,
            m = c.inverted && !a.isZAxis ? [1, 0, 3, 2][f] : f,
            u = a.hasData(),
            n = e.title,
            A = e.labels,
            H = c.axisOffset;
          c = c.clipOffset;
          var N = [-1, 1, 1, -1][f],
            O = e.className,
            t,
            r = 0,
            ja = 0,
            ea = 0;
          a.showAxis = t = u || e.showEmpty;
          a.staggerLines = (a.horiz && A.staggerLines) || void 0;
          if (!a.axisGroup) {
            var Q = function (d, a, c) {
              return q
                .g(d)
                .attr({ zIndex: c })
                .addClass(
                  "highcharts-".concat(l.toLowerCase()).concat(a, " ") +
                    (b.isRadial
                      ? "highcharts-radial-axis".concat(a, " ")
                      : "") +
                    (O || ""),
                )
                .add(g);
            };
            a.gridGroup = Q("grid", "-grid", e.gridZIndex);
            a.axisGroup = Q("axis", "", e.zIndex);
            a.labelGroup = Q("axis-labels", "-labels", A.zIndex);
          }
          u || a.isLinked
            ? (p.forEach(function (b) {
                a.generateTick(b);
              }),
              a.renderUnsquish(),
              (a.reserveSpaceDefault =
                0 === f ||
                2 === f ||
                { 1: "left", 3: "right" }[f] === a.labelAlign),
              w(
                A.reserveSpace,
                "center" === a.labelAlign ? !0 : null,
                a.reserveSpaceDefault,
              ) &&
                p.forEach(function (b) {
                  ea = Math.max(k[b].getLabelSize(), ea);
                }),
              a.staggerLines && (ea *= a.staggerLines),
              (a.labelOffset = ea * (a.opposite ? -1 : 1)))
            : z(k, function (b, d) {
                b.destroy();
                delete k[d];
              });
          if (
            n &&
            n.text &&
            !1 !== n.enabled &&
            (a.addTitle(t), t && !1 !== n.reserveSpace)
          ) {
            a.titleOffset = r = a.axisTitle.getBBox()[h ? "height" : "width"];
            var J = n.offset;
            ja = C(J) ? 0 : w(n.margin, h ? 5 : 10);
          }
          a.renderLine();
          a.offset = N * w(e.offset, H[f] ? H[f] + (e.margin || 0) : 0);
          a.tickRotCorr = a.tickRotCorr || { x: 0, y: 0 };
          n = 0 === f ? -a.labelMetrics().h : 2 === f ? a.tickRotCorr.y : 0;
          u = Math.abs(ea) + ja;
          ea && (u = u - n + N * (h ? w(A.y, a.tickRotCorr.y + 8 * N) : A.x));
          a.axisTitleMargin = w(J, u);
          a.getMaxLabelDimensions &&
            (a.maxLabelDimensions = a.getMaxLabelDimensions(k, p));
          "colorAxis" !== l &&
            ((h = this.tickSize("tick")),
            (H[f] = Math.max(
              H[f],
              (a.axisTitleMargin || 0) + r + N * a.offset,
              u,
              p && p.length && h ? h[0] + N * a.offset : 0,
            )),
            (e =
              !a.axisLine || e.offset
                ? 0
                : 2 * Math.floor(a.axisLine.strokeWidth() / 2)),
            (c[m] = Math.max(c[m], e)));
          d(this, "afterGetOffset");
        };
        a.prototype.getLinePath = function (b) {
          var d = this.chart,
            a = this.opposite,
            c = this.offset,
            h = this.horiz,
            e = this.left + (a ? this.width : 0) + c;
          c = d.chartHeight - this.bottom - (a ? this.height : 0) + c;
          a && (b *= -1);
          return d.renderer.crispLine(
            [
              ["M", h ? this.left : e, h ? c : this.top],
              [
                "L",
                h ? d.chartWidth - this.right : e,
                h ? c : d.chartHeight - this.bottom,
              ],
            ],
            b,
          );
        };
        a.prototype.renderLine = function () {
          this.axisLine ||
            ((this.axisLine = this.chart.renderer
              .path()
              .addClass("highcharts-axis-line")
              .add(this.axisGroup)),
            this.chart.styledMode ||
              this.axisLine.attr({
                stroke: this.options.lineColor,
                "stroke-width": this.options.lineWidth,
                zIndex: 7,
              }));
        };
        a.prototype.getTitlePosition = function () {
          var b = this.horiz,
            a = this.left,
            c = this.top,
            h = this.len,
            e = this.options.title,
            f = b ? a : c,
            k = this.opposite,
            p = this.offset,
            l = e.x,
            g = e.y,
            q = this.axisTitle,
            z = this.chart.renderer.fontMetrics(e.style.fontSize, q);
          q = q ? Math.max(q.getBBox(!1, 0).height - z.h - 1, 0) : 0;
          h = {
            low: f + (b ? 0 : h),
            middle: f + h / 2,
            high: f + (b ? h : 0),
          }[e.align];
          a =
            (b ? c + this.height : a) +
            (b ? 1 : -1) * (k ? -1 : 1) * (this.axisTitleMargin || 0) +
            [-q, q, z.f, -q][this.side];
          b = {
            x: b ? h + l : a + (k ? this.width : 0) + p + l,
            y: b ? a + g - (k ? this.height : 0) + p : h + g,
          };
          d(this, "afterGetTitlePosition", { titlePosition: b });
          return b;
        };
        a.prototype.renderMinorTick = function (b, d) {
          var a = this.minorTicks;
          a[b] || (a[b] = new G(this, b, "minor"));
          d && a[b].isNew && a[b].render(null, !0);
          a[b].render(null, !1, 1);
        };
        a.prototype.renderTick = function (b, d, a) {
          var c = this.ticks;
          if (
            !this.isLinked ||
            (b >= this.min && b <= this.max) ||
            (this.grid && this.grid.isColumn)
          )
            c[b] || (c[b] = new G(this, b)),
              a && c[b].isNew && c[b].render(d, !0, -1),
              c[b].render(d);
        };
        a.prototype.render = function () {
          var b = this,
            a = b.chart,
            c = b.logarithmic,
            e = b.options,
            f = b.isLinked,
            k = b.tickPositions,
            p = b.axisTitle,
            l = b.ticks,
            g = b.minorTicks,
            q = b.alternateBands,
            w = e.stackLabels,
            m = e.alternateGridColor,
            u = b.tickmarkOffset,
            n = b.axisLine,
            A = b.showAxis,
            H = t(a.renderer.globalAnimation),
            N,
            O;
          b.labelEdge.length = 0;
          b.overlap = !1;
          [l, g, q].forEach(function (b) {
            z(b, function (b) {
              b.isActive = !1;
            });
          });
          if (b.hasData() || f) {
            var C = b.chart.hasRendered && b.old && h(b.old.min);
            b.minorTickInterval &&
              !b.categories &&
              b.getMinorTickPositions().forEach(function (d) {
                b.renderMinorTick(d, C);
              });
            k.length &&
              (k.forEach(function (d, a) {
                b.renderTick(d, a, C);
              }),
              u &&
                (0 === b.min || b.single) &&
                (l[-1] || (l[-1] = new G(b, -1, null, !0)), l[-1].render(-1)));
            m &&
              k.forEach(function (d, h) {
                O = "undefined" !== typeof k[h + 1] ? k[h + 1] + u : b.max - u;
                0 === h % 2 &&
                  d < b.max &&
                  O <= b.max + (a.polar ? -u : u) &&
                  (q[d] || (q[d] = new B.PlotLineOrBand(b)),
                  (N = d + u),
                  (q[d].options = {
                    from: c ? c.lin2log(N) : N,
                    to: c ? c.lin2log(O) : O,
                    color: m,
                    className: "highcharts-alternate-grid",
                  }),
                  q[d].render(),
                  (q[d].isActive = !0));
              });
            b._addedPlotLB ||
              ((b._addedPlotLB = !0),
              (e.plotLines || [])
                .concat(e.plotBands || [])
                .forEach(function (d) {
                  b.addPlotBandOrLine(d);
                }));
          }
          [l, g, q].forEach(function (b) {
            var d = [],
              c = H.duration;
            z(b, function (b, a) {
              b.isActive || (b.render(a, !1, 0), (b.isActive = !1), d.push(a));
            });
            Q(
              function () {
                for (var a = d.length; a--; )
                  b[d[a]] &&
                    !b[d[a]].isActive &&
                    (b[d[a]].destroy(), delete b[d[a]]);
              },
              b !== q && a.hasRendered && c ? c : 0,
            );
          });
          n &&
            (n[n.isPlaced ? "animate" : "attr"]({
              d: this.getLinePath(n.strokeWidth()),
            }),
            (n.isPlaced = !0),
            n[A ? "show" : "hide"](A));
          p &&
            A &&
            ((e = b.getTitlePosition()),
            p[p.isNew ? "attr" : "animate"](e),
            (p.isNew = !1));
          w && w.enabled && b.stacking && b.stacking.renderStackTotals();
          b.old = {
            len: b.len,
            max: b.max,
            min: b.min,
            transA: b.transA,
            userMax: b.userMax,
            userMin: b.userMin,
          };
          b.isDirty = !1;
          d(this, "afterRender");
        };
        a.prototype.redraw = function () {
          this.visible &&
            (this.render(),
            this.plotLinesAndBands.forEach(function (b) {
              b.render();
            }));
          this.series.forEach(function (b) {
            b.isDirty = !0;
          });
        };
        a.prototype.getKeepProps = function () {
          return this.keepProps || a.keepProps;
        };
        a.prototype.destroy = function (b) {
          var a = this,
            c = a.plotLinesAndBands,
            h = this.eventOptions;
          d(this, "destroy", { keepEvents: b });
          b || H(a);
          [a.ticks, a.minorTicks, a.alternateBands].forEach(function (b) {
            J(b);
          });
          if (c) for (b = c.length; b--; ) c[b].destroy();
          "axisLine axisTitle axisGroup gridGroup labelGroup cross scrollbar"
            .split(" ")
            .forEach(function (b) {
              a[b] && (a[b] = a[b].destroy());
            });
          for (var e in a.plotLinesAndBandsGroups)
            a.plotLinesAndBandsGroups[e] =
              a.plotLinesAndBandsGroups[e].destroy();
          z(a, function (b, d) {
            -1 === a.getKeepProps().indexOf(d) && delete a[d];
          });
          this.eventOptions = h;
        };
        a.prototype.drawCrosshair = function (b, a) {
          var c = this.crosshair,
            h = w(c && c.snap, !0),
            e = this.chart,
            f,
            k = this.cross;
          d(this, "drawCrosshair", { e: b, point: a });
          b || (b = this.cross && this.cross.e);
          if (c && !1 !== (C(a) || !h)) {
            h
              ? C(a) &&
                (f = w(
                  "colorAxis" !== this.coll ? a.crosshairPos : null,
                  this.isXAxis ? a.plotX : this.len - a.plotY,
                ))
              : (f =
                  b &&
                  (this.horiz
                    ? b.chartX - this.pos
                    : this.len - b.chartY + this.pos));
            if (C(f)) {
              var p = {
                value: a && (this.isXAxis ? a.x : w(a.stackY, a.y)),
                translatedValue: f,
              };
              e.polar &&
                A(p, {
                  isCrosshair: !0,
                  chartX: b && b.chartX,
                  chartY: b && b.chartY,
                  point: a,
                });
              p = this.getPlotLinePath(p) || null;
            }
            if (!C(p)) {
              this.hideCrosshair();
              return;
            }
            h = this.categories && !this.isRadial;
            k ||
              ((this.cross = k =
                e.renderer
                  .path()
                  .addClass(
                    "highcharts-crosshair highcharts-crosshair-" +
                      (h ? "category " : "thin ") +
                      (c.className || ""),
                  )
                  .attr({ zIndex: w(c.zIndex, 2) })
                  .add()),
              e.styledMode ||
                (k
                  .attr({
                    stroke:
                      c.color ||
                      (h
                        ? x.parse("#ccd6eb").setOpacity(0.25).get()
                        : "#cccccc"),
                    "stroke-width": w(c.width, 1),
                  })
                  .css({ "pointer-events": "none" }),
                c.dashStyle && k.attr({ dashstyle: c.dashStyle })));
            k.show().attr({ d: p });
            h && !c.width && k.attr({ "stroke-width": this.transA });
            this.cross.e = b;
          } else this.hideCrosshair();
          d(this, "afterDrawCrosshair", { e: b, point: a });
        };
        a.prototype.hideCrosshair = function () {
          this.cross && this.cross.hide();
          d(this, "afterHideCrosshair");
        };
        a.prototype.hasVerticalPanning = function () {
          var b = this.chart.options.chart.panning;
          return !!(b && b.enabled && /y/.test(b.type));
        };
        a.prototype.validatePositiveValue = function (b) {
          return h(b) && 0 < b;
        };
        a.prototype.update = function (d, a) {
          var c = this.chart;
          d = b(this.userOptions, d);
          this.destroy(!0);
          this.init(c, d);
          c.isDirtyBox = !0;
          w(a, !0) && c.redraw();
        };
        a.prototype.remove = function (b) {
          for (
            var d = this.chart, a = this.coll, c = this.series, h = c.length;
            h--;

          )
            c[h] && c[h].remove(!1);
          I(d.axes, this);
          I(d[a], this);
          d[a].forEach(function (b, d) {
            b.options.index = b.userOptions.index = d;
          });
          this.destroy();
          d.isDirtyBox = !0;
          w(b, !0) && d.redraw();
        };
        a.prototype.setTitle = function (b, d) {
          this.update({ title: b }, d);
        };
        a.prototype.setCategories = function (b, d) {
          this.update({ categories: b }, d);
        };
        a.defaultOptions = g.defaultXAxisOptions;
        a.keepProps = "extKey hcEvents names series userMax userMin".split(" ");
        return a;
      })();
      ("");
      return a;
    },
  );
  K(g, "Core/Axis/DateTimeAxis.js", [g["Core/Utilities.js"]], function (a) {
    var g = a.addEvent,
      x = a.getMagnitude,
      E = a.normalizeTickInterval,
      D = a.timeUnits,
      B;
    (function (a) {
      function r() {
        return this.chart.time.getTimeTicks.apply(this.chart.time, arguments);
      }
      function t(a) {
        "datetime" !== a.userOptions.type
          ? (this.dateTime = void 0)
          : this.dateTime || (this.dateTime = new f(this));
      }
      var n = [];
      a.compose = function (a) {
        -1 === n.indexOf(a) &&
          (n.push(a),
          a.keepProps.push("dateTime"),
          (a.prototype.getTimeTicks = r),
          g(a, "init", t));
        return a;
      };
      var f = (function () {
        function a(a) {
          this.axis = a;
        }
        a.prototype.normalizeTimeTickInterval = function (a, c) {
          var e = c || [
            ["millisecond", [1, 2, 5, 10, 20, 25, 50, 100, 200, 500]],
            ["second", [1, 2, 5, 10, 15, 30]],
            ["minute", [1, 2, 5, 10, 15, 30]],
            ["hour", [1, 2, 3, 4, 6, 8, 12]],
            ["day", [1, 2]],
            ["week", [1, 2]],
            ["month", [1, 2, 3, 4, 6]],
            ["year", null],
          ];
          c = e[e.length - 1];
          var f = D[c[0]],
            l = c[1],
            g;
          for (
            g = 0;
            g < e.length &&
            !((c = e[g]),
            (f = D[c[0]]),
            (l = c[1]),
            e[g + 1] && a <= (f * l[l.length - 1] + D[e[g + 1][0]]) / 2);
            g++
          );
          f === D.year && a < 5 * f && (l = [1, 2, 5]);
          a = E(a / f, l, "year" === c[0] ? Math.max(x(a / f), 1) : 1);
          return { unitRange: f, count: a, unitName: c[0] };
        };
        a.prototype.getXDateFormat = function (a, c) {
          var e = this.axis,
            f = e.chart.time;
          return e.closestPointRange
            ? f.getDateFormat(
                e.closestPointRange,
                a,
                e.options.startOfWeek,
                c,
              ) || f.resolveDTLFormat(c.year).main
            : f.resolveDTLFormat(c.day).main;
        };
        return a;
      })();
      a.Additions = f;
    })(B || (B = {}));
    return B;
  });
  K(g, "Core/Axis/LogarithmicAxis.js", [g["Core/Utilities.js"]], function (a) {
    var g = a.addEvent,
      x = a.normalizeTickInterval,
      E = a.pick,
      D;
    (function (a) {
      function v(a) {
        var c = this.logarithmic;
        "logarithmic" !== a.userOptions.type
          ? (this.logarithmic = void 0)
          : c || (this.logarithmic = new n(this));
      }
      function r() {
        var a = this.logarithmic;
        a &&
          ((this.lin2val = function (c) {
            return a.lin2log(c);
          }),
          (this.val2lin = function (c) {
            return a.log2lin(c);
          }));
      }
      var t = [];
      a.compose = function (a) {
        -1 === t.indexOf(a) &&
          (t.push(a),
          a.keepProps.push("logarithmic"),
          g(a, "init", v),
          g(a, "afterInit", r));
        return a;
      };
      var n = (function () {
        function a(a) {
          this.axis = a;
        }
        a.prototype.getLogTickPositions = function (a, f, g, e) {
          var c = this.axis,
            l = c.len,
            m = c.options,
            n = [];
          e || (this.minorAutoInterval = void 0);
          if (0.5 <= a)
            (a = Math.round(a)), (n = c.getLinearTickPositions(a, f, g));
          else if (0.08 <= a) {
            var t = Math.floor(f),
              A,
              d = (m = void 0);
            for (
              l =
                0.3 < a
                  ? [1, 2, 4]
                  : 0.15 < a
                    ? [1, 2, 4, 6, 8]
                    : [1, 2, 3, 4, 5, 6, 7, 8, 9];
              t < g + 1 && !d;
              t++
            ) {
              var q = l.length;
              for (A = 0; A < q && !d; A++) {
                var h = this.log2lin(this.lin2log(t) * l[A]);
                h > f &&
                  (!e || m <= g) &&
                  "undefined" !== typeof m &&
                  n.push(m);
                m > g && (d = !0);
                m = h;
              }
            }
          } else
            (f = this.lin2log(f)),
              (g = this.lin2log(g)),
              (a = e ? c.getMinorTickInterval() : m.tickInterval),
              (a = E(
                "auto" === a ? null : a,
                this.minorAutoInterval,
                ((m.tickPixelInterval / (e ? 5 : 1)) * (g - f)) /
                  ((e ? l / c.tickPositions.length : l) || 1),
              )),
              (a = x(a)),
              (n = c.getLinearTickPositions(a, f, g).map(this.log2lin)),
              e || (this.minorAutoInterval = a / 5);
          e || (c.tickInterval = a);
          return n;
        };
        a.prototype.lin2log = function (a) {
          return Math.pow(10, a);
        };
        a.prototype.log2lin = function (a) {
          return Math.log(a) / Math.LN10;
        };
        return a;
      })();
      a.Additions = n;
    })(D || (D = {}));
    return D;
  });
  K(
    g,
    "Core/Axis/PlotLineOrBand/PlotLineOrBandAxis.js",
    [g["Core/Utilities.js"]],
    function (a) {
      var g = a.erase,
        x = a.extend,
        E = a.isNumber,
        D;
      (function (a) {
        var v = [],
          r;
        a.compose = function (a, f) {
          r || (r = a);
          -1 === v.indexOf(f) && (v.push(f), x(f.prototype, t.prototype));
          return f;
        };
        var t = (function () {
          function a() {}
          a.prototype.getPlotBandPath = function (a, c, g) {
            void 0 === g && (g = this.options);
            var f = this.getPlotLinePath({
                value: c,
                force: !0,
                acrossPanes: g.acrossPanes,
              }),
              e = [],
              l = this.horiz;
            c =
              !E(this.min) ||
              !E(this.max) ||
              (a < this.min && c < this.min) ||
              (a > this.max && c > this.max);
            a = this.getPlotLinePath({
              value: a,
              force: !0,
              acrossPanes: g.acrossPanes,
            });
            g = 1;
            if (a && f) {
              if (c) {
                var n = a.toString() === f.toString();
                g = 0;
              }
              for (c = 0; c < a.length; c += 2) {
                var t = a[c],
                  r = a[c + 1],
                  v = f[c],
                  A = f[c + 1];
                ("M" !== t[0] && "L" !== t[0]) ||
                  ("M" !== r[0] && "L" !== r[0]) ||
                  ("M" !== v[0] && "L" !== v[0]) ||
                  ("M" !== A[0] && "L" !== A[0]) ||
                  (l && v[1] === t[1]
                    ? ((v[1] += g), (A[1] += g))
                    : l || v[2] !== t[2] || ((v[2] += g), (A[2] += g)),
                  e.push(
                    ["M", t[1], t[2]],
                    ["L", r[1], r[2]],
                    ["L", A[1], A[2]],
                    ["L", v[1], v[2]],
                    ["Z"],
                  ));
                e.isFlat = n;
              }
            }
            return e;
          };
          a.prototype.addPlotBand = function (a) {
            return this.addPlotBandOrLine(a, "plotBands");
          };
          a.prototype.addPlotLine = function (a) {
            return this.addPlotBandOrLine(a, "plotLines");
          };
          a.prototype.addPlotBandOrLine = function (a, c) {
            var f = this,
              g = this.userOptions,
              e = new r(this, a);
            this.visible && (e = e.render());
            if (e) {
              this._addedPlotLB ||
                ((this._addedPlotLB = !0),
                (g.plotLines || [])
                  .concat(g.plotBands || [])
                  .forEach(function (a) {
                    f.addPlotBandOrLine(a);
                  }));
              if (c) {
                var n = g[c] || [];
                n.push(a);
                g[c] = n;
              }
              this.plotLinesAndBands.push(e);
            }
            return e;
          };
          a.prototype.removePlotBandOrLine = function (a) {
            var c = this.plotLinesAndBands,
              f = this.options,
              m = this.userOptions;
            if (c) {
              for (var e = c.length; e--; ) c[e].id === a && c[e].destroy();
              [
                f.plotLines || [],
                m.plotLines || [],
                f.plotBands || [],
                m.plotBands || [],
              ].forEach(function (c) {
                for (e = c.length; e--; ) (c[e] || {}).id === a && g(c, c[e]);
              });
            }
          };
          a.prototype.removePlotBand = function (a) {
            this.removePlotBandOrLine(a);
          };
          a.prototype.removePlotLine = function (a) {
            this.removePlotBandOrLine(a);
          };
          return a;
        })();
      })(D || (D = {}));
      return D;
    },
  );
  K(
    g,
    "Core/Axis/PlotLineOrBand/PlotLineOrBand.js",
    [
      g["Core/Axis/PlotLineOrBand/PlotLineOrBandAxis.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g) {
      var v = g.arrayMax,
        E = g.arrayMin,
        D = g.defined,
        B = g.destroyObjectProperties,
        G = g.erase,
        r = g.fireEvent,
        t = g.merge,
        n = g.objectEach,
        f = g.pick;
      g = (function () {
        function c(a, c) {
          this.axis = a;
          c && ((this.options = c), (this.id = c.id));
        }
        c.compose = function (f) {
          return a.compose(c, f);
        };
        c.prototype.render = function () {
          r(this, "render");
          var a = this,
            c = a.axis,
            e = c.horiz,
            g = c.logarithmic,
            C = a.options,
            J = C.color,
            I = f(C.zIndex, 0),
            v = C.events,
            A = {},
            d = c.chart.renderer,
            q = C.label,
            h = a.label,
            k = C.to,
            b = C.from,
            p = C.value,
            z = a.svgElem,
            w = [],
            N = D(b) && D(k);
          w = D(p);
          var H = !z,
            O = {
              class:
                "highcharts-plot-" +
                (N ? "band " : "line ") +
                (C.className || ""),
            },
            Q = N ? "bands" : "lines";
          g && ((b = g.log2lin(b)), (k = g.log2lin(k)), (p = g.log2lin(p)));
          c.chart.styledMode ||
            (w
              ? ((O.stroke = J || "#999999"),
                (O["stroke-width"] = f(C.width, 1)),
                C.dashStyle && (O.dashstyle = C.dashStyle))
              : N &&
                ((O.fill = J || "#e6ebf5"),
                C.borderWidth &&
                  ((O.stroke = C.borderColor),
                  (O["stroke-width"] = C.borderWidth))));
          A.zIndex = I;
          Q += "-" + I;
          (g = c.plotLinesAndBandsGroups[Q]) ||
            (c.plotLinesAndBandsGroups[Q] = g =
              d
                .g("plot-" + Q)
                .attr(A)
                .add());
          H && (a.svgElem = z = d.path().attr(O).add(g));
          if (w)
            w = c.getPlotLinePath({
              value: p,
              lineWidth: z.strokeWidth(),
              acrossPanes: C.acrossPanes,
            });
          else if (N) w = c.getPlotBandPath(b, k, C);
          else return;
          !a.eventsAdded &&
            v &&
            (n(v, function (b, d) {
              z.on(d, function (b) {
                v[d].apply(a, [b]);
              });
            }),
            (a.eventsAdded = !0));
          (H || !z.d) && w && w.length
            ? z.attr({ d: w })
            : z &&
              (w
                ? (z.show(), z.animate({ d: w }))
                : z.d && (z.hide(), h && (a.label = h = h.destroy())));
          q &&
          (D(q.text) || D(q.formatter)) &&
          w &&
          w.length &&
          0 < c.width &&
          0 < c.height &&
          !w.isFlat
            ? ((q = t(
                {
                  align: e && N && "center",
                  x: e ? !N && 4 : 10,
                  verticalAlign: !e && N && "middle",
                  y: e ? (N ? 16 : 10) : N ? 6 : -4,
                  rotation: e && !N && 90,
                },
                q,
              )),
              this.renderLabel(q, w, N, I))
            : h && h.hide();
          return a;
        };
        c.prototype.renderLabel = function (a, c, e, f) {
          var g = this.axis,
            l = g.chart.renderer,
            m = this.label;
          m ||
            ((this.label = m =
              l
                .text(this.getLabelText(a), 0, 0, a.useHTML)
                .attr({
                  align: a.textAlign || a.align,
                  rotation: a.rotation,
                  class:
                    "highcharts-plot-" +
                    (e ? "band" : "line") +
                    "-label " +
                    (a.className || ""),
                  zIndex: f,
                })
                .add()),
            g.chart.styledMode ||
              m.css(t({ textOverflow: "ellipsis" }, a.style)));
          f = c.xBounds || [c[0][1], c[1][1], e ? c[2][1] : c[0][1]];
          c = c.yBounds || [c[0][2], c[1][2], e ? c[2][2] : c[0][2]];
          e = E(f);
          l = E(c);
          m.align(a, !1, { x: e, y: l, width: v(f) - e, height: v(c) - l });
          (m.alignValue && "left" !== m.alignValue) ||
            m.css({
              width:
                (90 === m.rotation
                  ? g.height - (m.alignAttr.y - g.top)
                  : g.width - (m.alignAttr.x - g.left)) + "px",
            });
          m.show(!0);
        };
        c.prototype.getLabelText = function (a) {
          return D(a.formatter) ? a.formatter.call(this) : a.text;
        };
        c.prototype.destroy = function () {
          G(this.axis.plotLinesAndBands, this);
          delete this.axis;
          B(this);
        };
        return c;
      })();
      ("");
      ("");
      return g;
    },
  );
  K(
    g,
    "Core/Tooltip.js",
    [
      g["Core/FormatUtilities.js"],
      g["Core/Globals.js"],
      g["Core/Renderer/RendererUtilities.js"],
      g["Core/Renderer/RendererRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D) {
      var v = a.format,
        G = g.doc,
        r = x.distribute,
        t = D.clamp,
        n = D.css,
        f = D.discardElement,
        c = D.extend,
        l = D.fireEvent,
        m = D.isArray,
        e = D.isNumber,
        u = D.isString,
        C = D.merge,
        J = D.pick,
        I = D.splat,
        L = D.syncTimeout;
      a = (function () {
        function a(a, c) {
          this.allowShared = !0;
          this.container = void 0;
          this.crosshairs = [];
          this.distance = 0;
          this.isHidden = !0;
          this.isSticky = !1;
          this.now = {};
          this.options = {};
          this.outside = !1;
          this.chart = a;
          this.init(a, c);
        }
        a.prototype.applyFilter = function () {
          var a = this.chart;
          a.renderer.definition({
            tagName: "filter",
            attributes: { id: "drop-shadow-" + a.index, opacity: 0.5 },
            children: [
              {
                tagName: "feGaussianBlur",
                attributes: { in: "SourceAlpha", stdDeviation: 1 },
              },
              { tagName: "feOffset", attributes: { dx: 1, dy: 1 } },
              {
                tagName: "feComponentTransfer",
                children: [
                  {
                    tagName: "feFuncA",
                    attributes: { type: "linear", slope: 0.3 },
                  },
                ],
              },
              {
                tagName: "feMerge",
                children: [
                  { tagName: "feMergeNode" },
                  {
                    tagName: "feMergeNode",
                    attributes: { in: "SourceGraphic" },
                  },
                ],
              },
            ],
          });
        };
        a.prototype.bodyFormatter = function (a) {
          return a.map(function (a) {
            var d = a.series.tooltipOptions;
            return (
              d[(a.point.formatPrefix || "point") + "Formatter"] ||
              a.point.tooltipFormatter
            ).call(
              a.point,
              d[(a.point.formatPrefix || "point") + "Format"] || "",
            );
          });
        };
        a.prototype.cleanSplit = function (a) {
          this.chart.series.forEach(function (d) {
            var c = d && d.tt;
            c && (!c.isActive || a ? (d.tt = c.destroy()) : (c.isActive = !1));
          });
        };
        a.prototype.defaultFormatter = function (a) {
          var d = this.points || I(this);
          var c = [a.tooltipFooterHeaderFormatter(d[0])];
          c = c.concat(a.bodyFormatter(d));
          c.push(a.tooltipFooterHeaderFormatter(d[0], !0));
          return c;
        };
        a.prototype.destroy = function () {
          this.label && (this.label = this.label.destroy());
          this.split &&
            this.tt &&
            (this.cleanSplit(!0), (this.tt = this.tt.destroy()));
          this.renderer &&
            ((this.renderer = this.renderer.destroy()), f(this.container));
          D.clearTimeout(this.hideTimer);
          D.clearTimeout(this.tooltipTimeout);
        };
        a.prototype.getAnchor = function (a, c) {
          var d = this.chart,
            e = d.pointer,
            b = d.inverted,
            f = d.plotTop,
            g = d.plotLeft,
            l,
            q,
            m = 0,
            n = 0;
          a = I(a);
          this.followPointer && c
            ? ("undefined" === typeof c.chartX && (c = e.normalize(c)),
              (e = [c.chartX - g, c.chartY - f]))
            : a[0].tooltipPos
              ? (e = a[0].tooltipPos)
              : (a.forEach(function (a) {
                  l = a.series.yAxis;
                  q = a.series.xAxis;
                  m += a.plotX || 0;
                  n += a.plotLow
                    ? (a.plotLow + (a.plotHigh || 0)) / 2
                    : a.plotY || 0;
                  q &&
                    l &&
                    (b
                      ? ((m += f + d.plotHeight - q.len - q.pos),
                        (n += g + d.plotWidth - l.len - l.pos))
                      : ((m += q.pos - g), (n += l.pos - f)));
                }),
                (m /= a.length),
                (n /= a.length),
                (e = [b ? d.plotWidth - n : m, b ? d.plotHeight - m : n]),
                this.shared &&
                  1 < a.length &&
                  c &&
                  (b ? (e[0] = c.chartX - g) : (e[1] = c.chartY - f)));
          return e.map(Math.round);
        };
        a.prototype.getClassName = function (a, c, h) {
          var d = a.series,
            b = d.options;
          return [
            this.options.className,
            "highcharts-label",
            h && "highcharts-tooltip-header",
            c ? "highcharts-tooltip-box" : "highcharts-tooltip",
            !h && "highcharts-color-" + J(a.colorIndex, d.colorIndex),
            b && b.className,
          ]
            .filter(u)
            .join(" ");
        };
        a.prototype.getLabel = function () {
          var a = this,
            c = this.chart.styledMode,
            h = this.options,
            e = this.split && this.allowShared,
            b =
              h.style.pointerEvents ||
              (this.shouldStickOnContact() ? "auto" : "none"),
            f,
            l = this.chart.renderer;
          if (a.label) {
            var w = !a.label.hasClass("highcharts-label");
            ((e && !w) || (!e && w)) && a.destroy();
          }
          if (!this.label) {
            if (this.outside) {
              w = this.chart.options.chart.style;
              var m = E.getRendererType();
              this.container = f = g.doc.createElement("div");
              f.className = "highcharts-tooltip-container";
              n(f, {
                position: "absolute",
                top: "1px",
                pointerEvents: b,
                zIndex: Math.max(
                  this.options.style.zIndex || 0,
                  ((w && w.zIndex) || 0) + 3,
                ),
              });
              g.doc.body.appendChild(f);
              this.renderer = l = new m(
                f,
                0,
                0,
                w,
                void 0,
                void 0,
                l.styledMode,
              );
            }
            e
              ? (this.label = l.g("tooltip"))
              : ((this.label = l
                  .label(
                    "",
                    0,
                    0,
                    h.shape,
                    void 0,
                    void 0,
                    h.useHTML,
                    void 0,
                    "tooltip",
                  )
                  .attr({ padding: h.padding, r: h.borderRadius })),
                c ||
                  this.label
                    .attr({
                      fill: h.backgroundColor,
                      "stroke-width": h.borderWidth,
                    })
                    .css(h.style)
                    .css({ pointerEvents: b })
                    .shadow(h.shadow));
            c &&
              h.shadow &&
              (this.applyFilter(),
              this.label.attr({
                filter: "url(#drop-shadow-" + this.chart.index + ")",
              }));
            if (a.outside && !a.split) {
              var u = this.label,
                A = u.xSetter,
                t = u.ySetter;
              u.xSetter = function (b) {
                A.call(u, a.distance);
                f.style.left = b + "px";
              };
              u.ySetter = function (b) {
                t.call(u, a.distance);
                f.style.top = b + "px";
              };
            }
            this.label.attr({ zIndex: 8 }).add();
          }
          return this.label;
        };
        a.prototype.getPosition = function (a, c, h) {
          var d = this.chart,
            b = this.distance,
            e = {},
            f = (d.inverted && h.h) || 0,
            g = this.outside,
            l = g ? G.documentElement.clientWidth - 2 * b : d.chartWidth,
            q = g
              ? Math.max(
                  G.body.scrollHeight,
                  G.documentElement.scrollHeight,
                  G.body.offsetHeight,
                  G.documentElement.offsetHeight,
                  G.documentElement.clientHeight,
                )
              : d.chartHeight,
            m = d.pointer.getChartPosition(),
            n = function (e) {
              var f = "x" === e;
              return [e, f ? l : q, f ? a : c].concat(
                g
                  ? [
                      f ? a * m.scaleX : c * m.scaleY,
                      f
                        ? m.left - b + (h.plotX + d.plotLeft) * m.scaleX
                        : m.top - b + (h.plotY + d.plotTop) * m.scaleY,
                      0,
                      f ? l : q,
                    ]
                  : [
                      f ? a : c,
                      f ? h.plotX + d.plotLeft : h.plotY + d.plotTop,
                      f ? d.plotLeft : d.plotTop,
                      f ? d.plotLeft + d.plotWidth : d.plotTop + d.plotHeight,
                    ],
              );
            },
            u = n("y"),
            A = n("x"),
            y;
          n = !!h.negative;
          !d.polar &&
            d.hoverSeries &&
            d.hoverSeries.yAxis &&
            d.hoverSeries.yAxis.reversed &&
            (n = !n);
          var t = !this.followPointer && J(h.ttBelow, !d.inverted === n),
            r = function (a, d, c, h, k, p, l) {
              var q = g ? ("y" === a ? b * m.scaleY : b * m.scaleX) : b,
                z = (c - h) / 2,
                w = h < k - b,
                F = k + b + h < d,
                n = k - q - c + z;
              k = k + q - z;
              if (t && F) e[a] = k;
              else if (!t && w) e[a] = n;
              else if (w) e[a] = Math.min(l - h, 0 > n - f ? n : n - f);
              else if (F) e[a] = Math.max(p, k + f + c > d ? k : k + f);
              else return !1;
            },
            C = function (a, d, c, h, f) {
              var k;
              f < b || f > d - b
                ? (k = !1)
                : (e[a] =
                    f < c / 2 ? 1 : f > d - h / 2 ? d - h - 2 : f - c / 2);
              return k;
            },
            v = function (b) {
              var a = u;
              u = A;
              A = a;
              y = b;
            },
            F = function () {
              !1 !== r.apply(0, u)
                ? !1 !== C.apply(0, A) || y || (v(!0), F())
                : y
                  ? (e.x = e.y = 0)
                  : (v(!0), F());
            };
          (d.inverted || 1 < this.len) && v();
          F();
          return e;
        };
        a.prototype.hide = function (a) {
          var d = this;
          D.clearTimeout(this.hideTimer);
          a = J(a, this.options.hideDelay);
          this.isHidden ||
            (this.hideTimer = L(function () {
              d.getLabel().fadeOut(a ? void 0 : a);
              d.isHidden = !0;
            }, a));
        };
        a.prototype.init = function (a, c) {
          this.chart = a;
          this.options = c;
          this.crosshairs = [];
          this.now = { x: 0, y: 0 };
          this.isHidden = !0;
          this.split = c.split && !a.inverted && !a.polar;
          this.shared = c.shared || this.split;
          this.outside = J(
            c.outside,
            !(!a.scrollablePixelsX && !a.scrollablePixelsY),
          );
        };
        a.prototype.shouldStickOnContact = function (a) {
          return !(
            this.followPointer ||
            !this.options.stickOnContact ||
            (a && !this.chart.pointer.inClass(a.target, "highcharts-tooltip"))
          );
        };
        a.prototype.move = function (a, e, h, f) {
          var b = this,
            d = b.now,
            k =
              !1 !== b.options.animation &&
              !b.isHidden &&
              (1 < Math.abs(a - d.x) || 1 < Math.abs(e - d.y)),
            g = b.followPointer || 1 < b.len;
          c(d, {
            x: k ? (2 * d.x + a) / 3 : a,
            y: k ? (d.y + e) / 2 : e,
            anchorX: g ? void 0 : k ? (2 * d.anchorX + h) / 3 : h,
            anchorY: g ? void 0 : k ? (d.anchorY + f) / 2 : f,
          });
          b.getLabel().attr(d);
          b.drawTracker();
          k &&
            (D.clearTimeout(this.tooltipTimeout),
            (this.tooltipTimeout = setTimeout(function () {
              b && b.move(a, e, h, f);
            }, 32)));
        };
        a.prototype.refresh = function (a, c) {
          var d = this.chart,
            e = this.options,
            b = d.pointer,
            f = I(a),
            g = f[0],
            q = [],
            n = e.formatter || this.defaultFormatter,
            u = this.shared,
            A = d.styledMode,
            t = {};
          if (e.enabled && g.series) {
            D.clearTimeout(this.hideTimer);
            this.allowShared = !(!m(a) && a.series && a.series.noSharedTooltip);
            this.followPointer =
              !this.split && g.series.tooltipOptions.followPointer;
            a = this.getAnchor(a, c);
            var r = a[0],
              C = a[1];
            u && this.allowShared
              ? (b.applyInactiveState(f),
                f.forEach(function (b) {
                  b.setState("hover");
                  q.push(b.getLabelConfig());
                }),
                (t = { x: g.category, y: g.y }),
                (t.points = q))
              : (t = g.getLabelConfig());
            this.len = q.length;
            n = n.call(t, this);
            u = g.series;
            this.distance = J(u.tooltipOptions.distance, 16);
            if (!1 === n) this.hide();
            else {
              if (this.split && this.allowShared) this.renderSplit(n, f);
              else {
                var y = r,
                  v = C;
                c &&
                  b.isDirectTouch &&
                  ((y = c.chartX - d.plotLeft), (v = c.chartY - d.plotTop));
                if (
                  d.polar ||
                  !1 === u.options.clip ||
                  f.some(function (a) {
                    return b.isDirectTouch || a.series.shouldShowTooltip(y, v);
                  })
                )
                  (c = this.getLabel()),
                    (e.style.width && !A) ||
                      c.css({ width: d.spacingBox.width + "px" }),
                    c.attr({ text: n && n.join ? n.join("") : n }),
                    c.addClass(this.getClassName(g), !0),
                    A ||
                      c.attr({
                        stroke:
                          e.borderColor || g.color || u.color || "#666666",
                      }),
                    this.updatePosition({
                      plotX: r,
                      plotY: C,
                      negative: g.negative,
                      ttBelow: g.ttBelow,
                      h: a[2] || 0,
                    });
                else {
                  this.hide();
                  return;
                }
              }
              this.isHidden &&
                this.label &&
                this.label.attr({ opacity: 1 }).show();
              this.isHidden = !1;
            }
            l(this, "refresh");
          }
        };
        a.prototype.renderSplit = function (a, e) {
          function d(b, a, d, c, h) {
            void 0 === h && (h = !0);
            d
              ? ((a = W ? 0 : ba),
                (b = t(b - c / 2, P.left, P.right - c - (f.outside ? U : 0))))
              : ((a -= Z),
                (b = h ? b - c - D : b + D),
                (b = t(b, h ? b : P.left, P.right)));
            return { x: b, y: a };
          }
          var f = this,
            b = f.chart,
            p = f.chart,
            g = p.chartWidth,
            l = p.chartHeight,
            q = p.plotHeight,
            m = p.plotLeft,
            n = p.plotTop,
            A = p.pointer,
            C = p.scrollablePixelsY;
          C = void 0 === C ? 0 : C;
          var v = p.scrollablePixelsX,
            y = p.scrollingContainer;
          y = void 0 === y ? { scrollLeft: 0, scrollTop: 0 } : y;
          var I = y.scrollLeft;
          y = y.scrollTop;
          var x = p.styledMode,
            D = f.distance,
            B = f.options,
            F = f.options.positioner,
            P =
              f.outside && "number" !== typeof v
                ? G.documentElement.getBoundingClientRect()
                : { left: I, right: I + g, top: y, bottom: y + l },
            M = f.getLabel(),
            X = this.renderer || b.renderer,
            W = !(!b.xAxis[0] || !b.xAxis[0].opposite);
          b = A.getChartPosition();
          var U = b.left;
          b = b.top;
          var Z = n + y,
            L = 0,
            ba = q - C;
          u(a) && (a = [!1, a]);
          a = a.slice(0, e.length + 1).reduce(function (b, a, c) {
            if (!1 !== a && "" !== a) {
              c = e[c - 1] || {
                isHeader: !0,
                plotX: e[0].plotX,
                plotY: q,
                series: {},
              };
              var h = c.isHeader,
                k = h ? f : c.series;
              a = a.toString();
              var p = k.tt,
                g = c.isHeader;
              var l = c.series;
              p ||
                ((p = { padding: B.padding, r: B.borderRadius }),
                x ||
                  ((p.fill = B.backgroundColor),
                  (p["stroke-width"] = B.borderWidth)),
                (p = X.label(
                  "",
                  0,
                  0,
                  B[g ? "headerShape" : "shape"],
                  void 0,
                  void 0,
                  B.useHTML,
                )
                  .addClass(f.getClassName(c, !0, g))
                  .attr(p)
                  .add(M)));
              p.isActive = !0;
              p.attr({ text: a });
              x ||
                p
                  .css(B.style)
                  .shadow(B.shadow)
                  .attr({
                    stroke: B.borderColor || c.color || l.color || "#333333",
                  });
              k = k.tt = p;
              g = k.getBBox();
              a = g.width + k.strokeWidth();
              h && ((L = g.height), (ba += L), W && (Z -= L));
              l = c.plotX;
              l = void 0 === l ? 0 : l;
              p = c.plotY;
              p = void 0 === p ? 0 : p;
              var w = c.series;
              if (c.isHeader) {
                l = m + l;
                var z = n + q / 2;
              } else {
                var u = w.xAxis,
                  y = w.yAxis;
                l = u.pos + t(l, -D, u.len + D);
                w.shouldShowTooltip(0, y.pos - n + p, { ignoreX: !0 }) &&
                  (z = y.pos + p);
              }
              l = t(l, P.left - D, P.right + D);
              "number" === typeof z
                ? ((g = g.height + 1),
                  (p = F ? F.call(f, a, g, c) : d(l, z, h, a)),
                  b.push({
                    align: F ? 0 : void 0,
                    anchorX: l,
                    anchorY: z,
                    boxWidth: a,
                    point: c,
                    rank: J(p.rank, h ? 1 : 0),
                    size: g,
                    target: p.y,
                    tt: k,
                    x: p.x,
                  }))
                : (k.isActive = !1);
            }
            return b;
          }, []);
          !F &&
            a.some(function (b) {
              var a = (f.outside ? U : 0) + b.anchorX;
              return a < P.left && a + b.boxWidth < P.right
                ? !0
                : a < U - P.left + b.boxWidth && P.right - a > a;
            }) &&
            (a = a.map(function (b) {
              var a = d(b.anchorX, b.anchorY, b.point.isHeader, b.boxWidth, !1);
              return c(b, { target: a.y, x: a.x });
            }));
          f.cleanSplit();
          r(a, ba);
          var E = U,
            da = U;
          a.forEach(function (b) {
            var a = b.x,
              d = b.boxWidth;
            b = b.isHeader;
            b ||
              (f.outside && U + a < E && (E = U + a),
              !b && f.outside && E + d > da && (da = U + a));
          });
          a.forEach(function (b) {
            var a = b.x,
              d = b.anchorX,
              c = b.pos,
              h = b.point.isHeader;
            c = {
              visibility: "undefined" === typeof c ? "hidden" : "inherit",
              x: a,
              y: (c || 0) + Z,
              anchorX: d,
              anchorY: b.anchorY,
            };
            if (f.outside && a < d) {
              var e = U - E;
              0 < e &&
                (h || ((c.x = a + e), (c.anchorX = d + e)),
                h && ((c.x = (da - E) / 2), (c.anchorX = d + e)));
            }
            b.tt.attr(c);
          });
          a = f.container;
          C = f.renderer;
          f.outside &&
            a &&
            C &&
            ((p = M.getBBox()),
            C.setSize(p.width + p.x, p.height + p.y, !1),
            (a.style.left = E + "px"),
            (a.style.top = b + "px"));
        };
        a.prototype.drawTracker = function () {
          if (this.shouldStickOnContact()) {
            var a = this.chart,
              c = this.label,
              h = this.shared ? a.hoverPoints : a.hoverPoint;
            if (c && h) {
              var e = { x: 0, y: 0, width: 0, height: 0 };
              h = this.getAnchor(h);
              var b = c.getBBox();
              h[0] += a.plotLeft - c.translateX;
              h[1] += a.plotTop - c.translateY;
              e.x = Math.min(0, h[0]);
              e.y = Math.min(0, h[1]);
              e.width =
                0 > h[0]
                  ? Math.max(Math.abs(h[0]), b.width - h[0])
                  : Math.max(Math.abs(h[0]), b.width);
              e.height =
                0 > h[1]
                  ? Math.max(Math.abs(h[1]), b.height - Math.abs(h[1]))
                  : Math.max(Math.abs(h[1]), b.height);
              this.tracker
                ? this.tracker.attr(e)
                : ((this.tracker = c.renderer
                    .rect(e)
                    .addClass("highcharts-tracker")
                    .add(c)),
                  a.styledMode || this.tracker.attr({ fill: "rgba(0,0,0,0)" }));
            }
          } else this.tracker && this.tracker.destroy();
        };
        a.prototype.styledModeFormat = function (a) {
          return a
            .replace('style="font-size: 10px"', 'class="highcharts-header"')
            .replace(
              /style="color:{(point|series)\.color}"/g,
              'class="highcharts-color-{$1.colorIndex} {series.options.className} {point.options.className}"',
            );
        };
        a.prototype.tooltipFooterHeaderFormatter = function (a, c) {
          var d = a.series,
            f = d.tooltipOptions,
            b = d.xAxis,
            p = b && b.dateTime;
          b = { isFooter: c, labelConfig: a };
          var g = f.xDateFormat,
            q = f[c ? "footerFormat" : "headerFormat"];
          l(this, "headerFormatter", b, function (b) {
            p &&
              !g &&
              e(a.key) &&
              (g = p.getXDateFormat(a.key, f.dateTimeLabelFormats));
            p &&
              g &&
              ((a.point && a.point.tooltipDateKeys) || ["key"]).forEach(
                function (b) {
                  q = q.replace(
                    "{point." + b + "}",
                    "{point." + b + ":" + g + "}",
                  );
                },
              );
            d.chart.styledMode && (q = this.styledModeFormat(q));
            b.text = v(q, { point: a, series: d }, this.chart);
          });
          return b.text;
        };
        a.prototype.update = function (a) {
          this.destroy();
          C(!0, this.chart.options.tooltip.userOptions, a);
          this.init(this.chart, C(!0, this.options, a));
        };
        a.prototype.updatePosition = function (a) {
          var d = this.chart,
            c = this.options,
            e = d.pointer,
            b = this.getLabel();
          e = e.getChartPosition();
          var f = (c.positioner || this.getPosition).call(
              this,
              b.width,
              b.height,
              a,
            ),
            g = a.plotX + d.plotLeft;
          a = a.plotY + d.plotTop;
          if (this.outside) {
            c = c.borderWidth + 2 * this.distance;
            this.renderer.setSize(b.width + c, b.height + c, !1);
            if (1 !== e.scaleX || 1 !== e.scaleY)
              n(this.container, {
                transform: "scale("
                  .concat(e.scaleX, ", ")
                  .concat(e.scaleY, ")"),
              }),
                (g *= e.scaleX),
                (a *= e.scaleY);
            g += e.left - f.x;
            a += e.top - f.y;
          }
          this.move(Math.round(f.x), Math.round(f.y || 0), g, a);
        };
        return a;
      })();
      ("");
      return a;
    },
  );
  K(
    g,
    "Core/Series/Point.js",
    [
      g["Core/Renderer/HTML/AST.js"],
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Defaults.js"],
      g["Core/FormatUtilities.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D) {
      var v = g.animObject,
        G = x.defaultOptions,
        r = E.format,
        t = D.addEvent,
        n = D.defined,
        f = D.erase,
        c = D.extend,
        l = D.fireEvent,
        m = D.getNestedProperty,
        e = D.isArray,
        u = D.isFunction,
        C = D.isNumber,
        J = D.isObject,
        I = D.merge,
        L = D.objectEach,
        A = D.pick,
        d = D.syncTimeout,
        q = D.removeEvent,
        h = D.uniqueKey;
      g = (function () {
        function k() {
          this.category = void 0;
          this.formatPrefix = "point";
          this.id = void 0;
          this.isNull = !1;
          this.percentage = this.options = this.name = void 0;
          this.selected = !1;
          this.total = this.shapeArgs = this.series = void 0;
          this.visible = !0;
          this.x = void 0;
        }
        k.prototype.animateBeforeDestroy = function () {
          var b = this,
            a = { x: b.startXPos, opacity: 0 },
            d = b.getGraphicalProps();
          d.singular.forEach(function (d) {
            b[d] = b[d].animate(
              "dataLabel" === d
                ? { x: b[d].startXPos, y: b[d].startYPos, opacity: 0 }
                : a,
            );
          });
          d.plural.forEach(function (a) {
            b[a].forEach(function (a) {
              a.element &&
                a.animate(
                  c(
                    { x: b.startXPos },
                    a.startYPos ? { x: a.startXPos, y: a.startYPos } : {},
                  ),
                );
            });
          });
        };
        k.prototype.applyOptions = function (b, a) {
          var d = this.series,
            h = d.options.pointValKey || d.pointValKey;
          b = k.prototype.optionsToObject.call(this, b);
          c(this, b);
          this.options = this.options ? c(this.options, b) : b;
          b.group && delete this.group;
          b.dataLabels && delete this.dataLabels;
          h && (this.y = k.prototype.getNestedProperty.call(this, h));
          this.formatPrefix = (this.isNull = this.isValid && !this.isValid())
            ? "null"
            : "point";
          this.selected && (this.state = "select");
          "name" in this &&
            "undefined" === typeof a &&
            d.xAxis &&
            d.xAxis.hasNames &&
            (this.x = d.xAxis.nameToX(this));
          "undefined" === typeof this.x && d
            ? (this.x = "undefined" === typeof a ? d.autoIncrement() : a)
            : C(b.x) &&
              d.options.relativeXValue &&
              (this.x = d.autoIncrement(b.x));
          return this;
        };
        k.prototype.destroy = function () {
          function b() {
            if (a.graphic || a.graphics || a.dataLabel || a.dataLabels)
              q(a), a.destroyElements();
            for (g in a) a[g] = null;
          }
          var a = this,
            c = a.series,
            h = c.chart;
          c = c.options.dataSorting;
          var e = h.hoverPoints,
            k = v(a.series.chart.renderer.globalAnimation),
            g;
          a.legendItem && h.legend.destroyItem(a);
          e && (a.setState(), f(e, a), e.length || (h.hoverPoints = null));
          if (a === h.hoverPoint) a.onMouseOut();
          c && c.enabled
            ? (this.animateBeforeDestroy(), d(b, k.duration))
            : b();
          h.pointCount--;
        };
        k.prototype.destroyElements = function (b) {
          var a = this;
          b = a.getGraphicalProps(b);
          b.singular.forEach(function (b) {
            a[b] = a[b].destroy();
          });
          b.plural.forEach(function (b) {
            a[b].forEach(function (b) {
              b.element && b.destroy();
            });
            delete a[b];
          });
        };
        k.prototype.firePointEvent = function (b, a, d) {
          var c = this,
            h = this.series.options;
          (h.point.events[b] ||
            (c.options && c.options.events && c.options.events[b])) &&
            c.importEvents();
          "click" === b &&
            h.allowPointSelect &&
            (d = function (b) {
              c.select && c.select(null, b.ctrlKey || b.metaKey || b.shiftKey);
            });
          l(c, b, a, d);
        };
        k.prototype.getClassName = function () {
          return (
            "highcharts-point" +
            (this.selected ? " highcharts-point-select" : "") +
            (this.negative ? " highcharts-negative" : "") +
            (this.isNull ? " highcharts-null-point" : "") +
            ("undefined" !== typeof this.colorIndex
              ? " highcharts-color-" + this.colorIndex
              : "") +
            (this.options.className ? " " + this.options.className : "") +
            (this.zone && this.zone.className
              ? " " + this.zone.className.replace("highcharts-negative", "")
              : "")
          );
        };
        k.prototype.getGraphicalProps = function (b) {
          var a = this,
            d = [],
            c = { singular: [], plural: [] },
            h;
          b = b || { graphic: 1, dataLabel: 1 };
          b.graphic && d.push("graphic", "shadowGroup");
          b.dataLabel &&
            d.push("dataLabel", "dataLabelPath", "dataLabelUpper", "connector");
          for (h = d.length; h--; ) {
            var e = d[h];
            a[e] && c.singular.push(e);
          }
          ["graphic", "dataLabel", "connector"].forEach(function (d) {
            var h = d + "s";
            b[d] && a[h] && c.plural.push(h);
          });
          return c;
        };
        k.prototype.getLabelConfig = function () {
          return {
            x: this.category,
            y: this.y,
            color: this.color,
            colorIndex: this.colorIndex,
            key: this.name || this.category,
            series: this.series,
            point: this,
            percentage: this.percentage,
            total: this.total || this.stackTotal,
          };
        };
        k.prototype.getNestedProperty = function (b) {
          if (b)
            return 0 === b.indexOf("custom.") ? m(b, this.options) : this[b];
        };
        k.prototype.getZone = function () {
          var b = this.series,
            a = b.zones;
          b = b.zoneAxis || "y";
          var d,
            c = 0;
          for (d = a[c]; this[b] >= d.value; ) d = a[++c];
          this.nonZonedColor || (this.nonZonedColor = this.color);
          this.color =
            d && d.color && !this.options.color ? d.color : this.nonZonedColor;
          return d;
        };
        k.prototype.hasNewShapeType = function () {
          return (
            (this.graphic &&
              (this.graphic.symbolName || this.graphic.element.nodeName)) !==
            this.shapeType
          );
        };
        k.prototype.init = function (b, a, d) {
          this.series = b;
          this.applyOptions(a, d);
          this.id = n(this.id) ? this.id : h();
          this.resolveColor();
          b.chart.pointCount++;
          l(this, "afterInit");
          return this;
        };
        k.prototype.isValid = function () {
          return null !== this.x && C(this.y);
        };
        k.prototype.optionsToObject = function (b) {
          var a = this.series,
            d = a.options.keys,
            c = d || a.pointArrayMap || ["y"],
            h = c.length,
            f = {},
            g = 0,
            l = 0;
          if (C(b) || null === b) f[c[0]] = b;
          else if (e(b))
            for (
              !d &&
              b.length > h &&
              ((a = typeof b[0]),
              "string" === a ? (f.name = b[0]) : "number" === a && (f.x = b[0]),
              g++);
              l < h;

            )
              (d && "undefined" === typeof b[g]) ||
                (0 < c[l].indexOf(".")
                  ? k.prototype.setNestedProperty(f, b[g], c[l])
                  : (f[c[l]] = b[g])),
                g++,
                l++;
          else
            "object" === typeof b &&
              ((f = b),
              b.dataLabels && (a._hasPointLabels = !0),
              b.marker && (a._hasPointMarkers = !0));
          return f;
        };
        k.prototype.resolveColor = function () {
          var b = this.series,
            a = b.chart.styledMode;
          var d = b.chart.options.chart.colorCount;
          delete this.nonZonedColor;
          if (b.options.colorByPoint) {
            if (!a) {
              d = b.options.colors || b.chart.options.colors;
              var c = d[b.colorCounter];
              d = d.length;
            }
            a = b.colorCounter;
            b.colorCounter++;
            b.colorCounter === d && (b.colorCounter = 0);
          } else a || (c = b.color), (a = b.colorIndex);
          this.colorIndex = A(this.options.colorIndex, a);
          this.color = A(this.options.color, c);
        };
        k.prototype.setNestedProperty = function (b, a, d) {
          d.split(".").reduce(function (b, d, c, h) {
            b[d] = h.length - 1 === c ? a : J(b[d], !0) ? b[d] : {};
            return b[d];
          }, b);
          return b;
        };
        k.prototype.shouldDraw = function () {
          return !this.isNull;
        };
        k.prototype.tooltipFormatter = function (b) {
          var a = this.series,
            d = a.tooltipOptions,
            c = A(d.valueDecimals, ""),
            h = d.valuePrefix || "",
            e = d.valueSuffix || "";
          a.chart.styledMode && (b = a.chart.tooltip.styledModeFormat(b));
          (a.pointArrayMap || ["y"]).forEach(function (a) {
            a = "{point." + a;
            if (h || e) b = b.replace(RegExp(a + "}", "g"), h + a + "}" + e);
            b = b.replace(RegExp(a + "}", "g"), a + ":,." + c + "f}");
          });
          return r(b, { point: this, series: this.series }, a.chart);
        };
        k.prototype.update = function (b, a, d, c) {
          function h() {
            e.applyOptions(b);
            var c = k && e.hasMockGraphic;
            c = null === e.y ? !c : c;
            k && c && ((e.graphic = k.destroy()), delete e.hasMockGraphic);
            J(b, !0) &&
              (k &&
                k.element &&
                b &&
                b.marker &&
                "undefined" !== typeof b.marker.symbol &&
                (e.graphic = k.destroy()),
              b &&
                b.dataLabels &&
                e.dataLabel &&
                (e.dataLabel = e.dataLabel.destroy()),
              e.connector && (e.connector = e.connector.destroy()));
            l = e.index;
            f.updateParallelArrays(e, l);
            p.data[l] =
              J(p.data[l], !0) || J(b, !0) ? e.options : A(b, p.data[l]);
            f.isDirty = f.isDirtyData = !0;
            !f.fixedBox && f.hasCartesianSeries && (g.isDirtyBox = !0);
            "point" === p.legendType && (g.isDirtyLegend = !0);
            a && g.redraw(d);
          }
          var e = this,
            f = e.series,
            k = e.graphic,
            g = f.chart,
            p = f.options,
            l;
          a = A(a, !0);
          !1 === c ? h() : e.firePointEvent("update", { options: b }, h);
        };
        k.prototype.remove = function (b, a) {
          this.series.removePoint(this.series.data.indexOf(this), b, a);
        };
        k.prototype.select = function (b, a) {
          var d = this,
            c = d.series,
            h = c.chart;
          this.selectedStaging = b = A(b, !d.selected);
          d.firePointEvent(
            b ? "select" : "unselect",
            { accumulate: a },
            function () {
              d.selected = d.options.selected = b;
              c.options.data[c.data.indexOf(d)] = d.options;
              d.setState(b && "select");
              a ||
                h.getSelectedPoints().forEach(function (b) {
                  var a = b.series;
                  b.selected &&
                    b !== d &&
                    ((b.selected = b.options.selected = !1),
                    (a.options.data[a.data.indexOf(b)] = b.options),
                    b.setState(
                      h.hoverPoints && a.options.inactiveOtherPoints
                        ? "inactive"
                        : "",
                    ),
                    b.firePointEvent("unselect"));
                });
            },
          );
          delete this.selectedStaging;
        };
        k.prototype.onMouseOver = function (b) {
          var a = this.series.chart,
            d = a.pointer;
          b = b
            ? d.normalize(b)
            : d.getChartCoordinatesFromPoint(this, a.inverted);
          d.runPointActions(b, this);
        };
        k.prototype.onMouseOut = function () {
          var b = this.series.chart;
          this.firePointEvent("mouseOut");
          this.series.options.inactiveOtherPoints ||
            (b.hoverPoints || []).forEach(function (b) {
              b.setState();
            });
          b.hoverPoints = b.hoverPoint = null;
        };
        k.prototype.importEvents = function () {
          if (!this.hasImportedEvents) {
            var b = this,
              a = I(b.series.options.point, b.options).events;
            b.events = a;
            L(a, function (a, d) {
              u(a) && t(b, d, a);
            });
            this.hasImportedEvents = !0;
          }
        };
        k.prototype.setState = function (b, d) {
          var h = this.series,
            e = this.state,
            f = h.options.states[b || "normal"] || {},
            k = G.plotOptions[h.type].marker && h.options.marker,
            g = k && !1 === k.enabled,
            p = (k && k.states && k.states[b || "normal"]) || {},
            q = !1 === p.enabled,
            m = this.marker || {},
            n = h.chart,
            u = k && h.markerAttribs,
            t = h.halo,
            r,
            v = h.stateMarkerGraphic;
          b = b || "";
          if (
            !(
              (b === this.state && !d) ||
              (this.selected && "select" !== b) ||
              !1 === f.enabled ||
              (b && (q || (g && !1 === p.enabled))) ||
              (b && m.states && m.states[b] && !1 === m.states[b].enabled)
            )
          ) {
            this.state = b;
            u && (r = h.markerAttribs(this, b));
            if (this.graphic && !this.hasMockGraphic) {
              e && this.graphic.removeClass("highcharts-point-" + e);
              b && this.graphic.addClass("highcharts-point-" + b);
              if (!n.styledMode) {
                e = h.pointAttribs(this, b);
                var F = A(n.options.chart.animation, f.animation);
                var P = e.opacity;
                h.options.inactiveOtherPoints &&
                  C(P) &&
                  ((this.dataLabels || []).forEach(function (b) {
                    b &&
                      !b.hasClass("highcharts-data-label-hidden") &&
                      b.animate({ opacity: P }, F);
                  }),
                  this.connector && this.connector.animate({ opacity: P }, F));
                this.graphic.animate(e, F);
              }
              r &&
                this.graphic.animate(
                  r,
                  A(n.options.chart.animation, p.animation, k.animation),
                );
              v && v.hide();
            } else {
              if (b && p) {
                k = m.symbol || h.symbol;
                v && v.currentSymbol !== k && (v = v.destroy());
                if (r)
                  if (v) v[d ? "animate" : "attr"]({ x: r.x, y: r.y });
                  else
                    k &&
                      ((h.stateMarkerGraphic = v =
                        n.renderer
                          .symbol(k, r.x, r.y, r.width, r.height)
                          .add(h.markerGroup)),
                      (v.currentSymbol = k));
                !n.styledMode &&
                  v &&
                  "inactive" !== this.state &&
                  v.attr(h.pointAttribs(this, b));
              }
              v &&
                (v[b && this.isInside ? "show" : "hide"](),
                (v.element.point = this),
                v.addClass(this.getClassName(), !0));
            }
            f = f.halo;
            r = ((v = this.graphic || v) && v.visibility) || "inherit";
            f && f.size && v && "hidden" !== r && !this.isCluster
              ? (t || (h.halo = t = n.renderer.path().add(v.parentGroup)),
                t.show()[d ? "animate" : "attr"]({ d: this.haloPath(f.size) }),
                t.attr({
                  class:
                    "highcharts-halo highcharts-color-" +
                    A(this.colorIndex, h.colorIndex) +
                    (this.className ? " " + this.className : ""),
                  visibility: r,
                  zIndex: -1,
                }),
                (t.point = this),
                n.styledMode ||
                  t.attr(
                    c(
                      {
                        fill: this.color || h.color,
                        "fill-opacity": f.opacity,
                      },
                      a.filterUserAttributes(f.attributes || {}),
                    ),
                  ))
              : t &&
                t.point &&
                t.point.haloPath &&
                t.animate({ d: t.point.haloPath(0) }, null, t.hide);
            l(this, "afterSetState", { state: b });
          }
        };
        k.prototype.haloPath = function (b) {
          return this.series.chart.renderer.symbols.circle(
            Math.floor(this.plotX) - b,
            this.plotY - b,
            2 * b,
            2 * b,
          );
        };
        return k;
      })();
      ("");
      return g;
    },
  );
  K(
    g,
    "Core/Pointer.js",
    [
      g["Core/Color/Color.js"],
      g["Core/Globals.js"],
      g["Core/Tooltip.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E) {
      var v = a.parse,
        B = g.charts,
        G = g.noop,
        r = E.addEvent,
        t = E.attr,
        n = E.css,
        f = E.defined,
        c = E.extend,
        l = E.find,
        m = E.fireEvent,
        e = E.isNumber,
        u = E.isObject,
        C = E.objectEach,
        J = E.offset,
        I = E.pick,
        L = E.splat;
      a = (function () {
        function a(a, c) {
          this.lastValidTouch = {};
          this.pinchDown = [];
          this.runChartClick = !1;
          this.eventsToUnbind = [];
          this.chart = a;
          this.hasDragged = !1;
          this.options = c;
          this.init(a, c);
        }
        a.prototype.applyInactiveState = function (a) {
          var d = [],
            c;
          (a || []).forEach(function (a) {
            c = a.series;
            d.push(c);
            c.linkedParent && d.push(c.linkedParent);
            c.linkedSeries && (d = d.concat(c.linkedSeries));
            c.navigatorSeries && d.push(c.navigatorSeries);
          });
          this.chart.series.forEach(function (a) {
            -1 === d.indexOf(a)
              ? a.setState("inactive", !0)
              : a.options.inactiveOtherPoints &&
                a.setAllPointsToState("inactive");
          });
        };
        a.prototype.destroy = function () {
          var d = this;
          this.eventsToUnbind.forEach(function (a) {
            return a();
          });
          this.eventsToUnbind = [];
          g.chartCount ||
            (a.unbindDocumentMouseUp &&
              (a.unbindDocumentMouseUp = a.unbindDocumentMouseUp()),
            a.unbindDocumentTouchEnd &&
              (a.unbindDocumentTouchEnd = a.unbindDocumentTouchEnd()));
          clearInterval(d.tooltipTimeout);
          C(d, function (a, c) {
            d[c] = void 0;
          });
        };
        a.prototype.getSelectionMarkerAttrs = function (a, c) {
          var d = this,
            e = {
              args: { chartX: a, chartY: c },
              attrs: {},
              shapeType: "rect",
            };
          m(this, "getSelectionMarkerAttrs", e, function (b) {
            var h = d.chart,
              e = d.mouseDownX;
            e = void 0 === e ? 0 : e;
            var f = d.mouseDownY;
            f = void 0 === f ? 0 : f;
            var k = d.zoomHor,
              g = d.zoomVert;
            b = b.attrs;
            b.x = h.plotLeft;
            b.y = h.plotTop;
            b.width = k ? 1 : h.plotWidth;
            b.height = g ? 1 : h.plotHeight;
            k &&
              ((h = a - e),
              (b.width = Math.abs(h)),
              (b.x = (0 < h ? 0 : h) + e));
            g &&
              ((h = c - f),
              (b.height = Math.abs(h)),
              (b.y = (0 < h ? 0 : h) + f));
          });
          return e;
        };
        a.prototype.drag = function (a) {
          var d = this.chart,
            c = d.options.chart,
            e = d.plotLeft,
            b = d.plotTop,
            f = d.plotWidth,
            g = d.plotHeight,
            l = this.mouseDownX || 0,
            m = this.mouseDownY || 0,
            n = u(c.panning) ? c.panning && c.panning.enabled : c.panning,
            A = c.panKey && a[c.panKey + "Key"],
            t = a.chartX,
            r = a.chartY,
            C = this.selectionMarker;
          (C && C.touch) ||
            (t < e ? (t = e) : t > e + f && (t = e + f),
            r < b ? (r = b) : r > b + g && (r = b + g),
            (this.hasDragged = Math.sqrt(
              Math.pow(l - t, 2) + Math.pow(m - r, 2),
            )),
            10 < this.hasDragged &&
              ((e = d.isInsidePlot(l - e, m - b, { visiblePlotOnly: !0 })),
              (r = this.getSelectionMarkerAttrs(t, r)),
              (t = r.shapeType),
              (r = r.attrs),
              (!d.hasCartesianSeries && !d.mapView) ||
                (!this.zoomX && !this.zoomY) ||
                !e ||
                A ||
                C ||
                ((this.selectionMarker = C = d.renderer[t]()),
                C.attr({
                  class: "highcharts-selection-marker",
                  zIndex: 7,
                }).add(),
                d.styledMode ||
                  C.attr({
                    fill:
                      c.selectionMarkerFill ||
                      v("#335cad").setOpacity(0.25).get(),
                  })),
              C && C.attr(r),
              e && !C && n && d.pan(a, c.panning)));
        };
        a.prototype.dragStart = function (a) {
          var d = this.chart;
          d.mouseIsDown = a.type;
          d.cancelClick = !1;
          d.mouseDownX = this.mouseDownX = a.chartX;
          d.mouseDownY = this.mouseDownY = a.chartY;
        };
        a.prototype.getSelectionBox = function (a) {
          var d = { args: { marker: a }, result: {} };
          m(this, "getSelectionBox", d, function (d) {
            d.result = {
              x: a.attr ? +a.attr("x") : a.x,
              y: a.attr ? +a.attr("y") : a.y,
              width: a.attr ? a.attr("width") : a.width,
              height: a.attr ? a.attr("height") : a.height,
            };
          });
          return d.result;
        };
        a.prototype.drop = function (a) {
          var d = this,
            h = this.chart,
            k = this.hasPinched;
          if (this.selectionMarker) {
            var b = this.getSelectionBox(this.selectionMarker),
              g = b.x,
              l = b.y,
              w = b.width,
              u = b.height,
              A = {
                originalEvent: a,
                xAxis: [],
                yAxis: [],
                x: g,
                y: l,
                width: w,
                height: u,
              },
              t = !!h.mapView;
            if (this.hasDragged || k)
              h.axes.forEach(function (b) {
                if (
                  b.zoomEnabled &&
                  f(b.min) &&
                  (k || d[{ xAxis: "zoomX", yAxis: "zoomY" }[b.coll]]) &&
                  e(g) &&
                  e(l) &&
                  e(w) &&
                  e(u)
                ) {
                  var c = b.horiz,
                    h = "touchend" === a.type ? b.minPixelPadding : 0,
                    p = b.toValue((c ? g : l) + h);
                  c = b.toValue((c ? g + w : l + u) - h);
                  A[b.coll].push({
                    axis: b,
                    min: Math.min(p, c),
                    max: Math.max(p, c),
                  });
                  t = !0;
                }
              }),
                t &&
                  m(h, "selection", A, function (b) {
                    h.zoom(c(b, k ? { animation: !1 } : null));
                  });
            e(h.index) &&
              (this.selectionMarker = this.selectionMarker.destroy());
            k && this.scaleGroups();
          }
          h &&
            e(h.index) &&
            (n(h.container, { cursor: h._cursor }),
            (h.cancelClick = 10 < this.hasDragged),
            (h.mouseIsDown = this.hasDragged = this.hasPinched = !1),
            (this.pinchDown = []));
        };
        a.prototype.findNearestKDPoint = function (a, c, h) {
          var d;
          a.forEach(function (b) {
            var a =
              !(b.noSharedTooltip && c) &&
              0 > b.options.findNearestPointBy.indexOf("y");
            b = b.searchPoint(h, a);
            if ((a = u(b, !0) && b.series) && !(a = !u(d, !0))) {
              a = d.distX - b.distX;
              var e = d.dist - b.dist,
                f =
                  (b.series.group && b.series.group.zIndex) -
                  (d.series.group && d.series.group.zIndex);
              a =
                0 <
                (0 !== a && c
                  ? a
                  : 0 !== e
                    ? e
                    : 0 !== f
                      ? f
                      : d.series.index > b.series.index
                        ? -1
                        : 1);
            }
            a && (d = b);
          });
          return d;
        };
        a.prototype.getChartCoordinatesFromPoint = function (a, c) {
          var d = a.series,
            f = d.xAxis;
          d = d.yAxis;
          var b = a.shapeArgs;
          if (f && d) {
            var g = I(a.clientX, a.plotX),
              l = a.plotY || 0;
            a.isNode && b && e(b.x) && e(b.y) && ((g = b.x), (l = b.y));
            return c
              ? { chartX: d.len + d.pos - l, chartY: f.len + f.pos - g }
              : { chartX: g + f.pos, chartY: l + d.pos };
          }
          if (b && b.x && b.y) return { chartX: b.x, chartY: b.y };
        };
        a.prototype.getChartPosition = function () {
          if (this.chartPosition) return this.chartPosition;
          var a = this.chart.container,
            c = J(a);
          this.chartPosition = {
            left: c.left,
            top: c.top,
            scaleX: 1,
            scaleY: 1,
          };
          var h = a.offsetWidth;
          a = a.offsetHeight;
          2 < h &&
            2 < a &&
            ((this.chartPosition.scaleX = c.width / h),
            (this.chartPosition.scaleY = c.height / a));
          return this.chartPosition;
        };
        a.prototype.getCoordinates = function (a) {
          var d = { xAxis: [], yAxis: [] };
          this.chart.axes.forEach(function (c) {
            d[c.isXAxis ? "xAxis" : "yAxis"].push({
              axis: c,
              value: c.toValue(a[c.horiz ? "chartX" : "chartY"]),
            });
          });
          return d;
        };
        a.prototype.getHoverData = function (a, c, h, e, b, f) {
          var d = [];
          e = !(!e || !a);
          var g = function (a) {
              return (
                a.visible &&
                !(!b && a.directTouch) &&
                I(a.options.enableMouseTracking, !0)
              );
            },
            k = {
              chartX: f ? f.chartX : void 0,
              chartY: f ? f.chartY : void 0,
              shared: b,
            };
          m(this, "beforeGetHoverData", k);
          var p =
            c && !c.stickyTracking
              ? [c]
              : h.filter(function (b) {
                  return b.stickyTracking && (k.filter || g)(b);
                });
          var q = e || !f ? a : this.findNearestKDPoint(p, b, f);
          c = q && q.series;
          q &&
            (b && !c.noSharedTooltip
              ? ((p = h.filter(function (b) {
                  return k.filter ? k.filter(b) : g(b) && !b.noSharedTooltip;
                })),
                p.forEach(function (b) {
                  var a = l(b.points, function (b) {
                    return b.x === q.x && !b.isNull;
                  });
                  u(a) &&
                    (b.boosted && b.boost && (a = b.boost.getPoint(a)),
                    d.push(a));
                }))
              : d.push(q));
          k = { hoverPoint: q };
          m(this, "afterGetHoverData", k);
          return { hoverPoint: k.hoverPoint, hoverSeries: c, hoverPoints: d };
        };
        a.prototype.getPointFromEvent = function (a) {
          a = a.target;
          for (var d; a && !d; ) (d = a.point), (a = a.parentNode);
          return d;
        };
        a.prototype.onTrackerMouseOut = function (a) {
          a = a.relatedTarget || a.toElement;
          var d = this.chart.hoverSeries;
          this.isDirectTouch = !1;
          if (
            !(
              !d ||
              !a ||
              d.stickyTracking ||
              this.inClass(a, "highcharts-tooltip") ||
              (this.inClass(a, "highcharts-series-" + d.index) &&
                this.inClass(a, "highcharts-tracker"))
            )
          )
            d.onMouseOut();
        };
        a.prototype.inClass = function (a, c) {
          for (var d; a; ) {
            if ((d = t(a, "class"))) {
              if (-1 !== d.indexOf(c)) return !0;
              if (-1 !== d.indexOf("highcharts-container")) return !1;
            }
            a = a.parentElement;
          }
        };
        a.prototype.init = function (a, c) {
          this.options = c;
          this.chart = a;
          this.runChartClick = !(!c.chart.events || !c.chart.events.click);
          this.pinchDown = [];
          this.lastValidTouch = {};
          x && (a.tooltip = new x(a, c.tooltip));
          this.setDOMEvents();
        };
        a.prototype.normalize = function (a, e) {
          var d = a.touches,
            f = d
              ? d.length
                ? d.item(0)
                : I(d.changedTouches, a.changedTouches)[0]
              : a;
          e || (e = this.getChartPosition());
          d = f.pageX - e.left;
          f = f.pageY - e.top;
          d /= e.scaleX;
          f /= e.scaleY;
          return c(a, { chartX: Math.round(d), chartY: Math.round(f) });
        };
        a.prototype.onContainerClick = function (a) {
          var d = this.chart,
            h = d.hoverPoint;
          a = this.normalize(a);
          var e = d.plotLeft,
            b = d.plotTop;
          d.cancelClick ||
            (h && this.inClass(a.target, "highcharts-tracker")
              ? (m(h.series, "click", c(a, { point: h })),
                d.hoverPoint && h.firePointEvent("click", a))
              : (c(a, this.getCoordinates(a)),
                d.isInsidePlot(a.chartX - e, a.chartY - b, {
                  visiblePlotOnly: !0,
                }) && m(d, "click", a)));
        };
        a.prototype.onContainerMouseDown = function (a) {
          var d = 1 === ((a.buttons || a.button) & 1);
          a = this.normalize(a);
          if (g.isFirefox && 0 !== a.button) this.onContainerMouseMove(a);
          if ("undefined" === typeof a.button || d)
            this.zoomOption(a),
              d && a.preventDefault && a.preventDefault(),
              this.dragStart(a);
        };
        a.prototype.onContainerMouseLeave = function (d) {
          var c = B[I(a.hoverChartIndex, -1)],
            h = this.chart.tooltip;
          d = this.normalize(d);
          c &&
            (d.relatedTarget || d.toElement) &&
            (c.pointer.reset(), (c.pointer.chartPosition = void 0));
          h && !h.isHidden && this.reset();
        };
        a.prototype.onContainerMouseEnter = function (a) {
          delete this.chartPosition;
        };
        a.prototype.onContainerMouseMove = function (a) {
          var d = this.chart,
            c = d.tooltip;
          a = this.normalize(a);
          this.setHoverChartIndex();
          a.preventDefault || (a.returnValue = !1);
          ("mousedown" === d.mouseIsDown || this.touchSelect(a)) &&
            this.drag(a);
          d.openMenu ||
            (!this.inClass(a.target, "highcharts-tracker") &&
              !d.isInsidePlot(a.chartX - d.plotLeft, a.chartY - d.plotTop, {
                visiblePlotOnly: !0,
              })) ||
            (c && c.shouldStickOnContact(a)) ||
            (this.inClass(a.target, "highcharts-no-tooltip")
              ? this.reset(!1, 0)
              : this.runPointActions(a));
        };
        a.prototype.onDocumentTouchEnd = function (d) {
          var c = B[I(a.hoverChartIndex, -1)];
          c && c.pointer.drop(d);
        };
        a.prototype.onContainerTouchMove = function (a) {
          if (this.touchSelect(a)) this.onContainerMouseMove(a);
          else this.touch(a);
        };
        a.prototype.onContainerTouchStart = function (a) {
          if (this.touchSelect(a)) this.onContainerMouseDown(a);
          else this.zoomOption(a), this.touch(a, !0);
        };
        a.prototype.onDocumentMouseMove = function (a) {
          var d = this.chart,
            c = d.tooltip,
            e = this.chartPosition;
          a = this.normalize(a, e);
          !e ||
            d.isInsidePlot(a.chartX - d.plotLeft, a.chartY - d.plotTop, {
              visiblePlotOnly: !0,
            }) ||
            (c && c.shouldStickOnContact(a)) ||
            this.inClass(a.target, "highcharts-tracker") ||
            this.reset();
        };
        a.prototype.onDocumentMouseUp = function (d) {
          var c = B[I(a.hoverChartIndex, -1)];
          c && c.pointer.drop(d);
        };
        a.prototype.pinch = function (a) {
          var d = this,
            h = d.chart,
            e = d.pinchDown,
            b = a.touches || [],
            f = b.length,
            g = d.lastValidTouch,
            l = d.hasZoom,
            n = {},
            u =
              1 === f &&
              ((d.inClass(a.target, "highcharts-tracker") &&
                h.runTrackerClick) ||
                d.runChartClick),
            A = {},
            t = d.chart.tooltip;
          t = 1 === f && I(t && t.options.followTouchMove, !0);
          var r = d.selectionMarker;
          1 < f ? (d.initiated = !0) : t && (d.initiated = !1);
          l && d.initiated && !u && !1 !== a.cancelable && a.preventDefault();
          [].map.call(b, function (b) {
            return d.normalize(b);
          });
          "touchstart" === a.type
            ? ([].forEach.call(b, function (b, a) {
                e[a] = { chartX: b.chartX, chartY: b.chartY };
              }),
              (g.x = [e[0].chartX, e[1] && e[1].chartX]),
              (g.y = [e[0].chartY, e[1] && e[1].chartY]),
              h.axes.forEach(function (b) {
                if (b.zoomEnabled) {
                  var a = h.bounds[b.horiz ? "h" : "v"],
                    d = b.minPixelPadding,
                    c = b.toPixels(
                      Math.min(I(b.options.min, b.dataMin), b.dataMin),
                    ),
                    e = b.toPixels(
                      Math.max(I(b.options.max, b.dataMax), b.dataMax),
                    ),
                    f = Math.max(c, e);
                  a.min = Math.min(b.pos, Math.min(c, e) - d);
                  a.max = Math.max(b.pos + b.len, f + d);
                }
              }),
              (d.res = !0))
            : t
              ? this.runPointActions(d.normalize(a))
              : e.length &&
                (m(h, "touchpan", { originalEvent: a }, function () {
                  r ||
                    (d.selectionMarker = r =
                      c({ destroy: G, touch: !0 }, h.plotBox));
                  d.pinchTranslate(e, b, n, r, A, g);
                  d.hasPinched = l;
                  d.scaleGroups(n, A);
                }),
                d.res && ((d.res = !1), this.reset(!1, 0)));
        };
        a.prototype.pinchTranslate = function (a, c, h, e, b, f) {
          this.zoomHor && this.pinchTranslateDirection(!0, a, c, h, e, b, f);
          this.zoomVert && this.pinchTranslateDirection(!1, a, c, h, e, b, f);
        };
        a.prototype.pinchTranslateDirection = function (
          a,
          c,
          h,
          e,
          b,
          f,
          g,
          l,
        ) {
          var d = this.chart,
            k = a ? "x" : "y",
            p = a ? "X" : "Y",
            m = "chart" + p,
            w = a ? "width" : "height",
            n = d["plot" + (a ? "Left" : "Top")],
            q = d.inverted,
            z = d.bounds[a ? "h" : "v"],
            u = 1 === c.length,
            A = c[0][m],
            t = !u && c[1][m];
          c = function () {
            "number" === typeof C &&
              20 < Math.abs(A - t) &&
              (M = l || Math.abs(r - C) / Math.abs(A - t));
            P = (n - r) / M + A;
            F = d["plot" + (a ? "Width" : "Height")] / M;
          };
          var F,
            P,
            M = l || 1,
            r = h[0][m],
            C = !u && h[1][m];
          c();
          h = P;
          if (h < z.min) {
            h = z.min;
            var v = !0;
          } else h + F > z.max && ((h = z.max - F), (v = !0));
          v
            ? ((r -= 0.8 * (r - g[k][0])),
              "number" === typeof C && (C -= 0.8 * (C - g[k][1])),
              c())
            : (g[k] = [r, C]);
          q || ((f[k] = P - n), (f[w] = F));
          f = q ? 1 / M : M;
          b[w] = F;
          b[k] = h;
          e[q ? (a ? "scaleY" : "scaleX") : "scale" + p] = M;
          e["translate" + p] = f * n + (r - f * A);
        };
        a.prototype.reset = function (a, c) {
          var d = this.chart,
            e = d.hoverSeries,
            b = d.hoverPoint,
            f = d.hoverPoints,
            g = d.tooltip,
            l = g && g.shared ? f : b;
          a &&
            l &&
            L(l).forEach(function (b) {
              b.series.isCartesian &&
                "undefined" === typeof b.plotX &&
                (a = !1);
            });
          if (a)
            g &&
              l &&
              L(l).length &&
              (g.refresh(l),
              g.shared && f
                ? f.forEach(function (b) {
                    b.setState(b.state, !0);
                    b.series.isCartesian &&
                      (b.series.xAxis.crosshair &&
                        b.series.xAxis.drawCrosshair(null, b),
                      b.series.yAxis.crosshair &&
                        b.series.yAxis.drawCrosshair(null, b));
                  })
                : b &&
                  (b.setState(b.state, !0),
                  d.axes.forEach(function (a) {
                    a.crosshair &&
                      b.series[a.coll] === a &&
                      a.drawCrosshair(null, b);
                  })));
          else {
            if (b) b.onMouseOut();
            f &&
              f.forEach(function (b) {
                b.setState();
              });
            if (e) e.onMouseOut();
            g && g.hide(c);
            this.unDocMouseMove &&
              (this.unDocMouseMove = this.unDocMouseMove());
            d.axes.forEach(function (b) {
              b.hideCrosshair();
            });
            this.hoverX = d.hoverPoints = d.hoverPoint = null;
          }
        };
        a.prototype.runPointActions = function (d, c, h) {
          var e = this.chart,
            b = e.tooltip && e.tooltip.options.enabled ? e.tooltip : void 0,
            f = b ? b.shared : !1,
            g = c || e.hoverPoint,
            m = (g && g.series) || e.hoverSeries;
          c = this.getHoverData(
            g,
            m,
            e.series,
            (!d || "touchmove" !== d.type) &&
              (!!c || (m && m.directTouch && this.isDirectTouch)),
            f,
            d,
          );
          g = c.hoverPoint;
          m = c.hoverSeries;
          var n = c.hoverPoints;
          c = m && m.tooltipOptions.followPointer && !m.tooltipOptions.split;
          var q = f && m && !m.noSharedTooltip;
          if (g && (h || g !== e.hoverPoint || (b && b.isHidden))) {
            (e.hoverPoints || []).forEach(function (b) {
              -1 === n.indexOf(b) && b.setState();
            });
            if (e.hoverSeries !== m) m.onMouseOver();
            this.applyInactiveState(n);
            (n || []).forEach(function (b) {
              b.setState("hover");
            });
            e.hoverPoint && e.hoverPoint.firePointEvent("mouseOut");
            if (!g.series) return;
            e.hoverPoints = n;
            e.hoverPoint = g;
            g.firePointEvent("mouseOver", void 0, function () {
              b && g && b.refresh(q ? n : g, d);
            });
          } else
            c &&
              b &&
              !b.isHidden &&
              ((h = b.getAnchor([{}], d)),
              e.isInsidePlot(h[0], h[1], { visiblePlotOnly: !0 }) &&
                b.updatePosition({ plotX: h[0], plotY: h[1] }));
          this.unDocMouseMove ||
            ((this.unDocMouseMove = r(
              e.container.ownerDocument,
              "mousemove",
              function (b) {
                var c = B[a.hoverChartIndex];
                if (c) c.pointer.onDocumentMouseMove(b);
              },
            )),
            this.eventsToUnbind.push(this.unDocMouseMove));
          e.axes.forEach(function (b) {
            var a = I((b.crosshair || {}).snap, !0),
              c;
            a &&
              (((c = e.hoverPoint) && c.series[b.coll] === b) ||
                (c = l(n, function (a) {
                  return a.series && a.series[b.coll] === b;
                })));
            c || !a ? b.drawCrosshair(d, c) : b.hideCrosshair();
          });
        };
        a.prototype.scaleGroups = function (a, c) {
          var d = this.chart;
          d.series.forEach(function (h) {
            var b = a || h.getPlotBox();
            h.group &&
              ((h.xAxis && h.xAxis.zoomEnabled) || d.mapView) &&
              (h.group.attr(b),
              h.markerGroup &&
                (h.markerGroup.attr(b),
                h.markerGroup.clip(c ? d.clipRect : null)),
              h.dataLabelsGroup && h.dataLabelsGroup.attr(b));
          });
          d.clipRect.attr(c || d.clipBox);
        };
        a.prototype.setDOMEvents = function () {
          var c = this,
            e = this.chart.container,
            h = e.ownerDocument;
          e.onmousedown = this.onContainerMouseDown.bind(this);
          e.onmousemove = this.onContainerMouseMove.bind(this);
          e.onclick = this.onContainerClick.bind(this);
          this.eventsToUnbind.push(
            r(e, "mouseenter", this.onContainerMouseEnter.bind(this)),
          );
          this.eventsToUnbind.push(
            r(e, "mouseleave", this.onContainerMouseLeave.bind(this)),
          );
          a.unbindDocumentMouseUp ||
            (a.unbindDocumentMouseUp = r(
              h,
              "mouseup",
              this.onDocumentMouseUp.bind(this),
            ));
          for (
            var f = this.chart.renderTo.parentElement;
            f && "BODY" !== f.tagName;

          )
            this.eventsToUnbind.push(
              r(f, "scroll", function () {
                delete c.chartPosition;
              }),
            ),
              (f = f.parentElement);
          g.hasTouch &&
            (this.eventsToUnbind.push(
              r(e, "touchstart", this.onContainerTouchStart.bind(this), {
                passive: !1,
              }),
            ),
            this.eventsToUnbind.push(
              r(e, "touchmove", this.onContainerTouchMove.bind(this), {
                passive: !1,
              }),
            ),
            a.unbindDocumentTouchEnd ||
              (a.unbindDocumentTouchEnd = r(
                h,
                "touchend",
                this.onDocumentTouchEnd.bind(this),
                { passive: !1 },
              )));
        };
        a.prototype.setHoverChartIndex = function () {
          var c = this.chart,
            e = g.charts[I(a.hoverChartIndex, -1)];
          if (e && e !== c)
            e.pointer.onContainerMouseLeave({ relatedTarget: c.container });
          (e && e.mouseIsDown) || (a.hoverChartIndex = c.index);
        };
        a.prototype.touch = function (a, c) {
          var d = this.chart,
            e;
          this.setHoverChartIndex();
          if (1 === a.touches.length)
            if (
              ((a = this.normalize(a)),
              (e = d.isInsidePlot(a.chartX - d.plotLeft, a.chartY - d.plotTop, {
                visiblePlotOnly: !0,
              })) && !d.openMenu)
            ) {
              c && this.runPointActions(a);
              if ("touchmove" === a.type) {
                c = this.pinchDown;
                var b = c[0]
                  ? 4 <=
                    Math.sqrt(
                      Math.pow(c[0].chartX - a.chartX, 2) +
                        Math.pow(c[0].chartY - a.chartY, 2),
                    )
                  : !1;
              }
              I(b, !0) && this.pinch(a);
            } else c && this.reset();
          else 2 === a.touches.length && this.pinch(a);
        };
        a.prototype.touchSelect = function (a) {
          return !(
            !this.chart.options.chart.zooming.singleTouch ||
            !a.touches ||
            1 !== a.touches.length
          );
        };
        a.prototype.zoomOption = function (a) {
          var c = this.chart,
            d = c.options.chart;
          c = c.inverted;
          var e = d.zooming.type || "";
          /touch/.test(a.type) && (e = I(d.zooming.pinchType, e));
          this.zoomX = a = /x/.test(e);
          this.zoomY = d = /y/.test(e);
          this.zoomHor = (a && !c) || (d && c);
          this.zoomVert = (d && !c) || (a && c);
          this.hasZoom = a || d;
        };
        return a;
      })();
      ("");
      return a;
    },
  );
  K(
    g,
    "Core/MSPointer.js",
    [g["Core/Globals.js"], g["Core/Pointer.js"], g["Core/Utilities.js"]],
    function (a, g, x) {
      function v() {
        var a = [];
        a.item = function (a) {
          return this[a];
        };
        l(u, function (c) {
          a.push({ pageX: c.pageX, pageY: c.pageY, target: c.target });
        });
        return a;
      }
      function D(a, c, e, f) {
        var d = G[g.hoverChartIndex || NaN];
        ("touch" !== a.pointerType &&
          a.pointerType !== a.MSPOINTER_TYPE_TOUCH) ||
          !d ||
          ((d = d.pointer),
          f(a),
          d[c]({
            type: e,
            target: a.currentTarget,
            preventDefault: t,
            touches: v(),
          }));
      }
      var B =
          (this && this.__extends) ||
          (function () {
            var a = function (c, e) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, c) {
                    a.__proto__ = c;
                  }) ||
                function (a, c) {
                  for (var d in c) c.hasOwnProperty(d) && (a[d] = c[d]);
                };
              return a(c, e);
            };
            return function (c, e) {
              function f() {
                this.constructor = c;
              }
              a(c, e);
              c.prototype =
                null === e
                  ? Object.create(e)
                  : ((f.prototype = e.prototype), new f());
            };
          })(),
        G = a.charts,
        r = a.doc,
        t = a.noop,
        n = a.win,
        f = x.addEvent,
        c = x.css,
        l = x.objectEach,
        m = x.pick,
        e = x.removeEvent,
        u = {},
        C = !!n.PointerEvent;
      return (function (g) {
        function l() {
          return (null !== g && g.apply(this, arguments)) || this;
        }
        B(l, g);
        l.isRequired = function () {
          return !(a.hasTouch || (!n.PointerEvent && !n.MSPointerEvent));
        };
        l.prototype.batchMSEvents = function (a) {
          a(
            this.chart.container,
            C ? "pointerdown" : "MSPointerDown",
            this.onContainerPointerDown,
          );
          a(
            this.chart.container,
            C ? "pointermove" : "MSPointerMove",
            this.onContainerPointerMove,
          );
          a(r, C ? "pointerup" : "MSPointerUp", this.onDocumentPointerUp);
        };
        l.prototype.destroy = function () {
          this.batchMSEvents(e);
          g.prototype.destroy.call(this);
        };
        l.prototype.init = function (a, e) {
          g.prototype.init.call(this, a, e);
          this.hasZoom &&
            c(a.container, {
              "-ms-touch-action": "none",
              "touch-action": "none",
            });
        };
        l.prototype.onContainerPointerDown = function (a) {
          D(a, "onContainerTouchStart", "touchstart", function (a) {
            u[a.pointerId] = {
              pageX: a.pageX,
              pageY: a.pageY,
              target: a.currentTarget,
            };
          });
        };
        l.prototype.onContainerPointerMove = function (a) {
          D(a, "onContainerTouchMove", "touchmove", function (a) {
            u[a.pointerId] = { pageX: a.pageX, pageY: a.pageY };
            u[a.pointerId].target || (u[a.pointerId].target = a.currentTarget);
          });
        };
        l.prototype.onDocumentPointerUp = function (a) {
          D(a, "onDocumentTouchEnd", "touchend", function (a) {
            delete u[a.pointerId];
          });
        };
        l.prototype.setDOMEvents = function () {
          var a = this.chart.tooltip;
          g.prototype.setDOMEvents.call(this);
          (this.hasZoom || m(a && a.options.followTouchMove, !0)) &&
            this.batchMSEvents(f);
        };
        return l;
      })(g);
    },
  );
  K(
    g,
    "Core/Legend/Legend.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/FormatUtilities.js"],
      g["Core/Globals.js"],
      g["Core/Series/Point.js"],
      g["Core/Renderer/RendererUtilities.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B) {
      var v = a.animObject,
        r = a.setAnimation,
        t = g.format,
        n = x.marginNames,
        f = D.distribute,
        c = B.addEvent,
        l = B.createElement,
        m = B.css,
        e = B.defined,
        u = B.discardElement,
        C = B.find,
        J = B.fireEvent,
        I = B.isNumber,
        L = B.merge,
        A = B.pick,
        d = B.relativeLength,
        q = B.stableSort,
        h = B.syncTimeout;
      a = (function () {
        function a(b, a) {
          this.allItems = [];
          this.contentGroup = this.box = void 0;
          this.display = !1;
          this.group = void 0;
          this.offsetWidth =
            this.maxLegendWidth =
            this.maxItemWidth =
            this.legendWidth =
            this.legendHeight =
            this.lastLineHeight =
            this.lastItemY =
            this.itemY =
            this.itemX =
            this.itemMarginTop =
            this.itemMarginBottom =
            this.itemHeight =
            this.initialItemY =
              0;
          this.options = void 0;
          this.padding = 0;
          this.pages = [];
          this.proximate = !1;
          this.scrollGroup = void 0;
          this.widthOption =
            this.totalItemWidth =
            this.titleHeight =
            this.symbolWidth =
            this.symbolHeight =
              0;
          this.chart = b;
          this.init(b, a);
        }
        a.prototype.init = function (b, a) {
          this.chart = b;
          this.setOptions(a);
          a.enabled &&
            (this.render(),
            c(this.chart, "endResize", function () {
              this.legend.positionCheckboxes();
            }),
            this.proximate
              ? (this.unchartrender = c(this.chart, "render", function () {
                  this.legend.proximatePositions();
                  this.legend.positionItems();
                }))
              : this.unchartrender && this.unchartrender());
        };
        a.prototype.setOptions = function (b) {
          var a = A(b.padding, 8);
          this.options = b;
          this.chart.styledMode ||
            ((this.itemStyle = b.itemStyle),
            (this.itemHiddenStyle = L(this.itemStyle, b.itemHiddenStyle)));
          this.itemMarginTop = b.itemMarginTop || 0;
          this.itemMarginBottom = b.itemMarginBottom || 0;
          this.padding = a;
          this.initialItemY = a - 5;
          this.symbolWidth = A(b.symbolWidth, 16);
          this.pages = [];
          this.proximate = "proximate" === b.layout && !this.chart.inverted;
          this.baseline = void 0;
        };
        a.prototype.update = function (b, a) {
          var c = this.chart;
          this.setOptions(L(!0, this.options, b));
          this.destroy();
          c.isDirtyLegend = c.isDirtyBox = !0;
          A(a, !0) && c.redraw();
          J(this, "afterUpdate");
        };
        a.prototype.colorizeItem = function (b, a) {
          var c = b.legendItem || {},
            d = c.group,
            e = c.label,
            h = c.line;
          c = c.symbol;
          if (d)
            d[a ? "removeClass" : "addClass"]("highcharts-legend-item-hidden");
          if (!this.chart.styledMode) {
            var f = this.options;
            d = this.itemHiddenStyle.color;
            f = a ? f.itemStyle.color : d;
            var g = a ? b.color || d : d,
              k = b.options && b.options.marker,
              l = { fill: g };
            e && e.css({ fill: f, color: f });
            h && h.attr({ stroke: g });
            c &&
              (k &&
                c.isMarker &&
                ((l = b.pointAttribs()), a || (l.stroke = l.fill = d)),
              c.attr(l));
          }
          J(this, "afterColorizeItem", { item: b, visible: a });
        };
        a.prototype.positionItems = function () {
          this.allItems.forEach(this.positionItem, this);
          this.chart.isResizing || this.positionCheckboxes();
        };
        a.prototype.positionItem = function (b) {
          var a = this,
            c = b.legendItem || {},
            d = c.group,
            h = c.x;
          h = void 0 === h ? 0 : h;
          c = c.y;
          c = void 0 === c ? 0 : c;
          var f = this.options,
            g = f.symbolPadding,
            l = !f.rtl;
          f = b.checkbox;
          d &&
            d.element &&
            ((g = {
              translateX: l ? h : this.legendWidth - h - 2 * g - 4,
              translateY: c,
            }),
            d[e(d.translateY) ? "animate" : "attr"](g, void 0, function () {
              J(a, "afterPositionItem", { item: b });
            }));
          f && ((f.x = h), (f.y = c));
        };
        a.prototype.destroyItem = function (b) {
          for (
            var a = b.checkbox,
              c = b.legendItem || {},
              d = 0,
              e = ["group", "label", "line", "symbol"];
            d < e.length;
            d++
          ) {
            var h = e[d];
            c[h] && (c[h] = c[h].destroy());
          }
          a && u(a);
          b.legendItem = void 0;
        };
        a.prototype.destroy = function () {
          for (var b = 0, a = this.getAllItems(); b < a.length; b++)
            this.destroyItem(a[b]);
          b = 0;
          for (
            a = "clipRect up down pager nav box title group".split(" ");
            b < a.length;
            b++
          ) {
            var c = a[b];
            this[c] && (this[c] = this[c].destroy());
          }
          this.display = null;
        };
        a.prototype.positionCheckboxes = function () {
          var b = this.group && this.group.alignAttr,
            a = this.clipHeight || this.legendHeight,
            c = this.titleHeight;
          if (b) {
            var d = b.translateY;
            this.allItems.forEach(function (e) {
              var h = e.checkbox;
              if (h) {
                var f = d + c + h.y + (this.scrollOffset || 0) + 3;
                m(h, {
                  left: b.translateX + e.checkboxOffset + h.x - 20 + "px",
                  top: f + "px",
                  display:
                    this.proximate || (f > d - 6 && f < d + a - 6)
                      ? ""
                      : "none",
                });
              }
            }, this);
          }
        };
        a.prototype.renderTitle = function () {
          var b = this.options,
            a = this.padding,
            c = b.title,
            d = 0;
          c.text &&
            (this.title ||
              ((this.title = this.chart.renderer
                .label(
                  c.text,
                  a - 3,
                  a - 4,
                  void 0,
                  void 0,
                  void 0,
                  b.useHTML,
                  void 0,
                  "legend-title",
                )
                .attr({ zIndex: 1 })),
              this.chart.styledMode || this.title.css(c.style),
              this.title.add(this.group)),
            c.width || this.title.css({ width: this.maxLegendWidth + "px" }),
            (b = this.title.getBBox()),
            (d = b.height),
            (this.offsetWidth = b.width),
            this.contentGroup.attr({ translateY: d }));
          this.titleHeight = d;
        };
        a.prototype.setText = function (b) {
          var a = this.options;
          b.legendItem.label.attr({
            text: a.labelFormat
              ? t(a.labelFormat, b, this.chart)
              : a.labelFormatter.call(b),
          });
        };
        a.prototype.renderItem = function (b) {
          var a = (b.legendItem = b.legendItem || {}),
            c = this.chart,
            d = c.renderer,
            e = this.options,
            h = this.symbolWidth,
            f = e.symbolPadding || 0,
            g = this.itemStyle,
            l = this.itemHiddenStyle,
            k = "horizontal" === e.layout ? A(e.itemDistance, 20) : 0,
            m = !e.rtl,
            n = !b.series,
            u = !n && b.series.drawLegendSymbol ? b.series : b,
            q = u.options,
            t = this.createCheckboxForItem && q && q.showCheckbox,
            F = e.useHTML,
            P = b.options.className,
            M = a.label;
          q = h + f + k + (t ? 20 : 0);
          M ||
            ((a.group = d
              .g("legend-item")
              .addClass(
                "highcharts-" +
                  u.type +
                  "-series highcharts-color-" +
                  b.colorIndex +
                  (P ? " " + P : "") +
                  (n ? " highcharts-series-" + b.index : ""),
              )
              .attr({ zIndex: 1 })
              .add(this.scrollGroup)),
            (a.label = M = d.text("", m ? h + f : -f, this.baseline || 0, F)),
            c.styledMode || M.css(L(b.visible ? g : l)),
            M.attr({ align: m ? "left" : "right", zIndex: 2 }).add(a.group),
            this.baseline ||
              ((this.fontMetrics = d.fontMetrics(
                c.styledMode ? 12 : g.fontSize,
                M,
              )),
              (this.baseline = this.fontMetrics.f + 3 + this.itemMarginTop),
              M.attr("y", this.baseline),
              (this.symbolHeight = e.symbolHeight || this.fontMetrics.f),
              e.squareSymbol &&
                ((this.symbolWidth = A(
                  e.symbolWidth,
                  Math.max(this.symbolHeight, 16),
                )),
                (q = this.symbolWidth + f + k + (t ? 20 : 0)),
                m && M.attr("x", this.symbolWidth + f))),
            u.drawLegendSymbol(this, b),
            this.setItemEvents && this.setItemEvents(b, M, F));
          t &&
            !b.checkbox &&
            this.createCheckboxForItem &&
            this.createCheckboxForItem(b);
          this.colorizeItem(b, b.visible);
          (!c.styledMode && g.width) ||
            M.css({
              width:
                (e.itemWidth || this.widthOption || c.spacingBox.width) -
                q +
                "px",
            });
          this.setText(b);
          c = M.getBBox();
          d = (this.fontMetrics && this.fontMetrics.h) || 0;
          b.itemWidth = b.checkboxOffset =
            e.itemWidth || a.labelWidth || c.width + q;
          this.maxItemWidth = Math.max(this.maxItemWidth, b.itemWidth);
          this.totalItemWidth += b.itemWidth;
          this.itemHeight = b.itemHeight = Math.round(
            a.labelHeight || (c.height > 1.5 * d ? c.height : d),
          );
        };
        a.prototype.layoutItem = function (a) {
          var b = this.options,
            c = this.padding,
            d = "horizontal" === b.layout,
            e = a.itemHeight,
            h = this.itemMarginBottom,
            f = this.itemMarginTop,
            g = d ? A(b.itemDistance, 20) : 0,
            l = this.maxLegendWidth;
          b =
            b.alignColumns && this.totalItemWidth > l
              ? this.maxItemWidth
              : a.itemWidth;
          var k = a.legendItem || {};
          d &&
            this.itemX - c + b > l &&
            ((this.itemX = c),
            this.lastLineHeight && (this.itemY += f + this.lastLineHeight + h),
            (this.lastLineHeight = 0));
          this.lastItemY = f + this.itemY + h;
          this.lastLineHeight = Math.max(e, this.lastLineHeight);
          k.x = this.itemX;
          k.y = this.itemY;
          d
            ? (this.itemX += b)
            : ((this.itemY += f + e + h), (this.lastLineHeight = e));
          this.offsetWidth =
            this.widthOption ||
            Math.max(
              (d ? this.itemX - c - (a.checkbox ? 0 : g) : b) + c,
              this.offsetWidth,
            );
        };
        a.prototype.getAllItems = function () {
          var a = [];
          this.chart.series.forEach(function (b) {
            var c = b && b.options;
            b &&
              A(c.showInLegend, e(c.linkedTo) ? !1 : void 0, !0) &&
              (a = a.concat(
                (b.legendItem || {}).labels ||
                  ("point" === c.legendType ? b.data : b),
              ));
          });
          J(this, "afterGetAllItems", { allItems: a });
          return a;
        };
        a.prototype.getAlignment = function () {
          var a = this.options;
          return this.proximate
            ? a.align.charAt(0) + "tv"
            : a.floating
              ? ""
              : a.align.charAt(0) +
                a.verticalAlign.charAt(0) +
                a.layout.charAt(0);
        };
        a.prototype.adjustMargins = function (a, c) {
          var b = this.chart,
            d = this.options,
            h = this.getAlignment();
          h &&
            [
              /(lth|ct|rth)/,
              /(rtv|rm|rbv)/,
              /(rbh|cb|lbh)/,
              /(lbv|lm|ltv)/,
            ].forEach(function (f, g) {
              f.test(h) &&
                !e(a[g]) &&
                (b[n[g]] = Math.max(
                  b[n[g]],
                  b.legend[(g + 1) % 2 ? "legendHeight" : "legendWidth"] +
                    [1, -1, -1, 1][g] * d[g % 2 ? "x" : "y"] +
                    A(d.margin, 12) +
                    c[g] +
                    (b.titleOffset[g] || 0),
                ));
            });
        };
        a.prototype.proximatePositions = function () {
          var a = this.chart,
            c = [],
            d = "left" === this.options.align;
          this.allItems.forEach(function (b) {
            var e;
            var h = d;
            if (b.yAxis) {
              b.xAxis.options.reversed && (h = !h);
              b.points &&
                (e = C(
                  h ? b.points : b.points.slice(0).reverse(),
                  function (a) {
                    return I(a.plotY);
                  },
                ));
              h =
                this.itemMarginTop +
                b.legendItem.label.getBBox().height +
                this.itemMarginBottom;
              var f = b.yAxis.top - a.plotTop;
              b.visible
                ? ((e = e ? e.plotY : b.yAxis.height), (e += f - 0.3 * h))
                : (e = f + b.yAxis.height);
              c.push({ target: e, size: h, item: b });
            }
          }, this);
          for (var e, h = 0, g = f(c, a.plotHeight); h < g.length; h++) {
            var l = g[h];
            e = l.item.legendItem || {};
            l.pos && (e.y = a.plotTop - a.spacing[0] + l.pos);
          }
        };
        a.prototype.render = function () {
          var a = this.chart,
            c = a.renderer,
            e = this.options,
            h = this.padding,
            f = this.getAllItems(),
            g = this.group,
            l = this.box;
          this.itemX = h;
          this.itemY = this.initialItemY;
          this.lastItemY = this.offsetWidth = 0;
          this.widthOption = d(e.width, a.spacingBox.width - h);
          var k = a.spacingBox.width - 2 * h - e.x;
          -1 < ["rm", "lm"].indexOf(this.getAlignment().substring(0, 2)) &&
            (k /= 2);
          this.maxLegendWidth = this.widthOption || k;
          g ||
            ((this.group = g =
              c
                .g("legend")
                .addClass(e.className || "")
                .attr({ zIndex: 7 })
                .add()),
            (this.contentGroup = c.g().attr({ zIndex: 1 }).add(g)),
            (this.scrollGroup = c.g().add(this.contentGroup)));
          this.renderTitle();
          q(f, function (a, b) {
            return (
              ((a.options && a.options.legendIndex) || 0) -
              ((b.options && b.options.legendIndex) || 0)
            );
          });
          e.reversed && f.reverse();
          this.allItems = f;
          this.display = k = !!f.length;
          this.itemHeight =
            this.totalItemWidth =
            this.maxItemWidth =
            this.lastLineHeight =
              0;
          f.forEach(this.renderItem, this);
          f.forEach(this.layoutItem, this);
          f = (this.widthOption || this.offsetWidth) + h;
          var m = this.lastItemY + this.lastLineHeight + this.titleHeight;
          m = this.handleOverflow(m);
          m += h;
          l ||
            (this.box = l =
              c
                .rect()
                .addClass("highcharts-legend-box")
                .attr({ r: e.borderRadius })
                .add(g));
          a.styledMode ||
            l
              .attr({
                stroke: e.borderColor,
                "stroke-width": e.borderWidth || 0,
                fill: e.backgroundColor || "none",
              })
              .shadow(e.shadow);
          if (0 < f && 0 < m)
            l[l.placed ? "animate" : "attr"](
              l.crisp.call(
                {},
                { x: 0, y: 0, width: f, height: m },
                l.strokeWidth(),
              ),
            );
          g[k ? "show" : "hide"]();
          a.styledMode && "none" === g.getStyle("display") && (f = m = 0);
          this.legendWidth = f;
          this.legendHeight = m;
          k && this.align();
          this.proximate || this.positionItems();
          J(this, "afterRender");
        };
        a.prototype.align = function (a) {
          void 0 === a && (a = this.chart.spacingBox);
          var b = this.chart,
            c = this.options,
            d = a.y;
          /(lth|ct|rth)/.test(this.getAlignment()) && 0 < b.titleOffset[0]
            ? (d += b.titleOffset[0])
            : /(lbh|cb|rbh)/.test(this.getAlignment()) &&
              0 < b.titleOffset[2] &&
              (d -= b.titleOffset[2]);
          d !== a.y && (a = L(a, { y: d }));
          b.hasRendered || (this.group.placed = !1);
          this.group.align(
            L(c, {
              width: this.legendWidth,
              height: this.legendHeight,
              verticalAlign: this.proximate ? "top" : c.verticalAlign,
            }),
            !0,
            a,
          );
        };
        a.prototype.handleOverflow = function (a) {
          var b = this,
            c = this.chart,
            d = c.renderer,
            e = this.options,
            h = e.y,
            f = "top" === e.verticalAlign,
            g = this.padding,
            l = e.maxHeight,
            k = e.navigation,
            m = A(k.animation, !0),
            n = k.arrowSize || 12,
            u = this.pages,
            q = this.allItems,
            t = function (a) {
              "number" === typeof a
                ? v.attr({ height: a })
                : v && ((b.clipRect = v.destroy()), b.contentGroup.clip());
              b.contentGroup.div &&
                (b.contentGroup.div.style.clip = a
                  ? "rect(" + g + "px,9999px," + (g + a) + "px,0)"
                  : "auto");
            },
            F = function (a) {
              b[a] = d
                .circle(0, 0, 1.3 * n)
                .translate(n / 2, n / 2)
                .add(C);
              c.styledMode || b[a].attr("fill", "rgba(0,0,0,0.0001)");
              return b[a];
            },
            P,
            M,
            r;
          h = c.spacingBox.height + (f ? -h : h) - g;
          var C = this.nav,
            v = this.clipRect;
          "horizontal" !== e.layout ||
            "middle" === e.verticalAlign ||
            e.floating ||
            (h /= 2);
          l && (h = Math.min(h, l));
          u.length = 0;
          a && 0 < h && a > h && !1 !== k.enabled
            ? ((this.clipHeight = P =
                Math.max(h - 20 - this.titleHeight - g, 0)),
              (this.currentPage = A(this.currentPage, 1)),
              (this.fullHeight = a),
              q.forEach(function (a, b) {
                r = a.legendItem || {};
                a = r.y || 0;
                var c = Math.round(r.label.getBBox().height),
                  d = u.length;
                if (!d || (a - u[d - 1] > P && (M || a) !== u[d - 1]))
                  u.push(M || a), d++;
                r.pageIx = d - 1;
                M && ((q[b - 1].legendItem || {}).pageIx = d - 1);
                b === q.length - 1 &&
                  a + c - u[d - 1] > P &&
                  c <= P &&
                  (u.push(a), (r.pageIx = d));
                a !== M && (M = a);
              }),
              v ||
                ((v = b.clipRect = d.clipRect(0, g, 9999, 0)),
                b.contentGroup.clip(v)),
              t(P),
              C ||
                ((this.nav = C = d.g().attr({ zIndex: 1 }).add(this.group)),
                (this.up = d.symbol("triangle", 0, 0, n, n).add(C)),
                F("upTracker").on("click", function () {
                  b.scroll(-1, m);
                }),
                (this.pager = d
                  .text("", 15, 10)
                  .addClass("highcharts-legend-navigation")),
                !c.styledMode && k.style && this.pager.css(k.style),
                this.pager.add(C),
                (this.down = d.symbol("triangle-down", 0, 0, n, n).add(C)),
                F("downTracker").on("click", function () {
                  b.scroll(1, m);
                })),
              b.scroll(0),
              (a = h))
            : C &&
              (t(),
              (this.nav = C.destroy()),
              this.scrollGroup.attr({ translateY: 1 }),
              (this.clipHeight = 0));
          return a;
        };
        a.prototype.scroll = function (a, c) {
          var b = this,
            d = this.chart,
            e = this.pages,
            f = e.length,
            g = this.clipHeight,
            l = this.options.navigation,
            k = this.pager,
            m = this.padding,
            p = this.currentPage + a;
          p > f && (p = f);
          0 < p &&
            ("undefined" !== typeof c && r(c, d),
            this.nav.attr({
              translateX: m,
              translateY: g + this.padding + 7 + this.titleHeight,
              visibility: "inherit",
            }),
            [this.up, this.upTracker].forEach(function (a) {
              a.attr({
                class:
                  1 === p
                    ? "highcharts-legend-nav-inactive"
                    : "highcharts-legend-nav-active",
              });
            }),
            k.attr({ text: p + "/" + f }),
            [this.down, this.downTracker].forEach(function (a) {
              a.attr({
                x: 18 + this.pager.getBBox().width,
                class:
                  p === f
                    ? "highcharts-legend-nav-inactive"
                    : "highcharts-legend-nav-active",
              });
            }, this),
            d.styledMode ||
              (this.up.attr({
                fill: 1 === p ? l.inactiveColor : l.activeColor,
              }),
              this.upTracker.css({ cursor: 1 === p ? "default" : "pointer" }),
              this.down.attr({
                fill: p === f ? l.inactiveColor : l.activeColor,
              }),
              this.downTracker.css({
                cursor: p === f ? "default" : "pointer",
              })),
            (this.scrollOffset = -e[p - 1] + this.initialItemY),
            this.scrollGroup.animate({ translateY: this.scrollOffset }),
            (this.currentPage = p),
            this.positionCheckboxes(),
            (a = v(A(c, d.renderer.globalAnimation, !0))),
            h(function () {
              J(b, "afterScroll", { currentPage: p });
            }, a.duration));
        };
        a.prototype.setItemEvents = function (a, c, d) {
          var b = this,
            e = a.legendItem || {},
            h = b.chart.renderer.boxWrapper,
            f = a instanceof E,
            g = "highcharts-legend-" + (f ? "point" : "series") + "-active",
            l = b.chart.styledMode,
            k = function (c) {
              b.allItems.forEach(function (b) {
                a !== b &&
                  [b].concat(b.linkedSeries || []).forEach(function (a) {
                    a.setState(c, !f);
                  });
              });
            },
            m = 0;
          for (d = d ? [c, e.symbol] : [e.group]; m < d.length; m++)
            if ((e = d[m]))
              e.on("mouseover", function () {
                a.visible && k("inactive");
                a.setState("hover");
                a.visible && h.addClass(g);
                l || c.css(b.options.itemHoverStyle);
              })
                .on("mouseout", function () {
                  b.chart.styledMode ||
                    c.css(L(a.visible ? b.itemStyle : b.itemHiddenStyle));
                  k("");
                  h.removeClass(g);
                  a.setState();
                })
                .on("click", function (b) {
                  var c = function () {
                    a.setVisible && a.setVisible();
                    k(a.visible ? "inactive" : "");
                  };
                  h.removeClass(g);
                  b = { browserEvent: b };
                  a.firePointEvent
                    ? a.firePointEvent("legendItemClick", b, c)
                    : J(a, "legendItemClick", b, c);
                });
        };
        a.prototype.createCheckboxForItem = function (a) {
          a.checkbox = l(
            "input",
            {
              type: "checkbox",
              className: "highcharts-legend-checkbox",
              checked: a.selected,
              defaultChecked: a.selected,
            },
            this.options.itemCheckboxStyle,
            this.chart.container,
          );
          c(a.checkbox, "click", function (b) {
            J(
              a.series || a,
              "checkboxClick",
              { checked: b.target.checked, item: a },
              function () {
                a.select();
              },
            );
          });
        };
        return a;
      })();
      ("");
      return a;
    },
  );
  K(
    g,
    "Core/Series/SeriesRegistry.js",
    [
      g["Core/Globals.js"],
      g["Core/Defaults.js"],
      g["Core/Series/Point.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E) {
      var v = g.defaultOptions,
        B = E.extendClass,
        G = E.merge,
        r;
      (function (g) {
        function n(a, c) {
          var f = v.plotOptions || {},
            m = c.defaultOptions,
            e = c.prototype;
          e.type = a;
          e.pointClass || (e.pointClass = x);
          m && (f[a] = m);
          g.seriesTypes[a] = c;
        }
        g.seriesTypes = a.seriesTypes;
        g.registerSeriesType = n;
        g.seriesType = function (a, c, l, m, e) {
          var f = v.plotOptions || {};
          c = c || "";
          f[a] = G(f[c], l);
          n(a, B(g.seriesTypes[c] || function () {}, m));
          g.seriesTypes[a].prototype.type = a;
          e && (g.seriesTypes[a].prototype.pointClass = B(x, e));
          return g.seriesTypes[a];
        };
      })(r || (r = {}));
      return r;
    },
  );
  K(
    g,
    "Core/Chart/Chart.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Axis/Axis.js"],
      g["Core/Defaults.js"],
      g["Core/FormatUtilities.js"],
      g["Core/Foundation.js"],
      g["Core/Globals.js"],
      g["Core/Legend/Legend.js"],
      g["Core/MSPointer.js"],
      g["Core/Pointer.js"],
      g["Core/Renderer/RendererRegistry.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Renderer/SVG/SVGRenderer.js"],
      g["Core/Time.js"],
      g["Core/Utilities.js"],
      g["Core/Renderer/HTML/AST.js"],
    ],
    function (a, g, x, E, D, B, G, r, t, n, f, c, l, m, e) {
      var u = a.animate,
        C = a.animObject,
        v = a.setAnimation,
        I = x.defaultOptions,
        L = x.defaultTime,
        A = E.numberFormat,
        d = D.registerEventOptions,
        q = B.charts,
        h = B.doc,
        k = B.marginNames,
        b = B.svg,
        p = B.win,
        z = f.seriesTypes,
        w = m.addEvent,
        N = m.attr,
        H = m.cleanRecursively,
        O = m.createElement,
        Q = m.css,
        S = m.defined,
        Y = m.discardElement,
        y = m.erase,
        T = m.error,
        K = m.extend,
        ca = m.find,
        R = m.fireEvent,
        F = m.getStyle,
        P = m.isArray,
        M = m.isNumber,
        X = m.isObject,
        W = m.isString,
        U = m.merge,
        Z = m.objectEach,
        V = m.pick,
        ba = m.pInt,
        ha = m.relativeLength,
        da = m.removeEvent,
        fa = m.splat,
        ia = m.syncTimeout,
        ka = m.uniqueKey;
      a = (function () {
        function a(a, b, c) {
          this.series =
            this.renderTo =
            this.renderer =
            this.pointer =
            this.pointCount =
            this.plotWidth =
            this.plotTop =
            this.plotLeft =
            this.plotHeight =
            this.plotBox =
            this.options =
            this.numberFormatter =
            this.margin =
            this.legend =
            this.labelCollectors =
            this.isResizing =
            this.index =
            this.eventOptions =
            this.container =
            this.colorCounter =
            this.clipBox =
            this.chartWidth =
            this.chartHeight =
            this.bounds =
            this.axisOffset =
            this.axes =
              void 0;
          this.sharedClips = {};
          this.yAxis =
            this.xAxis =
            this.userOptions =
            this.titleOffset =
            this.time =
            this.symbolCounter =
            this.spacingBox =
            this.spacing =
              void 0;
          this.getArgs(a, b, c);
        }
        a.chart = function (b, c, d) {
          return new a(b, c, d);
        };
        a.prototype.getArgs = function (a, b, c) {
          W(a) || a.nodeName
            ? ((this.renderTo = a), this.init(b, c))
            : this.init(a, b);
        };
        a.prototype.init = function (a, b) {
          var c = a.plotOptions || {};
          R(this, "init", { args: arguments }, function () {
            var e = U(I, a),
              h = e.chart;
            Z(e.plotOptions, function (a, b) {
              X(a) && (a.tooltip = (c[b] && U(c[b].tooltip)) || void 0);
            });
            e.tooltip.userOptions =
              (a.chart && a.chart.forExport && a.tooltip.userOptions) ||
              a.tooltip;
            this.userOptions = a;
            this.margin = [];
            this.spacing = [];
            this.bounds = { h: {}, v: {} };
            this.labelCollectors = [];
            this.callback = b;
            this.isResizing = 0;
            var f = (h.zooming = h.zooming || {});
            a.chart && !a.chart.zooming && (f.resetButton = h.resetZoomButton);
            f.key = V(f.key, h.zoomKey);
            f.pinchType = V(f.pinchType, h.pinchType);
            f.singleTouch = V(f.singleTouch, h.zoomBySingleTouch);
            f.type = V(f.type, h.zoomType);
            this.options = e;
            this.axes = [];
            this.series = [];
            this.time =
              a.time && Object.keys(a.time).length ? new l(a.time) : B.time;
            this.numberFormatter = h.numberFormatter || A;
            this.styledMode = h.styledMode;
            this.hasCartesianSeries = h.showAxes;
            this.index = q.length;
            q.push(this);
            B.chartCount++;
            d(this, h);
            this.xAxis = [];
            this.yAxis = [];
            this.pointCount = this.colorCounter = this.symbolCounter = 0;
            R(this, "afterInit");
            this.firstRender();
          });
        };
        a.prototype.initSeries = function (a) {
          var b = this.options.chart;
          b = a.type || b.type || b.defaultSeriesType;
          var c = z[b];
          c || T(17, !0, this, { missingModuleFor: b });
          b = new c();
          "function" === typeof b.init && b.init(this, a);
          return b;
        };
        a.prototype.setSeriesData = function () {
          this.getSeriesOrderByLinks().forEach(function (a) {
            a.points ||
              a.data ||
              !a.enabledDataSorting ||
              a.setData(a.options.data, !1);
          });
        };
        a.prototype.getSeriesOrderByLinks = function () {
          return this.series.concat().sort(function (a, b) {
            return a.linkedSeries.length || b.linkedSeries.length
              ? b.linkedSeries.length - a.linkedSeries.length
              : 0;
          });
        };
        a.prototype.orderSeries = function (a) {
          var b = this.series;
          a = a || 0;
          for (var c = b.length; a < c; ++a)
            b[a] && ((b[a].index = a), (b[a].name = b[a].getName()));
        };
        a.prototype.isInsidePlot = function (a, b, c) {
          void 0 === c && (c = {});
          var d = this.inverted,
            e = this.plotBox,
            h = this.plotLeft,
            f = this.plotTop,
            g = this.scrollablePlotBox,
            l = 0;
          var k = 0;
          c.visiblePlotOnly &&
            this.scrollingContainer &&
            ((k = this.scrollingContainer),
            (l = k.scrollLeft),
            (k = k.scrollTop));
          var m = c.series;
          e = (c.visiblePlotOnly && g) || e;
          g = c.inverted ? b : a;
          b = c.inverted ? a : b;
          a = { x: g, y: b, isInsidePlot: !0, options: c };
          if (!c.ignoreX) {
            var p = (m && (d && !this.polar ? m.yAxis : m.xAxis)) || {
              pos: h,
              len: Infinity,
            };
            g = c.paneCoordinates ? p.pos + g : h + g;
            (g >= Math.max(l + h, p.pos) &&
              g <= Math.min(l + h + e.width, p.pos + p.len)) ||
              (a.isInsidePlot = !1);
          }
          !c.ignoreY &&
            a.isInsidePlot &&
            ((d = (c.axis && !c.axis.isXAxis && c.axis) ||
              (m && (d ? m.xAxis : m.yAxis)) || { pos: f, len: Infinity }),
            (c = c.paneCoordinates ? d.pos + b : f + b),
            (c >= Math.max(k + f, d.pos) &&
              c <= Math.min(k + f + e.height, d.pos + d.len)) ||
              (a.isInsidePlot = !1));
          R(this, "afterIsInsidePlot", a);
          return a.isInsidePlot;
        };
        a.prototype.redraw = function (a) {
          R(this, "beforeRedraw");
          var b = this.hasCartesianSeries ? this.axes : this.colorAxis || [],
            c = this.series,
            d = this.pointer,
            e = this.legend,
            h = this.userOptions.legend,
            f = this.renderer,
            g = f.isHidden(),
            l = [],
            k = this.isDirtyBox,
            m = this.isDirtyLegend;
          this.setResponsive && this.setResponsive(!1);
          v(this.hasRendered ? a : !1, this);
          g && this.temporaryDisplay();
          this.layOutTitles();
          for (a = c.length; a--; ) {
            var p = c[a];
            if (p.options.stacking || p.options.centerInCategory) {
              var F = !0;
              if (p.isDirty) {
                var n = !0;
                break;
              }
            }
          }
          if (n)
            for (a = c.length; a--; )
              (p = c[a]), p.options.stacking && (p.isDirty = !0);
          c.forEach(function (a) {
            a.isDirty &&
              ("point" === a.options.legendType
                ? ("function" === typeof a.updateTotals && a.updateTotals(),
                  (m = !0))
                : h && (h.labelFormatter || h.labelFormat) && (m = !0));
            a.isDirtyData && R(a, "updatedData");
          });
          m &&
            e &&
            e.options.enabled &&
            (e.render(), (this.isDirtyLegend = !1));
          F && this.getStacks();
          b.forEach(function (a) {
            a.updateNames();
            a.setScale();
          });
          this.getMargins();
          b.forEach(function (a) {
            a.isDirty && (k = !0);
          });
          b.forEach(function (a) {
            var b = a.min + "," + a.max;
            a.extKey !== b &&
              ((a.extKey = b),
              l.push(function () {
                R(a, "afterSetExtremes", K(a.eventArgs, a.getExtremes()));
                delete a.eventArgs;
              }));
            (k || F) && a.redraw();
          });
          k && this.drawChartBox();
          R(this, "predraw");
          c.forEach(function (a) {
            (k || a.isDirty) && a.visible && a.redraw();
            a.isDirtyData = !1;
          });
          d && d.reset(!0);
          f.draw();
          R(this, "redraw");
          R(this, "render");
          g && this.temporaryDisplay(!0);
          l.forEach(function (a) {
            a.call();
          });
        };
        a.prototype.get = function (a) {
          function b(b) {
            return b.id === a || (b.options && b.options.id === a);
          }
          for (
            var c = this.series,
              d = ca(this.axes, b) || ca(this.series, b),
              e = 0;
            !d && e < c.length;
            e++
          )
            d = ca(c[e].points || [], b);
          return d;
        };
        a.prototype.getAxes = function () {
          var a = this,
            b = this.options,
            c = (b.xAxis = fa(b.xAxis || {}));
          b = b.yAxis = fa(b.yAxis || {});
          R(this, "getAxes");
          c.forEach(function (a, b) {
            a.index = b;
            a.isX = !0;
          });
          b.forEach(function (a, b) {
            a.index = b;
          });
          c.concat(b).forEach(function (b) {
            new g(a, b);
          });
          R(this, "afterGetAxes");
        };
        a.prototype.getSelectedPoints = function () {
          return this.series.reduce(function (a, b) {
            b.getPointsCollection().forEach(function (b) {
              V(b.selectedStaging, b.selected) && a.push(b);
            });
            return a;
          }, []);
        };
        a.prototype.getSelectedSeries = function () {
          return this.series.filter(function (a) {
            return a.selected;
          });
        };
        a.prototype.setTitle = function (a, b, c) {
          this.applyDescription("title", a);
          this.applyDescription("subtitle", b);
          this.applyDescription("caption", void 0);
          this.layOutTitles(c);
        };
        a.prototype.applyDescription = function (a, b) {
          var c = this,
            d =
              "title" === a
                ? {
                    color: "#333333",
                    fontSize: this.options.isStock ? "16px" : "18px",
                  }
                : { color: "#666666" };
          d = this.options[a] = U(
            !this.styledMode && { style: d },
            this.options[a],
            b,
          );
          var e = this[a];
          e && b && (this[a] = e = e.destroy());
          d &&
            !e &&
            ((e = this.renderer
              .text(d.text, 0, 0, d.useHTML)
              .attr({
                align: d.align,
                class: "highcharts-" + a,
                zIndex: d.zIndex || 4,
              })
              .add()),
            (e.update = function (b) {
              c[
                {
                  title: "setTitle",
                  subtitle: "setSubtitle",
                  caption: "setCaption",
                }[a]
              ](b);
            }),
            this.styledMode || e.css(d.style),
            (this[a] = e));
        };
        a.prototype.layOutTitles = function (a) {
          var b = [0, 0, 0],
            c = this.renderer,
            d = this.spacingBox;
          ["title", "subtitle", "caption"].forEach(function (a) {
            var e = this[a],
              h = this.options[a],
              f = h.verticalAlign || "top";
            a =
              "title" === a
                ? "top" === f
                  ? -3
                  : 0
                : "top" === f
                  ? b[0] + 2
                  : 0;
            var g;
            if (e) {
              this.styledMode || (g = h.style && h.style.fontSize);
              g = c.fontMetrics(g, e).b;
              e.css({
                width: (h.width || d.width + (h.widthAdjust || 0)) + "px",
              });
              var k = Math.round(e.getBBox(h.useHTML).height);
              e.align(
                K({ y: "bottom" === f ? g : a + g, height: k }, h),
                !1,
                "spacingBox",
              );
              h.floating ||
                ("top" === f
                  ? (b[0] = Math.ceil(b[0] + k))
                  : "bottom" === f && (b[2] = Math.ceil(b[2] + k)));
            }
          }, this);
          b[0] &&
            "top" === (this.options.title.verticalAlign || "top") &&
            (b[0] += this.options.title.margin);
          b[2] &&
            "bottom" === this.options.caption.verticalAlign &&
            (b[2] += this.options.caption.margin);
          var e =
            !this.titleOffset || this.titleOffset.join(",") !== b.join(",");
          this.titleOffset = b;
          R(this, "afterLayOutTitles");
          !this.isDirtyBox &&
            e &&
            ((this.isDirtyBox = this.isDirtyLegend = e),
            this.hasRendered && V(a, !0) && this.isDirtyBox && this.redraw());
        };
        a.prototype.getChartSize = function () {
          var a = this.options.chart,
            b = a.width;
          a = a.height;
          var c = this.renderTo;
          S(b) || (this.containerWidth = F(c, "width"));
          S(a) || (this.containerHeight = F(c, "height"));
          this.chartWidth = Math.max(0, b || this.containerWidth || 600);
          this.chartHeight = Math.max(
            0,
            ha(a, this.chartWidth) ||
              (1 < this.containerHeight ? this.containerHeight : 400),
          );
        };
        a.prototype.temporaryDisplay = function (a) {
          var b = this.renderTo;
          if (a)
            for (; b && b.style; )
              b.hcOrigStyle && (Q(b, b.hcOrigStyle), delete b.hcOrigStyle),
                b.hcOrigDetached &&
                  (h.body.removeChild(b), (b.hcOrigDetached = !1)),
                (b = b.parentNode);
          else
            for (; b && b.style; ) {
              h.body.contains(b) ||
                b.parentNode ||
                ((b.hcOrigDetached = !0), h.body.appendChild(b));
              if ("none" === F(b, "display", !1) || b.hcOricDetached)
                (b.hcOrigStyle = {
                  display: b.style.display,
                  height: b.style.height,
                  overflow: b.style.overflow,
                }),
                  (a = { display: "block", overflow: "hidden" }),
                  b !== this.renderTo && (a.height = 0),
                  Q(b, a),
                  b.offsetWidth ||
                    b.style.setProperty("display", "block", "important");
              b = b.parentNode;
              if (b === h.body) break;
            }
        };
        a.prototype.setClassName = function (a) {
          this.container.className = "highcharts-container " + (a || "");
        };
        a.prototype.getContainer = function () {
          var a = this.options,
            d = a.chart,
            f = ka(),
            g,
            k = this.renderTo;
          k || (this.renderTo = k = d.renderTo);
          W(k) && (this.renderTo = k = h.getElementById(k));
          k || T(13, !0, this);
          var l = ba(N(k, "data-highcharts-chart"));
          M(l) && q[l] && q[l].hasRendered && q[l].destroy();
          N(k, "data-highcharts-chart", this.index);
          k.innerHTML = e.emptyHTML;
          d.skipClone || k.offsetWidth || this.temporaryDisplay();
          this.getChartSize();
          l = this.chartWidth;
          var m = this.chartHeight;
          Q(k, { overflow: "hidden" });
          this.styledMode ||
            (g = K(
              {
                position: "relative",
                overflow: "hidden",
                width: l + "px",
                height: m + "px",
                textAlign: "left",
                lineHeight: "normal",
                zIndex: 0,
                "-webkit-tap-highlight-color": "rgba(0,0,0,0)",
                userSelect: "none",
                "touch-action": "manipulation",
                outline: "none",
              },
              d.style || {},
            ));
          this.container = f = O("div", { id: f }, g, k);
          this._cursor = f.style.cursor;
          this.renderer = new (
            d.renderer || !b ? n.getRendererType(d.renderer) : c
          )(
            f,
            l,
            m,
            void 0,
            d.forExport,
            a.exporting && a.exporting.allowHTML,
            this.styledMode,
          );
          v(void 0, this);
          this.setClassName(d.className);
          if (this.styledMode)
            for (var p in a.defs) this.renderer.definition(a.defs[p]);
          else this.renderer.setStyle(d.style);
          this.renderer.chartIndex = this.index;
          R(this, "afterGetContainer");
        };
        a.prototype.getMargins = function (a) {
          var b = this.spacing,
            c = this.margin,
            d = this.titleOffset;
          this.resetMargins();
          d[0] &&
            !S(c[0]) &&
            (this.plotTop = Math.max(this.plotTop, d[0] + b[0]));
          d[2] &&
            !S(c[2]) &&
            (this.marginBottom = Math.max(this.marginBottom, d[2] + b[2]));
          this.legend && this.legend.display && this.legend.adjustMargins(c, b);
          R(this, "getMargins");
          a || this.getAxisMargins();
        };
        a.prototype.getAxisMargins = function () {
          var a = this,
            b = (a.axisOffset = [0, 0, 0, 0]),
            c = a.colorAxis,
            d = a.margin,
            e = function (a) {
              a.forEach(function (a) {
                a.visible && a.getOffset();
              });
            };
          a.hasCartesianSeries ? e(a.axes) : c && c.length && e(c);
          k.forEach(function (c, e) {
            S(d[e]) || (a[c] += b[e]);
          });
          a.setChartSize();
        };
        a.prototype.reflow = function (a) {
          var b = this,
            c = b.options.chart,
            d = b.renderTo,
            e = S(c.width) && S(c.height),
            f = c.width || F(d, "width");
          c = c.height || F(d, "height");
          d = a ? a.target : p;
          delete b.pointer.chartPosition;
          if (!e && !b.isPrinting && f && c && (d === p || d === h)) {
            if (f !== b.containerWidth || c !== b.containerHeight)
              m.clearTimeout(b.reflowTimeout),
                (b.reflowTimeout = ia(
                  function () {
                    b.container && b.setSize(void 0, void 0, !1);
                  },
                  a ? 100 : 0,
                ));
            b.containerWidth = f;
            b.containerHeight = c;
          }
        };
        a.prototype.setReflow = function (a) {
          var b = this;
          !1 === a || this.unbindReflow
            ? !1 === a &&
              this.unbindReflow &&
              (this.unbindReflow = this.unbindReflow())
            : ((this.unbindReflow = w(p, "resize", function (a) {
                b.options && b.reflow(a);
              })),
              w(this, "destroy", this.unbindReflow));
        };
        a.prototype.setSize = function (a, b, c) {
          var d = this,
            e = d.renderer;
          d.isResizing += 1;
          v(c, d);
          c = e.globalAnimation;
          d.oldChartHeight = d.chartHeight;
          d.oldChartWidth = d.chartWidth;
          "undefined" !== typeof a && (d.options.chart.width = a);
          "undefined" !== typeof b && (d.options.chart.height = b);
          d.getChartSize();
          d.styledMode ||
            (c ? u : Q)(
              d.container,
              { width: d.chartWidth + "px", height: d.chartHeight + "px" },
              c,
            );
          d.setChartSize(!0);
          e.setSize(d.chartWidth, d.chartHeight, c);
          d.axes.forEach(function (a) {
            a.isDirty = !0;
            a.setScale();
          });
          d.isDirtyLegend = !0;
          d.isDirtyBox = !0;
          d.layOutTitles();
          d.getMargins();
          d.redraw(c);
          d.oldChartHeight = null;
          R(d, "resize");
          ia(function () {
            d &&
              R(d, "endResize", null, function () {
                --d.isResizing;
              });
          }, C(c).duration);
        };
        a.prototype.setChartSize = function (a) {
          var b = this.inverted,
            c = this.renderer,
            d = this.chartWidth,
            e = this.chartHeight,
            h = this.options.chart,
            f = this.spacing,
            g = this.clipOffset,
            k,
            l,
            m,
            p;
          this.plotLeft = k = Math.round(this.plotLeft);
          this.plotTop = l = Math.round(this.plotTop);
          this.plotWidth = m = Math.max(
            0,
            Math.round(d - k - this.marginRight),
          );
          this.plotHeight = p = Math.max(
            0,
            Math.round(e - l - this.marginBottom),
          );
          this.plotSizeX = b ? p : m;
          this.plotSizeY = b ? m : p;
          this.plotBorderWidth = h.plotBorderWidth || 0;
          this.spacingBox = c.spacingBox = {
            x: f[3],
            y: f[0],
            width: d - f[3] - f[1],
            height: e - f[0] - f[2],
          };
          this.plotBox = c.plotBox = { x: k, y: l, width: m, height: p };
          b = 2 * Math.floor(this.plotBorderWidth / 2);
          d = Math.ceil(Math.max(b, g[3]) / 2);
          e = Math.ceil(Math.max(b, g[0]) / 2);
          this.clipBox = {
            x: d,
            y: e,
            width: Math.floor(this.plotSizeX - Math.max(b, g[1]) / 2 - d),
            height: Math.max(
              0,
              Math.floor(this.plotSizeY - Math.max(b, g[2]) / 2 - e),
            ),
          };
          a ||
            (this.axes.forEach(function (a) {
              a.setAxisSize();
              a.setAxisTranslation();
            }),
            c.alignElements());
          R(this, "afterSetChartSize", { skipAxes: a });
        };
        a.prototype.resetMargins = function () {
          R(this, "resetMargins");
          var a = this,
            b = a.options.chart;
          ["margin", "spacing"].forEach(function (c) {
            var d = b[c],
              e = X(d) ? d : [d, d, d, d];
            ["Top", "Right", "Bottom", "Left"].forEach(function (d, h) {
              a[c][h] = V(b[c + d], e[h]);
            });
          });
          k.forEach(function (b, c) {
            a[b] = V(a.margin[c], a.spacing[c]);
          });
          a.axisOffset = [0, 0, 0, 0];
          a.clipOffset = [0, 0, 0, 0];
        };
        a.prototype.drawChartBox = function () {
          var a = this.options.chart,
            b = this.renderer,
            c = this.chartWidth,
            d = this.chartHeight,
            e = this.styledMode,
            h = this.plotBGImage,
            f = a.backgroundColor,
            g = a.plotBackgroundColor,
            k = a.plotBackgroundImage,
            l = this.plotLeft,
            m = this.plotTop,
            p = this.plotWidth,
            F = this.plotHeight,
            n = this.plotBox,
            u = this.clipRect,
            q = this.clipBox,
            w = this.chartBackground,
            M = this.plotBackground,
            z = this.plotBorder,
            y,
            t = "animate";
          w ||
            ((this.chartBackground = w =
              b.rect().addClass("highcharts-background").add()),
            (t = "attr"));
          if (e) var P = (y = w.strokeWidth());
          else {
            P = a.borderWidth || 0;
            y = P + (a.shadow ? 8 : 0);
            f = { fill: f || "none" };
            if (P || w["stroke-width"])
              (f.stroke = a.borderColor), (f["stroke-width"] = P);
            w.attr(f).shadow(a.shadow);
          }
          w[t]({
            x: y / 2,
            y: y / 2,
            width: c - y - (P % 2),
            height: d - y - (P % 2),
            r: a.borderRadius,
          });
          t = "animate";
          M ||
            ((t = "attr"),
            (this.plotBackground = M =
              b.rect().addClass("highcharts-plot-background").add()));
          M[t](n);
          e ||
            (M.attr({ fill: g || "none" }).shadow(a.plotShadow),
            k &&
              (h
                ? (k !== h.attr("href") && h.attr("href", k), h.animate(n))
                : (this.plotBGImage = b.image(k, l, m, p, F).add())));
          u
            ? u.animate({ width: q.width, height: q.height })
            : (this.clipRect = b.clipRect(q));
          t = "animate";
          z ||
            ((t = "attr"),
            (this.plotBorder = z =
              b
                .rect()
                .addClass("highcharts-plot-border")
                .attr({ zIndex: 1 })
                .add()));
          e ||
            z.attr({
              stroke: a.plotBorderColor,
              "stroke-width": a.plotBorderWidth || 0,
              fill: "none",
            });
          z[t](z.crisp({ x: l, y: m, width: p, height: F }, -z.strokeWidth()));
          this.isDirtyBox = !1;
          R(this, "afterDrawChartBox");
        };
        a.prototype.propFromSeries = function () {
          var a = this,
            b = a.options.chart,
            c = a.options.series,
            d,
            e,
            h;
          ["inverted", "angular", "polar"].forEach(function (f) {
            e = z[b.type || b.defaultSeriesType];
            h = b[f] || (e && e.prototype[f]);
            for (d = c && c.length; !h && d--; )
              (e = z[c[d].type]) && e.prototype[f] && (h = !0);
            a[f] = h;
          });
        };
        a.prototype.linkSeries = function () {
          var a = this,
            b = a.series;
          b.forEach(function (a) {
            a.linkedSeries.length = 0;
          });
          b.forEach(function (b) {
            var c = b.options.linkedTo;
            W(c) &&
              (c = ":previous" === c ? a.series[b.index - 1] : a.get(c)) &&
              c.linkedParent !== b &&
              (c.linkedSeries.push(b),
              (b.linkedParent = c),
              c.enabledDataSorting && b.setDataSortingOptions(),
              (b.visible = V(b.options.visible, c.options.visible, b.visible)));
          });
          R(this, "afterLinkSeries");
        };
        a.prototype.renderSeries = function () {
          this.series.forEach(function (a) {
            a.translate();
            a.render();
          });
        };
        a.prototype.renderLabels = function () {
          var a = this,
            b = a.options.labels;
          b.items &&
            b.items.forEach(function (c) {
              var d = K(b.style, c.style),
                e = ba(d.left) + a.plotLeft,
                h = ba(d.top) + a.plotTop + 12;
              delete d.left;
              delete d.top;
              a.renderer.text(c.html, e, h).attr({ zIndex: 2 }).css(d).add();
            });
        };
        a.prototype.render = function () {
          var a = this.axes,
            b = this.colorAxis,
            c = this.renderer,
            d = this.options,
            e = function (a) {
              a.forEach(function (a) {
                a.visible && a.render();
              });
            },
            h = 0;
          this.setTitle();
          this.legend = new G(this, d.legend);
          this.getStacks && this.getStacks();
          this.getMargins(!0);
          this.setChartSize();
          d = this.plotWidth;
          a.some(function (a) {
            if (
              a.horiz &&
              a.visible &&
              a.options.labels.enabled &&
              a.series.length
            )
              return (h = 21), !0;
          });
          var f = (this.plotHeight = Math.max(this.plotHeight - h, 0));
          a.forEach(function (a) {
            a.setScale();
          });
          this.getAxisMargins();
          var g = 1.1 < d / this.plotWidth,
            k = 1.05 < f / this.plotHeight;
          if (g || k)
            a.forEach(function (a) {
              ((a.horiz && g) || (!a.horiz && k)) && a.setTickInterval(!0);
            }),
              this.getMargins();
          this.drawChartBox();
          this.hasCartesianSeries ? e(a) : b && b.length && e(b);
          this.seriesGroup ||
            (this.seriesGroup = c.g("series-group").attr({ zIndex: 3 }).add());
          this.renderSeries();
          this.renderLabels();
          this.addCredits();
          this.setResponsive && this.setResponsive();
          this.hasRendered = !0;
        };
        a.prototype.addCredits = function (a) {
          var b = this,
            c = U(!0, this.options.credits, a);
          c.enabled &&
            !this.credits &&
            ((this.credits = this.renderer
              .text(c.text + (this.mapCredits || ""), 0, 0)
              .addClass("highcharts-credits")
              .on("click", function () {
                c.href && (p.location.href = c.href);
              })
              .attr({ align: c.position.align, zIndex: 8 })),
            b.styledMode || this.credits.css(c.style),
            this.credits.add().align(c.position),
            (this.credits.update = function (a) {
              b.credits = b.credits.destroy();
              b.addCredits(a);
            }));
        };
        a.prototype.destroy = function () {
          var a = this,
            b = a.axes,
            c = a.series,
            d = a.container,
            h = d && d.parentNode,
            f;
          R(a, "destroy");
          a.renderer.forExport ? y(q, a) : (q[a.index] = void 0);
          B.chartCount--;
          a.renderTo.removeAttribute("data-highcharts-chart");
          da(a);
          for (f = b.length; f--; ) b[f] = b[f].destroy();
          this.scroller && this.scroller.destroy && this.scroller.destroy();
          for (f = c.length; f--; ) c[f] = c[f].destroy();
          "title subtitle chartBackground plotBackground plotBGImage plotBorder seriesGroup clipRect credits pointer rangeSelector legend resetZoomButton tooltip renderer"
            .split(" ")
            .forEach(function (b) {
              var c = a[b];
              c && c.destroy && (a[b] = c.destroy());
            });
          d && ((d.innerHTML = e.emptyHTML), da(d), h && Y(d));
          Z(a, function (b, c) {
            delete a[c];
          });
        };
        a.prototype.firstRender = function () {
          var a = this,
            b = a.options;
          if (!a.isReadyToRender || a.isReadyToRender()) {
            a.getContainer();
            a.resetMargins();
            a.setChartSize();
            a.propFromSeries();
            a.getAxes();
            (P(b.series) ? b.series : []).forEach(function (b) {
              a.initSeries(b);
            });
            a.linkSeries();
            a.setSeriesData();
            R(a, "beforeRender");
            t &&
              (r.isRequired()
                ? (a.pointer = new r(a, b))
                : (a.pointer = new t(a, b)));
            a.render();
            a.pointer.getChartPosition();
            if (!a.renderer.imgCount && !a.hasLoaded) a.onload();
            a.temporaryDisplay(!0);
          }
        };
        a.prototype.onload = function () {
          this.callbacks.concat([this.callback]).forEach(function (a) {
            a && "undefined" !== typeof this.index && a.apply(this, [this]);
          }, this);
          R(this, "load");
          R(this, "render");
          S(this.index) && this.setReflow(this.options.chart.reflow);
          this.warnIfA11yModuleNotLoaded();
          this.hasLoaded = !0;
        };
        a.prototype.warnIfA11yModuleNotLoaded = function () {
          var a = this.options,
            b = this.title;
          a &&
            !this.accessibility &&
            (this.renderer.boxWrapper.attr({
              role: "img",
              "aria-label": ((b && b.element.textContent) || "").replace(
                /</g,
                "&lt;",
              ),
            }),
            (a.accessibility && !1 === a.accessibility.enabled) ||
              T(
                'Highcharts warning: Consider including the "accessibility.js" module to make your chart more usable for people with disabilities. Set the "accessibility.enabled" option to false to remove this warning. See https://www.highcharts.com/docs/accessibility/accessibility-module.',
                !1,
                this,
              ));
        };
        a.prototype.addSeries = function (a, b, c) {
          var d = this,
            e;
          a &&
            ((b = V(b, !0)),
            R(d, "addSeries", { options: a }, function () {
              e = d.initSeries(a);
              d.isDirtyLegend = !0;
              d.linkSeries();
              e.enabledDataSorting && e.setData(a.data, !1);
              R(d, "afterAddSeries", { series: e });
              b && d.redraw(c);
            }));
          return e;
        };
        a.prototype.addAxis = function (a, b, c, d) {
          return this.createAxis(b ? "xAxis" : "yAxis", {
            axis: a,
            redraw: c,
            animation: d,
          });
        };
        a.prototype.addColorAxis = function (a, b, c) {
          return this.createAxis("colorAxis", {
            axis: a,
            redraw: b,
            animation: c,
          });
        };
        a.prototype.createAxis = function (a, b) {
          a = new g(
            this,
            U(b.axis, { index: this[a].length, isX: "xAxis" === a }),
          );
          V(b.redraw, !0) && this.redraw(b.animation);
          return a;
        };
        a.prototype.showLoading = function (a) {
          var b = this,
            c = b.options,
            d = c.loading,
            h = function () {
              f &&
                Q(f, {
                  left: b.plotLeft + "px",
                  top: b.plotTop + "px",
                  width: b.plotWidth + "px",
                  height: b.plotHeight + "px",
                });
            },
            f = b.loadingDiv,
            g = b.loadingSpan;
          f ||
            (b.loadingDiv = f =
              O(
                "div",
                { className: "highcharts-loading highcharts-loading-hidden" },
                null,
                b.container,
              ));
          g ||
            ((b.loadingSpan = g =
              O("span", { className: "highcharts-loading-inner" }, null, f)),
            w(b, "redraw", h));
          f.className = "highcharts-loading";
          e.setElementHTML(g, V(a, c.lang.loading, ""));
          b.styledMode ||
            (Q(f, K(d.style, { zIndex: 10 })),
            Q(g, d.labelStyle),
            b.loadingShown ||
              (Q(f, { opacity: 0, display: "" }),
              u(
                f,
                { opacity: d.style.opacity || 0.5 },
                { duration: d.showDuration || 0 },
              )));
          b.loadingShown = !0;
          h();
        };
        a.prototype.hideLoading = function () {
          var a = this.options,
            b = this.loadingDiv;
          b &&
            ((b.className = "highcharts-loading highcharts-loading-hidden"),
            this.styledMode ||
              u(
                b,
                { opacity: 0 },
                {
                  duration: a.loading.hideDuration || 100,
                  complete: function () {
                    Q(b, { display: "none" });
                  },
                },
              ));
          this.loadingShown = !1;
        };
        a.prototype.update = function (a, b, c, e) {
          var h = this,
            f = {
              credits: "addCredits",
              title: "setTitle",
              subtitle: "setSubtitle",
              caption: "setCaption",
            },
            g = a.isResponsiveOptions,
            k = [],
            m,
            p;
          R(h, "update", { options: a });
          g || h.setResponsive(!1, !0);
          a = H(a, h.options);
          h.userOptions = U(h.userOptions, a);
          var F = a.chart;
          if (F) {
            U(!0, h.options.chart, F);
            "className" in F && h.setClassName(F.className);
            "reflow" in F && h.setReflow(F.reflow);
            if ("inverted" in F || "polar" in F || "type" in F) {
              h.propFromSeries();
              var n = !0;
            }
            "alignTicks" in F && (n = !0);
            "events" in F && d(this, F);
            Z(F, function (a, b) {
              -1 !== h.propsRequireUpdateSeries.indexOf("chart." + b) &&
                (m = !0);
              -1 !== h.propsRequireDirtyBox.indexOf(b) && (h.isDirtyBox = !0);
              -1 !== h.propsRequireReflow.indexOf(b) &&
                (g ? (h.isDirtyBox = !0) : (p = !0));
            });
            !h.styledMode &&
              F.style &&
              h.renderer.setStyle(h.options.chart.style || {});
          }
          !h.styledMode && a.colors && (this.options.colors = a.colors);
          a.time &&
            (this.time === L && (this.time = new l(a.time)),
            U(!0, h.options.time, a.time));
          Z(a, function (b, c) {
            if (h[c] && "function" === typeof h[c].update) h[c].update(b, !1);
            else if ("function" === typeof h[f[c]]) h[f[c]](b);
            else
              "colors" !== c &&
                -1 === h.collectionsWithUpdate.indexOf(c) &&
                U(!0, h.options[c], a[c]);
            "chart" !== c &&
              -1 !== h.propsRequireUpdateSeries.indexOf(c) &&
              (m = !0);
          });
          this.collectionsWithUpdate.forEach(function (b) {
            if (a[b]) {
              var d = [];
              h[b].forEach(function (a, b) {
                a.options.isInternal || d.push(V(a.options.index, b));
              });
              fa(a[b]).forEach(function (a, e) {
                var f = S(a.id),
                  g;
                f && (g = h.get(a.id));
                !g &&
                  h[b] &&
                  (g = h[b][d ? d[e] : e]) &&
                  f &&
                  S(g.options.id) &&
                  (g = void 0);
                g && g.coll === b && (g.update(a, !1), c && (g.touched = !0));
                !g &&
                  c &&
                  h.collectionsWithInit[b] &&
                  (h.collectionsWithInit[b][0].apply(
                    h,
                    [a].concat(h.collectionsWithInit[b][1] || []).concat([!1]),
                  ).touched = !0);
              });
              c &&
                h[b].forEach(function (a) {
                  a.touched || a.options.isInternal
                    ? delete a.touched
                    : k.push(a);
                });
            }
          });
          k.forEach(function (a) {
            a.chart && a.remove && a.remove(!1);
          });
          n &&
            h.axes.forEach(function (a) {
              a.update({}, !1);
            });
          m &&
            h.getSeriesOrderByLinks().forEach(function (a) {
              a.chart && a.update({}, !1);
            }, this);
          n = F && F.width;
          F = F && (W(F.height) ? ha(F.height, n || h.chartWidth) : F.height);
          p || (M(n) && n !== h.chartWidth) || (M(F) && F !== h.chartHeight)
            ? h.setSize(n, F, e)
            : V(b, !0) && h.redraw(e);
          R(h, "afterUpdate", { options: a, redraw: b, animation: e });
        };
        a.prototype.setSubtitle = function (a, b) {
          this.applyDescription("subtitle", a);
          this.layOutTitles(b);
        };
        a.prototype.setCaption = function (a, b) {
          this.applyDescription("caption", a);
          this.layOutTitles(b);
        };
        a.prototype.showResetZoom = function () {
          function a() {
            b.zoomOut();
          }
          var b = this,
            c = I.lang,
            d = b.options.chart.zooming.resetButton,
            h = d.theme,
            e =
              "chart" === d.relativeTo || "spacingBox" === d.relativeTo
                ? null
                : "scrollablePlotBox";
          R(this, "beforeShowResetZoom", null, function () {
            b.resetZoomButton = b.renderer
              .button(c.resetZoom, null, null, a, h)
              .attr({ align: d.position.align, title: c.resetZoomTitle })
              .addClass("highcharts-reset-zoom")
              .add()
              .align(d.position, !1, e);
          });
          R(this, "afterShowResetZoom");
        };
        a.prototype.zoomOut = function () {
          R(this, "selection", { resetSelection: !0 }, this.zoom);
        };
        a.prototype.zoom = function (a) {
          var b = this,
            c = b.pointer,
            d = !1,
            h;
          !a || a.resetSelection
            ? (b.axes.forEach(function (a) {
                h = a.zoom();
              }),
              (c.initiated = !1))
            : a.xAxis.concat(a.yAxis).forEach(function (a) {
                var e = a.axis;
                if (
                  (c[e.isXAxis ? "zoomX" : "zoomY"] &&
                    S(c.mouseDownX) &&
                    S(c.mouseDownY) &&
                    b.isInsidePlot(
                      c.mouseDownX - b.plotLeft,
                      c.mouseDownY - b.plotTop,
                      { axis: e },
                    )) ||
                  !S(b.inverted ? c.mouseDownX : c.mouseDownY)
                )
                  (h = e.zoom(a.min, a.max)), e.displayBtn && (d = !0);
              });
          var e = b.resetZoomButton;
          d && !e
            ? b.showResetZoom()
            : !d && X(e) && (b.resetZoomButton = e.destroy());
          h &&
            b.redraw(
              V(
                b.options.chart.animation,
                a && a.animation,
                100 > b.pointCount,
              ),
            );
        };
        a.prototype.pan = function (a, b) {
          var c = this,
            d = c.hoverPoints;
          b = "object" === typeof b ? b : { enabled: b, type: "x" };
          var e = c.options.chart;
          e && e.panning && (e.panning = b);
          var h = b.type,
            f;
          R(this, "pan", { originalEvent: a }, function () {
            d &&
              d.forEach(function (a) {
                a.setState();
              });
            var b = c.xAxis;
            "xy" === h ? (b = b.concat(c.yAxis)) : "y" === h && (b = c.yAxis);
            var e = {};
            b.forEach(function (b) {
              if (b.options.panningEnabled && !b.options.isInternal) {
                var d = b.horiz,
                  g = a[d ? "chartX" : "chartY"];
                d = d ? "mouseDownX" : "mouseDownY";
                var k = c[d],
                  l = b.minPointOffset || 0,
                  m =
                    (b.reversed && !c.inverted) || (!b.reversed && c.inverted)
                      ? -1
                      : 1,
                  p = b.getExtremes(),
                  F = b.toValue(k - g, !0) + l * m,
                  n =
                    b.toValue(k + b.len - g, !0) -
                    (l * m || (b.isXAxis && b.pointRangePadding) || 0),
                  u = n < F;
                m = b.hasVerticalPanning();
                k = u ? n : F;
                F = u ? F : n;
                var q = b.panningState;
                !m ||
                  b.isXAxis ||
                  (q && !q.isDirty) ||
                  b.series.forEach(function (a) {
                    var b = a.getProcessedData(!0);
                    b = a.getExtremes(b.yData, !0);
                    q ||
                      (q = {
                        startMin: Number.MAX_VALUE,
                        startMax: -Number.MAX_VALUE,
                      });
                    M(b.dataMin) &&
                      M(b.dataMax) &&
                      ((q.startMin = Math.min(
                        V(a.options.threshold, Infinity),
                        b.dataMin,
                        q.startMin,
                      )),
                      (q.startMax = Math.max(
                        V(a.options.threshold, -Infinity),
                        b.dataMax,
                        q.startMax,
                      )));
                  });
                m = Math.min(
                  V(q && q.startMin, p.dataMin),
                  l ? p.min : b.toValue(b.toPixels(p.min) - b.minPixelPadding),
                );
                n = Math.max(
                  V(q && q.startMax, p.dataMax),
                  l ? p.max : b.toValue(b.toPixels(p.max) + b.minPixelPadding),
                );
                b.panningState = q;
                b.isOrdinal ||
                  ((l = m - k),
                  0 < l && ((F += l), (k = m)),
                  (l = F - n),
                  0 < l && ((F = n), (k -= l)),
                  b.series.length &&
                    k !== p.min &&
                    F !== p.max &&
                    k >= m &&
                    F <= n &&
                    (b.setExtremes(k, F, !1, !1, { trigger: "pan" }),
                    !c.resetZoomButton &&
                      k !== m &&
                      F !== n &&
                      h.match("y") &&
                      (c.showResetZoom(), (b.displayBtn = !1)),
                    (f = !0)),
                  (e[d] = g));
              }
            });
            Z(e, function (a, b) {
              c[b] = a;
            });
            f && c.redraw(!1);
            Q(c.container, { cursor: "move" });
          });
        };
        return a;
      })();
      K(a.prototype, {
        callbacks: [],
        collectionsWithInit: {
          xAxis: [a.prototype.addAxis, [!0]],
          yAxis: [a.prototype.addAxis, [!1]],
          series: [a.prototype.addSeries],
        },
        collectionsWithUpdate: ["xAxis", "yAxis", "series"],
        propsRequireDirtyBox:
          "backgroundColor borderColor borderWidth borderRadius plotBackgroundColor plotBackgroundImage plotBorderColor plotBorderWidth plotShadow shadow".split(
            " ",
          ),
        propsRequireReflow:
          "margin marginTop marginRight marginBottom marginLeft spacing spacingTop spacingRight spacingBottom spacingLeft".split(
            " ",
          ),
        propsRequireUpdateSeries:
          "chart.inverted chart.polar chart.ignoreHiddenSeries chart.type colors plotOptions time tooltip".split(
            " ",
          ),
      });
      ("");
      return a;
    },
  );
  K(g, "Core/Legend/LegendSymbol.js", [g["Core/Utilities.js"]], function (a) {
    var g = a.merge,
      x = a.pick,
      E;
    (function (a) {
      a.drawLineMarker = function (a) {
        var v = (this.legendItem = this.legendItem || {}),
          r = this.options,
          t = a.symbolWidth,
          n = a.symbolHeight,
          f = n / 2,
          c = this.chart.renderer,
          l = v.group;
        a = a.baseline - Math.round(0.3 * a.fontMetrics.b);
        var m = {},
          e = r.marker;
        this.chart.styledMode ||
          ((m = { "stroke-width": r.lineWidth || 0 }),
          r.dashStyle && (m.dashstyle = r.dashStyle));
        v.line = c
          .path([
            ["M", 0, a],
            ["L", t, a],
          ])
          .addClass("highcharts-graph")
          .attr(m)
          .add(l);
        e &&
          !1 !== e.enabled &&
          t &&
          ((r = Math.min(x(e.radius, f), f)),
          0 === this.symbol.indexOf("url") &&
            ((e = g(e, { width: n, height: n })), (r = 0)),
          (v.symbol = v =
            c
              .symbol(this.symbol, t / 2 - r, a - r, 2 * r, 2 * r, e)
              .addClass("highcharts-point")
              .add(l)),
          (v.isMarker = !0));
      };
      a.drawRectangle = function (a, g) {
        g = g.legendItem || {};
        var r = a.symbolHeight,
          t = a.options.squareSymbol;
        g.symbol = this.chart.renderer
          .rect(
            t ? (a.symbolWidth - r) / 2 : 0,
            a.baseline - r + 1,
            t ? r : a.symbolWidth,
            r,
            x(a.options.symbolRadius, r / 2),
          )
          .addClass("highcharts-point")
          .attr({ zIndex: 3 })
          .add(g.group);
      };
    })(E || (E = {}));
    return E;
  });
  K(g, "Core/Series/SeriesDefaults.js", [], function () {
    return {
      lineWidth: 2,
      allowPointSelect: !1,
      crisp: !0,
      showCheckbox: !1,
      animation: { duration: 1e3 },
      events: {},
      marker: {
        enabledThreshold: 2,
        lineColor: "#ffffff",
        lineWidth: 0,
        radius: 4,
        states: {
          normal: { animation: !0 },
          hover: {
            animation: { duration: 50 },
            enabled: !0,
            radiusPlus: 2,
            lineWidthPlus: 1,
          },
          select: { fillColor: "#cccccc", lineColor: "#000000", lineWidth: 2 },
        },
      },
      point: { events: {} },
      dataLabels: {
        animation: {},
        align: "center",
        defer: !0,
        formatter: function () {
          var a = this.series.chart.numberFormatter;
          return "number" !== typeof this.y ? "" : a(this.y, -1);
        },
        padding: 5,
        style: {
          fontSize: "11px",
          fontWeight: "bold",
          color: "contrast",
          textOutline: "1px contrast",
        },
        verticalAlign: "bottom",
        x: 0,
        y: 0,
      },
      cropThreshold: 300,
      opacity: 1,
      pointRange: 0,
      softThreshold: !0,
      states: {
        normal: { animation: !0 },
        hover: {
          animation: { duration: 50 },
          lineWidthPlus: 1,
          marker: {},
          halo: { size: 10, opacity: 0.25 },
        },
        select: { animation: { duration: 0 } },
        inactive: { animation: { duration: 50 }, opacity: 0.2 },
      },
      stickyTracking: !0,
      turboThreshold: 1e3,
      findNearestPointBy: "x",
    };
  });
  K(
    g,
    "Core/Series/Series.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Defaults.js"],
      g["Core/Foundation.js"],
      g["Core/Globals.js"],
      g["Core/Legend/LegendSymbol.js"],
      g["Core/Series/Point.js"],
      g["Core/Series/SeriesDefaults.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Renderer/SVG/SVGElement.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B, G, r, t, n) {
      var f = a.animObject,
        c = a.setAnimation,
        l = g.defaultOptions,
        m = x.registerEventOptions,
        e = E.hasTouch,
        u = E.svg,
        C = E.win,
        v = r.seriesTypes,
        I = n.arrayMax,
        L = n.arrayMin,
        A = n.clamp,
        d = n.cleanRecursively,
        q = n.correctFloat,
        h = n.defined,
        k = n.erase,
        b = n.error,
        p = n.extend,
        z = n.find,
        w = n.fireEvent,
        N = n.getNestedProperty,
        H = n.isArray,
        O = n.isNumber,
        Q = n.isString,
        S = n.merge,
        Y = n.objectEach,
        y = n.pick,
        T = n.removeEvent,
        K = n.splat,
        ca = n.syncTimeout;
      a = (function () {
        function a() {
          this.zones =
            this.yAxis =
            this.xAxis =
            this.userOptions =
            this.tooltipOptions =
            this.processedYData =
            this.processedXData =
            this.points =
            this.options =
            this.linkedSeries =
            this.index =
            this.eventsToUnbind =
            this.eventOptions =
            this.data =
            this.chart =
            this._i =
              void 0;
        }
        a.prototype.init = function (a, b) {
          w(this, "init", { options: b });
          var c = this,
            d = a.series;
          this.eventsToUnbind = [];
          c.chart = a;
          c.options = c.setOptions(b);
          b = c.options;
          c.linkedSeries = [];
          c.bindAxes();
          p(c, {
            name: b.name,
            state: "",
            visible: !1 !== b.visible,
            selected: !0 === b.selected,
          });
          m(this, b);
          var e = b.events;
          if (
            (e && e.click) ||
            (b.point && b.point.events && b.point.events.click) ||
            b.allowPointSelect
          )
            a.runTrackerClick = !0;
          c.getColor();
          c.getSymbol();
          c.parallelArrays.forEach(function (a) {
            c[a + "Data"] || (c[a + "Data"] = []);
          });
          c.isCartesian && (a.hasCartesianSeries = !0);
          var h;
          d.length && (h = d[d.length - 1]);
          c._i = y(h && h._i, -1) + 1;
          c.opacity = c.options.opacity;
          a.orderSeries(this.insert(d));
          b.dataSorting && b.dataSorting.enabled
            ? c.setDataSortingOptions()
            : c.points || c.data || c.setData(b.data, !1);
          w(this, "afterInit");
        };
        a.prototype.is = function (a) {
          return v[a] && this instanceof v[a];
        };
        a.prototype.insert = function (a) {
          var b = this.options.index,
            c;
          if (O(b)) {
            for (c = a.length; c--; )
              if (b >= y(a[c].options.index, a[c]._i)) {
                a.splice(c + 1, 0, this);
                break;
              }
            -1 === c && a.unshift(this);
            c += 1;
          } else a.push(this);
          return y(c, a.length - 1);
        };
        a.prototype.bindAxes = function () {
          var a = this,
            c = a.options,
            d = a.chart,
            e;
          w(this, "bindAxes", null, function () {
            (a.axisTypes || []).forEach(function (h) {
              var f = 0;
              d[h].forEach(function (b) {
                e = b.options;
                if (
                  (c[h] === f && !e.isInternal) ||
                  ("undefined" !== typeof c[h] && c[h] === e.id) ||
                  ("undefined" === typeof c[h] && 0 === e.index)
                )
                  a.insert(b.series), (a[h] = b), (b.isDirty = !0);
                e.isInternal || f++;
              });
              a[h] || a.optionalAxis === h || b(18, !0, d);
            });
          });
          w(this, "afterBindAxes");
        };
        a.prototype.updateParallelArrays = function (a, b) {
          var c = a.series,
            d = arguments,
            e = O(b)
              ? function (d) {
                  var e = "y" === d && c.toYData ? c.toYData(a) : a[d];
                  c[d + "Data"][b] = e;
                }
              : function (a) {
                  Array.prototype[b].apply(
                    c[a + "Data"],
                    Array.prototype.slice.call(d, 2),
                  );
                };
          c.parallelArrays.forEach(e);
        };
        a.prototype.hasData = function () {
          return (
            (this.visible &&
              "undefined" !== typeof this.dataMax &&
              "undefined" !== typeof this.dataMin) ||
            (this.visible && this.yData && 0 < this.yData.length)
          );
        };
        a.prototype.autoIncrement = function (a) {
          var b = this.options,
            c = b.pointIntervalUnit,
            d = b.relativeXValue,
            e = this.chart.time,
            h = this.xIncrement,
            f;
          h = y(h, b.pointStart, 0);
          this.pointInterval = f = y(this.pointInterval, b.pointInterval, 1);
          d && O(a) && (f *= a);
          c &&
            ((b = new e.Date(h)),
            "day" === c
              ? e.set("Date", b, e.get("Date", b) + f)
              : "month" === c
                ? e.set("Month", b, e.get("Month", b) + f)
                : "year" === c &&
                  e.set("FullYear", b, e.get("FullYear", b) + f),
            (f = b.getTime() - h));
          if (d && O(a)) return h + f;
          this.xIncrement = h + f;
          return h;
        };
        a.prototype.setDataSortingOptions = function () {
          var a = this.options;
          p(this, {
            requireSorting: !1,
            sorted: !1,
            enabledDataSorting: !0,
            allowDG: !1,
          });
          h(a.pointRange) || (a.pointRange = 1);
        };
        a.prototype.setOptions = function (a) {
          var b = this.chart,
            c = b.options,
            d = c.plotOptions,
            e = b.userOptions || {};
          a = S(a);
          b = b.styledMode;
          var f = { plotOptions: d, userOptions: a };
          w(this, "setOptions", f);
          var g = f.plotOptions[this.type],
            k = e.plotOptions || {};
          this.userOptions = f.userOptions;
          e = S(g, d.series, e.plotOptions && e.plotOptions[this.type], a);
          this.tooltipOptions = S(
            l.tooltip,
            l.plotOptions.series && l.plotOptions.series.tooltip,
            l.plotOptions[this.type].tooltip,
            c.tooltip.userOptions,
            d.series && d.series.tooltip,
            d[this.type].tooltip,
            a.tooltip,
          );
          this.stickyTracking = y(
            a.stickyTracking,
            k[this.type] && k[this.type].stickyTracking,
            k.series && k.series.stickyTracking,
            this.tooltipOptions.shared && !this.noSharedTooltip
              ? !0
              : e.stickyTracking,
          );
          null === g.marker && delete e.marker;
          this.zoneAxis = e.zoneAxis;
          d = this.zones = (e.zones || []).slice();
          (!e.negativeColor && !e.negativeFillColor) ||
            e.zones ||
            ((c = {
              value: e[this.zoneAxis + "Threshold"] || e.threshold || 0,
              className: "highcharts-negative",
            }),
            b ||
              ((c.color = e.negativeColor),
              (c.fillColor = e.negativeFillColor)),
            d.push(c));
          d.length &&
            h(d[d.length - 1].value) &&
            d.push(b ? {} : { color: this.color, fillColor: this.fillColor });
          w(this, "afterSetOptions", { options: e });
          return e;
        };
        a.prototype.getName = function () {
          return y(this.options.name, "Series " + (this.index + 1));
        };
        a.prototype.getCyclic = function (a, b, c) {
          var d = this.chart,
            e = this.userOptions,
            f = a + "Index",
            g = a + "Counter",
            k = c ? c.length : y(d.options.chart[a + "Count"], d[a + "Count"]);
          if (!b) {
            var l = y(e[f], e["_" + f]);
            h(l) ||
              (d.series.length || (d[g] = 0),
              (e["_" + f] = l = d[g] % k),
              (d[g] += 1));
            c && (b = c[l]);
          }
          "undefined" !== typeof l && (this[f] = l);
          this[a] = b;
        };
        a.prototype.getColor = function () {
          this.chart.styledMode
            ? this.getCyclic("color")
            : this.options.colorByPoint
              ? (this.color = "#cccccc")
              : this.getCyclic(
                  "color",
                  this.options.color || l.plotOptions[this.type].color,
                  this.chart.options.colors,
                );
        };
        a.prototype.getPointsCollection = function () {
          return (this.hasGroupedData ? this.points : this.data) || [];
        };
        a.prototype.getSymbol = function () {
          this.getCyclic(
            "symbol",
            this.options.marker.symbol,
            this.chart.options.symbols,
          );
        };
        a.prototype.findPointIndex = function (a, b) {
          var c = a.id,
            d = a.x,
            e = this.points,
            h = this.options.dataSorting,
            f,
            g;
          if (c) (h = this.chart.get(c)), h instanceof B && (f = h);
          else if (
            this.linkedParent ||
            this.enabledDataSorting ||
            this.options.relativeXValue
          )
            if (
              ((f = function (b) {
                return !b.touched && b.index === a.index;
              }),
              h && h.matchByName
                ? (f = function (b) {
                    return !b.touched && b.name === a.name;
                  })
                : this.options.relativeXValue &&
                  (f = function (b) {
                    return !b.touched && b.options.x === a.x;
                  }),
              (f = z(e, f)),
              !f)
            )
              return;
          if (f) {
            var k = f && f.index;
            "undefined" !== typeof k && (g = !0);
          }
          "undefined" === typeof k && O(d) && (k = this.xData.indexOf(d, b));
          -1 !== k &&
            "undefined" !== typeof k &&
            this.cropped &&
            (k = k >= this.cropStart ? k - this.cropStart : k);
          !g && O(k) && e[k] && e[k].touched && (k = void 0);
          return k;
        };
        a.prototype.updateData = function (a, b) {
          var c = this.options,
            d = c.dataSorting,
            e = this.points,
            f = [],
            g = this.requireSorting,
            k = a.length === e.length,
            l,
            m,
            p,
            n = !0;
          this.xIncrement = null;
          a.forEach(function (a, b) {
            var m =
                (h(a) &&
                  this.pointClass.prototype.optionsToObject.call(
                    { series: this },
                    a,
                  )) ||
                {},
              n = m.x;
            if (m.id || O(n)) {
              if (
                ((m = this.findPointIndex(m, p)),
                -1 === m || "undefined" === typeof m
                  ? f.push(a)
                  : e[m] && a !== c.data[m]
                    ? (e[m].update(a, !1, null, !1),
                      (e[m].touched = !0),
                      g && (p = m + 1))
                    : e[m] && (e[m].touched = !0),
                !k || b !== m || (d && d.enabled) || this.hasDerivedData)
              )
                l = !0;
            } else f.push(a);
          }, this);
          if (l)
            for (a = e.length; a--; )
              (m = e[a]) && !m.touched && m.remove && m.remove(!1, b);
          else
            !k || (d && d.enabled)
              ? (n = !1)
              : (a.forEach(function (a, b) {
                  a !== e[b].y && e[b].update && e[b].update(a, !1, null, !1);
                }),
                (f.length = 0));
          e.forEach(function (a) {
            a && (a.touched = !1);
          });
          if (!n) return !1;
          f.forEach(function (a) {
            this.addPoint(a, !1, null, null, !1);
          }, this);
          null === this.xIncrement &&
            this.xData &&
            this.xData.length &&
            ((this.xIncrement = I(this.xData)), this.autoIncrement());
          return !0;
        };
        a.prototype.setData = function (a, c, d, e) {
          void 0 === c && (c = !0);
          var h = this,
            f = h.points,
            g = (f && f.length) || 0,
            k = h.options,
            l = h.chart,
            m = k.dataSorting,
            p = h.xAxis,
            n = k.turboThreshold,
            F = this.xData,
            q = this.yData,
            u = h.pointArrayMap;
          u = u && u.length;
          var w = k.keys,
            z,
            y = 0,
            t = 1,
            r = null;
          if (!l.options.chart.allowMutatingData) {
            k.data && delete h.options.data;
            h.userOptions.data && delete h.userOptions.data;
            var A = S(!0, a);
          }
          a = A || a || [];
          A = a.length;
          m && m.enabled && (a = this.sortData(a));
          l.options.chart.allowMutatingData &&
            !1 !== e &&
            A &&
            g &&
            !h.cropped &&
            !h.hasGroupedData &&
            h.visible &&
            !h.boosted &&
            (z = this.updateData(a, d));
          if (!z) {
            h.xIncrement = null;
            h.colorCounter = 0;
            this.parallelArrays.forEach(function (a) {
              h[a + "Data"].length = 0;
            });
            if (n && A > n)
              if (((r = h.getFirstValidPoint(a)), O(r)))
                for (d = 0; d < A; d++)
                  (F[d] = this.autoIncrement()), (q[d] = a[d]);
              else if (H(r))
                if (u)
                  if (r.length === u)
                    for (d = 0; d < A; d++)
                      (F[d] = this.autoIncrement()), (q[d] = a[d]);
                  else
                    for (d = 0; d < A; d++)
                      (e = a[d]), (F[d] = e[0]), (q[d] = e.slice(1, u + 1));
                else if (
                  (w &&
                    ((y = w.indexOf("x")),
                    (t = w.indexOf("y")),
                    (y = 0 <= y ? y : 0),
                    (t = 0 <= t ? t : 1)),
                  1 === r.length && (t = 0),
                  y === t)
                )
                  for (d = 0; d < A; d++)
                    (F[d] = this.autoIncrement()), (q[d] = a[d][t]);
                else
                  for (d = 0; d < A; d++)
                    (e = a[d]), (F[d] = e[y]), (q[d] = e[t]);
              else b(12, !1, l);
            else
              for (d = 0; d < A; d++)
                "undefined" !== typeof a[d] &&
                  ((e = { series: h }),
                  h.pointClass.prototype.applyOptions.apply(e, [a[d]]),
                  h.updateParallelArrays(e, d));
            q && Q(q[0]) && b(14, !0, l);
            h.data = [];
            h.options.data = h.userOptions.data = a;
            for (d = g; d--; ) f[d] && f[d].destroy && f[d].destroy();
            p && (p.minRange = p.userMinRange);
            h.isDirty = l.isDirtyBox = !0;
            h.isDirtyData = !!f;
            d = !1;
          }
          "point" === k.legendType &&
            (this.processData(), this.generatePoints());
          c && l.redraw(d);
        };
        a.prototype.sortData = function (a) {
          var b = this,
            c = b.options.dataSorting.sortKey || "y",
            d = function (a, b) {
              return (
                (h(b) &&
                  a.pointClass.prototype.optionsToObject.call(
                    { series: a },
                    b,
                  )) ||
                {}
              );
            };
          a.forEach(function (c, e) {
            a[e] = d(b, c);
            a[e].index = e;
          }, this);
          a.concat()
            .sort(function (a, b) {
              a = N(c, a);
              b = N(c, b);
              return b < a ? -1 : b > a ? 1 : 0;
            })
            .forEach(function (a, b) {
              a.x = b;
            }, this);
          b.linkedSeries &&
            b.linkedSeries.forEach(function (b) {
              var c = b.options,
                e = c.data;
              (c.dataSorting && c.dataSorting.enabled) ||
                !e ||
                (e.forEach(function (c, h) {
                  e[h] = d(b, c);
                  a[h] && ((e[h].x = a[h].x), (e[h].index = h));
                }),
                b.setData(e, !1));
            });
          return a;
        };
        a.prototype.getProcessedData = function (a) {
          var c = this.xAxis,
            d = this.options,
            e = d.cropThreshold,
            h = a || this.getExtremesFromAll || d.getExtremesFromAll,
            f = this.isCartesian;
          a = c && c.val2lin;
          d = !(!c || !c.logarithmic);
          var g = 0,
            k = this.xData,
            l = this.yData,
            m = this.requireSorting;
          var p = !1;
          var n = k.length;
          if (c) {
            p = c.getExtremes();
            var F = p.min;
            var q = p.max;
            p = !(!c.categories || c.names.length);
          }
          if (f && this.sorted && !h && (!e || n > e || this.forceCrop))
            if (k[n - 1] < F || k[0] > q) (k = []), (l = []);
            else if (this.yData && (k[0] < F || k[n - 1] > q)) {
              var u = this.cropData(this.xData, this.yData, F, q);
              k = u.xData;
              l = u.yData;
              g = u.start;
              u = !0;
            }
          for (e = k.length || 1; --e; )
            if (
              ((c = d ? a(k[e]) - a(k[e - 1]) : k[e] - k[e - 1]),
              0 < c && ("undefined" === typeof w || c < w))
            )
              var w = c;
            else 0 > c && m && !p && (b(15, !1, this.chart), (m = !1));
          return {
            xData: k,
            yData: l,
            cropped: u,
            cropStart: g,
            closestPointRange: w,
          };
        };
        a.prototype.processData = function (a) {
          var b = this.xAxis;
          if (
            this.isCartesian &&
            !this.isDirty &&
            !b.isDirty &&
            !this.yAxis.isDirty &&
            !a
          )
            return !1;
          a = this.getProcessedData();
          this.cropped = a.cropped;
          this.cropStart = a.cropStart;
          this.processedXData = a.xData;
          this.processedYData = a.yData;
          this.closestPointRange = this.basePointRange = a.closestPointRange;
          w(this, "afterProcessData");
        };
        a.prototype.cropData = function (a, b, c, d, e) {
          var h = a.length,
            f,
            g = 0,
            k = h;
          e = y(e, this.cropShoulder);
          for (f = 0; f < h; f++)
            if (a[f] >= c) {
              g = Math.max(0, f - e);
              break;
            }
          for (c = f; c < h; c++)
            if (a[c] > d) {
              k = c + e;
              break;
            }
          return {
            xData: a.slice(g, k),
            yData: b.slice(g, k),
            start: g,
            end: k,
          };
        };
        a.prototype.generatePoints = function () {
          var a = this.options,
            b = this.processedData || a.data,
            c = this.processedXData,
            d = this.processedYData,
            e = this.pointClass,
            h = c.length,
            f = this.cropStart || 0,
            g = this.hasGroupedData,
            k = a.keys,
            l = [];
          a = a.dataGrouping && a.dataGrouping.groupAll ? f : 0;
          var m,
            n,
            q = this.data;
          if (!q && !g) {
            var u = [];
            u.length = b.length;
            q = this.data = u;
          }
          k && g && (this.options.keys = !1);
          for (n = 0; n < h; n++) {
            u = f + n;
            if (g) {
              var z = new e().init(this, [c[n]].concat(K(d[n])));
              z.dataGroup = this.groupMap[a + n];
              z.dataGroup.options &&
                ((z.options = z.dataGroup.options),
                p(z, z.dataGroup.options),
                delete z.dataLabels);
            } else
              (z = q[u]) ||
                "undefined" === typeof b[u] ||
                (q[u] = z = new e().init(this, b[u], c[n]));
            z && ((z.index = g ? a + n : u), (l[n] = z));
          }
          this.options.keys = k;
          if (q && (h !== (m = q.length) || g))
            for (n = 0; n < m; n++)
              n !== f || g || (n += h),
                q[n] && (q[n].destroyElements(), (q[n].plotX = void 0));
          this.data = q;
          this.points = l;
          w(this, "afterGeneratePoints");
        };
        a.prototype.getXExtremes = function (a) {
          return { min: L(a), max: I(a) };
        };
        a.prototype.getExtremes = function (a, b) {
          var c = this.xAxis,
            d = this.yAxis,
            e = this.processedXData || this.xData,
            h = [],
            f = this.requireSorting ? this.cropShoulder : 0;
          d = d ? d.positiveValuesOnly : !1;
          var g,
            k = 0,
            l = 0,
            m = 0;
          a = a || this.stackedYData || this.processedYData || [];
          var p = a.length;
          if (c) {
            var n = c.getExtremes();
            k = n.min;
            l = n.max;
          }
          for (g = 0; g < p; g++) {
            var q = e[g];
            n = a[g];
            var u = (O(n) || H(n)) && (n.length || 0 < n || !d);
            q =
              b ||
              this.getExtremesFromAll ||
              this.options.getExtremesFromAll ||
              this.cropped ||
              !c ||
              ((e[g + f] || q) >= k && (e[g - f] || q) <= l);
            if (u && q)
              if ((u = n.length)) for (; u--; ) O(n[u]) && (h[m++] = n[u]);
              else h[m++] = n;
          }
          a = { activeYData: h, dataMin: L(h), dataMax: I(h) };
          w(this, "afterGetExtremes", { dataExtremes: a });
          return a;
        };
        a.prototype.applyExtremes = function () {
          var a = this.getExtremes();
          this.dataMin = a.dataMin;
          this.dataMax = a.dataMax;
          return a;
        };
        a.prototype.getFirstValidPoint = function (a) {
          for (var b = a.length, c = 0, d = null; null === d && c < b; )
            (d = a[c]), c++;
          return d;
        };
        a.prototype.translate = function () {
          this.processedXData || this.processData();
          this.generatePoints();
          var a = this.options,
            b = a.stacking,
            c = this.xAxis,
            d = c.categories,
            e = this.enabledDataSorting,
            f = this.yAxis,
            g = this.points,
            k = g.length,
            l = this.pointPlacementToXValue(),
            m = !!l,
            p = a.threshold,
            n = a.startFromThreshold ? p : 0,
            u = this.zoneAxis || "y",
            z,
            t,
            r = Number.MAX_VALUE;
          for (z = 0; z < k; z++) {
            var C = g[z],
              v = C.x,
              x = void 0,
              I = void 0,
              N = C.y,
              J = C.low,
              D =
                b &&
                f.stacking &&
                f.stacking.stacks[
                  (this.negStacks && N < (n ? 0 : p) ? "-" : "") + this.stackKey
                ];
            if (
              (f.positiveValuesOnly && !f.validatePositiveValue(N)) ||
              (c.positiveValuesOnly && !c.validatePositiveValue(v))
            )
              C.isNull = !0;
            C.plotX = t = q(
              A(
                c.translate(v, 0, 0, 0, 1, l, "flags" === this.type),
                -1e5,
                1e5,
              ),
            );
            if (b && this.visible && D && D[v]) {
              var B = this.getStackIndicator(B, v, this.index);
              C.isNull || ((x = D[v]), (I = x.points[B.key]));
            }
            H(I) &&
              ((J = I[0]),
              (N = I[1]),
              J === n && B.key === D[v].base && (J = y(O(p) && p, f.min)),
              f.positiveValuesOnly && 0 >= J && (J = null),
              (C.total = C.stackTotal = x.total),
              (C.percentage = x.total && (C.y / x.total) * 100),
              (C.stackY = N),
              this.irregularWidths ||
                x.setOffset(this.pointXOffset || 0, this.barW || 0));
            C.yBottom = h(J) ? A(f.translate(J, 0, 1, 0, 1), -1e5, 1e5) : null;
            this.dataModify && (N = this.dataModify.modifyValue(N, z));
            C.plotY = void 0;
            O(N) &&
              ((x = f.translate(N, !1, !0, !1, !0)),
              "undefined" !== typeof x && (C.plotY = A(x, -1e5, 1e5)));
            C.isInside = this.isPointInside(C);
            C.clientX = m ? q(c.translate(v, 0, 0, 0, 1, l)) : t;
            C.negative = C[u] < (a[u + "Threshold"] || p || 0);
            C.category = y(d && d[C.x], C.x);
            if (!C.isNull && !1 !== C.visible) {
              "undefined" !== typeof E && (r = Math.min(r, Math.abs(t - E)));
              var E = t;
            }
            C.zone = this.zones.length ? C.getZone() : void 0;
            !C.graphic && this.group && e && (C.isNew = !0);
          }
          this.closestPointRangePx = r;
          w(this, "afterTranslate");
        };
        a.prototype.getValidPoints = function (a, b, c) {
          var d = this.chart;
          return (a || this.points || []).filter(function (a) {
            return b &&
              !d.isInsidePlot(a.plotX, a.plotY, { inverted: d.inverted })
              ? !1
              : !1 !== a.visible && (c || !a.isNull);
          });
        };
        a.prototype.getClipBox = function () {
          var a = this.chart,
            b = this.xAxis,
            c = this.yAxis,
            d = S(a.clipBox);
          b && b.len !== a.plotSizeX && (d.width = b.len);
          c && c.len !== a.plotSizeY && (d.height = c.len);
          return d;
        };
        a.prototype.getSharedClipKey = function () {
          return (this.sharedClipKey =
            (this.options.xAxis || 0) + "," + (this.options.yAxis || 0));
        };
        a.prototype.setClip = function () {
          var a = this.chart,
            b = this.group,
            c = this.markerGroup,
            d = a.sharedClips;
          a = a.renderer;
          var e = this.getClipBox(),
            h = this.getSharedClipKey(),
            f = d[h];
          f ? f.animate(e) : (d[h] = f = a.clipRect(e));
          b && b.clip(!1 === this.options.clip ? void 0 : f);
          c && c.clip();
        };
        a.prototype.animate = function (a) {
          var b = this.chart,
            c = this.group,
            d = this.markerGroup,
            e = b.inverted,
            h = f(this.options.animation),
            g = [this.getSharedClipKey(), h.duration, h.easing, h.defer].join(),
            k = b.sharedClips[g],
            l = b.sharedClips[g + "m"];
          if (a && c)
            (h = this.getClipBox()),
              k
                ? k.attr("height", h.height)
                : ((h.width = 0),
                  e && (h.x = b.plotHeight),
                  (k = b.renderer.clipRect(h)),
                  (b.sharedClips[g] = k),
                  (l = b.renderer.clipRect({
                    x: e ? (b.plotSizeX || 0) + 99 : -99,
                    y: e ? -b.plotLeft : -b.plotTop,
                    width: 99,
                    height: e ? b.chartWidth : b.chartHeight,
                  })),
                  (b.sharedClips[g + "m"] = l)),
              c.clip(k),
              d && d.clip(l);
          else if (k && !k.hasClass("highcharts-animating")) {
            b = this.getClipBox();
            var m = h.step;
            d &&
              d.element.childNodes.length &&
              (h.step = function (a, b) {
                m && m.apply(b, arguments);
                l &&
                  l.element &&
                  l.attr(b.prop, "width" === b.prop ? a + 99 : a);
              });
            k.addClass("highcharts-animating").animate(b, h);
          }
        };
        a.prototype.afterAnimate = function () {
          var a = this;
          this.setClip();
          Y(this.chart.sharedClips, function (b, c, d) {
            b &&
              !a.chart.container.querySelector(
                '[clip-path="url(#'.concat(b.id, ')"]'),
              ) &&
              (b.destroy(), delete d[c]);
          });
          this.finishedAnimating = !0;
          w(this, "afterAnimate");
        };
        a.prototype.drawPoints = function (a) {
          void 0 === a && (a = this.points);
          var b = this.chart,
            c = this.options.marker,
            d = this[this.specialGroup] || this.markerGroup,
            e = this.xAxis,
            h = y(
              c.enabled,
              !e || e.isRadial ? !0 : null,
              this.closestPointRangePx >= c.enabledThreshold * c.radius,
            ),
            f,
            g;
          if (!1 !== c.enabled || this._hasPointMarkers)
            for (f = 0; f < a.length; f++) {
              var k = a[f];
              var l = (g = k.graphic) ? "animate" : "attr";
              var m = k.marker || {};
              var p = !!k.marker;
              if (
                ((h && "undefined" === typeof m.enabled) || m.enabled) &&
                !k.isNull &&
                !1 !== k.visible
              ) {
                var n = y(m.symbol, this.symbol, "rect");
                var q = this.markerAttribs(k, k.selected && "select");
                this.enabledDataSorting &&
                  (k.startXPos = e.reversed ? -(q.width || 0) : e.width);
                var u = !1 !== k.isInside;
                g
                  ? g[u ? "show" : "hide"](u).animate(q)
                  : u &&
                    (0 < (q.width || 0) || k.hasImage) &&
                    ((k.graphic = g =
                      b.renderer
                        .symbol(n, q.x, q.y, q.width, q.height, p ? m : c)
                        .add(d)),
                    this.enabledDataSorting &&
                      b.hasRendered &&
                      (g.attr({ x: k.startXPos }), (l = "animate")));
                g && "animate" === l && g[u ? "show" : "hide"](u).animate(q);
                if (g && !b.styledMode)
                  g[l](this.pointAttribs(k, k.selected && "select"));
                g && g.addClass(k.getClassName(), !0);
              } else g && (k.graphic = g.destroy());
            }
        };
        a.prototype.markerAttribs = function (a, b) {
          var c = this.options,
            d = c.marker,
            e = a.marker || {},
            h = e.symbol || d.symbol,
            f = y(e.radius, d && d.radius);
          b &&
            ((d = d.states[b]),
            (b = e.states && e.states[b]),
            (f = y(
              b && b.radius,
              d && d.radius,
              f && f + ((d && d.radiusPlus) || 0),
            )));
          a.hasImage = h && 0 === h.indexOf("url");
          a.hasImage && (f = 0);
          a = O(f)
            ? {
                x: c.crisp ? Math.floor(a.plotX - f) : a.plotX - f,
                y: a.plotY - f,
              }
            : {};
          f && (a.width = a.height = 2 * f);
          return a;
        };
        a.prototype.pointAttribs = function (a, b) {
          var c = this.options.marker,
            d = a && a.options,
            e = (d && d.marker) || {},
            h = d && d.color,
            f = a && a.color,
            g = a && a.zone && a.zone.color,
            k = this.color;
          a = y(e.lineWidth, c.lineWidth);
          d = 1;
          k = h || g || f || k;
          h = e.fillColor || c.fillColor || k;
          f = e.lineColor || c.lineColor || k;
          b = b || "normal";
          c = c.states[b] || {};
          b = (e.states && e.states[b]) || {};
          a = y(
            b.lineWidth,
            c.lineWidth,
            a + y(b.lineWidthPlus, c.lineWidthPlus, 0),
          );
          h = b.fillColor || c.fillColor || h;
          f = b.lineColor || c.lineColor || f;
          d = y(b.opacity, c.opacity, d);
          return { stroke: f, "stroke-width": a, fill: h, opacity: d };
        };
        a.prototype.destroy = function (a) {
          var b = this,
            c = b.chart,
            d = /AppleWebKit\/533/.test(C.navigator.userAgent),
            e = b.data || [],
            h,
            f,
            g,
            l;
          w(b, "destroy", { keepEventsForUpdate: a });
          this.removeEvents(a);
          (b.axisTypes || []).forEach(function (a) {
            (l = b[a]) &&
              l.series &&
              (k(l.series, b), (l.isDirty = l.forceRedraw = !0));
          });
          b.legendItem && b.chart.legend.destroyItem(b);
          for (f = e.length; f--; ) (g = e[f]) && g.destroy && g.destroy();
          b.clips &&
            b.clips.forEach(function (a) {
              return a.destroy();
            });
          n.clearTimeout(b.animationTimeout);
          Y(b, function (a, b) {
            a instanceof t &&
              !a.survive &&
              ((h = d && "group" === b ? "hide" : "destroy"), a[h]());
          });
          c.hoverSeries === b && (c.hoverSeries = void 0);
          k(c.series, b);
          c.orderSeries();
          Y(b, function (c, d) {
            (a && "hcEvents" === d) || delete b[d];
          });
        };
        a.prototype.applyZones = function () {
          var a = this,
            b = this.chart,
            c = b.renderer,
            d = this.zones,
            e = this.clips || [],
            h = this.graph,
            f = this.area,
            g = Math.max(b.plotWidth, b.plotHeight),
            k = this[(this.zoneAxis || "y") + "Axis"],
            l = b.inverted,
            m,
            p,
            n,
            q,
            u,
            w,
            z,
            t,
            r = !1;
          if (d.length && (h || f) && k && "undefined" !== typeof k.min) {
            var C = k.reversed;
            var v = k.horiz;
            h && !this.showLine && h.hide();
            f && f.hide();
            var H = k.getExtremes();
            d.forEach(function (d, F) {
              m = C ? (v ? b.plotWidth : 0) : v ? 0 : k.toPixels(H.min) || 0;
              m = A(y(p, m), 0, g);
              p = A(Math.round(k.toPixels(y(d.value, H.max), !0) || 0), 0, g);
              r && (m = p = k.toPixels(H.max));
              q = Math.abs(m - p);
              u = Math.min(m, p);
              w = Math.max(m, p);
              k.isXAxis
                ? ((n = { x: l ? w : u, y: 0, width: q, height: g }),
                  v || (n.x = b.plotHeight - n.x))
                : ((n = { x: 0, y: l ? w : u, width: g, height: q }),
                  v && (n.y = b.plotWidth - n.y));
              l &&
                c.isVML &&
                (n = k.isXAxis
                  ? { x: 0, y: C ? u : w, height: n.width, width: b.chartWidth }
                  : {
                      x: n.y - b.plotLeft - b.spacingBox.x,
                      y: 0,
                      width: n.height,
                      height: b.chartHeight,
                    });
              e[F] ? e[F].animate(n) : (e[F] = c.clipRect(n));
              z = a["zone-area-" + F];
              t = a["zone-graph-" + F];
              h && t && t.clip(e[F]);
              f && z && z.clip(e[F]);
              r = d.value > H.max;
              a.resetZones && 0 === p && (p = void 0);
            });
            this.clips = e;
          } else a.visible && (h && h.show(), f && f.show());
        };
        a.prototype.plotGroup = function (a, b, c, d, e) {
          var f = this[a],
            g = !f;
          c = { visibility: c, zIndex: d || 0.1 };
          "undefined" === typeof this.opacity ||
            this.chart.styledMode ||
            "inactive" === this.state ||
            (c.opacity = this.opacity);
          g && (this[a] = f = this.chart.renderer.g().add(e));
          f.addClass(
            "highcharts-" +
              b +
              " highcharts-series-" +
              this.index +
              " highcharts-" +
              this.type +
              "-series " +
              (h(this.colorIndex)
                ? "highcharts-color-" + this.colorIndex + " "
                : "") +
              (this.options.className || "") +
              (f.hasClass("highcharts-tracker") ? " highcharts-tracker" : ""),
            !0,
          );
          f.attr(c)[g ? "attr" : "animate"](this.getPlotBox(b));
          return f;
        };
        a.prototype.getPlotBox = function (a) {
          var b = this.xAxis,
            c = this.yAxis,
            d = this.chart;
          a =
            d.inverted &&
            !d.polar &&
            b &&
            !1 !== this.invertible &&
            ("markers" === a || "series" === a);
          d.inverted && ((b = c), (c = this.xAxis));
          return {
            translateX: b ? b.left : d.plotLeft,
            translateY: c ? c.top : d.plotTop,
            rotation: a ? 90 : 0,
            rotationOriginX: a ? (b.len - c.len) / 2 : 0,
            rotationOriginY: a ? (b.len + c.len) / 2 : 0,
            scaleX: a ? -1 : 1,
            scaleY: 1,
          };
        };
        a.prototype.removeEvents = function (a) {
          a || T(this);
          this.eventsToUnbind.length &&
            (this.eventsToUnbind.forEach(function (a) {
              a();
            }),
            (this.eventsToUnbind.length = 0));
        };
        a.prototype.render = function () {
          var a = this,
            b = a.chart,
            c = a.options,
            d = f(c.animation),
            e = a.visible ? "inherit" : "hidden",
            h = c.zIndex,
            g = a.hasRendered,
            k = b.seriesGroup;
          b = !a.finishedAnimating && b.renderer.isSVG ? d.duration : 0;
          w(this, "render");
          a.plotGroup("group", "series", e, h, k);
          a.markerGroup = a.plotGroup("markerGroup", "markers", e, h, k);
          !1 !== c.clip && a.setClip();
          a.animate && b && a.animate(!0);
          a.drawGraph && (a.drawGraph(), a.applyZones());
          a.visible && a.drawPoints();
          a.drawDataLabels && a.drawDataLabels();
          a.redrawPoints && a.redrawPoints();
          a.drawTracker &&
            !1 !== a.options.enableMouseTracking &&
            a.drawTracker();
          a.animate && b && a.animate();
          g ||
            (b && d.defer && (b += d.defer),
            (a.animationTimeout = ca(function () {
              a.afterAnimate();
            }, b || 0)));
          a.isDirty = !1;
          a.hasRendered = !0;
          w(a, "afterRender");
        };
        a.prototype.redraw = function () {
          var a = this.isDirty || this.isDirtyData;
          this.translate();
          this.render();
          a && delete this.kdTree;
        };
        a.prototype.searchPoint = function (a, b) {
          var c = this.xAxis,
            d = this.yAxis,
            e = this.chart.inverted;
          return this.searchKDTree(
            {
              clientX: e ? c.len - a.chartY + c.pos : a.chartX - c.pos,
              plotY: e ? d.len - a.chartX + d.pos : a.chartY - d.pos,
            },
            b,
            a,
          );
        };
        a.prototype.buildKDTree = function (a) {
          function b(a, d, e) {
            var h = a && a.length;
            if (h) {
              var f = c.kdAxisArray[d % e];
              a.sort(function (a, b) {
                return a[f] - b[f];
              });
              h = Math.floor(h / 2);
              return {
                point: a[h],
                left: b(a.slice(0, h), d + 1, e),
                right: b(a.slice(h + 1), d + 1, e),
              };
            }
          }
          this.buildingKdTree = !0;
          var c = this,
            d = -1 < c.options.findNearestPointBy.indexOf("y") ? 2 : 1;
          delete c.kdTree;
          ca(
            function () {
              c.kdTree = b(c.getValidPoints(null, !c.directTouch), d, d);
              c.buildingKdTree = !1;
            },
            c.options.kdNow || (a && "touchstart" === a.type) ? 0 : 1,
          );
        };
        a.prototype.searchKDTree = function (a, b, c) {
          function d(a, b, c, l) {
            var m = b.point,
              p = e.kdAxisArray[c % l],
              n = m,
              q = h(a[f]) && h(m[f]) ? Math.pow(a[f] - m[f], 2) : null;
            var u = h(a[g]) && h(m[g]) ? Math.pow(a[g] - m[g], 2) : null;
            u = (q || 0) + (u || 0);
            m.dist = h(u) ? Math.sqrt(u) : Number.MAX_VALUE;
            m.distX = h(q) ? Math.sqrt(q) : Number.MAX_VALUE;
            p = a[p] - m[p];
            u = 0 > p ? "left" : "right";
            q = 0 > p ? "right" : "left";
            b[u] && ((u = d(a, b[u], c + 1, l)), (n = u[k] < n[k] ? u : m));
            b[q] &&
              Math.sqrt(p * p) < n[k] &&
              ((a = d(a, b[q], c + 1, l)), (n = a[k] < n[k] ? a : n));
            return n;
          }
          var e = this,
            f = this.kdAxisArray[0],
            g = this.kdAxisArray[1],
            k = b ? "distX" : "dist";
          b = -1 < e.options.findNearestPointBy.indexOf("y") ? 2 : 1;
          this.kdTree || this.buildingKdTree || this.buildKDTree(c);
          if (this.kdTree) return d(a, this.kdTree, b, b);
        };
        a.prototype.pointPlacementToXValue = function () {
          var a = this.options,
            b = a.pointRange,
            c = this.xAxis;
          a = a.pointPlacement;
          "between" === a && (a = c.reversed ? -0.5 : 0.5);
          return O(a) ? a * (b || c.pointRange) : 0;
        };
        a.prototype.isPointInside = function (a) {
          var b = this.chart,
            c = this.xAxis,
            d = this.yAxis;
          return (
            "undefined" !== typeof a.plotY &&
            "undefined" !== typeof a.plotX &&
            0 <= a.plotY &&
            a.plotY <= (d ? d.len : b.plotHeight) &&
            0 <= a.plotX &&
            a.plotX <= (c ? c.len : b.plotWidth)
          );
        };
        a.prototype.drawTracker = function () {
          var a = this,
            b = a.options,
            c = b.trackByArea,
            d = [].concat(c ? a.areaPath : a.graphPath),
            h = a.chart,
            f = h.pointer,
            g = h.renderer,
            k = h.options.tooltip.snap,
            l = a.tracker,
            m = function (b) {
              if (h.hoverSeries !== a) a.onMouseOver();
            },
            p = "rgba(192,192,192," + (u ? 0.0001 : 0.002) + ")";
          l
            ? l.attr({ d: d })
            : a.graph &&
              ((a.tracker = g
                .path(d)
                .attr({
                  visibility: a.visible ? "inherit" : "hidden",
                  zIndex: 2,
                })
                .addClass(
                  c ? "highcharts-tracker-area" : "highcharts-tracker-line",
                )
                .add(a.group)),
              h.styledMode ||
                a.tracker.attr({
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  stroke: p,
                  fill: c ? p : "none",
                  "stroke-width": a.graph.strokeWidth() + (c ? 0 : 2 * k),
                }),
              [a.tracker, a.markerGroup, a.dataLabelsGroup].forEach(
                function (a) {
                  if (
                    a &&
                    (a
                      .addClass("highcharts-tracker")
                      .on("mouseover", m)
                      .on("mouseout", function (a) {
                        f.onTrackerMouseOut(a);
                      }),
                    b.cursor && !h.styledMode && a.css({ cursor: b.cursor }),
                    e)
                  )
                    a.on("touchstart", m);
                },
              ));
          w(this, "afterDrawTracker");
        };
        a.prototype.addPoint = function (a, b, c, d, e) {
          var h = this.options,
            f = this.data,
            g = this.chart,
            k = this.xAxis;
          k = k && k.hasNames && k.names;
          var l = h.data,
            m = this.xData,
            p;
          b = y(b, !0);
          var n = { series: this };
          this.pointClass.prototype.applyOptions.apply(n, [a]);
          var u = n.x;
          var q = m.length;
          if (this.requireSorting && u < m[q - 1])
            for (p = !0; q && m[q - 1] > u; ) q--;
          this.updateParallelArrays(n, "splice", q, 0, 0);
          this.updateParallelArrays(n, q);
          k && n.name && (k[u] = n.name);
          l.splice(q, 0, a);
          if (p || this.processedData)
            this.data.splice(q, 0, null), this.processData();
          "point" === h.legendType && this.generatePoints();
          c &&
            (f[0] && f[0].remove
              ? f[0].remove(!1)
              : (f.shift(), this.updateParallelArrays(n, "shift"), l.shift()));
          !1 !== e && w(this, "addPoint", { point: n });
          this.isDirtyData = this.isDirty = !0;
          b && g.redraw(d);
        };
        a.prototype.removePoint = function (a, b, d) {
          var e = this,
            h = e.data,
            f = h[a],
            g = e.points,
            k = e.chart,
            l = function () {
              g && g.length === h.length && g.splice(a, 1);
              h.splice(a, 1);
              e.options.data.splice(a, 1);
              e.updateParallelArrays(f || { series: e }, "splice", a, 1);
              f && f.destroy();
              e.isDirty = !0;
              e.isDirtyData = !0;
              b && k.redraw();
            };
          c(d, k);
          b = y(b, !0);
          f ? f.firePointEvent("remove", null, l) : l();
        };
        a.prototype.remove = function (a, b, c, d) {
          function e() {
            h.destroy(d);
            f.isDirtyLegend = f.isDirtyBox = !0;
            f.linkSeries();
            y(a, !0) && f.redraw(b);
          }
          var h = this,
            f = h.chart;
          !1 !== c ? w(h, "remove", null, e) : e();
        };
        a.prototype.update = function (a, c) {
          a = d(a, this.userOptions);
          w(this, "update", { options: a });
          var e = this,
            h = e.chart,
            f = e.userOptions,
            g = e.initialType || e.type,
            k = h.options.plotOptions,
            l = v[g].prototype,
            m = e.finishedAnimating && { animation: !1 },
            n = {},
            q = ["eventOptions", "navigatorSeries", "baseSeries"],
            u = a.type || f.type || h.options.chart.type,
            z = !(
              this.hasDerivedData ||
              (u && u !== this.type) ||
              "undefined" !== typeof a.pointStart ||
              "undefined" !== typeof a.pointInterval ||
              "undefined" !== typeof a.relativeXValue ||
              a.joinBy ||
              a.mapData ||
              e.hasOptionChanged("dataGrouping") ||
              e.hasOptionChanged("pointStart") ||
              e.hasOptionChanged("pointInterval") ||
              e.hasOptionChanged("pointIntervalUnit") ||
              e.hasOptionChanged("keys")
            );
          u = u || g;
          z &&
            (q.push(
              "data",
              "isDirtyData",
              "points",
              "processedData",
              "processedXData",
              "processedYData",
              "xIncrement",
              "cropped",
              "_hasPointMarkers",
              "_hasPointLabels",
              "clips",
              "nodes",
              "layout",
              "level",
              "mapMap",
              "mapData",
              "minY",
              "maxY",
              "minX",
              "maxX",
            ),
            !1 !== a.visible && q.push("area", "graph"),
            e.parallelArrays.forEach(function (a) {
              q.push(a + "Data");
            }),
            a.data &&
              (a.dataSorting && p(e.options.dataSorting, a.dataSorting),
              this.setData(a.data, !1)));
          a = S(
            f,
            m,
            {
              index: "undefined" === typeof f.index ? e.index : f.index,
              pointStart: y(
                k && k.series && k.series.pointStart,
                f.pointStart,
                e.xData[0],
              ),
            },
            !z && { data: e.options.data },
            a,
          );
          z && a.data && (a.data = e.options.data);
          q = [
            "group",
            "markerGroup",
            "dataLabelsGroup",
            "transformGroup",
            "shadowGroup",
          ].concat(q);
          q.forEach(function (a) {
            q[a] = e[a];
            delete e[a];
          });
          k = !1;
          if (v[u]) {
            if (((k = u !== e.type), e.remove(!1, !1, !1, !0), k))
              if (Object.setPrototypeOf)
                Object.setPrototypeOf(e, v[u].prototype);
              else {
                m = Object.hasOwnProperty.call(e, "hcEvents") && e.hcEvents;
                for (t in l) e[t] = void 0;
                p(e, v[u].prototype);
                m ? (e.hcEvents = m) : delete e.hcEvents;
              }
          } else b(17, !0, h, { missingModuleFor: u });
          q.forEach(function (a) {
            e[a] = q[a];
          });
          e.init(h, a);
          if (z && this.points) {
            a = e.options;
            if (!1 === a.visible) (n.graphic = 1), (n.dataLabel = 1);
            else if (!e._hasPointLabels) {
              l = a.marker;
              var t = a.dataLabels;
              !l ||
                (!1 !== l.enabled &&
                  (f.marker && f.marker.symbol) === l.symbol) ||
                (n.graphic = 1);
              t && !1 === t.enabled && (n.dataLabel = 1);
            }
            f = 0;
            for (l = this.points; f < l.length; f++)
              (t = l[f]) &&
                t.series &&
                (t.resolveColor(),
                Object.keys(n).length && t.destroyElements(n),
                !1 === a.showInLegend &&
                  t.legendItem &&
                  h.legend.destroyItem(t));
          }
          e.initialType = g;
          h.linkSeries();
          k && e.linkedSeries.length && (e.isDirtyData = !0);
          w(this, "afterUpdate");
          y(c, !0) && h.redraw(z ? void 0 : !1);
        };
        a.prototype.setName = function (a) {
          this.name = this.options.name = this.userOptions.name = a;
          this.chart.isDirtyLegend = !0;
        };
        a.prototype.hasOptionChanged = function (a) {
          var b = this.options[a],
            c = this.chart.options.plotOptions,
            d = this.userOptions[a];
          return d
            ? b !== d
            : b !==
                y(
                  c && c[this.type] && c[this.type][a],
                  c && c.series && c.series[a],
                  b,
                );
        };
        a.prototype.onMouseOver = function () {
          var a = this.chart,
            b = a.hoverSeries;
          a.pointer.setHoverChartIndex();
          if (b && b !== this) b.onMouseOut();
          this.options.events.mouseOver && w(this, "mouseOver");
          this.setState("hover");
          a.hoverSeries = this;
        };
        a.prototype.onMouseOut = function () {
          var a = this.options,
            b = this.chart,
            c = b.tooltip,
            d = b.hoverPoint;
          b.hoverSeries = null;
          if (d) d.onMouseOut();
          this && a.events.mouseOut && w(this, "mouseOut");
          !c ||
            this.stickyTracking ||
            (c.shared && !this.noSharedTooltip) ||
            c.hide();
          b.series.forEach(function (a) {
            a.setState("", !0);
          });
        };
        a.prototype.setState = function (a, b) {
          var c = this,
            d = c.options,
            e = c.graph,
            h = d.inactiveOtherPoints,
            f = d.states,
            g = y(
              f[a || "normal"] && f[a || "normal"].animation,
              c.chart.options.chart.animation,
            ),
            k = d.lineWidth,
            l = 0,
            m = d.opacity;
          a = a || "";
          if (
            c.state !== a &&
            ([c.group, c.markerGroup, c.dataLabelsGroup].forEach(function (b) {
              b &&
                (c.state && b.removeClass("highcharts-series-" + c.state),
                a && b.addClass("highcharts-series-" + a));
            }),
            (c.state = a),
            !c.chart.styledMode)
          ) {
            if (f[a] && !1 === f[a].enabled) return;
            a &&
              ((k = f[a].lineWidth || k + (f[a].lineWidthPlus || 0)),
              (m = y(f[a].opacity, m)));
            if (e && !e.dashstyle && O(k))
              for (
                d = { "stroke-width": k }, e.animate(d, g);
                c["zone-graph-" + l];

              )
                c["zone-graph-" + l].animate(d, g), (l += 1);
            h ||
              [
                c.group,
                c.markerGroup,
                c.dataLabelsGroup,
                c.labelBySeries,
              ].forEach(function (a) {
                a && a.animate({ opacity: m }, g);
              });
          }
          b && h && c.points && c.setAllPointsToState(a || void 0);
        };
        a.prototype.setAllPointsToState = function (a) {
          this.points.forEach(function (b) {
            b.setState && b.setState(a);
          });
        };
        a.prototype.setVisible = function (a, b) {
          var c = this,
            d = c.chart,
            e = d.options.chart.ignoreHiddenSeries,
            h = c.visible,
            f = (c.visible =
              a =
              c.options.visible =
              c.userOptions.visible =
                "undefined" === typeof a ? !h : a)
              ? "show"
              : "hide";
          ["group", "dataLabelsGroup", "markerGroup", "tracker", "tt"].forEach(
            function (a) {
              if (c[a]) c[a][f]();
            },
          );
          if (
            d.hoverSeries === c ||
            (d.hoverPoint && d.hoverPoint.series) === c
          )
            c.onMouseOut();
          c.legendItem && d.legend.colorizeItem(c, a);
          c.isDirty = !0;
          c.options.stacking &&
            d.series.forEach(function (a) {
              a.options.stacking && a.visible && (a.isDirty = !0);
            });
          c.linkedSeries.forEach(function (b) {
            b.setVisible(a, !1);
          });
          e && (d.isDirtyBox = !0);
          w(c, f);
          !1 !== b && d.redraw();
        };
        a.prototype.show = function () {
          this.setVisible(!0);
        };
        a.prototype.hide = function () {
          this.setVisible(!1);
        };
        a.prototype.select = function (a) {
          this.selected =
            a =
            this.options.selected =
              "undefined" === typeof a ? !this.selected : a;
          this.checkbox && (this.checkbox.checked = a);
          w(this, a ? "select" : "unselect");
        };
        a.prototype.shouldShowTooltip = function (a, b, c) {
          void 0 === c && (c = {});
          c.series = this;
          c.visiblePlotOnly = !0;
          return this.chart.isInsidePlot(a, b, c);
        };
        a.defaultOptions = G;
        a.types = r.seriesTypes;
        a.registerType = r.registerSeriesType;
        return a;
      })();
      p(a.prototype, {
        axisTypes: ["xAxis", "yAxis"],
        coll: "series",
        colorCounter: 0,
        cropShoulder: 1,
        directTouch: !1,
        drawLegendSymbol: D.drawLineMarker,
        isCartesian: !0,
        kdAxisArray: ["clientX", "plotY"],
        parallelArrays: ["x", "y"],
        pointClass: B,
        requireSorting: !0,
        sorted: !0,
      });
      r.series = a;
      ("");
      ("");
      return a;
    },
  );
  K(
    g,
    "Extensions/ScrollablePlotArea.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Axis/Axis.js"],
      g["Core/Chart/Chart.js"],
      g["Core/Series/Series.js"],
      g["Core/Renderer/RendererRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B) {
      var v = a.stop,
        r = B.addEvent,
        t = B.createElement,
        n = B.defined,
        f = B.merge,
        c = B.pick;
      r(x, "afterSetChartSize", function (a) {
        var c = this.options.chart.scrollablePlotArea,
          e = c && c.minWidth;
        c = c && c.minHeight;
        if (!this.renderer.forExport) {
          if (e) {
            if (
              (this.scrollablePixelsX = e = Math.max(0, e - this.chartWidth))
            ) {
              this.scrollablePlotBox = this.renderer.scrollablePlotBox = f(
                this.plotBox,
              );
              this.plotBox.width = this.plotWidth += e;
              this.inverted
                ? (this.clipBox.height += e)
                : (this.clipBox.width += e);
              var l = { 1: { name: "right", value: e } };
            }
          } else
            c &&
              ((this.scrollablePixelsY = e = Math.max(0, c - this.chartHeight)),
              n(e) &&
                ((this.scrollablePlotBox = this.renderer.scrollablePlotBox =
                  f(this.plotBox)),
                (this.plotBox.height = this.plotHeight += e),
                this.inverted
                  ? (this.clipBox.width += e)
                  : (this.clipBox.height += e),
                (l = { 2: { name: "bottom", value: e } })));
          l &&
            !a.skipAxes &&
            this.axes.forEach(function (a) {
              l[a.side]
                ? (a.getPlotLinePath = function () {
                    var c = l[a.side].name,
                      e = this[c];
                    this[c] = e - l[a.side].value;
                    var f = g.prototype.getPlotLinePath.apply(this, arguments);
                    this[c] = e;
                    return f;
                  })
                : (a.setAxisSize(), a.setAxisTranslation());
            });
        }
      });
      r(x, "render", function () {
        this.scrollablePixelsX || this.scrollablePixelsY
          ? (this.setUpScrolling && this.setUpScrolling(), this.applyFixed())
          : this.fixedDiv && this.applyFixed();
      });
      x.prototype.setUpScrolling = function () {
        var a = this,
          c = {
            WebkitOverflowScrolling: "touch",
            overflowX: "hidden",
            overflowY: "hidden",
          };
        this.scrollablePixelsX && (c.overflowX = "auto");
        this.scrollablePixelsY && (c.overflowY = "auto");
        this.scrollingParent = t(
          "div",
          { className: "highcharts-scrolling-parent" },
          { position: "relative" },
          this.renderTo,
        );
        this.scrollingContainer = t(
          "div",
          { className: "highcharts-scrolling" },
          c,
          this.scrollingParent,
        );
        var e;
        r(this.scrollingContainer, "scroll", function () {
          a.pointer &&
            (delete a.pointer.chartPosition,
            a.hoverPoint && (e = a.hoverPoint),
            a.pointer.runPointActions(void 0, e, !0));
        });
        this.innerContainer = t(
          "div",
          { className: "highcharts-inner-container" },
          null,
          this.scrollingContainer,
        );
        this.innerContainer.appendChild(this.container);
        this.setUpScrolling = null;
      };
      x.prototype.moveFixedElements = function () {
        var a = this.container,
          c = this.fixedRenderer,
          e =
            ".highcharts-contextbutton .highcharts-credits .highcharts-legend .highcharts-legend-checkbox .highcharts-navigator-series .highcharts-navigator-xaxis .highcharts-navigator-yaxis .highcharts-navigator .highcharts-reset-zoom .highcharts-drillup-button .highcharts-scrollbar .highcharts-subtitle .highcharts-title".split(
              " ",
            ),
          f;
        this.scrollablePixelsX && !this.inverted
          ? (f = ".highcharts-yaxis")
          : this.scrollablePixelsX && this.inverted
            ? (f = ".highcharts-xaxis")
            : this.scrollablePixelsY && !this.inverted
              ? (f = ".highcharts-xaxis")
              : this.scrollablePixelsY &&
                this.inverted &&
                (f = ".highcharts-yaxis");
        f &&
          e.push(
            "" + f + ":not(.highcharts-radial-axis)",
            "" + f + "-labels:not(.highcharts-radial-axis-labels)",
          );
        e.forEach(function (e) {
          [].forEach.call(a.querySelectorAll(e), function (a) {
            (a.namespaceURI === c.SVG_NS
              ? c.box
              : c.box.parentNode
            ).appendChild(a);
            a.style.pointerEvents = "auto";
          });
        });
      };
      x.prototype.applyFixed = function () {
        var a = !this.fixedDiv,
          f = this.options.chart,
          e = f.scrollablePlotArea,
          g = D.getRendererType();
        a
          ? ((this.fixedDiv = t(
              "div",
              { className: "highcharts-fixed" },
              {
                position: "absolute",
                overflow: "hidden",
                pointerEvents: "none",
                zIndex: ((f.style && f.style.zIndex) || 0) + 2,
                top: 0,
              },
              null,
              !0,
            )),
            this.scrollingContainer &&
              this.scrollingContainer.parentNode.insertBefore(
                this.fixedDiv,
                this.scrollingContainer,
              ),
            (this.renderTo.style.overflow = "visible"),
            (this.fixedRenderer = f =
              new g(
                this.fixedDiv,
                this.chartWidth,
                this.chartHeight,
                this.options.chart.style,
              )),
            (this.scrollableMask = f
              .path()
              .attr({
                fill: this.options.chart.backgroundColor || "#fff",
                "fill-opacity": c(e.opacity, 0.85),
                zIndex: -1,
              })
              .addClass("highcharts-scrollable-mask")
              .add()),
            r(this, "afterShowResetZoom", this.moveFixedElements),
            r(this, "afterApplyDrilldown", this.moveFixedElements),
            r(this, "afterLayOutTitles", this.moveFixedElements))
          : this.fixedRenderer.setSize(this.chartWidth, this.chartHeight);
        if (this.scrollableDirty || a)
          (this.scrollableDirty = !1), this.moveFixedElements();
        f = this.chartWidth + (this.scrollablePixelsX || 0);
        g = this.chartHeight + (this.scrollablePixelsY || 0);
        v(this.container);
        this.container.style.width = f + "px";
        this.container.style.height = g + "px";
        this.renderer.boxWrapper.attr({
          width: f,
          height: g,
          viewBox: [0, 0, f, g].join(" "),
        });
        this.chartBackground.attr({ width: f, height: g });
        this.scrollingContainer.style.height = this.chartHeight + "px";
        a &&
          (e.scrollPositionX &&
            (this.scrollingContainer.scrollLeft =
              this.scrollablePixelsX * e.scrollPositionX),
          e.scrollPositionY &&
            (this.scrollingContainer.scrollTop =
              this.scrollablePixelsY * e.scrollPositionY));
        g = this.axisOffset;
        a = this.plotTop - g[0] - 1;
        e = this.plotLeft - g[3] - 1;
        f = this.plotTop + this.plotHeight + g[2] + 1;
        g = this.plotLeft + this.plotWidth + g[1] + 1;
        var n = this.plotLeft + this.plotWidth - (this.scrollablePixelsX || 0),
          x = this.plotTop + this.plotHeight - (this.scrollablePixelsY || 0);
        a = this.scrollablePixelsX
          ? [
              ["M", 0, a],
              ["L", this.plotLeft - 1, a],
              ["L", this.plotLeft - 1, f],
              ["L", 0, f],
              ["Z"],
              ["M", n, a],
              ["L", this.chartWidth, a],
              ["L", this.chartWidth, f],
              ["L", n, f],
              ["Z"],
            ]
          : this.scrollablePixelsY
            ? [
                ["M", e, 0],
                ["L", e, this.plotTop - 1],
                ["L", g, this.plotTop - 1],
                ["L", g, 0],
                ["Z"],
                ["M", e, x],
                ["L", e, this.chartHeight],
                ["L", g, this.chartHeight],
                ["L", g, x],
                ["Z"],
              ]
            : [["M", 0, 0]];
        "adjustHeight" !== this.redrawTrigger &&
          this.scrollableMask.attr({ d: a });
      };
      r(g, "afterInit", function () {
        this.chart.scrollableDirty = !0;
      });
      r(E, "show", function () {
        this.chart.scrollableDirty = !0;
      });
      ("");
    },
  );
  K(
    g,
    "Core/Axis/Stacking/StackItem.js",
    [
      g["Core/FormatUtilities.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v = a.format,
        D = g.series,
        B = x.defined,
        G = x.destroyObjectProperties,
        r = x.isNumber,
        t = x.pick;
      a = (function () {
        function a(a, c, g, m, e) {
          var f = a.chart.inverted;
          this.axis = a;
          this.isNegative = g;
          this.options = c = c || {};
          this.x = m;
          this.cumulative = this.total = null;
          this.points = {};
          this.hasValidPoints = !1;
          this.stack = e;
          this.rightCliff = this.leftCliff = 0;
          this.alignOptions = {
            align: c.align || (f ? (g ? "left" : "right") : "center"),
            verticalAlign:
              c.verticalAlign || (f ? "middle" : g ? "bottom" : "top"),
            y: c.y,
            x: c.x,
          };
          this.textAlign =
            c.textAlign || (f ? (g ? "right" : "left") : "center");
        }
        a.prototype.destroy = function () {
          G(this, this.axis);
        };
        a.prototype.render = function (a) {
          var c = this.axis.chart,
            f = this.options,
            g = f.format;
          g = g ? v(g, this, c) : f.formatter.call(this);
          this.label
            ? this.label.attr({ text: g, visibility: "hidden" })
            : ((this.label = c.renderer.label(
                g,
                null,
                null,
                f.shape,
                null,
                null,
                f.useHTML,
                !1,
                "stack-labels",
              )),
              (g = {
                r: f.borderRadius || 0,
                text: g,
                rotation: f.rotation,
                padding: t(f.padding, 5),
                visibility: "hidden",
              }),
              c.styledMode ||
                ((g.fill = f.backgroundColor),
                (g.stroke = f.borderColor),
                (g["stroke-width"] = f.borderWidth),
                this.label.css(f.style)),
              this.label.attr(g),
              this.label.added || this.label.add(a));
          this.label.labelrank = c.plotSizeY;
        };
        a.prototype.setOffset = function (a, c, g, m, e) {
          var f = this.axis,
            l = f.chart;
          m = f.translate(
            f.stacking.usePercentage ? 100 : m ? m : this.total,
            0,
            0,
            0,
            1,
          );
          g = f.translate(g ? g : 0);
          a = t(e, l.xAxis[0].translate(this.x)) + a;
          f = B(m) && this.getStackBox(l, this, a, m, c, Math.abs(m - g), f);
          c = this.label;
          g = this.isNegative;
          var n = this.textAlign;
          c &&
            f &&
            ((a = c.getBBox()),
            (e = c.padding),
            (m = "justify" === t(this.options.overflow, "justify")),
            (n =
              "left" === n
                ? l.inverted
                  ? -e
                  : e
                : "right" === n
                  ? a.width
                  : l.inverted && "center" === n
                    ? a.width / 2
                    : l.inverted
                      ? g
                        ? a.width + e
                        : -e
                      : a.width / 2),
            (g = l.inverted ? a.height / 2 : g ? -e : a.height),
            (this.alignOptions.x = t(this.options.x, 0)),
            (this.alignOptions.y = t(this.options.y, 0)),
            (f.x -= n),
            (f.y -= g),
            c.align(this.alignOptions, null, f),
            l.isInsidePlot(
              c.alignAttr.x + n - this.alignOptions.x,
              c.alignAttr.y + g - this.alignOptions.y,
            )
              ? c.show()
              : (c.hide(), (m = !1)),
            m &&
              D.prototype.justifyDataLabel.call(
                this.axis,
                c,
                this.alignOptions,
                c.alignAttr,
                a,
                f,
              ),
            c.attr({ x: c.alignAttr.x, y: c.alignAttr.y }),
            t(!m && this.options.crop, !0) &&
              ((l =
                r(c.x) &&
                r(c.y) &&
                l.isInsidePlot(c.x - e + c.width, c.y) &&
                l.isInsidePlot(c.x + e, c.y)) ||
                c.hide()));
        };
        a.prototype.getStackBox = function (a, c, g, m, e, n, t) {
          var f = c.axis.reversed,
            l = a.inverted,
            u = t.height + t.pos - (l ? a.plotLeft : a.plotTop);
          c = (c.isNegative && !f) || (!c.isNegative && f);
          return {
            x: l
              ? c
                ? m - t.right
                : m - n + t.pos - a.plotLeft
              : g + a.xAxis[0].transB - a.plotLeft,
            y: l ? t.height - g - e : c ? u - m - n : u - m,
            width: l ? n : e,
            height: l ? e : n,
          };
        };
        return a;
      })();
      ("");
      return a;
    },
  );
  K(
    g,
    "Core/Axis/Stacking/StackingAxis.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Axis/Axis.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Axis/Stacking/StackItem.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D) {
      function v() {
        var a = this,
          b = a.inverted;
        a.yAxis.forEach(function (a) {
          a.stacking &&
            a.stacking.stacks &&
            a.hasVisibleSeries &&
            (a.stacking.oldStacks = a.stacking.stacks);
        });
        a.series.forEach(function (c) {
          var d = (c.xAxis && c.xAxis.options) || {};
          !c.options.stacking ||
            (!0 !== c.visible && !1 !== a.options.chart.ignoreHiddenSeries) ||
            (c.stackKey = [
              c.type,
              h(c.options.stack, ""),
              b ? d.top : d.left,
              b ? d.height : d.width,
            ].join());
        });
      }
      function G() {
        var a = this.stacking;
        if (a) {
          var b = a.stacks;
          q(b, function (a, c) {
            I(a);
            b[c] = null;
          });
          a && a.stackTotalGroup && a.stackTotalGroup.destroy();
        }
      }
      function r() {
        this.stacking || (this.stacking = new k(this));
      }
      function t(a, b, c, d) {
        !J(a) || a.x !== b || (d && a.stackKey !== d)
          ? (a = { x: b, index: 0, key: d, stackKey: d })
          : a.index++;
        a.key = [c, b, a.index].join();
        return a;
      }
      function n() {
        var a = this,
          b = a.stackKey,
          c = a.yAxis.stacking.stacks,
          d = a.processedXData,
          e = a[a.options.stacking + "Stacker"],
          h;
        e &&
          [b, "-" + b].forEach(function (b) {
            for (var f = d.length, g, k; f--; )
              (g = d[f]),
                (h = a.getStackIndicator(h, g, a.index, b)),
                (k = (g = c[b] && c[b][g]) && g.points[h.key]) &&
                  e.call(a, k, g, f);
          });
      }
      function f(a, b, c) {
        b = b.total ? 100 / b.total : 0;
        a[0] = C(a[0] * b);
        a[1] = C(a[1] * b);
        this.stackedYData[c] = a[1];
      }
      function c() {
        var a = this.yAxis.stacking;
        this.options.centerInCategory &&
        (this.is("column") || this.is("columnrange")) &&
        !this.options.stacking &&
        1 < this.chart.series.length
          ? e.setStackedPoints.call(this, "group")
          : a &&
            q(a.stacks, function (b, c) {
              "group" === c.slice(-5) &&
                (q(b, function (a) {
                  return a.destroy();
                }),
                delete a.stacks[c]);
            });
      }
      function l(a) {
        var b = this.chart,
          c = a || this.options.stacking;
        if (
          c &&
          (!0 === this.visible || !1 === b.options.chart.ignoreHiddenSeries)
        ) {
          var d = this.processedXData,
            e = this.processedYData,
            f = [],
            g = e.length,
            k = this.options,
            l = k.threshold,
            m = h(k.startFromThreshold && l, 0);
          k = k.stack;
          a = a ? "" + this.type + ",".concat(c) : this.stackKey;
          var n = "-" + a,
            p = this.negStacks;
          b = "group" === c ? b.yAxis[0] : this.yAxis;
          var q = b.stacking.stacks,
            u = b.stacking.oldStacks,
            t,
            r;
          b.stacking.stacksTouched += 1;
          for (r = 0; r < g; r++) {
            var v = d[r];
            var x = e[r];
            var I = this.getStackIndicator(I, v, this.index);
            var D = I.key;
            var B = (t = p && x < (m ? 0 : l)) ? n : a;
            q[B] || (q[B] = {});
            q[B][v] ||
              (u[B] && u[B][v]
                ? ((q[B][v] = u[B][v]), (q[B][v].total = null))
                : (q[B][v] = new E(b, b.options.stackLabels, !!t, v, k)));
            B = q[B][v];
            null !== x
              ? ((B.points[D] = B.points[this.index] = [h(B.cumulative, m)]),
                J(B.cumulative) || (B.base = D),
                (B.touched = b.stacking.stacksTouched),
                0 < I.index &&
                  !1 === this.singleStacks &&
                  (B.points[D][0] = B.points[this.index + "," + v + ",0"][0]))
              : (B.points[D] = B.points[this.index] = null);
            "percent" === c
              ? ((t = t ? a : n),
                p && q[t] && q[t][v]
                  ? ((t = q[t][v]),
                    (B.total = t.total =
                      Math.max(t.total, B.total) + Math.abs(x) || 0))
                  : (B.total = C(B.total + (Math.abs(x) || 0))))
              : "group" === c
                ? (A(x) && (x = x[0]),
                  null !== x && (B.total = (B.total || 0) + 1))
                : (B.total = C(B.total + (x || 0)));
            B.cumulative =
              "group" === c
                ? (B.total || 1) - 1
                : h(B.cumulative, m) + (x || 0);
            null !== x &&
              (B.points[D].push(B.cumulative),
              (f[r] = B.cumulative),
              (B.hasValidPoints = !0));
          }
          "percent" === c && (b.stacking.usePercentage = !0);
          "group" !== c && (this.stackedYData = f);
          b.stacking.oldStacks = {};
        }
      }
      var m = a.getDeferredAnimation,
        e = x.series.prototype,
        u = D.addEvent,
        C = D.correctFloat,
        J = D.defined,
        I = D.destroyObjectProperties,
        L = D.fireEvent,
        A = D.isArray,
        d = D.isNumber,
        q = D.objectEach,
        h = D.pick,
        k = (function () {
          function a(a) {
            this.oldStacks = {};
            this.stacks = {};
            this.stacksTouched = 0;
            this.axis = a;
          }
          a.prototype.buildStacks = function () {
            var a = this.axis,
              b = a.series,
              c = a.options.reversedStacks,
              d = b.length,
              e;
            if (!a.isXAxis) {
              this.usePercentage = !1;
              for (e = d; e--; ) {
                var h = b[c ? e : d - e - 1];
                h.setStackedPoints();
                h.setGroupedPoints();
              }
              for (e = 0; e < d; e++) b[e].modifyStacks();
              L(a, "afterBuildStacks");
            }
          };
          a.prototype.cleanStacks = function () {
            if (!this.axis.isXAxis) {
              if (this.oldStacks) var a = (this.stacks = this.oldStacks);
              q(a, function (a) {
                q(a, function (a) {
                  a.cumulative = a.total;
                });
              });
            }
          };
          a.prototype.resetStacks = function () {
            var a = this,
              b = a.stacks;
            a.axis.isXAxis ||
              q(b, function (b) {
                q(b, function (c, e) {
                  d(c.touched) && c.touched < a.stacksTouched
                    ? (c.destroy(), delete b[e])
                    : ((c.total = null), (c.cumulative = null));
                });
              });
          };
          a.prototype.renderStackTotals = function () {
            var a = this.axis,
              b = a.chart,
              c = b.renderer,
              d = this.stacks;
            a = m(
              b,
              (a.options.stackLabels && a.options.stackLabels.animation) || !1,
            );
            var e = (this.stackTotalGroup =
              this.stackTotalGroup ||
              c.g("stack-labels").attr({ zIndex: 6, opacity: 0 }).add());
            e.translate(b.plotLeft, b.plotTop);
            q(d, function (a) {
              q(a, function (a) {
                a.render(e);
              });
            });
            e.animate({ opacity: 1 }, a);
          };
          return a;
        })(),
        b;
      (function (a) {
        var b = [];
        a.compose = function (a, d, e) {
          -1 === b.indexOf(a) &&
            (b.push(a), u(a, "init", r), u(a, "destroy", G));
          -1 === b.indexOf(d) && (b.push(d), (d.prototype.getStacks = v));
          -1 === b.indexOf(e) &&
            (b.push(e),
            (a = e.prototype),
            (a.getStackIndicator = t),
            (a.modifyStacks = n),
            (a.percentStacker = f),
            (a.setGroupedPoints = c),
            (a.setStackedPoints = l));
        };
      })(b || (b = {}));
      return b;
    },
  );
  K(
    g,
    "Series/Line/LineSeries.js",
    [
      g["Core/Series/Series.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (g, t) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, f) {
                    a.__proto__ = f;
                  }) ||
                function (a, f) {
                  for (var c in f) f.hasOwnProperty(c) && (a[c] = f[c]);
                };
              return a(g, t);
            };
            return function (g, t) {
              function n() {
                this.constructor = g;
              }
              a(g, t);
              g.prototype =
                null === t
                  ? Object.create(t)
                  : ((n.prototype = t.prototype), new n());
            };
          })(),
        D = x.defined,
        B = x.merge;
      x = (function (g) {
        function r() {
          var a = (null !== g && g.apply(this, arguments)) || this;
          a.data = void 0;
          a.options = void 0;
          a.points = void 0;
          return a;
        }
        v(r, g);
        r.prototype.drawGraph = function () {
          var a = this,
            g = this.options,
            f = (this.gappedPath || this.getGraphPath).call(this),
            c = this.chart.styledMode,
            l = [["graph", "highcharts-graph"]];
          c || l[0].push(g.lineColor || this.color || "#cccccc", g.dashStyle);
          l = a.getZonesGraphs(l);
          l.forEach(function (l, e) {
            var m = l[0],
              n = a[m],
              t = n ? "animate" : "attr";
            n
              ? ((n.endX = a.preventGraphAnimation ? null : f.xMap),
                n.animate({ d: f }))
              : f.length &&
                (a[m] = n =
                  a.chart.renderer
                    .path(f)
                    .addClass(l[1])
                    .attr({ zIndex: 1 })
                    .add(a.group));
            n &&
              !c &&
              ((m = {
                stroke: l[2],
                "stroke-width": g.lineWidth || 0,
                fill: (a.fillGraph && a.color) || "none",
              }),
              l[3]
                ? (m.dashstyle = l[3])
                : "square" !== g.linecap &&
                  (m["stroke-linecap"] = m["stroke-linejoin"] = "round"),
              n[t](m).shadow(2 > e && g.shadow));
            n && ((n.startX = f.xMap), (n.isArea = f.isArea));
          });
        };
        r.prototype.getGraphPath = function (a, g, f) {
          var c = this,
            l = c.options,
            m = [],
            e = [],
            n,
            t = l.step;
          a = a || c.points;
          var r = a.reversed;
          r && a.reverse();
          (t = { right: 1, center: 2 }[t] || (t && 3)) && r && (t = 4 - t);
          a = this.getValidPoints(a, !1, !(l.connectNulls && !g && !f));
          a.forEach(function (u, r) {
            var A = u.plotX,
              d = u.plotY,
              q = a[r - 1];
            (u.leftCliff || (q && q.rightCliff)) && !f && (n = !0);
            u.isNull && !D(g) && 0 < r
              ? (n = !l.connectNulls)
              : u.isNull && !g
                ? (n = !0)
                : (0 === r || n
                    ? (r = [["M", u.plotX, u.plotY]])
                    : c.getPointSpline
                      ? (r = [c.getPointSpline(a, u, r)])
                      : t
                        ? ((r =
                            1 === t
                              ? [["L", q.plotX, d]]
                              : 2 === t
                                ? [
                                    ["L", (q.plotX + A) / 2, q.plotY],
                                    ["L", (q.plotX + A) / 2, d],
                                  ]
                                : [["L", A, q.plotY]]),
                          r.push(["L", A, d]))
                        : (r = [["L", A, d]]),
                  e.push(u.x),
                  t && (e.push(u.x), 2 === t && e.push(u.x)),
                  m.push.apply(m, r),
                  (n = !1));
          });
          m.xMap = e;
          return (c.graphPath = m);
        };
        r.prototype.getZonesGraphs = function (a) {
          this.zones.forEach(function (g, f) {
            f = [
              "zone-graph-" + f,
              "highcharts-graph highcharts-zone-graph-" +
                f +
                " " +
                (g.className || ""),
            ];
            this.chart.styledMode ||
              f.push(
                g.color || this.color,
                g.dashStyle || this.options.dashStyle,
              );
            a.push(f);
          }, this);
          return a;
        };
        r.defaultOptions = B(a.defaultOptions, {});
        return r;
      })(a);
      g.registerSeriesType("line", x);
      ("");
      return x;
    },
  );
  K(
    g,
    "Series/Area/AreaSeries.js",
    [
      g["Core/Color/Color.js"],
      g["Core/Legend/LegendSymbol.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (c, f) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, c) {
                    a.__proto__ = c;
                  }) ||
                function (a, c) {
                  for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
              return a(c, f);
            };
            return function (c, f) {
              function g() {
                this.constructor = c;
              }
              a(c, f);
              c.prototype =
                null === f
                  ? Object.create(f)
                  : ((g.prototype = f.prototype), new g());
            };
          })(),
        B = a.parse,
        G = x.seriesTypes.line;
      a = E.extend;
      var r = E.merge,
        t = E.objectEach,
        n = E.pick;
      E = (function (a) {
        function c() {
          var c = (null !== a && a.apply(this, arguments)) || this;
          c.data = void 0;
          c.options = void 0;
          c.points = void 0;
          return c;
        }
        v(c, a);
        c.prototype.drawGraph = function () {
          this.areaPath = [];
          a.prototype.drawGraph.apply(this);
          var c = this,
            f = this.areaPath,
            e = this.options,
            g = [["area", "highcharts-area", this.color, e.fillColor]];
          this.zones.forEach(function (a, f) {
            g.push([
              "zone-area-" + f,
              "highcharts-area highcharts-zone-area-" + f + " " + a.className,
              a.color || c.color,
              a.fillColor || e.fillColor,
            ]);
          });
          g.forEach(function (a) {
            var g = a[0],
              l = {},
              m = c[g],
              u = m ? "animate" : "attr";
            m
              ? ((m.endX = c.preventGraphAnimation ? null : f.xMap),
                m.animate({ d: f }))
              : ((l.zIndex = 0),
                (m = c[g] =
                  c.chart.renderer.path(f).addClass(a[1]).add(c.group)),
                (m.isArea = !0));
            c.chart.styledMode ||
              (l.fill = n(
                a[3],
                B(a[2]).setOpacity(n(e.fillOpacity, 0.75)).get(),
              ));
            m[u](l);
            m.startX = f.xMap;
            m.shiftUnit = e.step ? 2 : 1;
          });
        };
        c.prototype.getGraphPath = function (a) {
          var c = G.prototype.getGraphPath,
            e = this.options,
            f = e.stacking,
            g = this.yAxis,
            l = [],
            t = [],
            r = this.index,
            A = g.stacking.stacks[this.stackKey],
            d = e.threshold,
            q = Math.round(g.getThreshold(e.threshold));
          e = n(e.connectNulls, "percent" === f);
          var h = function (b, c, e) {
            var h = a[b];
            b = f && A[h.x].points[r];
            var k = h[e + "Null"] || 0;
            e = h[e + "Cliff"] || 0;
            h = !0;
            if (e || k) {
              var m = (k ? b[0] : b[1]) + e;
              var n = b[0] + e;
              h = !!k;
            } else !f && a[c] && a[c].isNull && (m = n = d);
            "undefined" !== typeof m &&
              (t.push({
                plotX: z,
                plotY: null === m ? q : g.getThreshold(m),
                isNull: h,
                isCliff: !0,
              }),
              l.push({
                plotX: z,
                plotY: null === n ? q : g.getThreshold(n),
                doCurve: !1,
              }));
          };
          a = a || this.points;
          f && (a = this.getStackPoints(a));
          for (var k = 0, b = a.length; k < b; ++k) {
            f ||
              (a[k].leftCliff =
                a[k].rightCliff =
                a[k].leftNull =
                a[k].rightNull =
                  void 0);
            var p = a[k].isNull;
            var z = n(a[k].rectPlotX, a[k].plotX);
            var w = f ? n(a[k].yBottom, q) : q;
            if (!p || e)
              e || h(k, k - 1, "left"),
                (p && !f && e) ||
                  (t.push(a[k]), l.push({ x: k, plotX: z, plotY: w })),
                e || h(k, k + 1, "right");
          }
          h = c.call(this, t, !0, !0);
          l.reversed = !0;
          p = c.call(this, l, !0, !0);
          (w = p[0]) && "M" === w[0] && (p[0] = ["L", w[1], w[2]]);
          p = h.concat(p);
          p.length && p.push(["Z"]);
          c = c.call(this, t, !1, e);
          p.xMap = h.xMap;
          this.areaPath = p;
          return c;
        };
        c.prototype.getStackPoints = function (a) {
          var c = this,
            e = [],
            f = [],
            g = this.xAxis,
            l = this.yAxis,
            r = l.stacking.stacks[this.stackKey],
            v = {},
            A = l.series,
            d = A.length,
            q = l.options.reversedStacks ? 1 : -1,
            h = A.indexOf(c);
          a = a || this.points;
          if (this.options.stacking) {
            for (var k = 0; k < a.length; k++)
              (a[k].leftNull = a[k].rightNull = void 0), (v[a[k].x] = a[k]);
            t(r, function (a, b) {
              null !== a.total && f.push(b);
            });
            f.sort(function (a, b) {
              return a - b;
            });
            var b = A.map(function (a) {
              return a.visible;
            });
            f.forEach(function (a, k) {
              var m = 0,
                p,
                u;
              if (v[a] && !v[a].isNull)
                e.push(v[a]),
                  [-1, 1].forEach(function (e) {
                    var g = 1 === e ? "rightNull" : "leftNull",
                      l = r[f[k + e]],
                      m = 0;
                    if (l)
                      for (var n = h; 0 <= n && n < d; ) {
                        var t = A[n].index;
                        p = l.points[t];
                        p ||
                          (t === c.index
                            ? (v[a][g] = !0)
                            : b[n] &&
                              (u = r[a].points[t]) &&
                              (m -= u[1] - u[0]));
                        n += q;
                      }
                    v[a][1 === e ? "rightCliff" : "leftCliff"] = m;
                  });
              else {
                for (var t = h; 0 <= t && t < d; ) {
                  if ((p = r[a].points[A[t].index])) {
                    m = p[1];
                    break;
                  }
                  t += q;
                }
                m = n(m, 0);
                m = l.translate(m, 0, 1, 0, 1);
                e.push({
                  isNull: !0,
                  plotX: g.translate(a, 0, 0, 0, 1),
                  x: a,
                  plotY: m,
                  yBottom: m,
                });
              }
            });
          }
          return e;
        };
        c.defaultOptions = r(G.defaultOptions, { threshold: 0 });
        return c;
      })(G);
      a(E.prototype, { singleStacks: !1, drawLegendSymbol: g.drawRectangle });
      x.registerSeriesType("area", E);
      ("");
      return E;
    },
  );
  K(
    g,
    "Series/Spline/SplineSeries.js",
    [g["Core/Series/SeriesRegistry.js"], g["Core/Utilities.js"]],
    function (a, g) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (g, t) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, f) {
                    a.__proto__ = f;
                  }) ||
                function (a, f) {
                  for (var c in f) f.hasOwnProperty(c) && (a[c] = f[c]);
                };
              return a(g, t);
            };
            return function (g, t) {
              function n() {
                this.constructor = g;
              }
              a(g, t);
              g.prototype =
                null === t
                  ? Object.create(t)
                  : ((n.prototype = t.prototype), new n());
            };
          })(),
        E = a.seriesTypes.line,
        D = g.merge,
        B = g.pick;
      g = (function (a) {
        function g() {
          var g = (null !== a && a.apply(this, arguments)) || this;
          g.data = void 0;
          g.options = void 0;
          g.points = void 0;
          return g;
        }
        v(g, a);
        g.prototype.getPointSpline = function (a, g, f) {
          var c = g.plotX || 0,
            l = g.plotY || 0,
            m = a[f - 1];
          f = a[f + 1];
          if (
            m &&
            !m.isNull &&
            !1 !== m.doCurve &&
            !g.isCliff &&
            f &&
            !f.isNull &&
            !1 !== f.doCurve &&
            !g.isCliff
          ) {
            a = m.plotY || 0;
            var e = f.plotX || 0;
            f = f.plotY || 0;
            var n = 0;
            var t = (1.5 * c + (m.plotX || 0)) / 2.5;
            var r = (1.5 * l + a) / 2.5;
            e = (1.5 * c + e) / 2.5;
            var v = (1.5 * l + f) / 2.5;
            e !== t && (n = ((v - r) * (e - c)) / (e - t) + l - v);
            r += n;
            v += n;
            r > a && r > l
              ? ((r = Math.max(a, l)), (v = 2 * l - r))
              : r < a && r < l && ((r = Math.min(a, l)), (v = 2 * l - r));
            v > f && v > l
              ? ((v = Math.max(f, l)), (r = 2 * l - v))
              : v < f && v < l && ((v = Math.min(f, l)), (r = 2 * l - v));
            g.rightContX = e;
            g.rightContY = v;
          }
          g = [
            "C",
            B(m.rightContX, m.plotX, 0),
            B(m.rightContY, m.plotY, 0),
            B(t, c, 0),
            B(r, l, 0),
            c,
            l,
          ];
          m.rightContX = m.rightContY = void 0;
          return g;
        };
        g.defaultOptions = D(E.defaultOptions);
        return g;
      })(E);
      a.registerSeriesType("spline", g);
      ("");
      return g;
    },
  );
  K(
    g,
    "Series/AreaSpline/AreaSplineSeries.js",
    [
      g["Series/Spline/SplineSeries.js"],
      g["Core/Legend/LegendSymbol.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (f, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, c) {
                    a.__proto__ = c;
                  }) ||
                function (a, c) {
                  for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
              return a(f, c);
            };
            return function (f, c) {
              function g() {
                this.constructor = f;
              }
              a(f, c);
              f.prototype =
                null === c
                  ? Object.create(c)
                  : ((g.prototype = c.prototype), new g());
            };
          })(),
        B = x.seriesTypes,
        G = B.area;
      B = B.area.prototype;
      var r = E.extend,
        t = E.merge;
      E = (function (g) {
        function f() {
          var a = (null !== g && g.apply(this, arguments)) || this;
          a.data = void 0;
          a.points = void 0;
          a.options = void 0;
          return a;
        }
        v(f, g);
        f.defaultOptions = t(a.defaultOptions, G.defaultOptions);
        return f;
      })(a);
      r(E.prototype, {
        getGraphPath: B.getGraphPath,
        getStackPoints: B.getStackPoints,
        drawGraph: B.drawGraph,
        drawLegendSymbol: g.drawRectangle,
      });
      x.registerSeriesType("areaspline", E);
      ("");
      return E;
    },
  );
  K(g, "Series/Column/ColumnSeriesDefaults.js", [], function () {
    "";
    return {
      borderRadius: 0,
      centerInCategory: !1,
      groupPadding: 0.2,
      marker: null,
      pointPadding: 0.1,
      minPointLength: 0,
      cropThreshold: 50,
      pointRange: null,
      states: {
        hover: { halo: !1, brightness: 0.1 },
        select: { color: "#cccccc", borderColor: "#000000" },
      },
      dataLabels: { align: void 0, verticalAlign: void 0, y: void 0 },
      startFromThreshold: !0,
      stickyTracking: !1,
      tooltip: { distance: 6 },
      threshold: 0,
      borderColor: "#ffffff",
    };
  });
  K(
    g,
    "Series/Column/ColumnSeries.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Color/Color.js"],
      g["Series/Column/ColumnSeriesDefaults.js"],
      g["Core/Globals.js"],
      g["Core/Legend/LegendSymbol.js"],
      g["Core/Series/Series.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B, G, r) {
      var t =
          (this && this.__extends) ||
          (function () {
            var a = function (c, d) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, b) {
                    a.__proto__ = b;
                  }) ||
                function (a, b) {
                  for (var c in b) b.hasOwnProperty(c) && (a[c] = b[c]);
                };
              return a(c, d);
            };
            return function (c, d) {
              function e() {
                this.constructor = c;
              }
              a(c, d);
              c.prototype =
                null === d
                  ? Object.create(d)
                  : ((e.prototype = d.prototype), new e());
            };
          })(),
        n = a.animObject,
        f = g.parse,
        c = E.hasTouch;
      a = E.noop;
      var l = r.clamp,
        m = r.defined,
        e = r.extend,
        u = r.fireEvent,
        v = r.isArray,
        J = r.isNumber,
        I = r.merge,
        L = r.pick,
        A = r.objectEach;
      r = (function (a) {
        function d() {
          var c = (null !== a && a.apply(this, arguments)) || this;
          c.borderWidth = void 0;
          c.data = void 0;
          c.group = void 0;
          c.options = void 0;
          c.points = void 0;
          return c;
        }
        t(d, a);
        d.prototype.animate = function (a) {
          var c = this,
            b = this.yAxis,
            d = c.options,
            h = this.chart.inverted,
            f = {},
            g = h ? "translateX" : "translateY";
          if (a)
            (f.scaleY = 0.001),
              (a = l(b.toPixels(d.threshold), b.pos, b.pos + b.len)),
              h ? (f.translateX = a - b.len) : (f.translateY = a),
              c.clipBox && c.setClip(),
              c.group.attr(f);
          else {
            var m = Number(c.group.attr(g));
            c.group.animate(
              { scaleY: 1 },
              e(n(c.options.animation), {
                step: function (a, d) {
                  c.group &&
                    ((f[g] = m + d.pos * (b.pos - m)), c.group.attr(f));
                },
              }),
            );
          }
        };
        d.prototype.init = function (c, d) {
          a.prototype.init.apply(this, arguments);
          var b = this;
          c = b.chart;
          c.hasRendered &&
            c.series.forEach(function (a) {
              a.type === b.type && (a.isDirty = !0);
            });
        };
        d.prototype.getColumnMetrics = function () {
          var a = this,
            c = a.options,
            b = a.xAxis,
            d = a.yAxis,
            e = b.options.reversedStacks;
          e = (b.reversed && !e) || (!b.reversed && e);
          var f = {},
            g,
            l = 0;
          !1 === c.grouping
            ? (l = 1)
            : a.chart.series.forEach(function (b) {
                var c = b.yAxis,
                  e = b.options;
                if (
                  b.type === a.type &&
                  (b.visible || !a.chart.options.chart.ignoreHiddenSeries) &&
                  d.len === c.len &&
                  d.pos === c.pos
                ) {
                  if (e.stacking && "group" !== e.stacking) {
                    g = b.stackKey;
                    "undefined" === typeof f[g] && (f[g] = l++);
                    var h = f[g];
                  } else !1 !== e.grouping && (h = l++);
                  b.columnIndex = h;
                }
              });
          var m = Math.min(
              Math.abs(b.transA) *
                ((b.ordinal && b.ordinal.slope) ||
                  c.pointRange ||
                  b.closestPointRange ||
                  b.tickInterval ||
                  1),
              b.len,
            ),
            n = m * c.groupPadding,
            q = (m - 2 * n) / (l || 1);
          c = Math.min(
            c.maxPointWidth || b.len,
            L(c.pointWidth, q * (1 - 2 * c.pointPadding)),
          );
          a.columnMetrics = {
            width: c,
            offset:
              (q - c) / 2 +
              (n + ((a.columnIndex || 0) + (e ? 1 : 0)) * q - m / 2) *
                (e ? -1 : 1),
            paddedWidth: q,
            columnCount: l,
          };
          return a.columnMetrics;
        };
        d.prototype.crispCol = function (a, c, b, d) {
          var e = this.chart,
            h = this.borderWidth,
            f = -(h % 2 ? 0.5 : 0);
          h = h % 2 ? 0.5 : 1;
          e.inverted && e.renderer.isVML && (h += 1);
          this.options.crisp &&
            ((b = Math.round(a + b) + f), (a = Math.round(a) + f), (b -= a));
          d = Math.round(c + d) + h;
          f = 0.5 >= Math.abs(c) && 0.5 < d;
          c = Math.round(c) + h;
          d -= c;
          f && d && (--c, (d += 1));
          return { x: a, y: c, width: b, height: d };
        };
        d.prototype.adjustForMissingColumns = function (a, c, b, d) {
          var e = this,
            h = this.options.stacking;
          if (!b.isNull && 1 < d.columnCount) {
            var f = this.yAxis.options.reversedStacks,
              g = 0,
              k = f ? 0 : -d.columnCount;
            A(this.yAxis.stacking && this.yAxis.stacking.stacks, function (a) {
              if ("number" === typeof b.x) {
                var c = a[b.x.toString()];
                c &&
                  ((a = c.points[e.index]),
                  h
                    ? (a && (g = k), c.hasValidPoints && (f ? k++ : k--))
                    : v(a) &&
                      ((a = Object.keys(c.points)
                        .filter(function (a) {
                          return (
                            !a.match(",") &&
                            c.points[a] &&
                            1 < c.points[a].length
                          );
                        })
                        .map(parseFloat)
                        .sort(function (a, b) {
                          return b - a;
                        })),
                      (g = a.indexOf(e.index)),
                      (k = a.length)));
              }
            });
            a =
              (b.plotX || 0) +
              ((k - 1) * d.paddedWidth + c) / 2 -
              c -
              g * d.paddedWidth;
          }
          return a;
        };
        d.prototype.translate = function () {
          var a = this,
            c = a.chart,
            b = a.options,
            d = (a.dense = 2 > a.closestPointRange * a.xAxis.transA);
          d = a.borderWidth = L(b.borderWidth, d ? 0 : 1);
          var e = a.xAxis,
            f = a.yAxis,
            g = b.threshold,
            n = (a.translatedThreshold = f.getThreshold(g)),
            q = L(b.minPointLength, 5),
            u = a.getColumnMetrics(),
            t = u.width,
            r = (a.pointXOffset = u.offset),
            y = a.dataMin,
            A = a.dataMax,
            v = (a.barW = Math.max(t, 1 + 2 * d));
          c.inverted && (n -= 0.5);
          b.pointPadding && (v = Math.ceil(v));
          B.prototype.translate.apply(a);
          a.points.forEach(function (d) {
            var h = L(d.yBottom, n),
              k = 999 + Math.abs(h),
              p = d.plotX || 0;
            k = l(d.plotY, -k, f.len + k);
            var w = Math.min(k, h),
              z = Math.max(k, h) - w,
              C = t,
              x = p + r,
              B = v;
            q &&
              Math.abs(z) < q &&
              ((z = q),
              (p = (!f.reversed && !d.negative) || (f.reversed && d.negative)),
              J(g) &&
                J(A) &&
                d.y === g &&
                A <= g &&
                (f.min || 0) < g &&
                (y !== A || (f.max || 0) <= g) &&
                (p = !p),
              (w = Math.abs(w - n) > q ? h - q : n - (p ? q : 0)));
            m(d.options.pointWidth) &&
              ((C = B = Math.ceil(d.options.pointWidth)),
              (x -= Math.round((C - t) / 2)));
            b.centerInCategory && (x = a.adjustForMissingColumns(x, C, d, u));
            d.barX = x;
            d.pointWidth = C;
            d.tooltipPos = c.inverted
              ? [
                  l(
                    f.len + f.pos - c.plotLeft - k,
                    f.pos - c.plotLeft,
                    f.len + f.pos - c.plotLeft,
                  ),
                  e.len + e.pos - c.plotTop - x - B / 2,
                  z,
                ]
              : [
                  e.left - c.plotLeft + x + B / 2,
                  l(
                    k + f.pos - c.plotTop,
                    f.pos - c.plotTop,
                    f.len + f.pos - c.plotTop,
                  ),
                  z,
                ];
            d.shapeType = a.pointClass.prototype.shapeType || "rect";
            d.shapeArgs = a.crispCol.apply(
              a,
              d.isNull ? [x, n, B, 0] : [x, w, B, z],
            );
          });
        };
        d.prototype.drawGraph = function () {
          this.group[this.dense ? "addClass" : "removeClass"](
            "highcharts-dense-data",
          );
        };
        d.prototype.pointAttribs = function (a, c) {
          var b = this.options,
            d = this.pointAttrToOptions || {},
            e = d.stroke || "borderColor",
            h = d["stroke-width"] || "borderWidth",
            g = (a && a.color) || this.color,
            k = (a && a[e]) || b[e] || g;
          d = (a && a.options.dashStyle) || b.dashStyle;
          var l = (a && a[h]) || b[h] || this[h] || 0,
            m = L(a && a.opacity, b.opacity, 1);
          if (a && this.zones.length) {
            var n = a.getZone();
            g =
              a.options.color ||
              (n && (n.color || a.nonZonedColor)) ||
              this.color;
            n &&
              ((k = n.borderColor || k),
              (d = n.dashStyle || d),
              (l = n.borderWidth || l));
          }
          c &&
            a &&
            ((a = I(
              b.states[c],
              (a.options.states && a.options.states[c]) || {},
            )),
            (c = a.brightness),
            (g =
              a.color ||
              ("undefined" !== typeof c && f(g).brighten(a.brightness).get()) ||
              g),
            (k = a[e] || k),
            (l = a[h] || l),
            (d = a.dashStyle || d),
            (m = L(a.opacity, m)));
          e = { fill: g, stroke: k, "stroke-width": l, opacity: m };
          d && (e.dashstyle = d);
          return e;
        };
        d.prototype.drawPoints = function (a) {
          void 0 === a && (a = this.points);
          var c = this,
            b = this.chart,
            d = c.options,
            e = b.renderer,
            f = d.animationLimit || 250,
            h;
          a.forEach(function (a) {
            var g = a.graphic,
              k = !!g,
              l = g && b.pointCount < f ? "animate" : "attr";
            if (J(a.plotY) && null !== a.y) {
              h = a.shapeArgs;
              g && a.hasNewShapeType() && (g = g.destroy());
              c.enabledDataSorting &&
                (a.startXPos = c.xAxis.reversed
                  ? -(h ? h.width || 0 : 0)
                  : c.xAxis.width);
              g ||
                ((a.graphic = g = e[a.shapeType](h).add(a.group || c.group)) &&
                  c.enabledDataSorting &&
                  b.hasRendered &&
                  b.pointCount < f &&
                  (g.attr({ x: a.startXPos }), (k = !0), (l = "animate")));
              if (g && k) g[l](I(h));
              if (d.borderRadius) g[l]({ r: d.borderRadius });
              b.styledMode ||
                g[l](c.pointAttribs(a, a.selected && "select")).shadow(
                  !1 !== a.allowShadow && d.shadow,
                  null,
                  d.stacking && !d.borderRadius,
                );
              g &&
                (g.addClass(a.getClassName(), !0),
                g.attr({ visibility: a.visible ? "inherit" : "hidden" }));
            } else g && (a.graphic = g.destroy());
          });
        };
        d.prototype.drawTracker = function (a) {
          void 0 === a && (a = this.points);
          var d = this,
            b = d.chart,
            e = b.pointer,
            f = function (a) {
              var b = e.getPointFromEvent(a);
              "undefined" !== typeof b &&
                ((e.isDirectTouch = !0), b.onMouseOver(a));
            },
            h;
          a.forEach(function (a) {
            h = v(a.dataLabels)
              ? a.dataLabels
              : a.dataLabel
                ? [a.dataLabel]
                : [];
            a.graphic && (a.graphic.element.point = a);
            h.forEach(function (b) {
              b.div ? (b.div.point = a) : (b.element.point = a);
            });
          });
          d._hasTracking ||
            (d.trackerGroups.forEach(function (a) {
              if (d[a]) {
                d[a]
                  .addClass("highcharts-tracker")
                  .on("mouseover", f)
                  .on("mouseout", function (a) {
                    e.onTrackerMouseOut(a);
                  });
                if (c) d[a].on("touchstart", f);
                !b.styledMode &&
                  d.options.cursor &&
                  d[a].css({ cursor: d.options.cursor });
              }
            }),
            (d._hasTracking = !0));
          u(this, "afterDrawTracker");
        };
        d.prototype.remove = function () {
          var a = this,
            c = a.chart;
          c.hasRendered &&
            c.series.forEach(function (b) {
              b.type === a.type && (b.isDirty = !0);
            });
          B.prototype.remove.apply(a, arguments);
        };
        d.defaultOptions = I(B.defaultOptions, x);
        return d;
      })(B);
      e(r.prototype, {
        cropShoulder: 0,
        directTouch: !0,
        drawLegendSymbol: D.drawRectangle,
        getSymbol: a,
        negStacks: !0,
        trackerGroups: ["group", "dataLabelsGroup"],
      });
      G.registerSeriesType("column", r);
      ("");
      return r;
    },
  );
  K(
    g,
    "Core/Series/DataLabel.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/FormatUtilities.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v = a.getDeferredAnimation,
        D = g.format,
        B = x.defined,
        G = x.extend,
        r = x.fireEvent,
        t = x.isArray,
        n = x.isString,
        f = x.merge,
        c = x.objectEach,
        l = x.pick,
        m = x.splat,
        e;
      (function (a) {
        function e(a, c, b, d, e) {
          var f = this,
            h = this.chart,
            g = this.isCartesian && h.inverted,
            k = this.enabledDataSorting,
            m = a.plotX,
            n = a.plotY,
            q = b.rotation,
            p = b.align,
            u =
              B(m) &&
              B(n) &&
              h.isInsidePlot(m, Math.round(n), {
                inverted: g,
                paneCoordinates: !0,
                series: f,
              }),
            t = function (b) {
              k && f.xAxis && !r && f.setDataLabelStartPos(a, c, e, u, b);
            },
            r = "justify" === l(b.overflow, k ? "none" : "justify"),
            A =
              this.visible &&
              !1 !== a.visible &&
              B(m) &&
              (a.series.forceDL ||
                (k && !r) ||
                u ||
                (l(b.inside, !!this.options.stacking) &&
                  d &&
                  h.isInsidePlot(m, g ? d.x + 1 : d.y + d.height - 1, {
                    inverted: g,
                    paneCoordinates: !0,
                    series: f,
                  })));
          if (A && B(m) && B(n)) {
            q && c.attr({ align: p });
            p = c.getBBox(!0);
            var v = [0, 0];
            var z = h.renderer.fontMetrics(
              h.styledMode ? void 0 : b.style.fontSize,
              c,
            ).b;
            d = G(
              {
                x: g ? this.yAxis.len - n : m,
                y: Math.round(g ? this.xAxis.len - m : n),
                width: 0,
                height: 0,
              },
              d,
            );
            G(b, { width: p.width, height: p.height });
            q
              ? ((r = !1),
                (v = h.renderer.rotCorr(z, q)),
                (z = {
                  x: d.x + (b.x || 0) + d.width / 2 + v.x,
                  y:
                    d.y +
                    (b.y || 0) +
                    { top: 0, middle: 0.5, bottom: 1 }[b.verticalAlign] *
                      d.height,
                }),
                (v = [p.x - Number(c.attr("x")), p.y - Number(c.attr("y"))]),
                t(z),
                c[e ? "attr" : "animate"](z))
              : (t(d), c.align(b, void 0, d), (z = c.alignAttr));
            r && 0 <= d.height
              ? this.justifyDataLabel(c, b, z, p, d, e)
              : l(b.crop, !0) &&
                ((d = z.x),
                (t = z.y),
                (d += v[0]),
                (t += v[1]),
                (A =
                  h.isInsidePlot(d, t, { paneCoordinates: !0, series: f }) &&
                  h.isInsidePlot(d + p.width, t + p.height, {
                    paneCoordinates: !0,
                    series: f,
                  })));
            if (b.shape && !q)
              c[e ? "attr" : "animate"]({
                anchorX: g ? h.plotWidth - n : m,
                anchorY: g ? h.plotHeight - m : n,
              });
          }
          e && k && (c.placed = !1);
          A || (k && !r) ? c.show() : (c.hide(), (c.placed = !1));
        }
        function g(a, c) {
          var b = c.filter;
          return b
            ? ((c = b.operator),
              (a = a[b.property]),
              (b = b.value),
              (">" === c && a > b) ||
              ("<" === c && a < b) ||
              (">=" === c && a >= b) ||
              ("<=" === c && a <= b) ||
              ("==" === c && a == b) ||
              ("===" === c && a === b)
                ? !0
                : !1)
            : !0;
        }
        function u(a) {
          void 0 === a && (a = this.points);
          var d = this,
            b = d.chart,
            e = d.options,
            f = d.hasRendered || 0,
            h = b.renderer,
            q = b.options.chart,
            u = q.backgroundColor;
          q = q.plotBackgroundColor;
          var C = h.getContrast((n(q) && q) || (n(u) && u) || "#000000"),
            x = e.dataLabels,
            E;
          u = x.animation;
          u = x.defer ? v(b, u, d) : { defer: 0, duration: 0 };
          x = A(
            A(
              b.options.plotOptions &&
                b.options.plotOptions.series &&
                b.options.plotOptions.series.dataLabels,
              b.options.plotOptions &&
                b.options.plotOptions[d.type] &&
                b.options.plotOptions[d.type].dataLabels,
            ),
            x,
          );
          r(this, "drawDataLabels");
          if (t(x) || x.enabled || d._hasPointLabels) {
            var I = d.plotGroup(
              "dataLabelsGroup",
              "data-labels",
              f ? "inherit" : "hidden",
              x.zIndex || 6,
            );
            I.attr({ opacity: +f });
            !f &&
              (f = d.dataLabelsGroup) &&
              (d.visible && I.show(),
              f[e.animation ? "animate" : "attr"]({ opacity: 1 }, u));
            a.forEach(function (a) {
              E = m(A(x, a.dlOptions || (a.options && a.options.dataLabels)));
              E.forEach(function (f, k) {
                var m =
                    f.enabled && (!a.isNull || a.dataLabelOnNull) && g(a, f),
                  n = a.connectors ? a.connectors[k] : a.connector,
                  q = a.dataLabels ? a.dataLabels[k] : a.dataLabel,
                  p = !q,
                  u = l(f.distance, a.labelDistance);
                if (m) {
                  var t = a.getLabelConfig();
                  var r = l(f[a.formatPrefix + "Format"], f.format);
                  t = B(r)
                    ? D(r, t, b)
                    : (f[a.formatPrefix + "Formatter"] || f.formatter).call(
                        t,
                        f,
                      );
                  r = f.style;
                  var A = f.rotation;
                  b.styledMode ||
                    ((r.color = l(f.color, r.color, d.color, "#000000")),
                    "contrast" === r.color
                      ? ((a.contrastColor = h.getContrast(a.color || d.color)),
                        (r.color =
                          (!B(u) && f.inside) || 0 > u || e.stacking
                            ? a.contrastColor
                            : C))
                      : delete a.contrastColor,
                    e.cursor && (r.cursor = e.cursor));
                  var v = {
                    r: f.borderRadius || 0,
                    rotation: A,
                    padding: f.padding,
                    zIndex: 1,
                  };
                  b.styledMode ||
                    ((v.fill = f.backgroundColor),
                    (v.stroke = f.borderColor),
                    (v["stroke-width"] = f.borderWidth));
                  c(v, function (a, b) {
                    "undefined" === typeof a && delete v[b];
                  });
                }
                !q ||
                  (m &&
                    B(t) &&
                    !!q.div === !!f.useHTML &&
                    ((q.rotation && f.rotation) ||
                      q.rotation === f.rotation)) ||
                  ((p = !0),
                  (a.dataLabel = q = a.dataLabel && a.dataLabel.destroy()),
                  a.dataLabels &&
                    (1 === a.dataLabels.length
                      ? delete a.dataLabels
                      : delete a.dataLabels[k]),
                  k || delete a.dataLabel,
                  n &&
                    ((a.connector = a.connector.destroy()),
                    a.connectors &&
                      (1 === a.connectors.length
                        ? delete a.connectors
                        : delete a.connectors[k])));
                m && B(t)
                  ? (q
                      ? (v.text = t)
                      : ((a.dataLabels = a.dataLabels || []),
                        (q = a.dataLabels[k] =
                          A
                            ? h
                                .text(t, 0, 0, f.useHTML)
                                .addClass("highcharts-data-label")
                            : h.label(
                                t,
                                0,
                                0,
                                f.shape,
                                null,
                                null,
                                f.useHTML,
                                null,
                                "data-label",
                              )),
                        k || (a.dataLabel = q),
                        q.addClass(
                          " highcharts-data-label-color-" +
                            a.colorIndex +
                            " " +
                            (f.className || "") +
                            (f.useHTML ? " highcharts-tracker" : ""),
                        )),
                    (q.options = f),
                    q.attr(v),
                    b.styledMode || q.css(r).shadow(f.shadow),
                    (k = f[a.formatPrefix + "TextPath"] || f.textPath) &&
                      !f.useHTML &&
                      (q.setTextPath(
                        (a.getDataLabelPath && a.getDataLabelPath(q)) ||
                          a.graphic,
                        k,
                      ),
                      a.dataLabelPath &&
                        !k.enabled &&
                        (a.dataLabelPath = a.dataLabelPath.destroy())),
                    q.added || q.add(I),
                    d.alignDataLabel(a, q, f, null, p))
                  : q && q.hide();
              });
            });
          }
          r(this, "afterDrawDataLabels");
        }
        function x(a, c, b, d, e, f) {
          var h = this.chart,
            g = c.align,
            k = c.verticalAlign,
            l = a.box ? 0 : a.padding || 0,
            m = c.x;
          m = void 0 === m ? 0 : m;
          var n = c.y;
          n = void 0 === n ? 0 : n;
          var q = (b.x || 0) + l;
          if (0 > q) {
            "right" === g && 0 <= m
              ? ((c.align = "left"), (c.inside = !0))
              : (m -= q);
            var p = !0;
          }
          q = (b.x || 0) + d.width - l;
          q > h.plotWidth &&
            ("left" === g && 0 >= m
              ? ((c.align = "right"), (c.inside = !0))
              : (m += h.plotWidth - q),
            (p = !0));
          q = b.y + l;
          0 > q &&
            ("bottom" === k && 0 <= n
              ? ((c.verticalAlign = "top"), (c.inside = !0))
              : (n -= q),
            (p = !0));
          q = (b.y || 0) + d.height - l;
          q > h.plotHeight &&
            ("top" === k && 0 >= n
              ? ((c.verticalAlign = "bottom"), (c.inside = !0))
              : (n += h.plotHeight - q),
            (p = !0));
          p && ((c.x = m), (c.y = n), (a.placed = !f), a.align(c, void 0, e));
          return p;
        }
        function A(a, c) {
          var b = [],
            d;
          if (t(a) && !t(c))
            b = a.map(function (a) {
              return f(a, c);
            });
          else if (t(c) && !t(a))
            b = c.map(function (b) {
              return f(a, b);
            });
          else if (t(a) || t(c))
            for (d = Math.max(a.length, c.length); d--; ) b[d] = f(a[d], c[d]);
          else b = f(a, c);
          return b;
        }
        function d(a, c, b, d, e) {
          var f = this.chart,
            h = f.inverted,
            g = this.xAxis,
            k = g.reversed,
            l = h ? c.height / 2 : c.width / 2;
          a = (a = a.pointWidth) ? a / 2 : 0;
          c.startXPos = h ? e.x : k ? -l - a : g.width - l + a;
          c.startYPos = h ? (k ? this.yAxis.height - l + a : -l - a) : e.y;
          d
            ? "hidden" === c.visibility &&
              (c.show(), c.attr({ opacity: 0 }).animate({ opacity: 1 }))
            : c.attr({ opacity: 1 }).animate({ opacity: 0 }, void 0, c.hide);
          f.hasRendered &&
            (b && c.attr({ x: c.startXPos, y: c.startYPos }), (c.placed = !0));
        }
        var q = [];
        a.compose = function (a) {
          if (-1 === q.indexOf(a)) {
            var c = a.prototype;
            q.push(a);
            c.alignDataLabel = e;
            c.drawDataLabels = u;
            c.justifyDataLabel = x;
            c.setDataLabelStartPos = d;
          }
        };
      })(e || (e = {}));
      ("");
      return e;
    },
  );
  K(
    g,
    "Series/Column/ColumnDataLabel.js",
    [
      g["Core/Series/DataLabel.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v = g.series,
        D = x.merge,
        B = x.pick,
        G;
      (function (g) {
        function t(a, c, g, m, e) {
          var f = this.chart.inverted,
            l = a.series,
            n = (l.xAxis ? l.xAxis.len : this.chart.plotSizeX) || 0;
          l = (l.yAxis ? l.yAxis.len : this.chart.plotSizeY) || 0;
          var t = a.dlBox || a.shapeArgs,
            r = B(a.below, a.plotY > B(this.translatedThreshold, l)),
            A = B(g.inside, !!this.options.stacking);
          t &&
            ((m = D(t)),
            0 > m.y && ((m.height += m.y), (m.y = 0)),
            (t = m.y + m.height - l),
            0 < t && t < m.height && (m.height -= t),
            f &&
              (m = {
                x: l - m.y - m.height,
                y: n - m.x - m.width,
                width: m.height,
                height: m.width,
              }),
            A ||
              (f
                ? ((m.x += r ? 0 : m.width), (m.width = 0))
                : ((m.y += r ? m.height : 0), (m.height = 0))));
          g.align = B(g.align, !f || A ? "center" : r ? "right" : "left");
          g.verticalAlign = B(
            g.verticalAlign,
            f || A ? "middle" : r ? "top" : "bottom",
          );
          v.prototype.alignDataLabel.call(this, a, c, g, m, e);
          g.inside && a.contrastColor && c.css({ color: a.contrastColor });
        }
        var n = [];
        g.compose = function (f) {
          a.compose(v);
          -1 === n.indexOf(f) && (n.push(f), (f.prototype.alignDataLabel = t));
        };
      })(G || (G = {}));
      return G;
    },
  );
  K(
    g,
    "Series/Bar/BarSeries.js",
    [
      g["Series/Column/ColumnSeries.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (g, t) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, f) {
                    a.__proto__ = f;
                  }) ||
                function (a, f) {
                  for (var c in f) f.hasOwnProperty(c) && (a[c] = f[c]);
                };
              return a(g, t);
            };
            return function (g, t) {
              function n() {
                this.constructor = g;
              }
              a(g, t);
              g.prototype =
                null === t
                  ? Object.create(t)
                  : ((n.prototype = t.prototype), new n());
            };
          })(),
        D = x.extend,
        B = x.merge;
      x = (function (g) {
        function r() {
          var a = (null !== g && g.apply(this, arguments)) || this;
          a.data = void 0;
          a.options = void 0;
          a.points = void 0;
          return a;
        }
        v(r, g);
        r.defaultOptions = B(a.defaultOptions, {});
        return r;
      })(a);
      D(x.prototype, { inverted: !0 });
      g.registerSeriesType("bar", x);
      ("");
      return x;
    },
  );
  K(g, "Series/Scatter/ScatterSeriesDefaults.js", [], function () {
    "";
    return {
      lineWidth: 0,
      findNearestPointBy: "xy",
      jitter: { x: 0, y: 0 },
      marker: { enabled: !0 },
      tooltip: {
        headerFormat:
          '<span style="color:{point.color}">\u25cf</span> <span style="font-size: 10px"> {series.name}</span><br/>',
        pointFormat: "x: <b>{point.x}</b><br/>y: <b>{point.y}</b><br/>",
      },
    };
  });
  K(
    g,
    "Series/Scatter/ScatterSeries.js",
    [
      g["Series/Scatter/ScatterSeriesDefaults.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (f, c) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, c) {
                    a.__proto__ = c;
                  }) ||
                function (a, c) {
                  for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
              return a(f, c);
            };
            return function (f, c) {
              function g() {
                this.constructor = f;
              }
              a(f, c);
              f.prototype =
                null === c
                  ? Object.create(c)
                  : ((g.prototype = c.prototype), new g());
            };
          })(),
        D = g.seriesTypes,
        B = D.column,
        G = D.line;
      D = x.addEvent;
      var r = x.extend,
        t = x.merge;
      x = (function (g) {
        function f() {
          var a = (null !== g && g.apply(this, arguments)) || this;
          a.data = void 0;
          a.options = void 0;
          a.points = void 0;
          return a;
        }
        v(f, g);
        f.prototype.applyJitter = function () {
          var a = this,
            f = this.options.jitter,
            g = this.points.length;
          f &&
            this.points.forEach(function (c, l) {
              ["x", "y"].forEach(function (e, m) {
                var n = "plot" + e.toUpperCase();
                if (f[e] && !c.isNull) {
                  var u = a[e + "Axis"];
                  var t = f[e] * u.transA;
                  if (u && !u.isLog) {
                    var d = Math.max(0, c[n] - t);
                    u = Math.min(u.len, c[n] + t);
                    m = 1e4 * Math.sin(l + m * g);
                    c[n] = d + (u - d) * (m - Math.floor(m));
                    "x" === e && (c.clientX = c.plotX);
                  }
                }
              });
            });
        };
        f.prototype.drawGraph = function () {
          this.options.lineWidth
            ? g.prototype.drawGraph.call(this)
            : this.graph && (this.graph = this.graph.destroy());
        };
        f.defaultOptions = t(G.defaultOptions, a);
        return f;
      })(G);
      r(x.prototype, {
        drawTracker: B.prototype.drawTracker,
        sorted: !1,
        requireSorting: !1,
        noSharedTooltip: !0,
        trackerGroups: ["group", "markerGroup", "dataLabelsGroup"],
        takeOrdinalPosition: !1,
      });
      D(x, "afterTranslate", function () {
        this.applyJitter();
      });
      g.registerSeriesType("scatter", x);
      return x;
    },
  );
  K(
    g,
    "Series/CenteredUtilities.js",
    [g["Core/Globals.js"], g["Core/Series/Series.js"], g["Core/Utilities.js"]],
    function (a, g, x) {
      var v = a.deg2rad,
        D = x.fireEvent,
        B = x.isNumber,
        G = x.pick,
        r = x.relativeLength,
        t;
      (function (a) {
        a.getCenter = function () {
          var a = this.options,
            c = this.chart,
            l = 2 * (a.slicedOffset || 0),
            m = c.plotWidth - 2 * l,
            e = c.plotHeight - 2 * l,
            n = a.center,
            t = Math.min(m, e),
            v = a.thickness,
            x = a.size,
            E = a.innerSize || 0;
          "string" === typeof x && (x = parseFloat(x));
          "string" === typeof E && (E = parseFloat(E));
          a = [
            G(n[0], "50%"),
            G(n[1], "50%"),
            G(x && 0 > x ? void 0 : a.size, "100%"),
            G(E && 0 > E ? void 0 : a.innerSize || 0, "0%"),
          ];
          !c.angular || this instanceof g || (a[3] = 0);
          for (n = 0; 4 > n; ++n)
            (x = a[n]),
              (c = 2 > n || (2 === n && /%$/.test(x))),
              (a[n] = r(x, [m, e, t, a[2]][n]) + (c ? l : 0));
          a[3] > a[2] && (a[3] = a[2]);
          B(v) && 2 * v < a[2] && 0 < v && (a[3] = a[2] - 2 * v);
          D(this, "afterGetCenter", { positions: a });
          return a;
        };
        a.getStartAndEndRadians = function (a, c) {
          a = B(a) ? a : 0;
          c = B(c) && c > a && 360 > c - a ? c : a + 360;
          return { start: v * (a + -90), end: v * (c + -90) };
        };
      })(t || (t = {}));
      ("");
      return t;
    },
  );
  K(
    g,
    "Series/Pie/PiePoint.js",
    [
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Series/Point.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x) {
      var v =
          (this && this.__extends) ||
          (function () {
            var a = function (c, f) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, c) {
                    a.__proto__ = c;
                  }) ||
                function (a, c) {
                  for (var e in c) c.hasOwnProperty(e) && (a[e] = c[e]);
                };
              return a(c, f);
            };
            return function (c, f) {
              function g() {
                this.constructor = c;
              }
              a(c, f);
              c.prototype =
                null === f
                  ? Object.create(f)
                  : ((g.prototype = f.prototype), new g());
            };
          })(),
        D = a.setAnimation,
        B = x.addEvent,
        G = x.defined;
      a = x.extend;
      var r = x.isNumber,
        t = x.pick,
        n = x.relativeLength;
      g = (function (a) {
        function c() {
          var c = (null !== a && a.apply(this, arguments)) || this;
          c.labelDistance = void 0;
          c.options = void 0;
          c.series = void 0;
          return c;
        }
        v(c, a);
        c.prototype.getConnectorPath = function () {
          var a = this.labelPosition,
            c = this.series.options.dataLabels,
            e = this.connectorShapes,
            f = c.connectorShape;
          e[f] && (f = e[f]);
          return f.call(
            this,
            { x: a.final.x, y: a.final.y, alignment: a.alignment },
            a.connectorPosition,
            c,
          );
        };
        c.prototype.getTranslate = function () {
          return this.sliced
            ? this.slicedTranslation
            : { translateX: 0, translateY: 0 };
        };
        c.prototype.haloPath = function (a) {
          var c = this.shapeArgs;
          return this.sliced || !this.visible
            ? []
            : this.series.chart.renderer.symbols.arc(
                c.x,
                c.y,
                c.r + a,
                c.r + a,
                { innerR: c.r - 1, start: c.start, end: c.end },
              );
        };
        c.prototype.init = function () {
          var c = this;
          a.prototype.init.apply(this, arguments);
          this.name = t(this.name, "Slice");
          var f = function (a) {
            c.slice("select" === a.type);
          };
          B(this, "select", f);
          B(this, "unselect", f);
          return this;
        };
        c.prototype.isValid = function () {
          return r(this.y) && 0 <= this.y;
        };
        c.prototype.setVisible = function (a, c) {
          var e = this,
            f = this.series,
            g = f.chart,
            l = f.options.ignoreHiddenPoint;
          c = t(c, l);
          a !== this.visible &&
            ((this.visible =
              this.options.visible =
              a =
                "undefined" === typeof a ? !this.visible : a),
            (f.options.data[f.data.indexOf(this)] = this.options),
            ["graphic", "dataLabel", "connector", "shadowGroup"].forEach(
              function (c) {
                if (e[c]) e[c][a ? "show" : "hide"](a);
              },
            ),
            this.legendItem && g.legend.colorizeItem(this, a),
            a || "hover" !== this.state || this.setState(""),
            l && (f.isDirty = !0),
            c && g.redraw());
        };
        c.prototype.slice = function (a, c, e) {
          var f = this.series;
          D(e, f.chart);
          t(c, !0);
          this.sliced = this.options.sliced = G(a) ? a : !this.sliced;
          f.options.data[f.data.indexOf(this)] = this.options;
          this.graphic && this.graphic.animate(this.getTranslate());
          this.shadowGroup && this.shadowGroup.animate(this.getTranslate());
        };
        return c;
      })(g);
      a(g.prototype, {
        connectorShapes: {
          fixedOffset: function (a, c, g) {
            var f = c.breakAt;
            c = c.touchingSliceAt;
            return [
              ["M", a.x, a.y],
              g.softConnector
                ? [
                    "C",
                    a.x + ("left" === a.alignment ? -5 : 5),
                    a.y,
                    2 * f.x - c.x,
                    2 * f.y - c.y,
                    f.x,
                    f.y,
                  ]
                : ["L", f.x, f.y],
              ["L", c.x, c.y],
            ];
          },
          straight: function (a, c) {
            c = c.touchingSliceAt;
            return [
              ["M", a.x, a.y],
              ["L", c.x, c.y],
            ];
          },
          crookedLine: function (a, c, g) {
            c = c.touchingSliceAt;
            var f = this.series,
              e = f.center[0],
              l = f.chart.plotWidth,
              t = f.chart.plotLeft;
            f = a.alignment;
            var r = this.shapeArgs.r;
            g = n(g.crookDistance, 1);
            l =
              "left" === f
                ? e + r + (l + t - e - r) * (1 - g)
                : t + (e - r) * g;
            g = ["L", l, a.y];
            e = !0;
            if ("left" === f ? l > a.x || l < c.x : l < a.x || l > c.x) e = !1;
            a = [["M", a.x, a.y]];
            e && a.push(g);
            a.push(["L", c.x, c.y]);
            return a;
          },
        },
      });
      return g;
    },
  );
  K(g, "Series/Pie/PieSeriesDefaults.js", [], function () {
    "";
    return {
      center: [null, null],
      clip: !1,
      colorByPoint: !0,
      dataLabels: {
        allowOverlap: !0,
        connectorPadding: 5,
        connectorShape: "fixedOffset",
        crookDistance: "70%",
        distance: 30,
        enabled: !0,
        formatter: function () {
          return this.point.isNull ? void 0 : this.point.name;
        },
        softConnector: !0,
        x: 0,
      },
      fillColor: void 0,
      ignoreHiddenPoint: !0,
      inactiveOtherPoints: !0,
      legendType: "point",
      marker: null,
      size: null,
      showInLegend: !1,
      slicedOffset: 10,
      stickyTracking: !1,
      tooltip: { followPointer: !0 },
      borderColor: "#ffffff",
      borderWidth: 1,
      lineWidth: void 0,
      states: { hover: { brightness: 0.1 } },
    };
  });
  K(
    g,
    "Series/Pie/PieSeries.js",
    [
      g["Series/CenteredUtilities.js"],
      g["Series/Column/ColumnSeries.js"],
      g["Core/Globals.js"],
      g["Core/Legend/LegendSymbol.js"],
      g["Series/Pie/PiePoint.js"],
      g["Series/Pie/PieSeriesDefaults.js"],
      g["Core/Series/Series.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Renderer/SVG/Symbols.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D, B, G, r, t, n) {
      var f =
          (this && this.__extends) ||
          (function () {
            var a = function (c, e) {
              a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (a, c) {
                    a.__proto__ = c;
                  }) ||
                function (a, c) {
                  for (var d in c) c.hasOwnProperty(d) && (a[d] = c[d]);
                };
              return a(c, e);
            };
            return function (c, e) {
              function d() {
                this.constructor = c;
              }
              a(c, e);
              c.prototype =
                null === e
                  ? Object.create(e)
                  : ((d.prototype = e.prototype), new d());
            };
          })(),
        c = a.getStartAndEndRadians;
      x = x.noop;
      var l = n.clamp,
        m = n.extend,
        e = n.fireEvent,
        u = n.merge,
        v = n.pick,
        J = n.relativeLength;
      n = (function (a) {
        function g() {
          var c = (null !== a && a.apply(this, arguments)) || this;
          c.center = void 0;
          c.data = void 0;
          c.maxLabelDistance = void 0;
          c.options = void 0;
          c.points = void 0;
          return c;
        }
        f(g, a);
        g.prototype.animate = function (a) {
          var c = this,
            e = c.points,
            f = c.startAngleRad;
          a ||
            e.forEach(function (a) {
              var b = a.graphic,
                d = a.shapeArgs;
              b &&
                d &&
                (b.attr({
                  r: v(a.startR, c.center && c.center[3] / 2),
                  start: f,
                  end: f,
                }),
                b.animate(
                  { r: d.r, start: d.start, end: d.end },
                  c.options.animation,
                ));
            });
        };
        g.prototype.drawEmpty = function () {
          var a = this.startAngleRad,
            c = this.endAngleRad,
            e = this.options;
          if (0 === this.total && this.center) {
            var f = this.center[0];
            var g = this.center[1];
            this.graph ||
              (this.graph = this.chart.renderer
                .arc(f, g, this.center[1] / 2, 0, a, c)
                .addClass("highcharts-empty-series")
                .add(this.group));
            this.graph.attr({
              d: t.arc(f, g, this.center[2] / 2, 0, {
                start: a,
                end: c,
                innerR: this.center[3] / 2,
              }),
            });
            this.chart.styledMode ||
              this.graph.attr({
                "stroke-width": e.borderWidth,
                fill: e.fillColor || "none",
                stroke: e.color || "#cccccc",
              });
          } else this.graph && (this.graph = this.graph.destroy());
        };
        g.prototype.drawPoints = function () {
          var a = this.chart.renderer;
          this.points.forEach(function (c) {
            c.graphic &&
              c.hasNewShapeType() &&
              (c.graphic = c.graphic.destroy());
            c.graphic ||
              ((c.graphic = a[c.shapeType](c.shapeArgs).add(c.series.group)),
              (c.delayedRendering = !0));
          });
        };
        g.prototype.generatePoints = function () {
          a.prototype.generatePoints.call(this);
          this.updateTotals();
        };
        g.prototype.getX = function (a, c, e) {
          var d = this.center,
            f = this.radii ? this.radii[e.index] || 0 : d[2] / 2;
          a = Math.asin(l((a - d[1]) / (f + e.labelDistance), -1, 1));
          return (
            d[0] +
            (c ? -1 : 1) * Math.cos(a) * (f + e.labelDistance) +
            (0 < e.labelDistance
              ? (c ? -1 : 1) * this.options.dataLabels.padding
              : 0)
          );
        };
        g.prototype.hasData = function () {
          return !!this.processedXData.length;
        };
        g.prototype.redrawPoints = function () {
          var a = this,
            c = a.chart,
            e = c.renderer,
            f = a.options.shadow,
            g,
            b,
            l,
            m;
          this.drawEmpty();
          !f ||
            a.shadowGroup ||
            c.styledMode ||
            (a.shadowGroup = e.g("shadow").attr({ zIndex: -1 }).add(a.group));
          a.points.forEach(function (d) {
            var h = {};
            b = d.graphic;
            if (!d.isNull && b) {
              var k = void 0;
              m = d.shapeArgs;
              g = d.getTranslate();
              c.styledMode ||
                ((k = d.shadowGroup),
                f &&
                  !k &&
                  (k = d.shadowGroup = e.g("shadow").add(a.shadowGroup)),
                k && k.attr(g),
                (l = a.pointAttribs(d, d.selected && "select")));
              d.delayedRendering
                ? (b.setRadialReference(a.center).attr(m).attr(g),
                  c.styledMode ||
                    b.attr(l).attr({ "stroke-linejoin": "round" }).shadow(f, k),
                  (d.delayedRendering = !1))
                : (b.setRadialReference(a.center),
                  c.styledMode || u(!0, h, l),
                  u(!0, h, m, g),
                  b.animate(h));
              b.attr({ visibility: d.visible ? "inherit" : "hidden" });
              b.addClass(d.getClassName(), !0);
            } else b && (d.graphic = b.destroy());
          });
        };
        g.prototype.sortByAngle = function (a, c) {
          a.sort(function (a, d) {
            return "undefined" !== typeof a.angle && (d.angle - a.angle) * c;
          });
        };
        g.prototype.translate = function (a) {
          e(this, "translate");
          this.generatePoints();
          var d = this.options,
            f = d.slicedOffset,
            h = f + (d.borderWidth || 0),
            g = c(d.startAngle, d.endAngle),
            b = (this.startAngleRad = g.start);
          g = (this.endAngleRad = g.end) - b;
          var l = this.points,
            m = d.dataLabels.distance;
          d = d.ignoreHiddenPoint;
          var n = l.length,
            u,
            t = 0;
          a || (this.center = a = this.getCenter());
          for (u = 0; u < n; u++) {
            var r = l[u];
            var A = b + t * g;
            !r.isValid() || (d && !r.visible) || (t += r.percentage / 100);
            var x = b + t * g;
            var C = {
              x: a[0],
              y: a[1],
              r: a[2] / 2,
              innerR: a[3] / 2,
              start: Math.round(1e3 * A) / 1e3,
              end: Math.round(1e3 * x) / 1e3,
            };
            r.shapeType = "arc";
            r.shapeArgs = C;
            r.labelDistance = v(
              r.options.dataLabels && r.options.dataLabels.distance,
              m,
            );
            r.labelDistance = J(r.labelDistance, C.r);
            this.maxLabelDistance = Math.max(
              this.maxLabelDistance || 0,
              r.labelDistance,
            );
            x = (x + A) / 2;
            x > 1.5 * Math.PI
              ? (x -= 2 * Math.PI)
              : x < -Math.PI / 2 && (x += 2 * Math.PI);
            r.slicedTranslation = {
              translateX: Math.round(Math.cos(x) * f),
              translateY: Math.round(Math.sin(x) * f),
            };
            C = (Math.cos(x) * a[2]) / 2;
            var y = (Math.sin(x) * a[2]) / 2;
            r.tooltipPos = [a[0] + 0.7 * C, a[1] + 0.7 * y];
            r.half = x < -Math.PI / 2 || x > Math.PI / 2 ? 1 : 0;
            r.angle = x;
            A = Math.min(h, r.labelDistance / 5);
            r.labelPosition = {
              natural: {
                x: a[0] + C + Math.cos(x) * r.labelDistance,
                y: a[1] + y + Math.sin(x) * r.labelDistance,
              },
              final: {},
              alignment:
                0 > r.labelDistance ? "center" : r.half ? "right" : "left",
              connectorPosition: {
                breakAt: {
                  x: a[0] + C + Math.cos(x) * A,
                  y: a[1] + y + Math.sin(x) * A,
                },
                touchingSliceAt: { x: a[0] + C, y: a[1] + y },
              },
            };
          }
          e(this, "afterTranslate");
        };
        g.prototype.updateTotals = function () {
          var a = this.points,
            c = a.length,
            e = this.options.ignoreHiddenPoint,
            f,
            g = 0;
          for (f = 0; f < c; f++) {
            var b = a[f];
            !b.isValid() || (e && !b.visible) || (g += b.y);
          }
          this.total = g;
          for (f = 0; f < c; f++)
            (b = a[f]),
              (b.percentage = 0 < g && (b.visible || !e) ? (b.y / g) * 100 : 0),
              (b.total = g);
        };
        g.defaultOptions = u(G.defaultOptions, B);
        return g;
      })(G);
      m(n.prototype, {
        axisTypes: [],
        directTouch: !0,
        drawGraph: void 0,
        drawLegendSymbol: E.drawRectangle,
        drawTracker: g.prototype.drawTracker,
        getCenter: a.getCenter,
        getSymbol: x,
        isCartesian: !1,
        noSharedTooltip: !0,
        pointAttribs: g.prototype.pointAttribs,
        pointClass: D,
        requireSorting: !1,
        searchPoint: x,
        trackerGroups: ["group", "dataLabelsGroup"],
      });
      r.registerSeriesType("pie", n);
      return n;
    },
  );
  K(
    g,
    "Series/Pie/PieDataLabel.js",
    [
      g["Core/Series/DataLabel.js"],
      g["Core/Globals.js"],
      g["Core/Renderer/RendererUtilities.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Core/Utilities.js"],
    ],
    function (a, g, x, E, D) {
      var v = g.noop,
        G = x.distribute,
        r = E.series,
        t = D.arrayMax,
        n = D.clamp,
        f = D.defined,
        c = D.merge,
        l = D.pick,
        m = D.relativeLength,
        e;
      (function (e) {
        function g() {
          var a = this,
            e = a.data,
            g = a.chart,
            k = a.options.dataLabels || {},
            b = k.connectorPadding,
            m = g.plotWidth,
            n = g.plotHeight,
            u = g.plotLeft,
            v = Math.round(g.chartWidth / 3),
            A = a.center,
            x = A[2] / 2,
            C = A[1],
            B = [[], []],
            D = [0, 0, 0, 0],
            y = a.dataLabelPositioners,
            E,
            I,
            J,
            L,
            F,
            K,
            M,
            X,
            W,
            U,
            Z,
            V;
          a.visible &&
            (k.enabled || a._hasPointLabels) &&
            (e.forEach(function (a) {
              a.dataLabel &&
                a.visible &&
                a.dataLabel.shortened &&
                (a.dataLabel
                  .attr({ width: "auto" })
                  .css({ width: "auto", textOverflow: "clip" }),
                (a.dataLabel.shortened = !1));
            }),
            r.prototype.drawDataLabels.apply(a),
            e.forEach(function (a) {
              a.dataLabel &&
                (a.visible
                  ? (B[a.half].push(a),
                    (a.dataLabel._pos = null),
                    !f(k.style.width) &&
                      !f(
                        a.options.dataLabels &&
                          a.options.dataLabels.style &&
                          a.options.dataLabels.style.width,
                      ) &&
                      a.dataLabel.getBBox().width > v &&
                      (a.dataLabel.css({ width: Math.round(0.7 * v) + "px" }),
                      (a.dataLabel.shortened = !0)))
                  : ((a.dataLabel = a.dataLabel.destroy()),
                    a.dataLabels &&
                      1 === a.dataLabels.length &&
                      delete a.dataLabels));
            }),
            B.forEach(function (c, d) {
              var e = c.length,
                h = [],
                q;
              if (e) {
                a.sortByAngle(c, d - 0.5);
                if (0 < a.maxLabelDistance) {
                  var p = Math.max(0, C - x - a.maxLabelDistance);
                  var t = Math.min(C + x + a.maxLabelDistance, g.plotHeight);
                  c.forEach(function (a) {
                    0 < a.labelDistance &&
                      a.dataLabel &&
                      ((a.top = Math.max(0, C - x - a.labelDistance)),
                      (a.bottom = Math.min(
                        C + x + a.labelDistance,
                        g.plotHeight,
                      )),
                      (q = a.dataLabel.getBBox().height || 21),
                      (a.distributeBox = {
                        target: a.labelPosition.natural.y - a.top + q / 2,
                        size: q,
                        rank: a.y,
                      }),
                      h.push(a.distributeBox));
                  });
                  p = t + q - p;
                  G(h, p, p / 5);
                }
                for (Z = 0; Z < e; Z++) {
                  E = c[Z];
                  K = E.labelPosition;
                  L = E.dataLabel;
                  U = !1 === E.visible ? "hidden" : "inherit";
                  W = p = K.natural.y;
                  h &&
                    f(E.distributeBox) &&
                    ("undefined" === typeof E.distributeBox.pos
                      ? (U = "hidden")
                      : ((M = E.distributeBox.size),
                        (W = y.radialDistributionY(E))));
                  delete E.positionIndex;
                  if (k.justify) X = y.justify(E, x, A);
                  else
                    switch (k.alignTo) {
                      case "connectors":
                        X = y.alignToConnectors(c, d, m, u);
                        break;
                      case "plotEdges":
                        X = y.alignToPlotEdges(L, d, m, u);
                        break;
                      default:
                        X = y.radialDistributionX(a, E, W, p);
                    }
                  L._attr = { visibility: U, align: K.alignment };
                  V = E.options.dataLabels || {};
                  L._pos = {
                    x:
                      X +
                      l(V.x, k.x) +
                      ({ left: b, right: -b }[K.alignment] || 0),
                    y: W + l(V.y, k.y) - 10,
                  };
                  K.final.x = X;
                  K.final.y = W;
                  l(k.crop, !0) &&
                    ((F = L.getBBox().width),
                    (p = null),
                    X - F < b && 1 === d
                      ? ((p = Math.round(F - X + b)),
                        (D[3] = Math.max(p, D[3])))
                      : X + F > m - b &&
                        0 === d &&
                        ((p = Math.round(X + F - m + b)),
                        (D[1] = Math.max(p, D[1]))),
                    0 > W - M / 2
                      ? (D[0] = Math.max(Math.round(-W + M / 2), D[0]))
                      : W + M / 2 > n &&
                        (D[2] = Math.max(Math.round(W + M / 2 - n), D[2])),
                    (L.sideOverflow = p));
                }
              }
            }),
            0 === t(D) || this.verifyDataLabelOverflow(D)) &&
            (this.placeDataLabels(),
            this.points.forEach(function (b) {
              V = c(k, b.options.dataLabels);
              if ((I = l(V.connectorWidth, 1))) {
                var d;
                J = b.connector;
                if (
                  (L = b.dataLabel) &&
                  L._pos &&
                  b.visible &&
                  0 < b.labelDistance
                ) {
                  U = L._attr.visibility;
                  if ((d = !J))
                    (b.connector = J =
                      g.renderer
                        .path()
                        .addClass(
                          "highcharts-data-label-connector  highcharts-color-" +
                            b.colorIndex +
                            (b.className ? " " + b.className : ""),
                        )
                        .add(a.dataLabelsGroup)),
                      g.styledMode ||
                        J.attr({
                          "stroke-width": I,
                          stroke: V.connectorColor || b.color || "#666666",
                        });
                  J[d ? "attr" : "animate"]({ d: b.getConnectorPath() });
                  J.attr("visibility", U);
                } else J && (b.connector = J.destroy());
              }
            }));
        }
        function u() {
          this.points.forEach(function (a) {
            var c = a.dataLabel,
              d;
            c &&
              a.visible &&
              ((d = c._pos)
                ? (c.sideOverflow &&
                    ((c._attr.width = Math.max(
                      c.getBBox().width - c.sideOverflow,
                      0,
                    )),
                    c.css({
                      width: c._attr.width + "px",
                      textOverflow:
                        (this.options.dataLabels.style || {}).textOverflow ||
                        "ellipsis",
                    }),
                    (c.shortened = !0)),
                  c.attr(c._attr),
                  c[c.moved ? "animate" : "attr"](d),
                  (c.moved = !0))
                : c && c.attr({ y: -9999 }));
            delete a.distributeBox;
          }, this);
        }
        function x(a) {
          var c = this.center,
            d = this.options,
            e = d.center,
            b = d.minSize || 80,
            f = null !== d.size;
          if (!f) {
            if (null !== e[0]) var g = Math.max(c[2] - Math.max(a[1], a[3]), b);
            else
              (g = Math.max(c[2] - a[1] - a[3], b)),
                (c[0] += (a[3] - a[1]) / 2);
            null !== e[1]
              ? (g = n(g, b, c[2] - Math.max(a[0], a[2])))
              : ((g = n(g, b, c[2] - a[0] - a[2])),
                (c[1] += (a[0] - a[2]) / 2));
            g < c[2]
              ? ((c[2] = g),
                (c[3] = Math.min(
                  d.thickness
                    ? Math.max(0, g - 2 * d.thickness)
                    : Math.max(0, m(d.innerSize || 0, g)),
                  g,
                )),
                this.translate(c),
                this.drawDataLabels && this.drawDataLabels())
              : (f = !0);
          }
          return f;
        }
        var B = [],
          A = {
            radialDistributionY: function (a) {
              return a.top + a.distributeBox.pos;
            },
            radialDistributionX: function (a, c, e, f) {
              return a.getX(
                e < c.top + 2 || e > c.bottom - 2 ? f : e,
                c.half,
                c,
              );
            },
            justify: function (a, c, e) {
              return e[0] + (a.half ? -1 : 1) * (c + a.labelDistance);
            },
            alignToPlotEdges: function (a, c, e, f) {
              a = a.getBBox().width;
              return c ? a + f : e - a - f;
            },
            alignToConnectors: function (a, c, e, f) {
              var b = 0,
                d;
              a.forEach(function (a) {
                d = a.dataLabel.getBBox().width;
                d > b && (b = d);
              });
              return c ? b + f : e - b - f;
            },
          };
        e.compose = function (c) {
          a.compose(r);
          -1 === B.indexOf(c) &&
            (B.push(c),
            (c = c.prototype),
            (c.dataLabelPositioners = A),
            (c.alignDataLabel = v),
            (c.drawDataLabels = g),
            (c.placeDataLabels = u),
            (c.verifyDataLabelOverflow = x));
        };
      })(e || (e = {}));
      return e;
    },
  );
  K(
    g,
    "Extensions/OverlappingDataLabels.js",
    [g["Core/Chart/Chart.js"], g["Core/Utilities.js"]],
    function (a, g) {
      function v(a, f) {
        var c = !1;
        if (a) {
          var g = a.newOpacity;
          a.oldOpacity !== g &&
            (a.alignAttr && a.placed
              ? (a[g ? "removeClass" : "addClass"](
                  "highcharts-data-label-hidden",
                ),
                (c = !0),
                (a.alignAttr.opacity = g),
                a[a.isOld ? "animate" : "attr"](a.alignAttr, null, function () {
                  f.styledMode || a.css({ pointerEvents: g ? "auto" : "none" });
                }),
                D(f, "afterHideOverlappingLabel"))
              : a.attr({ opacity: g }));
          a.isOld = !0;
        }
        return c;
      }
      var E = g.addEvent,
        D = g.fireEvent,
        B = g.isArray,
        G = g.isNumber,
        r = g.objectEach,
        t = g.pick;
      E(a, "render", function () {
        var a = this,
          f = [];
        (this.labelCollectors || []).forEach(function (a) {
          f = f.concat(a());
        });
        (this.yAxis || []).forEach(function (a) {
          a.stacking &&
            a.options.stackLabels &&
            !a.options.stackLabels.allowOverlap &&
            r(a.stacking.stacks, function (a) {
              r(a, function (a) {
                a.label && f.push(a.label);
              });
            });
        });
        (this.series || []).forEach(function (c) {
          var g = c.options.dataLabels;
          c.visible &&
            (!1 !== g.enabled || c._hasPointLabels) &&
            ((g = function (c) {
              return c.forEach(function (c) {
                c.visible &&
                  (B(c.dataLabels)
                    ? c.dataLabels
                    : c.dataLabel
                      ? [c.dataLabel]
                      : []
                  ).forEach(function (e) {
                    var g = e.options;
                    e.labelrank = t(
                      g.labelrank,
                      c.labelrank,
                      c.shapeArgs && c.shapeArgs.height,
                    );
                    g.allowOverlap
                      ? ((e.oldOpacity = e.opacity),
                        (e.newOpacity = 1),
                        v(e, a))
                      : f.push(e);
                  });
              });
            }),
            g(c.nodes || []),
            g(c.points));
        });
        this.hideOverlappingLabels(f);
      });
      a.prototype.hideOverlappingLabels = function (a) {
        var f = this,
          c = a.length,
          g = f.renderer,
          m,
          e,
          n,
          t = !1;
        var r = function (a) {
          var c,
            e = a.box ? 0 : a.padding || 0,
            f = (c = 0),
            k;
          if (a && (!a.alignAttr || a.placed)) {
            var b = a.alignAttr || { x: a.attr("x"), y: a.attr("y") };
            var l = a.parentGroup;
            a.width ||
              ((c = a.getBBox()),
              (a.width = c.width),
              (a.height = c.height),
              (c = g.fontMetrics(null, a.element).h));
            var m = a.width - 2 * e;
            (k = { left: "0", center: "0.5", right: "1" }[a.alignValue])
              ? (f = +k * m)
              : G(a.x) &&
                Math.round(a.x) !== a.translateX &&
                (f = a.x - a.translateX);
            return {
              x: b.x + (l.translateX || 0) + e - (f || 0),
              y: b.y + (l.translateY || 0) + e - c,
              width: a.width - 2 * e,
              height: a.height - 2 * e,
            };
          }
        };
        for (e = 0; e < c; e++)
          if ((m = a[e]))
            (m.oldOpacity = m.opacity),
              (m.newOpacity = 1),
              (m.absoluteBox = r(m));
        a.sort(function (a, c) {
          return (c.labelrank || 0) - (a.labelrank || 0);
        });
        for (e = 0; e < c; e++) {
          var x = (r = a[e]) && r.absoluteBox;
          for (m = e + 1; m < c; ++m) {
            var B = (n = a[m]) && n.absoluteBox;
            !x ||
              !B ||
              r === n ||
              0 === r.newOpacity ||
              0 === n.newOpacity ||
              "hidden" === r.visibility ||
              "hidden" === n.visibility ||
              B.x >= x.x + x.width ||
              B.x + B.width <= x.x ||
              B.y >= x.y + x.height ||
              B.y + B.height <= x.y ||
              ((r.labelrank < n.labelrank ? r : n).newOpacity = 0);
          }
        }
        a.forEach(function (a) {
          v(a, f) && (t = !0);
        });
        t && D(f, "afterHideAllOverlappingLabels");
      };
    },
  );
  K(g, "Core/Responsive.js", [g["Core/Utilities.js"]], function (a) {
    var g = a.extend,
      x = a.find,
      E = a.isArray,
      D = a.isObject,
      B = a.merge,
      G = a.objectEach,
      r = a.pick,
      t = a.splat,
      n = a.uniqueKey,
      f;
    (function (a) {
      var c = [];
      a.compose = function (a) {
        -1 === c.indexOf(a) && (c.push(a), g(a.prototype, f.prototype));
        return a;
      };
      var f = (function () {
        function a() {}
        a.prototype.currentOptions = function (a) {
          function c(a, f, d, g) {
            var h;
            G(a, function (a, b) {
              if (!g && -1 < e.collectionsWithUpdate.indexOf(b) && f[b])
                for (
                  a = t(a), d[b] = [], h = 0;
                  h < Math.max(a.length, f[b].length);
                  h++
                )
                  f[b][h] &&
                    (void 0 === a[h]
                      ? (d[b][h] = f[b][h])
                      : ((d[b][h] = {}), c(a[h], f[b][h], d[b][h], g + 1)));
              else
                D(a)
                  ? ((d[b] = E(a) ? [] : {}), c(a, f[b] || {}, d[b], g + 1))
                  : (d[b] = "undefined" === typeof f[b] ? null : f[b]);
            });
          }
          var e = this,
            f = {};
          c(a, this.options, f, 0);
          return f;
        };
        a.prototype.matchResponsiveRule = function (a, c) {
          var e = a.condition;
          (
            e.callback ||
            function () {
              return (
                this.chartWidth <= r(e.maxWidth, Number.MAX_VALUE) &&
                this.chartHeight <= r(e.maxHeight, Number.MAX_VALUE) &&
                this.chartWidth >= r(e.minWidth, 0) &&
                this.chartHeight >= r(e.minHeight, 0)
              );
            }
          ).call(this) && c.push(a._id);
        };
        a.prototype.setResponsive = function (a, c) {
          var e = this,
            f = this.options.responsive,
            g = this.currentResponsive,
            l = [];
          !c &&
            f &&
            f.rules &&
            f.rules.forEach(function (a) {
              "undefined" === typeof a._id && (a._id = n());
              e.matchResponsiveRule(a, l);
            }, this);
          c = B.apply(
            void 0,
            l
              .map(function (a) {
                return x((f || {}).rules || [], function (c) {
                  return c._id === a;
                });
              })
              .map(function (a) {
                return a && a.chartOptions;
              }),
          );
          c.isResponsiveOptions = !0;
          l = l.toString() || void 0;
          l !== (g && g.ruleIds) &&
            (g && this.update(g.undoOptions, a, !0),
            l
              ? ((g = this.currentOptions(c)),
                (g.isResponsiveOptions = !0),
                (this.currentResponsive = {
                  ruleIds: l,
                  mergedOptions: c,
                  undoOptions: g,
                }),
                this.update(c, a, !0))
              : (this.currentResponsive = void 0));
        };
        return a;
      })();
    })(f || (f = {}));
    ("");
    ("");
    return f;
  });
  K(
    g,
    "masters/highcharts.src.js",
    [
      g["Core/Globals.js"],
      g["Core/Utilities.js"],
      g["Core/Defaults.js"],
      g["Core/Animation/Fx.js"],
      g["Core/Animation/AnimationUtilities.js"],
      g["Core/Renderer/HTML/AST.js"],
      g["Core/FormatUtilities.js"],
      g["Core/Renderer/RendererUtilities.js"],
      g["Core/Renderer/SVG/SVGElement.js"],
      g["Core/Renderer/SVG/SVGRenderer.js"],
      g["Core/Renderer/HTML/HTMLElement.js"],
      g["Core/Renderer/HTML/HTMLRenderer.js"],
      g["Core/Axis/Axis.js"],
      g["Core/Axis/DateTimeAxis.js"],
      g["Core/Axis/LogarithmicAxis.js"],
      g["Core/Axis/PlotLineOrBand/PlotLineOrBand.js"],
      g["Core/Axis/Tick.js"],
      g["Core/Tooltip.js"],
      g["Core/Series/Point.js"],
      g["Core/Pointer.js"],
      g["Core/MSPointer.js"],
      g["Core/Legend/Legend.js"],
      g["Core/Chart/Chart.js"],
      g["Core/Axis/Stacking/StackingAxis.js"],
      g["Core/Axis/Stacking/StackItem.js"],
      g["Core/Series/Series.js"],
      g["Core/Series/SeriesRegistry.js"],
      g["Series/Column/ColumnSeries.js"],
      g["Series/Column/ColumnDataLabel.js"],
      g["Series/Pie/PieSeries.js"],
      g["Series/Pie/PieDataLabel.js"],
      g["Core/Series/DataLabel.js"],
      g["Core/Responsive.js"],
      g["Core/Color/Color.js"],
      g["Core/Time.js"],
    ],
    function (
      a,
      g,
      x,
      E,
      D,
      B,
      G,
      r,
      t,
      n,
      f,
      c,
      l,
      m,
      e,
      u,
      C,
      J,
      I,
      K,
      A,
      d,
      q,
      h,
      k,
      b,
      p,
      z,
      w,
      N,
      H,
      O,
      Q,
      S,
      Y,
    ) {
      a.animate = D.animate;
      a.animObject = D.animObject;
      a.getDeferredAnimation = D.getDeferredAnimation;
      a.setAnimation = D.setAnimation;
      a.stop = D.stop;
      a.timers = E.timers;
      a.AST = B;
      a.Axis = l;
      a.Chart = q;
      a.chart = q.chart;
      a.Fx = E;
      a.Legend = d;
      a.PlotLineOrBand = u;
      a.Point = I;
      a.Pointer = A.isRequired() ? A : K;
      a.Series = b;
      a.StackItem = k;
      a.SVGElement = t;
      a.SVGRenderer = n;
      a.Tick = C;
      a.Time = Y;
      a.Tooltip = J;
      a.Color = S;
      a.color = S.parse;
      c.compose(n);
      f.compose(t);
      a.defaultOptions = x.defaultOptions;
      a.getOptions = x.getOptions;
      a.time = x.defaultTime;
      a.setOptions = x.setOptions;
      a.dateFormat = G.dateFormat;
      a.format = G.format;
      a.numberFormat = G.numberFormat;
      a.addEvent = g.addEvent;
      a.arrayMax = g.arrayMax;
      a.arrayMin = g.arrayMin;
      a.attr = g.attr;
      a.clearTimeout = g.clearTimeout;
      a.correctFloat = g.correctFloat;
      a.createElement = g.createElement;
      a.css = g.css;
      a.defined = g.defined;
      a.destroyObjectProperties = g.destroyObjectProperties;
      a.discardElement = g.discardElement;
      a.distribute = r.distribute;
      a.erase = g.erase;
      a.error = g.error;
      a.extend = g.extend;
      a.extendClass = g.extendClass;
      a.find = g.find;
      a.fireEvent = g.fireEvent;
      a.getMagnitude = g.getMagnitude;
      a.getStyle = g.getStyle;
      a.inArray = g.inArray;
      a.isArray = g.isArray;
      a.isClass = g.isClass;
      a.isDOMElement = g.isDOMElement;
      a.isFunction = g.isFunction;
      a.isNumber = g.isNumber;
      a.isObject = g.isObject;
      a.isString = g.isString;
      a.keys = g.keys;
      a.merge = g.merge;
      a.normalizeTickInterval = g.normalizeTickInterval;
      a.objectEach = g.objectEach;
      a.offset = g.offset;
      a.pad = g.pad;
      a.pick = g.pick;
      a.pInt = g.pInt;
      a.relativeLength = g.relativeLength;
      a.removeEvent = g.removeEvent;
      a.seriesType = p.seriesType;
      a.splat = g.splat;
      a.stableSort = g.stableSort;
      a.syncTimeout = g.syncTimeout;
      a.timeUnits = g.timeUnits;
      a.uniqueKey = g.uniqueKey;
      a.useSerialIds = g.useSerialIds;
      a.wrap = g.wrap;
      w.compose(z);
      O.compose(b);
      m.compose(l);
      e.compose(l);
      H.compose(N);
      u.compose(l);
      Q.compose(q);
      h.compose(l, q, b);
      return a;
    },
  );
  g["masters/highcharts.src.js"]._modules = g;
  return g["masters/highcharts.src.js"];
});
//# sourceMappingURL=highcharts.js.map
