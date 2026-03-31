from sqlalchemy import Table, Column, Integer, Float, MetaData
from sqlalchemy.dialects.postgresql import TIMESTAMPTZ

metadata = MetaData()

bronze_weather_current = Table(
    "bronze_weather_current", metadata,
    Column("id",                Integer, primary_key=True, autoincrement=True),
    Column("fetched_at",        TIMESTAMPTZ, nullable=False),
    Column("time",              TIMESTAMPTZ, nullable=False),
    Column("precipitation",     Float),
    Column("rain",              Float),
    Column("showers",           Float),
    Column("relative_humidity", Float),
    Column("cloudcover",        Float),
    Column("windspeed_10m",     Float),
)

bronze_weather_hourly = Table(
    "bronze_weather_hourly", metadata,
    Column("id",                Integer, primary_key=True, autoincrement=True),
    Column("fetched_at",        TIMESTAMPTZ, nullable=False),
    Column("time",              TIMESTAMPTZ, nullable=False, unique=True),
    Column("precipitation",     Float),
    Column("rain",              Float),
    Column("showers",           Float),
    Column("relative_humidity", Float),
    Column("cloudcover",        Float),
    Column("windspeed_10m",     Float),
)