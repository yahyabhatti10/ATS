from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import dotenv_values
from back_end.models import Base  # Adjust the import according to your project structure

# Read environment variables
config = dotenv_values()

# Set the SQLAlchemy database URL dynamically
sqlalchemy_url = f'postgresql://{config["DBUSER"]}:{config["DBPASS"]}@{config["DBHOST"]}/{config["DBNAME"]}'

# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
alembic_config = context.config

# Replace the sqlalchemy.url configuration with the one from the environment variables
alembic_config.set_main_option('sqlalchemy.url', sqlalchemy_url)

# Interpret the config file for Python logging.
fileConfig(alembic_config.config_file_name)

# Add your model's MetaData object here
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = alembic_config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        alembic_config.get_section(alembic_config.config_ini_section),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # Add any other configurations you need here
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
