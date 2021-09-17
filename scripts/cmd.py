import click

from variables import *  # noqa: F403, F401
from upload_data import upload_public_data
from migrate import migrate


@click.group()
def cli():
    pass


cli.add_command(upload_public_data)
cli.add_command(migrate)


if __name__ == "__main__":
    cli()
