# scalingo-highcharts-export-server

Deploy an highcharts export server v3 on scalingo.

This repository contains:

* Scalingo configuration and you can deploy simply linking this repo to your app
* Dockerfile to build and test locally

## Deploy on scalingo

Just link this repo to your app and trigger a deployment.


## Test locally

1. Build the image `docker build -t highchart-server .`
2. Run it `docker run -p 8080:8080 highchart-server`

You should be able to generate a graph with following command:

```
curl -H "Content-Type: application/json" -X POST -d '{"infile":{"title": {"text": "Steep Chart"}, "xAxis": {"categories": ["Jan", "Feb", "Mar"]}, "series": [{"data": [29.9, 71.5, 106.4]}]}}' 127.0.0.1:8080 -o mychart.png
```

## Usefull docs

* https://doc.scalingo.com/languages/nodejs/puppeteer
* https://stackoverflow.com/questions/6480549/install-dependencies-globally-and-locally-using-package-json

## cheat sheet

Push image to docker hub
```
docker login -u USERNAME
docker tag highchart-server swannbm/scalingo-highcharts-export-server
docker tag highchart-server swannbm/scalingo-highcharts-export-server:v3
docker tag highchart-server swannbm/scalingo-highcharts-export-server:latest
docker push swannbm/scalingo-highcharts-export-server
docker push swannbm/scalingo-highcharts-export-server:v3
docker push swannbm/scalingo-highcharts-export-server:latest
```
