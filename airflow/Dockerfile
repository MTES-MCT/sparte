FROM quay.io/astronomer/astro-runtime:13.4.0-base

# Switch to root for setup
USER root

# Dépôt PostgreSQL officiel (PGDG) : Debian ne fournit que le client 15,
# or pg_dump doit être au moins de la version du serveur (16)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && install -d /usr/share/postgresql-common/pgdg \
    && curl -fsSL -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(. /etc/os-release && echo $VERSION_CODENAME)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && rm -rf /var/lib/apt/lists/*

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
