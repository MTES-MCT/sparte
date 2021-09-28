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
@click.option(
    "--klass", default=None, type=str, help="upload data for a specific model"
)
def upload_public_data(env, klass=None):
    """Trigger upload management command of public_data scalingo host."""
    # get the right parameter for scalingo call
    env = ENVS[env]  # noqa: F405
    # build command
    cmd = (
        f"scalingo --app {env['app']} --region {env['region']} "
        "run python manage.py load_data"
    )
    if klass:
        if klass.startswith("public_data.models"):
            cmd += f" --class {klass}"
        else:
            cmd += f" --class public_data.models.{klass}"
    click.echo(f"Execute: {cmd}")

    # execute cmd
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
