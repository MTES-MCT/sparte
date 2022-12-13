import click
import asyncio


ENVS = {
    "local": dict(),
    "staging": {
        "app": "sparte-staging",
        "region": "osc-fr1",
    },
    "prod": {
        "app": "sparte",
        "region": "osc-secnum-fr1",
    },
}


class ScalingoInterface:
    def __init__(self, ctx_obj):
        self.env_name = ctx_obj["ENV_NAME"]
        self.app = ENVS[self.env_name].get("app", None)
        self.region = ENVS[self.env_name].get("region", None)
        self.detached = ctx_obj["DETACHED"]

    def get_scalingo_run_cmd(self) -> str:
        """Return the line to execute the command on scalingo remote app"""
        cmd = f"scalingo --app {self.app} --region {self.region}"
        if self.detached:
            return f"{cmd} run -d"
        return f"{cmd} run"

    async def async_run(self, cmd):
        click.secho(f"Environment: {self.env_name}", fg="blue")
        click.secho(f"Execute: {cmd}", fg="blue")
        proc = await asyncio.create_subprocess_shell(
            cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.STDOUT,
        )

        while True:
            buf = await proc.stdout.read(64)
            if not buf:
                break
            try:
                print(buf.decode(), end="")
            except UnicodeDecodeError:
                print("decode error")

    def run(self, cmd):
        """If it is not local, add scalingo prefix to execute the command remotly,
        then call async run"""
        if self.env_name == "local":
            asyncio.run(self.async_run(cmd))
        else:
            cmd = f"{self.get_scalingo_run_cmd()} '{cmd}'"
            asyncio.run(self.async_run(cmd))

    def manage_py(self, management_command_name, **options):
        """Add prefix to run command through django's shell"""
        cmd = f"python manage.py {management_command_name}"
        for name, val in options.items():
            cmd += f" --{name} {val}"
        self.run(cmd)

    def print_cmd(self):
        print(self.get_scalingo_run_cmd())


class AliasedGroup(click.Group):
    """Alias `mep` to the last mep-xxx command available.
    ..see:: Used in bin/post_compile"""

    def get_command(self, ctx, cmd_name):
        # Step one: bulitin commands as normal
        if cmd_name == "mep":
            # find last mep command
            mep_cmd = [x for x in self.list_commands(ctx) if x.startswith("mep")]
            mep_cmd.sort()
            cmd_name = mep_cmd.pop()
        return super().get_command(ctx, cmd_name)
        # rv = click.Group.get_command(self, ctx, cmd_name)


@click.command(cls=AliasedGroup)
@click.option(
    "--env",
    default="staging",
    type=click.Choice(list(ENVS.keys()), case_sensitive=True),
    help="Choose environnement",
)
@click.option("--detached", is_flag=True)
@click.pass_context
def cli(ctx, env, detached):
    # ensure that ctx.obj exists and is a dict (in case `cli()` is called
    # by means other than the `if` block below)
    ctx.ensure_object(dict)
    ctx.obj["ENV_NAME"] = env
    ctx.obj["DETACHED"] = detached


@cli.command()
@click.pass_context
def print_cmd(ctx, klass=None):
    """Return scalingo cmd for the selected environment"""
    connecter = ScalingoInterface(ctx.obj)
    connecter.print_cmd()


@cli.command()
@click.argument(
    "user_cmd",
    nargs=1,
)
@click.pass_context
def run(ctx, user_cmd):
    """Send a command to a remote host."""
    connecter = ScalingoInterface(ctx.obj)
    connecter.run(user_cmd)


@cli.command()
@click.argument(
    "user_cmd",
    nargs=1,
)
@click.pass_context
def arun(ctx, user_cmd):
    """Send a command to a remote host in detached mode."""
    connecter = ScalingoInterface(ctx.obj)
    connecter.detached = True
    connecter.run(user_cmd)


@cli.command()
@click.option(
    "--klass", default=None, type=str, help="upload data for a specific model"
)
@click.pass_context
def load_data(ctx, klass=None):
    """Trigger management command public_data scalingo."""
    if klass:
        if klass and not klass.startswith("public_data.models"):
            klass = f"public_data.models.{klass}"
        options = {"class": klass}
    connecter = ScalingoInterface(ctx.obj)
    connecter.manage_py("load_data", **options)


