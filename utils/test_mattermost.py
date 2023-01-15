# import pytest

from utils.mattermost import Mattermost, StartupSparte, SwannPrivate, format_table


class TestMattermost:
    def test_format_table(self):
        data = [
            {
                "input": [["1", "2", "5"], ["3", "4", "6"]],
                "headers": None,
                "output": "| 1 | 2 | 5 |\n| 3 | 4 | 6 |\n",
            },
            {
                "input": [["1", "2"]],
                "headers": None,
                "output": "| 1 | 2 |\n",
            },
            {
                "input": [["1", "2"]],
                "headers": ["a", "b"],
                "output": "| a | b |\n|--|--|\n| 1 | 2 |\n",
            },
        ]
        for row in data:
            assert format_table(row["input"], headers=row["headers"]) == row["output"]

    def test_init(self):
        msg = "Hello World"
        channel = "Development"
        mattermost = Mattermost(msg, channel)
        assert mattermost.msg == msg
        assert mattermost.channel == channel
        assert mattermost.information == ""

    def test_init_StartupSparte(self):
        msg = "Hello World"
        mattermost = StartupSparte(msg)
        assert mattermost.msg == msg
        assert mattermost.channel == "startup-sparte"
        assert mattermost.information == ""

    def test_init_Swann(self):
        msg = "Hello World"
        mattermost = SwannPrivate(msg)
        assert mattermost.msg == msg
        assert mattermost.channel == "@Swann"
        assert mattermost.information == ""
