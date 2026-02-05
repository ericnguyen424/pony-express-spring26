"""
Database functionality for messages table

"""
from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select
from app.database.schema import *

# Retrieve **all messages belonging to a specific chat**
def get_messages_by_chat_id(
        session: Session, 
        chat_id = int,
) -> Sequence[Message] | None:
    """Retrieve all messages that belong to a specific chat.

    Args:
        session (Session): the database session
        chat_id: chat id to retrieve from
    Returns:
        Sequence[Message]: the sequence of messages in the chat or none
    """

    stmt = (
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by("created_at")
    )

    results = session.exec(stmt)
    return results.all()
    