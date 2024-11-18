# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.contrib.gis.db import models


class AppParameterParameter(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.CharField(unique=True, max_length=40)
    value_type = models.CharField(max_length=3)
    description = models.TextField()
    value = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = "app_parameter_parameter"


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = "auth_group"


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey("AuthPermission", models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = "auth_group_permissions"
        unique_together = (("group", "permission"),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey("DjangoContentType", models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "auth_permission"
        unique_together = (("content_type", "codename"),)


class CrispCrispwebhooknotification(models.Model):
    id = models.BigAutoField(primary_key=True)
    event = models.CharField(max_length=255)
    timestamp = models.DateTimeField()
    data = models.JSONField()

    class Meta:
        managed = False
        db_table = "crisp_crispwebhooknotification"


class DiagnosticWordWordtemplate(models.Model):
    slug = models.CharField(primary_key=True, max_length=50)
    description = models.TextField()
    docx = models.CharField(max_length=100)
    last_update = models.DateTimeField()
    filename_mask = models.CharField(max_length=255)

    class Meta:
        managed = False
        db_table = "diagnostic_word_wordtemplate"


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey("DjangoContentType", models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey("UsersUser", models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = "django_admin_log"


class DjangoAppParameterParameter(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    slug = models.CharField(unique=True, max_length=40)
    value_type = models.CharField(max_length=3)
    description = models.TextField()
    value = models.CharField(max_length=250)
    is_global = models.BooleanField()

    class Meta:
        managed = False
        db_table = "django_app_parameter_parameter"


class DjangoCeleryResultsChordcounter(models.Model):
    group_id = models.CharField(unique=True, max_length=255)
    sub_tasks = models.TextField()
    count = models.IntegerField()

    class Meta:
        managed = False
        db_table = "django_celery_results_chordcounter"


class DjangoCeleryResultsGroupresult(models.Model):
    group_id = models.CharField(unique=True, max_length=255)
    date_created = models.DateTimeField()
    date_done = models.DateTimeField()
    content_type = models.CharField(max_length=128)
    content_encoding = models.CharField(max_length=64)
    result = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "django_celery_results_groupresult"


class DjangoCeleryResultsTaskresult(models.Model):
    task_id = models.CharField(unique=True, max_length=255)
    status = models.CharField(max_length=50)
    content_type = models.CharField(max_length=128)
    content_encoding = models.CharField(max_length=64)
    result = models.TextField(blank=True, null=True)
    date_done = models.DateTimeField()
    traceback = models.TextField(blank=True, null=True)
    meta = models.TextField(blank=True, null=True)
    task_args = models.TextField(blank=True, null=True)
    task_kwargs = models.TextField(blank=True, null=True)
    task_name = models.CharField(max_length=255, blank=True, null=True)
    worker = models.CharField(max_length=100, blank=True, null=True)
    date_created = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "django_celery_results_taskresult"


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = "django_content_type"
        unique_together = (("app_label", "model"),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "django_migrations"


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "django_session"


class DsfrDsfrconfig(models.Model):
    id = models.BigAutoField(primary_key=True)
    header_brand = models.CharField(max_length=200)
    header_brand_html = models.CharField(max_length=200)
    footer_brand = models.CharField(max_length=200)
    footer_brand_html = models.CharField(max_length=200)
    site_title = models.CharField(max_length=200)
    site_tagline = models.CharField(max_length=200)
    footer_description = models.TextField()
    mourning = models.BooleanField()
    accessibility_status = models.CharField(max_length=4)

    class Meta:
        managed = False
        db_table = "dsfr_dsfrconfig"


class HomeAlivetimestamp(models.Model):
    id = models.BigAutoField()
    timestamp = models.DateTimeField()
    queue_name = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = "home_alivetimestamp"


class HomeContactform(models.Model):
    id = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=254)
    content = models.TextField()
    status = models.CharField(max_length=10)
    created_date = models.DateTimeField()
    processed_date = models.DateTimeField(blank=True, null=True)
    error = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "home_contactform"


class HomeNewsletter(models.Model):
    id = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=254)
    created_date = models.DateTimeField()
    confirm_token = models.CharField(unique=True, max_length=25)
    confirmation_date = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "home_newsletter"


class MetabaseStatdiagnostic(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_date = models.DateTimeField()
    is_anonymouse = models.BooleanField()
    is_public = models.BooleanField()
    administrative_level = models.CharField(max_length=255, blank=True, null=True)
    analysis_level = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    link = models.CharField(max_length=255)
    city = models.CharField(max_length=255, blank=True, null=True)
    epci = models.CharField(max_length=255, blank=True, null=True)
    scot = models.CharField(max_length=255, blank=True, null=True)
    departement = models.CharField(max_length=255, blank=True, null=True)
    region = models.CharField(max_length=255, blank=True, null=True)
    project = models.OneToOneField("ProjectProject", models.DO_NOTHING)
    date_first_download = models.DateTimeField(blank=True, null=True)
    is_downaloaded = models.BooleanField()
    organism = models.CharField(max_length=255, blank=True, null=True)
    request = models.ForeignKey("ProjectRequest", models.DO_NOTHING, blank=True, null=True)
    group_organism = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "metabase_statdiagnostic"


class ProjectEmprise(models.Model):
    id = models.BigAutoField(primary_key=True)
    mpoly = models.MultiPolygonField()
    project = models.ForeignKey("ProjectProject", models.DO_NOTHING)
    srid_source = models.IntegerField()

    class Meta:
        managed = False
        db_table = "project_emprise"


class ProjectErrortracking(models.Model):
    id = models.BigAutoField(primary_key=True)
    created_date = models.DateTimeField()
    exception = models.TextField()
    request = models.ForeignKey("ProjectRequest", models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = "project_errortracking"


class ProjectHistoricalproject(models.Model):
    id = models.BigIntegerField()
    name = models.CharField(max_length=100)
    is_public = models.BooleanField()
    analyse_start_date = models.CharField(max_length=4)
    analyse_end_date = models.CharField(max_length=4)
    level = models.CharField(max_length=7)
    land_type = models.CharField(max_length=7, blank=True, null=True)
    land_id = models.CharField(max_length=255, blank=True, null=True)
    look_a_like = models.CharField(max_length=250, blank=True, null=True)
    target_2031 = models.IntegerField()
    created_date = models.DateTimeField()
    updated_date = models.DateTimeField()
    first_year_ocsge = models.IntegerField(blank=True, null=True)
    last_year_ocsge = models.IntegerField(blank=True, null=True)
    folder_name = models.CharField(max_length=15, blank=True, null=True)
    territory_name = models.CharField(max_length=250, blank=True, null=True)
    cover_image = models.TextField(blank=True, null=True)
    theme_map_conso = models.TextField(blank=True, null=True)
    theme_map_artif = models.TextField(blank=True, null=True)
    theme_map_understand_artif = models.TextField(blank=True, null=True)
    async_add_city_done = models.BooleanField()
    async_cover_image_done = models.BooleanField()
    async_find_first_and_last_ocsge_done = models.BooleanField()
    async_add_comparison_lands_done = models.BooleanField()
    async_generate_theme_map_conso_done = models.BooleanField()
    async_generate_theme_map_artif_done = models.BooleanField()
    async_theme_map_understand_artif_done = models.BooleanField()
    history_id = models.AutoField(primary_key=True)
    history_date = models.DateTimeField()
    history_change_reason = models.CharField(max_length=100, blank=True, null=True)
    history_type = models.CharField(max_length=1)
    history_user_id = models.BigIntegerField(blank=True, null=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    async_set_combined_emprise_done = models.BooleanField()
    available_millesimes = models.CharField(max_length=255, blank=True, null=True)
    async_theme_map_gpu_done = models.BooleanField()
    theme_map_gpu = models.TextField(blank=True, null=True)
    public_keys = models.CharField(max_length=255, blank=True, null=True)
    async_theme_map_fill_gpu_done = models.BooleanField()
    theme_map_fill_gpu = models.TextField(blank=True, null=True)
    async_ocsge_coverage_status_done = models.BooleanField()
    ocsge_coverage_status = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = "project_historicalproject"


class ProjectHistoricalrequest(models.Model):
    id = models.BigIntegerField()
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    function = models.CharField(max_length=250, blank=True, null=True)
    organism = models.CharField(max_length=30)
    email = models.CharField(max_length=254)
    created_date = models.DateTimeField()
    updated_date = models.DateTimeField()
    sent_date = models.DateTimeField(blank=True, null=True)
    done = models.BooleanField()
    sent_file = models.TextField(blank=True, null=True)
    history_id = models.AutoField(primary_key=True)
    history_date = models.DateTimeField()
    history_change_reason = models.CharField(max_length=100, blank=True, null=True)
    history_type = models.CharField(max_length=1)
    history_user = models.ForeignKey("UsersUser", models.DO_NOTHING, blank=True, null=True)
    project_id = models.BigIntegerField(blank=True, null=True)
    user_id = models.BigIntegerField(blank=True, null=True)
    requested_document = models.CharField(max_length=30)
    competence_urba = models.BooleanField()
    du_en_cours = models.BooleanField()

    class Meta:
        managed = False
        db_table = "project_historicalrequest"


class ProjectProject(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100)
    analyse_start_date = models.CharField(max_length=4)
    analyse_end_date = models.CharField(max_length=4)
    user = models.ForeignKey("UsersUser", models.DO_NOTHING, blank=True, null=True)
    is_public = models.BooleanField()
    look_a_like = models.CharField(max_length=250, blank=True, null=True)
    created_date = models.DateTimeField()
    updated_date = models.DateTimeField()
    first_year_ocsge = models.IntegerField(blank=True, null=True)
    last_year_ocsge = models.IntegerField(blank=True, null=True)
    level = models.CharField(max_length=7)
    land_id = models.CharField(max_length=255, blank=True, null=True)
    land_type = models.CharField(max_length=7, blank=True, null=True)
    cover_image = models.CharField(max_length=100, blank=True, null=True)
    folder_name = models.CharField(max_length=15, blank=True, null=True)
    territory_name = models.CharField(max_length=250, blank=True, null=True)
    target_2031 = models.IntegerField()
    theme_map_artif = models.CharField(max_length=100, blank=True, null=True)
    theme_map_conso = models.CharField(max_length=100, blank=True, null=True)
    theme_map_understand_artif = models.CharField(max_length=100, blank=True, null=True)
    async_add_comparison_lands_done = models.BooleanField()
    async_add_city_done = models.BooleanField()
    async_cover_image_done = models.BooleanField()
    async_find_first_and_last_ocsge_done = models.BooleanField()
    async_generate_theme_map_artif_done = models.BooleanField()
    async_generate_theme_map_conso_done = models.BooleanField()
    async_theme_map_understand_artif_done = models.BooleanField()
    async_set_combined_emprise_done = models.BooleanField()
    available_millesimes = models.CharField(max_length=255, blank=True, null=True)
    async_theme_map_gpu_done = models.BooleanField()
    theme_map_gpu = models.CharField(max_length=100, blank=True, null=True)
    public_keys = models.CharField(max_length=255, blank=True, null=True)
    async_theme_map_fill_gpu_done = models.BooleanField()
    theme_map_fill_gpu = models.CharField(max_length=100, blank=True, null=True)
    async_ocsge_coverage_status_done = models.BooleanField()
    ocsge_coverage_status = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = "project_project"


class ProjectProjectcommune(models.Model):
    id = models.BigAutoField(primary_key=True)
    project = models.ForeignKey(ProjectProject, models.DO_NOTHING)
    group_name = models.CharField(max_length=100, blank=True, null=True)
    commune_id = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "project_projectcommune"


class ProjectRequest(models.Model):
    id = models.BigAutoField(primary_key=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    function = models.CharField(max_length=250, blank=True, null=True)
    organism = models.CharField(max_length=30)
    email = models.CharField(max_length=254)
    created_date = models.DateTimeField()
    updated_date = models.DateTimeField()
    sent_date = models.DateTimeField(blank=True, null=True)
    done = models.BooleanField()
    project = models.ForeignKey(ProjectProject, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey("UsersUser", models.DO_NOTHING, blank=True, null=True)
    sent_file = models.CharField(max_length=100, blank=True, null=True)
    requested_document = models.CharField(max_length=30)
    competence_urba = models.BooleanField()
    du_en_cours = models.BooleanField()

    class Meta:
        managed = False
        db_table = "project_request"


class ProjectRnupackage(models.Model):
    id = models.BigAutoField(primary_key=True)
    file = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()
    departement_official_id = models.CharField(unique=True, max_length=10)
    app_version = models.CharField(max_length=10)

    class Meta:
        managed = False
        db_table = "project_rnupackage"


class ProjectRnupackagerequest(models.Model):
    id = models.BigAutoField(primary_key=True)
    departement_official_id = models.CharField(max_length=10)
    email = models.CharField(max_length=254)
    requested_at = models.DateTimeField()
    requested_diagnostics_before_package_request = models.IntegerField()
    account_created_for_package = models.BooleanField()
    rnu_package = models.ForeignKey(ProjectRnupackage, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey("UsersUser", models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "project_rnupackagerequest"


class PublicDataArtifareazoneurba(models.Model):
    zone_urba = models.CharField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    departement = models.CharField(blank=True, null=True)
    area = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_artifareazoneurba"


class PublicDataArtificialarea(models.Model):
    commune_year_id = models.CharField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    departement = models.CharField(blank=True, null=True)
    city = models.CharField(max_length=5, blank=True, null=True)
    surface = models.FloatField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_artificialarea"


class PublicDataCerema(models.Model):
    city_insee = models.CharField(blank=True, null=True)
    city_name = models.CharField(max_length=50, blank=True, null=True)
    region_name = models.CharField(max_length=35, blank=True, null=True)
    region_id = models.CharField(max_length=2, blank=True, null=True)
    dept_id = models.CharField(max_length=3, blank=True, null=True)
    dept_name = models.CharField(max_length=30, blank=True, null=True)
    epci_id = models.CharField(blank=True, null=True)
    epci_name = models.CharField(max_length=230, blank=True, null=True)
    scot = models.CharField(blank=True, null=True)
    art09inc23 = models.FloatField(blank=True, null=True)
    art09fer23 = models.FloatField(blank=True, null=True)
    art09rou23 = models.FloatField(blank=True, null=True)
    art09mix23 = models.FloatField(blank=True, null=True)
    art09hab23 = models.FloatField(blank=True, null=True)
    art09act23 = models.FloatField(blank=True, null=True)
    art22inc23 = models.FloatField(blank=True, null=True)
    art22fer23 = models.FloatField(blank=True, null=True)
    art22rou23 = models.FloatField(blank=True, null=True)
    art22mix23 = models.FloatField(blank=True, null=True)
    art22hab23 = models.FloatField(blank=True, null=True)
    art22act23 = models.FloatField(blank=True, null=True)
    naf22art23 = models.FloatField(blank=True, null=True)
    art21inc22 = models.FloatField(blank=True, null=True)
    art21fer22 = models.FloatField(blank=True, null=True)
    art21rou22 = models.FloatField(blank=True, null=True)
    art21mix22 = models.FloatField(blank=True, null=True)
    art21hab22 = models.FloatField(blank=True, null=True)
    art21act22 = models.FloatField(blank=True, null=True)
    naf21art22 = models.FloatField(blank=True, null=True)
    art20inc21 = models.FloatField(blank=True, null=True)
    art20fer21 = models.FloatField(blank=True, null=True)
    art20rou21 = models.FloatField(blank=True, null=True)
    art20mix21 = models.FloatField(blank=True, null=True)
    art20hab21 = models.FloatField(blank=True, null=True)
    art20act21 = models.FloatField(blank=True, null=True)
    naf20art21 = models.FloatField(blank=True, null=True)
    art19inc20 = models.FloatField(blank=True, null=True)
    art19fer20 = models.FloatField(blank=True, null=True)
    art19rou20 = models.FloatField(blank=True, null=True)
    art19mix20 = models.FloatField(blank=True, null=True)
    art19hab20 = models.FloatField(blank=True, null=True)
    art19act20 = models.FloatField(blank=True, null=True)
    naf19art20 = models.FloatField(blank=True, null=True)
    art18inc19 = models.FloatField(blank=True, null=True)
    art18fer19 = models.FloatField(blank=True, null=True)
    art18rou19 = models.FloatField(blank=True, null=True)
    art18mix19 = models.FloatField(blank=True, null=True)
    art18hab19 = models.FloatField(blank=True, null=True)
    art18act19 = models.FloatField(blank=True, null=True)
    naf18art19 = models.FloatField(blank=True, null=True)
    art17inc18 = models.FloatField(blank=True, null=True)
    art17fer18 = models.FloatField(blank=True, null=True)
    art17rou18 = models.FloatField(blank=True, null=True)
    art17mix18 = models.FloatField(blank=True, null=True)
    art17hab18 = models.FloatField(blank=True, null=True)
    art17act18 = models.FloatField(blank=True, null=True)
    naf17art18 = models.FloatField(blank=True, null=True)
    art16inc17 = models.FloatField(blank=True, null=True)
    art16fer17 = models.FloatField(blank=True, null=True)
    art16rou17 = models.FloatField(blank=True, null=True)
    art16mix17 = models.FloatField(blank=True, null=True)
    art16hab17 = models.FloatField(blank=True, null=True)
    art16act17 = models.FloatField(blank=True, null=True)
    naf16art17 = models.FloatField(blank=True, null=True)
    art15inc16 = models.FloatField(blank=True, null=True)
    art15fer16 = models.FloatField(blank=True, null=True)
    art15rou16 = models.FloatField(blank=True, null=True)
    art15mix16 = models.FloatField(blank=True, null=True)
    art15hab16 = models.FloatField(blank=True, null=True)
    art15act16 = models.FloatField(blank=True, null=True)
    naf15art16 = models.FloatField(blank=True, null=True)
    art14inc15 = models.FloatField(blank=True, null=True)
    art14fer15 = models.FloatField(blank=True, null=True)
    art14rou15 = models.FloatField(blank=True, null=True)
    art14mix15 = models.FloatField(blank=True, null=True)
    art14hab15 = models.FloatField(blank=True, null=True)
    art14act15 = models.FloatField(blank=True, null=True)
    naf14art15 = models.FloatField(blank=True, null=True)
    art13inc14 = models.FloatField(blank=True, null=True)
    art13fer14 = models.FloatField(blank=True, null=True)
    art13rou14 = models.FloatField(blank=True, null=True)
    art13mix14 = models.FloatField(blank=True, null=True)
    art13hab14 = models.FloatField(blank=True, null=True)
    art13act14 = models.FloatField(blank=True, null=True)
    naf13art14 = models.FloatField(blank=True, null=True)
    art12inc13 = models.FloatField(blank=True, null=True)
    art12fer13 = models.FloatField(blank=True, null=True)
    art12rou13 = models.FloatField(blank=True, null=True)
    art12mix13 = models.FloatField(blank=True, null=True)
    art12hab13 = models.FloatField(blank=True, null=True)
    art12act13 = models.FloatField(blank=True, null=True)
    naf12art13 = models.FloatField(blank=True, null=True)
    art11inc12 = models.FloatField(blank=True, null=True)
    art11fer12 = models.FloatField(blank=True, null=True)
    art11rou12 = models.FloatField(blank=True, null=True)
    art11mix12 = models.FloatField(blank=True, null=True)
    art11hab12 = models.FloatField(blank=True, null=True)
    art11act12 = models.FloatField(blank=True, null=True)
    naf11art12 = models.FloatField(blank=True, null=True)
    art10inc11 = models.FloatField(blank=True, null=True)
    art10fer11 = models.FloatField(blank=True, null=True)
    art10rou11 = models.FloatField(blank=True, null=True)
    art10mix11 = models.FloatField(blank=True, null=True)
    art10hab11 = models.FloatField(blank=True, null=True)
    art10act11 = models.FloatField(blank=True, null=True)
    naf10art11 = models.FloatField(blank=True, null=True)
    art09inc10 = models.FloatField(blank=True, null=True)
    art09fer10 = models.FloatField(blank=True, null=True)
    art09rou10 = models.FloatField(blank=True, null=True)
    art09mix10 = models.FloatField(blank=True, null=True)
    art09hab10 = models.FloatField(blank=True, null=True)
    art09act10 = models.FloatField(blank=True, null=True)
    naf09art10 = models.FloatField(blank=True, null=True)
    naf11art21 = models.FloatField(blank=True, null=True)
    naf11inc21 = models.FloatField(blank=True, null=True)
    naf11fer21 = models.FloatField(blank=True, null=True)
    naf11rou21 = models.FloatField(blank=True, null=True)
    naf11mix21 = models.FloatField(blank=True, null=True)
    naf11act21 = models.FloatField(blank=True, null=True)
    naf11hab21 = models.FloatField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_cerema"


class PublicDataCommune(models.Model):
    insee = models.CharField(max_length=5, blank=True, null=True)
    departement_id = models.CharField(max_length=3, blank=True, null=True)
    epci_id = models.CharField(blank=True, null=True)
    ept_id = models.CharField(blank=True, null=True)
    scot_id = models.CharField(blank=True, null=True)
    first_millesime = models.IntegerField(blank=True, null=True)
    last_millesime = models.IntegerField(blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    ocsge_available = models.BooleanField(blank=True, null=True)
    surface_artif = models.FloatField(blank=True, null=True)
    area = models.FloatField(blank=True, null=True)
    consommation_correction_status = models.CharField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_commune"


class PublicDataCommuneEpci(models.Model):
    commune_id = models.CharField(max_length=5, blank=True, null=True)
    epci_id = models.CharField(max_length=9, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_commune_epci"


class PublicDataCommunediff(models.Model):
    year_old = models.IntegerField(blank=True, null=True)
    year_new = models.IntegerField(blank=True, null=True)
    new_artif = models.FloatField(blank=True, null=True)
    new_natural = models.FloatField(blank=True, null=True)
    city_id = models.CharField(max_length=5, blank=True, null=True)
    net_artif = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_communediff"


class PublicDataCommunepop(models.Model):
    id = models.BigAutoField(primary_key=True)
    year = models.IntegerField()
    pop = models.IntegerField(blank=True, null=True)
    city_id = models.BigIntegerField()
    household = models.IntegerField(blank=True, null=True)
    household_change = models.IntegerField(blank=True, null=True)
    pop_change = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_communepop"


class PublicDataCommunesol(models.Model):
    year = models.IntegerField(blank=True, null=True)
    surface = models.FloatField(blank=True, null=True)
    city_id = models.CharField(max_length=5, blank=True, null=True)
    matrix_id = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_communesol"


class PublicDataCouverturesol(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=8)
    label = models.CharField(max_length=250)
    parent = models.ForeignKey("self", models.DO_NOTHING, blank=True, null=True)
    code_prefix = models.CharField(unique=True, max_length=10)
    map_color = models.CharField(max_length=8, blank=True, null=True)
    label_short = models.CharField(max_length=50, blank=True, null=True)
    is_key = models.BooleanField()

    class Meta:
        managed = False
        db_table = "public_data_couverturesol"


class PublicDataCouvertureusagematrix(models.Model):
    id = models.BigAutoField(primary_key=True)
    is_artificial = models.BooleanField(blank=True, null=True)
    couverture = models.ForeignKey(PublicDataCouverturesol, models.DO_NOTHING, blank=True, null=True)
    usage = models.ForeignKey("PublicDataUsagesol", models.DO_NOTHING, blank=True, null=True)
    is_natural = models.BooleanField(blank=True, null=True)
    label = models.CharField(max_length=20)
    is_impermeable = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_couvertureusagematrix"
        unique_together = (("couverture", "usage"),)


class PublicDataDepartement(models.Model):
    source_id = models.CharField(max_length=3, blank=True, null=True)
    name = models.CharField(max_length=30, blank=True, null=True)
    region_id = models.CharField(max_length=2, blank=True, null=True)
    ocsge_millesimes = models.TextField(blank=True, null=True)  # This field type is a guess.
    srid_source = models.IntegerField(blank=True, null=True)
    is_artif_ready = models.BooleanField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_departement"


class PublicDataEpci(models.Model):
    source_id = models.CharField(max_length=9, blank=True, null=True)
    name = models.CharField(max_length=230, blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_epci"


class PublicDataEpciDepartements(models.Model):
    epci_id = models.CharField(max_length=9, blank=True, null=True)
    departement_id = models.CharField(max_length=3, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_epci_departements"


class PublicDataLandconso(models.Model):
    land_id = models.CharField(blank=True, null=True)
    land_type = models.CharField(blank=True, null=True)
    surface = models.FloatField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    total = models.FloatField(blank=True, null=True)
    activite = models.FloatField(blank=True, null=True)
    habitat = models.FloatField(blank=True, null=True)
    mixte = models.FloatField(blank=True, null=True)
    route = models.FloatField(blank=True, null=True)
    ferroviaire = models.FloatField(blank=True, null=True)
    inconnu = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_landconso"


class PublicDataLandconsocomparison(models.Model):
    relevance_level = models.CharField(blank=True, null=True)
    land_type = models.CharField(blank=True, null=True)
    land_id = models.CharField(blank=True, null=True)
    from_year = models.IntegerField(blank=True, null=True)
    to_year = models.IntegerField(blank=True, null=True)
    total_median = models.FloatField(blank=True, null=True)
    total_median_percent = models.FloatField(blank=True, null=True)
    total_avg = models.FloatField(blank=True, null=True)
    total_percent = models.FloatField(blank=True, null=True)
    activite_median = models.FloatField(blank=True, null=True)
    activite_median_percent = models.FloatField(blank=True, null=True)
    activite_avg = models.FloatField(blank=True, null=True)
    activite_percent = models.FloatField(blank=True, null=True)
    habitat_median = models.FloatField(blank=True, null=True)
    habitat_median_percent = models.FloatField(blank=True, null=True)
    habitat_avg = models.FloatField(blank=True, null=True)
    habitat_percent = models.FloatField(blank=True, null=True)
    mixte_median = models.FloatField(blank=True, null=True)
    mixte_median_percent = models.FloatField(blank=True, null=True)
    mixte_avg = models.FloatField(blank=True, null=True)
    mixte_percent = models.FloatField(blank=True, null=True)
    route_median = models.FloatField(blank=True, null=True)
    route_median_percent = models.FloatField(blank=True, null=True)
    route_avg = models.FloatField(blank=True, null=True)
    route_percent = models.FloatField(blank=True, null=True)
    ferroviaire_median = models.FloatField(blank=True, null=True)
    ferroviaire_median_percent = models.FloatField(blank=True, null=True)
    ferroviaire_avg = models.FloatField(blank=True, null=True)
    ferroviaire_percent = models.FloatField(blank=True, null=True)
    inconnu_median = models.FloatField(blank=True, null=True)
    inconnu_median_percent = models.FloatField(blank=True, null=True)
    inconnu_avg = models.FloatField(blank=True, null=True)
    inconnu_percent = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_landconsocomparison"


class PublicDataLandconsostats(models.Model):
    land_id = models.CharField(blank=True, null=True)
    land_type = models.CharField(blank=True, null=True)
    comparison_level = models.CharField(blank=True, null=True)
    comparison_id = models.CharField(blank=True, null=True)
    from_year = models.IntegerField(blank=True, null=True)
    to_year = models.IntegerField(blank=True, null=True)
    total = models.FloatField(blank=True, null=True)
    total_percent = models.FloatField(blank=True, null=True)
    activite = models.FloatField(blank=True, null=True)
    activite_percent = models.FloatField(blank=True, null=True)
    habitat = models.FloatField(blank=True, null=True)
    habitat_percent = models.FloatField(blank=True, null=True)
    mixte = models.FloatField(blank=True, null=True)
    mixte_percent = models.FloatField(blank=True, null=True)
    route = models.FloatField(blank=True, null=True)
    route_percent = models.FloatField(blank=True, null=True)
    ferroviaire = models.FloatField(blank=True, null=True)
    ferroviaire_percent = models.FloatField(blank=True, null=True)
    inconnu = models.FloatField(blank=True, null=True)
    inconnu_percent = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_landconsostats"


class PublicDataLandpop(models.Model):
    land_id = models.CharField(blank=True, null=True)
    land_type = models.CharField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    evolution = models.FloatField(blank=True, null=True)
    population = models.FloatField(blank=True, null=True)
    source = models.CharField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_landpop"


class PublicDataLandpopcomparison(models.Model):
    relevance_level = models.CharField(blank=True, null=True)
    land_type = models.CharField(blank=True, null=True)
    land_id = models.CharField(blank=True, null=True)
    from_year = models.IntegerField(blank=True, null=True)
    to_year = models.IntegerField(blank=True, null=True)
    evolution_median = models.FloatField(blank=True, null=True)
    evolution_median_percent = models.FloatField(blank=True, null=True)
    evolution_avg = models.FloatField(blank=True, null=True)
    evolution_percent = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_landpopcomparison"


class PublicDataLandpopstats(models.Model):
    land_id = models.CharField(blank=True, null=True)
    land_type = models.CharField(blank=True, null=True)
    comparison_level = models.CharField(blank=True, null=True)
    comparison_id = models.CharField(blank=True, null=True)
    from_year = models.IntegerField(blank=True, null=True)
    to_year = models.IntegerField(blank=True, null=True)
    evolution = models.FloatField(blank=True, null=True)
    evolution_percent = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_landpopstats"


class PublicDataOcsge(models.Model):
    uuid = models.CharField(blank=True, null=True)
    couverture = models.CharField(blank=True, null=True)
    usage = models.CharField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    id_source = models.CharField(blank=True, null=True)
    is_artificial = models.BooleanField(blank=True, null=True)
    surface = models.FloatField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    departement = models.CharField(blank=True, null=True)
    is_impermeable = models.BooleanField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_ocsge"


class PublicDataOcsgediff(models.Model):
    uuid = models.CharField(blank=True, null=True)
    year_old = models.IntegerField(blank=True, null=True)
    year_new = models.IntegerField(blank=True, null=True)
    cs_new = models.CharField(blank=True, null=True)
    cs_old = models.CharField(blank=True, null=True)
    us_new = models.CharField(blank=True, null=True)
    us_old = models.CharField(blank=True, null=True)
    surface = models.FloatField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    departement = models.CharField(blank=True, null=True)
    is_new_artif = models.BooleanField(blank=True, null=True)
    is_new_natural = models.BooleanField(blank=True, null=True)
    is_new_impermeable = models.BooleanField(blank=True, null=True)
    is_new_not_impermeable = models.BooleanField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_ocsgediff"


class PublicDataRegion(models.Model):
    source_id = models.CharField(max_length=2, blank=True, null=True)
    name = models.CharField(max_length=35, blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_region"


class PublicDataScot(models.Model):
    siren = models.CharField(blank=True, null=True)
    source_id = models.CharField(blank=True, null=True)
    name = models.CharField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_scot"


class PublicDataScotDepartements(models.Model):
    scot_id = models.CharField(blank=True, null=True)
    departement_id = models.CharField(max_length=3, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_scot_departements"


class PublicDataScotRegions(models.Model):
    scot_id = models.CharField(blank=True, null=True)
    region_id = models.CharField(max_length=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_scot_regions"


class PublicDataSudocuh(models.Model):
    code_insee = models.CharField(primary_key=True, max_length=200)
    code_departement = models.CharField(max_length=200)
    nom_region = models.CharField(max_length=200)
    nom_commune = models.CharField(max_length=200)
    collectivite_porteuse = models.CharField(max_length=200)
    siren_epci = models.CharField(max_length=200, blank=True, null=True)
    code_etat = models.CharField(max_length=2)
    du_opposable = models.CharField(max_length=200)
    du_en_cours = models.CharField(max_length=200, blank=True, null=True)
    code_bcsi = models.CharField(max_length=200)
    etat_commune = models.CharField(max_length=200)
    etat_detaille = models.CharField(max_length=200)
    prescription_du_en_vigueur = models.DateField(blank=True, null=True)
    approbation_du_en_vigueur = models.DateField(blank=True, null=True)
    executoire_du_en_vigueur = models.DateField(blank=True, null=True)
    prescription_proc_en_cours = models.DateField(blank=True, null=True)
    population_municipale = models.IntegerField()
    population_totale = models.IntegerField()
    superficie = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_sudocuh"


class PublicDataSudocuhepci(models.Model):
    id = models.BigAutoField(primary_key=True)
    nom_region = models.CharField(max_length=200)
    code_departement = models.CharField(max_length=200)
    nom_departement = models.CharField(max_length=200)
    siren = models.CharField(max_length=200)
    type_epci = models.CharField(max_length=200)
    nom_epci = models.CharField(max_length=200)
    date_creation_epci = models.DateField(blank=True, null=True)
    epci_interdepartemental = models.BooleanField()
    competence_plan = models.BooleanField()
    competence_scot = models.BooleanField()
    competence_plh = models.BooleanField()
    obligation_plh = models.BooleanField()
    nb_communes = models.IntegerField()
    insee_pop_tot_2021 = models.IntegerField()
    insee_pop_municipale = models.IntegerField()
    insee_superficie = models.FloatField()

    class Meta:
        managed = False
        db_table = "public_data_sudocuhepci"


class PublicDataUsagesol(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(unique=True, max_length=8)
    label = models.CharField(max_length=250)
    parent = models.ForeignKey("self", models.DO_NOTHING, blank=True, null=True)
    code_prefix = models.CharField(unique=True, max_length=10)
    map_color = models.CharField(max_length=8, blank=True, null=True)
    label_short = models.CharField(max_length=50, blank=True, null=True)
    is_key = models.BooleanField()

    class Meta:
        managed = False
        db_table = "public_data_usagesol"


class PublicDataZoneconstruite(models.Model):
    uuid = models.CharField(blank=True, null=True)
    id_source = models.CharField(blank=True, null=True)
    millesime = models.IntegerField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    surface = models.FloatField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    departement = models.CharField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_zoneconstruite"


class PublicDataZoneurba(models.Model):
    checksum = models.CharField(blank=True, null=True)
    libelle = models.CharField(blank=True, null=True)
    libelong = models.CharField(blank=True, null=True)
    idurba = models.CharField(blank=True, null=True)
    typezone = models.CharField(blank=True, null=True)
    partition = models.CharField(blank=True, null=True)
    datappro = models.CharField(blank=True, null=True)
    datvalid = models.CharField(blank=True, null=True)
    area = models.FloatField(blank=True, null=True)
    srid_source = models.IntegerField(blank=True, null=True)
    mpoly = models.GeometryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "public_data_zoneurba"


class UsersUser(models.Model):
    id = models.BigAutoField(primary_key=True)
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(unique=True, max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    email_checked = models.DateTimeField(blank=True, null=True)
    function = models.CharField(max_length=250)
    organism = models.CharField(max_length=250)
    organism_group = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "users_user"


class UsersUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(UsersUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = "users_user_groups"
        unique_together = (("user", "group"),)


class UsersUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(UsersUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = "users_user_user_permissions"
        unique_together = (("user", "permission"),)
