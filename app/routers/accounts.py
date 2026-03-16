import os

from typing import Literal

from fastapi import APIRouter, Form, Request, Response, status
from jose import ExpiredSignatureError, JWTError, jwt

from app.auth import verify_with_legacy_support
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
from app.exceptions import NotAuthenticatedException, UnauthorizedAccessException

accounts_router = APIRouter(prefix="/accounts", tags=["Accounts"])

JWT_ALGORITHM = "HS256"
JWT_SECRET_KEY = os.environ.get(
    "PONY_EXPRESS_JWT_SECRET_KEY",
    default="pony-express-dev-secret-key",
)
JWT_ISSUER = "http://127.0.0.1"


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

    account_id = int(account_id_str)

    account = accounts_db.get_account(session, account_id)
    if account is None:
        raise NotAuthenticatedException("invalid")

    return account


def _delete_auth_cookie_if_present(request: Request, response: Response) -> None:
    """Delete auth cookie from the response only when one is present on request."""

    if request.cookies.get("pony_express_token") is not None:
        response.delete_cookie(key="pony_express_token")


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
    """Retrieve account details for the authenticated request token."""

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
    """Update username and/or email for the authenticated account."""

    db_account = _get_authenticated_account(session, request)
    updated_account = accounts_db.update(session, db_account.id, update)

    return AuthenticatedAccount(
        id=updated_account.id,
        username=updated_account.username,
        email=updated_account.email,
    )


@accounts_router.put("/me/password", status_code=status.HTTP_204_NO_CONTENT)
def update_current_password(
    session: DBSession,
    request: Request,
    old_password: str = Form(...),
    new_password: str = Form(...),
) -> Response:
    """Update authenticated account password after validating old password."""

    db_account = _get_authenticated_account(session, request)

    if not verify_with_legacy_support(old_password, db_account.hashed_password):
        raise UnauthorizedAccessException()

    accounts_db.update_password(
        session,
        db_account.id,
        AccountUpdate(password=new_password),
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@accounts_router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_current_account(
    session: DBSession,
    request: Request,
) -> Response:
    """Delete authenticated account and clear cookie token when present."""

    db_account = _get_authenticated_account(session, request)
    accounts_db.delete_account(session, db_account.id)

    response = Response(status_code=status.HTTP_204_NO_CONTENT)
    _delete_auth_cookie_if_present(request, response)
    return response


@accounts_router.get("/{account_id}", response_model=Account)
def get_account(session: DBSession, account_id: int) -> Account:
    """Retrieve an account matching a given account_id. Returns 404 if not found."""

    db_account = accounts_db.find(session, account_id)
    return Account(**db_account.model_dump(exclude={"hashed_password"}))


@accounts_router.post("", response_model=Account, status_code=201)
def create_account(session: DBSession, create: AccountCreate) -> Account:
    """Create a new account and return public account details."""

    db_account = accounts_db.create(session, create)
    return Account(**db_account.model_dump(exclude={"hashed_password"}))
