import logging
import sys
import time
from io import TextIOWrapper
from typing import Sequence

from django.db.models.query import QuerySet


class LoggerStream:
    def __init__(self, logger):
        self.logger = logger

    def write(self, message):
        self.logger.info(message.rstrip())

    def flush(self):
        pass


class PrintProgress:
    logger: logging.Logger | None = None

    def __init__(
        self,
        data: Sequence | QuerySet,
        step: int | None = None,
        stdout: TextIOWrapper | logging.Logger | None = None,
        title: str = "",
    ):
        self.index = 0
        self.start_time = None
        if isinstance(data, QuerySet):
            self.total = data.count()
            self.data = iter(data.iterator())
        else:
            self.total = len(data)
            self.data = iter(data)
        if step:
            self.step = step
        else:
            self.step = self.total // 10
        if stdout:
            if isinstance(stdout, logging.Logger):
                self.stdout: LoggerStream | TextIOWrapper = LoggerStream(stdout)
            elif isinstance(stdout, TextIOWrapper):
                self.stdout = stdout
        elif self.logger:
            self.stdout = LoggerStream(self.logger)
        else:
            self.stdout = sys.stdout  # type: ignore
        if title:
            self.stdout.write(f"start {title} with {self.total} items")

    def get_remaining_time(self):
        elapsed_time = time.time() - self.start_time
        avg_time_per_item = elapsed_time / self.index
        estimated_total_time = avg_time_per_item * self.total
        remaining_time = estimated_total_time - elapsed_time
        mins, secs = divmod(remaining_time, 60)
        return int(mins), int(secs)

    def print_progress(self):
        if self.index % self.step == 0:
            mins, secs = self.get_remaining_time()
            width = len(str(self.total))
            self.stdout.write(f"{self.index:0{width}d}/{self.total} - Remaining: {mins:02d}m {secs:02d}s")

    def __iter__(self):
        return self

    def __next__(self):
        value = next(self.data)
        if self.start_time is None:
            self.start_time = time.time()
        self.index += 1
        self.print_progress()
        return value
