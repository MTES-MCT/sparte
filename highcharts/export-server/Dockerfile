# docker deployment of https://github.com/highcharts/node-export-server
# docker run -it --rm --name highcharts -p 8090:8090 highchart-export
# FROM node:14
FROM --platform=linux/amd64 node:23

ENV ACCEPT_HIGHCHARTS_LICENSE=1
ENV CHROME_DEVEL_SANDBOX /usr/local/sbin/chrome-devel-sandbox
ENV HIGHCHARTS_VERSION="11.4.7"

RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable libnss3 libxss1 fonts-liberation libappindicator3-1 xdg-utils \
    && rm -rf /var/lib/apt/lists/*

RUN npm install highcharts-export-server@5.0.0 -g --unsafe-perm

COPY . .

RUN npm install

EXPOSE 8080

WORKDIR /usr/share/fonts/truetype
ADD fonts/OpenSans-Regular.ttf OpenSans-Regular.ttf
ADD fonts/OpenSans-Light.ttf OpenSans-Light.ttf
ADD fonts/OpenSans-Semibold.ttf OpenSans-Semibold.ttf
ADD fonts/OpenSans-Bold.ttf OpenSans-Bold.ttf
ADD fonts/OpenSans-ExtraBold.ttf OpenSans-ExtraBold.ttf
ADD fonts/OpenSans-Italic.ttf OpenSans-Italic.ttf
ADD fonts/OpenSans-LightItalic.ttf OpenSans-LightItalic.ttf
ADD fonts/OpenSans-BoldItalic.ttf OpenSans-BoldItalic.ttf
ADD fonts/OpenSans-SemiboldItalic.ttf OpenSans-SemiboldItalic.ttf
ADD fonts/OpenSans-ExtraBoldItalic.ttf OpenSans-ExtraBoldItalic.ttf

CMD ["highcharts-export-server", "--enableServer", "1", "--port", "8080", "--host", "0.0.0.0", "--enableDebug"]
