""" Contains all logic to create a project """
from types import ModuleType
from typing import List

import celery

from project.models import Project
from public_data.models import AdminRef, Land
from users.models import User


def get_map_generation_tasks(project: Project, t: ModuleType) -> List[celery.Task]:
    """Return a list of tasks to generate maps according to project state"""
    return [
        getattr(t, task_name).si(project.id)
        for task_name, bool_field_name in [
            ("generate_cover_image", "async_cover_image_done"),
            ("generate_theme_map_conso", "async_generate_theme_map_conso_done"),
            ("generate_theme_map_artif", "async_generate_theme_map_artif_done"),
            ("generate_theme_map_understand_artif", "async_theme_map_understand_artif_done"),
            ("generate_theme_map_gpu", "async_theme_map_gpu_done"),
            ("generate_theme_map_fill_gpu", "async_theme_map_fill_gpu_done"),
        ]
        if getattr(project, bool_field_name) is False
    ]


def trigger_async_tasks(project: Project, public_key) -> None:
    # # use celery to speedup user experience
    # celery.chain(
    #     t.add_city.si(project.id, public_key),
    #     t.set_combined_emprise.si(project.id),
    #     celery.group(
    #         t.find_first_and_last_ocsge.si(project.id),
    #         t.add_neighboors.si(project.id),
    #     ),
    #     celery.group(
    #         t.generate_cover_image.si(project.id),
    #         t.generate_theme_map_conso.si(project.id),
    #         t.generate_theme_map_artif.si(project.id),
    #         t.generate_theme_map_understand_artif.si(project.id),
    #         t.generate_theme_map_gpu.si(project.id),
    #     ),
    #     # to not make user wait for other stuff, nuild metabase stat after all others tasks
    #     async_create_stat_for_project.si(project.id, do_location=True),
    # ).apply_async()
    from brevo.tasks import send_diagnostic_to_brevo
    from metabase.tasks import async_create_stat_for_project
    from project import tasks as t

    tasks_chain = []
    if not project.async_add_city_done:
        tasks_chain.append(t.add_city.si(project.id, public_key))
    if not project.async_set_combined_emprise_done:
        tasks_chain.append(t.set_combined_emprise.si(project.id))

    group_1 = []
    if not project.async_find_first_and_last_ocsge_done:
        group_1.append(t.find_first_and_last_ocsge.si(project.id))
    if not project.async_add_neighboors_done:
        group_1.append(t.add_neighboors.si(project.id))
    if group_1:
        tasks_chain.append(celery.group(*group_1))

    map_group = get_map_generation_tasks(project, t)
    if map_group:
        tasks_chain.append(celery.group(*map_group))

    # Exécution de la chaîne
    if tasks_chain:
        celery.chain(
            *tasks_chain,
            celery.group(
                async_create_stat_for_project.si(project.id, do_location=True),
                send_diagnostic_to_brevo.si(project.id),
            ),
        ).apply_async()


def create_from_public_key(
    public_key: str,
    start: str = "2009",
    end: str = "2021",
    user: User | None = None,
) -> Project:
    """Create a project from one only public_key"""

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

    trigger_async_tasks(project, public_key)

    return project


def create_from_public_key_list(
    public_key_list: List[str],
    start: str = "2011",
    end: str = "2021",
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
        t.add_city.si(project.id, "-".join(public_key_list)),
        t.set_combined_emprise.si(project.id),
        celery.group(jobs),
    ).apply_async()

    return project
