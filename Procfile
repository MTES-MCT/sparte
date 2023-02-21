web: bash bin/start.sh
celeryworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1
