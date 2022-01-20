import click
import asyncio


ENVS = {
    "staging": {
        "app": "sparte-staging",
        "region": "osc-fr1",
    },
    "prod": {
        "app": "sparte",
        "region": "osc-secnum-fr1",
    },
}


@click.group()
@click.option(
    "--env",
    default="staging",
    type=click.Choice(["staging", "prod"], case_sensitive=True),
    help="Choose environnement",
)
@click.pass_context
def cli(ctx, env):
    # ensure that ctx.obj exists and is a dict (in case `cli()` is called
    # by means other than the `if` block below)
    ctx.ensure_object(dict)
    ctx.obj["ENV_NAME"] = env


async def async_remote_run(env_name, user_cmd):
    env = ENVS[env_name]
    cmd = f"scalingo --app {env['app']} --region {env['region']} run {user_cmd}"
    print(f"Execute: {cmd}")

    proc = await asyncio.create_subprocess_shell(
        cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
    )

    while True:
        buf = await proc.stdout.read(1024)
        if not buf:
            break
        print(buf.decode(), end="")


def manage_py(env_name, management_command_name, **options):
    cmd = f"python manage.py {management_command_name}"
    for name, val in options.items():
        cmd += f" --{name} {val}"
    asyncio.run(async_remote_run(env_name, cmd))


@cli.command()
@click.argument(
    "user_cmd",
    nargs=1,
)
@click.pass_context
def run(ctx, user_cmd):
    """Send a command to a remote host."""
    asyncio.run(async_remote_run(ctx.obj["ENV_NAME"], user_cmd))


@cli.command()
@click.pass_context
def build_region_and_co(ctx):
    """Trigger management command load_from_cerema"""
    manage_py(ctx.obj["ENV_NAME"], "load_from_cerema")


@cli.command()
@click.option(
    "--klass", default=None, type=str, help="upload data for a specific model"
)
@click.pass_context
def upload_public_data(ctx, klass=None):
    """Trigger management command public_data scalingo."""
    if klass:
        if klass and not klass.startswith("public_data.models"):
            klass = f"public_data.models.{klass}"
        options = {"class": klass}
    manage_py(ctx.obj["ENV_NAME"], "load_data", **options)


@cli.command()
@click.pass_context
def migrate(ctx):
    """Trigger migrate command to update database"""
    manage_py(ctx.obj["ENV_NAME"], "migrate")


@cli.command()
@click.pass_context
def create_public_project(ctx):
    """Trigger create_public_project command"""
    manage_py(ctx.obj["ENV_NAME"], "create_public_project")


@cli.command()
@click.pass_context
def reset_project(ctx):
    """Trigger create_public_project command"""
    manage_py(ctx.obj["ENV_NAME"], "reset_project")


if __name__ == "__main__":
    cli(obj={})
