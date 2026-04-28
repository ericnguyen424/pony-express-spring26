"""
This file contains the engine which supports database operations

"""

import os
from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, Request
from jose import ExpiredSignatureError, JWTError, jwt

from sqlmodel import Session, SQLModel, create_engine, text

from app.database import accounts as accounts_db
from app.database.schema import Account as DBAccount
from app.exceptions import NotAuthenticatedException

engine = create_engine("sqlite:///data/development.db", echo=True)

JWT_ALGORITHM = "HS256"
JWT_SECRET_KEY = os.environ.get(
    "PONY_EXPRESS_JWT_SECRET_KEY",
    default="pony-express-dev-secret-key",
)
JWT_ISSUER = "http://127.0.0.1"


def initialize_database():
    """Initialize database tables and enable SQLite foreign key checks."""

    SQLModel.metadata.create_all(engine)

    # turn on foreign keys
    with engine.connect() as connection:
        _ = connection.execute(text("PRAGMA foreign_key=ON"))


# Session Dependency
def get_session() -> Generator[Session]:
    """Yield a database session for request-scoped dependency injection."""

    with Session(engine) as session:
        yield session


DBSession = Annotated[Session, Depends(get_session)]


def _get_request_access_token(request: Request) -> str | None:
    """Get access token from cookie or bearer authorization header."""

    cookie_token = request.cookies.get("pony_express_token")
    if cookie_token:
        return cookie_token

    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip()

    return None


def get_current_account(session: DBSession, request: Request) -> DBAccount:
    """Authenticate request and return the associated account."""

    token = _get_request_access_token(request)
    if token is None:
        raise NotAuthenticatedException("not_provided")

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except ExpiredSignatureError as e:
        raise NotAuthenticatedException("expired") from e
    except JWTError as e:
        raise NotAuthenticatedException("invalid") from e

    if payload.get("iss") != JWT_ISSUER:
        raise NotAuthenticatedException("invalid")

    account_id_str = payload.get("sub")
    if not isinstance(account_id_str, str) or not account_id_str.isdigit():
        raise NotAuthenticatedException("invalid")

    account = accounts_db.get_account(session, int(account_id_str))
    if account is None:
        raise NotAuthenticatedException("invalid")

    return account


CurrentAccount = Annotated[DBAccount, Depends(get_current_account)]
