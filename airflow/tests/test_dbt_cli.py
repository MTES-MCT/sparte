import subprocess

import pytest


def test_dbt_cli_is_available():
    """
    Teste si le cli dbt est disponible depuis la commande dbt
    """
    try:
        subprocess.run(["dbt", "--help"], check=True)
    except FileNotFoundError:
        pytest.fail("La commande dbt n'est pas disponible")
    except subprocess.CalledProcessError as e:
        pytest.fail(f"La commande dbt a retourné une erreur: {e}")
