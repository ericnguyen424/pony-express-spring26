"""
Database functionality for chat memberships table

"""

from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select
from app.database.schema import Account, ChatMembership, Chat


# Retrieve **accounts that belong to a specific chat**
def get_accounts_by_chat_id(
    session: Session, chat_id=int, sort: Literal["id", "username"] = "id"
) -> Sequence[Account] | None:
    """Retrieve all accounts that belong to a specific chat.

    Args:
        session (Session): the database session
        chat_id: chat id to retrieve from
        sort (str): the column by which to order the account collection (default="id")
    Returns:
        Sequence[Account]: the sequence of accounts in the chat or none
    """

    chat_exists = session.get(Chat, chat_id)
    if chat_exists is None:
        return None

    stmt = (
        select(Account)
        .join(ChatMembership)
        .where(ChatMembership.chat_id == chat_id)
        .order_by(sort)
    )

    results = session.exec(stmt)
    return results.all()
