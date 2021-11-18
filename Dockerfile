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
# RUN pipenv install $(test "$STAGE" == production || echo "--dev") --deploy --system --ignore-pipfile
RUN pipenv install --dev --deploy --system --ignore-pipfile

# setup ssh for git
RUN mkdir -p /root/.ssh
COPY id_rsa /root/.ssh/id_rsa
RUN chmod 700 /root/.ssh/id_rsa
RUN ssh-keyscan -t rsa github.com > ~/.ssh/known_hosts

EXPOSE 8080

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]
