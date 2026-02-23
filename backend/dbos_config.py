import os

from dbos import DBOS, DBOSConfig
from fastapi import FastAPI


def init_dbos(app: FastAPI) -> DBOS:
    config: DBOSConfig = {"name": "claude-agent-sdk-sample-app"}

    database_url = os.environ.get("DBOS_DATABASE_URL")
    if database_url:
        config["system_database_url"] = database_url

    return DBOS(fastapi=app, config=config)
