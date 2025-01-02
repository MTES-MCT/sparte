import subprocess

import pytest


def test_ogr2ogr_cli_is_available():
    """
    Teste si le cli ogr2ogr est disponible depuis la commande ogr2ogr
    """
    try:
        subprocess.run(["ogr2ogr", "--version"], check=True)
        # ogr2ogr --help n'est pas utilisé car la commande retourne 1
    except FileNotFoundError:
        pytest.fail("La commande ogr2ogr n'est pas disponible")
    except subprocess.CalledProcessError as e:
        pytest.fail(f"La commande ogr2ogr a retourné une erreur: {e}")
