import logging

import pytest
from include.utils import run_command

SECRET = "s3cr3t-pa55word"


def test_logs_stdout_when_command_succeeds(caplog):
    with caplog.at_level(logging.INFO):
        run_command(["echo", "ok"])

    assert "ok" in caplog.text


def test_failed_command_does_not_leak_password(caplog):
    # La commande contient le mot de passe, comme le DSN PostgreSQL passé à ogr2ogr.
    cmd = ["echo", f"\"PG:password='{SECRET}'\"", ">/dev/null;", "echo", "boom", ">&2;", "exit", "3"]

    with caplog.at_level(logging.INFO), pytest.raises(RuntimeError) as exc_info:
        run_command(cmd)

    assert str(exc_info.value) == "echo a échoué (code 3)"
    assert SECRET not in caplog.text
    assert "boom" in caplog.text
