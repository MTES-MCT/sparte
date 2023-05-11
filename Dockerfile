FROM python:3.10

LABEL maintainer="swann.bouviermuller@gmail.com"
LABEL vendor="Innov & Code"

# Setup GDAL
RUN apt update
RUN apt install -y binutils libproj-dev gdal-bin libgdal-dev

# upgrade pip
RUN pip install --upgrade pip
RUN pip install debugpy -t /tmp
RUN pip install pipenv

RUN mkdir -p /app

# install project dependencies
# copy only pipfile to leverage docker cache
COPY Pipfile.lock Pipfile /app/
WORKDIR /app
RUN pipenv install --dev --deploy --system --ignore-pipfile

EXPOSE 8080

# usless, binding mount local folder in docker-compose
# COPY . /app

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]
