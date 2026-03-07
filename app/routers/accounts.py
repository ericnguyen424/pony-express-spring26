from typing import Literal

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from app.models.accounts import Account, AccountCollection, AccountCreate, AccountUpdate
from app.models.shared import CollectionMetadata

# Database Imports
from app.database import accounts as accounts_db
from app.database.schema import Account as DBAccount
from app.dependencies import DBSession

accounts_router = APIRouter(prefix="/accounts", tags=["Accounts"])


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
