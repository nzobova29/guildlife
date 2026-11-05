from sqlalchemy import create_engine, pool

from alembic import context
from app import (
    ai,  # noqa: F401
    models,  # noqa: F401
)
from app.db import DATABASE_URL, Base


def offline():
    context.configure(url=DATABASE_URL, target_metadata=Base.metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def online():
    engine = create_engine(DATABASE_URL, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    offline()
else:
    online()
