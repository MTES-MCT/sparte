import click
import subprocess

from variables import ENVS


@click.command()
@click.argument(
    "user_cmd",
    nargs=1,
)
@click.option(
    "--env",
    default="staging",
    type=click.Choice(["staging", "prod"], case_sensitive=True),
    help="Choose environnement",
)
def run(user_cmd, env):
    """Send a command to a remote host"""
    env = ENVS[env]
    cmd = f"scalingo --app {env['app']} --region {env['region']} run {user_cmd}"
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
    run()
