"""
This file contains the engine which supports database operations

"""

from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine, text

engine = create_engine("data/development.db", echo=True)

def initialize_database():
    from app.database import schema

    SQLModel.metadata.create_all(engine)

    # turn on foreign keys
    with engine.connect() as connection:
        _ = connection.execute(text("PRAGMA foreign_key=ON"))


# Session Dependency
def get_session() -> Generator[Session]:
    with Session(engine) as session:
        yield session

DBSession = Annotated[Session, Depends(get_session)]
