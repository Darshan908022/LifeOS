
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    OPENROUTER_API_KEY: str
    OPENROUTER_MODEL: str = "openrouter/free"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, value):
        if isinstance(value, str):
            if value.startswith("postgres://"):
                return value.replace(
                    "postgres://",
                    "postgresql+psycopg://",
                    1,
                )

            if value.startswith("postgresql://"):
                return value.replace(
                    "postgresql://",
                    "postgresql+psycopg://",
                    1,
                )

        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()
