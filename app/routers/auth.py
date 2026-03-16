from datetime import datetime, timezone
import os

from fastapi import APIRouter, Form, Request, Response, status
from jose import jwt
from pydantic import EmailStr

from app import auth
from app.database import accounts as accounts_db
from app.dependencies import DBSession
from app.database.schema import Account as DBAccount
from app.exceptions import UnauthorizedAccessException
from app.models.accounts import AccountCreate, AuthenticatedAccount

auth_router = APIRouter(prefix="/auth", tags=["Auth"])

JWT_ALGORITHM = "HS256"
JWT_SECRET_KEY = os.environ.get(
    "PONY_EXPRESS_JWT_SECRET_KEY",
    default="pony-express-dev-secret-key",
)
JWT_ISSUER = "http://127.0.0.1"
ACCESS_TOKEN_EXPIRE_SECONDS = 3600


async def _read_form_or_json_payload(request: Request) -> dict:
    """Read request payload from form body with JSON fallback."""

    payload: dict = {}

    try:
        form_data = await request.form()
        if form_data:
            payload = dict(form_data)
    except Exception:
        payload = {}

    if payload:
        return payload

    try:
        json_data = await request.json()
    except Exception:
        return {}

    if isinstance(json_data, dict):
        return json_data

    return {}


def _upgrade_bcrypt_hash_if_needed(
    session: DBSession,
    account: DBAccount,
    password: str,
) -> None:
    """Upgrade bcrypt password hash to argon2 when credentials are valid."""

    if not auth.is_bcrypt_hash(account.hashed_password):
        return

    if not auth.verify_with_legacy_support(password, account.hashed_password):
        raise UnauthorizedAccessException()

    account.hashed_password = auth.hash(password)
    session.add(account)
    session.commit()
    session.refresh(account)


def _authenticate_account(
    session: DBSession,
    username: str,
    password: str,
) -> DBAccount:
    """Authenticate account credentials and return the db account."""

    account = accounts_db.find_by_username(session, username)
    if account is None:
        raise UnauthorizedAccessException()

    _upgrade_bcrypt_hash_if_needed(session, account, password)

    if not auth.verify(password, account.hashed_password):
        raise UnauthorizedAccessException()

    return account


def _create_access_token(account: DBAccount) -> str:
    """Create an access token for an authenticated account."""

    issued_at = int(datetime.now(timezone.utc).timestamp())
    expires_at = issued_at + ACCESS_TOKEN_EXPIRE_SECONDS

    return jwt.encode(
        {
            "sub": str(account.id),
            "iss": JWT_ISSUER,
            "iat": issued_at,
            "exp": expires_at,
        },
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )


@auth_router.post(
    "/registrations",
    response_model=AuthenticatedAccount,
    status_code=status.HTTP_201_CREATED,
)
async def register_account(
    session: DBSession,
    request: Request,
    username: str | None = Form(default=None),
    email: EmailStr | None = Form(default=None),
    password: str | None = Form(default=None),
) -> AuthenticatedAccount:
    """Register a new account and return authenticated account details."""

    payload = await _read_form_or_json_payload(request)
    resolved_username = username if username is not None else payload.get("username")
    resolved_email = email if email is not None else payload.get("email")
    resolved_password = password if password is not None else payload.get("password")

    created = accounts_db.create(
        session,
        AccountCreate(
            username=resolved_username,
            email=resolved_email,
            password=resolved_password,
        ),
    )
    return AuthenticatedAccount(**created.model_dump(exclude={"hashed_password"}))


@auth_router.post("/tokens", status_code=status.HTTP_200_OK)
async def create_token(
    session: DBSession,
    request: Request,
    username: str | None = Form(default=None),
    password: str | None = Form(default=None),
) -> dict[str, str]:
    """Authenticate credentials and return a bearer access token."""

    payload = await _read_form_or_json_payload(request)
    resolved_username = username if username is not None else payload.get("username")
    resolved_password = password if password is not None else payload.get("password")

    account = _authenticate_account(session, resolved_username, resolved_password)
    access_token = _create_access_token(account)

    return {"access_token": access_token, "token_type": "bearer"}


@auth_router.post("/logins", status_code=status.HTTP_204_NO_CONTENT)
async def login(
    session: DBSession,
    response: Response,
    request: Request,
    username: str | None = Form(default=None),
    password: str | None = Form(default=None),
) -> Response:
    """Authenticate credentials and store an HTTP-only access token cookie."""

    payload = await _read_form_or_json_payload(request)
    resolved_username = username if username is not None else payload.get("username")
    resolved_password = password if password is not None else payload.get("password")

    account = _authenticate_account(session, resolved_username, resolved_password)
    access_token = _create_access_token(account)

    response.set_cookie(
        key="pony_express_token",
        value=access_token,
        httponly=True,
    )
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@auth_router.delete("/logins", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> Response:
    """Clear the auth cookie and return no content."""

    response.delete_cookie(key="pony_express_token")
    response.status_code = status.HTTP_204_NO_CONTENT
    return response
