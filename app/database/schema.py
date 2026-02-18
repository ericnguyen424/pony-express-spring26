"""Database table models."""

# Note that basic type-checking is used to suppress unnecessary type warnings
# pyright: basic

from datetime import datetime
from typing import ClassVar

from sqlmodel import Field, Relationship, SQLModel


class ChatMembership(SQLModel, table=True):
    """Chat memberships table.

    Each row represents the membership of an account in a chat.

    Fields:
        account_id: primary key and id of the membership account
        chat_id: primary key and id of the membership chat

    Relationships:
        account: the account of the membership
        chat: the chat of the membership
    """

    __tablename__: ClassVar[str] = "chat_memberships"

    # fields
    account_id: int = Field(
        foreign_key="accounts.id",
        primary_key=True,
        ondelete="CASCADE",
    )
    chat_id: int = Field(
        foreign_key="chats.id",
        primary_key=True,
        ondelete="CASCADE",
    )

    # relationships
    account: "Account" = Relationship(back_populates="memberships")
    chat: "Chat" = Relationship(back_populates="memberships")


class Administrator(SQLModel, table=True):
    """Administrators table.

    Each row represents marks an account as administrator

    Fields:
        account_id: primary key and the id of the administrator account

    Relationships:
        account: account marked as administrator
    """

    __tablename__: ClassVar[str] = "administrators"

    # fields
    account_id: int = Field(
        primary_key=True,
        foreign_key="accounts.id",
        ondelete="RESTRICT",
    )

    # relationships
    account: "Account" = Relationship(back_populates="administrator")


class Account(SQLModel, table=True):
    """Accounts table.

    Fields:
        id: primary key (managed by database engine)
        username: the username of the account
        email: the email address of the account
        hashed_password: the hash of the account password

    Relationships:
        administrator: account may be optionally marked as administrator
        owned_chats: list of chats owned by account
        chats: list of chats that of which account is a member
        messages: list of messages authored by account
        memberships: list of chat memberships of account
    """

    __tablename__: ClassVar[str] = "accounts"

    # fields
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    email: str = Field(unique=True)
    hashed_password: str

    # relationships
    administrator: Administrator | None = Relationship(
        back_populates="account",
        passive_deletes="all",
    )
    owned_chats: list["Chat"] = Relationship(
        back_populates="owner",
        passive_deletes="all",
    )
    chats: list["Chat"] = Relationship(
        back_populates="members",
        link_model=ChatMembership,
        sa_relationship_kwargs={"viewonly": True},
    )
    messages: list["Message"] = Relationship(
        back_populates="account",
        passive_deletes="all",
    )
    memberships: list[ChatMembership] = Relationship(
        back_populates="account",
        cascade_delete=True,
    )


class Chat(SQLModel, table=True):
    """Chats table.

    Fields:
        id: primary key (managed by database engine)
        name: the name of the chat
        owner_id: the id of the account that owns the chat

    Relationships:
        owner: the owner account of the chat
        accounts: the list of accounts that are members of chat
        messages: the list of the messages in chat
        memberships: the list of chat memberships of chat
    """

    __tablename__: ClassVar[str] = "chats"

    # fields
    id: int | None = Field(default=None, primary_key=True)
    name: str
    owner_id: int = Field(foreign_key="accounts.id", ondelete="RESTRICT")

    # relationships
    owner: Account = Relationship(back_populates="owned_chats")
    members: list[Account] = Relationship(
        back_populates="chats",
        link_model=ChatMembership,
        sa_relationship_kwargs={"viewonly": True},
    )
    messages: list["Message"] = Relationship(
        back_populates="chat",
        cascade_delete=True,
    )
    memberships: list[ChatMembership] = Relationship(
        back_populates="chat",
        cascade_delete=True,
    )


class Message(SQLModel, table=True):
    """Messages table.

    Fields:
        id: primary key (managed by database engine)
        text: the text content of the message
        account_id: the id of the account that authored the message
        chat_id: the id of the chat containing the message
        created_at: the timestamp of when message was created (managed by factory)

    Relationships:
        account: the account that authored the message
        chat: the chat containing the message
    """

    __tablename__: ClassVar[str] = "messages"

    # fields
    id: int | None = Field(default=None, primary_key=True)
    text: str
    account_id: int | None = Field(
        default=None,
        foreign_key="accounts.id",
        ondelete="SET NULL",
    )
    chat_id: int = Field(
        foreign_key="chats.id",
        ondelete="CASCADE",
    )
    created_at: datetime | None = Field(default_factory=datetime.now)

    # relationships
    account: Account = Relationship(back_populates="messages")
    chat: Chat = Relationship(back_populates="messages")
