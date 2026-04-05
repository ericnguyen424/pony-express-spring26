from collections.abc import Generator

import pytest
from sqlmodel import Session, SQLModel, StaticPool, create_engine
from starlette.testclient import TestClient

from app import auth as auth_module
from app.dependencies import get_session
from app.main import app


def _hash_password_stub(password: str) -> str:
    return f"stubbed::{password}"


def _verify_password_stub(password: str, hashed_password: str) -> bool:
    return hashed_password == _hash_password_stub(password)


def _patch_attrs(monkeypatch, target, replacements: dict[str, object]) -> None:
    for attr_name, replacement in replacements.items():
        monkeypatch.setattr(target, attr_name, replacement)


def _stubbed_auth_replacements() -> dict[str, object]:
    return {
        "hash": _hash_password_stub,
        "verify": _verify_password_stub,
        "verify_with_legacy_support": _verify_password_stub,
    }


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


@pytest.fixture
def stub_password_hashing(monkeypatch):
    auth_replacements = _stubbed_auth_replacements()

    _patch_attrs(monkeypatch, auth_module, auth_replacements)
