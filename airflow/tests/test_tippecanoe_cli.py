import subprocess

import pytest


def test_missing_command_is_not_available():
    """
    Teste qu'une commande inexistante retourne une erreur FileNotFoundError
    """

    command_not_found = False

    try:
        subprocess.run(["not_a_command"], check=True)
    except FileNotFoundError:
        command_not_found = True

    if not command_not_found:
        pytest.fail("La commande not_a_command n'a pas retourné d'erreur")


def test_tippecanoe_cli_is_available():
    """
    Teste si le cli tippecanoe est disponible depuis la commande tippecanoe
    """
    try:
        subprocess.run(["tippecanoe", "--help"], check=True)
    except FileNotFoundError:
        pytest.fail("La commande tippecanoe n'est pas disponible")
    except subprocess.CalledProcessError as e:
        pytest.fail(f"La commande tippecanoe a retourné une erreur: {e}")
