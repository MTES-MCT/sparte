import click
import subprocess

from variables import *  # noqa: F403


@click.command()
@click.option(
    "--env",
    default="staging",
    type=click.Choice(["staging", "prod"], case_sensitive=True),
    help="Choose environnement",
)
def upload_public_data(env):
    """Trigger upload management command of public_data scalingo host."""
    # list of models to upload
    models = [
        "CommunesSybarval",
        "Artificialisee2015to2018",
        "Renaturee2018to2015",
        "Artificielle2018",
        "EnveloppeUrbaine2018",
        "Voirie2018",
        "ZonesBaties2018",
        "Sybarval",
    ]
    # get the right parameter for scalingo call
    env = ENVS[env]  # noqa: F405
    mask = (
        "scalingo --app {app} --region {region} run python manage.py "
        "load_data public_data.models.{model}"
    )
    for model in models:
        cmd = mask.format(app=env["app"], region=env["region"], model=model)
        click.echo(f"Execute: {cmd}")
        cmd = cmd.split()
        try:
            normal = subprocess.run(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                # check=True,
                text=True,
            )
            if normal.stdout:
                click.secho(normal.stdout, fg="green")
        except subprocess.CalledProcessError as e:
            click.secho(f"error occured: {e}", fg="red")


if __name__ == "__main__":
    upload_public_data()
# sparte-staging.incubateur.net
