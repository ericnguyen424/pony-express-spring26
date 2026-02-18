"""
Database functionality for chats table

"""

from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select
from app.database.schema import Account, Chat
from app.models.chats import ChatCreate, ChatUpdate
from app.exceptions import EntityNotFoundException

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

def find(session: Session, chat_id: int) -> Chat:
    """Retrieve chat from db by its id.
    
    Args: 
        session (Session): db session
        chat_id (int): id of requested chat

    Returns:
        Book with given id

    Raises:
        EntityNotFoundException if not found
    """

    chat = get_chat(session, chat_id)
    if chat is None:
        raise EntityNotFoundException("chat", chat_id)
    return chat

def create(session: Session, create: ChatCreate) -> Chat:
    """Add new chat to database
    
    Args:
        session (Session): the database session
        create (ChatCreate): the attributes for creatinga. chat
        
    Returns:
        newly created chat
    """

    chat = Chat(**create.model_dump())
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat

def update(session: Session, chat_id: int, update: ChatUpdate) -> Chat:
    """Update a chat in the database
    
    Args:
        session (Session): the database session
        chat_id (int): id of chat to update
        update (ChatUpdate): new attributes for Chat

    Returns:
        Updated Chat

    Raises EntityNotFoundException: If no such chat exists
    """

    chat = find(session, chat_id)
    chat.name = update.name
    chat.owner_id = update.owner_id

    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat

def delete(session: Session, chat_id: int) -> None:
    """Remove a chat from the databse
    
    Args:
        session (Session): the database session
        chat_id (int): The id of chat to remove

    Returns: 
        None

    Raises:
        EntityNotFoundException: if no such chat exists
    """

    chat = find(session, chat_id)
    session.delete(chat)
    session.commit()