@cli.command()
@click.option("--item", type=str, help="upload data for a specific model")
@click.pass_context
def load_ocsge(ctx, item):
    """Trigger management command public_data.load_ocsge scalingo."""
    connecter = ScalingoInterface(ctx.obj)
    connecter.manage_py(
        "load_ocsge --no-verbose",
        **{
            "item": item,
        },
    )


@cli.command()
@click.pass_context
def rebuild(ctx, klass=None):
    """Trigger management command public_data scalingo."""
    connecter = ScalingoInterface(ctx.obj)

    click.secho("Build database", fg="cyan")
    connecter.manage_py("migrate")

    click.secho("Load parameters", fg="cyan")
    connecter.manage_py("load_param --file required_parameters.json")

    click.secho("Load usage and couverture referentials", fg="cyan")
    connecter.manage_py("load_usage_couv")

    click.secho("Create matrix", fg="cyan")
    connecter.manage_py("build_matrix")

    click.secho("Load data from cerema", fg="cyan")
    connecter.manage_py("load_cerema --no-verbose")

    click.secho("build administrative territory", fg="cyan")
    connecter.manage_py("build_administrative_layers")

    click.secho("Trigger OVS GE data loading", fg="cyan")
    connecter.manage_py("load_ocsge --no-verbose --truncate")

    click.secho("Build data for all communes", fg="cyan")
    connecter.manage_py("build_commune_data")

    click.secho("Set available millesimes", fg="cyan")
    connecter.manage_py("set_dept_millesimes")

    click.secho("Build artificial area", fg="cyan")
    connecter.manage_py("build_artificial_area")

    click.secho("Evaluate density of building in zone construite (async)", fg="cyan")
    connecter.manage_py("set_density")

    click.secho("Load INSEE", fg="cyan")
    connecter.manage_py("load_insee")

    click.secho("End", fg="cyan")


@cli.command()
@click.pass_context
def migrate(ctx):
    """Trigger migrate command to update database"""
    connecter = ScalingoInterface(ctx.obj)
    connecter.manage_py("migrate")


@cli.command()
@click.pass_context
def mep_150(ctx):
    """Trigger all data transformation to successful MEP release 1.5.0"""
    click.secho("Start migration v1.5.0", fg="cyan")
    connecter = ScalingoInterface(ctx.obj)

    click.secho("Fix look a like", fg="cyan")
    connecter.manage_py("fix_look_a_like")

    click.secho("Setup departement", fg="cyan")
    connecter.manage_py("setup_dept")


@cli.command()
@click.pass_context
def mep_200(ctx):
    """Trigger all data transformation to successful MEP release 1.6"""
    click.secho("Start migration v1.6", fg="cyan")
    connecter = ScalingoInterface(ctx.obj)

    click.secho("Fix missing 6.1 and 6.2 in artificial", fg="cyan")
    connecter.manage_py("build_matrix")

    click.secho("Load 2021 Cérema's data", fg="cyan")
    connecter.manage_py("load_cerema")

    click.secho("Create all diagnostic cover images", fg="cyan")
    connecter.manage_py("generate_cover")

    click.secho("Add title, tagline and footer", fg="cyan")
    connecter.manage_py("add_title")


@cli.command()
@click.pass_context
def mep_210(ctx):
    """Trigger all data transformation to successful MEP release 1.6"""
    click.secho("Start migration v1.6", fg="cyan")
    connecter = ScalingoInterface(ctx.obj)

    click.secho("Load INSEE", fg="cyan")
    connecter.manage_py("load_insee")


@cli.command()
@click.pass_context
def mep_240(ctx):
    """Trigger all data transformation to successful MEP release 2.4"""
    click.secho("Start migration v2.4", fg="cyan")
    connecter = ScalingoInterface(ctx.obj)

    click.secho("Load SCoT", fg="cyan")
    connecter.manage_py("load_scot")


@cli.command()
@click.pass_context
def mep_240(ctx):
    """Trigger all data transformation to successful MEP release 1.6"""
    click.secho("Start migration v2.4", fg="cyan")
    connecter = ScalingoInterface(ctx.obj)

    click.secho("Add new couvertures", fg="cyan")
    connecter.manage_py("load_usage_couv")
    connecter.manage_py("build_matrix")

    click.secho("Add BFC's OCS GE", fg="cyan")
    connecter.detached = True
    connecter.manage_py("load_ocsge_bfc")

    click.secho("Update departement with OCS GE", fg="cyan")
    connecter.detached = False
    connecter.manage_py("setup_dept")


if __name__ == "__main__":
    cli(obj={})
