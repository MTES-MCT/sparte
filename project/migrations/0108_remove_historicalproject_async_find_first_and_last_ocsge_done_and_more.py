# Generated by Django 4.2.19 on 2025-03-27 11:08

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("public_data", "0197_delete_artificialarea_delete_landpopcomparison_and_more"),
        ("project", "0107_remove_historicalproject_async_theme_map_fill_gpu_done_and_more"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="historicalproject",
            name="async_find_first_and_last_ocsge_done",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="async_generate_theme_map_artif_done",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="async_ocsge_coverage_status_done",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="async_theme_map_understand_artif_done",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="available_millesimes",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="first_year_ocsge",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="last_year_ocsge",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="ocsge_coverage_status",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="theme_map_artif",
        ),
        migrations.RemoveField(
            model_name="historicalproject",
            name="theme_map_understand_artif",
        ),
        migrations.RemoveField(
            model_name="project",
            name="async_find_first_and_last_ocsge_done",
        ),
        migrations.RemoveField(
            model_name="project",
            name="async_generate_theme_map_artif_done",
        ),
        migrations.RemoveField(
            model_name="project",
            name="async_ocsge_coverage_status_done",
        ),
        migrations.RemoveField(
            model_name="project",
            name="async_theme_map_understand_artif_done",
        ),
        migrations.RemoveField(
            model_name="project",
            name="available_millesimes",
        ),
        migrations.RemoveField(
            model_name="project",
            name="first_year_ocsge",
        ),
        migrations.RemoveField(
            model_name="project",
            name="last_year_ocsge",
        ),
        migrations.RemoveField(
            model_name="project",
            name="ocsge_coverage_status",
        ),
        migrations.RemoveField(
            model_name="project",
            name="theme_map_artif",
        ),
        migrations.RemoveField(
            model_name="project",
            name="theme_map_understand_artif",
        ),
    ]
