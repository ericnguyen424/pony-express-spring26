from typing import Literal

from fastapi import APIRouter

# Model Imports
from app.models.chats import Chat, ChatCollection, ChatCreate, ChatUpdate
from app.models.accounts import Account, AccountCollection
from app.models.shared import CollectionMetadata
from app.models.messages import Message, MessageCollection, MessageCreate, MessageUpdate

# Database Imports
from app.database import chats as chats_db
from app.database import memberships as memberships_db
from app.database import messages as messages_db
from app.dependencies import DBSession

chat_router = APIRouter(prefix="/chats", tags=["Chats"])


@chat_router.get("")
def get_chats(session: DBSession, sort: Literal["id", "name"] = "id") -> ChatCollection:
    """Retrieve the list of chats default sorted by ID. Pass in 'name' if you wish to sort by name."""

    db_chats = chats_db.get_chats(session, sort=sort)
    chats = [Chat(**db_chat.model_dump()) for db_chat in db_chats]

    return ChatCollection(
        metadata=CollectionMetadata(count=len(chats), sort=sort),
        chats=chats,
    )


@chat_router.get("/{chat_id}", response_model=Chat)
def get_chat(session: DBSession, chat_id: int) -> Chat:
    """Retrieve a chat matching a given chat_id. Returns 404 if not found."""

    db_chat = chats_db.find(session, chat_id)
    return Chat(**db_chat.model_dump())


@chat_router.get("/{chat_id}/accounts")
def get_chat_accounts(
    session: DBSession, chat_id: int, sort: Literal["id", "username"] = "id"
) -> AccountCollection:
    """Returns all accounts present in the corresponding chat_id"""

    # Verify chat exists
    chats_db.find(session, chat_id)

    db_accounts = memberships_db.get_accounts_by_chat_id(session, chat_id, sort=sort)
    accounts = [
        Account(**db_account.model_dump(exclude={"hashed_password"}))
        for db_account in db_accounts
    ]

    return AccountCollection(
        metadata=CollectionMetadata(count=len(accounts), sort=sort),
        accounts=accounts,
    )


@chat_router.get("/{chat_id}/messages")
def get_messages(session: DBSession, chat_id: int) -> MessageCollection:
    """Retrieve all messages matching a given chat_id."""

    # Verify chat exists
    chats_db.find(session, chat_id)

    db_messages = messages_db.get_messages_by_chat_id(session, chat_id)

    messages = [Message(**db_message.model_dump()) for db_message in db_messages]

    return MessageCollection(
        metadata=CollectionMetadata(count=len(messages), sort="created_at"),
        messages=messages,
    )


@chat_router.post("", response_model=Chat, status_code=201)
def create_chat(session: DBSession, create: ChatCreate) -> Chat:
    """Add a new chat"""

    db_chat = chats_db.create(session, create)
    return db_chat


@chat_router.put("/{chat_id}", response_model=Chat)
def update_chat(session: DBSession, chat_id: int, update: ChatUpdate) -> Chat:
    """Update a chat"""

    db_chat = chats_db.update(session, chat_id, update)
    return db_chat


@chat_router.delete("/{chat_id}", status_code=204)
def delete_chat(session: DBSession, chat_id: int) -> None:
    """Remove a chat from the library"""

    chats_db.delete(session, chat_id)


@chat_router.post("/{chat_id}/messages", response_model=Message, status_code=201)
def create_message(session: DBSession, chat_id: int, create: MessageCreate) -> Message:
    """Add a new message to a chat"""

    db_message = messages_db.create(session, create)
    return Message(**db_message.model_dump())


@chat_router.patch("/{chat_id}/messages", response_model=Message)
def update_message(
    session: DBSession, chat_id: int, message_id: int, update: MessageUpdate
) -> Message:
    """Update a message in a chat"""

    db_message = messages_db.update(session, message_id, update)
    return Message(**db_message.model_dump())


@chat_router.delete("/{chat_id}/messages", status_code=204)
def delete_message(session: DBSession, chat_id: int, message_id: int) -> None:
    """Remove a message from a chat"""

    messages_db.delete(session, message_id, chat_id)


@chat_router.put("/{chat_id}/accounts", status_code=204)
def add_account_to_chat(session: DBSession, chat_id: int, account_id: int) -> None:
    """Add an account to a chat"""

    memberships_db.create(session, account_id, chat_id)


@chat_router.delete("/{chat_id}/accounts", status_code=204)
def remove_account_from_chat(session: DBSession, chat_id: int, account_id: int) -> None:
    """Remove an account from a chat"""

    memberships_db.delete(session, account_id, chat_id)
