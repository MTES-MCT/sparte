""" Contains all logic to create a project """
from typing import List

import celery

from public_data.models import AdminRef, Land
from users.models import User

from .project_base import Project


def create_from_public_key(
    public_key: str,
    start: str = "2011",
    end: str = "2020",
    user: User | None = None,
) -> Project:
    """Create a project from one only public_key"""
    from project import tasks as t

    land = Land(public_key)
    level = AdminRef.get_analysis_default_level(public_key.split("_")[0])
    project = Project(
        name=f"Diagnostic de {land.name}",
        is_public=True,
        analyse_start_date=start,
        analyse_end_date=end,
        level=level,
        land_ids=str(land.id),
        land_type=land.land_type,
        territory_name=land.name,
        user=user if user and user.is_authenticated else None,
    )
    project._change_reason = "create_from_public_key"
    project.set_success(save=True)

    # use celery to speedup user experience
    celery.chain(
        t.add_city_and_set_combined_emprise.si(project.id, public_key),
        celery.group(
            t.find_first_and_last_ocsge.si(project.id),
            t.add_neighboors.si(project.id),
        ),
        celery.group(
            t.generate_cover_image.si(project.id),
            t.generate_theme_map_conso.si(project.id),
            t.generate_theme_map_artif.si(project.id),
            t.generate_theme_map_understand_artif.si(project.id),
        ),
    ).apply_async()

    return project


def create_from_public_key_list(
    public_key_list: List[str],
    start: str = "2011",
    end: str = "2020",
    user: User | None = None,
) -> Project:
    """Create a project from a list of public_keys"""

    raise NotImplementedError("TODO update code when used")  # NOSONAR

    from project import tasks as t

    # if there is on ly one public_key, use the dedicated function
    if len(public_key_list) == 1:
        return create_from_public_key(public_key_list[0], start=start, end=end, user=user)

    lands = Land.get_lands(public_key_list)
    land_type = AdminRef.get_admin_level({p.split("_")[0] for p in public_key_list})

    project = Project(
        name="Diagnostic de plusieurs communes",
        is_public=True,
        analyse_start_date=start,
        analyse_end_date=end,
        level=AdminRef.get_analysis_default_level(land_type),
        land_ids=",".join(str(_.id) for _ in lands),
        land_type=land_type,
        territory_name="territoire composite",
        user=user,
    )
    project.set_success(save=True)

    # use celery to speedup user experience
    jobs = [
        t.generate_cover_image.si(project.id),
        t.find_first_and_last_ocsge.si(project.id),
    ]
    if project.land_type != AdminRef.COMPOSITE:
        # insert in jobs list before cover generation
        jobs.append(t.add_neighboors.si(project.id))

    celery.chain(
        t.add_city_and_set_combined_emprise.si(project.id, "-".join(public_key_list)),
        celery.group(jobs),
    ).apply_async()

    return project
