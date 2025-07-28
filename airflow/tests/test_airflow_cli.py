import subprocess

import pytest


def test_airflow_cli():
    """
    Teste si le cli airflow est disponible
    """
    try:
        subprocess.run(["airflow", "--help"], check=True)
    except FileNotFoundError:
        pytest.fail("La commande airflow n'est pas disponible")
    except subprocess.CalledProcessError as e:
        pytest.fail(f"La commande airflow a retourné une erreur: {e}")
