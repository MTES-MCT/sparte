from typing import List


def delete_occupation_du_sol_in_app_sql(
    departement: str,
    years: List[str],
) -> str:
    return f"""
        DELETE FROM public.public_data_ocsge
        WHERE departement = '{departement}'
        AND year = {years[0]};
    """


def delete_zone_construite_in_app_sql(
    departement: str,
    years: List[str],
) -> str:
    return f"""
        DELETE FROM public.public_data_zoneconstruite
        WHERE departement = '{departement}'
        AND year = {years[0]};
    """


def delete_difference_in_app_sql(
    departement: str,
    years: List[str],
) -> str:
    return f"""
        DELETE FROM public.public_data_ocsgediff
        WHERE departement = '{departement}'
        AND year_old = {years[0]}
        AND year_new = {years[1]};
    """
