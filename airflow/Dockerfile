FROM astrocrpublic.azurecr.io/runtime:3.1-22-base

# Switch to root for setup
USER root

# Install system packages if listed in packages.txt
COPY packages.txt .
RUN /usr/local/bin/install-system-packages

# Install Python dependencies
COPY requirements.txt .
RUN /usr/local/bin/install-python-dependencies

# Retrait du plugin Astronomer (astronomer-runtime-extensions) : il n'apporte que
# l'habillage et la télémétrie du cloud Astronomer, inutilisés ici, et son middleware
# réécrit les réponses HTML sans en conserver le statut ni les en-têtes, ce qui casse
# les redirections de connexion Flask-AppBuilder (OAuth GitHub).
RUN uv pip uninstall astronomer-runtime-extensions

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
