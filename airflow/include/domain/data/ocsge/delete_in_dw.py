from typing import List


def delete_occupation_du_sol_in_dw_sql(
    departement: str,
    years: List[str],
) -> str:
    return f"""
        DELETE FROM public.ocsge_occupation_du_sol
        WHERE departement = '{departement}'
        AND year = {years[0]}
    """


def delete_zone_construite_in_dw_sql(
    departement: str,
    years: List[str],
) -> str:
    return f"""
        DELETE FROM public.ocsge_zone_construite
        WHERE departement = '{departement}'
        AND year = {years[0]}
    """


def delete_difference_in_dw_sql(
    departement: str,
    years: List[str],
) -> str:
    return f"""
        DELETE FROM public.ocsge_difference
        WHERE departement = '{departement}'
        AND year_old = {years[0]}
        AND year_new = {years[1]}
    """
