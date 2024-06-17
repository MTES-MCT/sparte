postdeploy: bash bin/post_deploy_hook.sh
web: bash bin/start.sh
celerydefaultworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1 --without-gossip
celerylongworker: celery --app=config.celery.app worker --loglevel=INFO --concurrency=4 --max-tasks-per-child=1 --without-gossip -Q long
celerybeat: celery --app=config.celery.app beat --loglevel=debug
