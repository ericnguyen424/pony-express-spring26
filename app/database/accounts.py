"""
Database functionality for accounts table

"""

from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select
from app.database.schema import Account


# Retrieve **all accounts**
def get_accounts(
    session: Session,
    sort: Literal["id", "username"] = "id",
) -> Sequence[Account]:
    """Retrieve all accounts from the database.

    Args:
        session (Session): the database session
        sort (str): the column by which to order the collection (default="id")
    Returns:
        Sequence[Account]: the sequence of accounts in the database
    """

    stmt = select(Account).order_by(sort)
    results = session.exec(stmt)
    return results.all()


# Retrieve **one account** by ID
def get_account(session: Session, account_id: int) -> Account | None:
    """Retrieve account from database by its id.

    Args:
        session (Session): the database session
        account_id (int): the id of the requested account
    Returns:
        Account: if an account with the id exists
        None: if no account with the id exists
    """

    return session.get(Account, account_id)
