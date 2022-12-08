/*
 Highcharts JS v10.3.2 (2022-11-28)

 Dependency wheel module

 (c) 2010-2021 Torstein Honsi

 License: www.highcharts.com/license
*/
(function(b){"object"===typeof module&&module.exports?(b["default"]=b,module.exports=b):"function"===typeof define&&define.amd?define("highcharts/modules/dependency-wheel",["highcharts","highcharts/modules/sankey"],function(c){b(c);b.Highcharts=c;return b}):b("undefined"!==typeof Highcharts?Highcharts:void 0)})(function(b){function c(b,f,c,g){b.hasOwnProperty(f)||(b[f]=g.apply(null,c),"function"===typeof CustomEvent&&window.dispatchEvent(new CustomEvent("HighchartsModuleLoaded",{detail:{path:f,module:b[f]}})))}
b=b?b._modules:{};c(b,"Series/DependencyWheel/DependencyWheelPoint.js",[b["Core/Series/SeriesRegistry.js"],b["Core/Utilities.js"]],function(b,c){var f=this&&this.__extends||function(){var b=function(e,a){b=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a}||function(b,a){for(var e in a)a.hasOwnProperty(e)&&(b[e]=a[e])};return b(e,a)};return function(e,a){function c(){this.constructor=e}b(e,a);e.prototype=null===a?Object.create(a):(c.prototype=a.prototype,new c)}}(),
g=c.wrap;return function(b){function e(){var a=null!==b&&b.apply(this,arguments)||this;a.angle=void 0;a.fromNode=void 0;a.index=void 0;a.linksFrom=void 0;a.linksTo=void 0;a.options=void 0;a.series=void 0;a.shapeArgs=void 0;a.toNode=void 0;return a}f(e,b);e.prototype.getDataLabelPath=function(b){var a=this,e=this.series.chart.renderer,c=this.shapeArgs,f=0>this.angle||this.angle>Math.PI,k=c.start||0,p=c.end||0;this.dataLabelPath?(this.dataLabelPath=this.dataLabelPath.destroy(),delete this.dataLabelPath):
g(b,"destroy",function(c){a.dataLabelPath&&(a.dataLabelPath=a.dataLabelPath.destroy());return c.call(b)});return this.dataLabelPath=e.arc({open:!0,longArc:Math.abs(Math.abs(k)-Math.abs(p))<Math.PI?0:1}).attr({x:c.x,y:c.y,r:c.r+(this.dataLabel.options.distance||0),start:f?k:p,end:f?p:k,clockwise:+f}).add(e.defs)};e.prototype.isValid=function(){return!0};return e}(b.seriesTypes.sankey.prototype.pointClass)});c(b,"Series/DependencyWheel/DependencyWheelSeriesDefaults.js",[],function(){"";return{center:[null,
null],curveFactor:.6,startAngle:0,dataLabels:{textPath:{enabled:!1,attributes:{dy:5}}}}});c(b,"Series/DependencyWheel/DependencyWheelSeries.js",[b["Core/Animation/AnimationUtilities.js"],b["Series/DependencyWheel/DependencyWheelPoint.js"],b["Series/DependencyWheel/DependencyWheelSeriesDefaults.js"],b["Core/Globals.js"],b["Series/Sankey/SankeyColumnComposition.js"],b["Core/Series/SeriesRegistry.js"],b["Core/Utilities.js"]],function(b,c,r,g,t,e,a){var f=this&&this.__extends||function(){var b=function(a,
c){b=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(b,a){b.__proto__=a}||function(b,a){for(var c in a)a.hasOwnProperty(c)&&(b[c]=a[c])};return b(a,c)};return function(a,c){function q(){this.constructor=a}b(a,c);a.prototype=null===c?Object.create(c):(q.prototype=c.prototype,new q)}}(),u=b.animObject,v=g.deg2rad;g=e.seriesTypes;b=g.pie;var n=g.sankey;g=a.extend;var k=a.merge;a=function(b){function a(){var a=null!==b&&b.apply(this,arguments)||this;a.data=void 0;a.options=void 0;a.nodeColumns=
void 0;a.nodes=void 0;a.points=void 0;return a}f(a,b);a.prototype.animate=function(a){if(!a){var b=u(this.options.animation).duration/2/this.nodes.length;this.nodes.forEach(function(a,c){var e=a.graphic;e&&(e.attr({opacity:0}),setTimeout(function(){a.graphic&&a.graphic.animate({opacity:1},{duration:b})},b*c))},this);this.points.forEach(function(a){var b=a.graphic;!a.isNode&&b&&b.attr({opacity:0}).animate({opacity:1},this.options.animation)},this)}};a.prototype.createNode=function(a){var b=n.prototype.createNode.call(this,
a);b.getSum=function(){return b.linksFrom.concat(b.linksTo).reduce(function(b,a){return b+a.weight},0)};b.offset=function(a){function c(a){return a.fromNode===b?a.toNode:a.fromNode}var e=0,d,h=b.linksFrom.concat(b.linksTo);h.sort(function(a,b){return c(a).index-c(b).index});for(d=0;d<h.length;d++)if(c(h[d]).index>b.index){h=h.slice(0,d).reverse().concat(h.slice(d).reverse());var f=!0;break}f||h.reverse();for(d=0;d<h.length;d++){if(h[d]===a)return e;e+=h[d].weight}};return b};a.prototype.createNodeColumns=
function(){var a=[t.compose([],this)];this.nodes.forEach(function(b){b.column=0;a[0].push(b)});return a};a.prototype.getNodePadding=function(){return this.options.nodePadding/Math.PI};a.prototype.translate=function(){var a=this.options,b=2*Math.PI/(this.chart.plotHeight+this.getNodePadding()),c=this.getCenter(),e=(a.startAngle-90)*v;n.prototype.translate.call(this);this.nodeColumns[0].forEach(function(f){if(f.sum){var d=f.shapeArgs,h=c[0],g=c[1],k=c[2]/2,l=k-a.nodeWidth,m=e+b*(d.y||0);d=e+b*((d.y||
0)+(d.height||0));f.angle=m+(d-m)/2;f.shapeType="arc";f.shapeArgs={x:h,y:g,r:k,innerR:l,start:m,end:d};f.dlBox={x:h+Math.cos((m+d)/2)*(k+l)/2,y:g+Math.sin((m+d)/2)*(k+l)/2,width:1,height:1};f.linksFrom.forEach(function(c){if(c.linkBase){var f,d=c.linkBase.map(function(d,k){d*=b;var m=Math.cos(e+d)*(l+1),n=Math.sin(e+d)*(l+1),p=a.curveFactor||0;f=Math.abs(c.linkBase[3-k]*b-d);f>Math.PI&&(f=2*Math.PI-f);f*=l;f<l&&(p*=f/l);return{x:h+m,y:g+n,cpX:h+(1-p)*m,cpY:g+(1-p)*n}});c.shapeArgs={d:[["M",d[0].x,
d[0].y],["A",l,l,0,0,1,d[1].x,d[1].y],["C",d[1].cpX,d[1].cpY,d[2].cpX,d[2].cpY,d[2].x,d[2].y],["A",l,l,0,0,1,d[3].x,d[3].y],["C",d[3].cpX,d[3].cpY,d[0].cpX,d[0].cpY,d[0].x,d[0].y]]}}})}})};a.defaultOptions=k(n.defaultOptions,r);return a}(n);g(a.prototype,{orderNodes:!1,getCenter:b.prototype.getCenter});a.prototype.pointClass=c;e.registerSeriesType("dependencywheel",a);return a});c(b,"masters/modules/dependency-wheel.src.js",[],function(){})});
//# sourceMappingURL=dependency-wheel.js.map
