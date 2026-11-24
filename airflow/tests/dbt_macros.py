"""Lecture, depuis les tests pytest, de constantes définies dans des macros dbt."""

from pathlib import Path

import jinja2


def evaluate_dbt_list_macro(macros_dir: Path, macro_name: str) -> list:
    """
    Évalue une macro dbt sans argument qui retourne une liste, définie dans le fichier
    `<macro_name>.sql` du dossier `macros_dir`.

    Elle sert à comparer une constante d'un dag à sa définition côté dbt, lue par les modèles
    et par leurs tests de données.
    """
    returned_values = []
    environment = jinja2.Environment(loader=jinja2.FileSystemLoader(macros_dir))
    # `return` est fourni par dbt, pas par Jinja : on capte ici la valeur qu'il reçoit
    environment.globals["return"] = returned_values.append
    getattr(environment.get_template(f"{macro_name}.sql").module, macro_name)()
    (returned_value,) = returned_values
    return returned_value
