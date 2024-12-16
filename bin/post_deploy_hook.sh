#!/bin/sh

echo "python=$(python --version)"
echo "django=$(python -m django --version)"

export LD_LIBRARY_PATH=/build/${REQUEST_ID}/.apt/usr/lib/x86_64-linux-gnu/blas/:/build/${REQUEST_ID}/.apt/usr/lib/x86_64-linux-gnu/lapack/:${LD_LIBRARY_PATH}
export PROJ_LIB=/build/${REQUEST_ID}/.apt/usr/share/proj

python manage.py migrate users
python manage.py migrate
python manage.py load_param --no-update --file required_parameters.json
python manage.py clear_cache
python manage.py maintenance --off
python manage.py mattermost --msg "${APP} déploiement quasiment terminé, ${DOMAIN_URL}" --channel "${MATTER_DEV_CHANNEL}"
