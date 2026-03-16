import json
from collections.abc import Generator
from datetime import datetime
from pathlib import Path

import pytest
from sqlmodel import Session
from sqlmodel import SQLModel, StaticPool, create_engine

from app.database import accounts as db_accounts
from app.database import chats as db_chats
from app.database.schema import Account, Chat, ChatMembership, Message
from app.exceptions import AccountUnproccessableContentException, ActionNotAllowedException
from app.models.accounts import AccountCreate, AccountUpdate
from app.models.chats import ChatCreate


@pytest.fixture
def session_json() -> Generator[Session]:
    """Isolated in-memory DB session loaded from tests/test_data.json."""

    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)

    test_data_path = Path(__file__).parent.parent / "test_data.json"
    with open(test_data_path) as f:
        data = json.load(f)

    with Session(engine) as session:
        for account_data in data["accounts"]:
            session.add(Account(**account_data))

        for chat_data in data["chats"]:
            session.add(Chat(**chat_data))

        for membership_data in data["chat_memberships"]:
            session.add(ChatMembership(**membership_data))

        for message_data in data["messages"]:
            if isinstance(message_data.get("created_at"), str):
                message_data["created_at"] = datetime.strptime(
                    message_data["created_at"], "%Y-%m-%d %H:%M:%S.%f"
                )
            session.add(Message(**message_data))

        session.commit()
        yield session


def test_db_get_accounts_sorted_by_id(session: Session):
    accounts = db_accounts.get_accounts(session, sort="id")
    assert len(accounts) > 0
    for i in range(1, len(accounts)):
        assert accounts[i].id > accounts[i - 1].id
    assert accounts[0].id == 1
    assert accounts[-1].id == accounts[-1].id


def test_db_get_accounts_sorted_by_username(session: Session):
    accounts = db_accounts.get_accounts(session, sort="username")
    assert len(accounts) > 0
    usernames = [acct.username for acct in accounts]
    assert usernames == sorted(usernames)
    assert usernames[0] == "admin"
    assert usernames[-1] == usernames[-1]


def test_db_get_account_valid_id(session: Session):
    account = db_accounts.get_account(session, 3)
    assert account is not None
    assert account.id == 3
    assert account.username == "bomb20"
    account2 = db_accounts.get_account(session, 9)
    assert account2 is not None
    assert account2.id == 9
    assert account2.username == "sarah"


def test_db_get_account_invalid_id(session: Session):
    account = db_accounts.get_account(session, 999)
    assert account is None

def test_db_create_account(session_json: Session, stub_password_hashing):
    created = db_accounts.create(
        session_json,
        AccountCreate(
            username="john",
            email="johndoe@gmail.com",
            password="random-pass-1",
        ),
    )

    assert created.id is not None
    fetched = db_accounts.find_by_username(session_json, "john")
    assert fetched is not None
    assert fetched.email == "johndoe@gmail.com"

    with pytest.raises(AccountUnproccessableContentException):
        db_accounts.create(
            session_json,
            AccountCreate(
                username="john",
                email="ericdoe@gmail.com",
                password="random-pass-2",
            ),
        )

    with pytest.raises(AccountUnproccessableContentException):
        db_accounts.create(
            session_json,
            AccountCreate(
                username="eric",
                email="johndoe@gmail.com",
                password="random-pass-3",
            ),
        )


def test_db_update_account(session_json: Session, stub_password_hashing):
    user_a = db_accounts.create(
        session_json,
        AccountCreate(
            username="Eric",
            email="erictest@gmail.com",
            password="random-pass-a",
        ),
    )
    user_b = db_accounts.create(
        session_json,
        AccountCreate(
            username="Victor",
            email="victortest@gmail.com",
            password="random-pass-b",
        ),
    )

    with pytest.raises(AccountUnproccessableContentException):
        db_accounts.update(session_json, user_a.id, AccountUpdate(username="Victor"))
    unchanged_a = db_accounts.find(session_json, user_a.id)
    assert unchanged_a.username == "Eric"

    with pytest.raises(AccountUnproccessableContentException):
        db_accounts.update(
            session_json,
            user_a.id,
            AccountUpdate(email="victortest@gmail.com"),
        )
    unchanged_a = db_accounts.find(session_json, user_a.id)
    assert str(unchanged_a.email) == "erictest@gmail.com"

    updated_a = db_accounts.update(
        session_json,
        user_a.id,
        AccountUpdate(email="randomtest@gmail.com"),
    )
    assert str(updated_a.email) == "randomtest@gmail.com"

    updated_b = db_accounts.update(
        session_json,
        user_b.id,
        AccountUpdate(email="erictest@gmail.com", username="Gustavo"),
    )
    assert str(updated_b.email) == "erictest@gmail.com"
    assert updated_b.username == "Gustavo"

    updated_a = db_accounts.update(
        session_json,
        user_a.id,
        AccountUpdate(username="Victor"),
    )
    assert updated_a.username == "Victor"


def test_db_delete_account(session_json: Session, stub_password_hashing):
    user_a = db_accounts.create(
        session_json,
        AccountCreate(
            username="DeleteA",
            email="deletea@gmail.com",
            password="delete-pass-a",
        ),
    )
    user_b = db_accounts.create(
        session_json,
        AccountCreate(
            username="DeleteB",
            email="deleteb@gmail.com",
            password="delete-pass-b",
        ),
    )

    chat_1 = db_chats.create(
        session_json,
        ChatCreate(name="owner-chat-1", owner_id=user_b.id),
    )
    chat_2 = db_chats.create(
        session_json,
        ChatCreate(name="owner-chat-2", owner_id=user_b.id),
    )

    db_accounts.delete_account(session_json, user_a.id)
    assert db_accounts.get_account(session_json, user_a.id) is None

    with pytest.raises(ActionNotAllowedException):
        db_accounts.delete_account(session_json, user_b.id)

    db_chats.delete(session_json, chat_1.id)
    db_chats.delete(session_json, chat_2.id)
    db_accounts.delete_account(session_json, user_b.id)
    assert db_accounts.get_account(session_json, user_b.id) is None

