from typing import Literal

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from app.models.accounts import Account, AccountCollection
from app.models.shared import CollectionMetadata

from app.assign02_data import ACCOUNTS # to be deleted in future


accounts_router = APIRouter(prefix="/accounts", tags=["Accounts"])


@accounts_router.get("")
def get_accounts(sort: Literal["id", "username"] = "id") -> AccountCollection:
    """Retrieve the list of accounts default sorted by ID. Pass in 'username' if you wish to sort by usernames."""
    accounts = sorted(ACCOUNTS, key=lambda account: account[sort])
    accounts = [Account(**account) for account in accounts]

    return AccountCollection(
        metadata=CollectionMetadata(count=len(accounts), sort=sort),
        accounts=accounts,
    )


@accounts_router.get("/{account_id}")
def get_account(account_id: int) -> Account:
    """Retrieve an account matching a given account_id. Returns 404 if not found."""
    for account in ACCOUNTS:
        if account["id"] == account_id:
            return Account(**account)

    raise HTTPException(404)

