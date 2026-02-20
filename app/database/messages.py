"""
Database functionality for messages table

"""

from collections.abc import Sequence
from sqlmodel import Session, select
from app.database.schema import Message, Chat
from app.models.messages import MessageCreate, MessageUpdate
from app.exceptions import (
    BadRequestException,
    EntityNotFoundException,
    UnauthorizedException,
)
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


def get_message(session: Session, message_id: int, chat_id: int) -> Message | None:
    """Retrieve message from database by its id and chat_id.

    Args:
        session (Session): the database session
        message_id (int): the id of the requested message
        chat_id (int): the id of the chat
    Returns:
        Message: if a message with the id exists in the chat
        None: if no message with the id exists

    """

    stmt = select(Message).where(Message.id == message_id, Message.chat_id == chat_id)
    result = session.exec(stmt).first()
    return result


def create(session: Session, create: MessageCreate) -> Message:
    """Add new message to database

    Args:
        session (Session): the database session
        create (MessageCreate): the attributes for creating a message

    Returns:
        newly created Message stripped of whitespace

    Raises:
        EntityNotFoundException if no such account_id or chat_id exists
        BadRequestException if text is empty
        UnauthorizedException if account is not apart of chat
    """

    # Raise exception if account_id or chat_id doesn't exist
    find_account(session, create.account_id)
    find_chat(session, create.chat_id)

    if is_account_in_chat(session, create.account_id, create.chat_id) is False:
        raise UnauthorizedException()

    text = create.text.strip()
    if len(text) == 0:
        raise BadRequestException(error="invalid_parameter", message="Text is empty!")

    message = Message(**create.model_dump())
    session.add(message)
    session.commit()
    session.refresh(message)

    return message


def update(session: Session, message_id: int, update: MessageUpdate) -> Message:
    """Update a Message in the database

    Args:
        session (Session): the database session
        message_id (int): id of Message to update
        update (MessageUpdate): new attributes for Message

    Returns:
        Updated Message

    Raises:
        EntityNotFoundException if message/account not found
        UnauthorizedException if account doesn't belong to chat
        BadRequestException if text is empty
    """

    find_account(session, update.owner_id)
    if is_account_in_chat(session, update.account_id, update.chat_id) is False:
        raise UnauthorizedException()

    text = update.text.strip()
    if len(text) == 0:
        raise BadRequestException(error="invalid_parameter", message="Text is empty!")

    message = find(session, message_id, update.chat_id)
    message.account_id = update.account_id
    message.text = update.text
    session.add(message)
    session.commit()
    session.refresh(message)
    return message


def find(session: Session, message_id: int, chat_id: int) -> Message:
    """Retrieve message from db by its id.

    Args:
        session (Session): db session
        message_id (int): id of requested message
        chat_id (int): id of requested chat

    Returns:
        Message with given id

    Raises:
        EntityNotFoundException if message not found
    """

    message = get_message(session, message_id, chat_id)
    if message is None:
        raise EntityNotFoundException("message", message_id)
    return message


def delete(session: Session, message_id: int, chat_id: int) -> None:
    """Remove a message from a chat

    Args:
        session (Session): the database session
        message_id (int): The id of message to remove
        chat_id (int): The id of chat message is in

    Returns:
        None

    Raises:
        EntityNotFoundException: if no such chat/message exists
    """

    message = find(session, message_id, chat_id)
    session.delete(message)
    session.commit()
