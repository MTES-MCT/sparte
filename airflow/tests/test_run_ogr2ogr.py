import logging
import subprocess
from unittest.mock import patch

import pytest
from include.utils import run_ogr2ogr

SECRET = "s3cr3t-pa55word"
# Le DSN PostgreSQL passé à ogr2ogr contient le mot de passe.
CMD = ["ogr2ogr", "-f", '"PostgreSQL"', f"\"PG:dbname='db' password='{SECRET}'\"", "/tmp/file.gpkg"]


def _completed(returncode: int, stdout: str = "", stderr: str = "") -> subprocess.CompletedProcess:
    return subprocess.CompletedProcess(args=" ".join(CMD), returncode=returncode, stdout=stdout, stderr=stderr)


@patch("include.utils.subprocess.run", return_value=_completed(0, stdout="ok"))
def test_logs_stdout_when_command_succeeds(mock_run, caplog):
    with caplog.at_level(logging.INFO):
        run_ogr2ogr(CMD)

    mock_run.assert_called_once()
    assert "ok" in caplog.text


@patch("include.utils.subprocess.run", return_value=_completed(3, stderr="boom"))
def test_failed_command_does_not_leak_password(mock_run, caplog):
    with caplog.at_level(logging.INFO), pytest.raises(RuntimeError) as exc_info:
        run_ogr2ogr(CMD)

    assert str(exc_info.value) == "ogr2ogr a échoué (code 3)"
    assert SECRET not in caplog.text
    assert "boom" in caplog.text


@pytest.mark.parametrize("cmd", [[], ["ogrinfo", "/tmp/file.gpkg"], ["rm", "-rf", "/tmp/dir"]])
@patch("include.utils.subprocess.run")
def test_refuses_commands_other_than_ogr2ogr(mock_run, cmd):
    with pytest.raises(ValueError):
        run_ogr2ogr(cmd)

    mock_run.assert_not_called()
