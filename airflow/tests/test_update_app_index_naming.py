"""
Teste le nommage des index du dag `update_app`.

Ces noms portent une contrainte que la bascule de schéma rend critique : ils doivent
être identiques dans `app_swap` et dans `public`. `ALTER TABLE ... SET SCHEMA` déplace
l'index avec sa table, donc un nom qui dépendrait du schéma resterait collé à la table
publiée et changerait d'un run à l'autre.

Deuxième contrainte, indépendante : Postgres tronque silencieusement tout identifiant
au-delà de 63 octets. Deux index distincts d'une même table peuvent alors se retrouver
sous le même nom, et `CREATE INDEX IF NOT EXISTS` n'en crée qu'un.
"""

from dags.update_app import (
    POSTGRES_MAX_IDENTIFIER_LENGTH,
    get_btree_index_request,
    get_index_name,
)

# La table au nom le plus long du dag, avec deux jeux de colonnes qui dépassent tous
# les deux la limite Postgres une fois concaténés.
TABLE_LONGUE = "public_data_landimperfluxusagecompositionindex"
COLONNES_MILLESIMES = ["millesime_old_index", "millesime_new_index"]
COLONNES_LAND = ["land_id", "land_type"]


def test_le_nom_reprend_la_table_et_ses_colonnes():
    assert (
        get_index_name("app_swap.public_data_landconso", ["land_id", "land_type", "year"])
        == "public_data_landconso_land_id_land_type_year_idx"
    )


def test_le_nom_ne_depend_pas_du_schema():
    """L'invariant dont dépend la bascule : le SET SCHEMA ne doit rien avoir à renommer."""
    colonnes = ["land_id", "land_type", "year"]
    assert get_index_name(f"app_swap.{TABLE_LONGUE}", colonnes) == get_index_name(f"public.{TABLE_LONGUE}", colonnes)


def test_un_nom_court_est_laisse_intact():
    nom = get_index_name("app_swap.public_data_landconso", ["land_id"])
    assert nom == "public_data_landconso_land_id_idx"
    assert len(nom) <= POSTGRES_MAX_IDENTIFIER_LENGTH


def test_un_nom_de_63_caracteres_n_est_pas_tronque():
    """Cas limite : à exactement 63 octets Postgres ne tronque pas, nous non plus."""
    colonne = "c" * 45
    nom = get_index_name("app_swap.public_data_x", [colonne])
    assert nom == f"public_data_x_{colonne}_idx"
    assert len(nom) == POSTGRES_MAX_IDENTIFIER_LENGTH


def test_un_nom_trop_long_est_ramene_a_la_limite():
    nom = get_index_name(f"app_swap.{TABLE_LONGUE}", COLONNES_MILLESIMES)
    assert len(nom) == POSTGRES_MAX_IDENTIFIER_LENGTH
    assert nom.startswith(TABLE_LONGUE)


def test_deux_index_tronques_de_la_meme_table_gardent_des_noms_distincts():
    """Sans le suffixe, les deux noms se réduiraient au même préfixe de 63 octets."""
    millesimes = get_index_name(f"app_swap.{TABLE_LONGUE}", COLONNES_MILLESIMES)
    land = get_index_name(f"app_swap.{TABLE_LONGUE}", COLONNES_LAND)
    assert millesimes != land


def test_le_nom_tronque_est_stable_d_un_appel_a_l_autre():
    """Le run N+1 doit recréer l'index sous le nom exact que le run N a publié."""
    premier = get_index_name(f"app_swap.{TABLE_LONGUE}", COLONNES_MILLESIMES)
    second = get_index_name(f"app_swap.{TABLE_LONGUE}", COLONNES_MILLESIMES)
    assert premier == second == "public_data_landimperfluxusagecompositionindex_millesi_7ffbd8fa"


def test_la_requete_cree_un_btree_idempotent():
    assert get_btree_index_request("app_swap.public_data_landconso", ["land_id", "land_type", "year"]) == (
        "CREATE INDEX IF NOT EXISTS public_data_landconso_land_id_land_type_year_idx "
        "ON app_swap.public_data_landconso USING btree (land_id, land_type, year);"
    )


def test_la_requete_qualifie_la_table_mais_pas_l_index():
    """Un nom d'index est unique par schéma : il ne se qualifie pas, la table si."""
    requete = get_btree_index_request("public.public_data_landconso", ["land_id"])
    assert "ON public.public_data_landconso " in requete
    assert "IF NOT EXISTS public_data_landconso_land_id_idx " in requete


def test_la_requete_reprend_le_nom_tronque_pour_les_tables_longues():
    requete = get_btree_index_request(f"app_swap.{TABLE_LONGUE}", COLONNES_MILLESIMES)
    nom = get_index_name(f"app_swap.{TABLE_LONGUE}", COLONNES_MILLESIMES)
    assert f"CREATE INDEX IF NOT EXISTS {nom} ON app_swap.{TABLE_LONGUE} " in requete
    assert len(nom) == POSTGRES_MAX_IDENTIFIER_LENGTH
