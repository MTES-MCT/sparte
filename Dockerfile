# cmd: docker build . --build-arg stage=development
# cmd: docker-compose build --build-arg stage=development
# can be 'development' or 'production'
ARG stage

FROM python:3.9.7

ENV STAGE=$stage

LABEL maintainer="swann.bouviermuller@gmail.com"
LABEL vendor="Innov & Code"

# Setup GDAL
RUN apt update
RUN apt install -y binutils libproj-dev gdal-bin

# copy all the app
COPY . ./app

WORKDIR /app

# upgrade pip
RUN pip install --upgrade pip
# install pipenv
RUN pip install pipenv
# install project dependencies
RUN pipenv install $(test "$STAGE" == production || echo "--dev") --deploy --system --ignore-pipfile

EXPOSE 8000

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]
