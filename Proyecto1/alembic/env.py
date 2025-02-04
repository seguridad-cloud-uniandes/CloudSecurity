from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.database import DATABASE_URL, Base
from app.models import User  # Importa tus modelos aquí

# Configuración de logging
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Asigna el MetaData de tus modelos
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Ejecuta las migraciones en modo 'offline'."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecuta las migraciones en modo 'online'."""
    connectable = engine_from_config(
        {"sqlalchemy.url": DATABASE_URL},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
