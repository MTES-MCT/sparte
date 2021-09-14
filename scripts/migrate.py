import click
import subprocess

from variables import ENVS


@click.command()
@click.option(
    "--env",
    default="staging",
    type=click.Choice(["staging", "prod"], case_sensitive=True),
    help="Choose environnement",
)
def migrate(env):
    """Trigger migration process on destination."""
    env = ENVS[env]
    cmd = "scalingo --app {app} --region {region} run python manage.py migrate"
    cmd = cmd.format(app=env["app"], region=env["region"])
    cmds = [
        f"{cmd} users",
        cmd,
    ]
    for cmd in cmds:
        click.echo(f"Execute: {cmd}")
        cmd = cmd.split()
        try:
            pipe = subprocess.PIPE
            normal = subprocess.run(cmd, stdout=pipe, stderr=pipe, text=True)
            if normal.stdout:
                click.secho(normal.stdout, fg="green")
        except subprocess.CalledProcessError as e:
            click.secho(f"error occured: {e}", fg="red")


if __name__ == "__main__":
    migrate()
