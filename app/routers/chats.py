from typing import Literal

from fastapi import APIRouter
from fastapi.exceptions import HTTPException

from app.models.chats import Chat, ChatCollection
from app.models.accounts import Account, AccountCollection
from app.models.shared import CollectionMetadata
from app.models.messages import Message, MessageCollection


from app.assign02_data import (
    ACCOUNTS,
    CHATS,
    MESSAGES,
    CHAT_MEMBERSHIPS,
)  # to be deleted in future


chat_router = APIRouter(prefix="/chats", tags=["Chats"])


@chat_router.get("")
def get_chats(sort: Literal["id", "name"] = "id") -> ChatCollection:
    """Retrieve the list of chats default sorted by ID. Pass in 'name' if you wish to sort by name."""
    chats = sorted(CHATS, key=lambda chat: chat[sort])
    chats = [Chat(**chat) for chat in chats]

    return ChatCollection(
        metadata=CollectionMetadata(count=len(chats), sort=sort),
        chats=chats,
    )


@chat_router.get("/{chat_id}")
def get_chat(chat_id: int) -> Chat:
    """Retrieve a chat matching a given chat_id. Returns 404 if not found."""
    for chat in CHATS:
        if chat["id"] == chat_id:
            return Chat(**chat)

    raise HTTPException(404)


@chat_router.get("/{chat_id}/accounts")
def get_chat_accounts(
    chat_id: int, sort: Literal["id", "username"] = "id"
) -> AccountCollection:
    """Returns all accounts present in the corresponding chat_id"""

    all_chat_ids = (chat["id"] for chat in CHATS)
    if chat_id not in all_chat_ids:
        raise HTTPException(404)

    account_ids = (
        membership["account_id"]
        for membership in CHAT_MEMBERSHIPS
        if membership.get("chat_id") == chat_id
    )

    accounts = sorted(
        (account for account in ACCOUNTS if account.get("id") in account_ids),
        key=lambda account: account[sort],
    )

    accounts = [Account(**account) for account in accounts]

    return AccountCollection(
        metadata=CollectionMetadata(count=len(accounts), sort=sort),
        accounts=accounts,
    )


@chat_router.get("/{chat_id}/messages")
def get_messages(chat_id: int) -> MessageCollection:
    """Retrieve all messages matching a given chat_id."""

    if chat_id not in [chat["id"] for chat in CHATS]:
        raise HTTPException(404)

    # Filter + sort messages by created_at
    messages = sorted(
        (message for message in MESSAGES if message["chat_id"] == chat_id),
        key=lambda message: message["created_at"],
    )

    messages = [Message(**message) for message in messages]

    return MessageCollection(
        metadata=CollectionMetadata(count=len(messages), sort="created_at"),
        messages=messages,
    )
