FROM quay.io/astronomer/astro-runtime:12.6.0

# Install tippecanoe
RUN git clone https://github.com/mapbox/tippecanoe.git /home/astro/tippecanoe
USER root
WORKDIR /home/astro/tippecanoe
RUN make && make install
USER astro
WORKDIR /usr/local/airflow

# Configure dbt

RUN mkdir /home/astro/.dbt
COPY ./dbt_profile.yml /home/astro/.dbt/profiles.yml
