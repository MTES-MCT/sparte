isort -q .
black -q .
flake8 .
pylint .
mypy .
pytest -qq .
# bandit -c pyproject.toml -r .
