import os
from typing import Literal

from fastapi import APIRouter, Form, Request, Response, status
from fastapi.exceptions import HTTPException
from jose import JWTError, jwt

from app.models.accounts import (
    Account,
    AccountCollection,
    AccountCreate,
    AccountUpdate,
    AuthenticatedAccount,
)
from app.models.shared import CollectionMetadata

# Database Imports
from app.database import accounts as accounts_db
from app.database.schema import Account as DBAccount
from app.dependencies import DBSession
from app.exceptions import UnauthorizedException

accounts_router = APIRouter(prefix="/accounts", tags=["Accounts"])

JWT_ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-key")


def _get_request_access_token(request: Request) -> str | None:
    """Get access token from cookie or bearer authorization header."""

    cookie_token = request.cookies.get("pony_express_token")
    if cookie_token:
        return cookie_token

    authorization = request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip()

    return None


def _get_authenticated_account(session: DBSession, request: Request) -> DBAccount:
    """Authenticate request and return account from token claims."""

    token = _get_request_access_token(request)
    if token is None:
        raise UnauthorizedException()

    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as e:
        raise UnauthorizedException() from e

    account_id = payload.get("account_id")
    if not isinstance(account_id, int):
        raise UnauthorizedException()

    account = accounts_db.get_account(session, account_id)
    if account is None:
        raise UnauthorizedException()

    return account


@accounts_router.get("")
def get_accounts(
    session: DBSession, sort: Literal["id", "username"] = "id"
) -> AccountCollection:
    """Retrieve the list of accounts default sorted by ID. Pass in 'username' if you wish to sort by usernames."""

    db_accounts = accounts_db.get_accounts(session, sort=sort)
    accounts = [
        Account(**db_account.model_dump(exclude={"hashed_password"}))
        for db_account in db_accounts
    ]

    return AccountCollection(
        metadata=CollectionMetadata(count=len(accounts), sort=sort),
        accounts=accounts,
    )


@accounts_router.get("/me", response_model=AuthenticatedAccount)
def get_current_account(session: DBSession, request: Request) -> AuthenticatedAccount:
    """Retrieve authenticated account details."""

    db_account = _get_authenticated_account(session, request)
    return AuthenticatedAccount(
        id=db_account.id,
        username=db_account.username,
        email=db_account.email,
    )


@accounts_router.patch("/me", response_model=AuthenticatedAccount)
def update_current_account(
    session: DBSession,
    request: Request,
    update: AccountUpdate,
) -> AuthenticatedAccount:
    """Update authenticated account username and/or email."""

    db_account = _get_authenticated_account(session, request)
    updated_account = accounts_db.update(session, db_account.id, update)

    return AuthenticatedAccount(
        id=updated_account.id,
        username=updated_account.username,
        email=updated_account.email,
    )


@accounts_router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_current_account_password(
    session: DBSession,
    request: Request,
    old_password: str = Form(...),
    new_password: str = Form(...),
) -> Response:
    """Update authenticated account password."""

    db_account = _get_authenticated_account(session, request)
    _ = accounts_db.update_password(
        session,
        db_account.id,
        old_password,
        new_password,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@accounts_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_account(
    session: DBSession,
    request: Request,
    response: Response,
) -> Response:
    """Delete authenticated account and clear auth cookie."""

    db_account = _get_authenticated_account(session, request)
    accounts_db.delete_account(session, db_account.id)
    response.delete_cookie(key="pony_express_token")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@accounts_router.get("/{account_id}", response_model=Account)
def get_account(session: DBSession, account_id: int) -> Account:
    """Retrieve an account matching a given account_id. Returns 404 if not found."""

    db_account = accounts_db.find(session, account_id)
    return Account(**db_account.model_dump(exclude={"hashed_password"}))

@accounts_router.post("", response_model=Account, status_code=201)
def create_account(session: DBSession, create: AccountCreate) -> Account:
    """Add a new account"""

    db_account = accounts_db.create(session, create)
    return Account(**db_account.model_dump(exclude={"hashed_password"}))
