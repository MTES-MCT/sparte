"""
Verrouille la triple déclaration des copies du dag `update_app`.

Chaque table copiée vers l'application est déclarée à trois endroits du même fichier :

1. une fonction `copy_public_data_…` décorée par `@task.python`, qui fait la copie ;
2. son appel dans la liste `copy_tasks`, qui place la tâche entre le branchement et la
   bascule de schéma ;
3. son nom dans la valeur par défaut du paramètre `tasks`, que le branchement
   `copy_public_data_branch` renvoie tel quel.

Rien ne relie ces trois listes à l'exécution, et un oubli ne lève aucune erreur à
l'import du dag : une fonction absente de `copy_tasks` n'est jamais exécutée, une tâche
absente du paramètre est ignorée par un run lancé avec les valeurs par défaut (la table
de l'application n'est alors plus rafraîchie, sans échec visible), et un nom du paramètre
sans tâche fait échouer le branchement en plein run.

Les trois listes sont lues dans le code source, sans exécuter le dag.
"""

import ast
from collections import Counter
from pathlib import Path

DAG_FILE = Path(__file__).resolve().parents[1] / "dags" / "update_app.py"
DAG_FUNCTION = "update_app"
COPY_PREFIX = "copy_public_data_"


def _dag_function() -> ast.FunctionDef:
    module = ast.parse(DAG_FILE.read_text(encoding="utf-8"))
    return next(node for node in module.body if isinstance(node, ast.FunctionDef) and node.name == DAG_FUNCTION)


def _is_python_task(function: ast.FunctionDef) -> bool:
    """Vrai pour une fonction décorée par `@task.python`, avec ou sans arguments."""
    for decorator in function.decorator_list:
        target = decorator.func if isinstance(decorator, ast.Call) else decorator
        if ast.unparse(target) == "task.python":
            return True
    return False


def defined_copies() -> list[str]:
    """Fonctions de copie définies dans le dag (le branchement, décoré par `@task.branch`, n'en est pas une)."""
    return [
        node.name
        for node in _dag_function().body
        if isinstance(node, ast.FunctionDef) and node.name.startswith(COPY_PREFIX) and _is_python_task(node)
    ]


def scheduled_copies() -> list[str]:
    """Fonctions appelées dans la liste `copy_tasks`."""
    for node in _dag_function().body:
        if isinstance(node, ast.Assign) and [ast.unparse(target) for target in node.targets] == ["copy_tasks"]:
            return [ast.unparse(call.func) for call in node.value.elts]
    raise AssertionError("Liste copy_tasks introuvable dans le dag update_app")


def default_copies() -> list[str]:
    """Valeur par défaut du paramètre `tasks` du dag."""
    for decorator in _dag_function().decorator_list:
        if not (isinstance(decorator, ast.Call) and ast.unparse(decorator.func) == "dag"):
            continue
        params = next(keyword.value for keyword in decorator.keywords if keyword.arg == "params")
        tasks = next(value for key, value in zip(params.keys, params.values) if ast.literal_eval(key) == "tasks")
        default = next(keyword.value for keyword in tasks.keywords if keyword.arg == "default")
        return ast.literal_eval(default)
    raise AssertionError("Paramètre tasks introuvable dans le décorateur du dag update_app")


def _duplicates(names: list[str]) -> list[str]:
    return [name for name, count in Counter(names).items() if count > 1]


def test_le_dag_declare_des_copies():
    """Garde contre une lecture du code source qui ne trouverait plus rien (les autres tests passeraient à vide)."""
    assert len(defined_copies()) > 50
    assert "copy_public_data_land" in defined_copies()
    assert "copy_public_data_branch" not in defined_copies()


def test_chaque_copie_definie_est_planifiee():
    """Une fonction de copie absente de `copy_tasks` n'est jamais exécutée."""
    assert set(defined_copies()) - set(scheduled_copies()) == set()


def test_chaque_copie_planifiee_est_une_fonction_de_copie():
    assert set(scheduled_copies()) - set(defined_copies()) == set()


def test_chaque_copie_definie_est_lancee_par_defaut():
    """Une copie absente du paramètre `tasks` est ignorée par un run lancé sans paramètres."""
    assert set(defined_copies()) - set(default_copies()) == set()


def test_chaque_copie_lancee_par_defaut_existe():
    """Un nom du paramètre `tasks` sans tâche fait échouer le branchement pendant le run."""
    assert set(default_copies()) - set(defined_copies()) == set()


def test_aucune_copie_n_est_declaree_deux_fois():
    assert _duplicates(defined_copies()) == []
    assert _duplicates(scheduled_copies()) == []
    assert _duplicates(default_copies()) == []
