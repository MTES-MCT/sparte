#!/bin/bash

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

echo "Get postgresql client"

# temp fix while scalingo fix it
export PATH=/app/bin:$PATH

dbclient-fetcher postgresql 15
psql_version=$(psql --version | awk '{print $3}')
echo "psql version=$psql_version"

echo "Drop all tables"
# Drop all tables in the 'public' schema of the database specified by DATABASE_URL
psql -t -c "select 'drop table if exists \"' || tablename || '\" cascade;'
            from pg_tables
            where schemaname = 'public'; " $DATABASE_URL | psql $DATABASE_URL


echo "Dump and restore at once"
# Dump the staging database and restore it to the target database
# -x: Do not dump any privilege information
# -O: Do not set ownership for the dumped objects
# --if-exists: Use conditional statements to drop objects if they exist
# --clean: Clean (drop) database objects before recreating them
pg_dump -x -O --if-exists --clean $STAGING_DATABASE_URL | psql $DATABASE_URL
echo "Trigger classical post deployment script"
source bin/post_deploy_hook.sh
