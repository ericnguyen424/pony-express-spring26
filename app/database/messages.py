"""
Database functionality for messages table

"""

from collections.abc import Sequence
from sqlmodel import Session, select
from app.database.schema import Message, Chat
from app.models.messages import MessageCreate, MessageUpdate
from app.exceptions import BadRequestException, EntityNotFoundException
from app.database.accounts import find as find_account
from app.database.chats import find as find_chat
from app.database.chats import is_account_in_chat

# Retrieve **all messages belonging to a specific chat**
def get_messages_by_chat_id(
    session: Session,
    chat_id=int,
) -> Sequence[Message] | None:
    """Retrieve all messages that belong to a specific chat.

    Args:
        session (Session): the database session
        chat_id: chat id to retrieve from
    Returns:
        Sequence[Message]: the sequence of messages in the chat or none
    """
    chat_exists = session.get(Chat, chat_id)
    if chat_exists is None:
        return None

    stmt = select(Message).where(Message.chat_id == chat_id).order_by("created_at")

    results = session.exec(stmt)
    return results.all()


def create(session: Session, create: MessageCreate) -> Message:
    """Add new message to database
    
    Args:
        session (Session): the database session
        create (MessageCreate): the attributes for creating a message
        
    Returns:
        newly created Message stripped of whitespace

    Raises:
        EntityNotFoundException if no such account_id or chat_id exists
        BadRequestException if text is empty or account is non member
    """
    
    # Raise exception if account_id or chat_id doesn't exist
    find_account(create.account_id)
    find_chat(create.chat_id)
    
    if is_account_in_chat(session, create.account_id, create.chat_id) is False:
        raise BadRequestException("invalid_parameter", f"Account with id {create.account_id} is not a member of chat with id {create.chat_id}")
    
    text = create.text.strip()
    if len(text) == 0:
        raise BadRequestException("invalid_parameter", f"Text is empty!")

    message = Message(**create.model_dump())
    session.add(message)
    session.commit()
    session.refresh(message)

    return message