#!/bin/bash

# This script is designed to initialize the review app database with data from the staging database.
# It is executed by Scalingo after the build of the review app (see scalingo.json:scripts).
# Make sure that the SPARTE-STAGING's environment variables include:
# STAGING_DATABASE_URL, which should contain the connection string to the staging database.


# Ensure the APP environment variable is set, otherwise exit with an error message
: "${APP?Need to set APP}"
echo "APP=$APP"

# Ensure the STAGING_DATABASE_URL environment variable is set, otherwise exit with an error message
: "${STAGING_DATABASE_URL?STAGING_DATABASE_URL is not set}"
echo "STAGING_DATABASE_UR is set"

# Check if the APP variable contains the substring "-pr". If not, print a message and exit
if [[ $APP != *-pr* ]]; then
    echo "Not a PR"
    exit 1
fi
echo "Inside PR detected"


install-scalingo-cli

# Get pg_dump cli of the same version as the database (14.10 when I write this comment)
# see https://doc.scalingo.com/platform/databases/access
echo "Get postgresql client"
dbclient-fetcher pgsql 14.10
psql_version=$(psql --version | awk '{print $3}')
echo "psql version=$psql_version"

# if [ "$psql_version" != 14.10 ]; then
#     echo "Erreur : La version de psql est ${psql_version}, mais la version 14.10 est requise."
#     exit 2
# fi


echo "Drop all tables"
# Drop all tables in the 'public' schema of the database specified by DATABASE_URL
psql -t -c "select 'drop table if exists \"' || tablename || '\" cascade;'
            from pg_tables
            where schemaname = 'public'; " $DATABASE_URL | psql $DATABASE_URL


# echo "Dump and restore at once"
# Dump the staging database and restore it to the target database
# -x: Do not dump any privilege information
# -O: Do not set ownership for the dumped objects
# --if-exists: Use conditional statements to drop objects if they exist
# --clean: Clean (drop) database objects before recreating them
# pg_dump -x -O --if-exists --clean $STAGING_DATABASE_URL | psql $DATABASE_URL


# below not working either
# scalingo command is not found
scalingo login --api-token "${DUPLICATE_API_TOKEN}"

addon_id="$( scalingo --app sparte-staging addons | grep PostgreSQL | cut -d "|" -f 3 | tr -d " " )"
echo "Found addon_id=${addon_id}"

echo "Download backup (could take a while)"
scalingo --app sparte-staging --addon "${addon_id}" backups-download --output dump.tar.gz
echo "Extract backup"
mkdir /app/dump
tar --extract --verbose --file=dump.tar.gz --directory="/app/dump"
backup_file_name=$(ls "/app/dump")
echo "Found backup_file_name=${backup_file_name}"

tar --extract --verbose --file=dump.tar.gz --directory="/app/"

pg_restore --clean --if-exists --no-owner --no-privileges --no-comments --dbname "${DATABASE_URL}" "/app/dump/${backup_file_name}"

echo "Trigger classical post deployment script"
# Source and execute the post_compile script from the bin/ directory
# The post_compile script includes data migrations and all other deployment tasks
source bin/post_deploy_hook.sh
