"""Real PostgreSQL only; destructive resets are restricted to *_test databases."""

import os

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", "postgresql+psycopg://guildlife@127.0.0.1:55432/guildlife_test"
)
url = make_url(TEST_DATABASE_URL)
if url.get_backend_name() != "postgresql" or not (url.database or "").endswith("_test"):
    raise RuntimeError("Tests require a dedicated PostgreSQL database with name ending _test")
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from alembic import command  # noqa: E402
from app.db import Base, SessionLocal  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def migrated_database():
    command.upgrade(Config("alembic.ini"), "head")


@pytest.fixture(autouse=True)
def clean_database(migrated_database):
    engine = create_engine(TEST_DATABASE_URL)
    with engine.begin() as connection:
        tables = ", ".join(f'"{name}"' for name in Base.metadata.tables)
        connection.execute(text(f"TRUNCATE TABLE {tables} RESTART IDENTITY CASCADE"))
    engine.dispose()


@pytest.fixture
def db():
    with SessionLocal() as session:
        yield session


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
