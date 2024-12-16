FROM quay.io/astronomer/astro-runtime:11.8.0

ENV DATA_DIR=data_tiles

RUN mkdir -p "$DATA_DIR"

# Install tippecanoe
RUN git clone https://github.com/mapbox/tippecanoe.git /home/astro/tippecanoe
USER root
WORKDIR /home/astro/tippecanoe
RUN make && make install
USER astro
WORKDIR /usr/local/airflow

RUN mkdir /home/astro/.dbt
COPY ./dbt_profile.yml /home/astro/.dbt/profiles.yml
