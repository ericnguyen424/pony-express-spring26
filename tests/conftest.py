from collections.abc import Generator

import pytest
from sqlmodel import Session, SQLModel, StaticPool, create_engine
from starlette.testclient import TestClient

from app.dependencies import get_session
from app.main import app


@pytest.fixture
def session() -> Generator[Session]:
    engine = create_engine(
        "sqlite:///data/development.db",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    SQLModel.metadata.create_all(engine)
    with Session(engine) as test_session:
        yield test_session


@pytest.fixture
def test_client(session: Session) -> Generator[TestClient]:
    def get_test_session():
        yield session

    app.dependency_overrides[get_session] = get_test_session

    yield TestClient(app)
    app.dependency_overrides.clear()
