## Tests

Test issu du repo officiel. Génère une image contenant un line chart à la racine du projet.
```
curl -H "Content-Type: application/json" -X POST -d '{"infile":{"title": {"text": "Steep Chart"}, "xAxis": {"categories": ["Jan", "Feb", "Mar"]}, "series": [{"data": [29.9, 71.5, 106.4]}]}}' 127.0.0.1:8090 -o mychart.png
```

Second test avec un graphique plus compliqué

```
curl -H "Content-Type: application/json" -X POST -d '{"infile": {"title":{text: "super titre" }, yAxis: {title: {text:  "Consommé (en ha) "}}, xAxis: { type: "category", }, legend: { layout:  "horizontal ", align:  "center ", verticalAlign:  "top ",}, series: [{ name:  "Nantes Métropole ", data: [ { name: "2012", y: 64.7166 }, { name: "2013", y: 133.7179 }, { name: "2014", y: 109.6203 }, { name: "2015", y: 59.4789 }, { name: "2016", y: 48.4944 }, { name: "2017", y: 93.3875 }, ], }, { name:  "CA Laval Agglomération ", data: [ { name: "2012", y: 107.4478 }, { name: "2013", y: 56.7653 }, { name: "2014", y: 63.065 }, { name: "2015", y: 54.6932 }, { name: "2016", y: 78.836 }, { name: "2017", y: 48.5826 }, ], }, { name:  "Diagnostic de CU Angers Loire Métropole ", data: [ { name: "2012", y: 84.5439 }, { name: "2013", y: 86.1949 }, { name: "2014", y: 104.7843 }, { name: "2015", y: 56.691 }, { name: "2016", y: 76.1774 }, { name: "2017", y: 66.8953 }, ], color:  "#ff0000 ", dashStyle:  "ShortDash ", } ], }' 127.0.0.1:8090 -o ./highchart_export_serveur/test/test_2.png
```


curl -H "Content-Type: application/json" -X POST -d '{"infile": {"title": {"text": "super titre"},"series": [{"name":  "Nantes Métropole", "data": [{"name": "2012", "y": 64}, {"name": "2013", "y": 13}]}]}}' 127.0.0.1:8090 -o test_2.png


{"title": {"text": "super titre"},"series": [{"name":  "Nantes Métropole", "data": [{"name": "2012", "y": 64}, {"name": "2013", "y": 13}]}]}
