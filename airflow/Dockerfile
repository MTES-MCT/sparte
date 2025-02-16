FROM quay.io/astronomer/astro-runtime:12.6.0-base

# Switch to root for setup
USER root

# Install system packages if listed in packages.txt
COPY packages.txt .
RUN /usr/local/bin/install-system-packages

# Install Python dependencies
COPY requirements.txt .
RUN /usr/local/bin/install-python-dependencies

# Install tippecanoe
RUN git clone https://github.com/felt/tippecanoe.git /home/astro/tippecanoe --depth 1 --branch 2.75.1
WORKDIR /home/astro/tippecanoe
RUN make && make install
USER astro
WORKDIR /usr/local/airflow

# Configure dbt

RUN mkdir /home/astro/.dbt
COPY ./dbt_profile.yml /home/astro/.dbt/profiles.yml

# Copy project into image
COPY --chown=astro:0 . .
