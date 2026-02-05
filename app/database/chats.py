"""
Database functionality for chats table

"""

from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select
from app.database.schema import *


# Retrieve **all chats**
def get_chats(
        session: Session,
        sort: Literal["id", "name"] = "id", 
) -> Sequence[Account]:
    """Retrieve all chats from the database.

    Args:
        session (Session): the database session
        sort (str): the column by which to order the collection (default="id")
    Returns:
        Sequence[Chat]: the sequence of chats in the database
    """

    stmt = select(Chat).order_by(sort)
    results = session.exec(stmt)
    return results.all()

    
# Retrieve **one account** by ID
def get_chat(session: Session, chat_id: int) -> Chat | None:
    """Retrieve chat from database by its id.

    Args:
        session (Session): the database session
        chat_id (int): the id of the requested account
    Returns:
        Chat: if a chat with the id exists
        None: if no chat with the id exists
    """

    return session.get(Chat, chat_id)

