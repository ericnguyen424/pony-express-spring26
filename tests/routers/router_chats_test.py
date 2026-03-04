import json
from collections.abc import Generator
from pathlib import Path
from datetime import datetime

import pytest
from sqlmodel import Session, SQLModel, StaticPool, create_engine
from starlette.testclient import TestClient

from app.dependencies import get_session
from app.main import app
from app.database.schema import Account, Chat, ChatMembership, Message


@pytest.fixture
def session_json() -> Generator[Session]:
    """Session with in-memory database loaded from JSON test data"""
    # Create in-memory SQLite database
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    SQLModel.metadata.create_all(engine)
    
    # Load test data from JSON
    test_data_path = Path(__file__).parent.parent / "test_data.json"
    with open(test_data_path) as f:
        data = json.load(f)
    
    with Session(engine) as session:
        # Load accounts
        for account_data in data["accounts"]:
            account = Account(**account_data)
            session.add(account)
        
        # Load chats
        for chat_data in data["chats"]:
            chat = Chat(**chat_data)
            session.add(chat)
        
        # Load chat memberships
        for membership_data in data["chat_memberships"]:
            membership = ChatMembership(**membership_data)
            session.add(membership)
        
        # Load messages
        for message_data in data["messages"]:
            # Parse the created_at string to datetime
            if isinstance(message_data.get("created_at"), str):
                message_data["created_at"] = datetime.strptime(
                    message_data["created_at"], "%Y-%m-%d %H:%M:%S.%f"
                )
            message = Message(**message_data)
            session.add(message)
        
        session.commit()
        yield session


@pytest.fixture
def test_client_json(session_json: Session) -> Generator[TestClient]:
    """Test client with JSON-loaded isolated database"""
    def get_test_session():
        yield session_json

    app.dependency_overrides[get_session] = get_test_session

    yield TestClient(app)
    app.dependency_overrides.clear()


# @chat_router.get("")
# def get_chats(sort: Literal["id", "name"] = "id") -> ChatCollection:
# Retrieve the list of chats default sorted by ID.
# Pass in 'name' if you wish to sort by name."""
def test_get_chats_sorted_by_id(test_client):
    response = test_client.get("/chats?sort=id")
    assert response.status_code == 200

    data = response.json()
    expected_count = 6
    metadata = data["metadata"]

    assert metadata == {"count": expected_count, "sort": "id"}

    chats = data["chats"]
    assert len(chats) == expected_count

    for i in range(1, expected_count):
        assert chats[i]["id"] > chats[i - 1]["id"]

    assert chats[0]["id"] == 1 and chats[0]["name"] == "skynet"
    assert chats[-1]["id"] == 6 and chats[-1]["owner_id"] == 5


def test_get_chats_sorted_by_name(test_client):
    response = test_client.get("/chats?sort=name")
    assert response.status_code == 200

    data = response.json()
    chats = data["chats"]

    names = [chat["name"] for chat in chats]
    assert names == sorted(names)

    assert chats[0]["name"] == "newt"
    assert chats[-1]["name"] == "terminators"


# @chat_router.get("/{chat_id}")
# def get_chat(chat_id: int) -> Chat:
# Retrieve a chat matching a given chat_id.
# Returns 404 if not found.
def test_get_chat_valid_id_1(test_client):
    chat_id = 4
    response = test_client.get(f"/chats/{chat_id}")
    assert response.status_code == 200

    chat = response.json()
    assert chat["id"] == 4
    assert chat["name"] == "newt"
    assert chat["owner_id"] == 8


def test_get_chat_valid_id_2(test_client):
    chat_id = 6
    response = test_client.get(f"/chats/{chat_id}")
    assert response.status_code == 200

    chat = response.json()
    assert chat["id"] == 6
    assert chat["name"] == "sensory apparatus"
    assert chat["owner_id"] == 5


def test_get_chat_invalid_id(test_client):
    response = test_client.get("/chats/999")
    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


# @chat_router.get("/{chat_id}/accounts")
# def get_chat_accounts(chat_id: int, sort: Literal["id", "username"] = "id") -> AccountCollection:
# Returns all accounts present in the corresponding chat_id"""
def test_get_chat_accounts_sorted_by_id(test_client):
    response = test_client.get("/chats/3/accounts?sort=id")
    assert response.status_code == 200

    data = response.json()
    accounts = data["accounts"]
    assert len(accounts) == 3

    ids = [acct["id"] for acct in accounts]
    assert ids == sorted(ids)
    assert ids[0] == 2
    assert ids[-1] == 8


def test_get_chat_accounts_sorted_by_name(test_client):
    response = test_client.get("/chats/3/accounts?sort=username")
    assert response.status_code == 200

    data = response.json()
    accounts = data["accounts"]
    assert len(accounts) == 3

    usernames = [acct["username"] for acct in accounts]
    assert usernames == sorted(usernames)

    assert usernames[0] == "bishop"
    assert usernames[-1] == "ripley"


def test_get_chat_accounts_invalid_id(test_client):
    response = test_client.get("/chats/999/accounts?sort=username")
    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


# @chat_router.get("/{chat_id}/messages")
# def get_messages(chat_id: int) -> MessageCollection:
# Retrieve all messages matching a given chat_id."""
def test_get_messages_valid_id_1(test_client):
    response = test_client.get("/chats/1/messages")
    assert response.status_code == 200

    data = response.json()
    messages = data["messages"]

    assert len(messages) == 35

    # messages should be sorted by created_at
    timestamps = [msg["created_at"] for msg in messages]
    assert timestamps == sorted(timestamps)

    assert messages[-1]["text"] == "Yes."
    assert messages[0]["text"] == "This T-1000... what happens when you shoot it?"


def test_get_messages_valid_id_2(test_client):
    response = test_client.get("/chats/6/messages")
    assert response.status_code == 200

    data = response.json()
    messages = data["messages"]

    assert len(messages) == 42

    # messages should be sorted by created_at
    timestamps = [msg["created_at"] for msg in messages]
    assert timestamps == sorted(timestamps)

    assert messages[-1]["text"] == "You have no proof that it was correct data."
    assert messages[0]["text"] == "Hello, bomb, are you with me?"


def test_get_messages_invalid_id():
    test_client = TestClient(app)

    response = test_client.get("/chats/999/messages")
    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


# @chat_router.post("")
# def create_chat(create: ChatCreate) -> Chat:
# Add a new chat"""
def test_create_chat_valid(test_client_json):
    """Test creating a new chat with valid data"""
    chat_data = {"name": "new chat", "owner_id": 1}
    response = test_client_json.post("/chats", json=chat_data)

    assert response.status_code == 201
    data = response.json()

    assert data["name"] == "new chat"
    assert data["owner_id"] == 1
    assert data["id"] is not None


def test_create_chat_invalid_owner(test_client_json):
    """Test creating a chat with non-existent owner raises 404"""
    chat_data = {"name": "another chat", "owner_id": 999}
    response = test_client_json.post("/chats", json=chat_data)

    assert response.status_code == 404


def test_create_chat_duplicate_name(test_client_json):
    """Test creating a chat with duplicate name raises 422"""
    chat_data = {"name": "skynet", "owner_id": 1}
    response = test_client_json.post("/chats", json=chat_data)

    assert response.status_code == 422
    assert response.json() == {
        "error": "value_not_allowed",
        "message": "Not allowed: chat with name=skynet",
    }


# @chat_router.put("/{chat_id}")
# def update_chat(chat_id: int, update: ChatUpdate) -> Chat:
# Update a chat"""
def test_update_chat_valid(test_client_json):
    """Test updating an existing chat"""
    chat_id = 1
    update_data = {"name": "updated skynet", "owner_id": 2}
    response = test_client_json.put(f"/chats/{chat_id}", json=update_data)

    assert response.status_code == 200
    data = response.json()

    assert data["id"] == chat_id
    assert data["name"] == "updated skynet"
    assert data["owner_id"] == 2


def test_update_chat_invalid_id(test_client_json):
    """Test updating non-existent chat raises 404"""
    update_data = {"name": "updated chat", "owner_id": 1}
    response = test_client_json.put("/chats/999", json=update_data)

    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


def test_update_chat_invalid_owner(test_client_json):
    """Test updating chat with non-existent owner raises 422"""
    chat_id = 1
    update_data = {"name": "test", "owner_id": 999}
    response = test_client_json.put(f"/chats/{chat_id}", json=update_data)

    assert response.status_code == 422
    assert response.json() == {
        "error": "chat_membership_required",
        "message": "Chat membership required: account with id=999 must be a member of chat with id=1",
    }


# @chat_router.delete("/{chat_id}")
# def delete_chat(chat_id: int) -> None:
# Remove a chat from the library"""
def test_delete_chat_valid(test_client_json):
    """Test deleting an existing chat"""
    chat_id = 1
    response = test_client_json.delete(f"/chats/{chat_id}")

    assert response.status_code == 204


def test_delete_chat_invalid_id(test_client_json):
    """Test deleting non-existent chat raises 404"""
    response = test_client_json.delete("/chats/999")

    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


def test_delete_chat_verify_deletion(test_client_json):
    """Test that chat is actually deleted after deletion"""
    chat_id = 2

    # Delete the chat
    response = test_client_json.delete(f"/chats/{chat_id}")
    assert response.status_code == 204

    # Try to get the deleted chat
    response = test_client_json.get(f"/chats/{chat_id}")
    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": f"Not found: chat with id={chat_id}",
    }


# @chat_router.post("/{chat_id}/messages")
# def create_message(chat_id: int, create: MessageCreate) -> Message:
# Add a new message to a chat"""
def test_create_message_valid(test_client_json):
    """Test creating a message with valid data"""
    chat_id = 1
    message_data = {
        "text": "test message",
        "account_id": 1,
        "chat_id": chat_id,
        "created_at": "2025-08-20 10:20:21.123456"
    }
    response = test_client_json.post(f"/chats/{chat_id}/messages", json=message_data)

    assert response.status_code == 201
    data = response.json()

    assert data["text"] == "test message"
    assert data["account_id"] == 1
    assert data["chat_id"] == chat_id
    assert data["id"] is not None


def test_create_message_empty_text(test_client_json):
    """Test creating message with empty text raises 400"""
    chat_id = 1
    message_data = {
        "text": "   ",
        "account_id": 1,
        "chat_id": chat_id,
        "created_at": "2025-08-20 10:20:21.123456"
    }
    response = test_client_json.post(f"/chats/{chat_id}/messages", json=message_data)

    assert response.status_code == 400


def test_create_message_invalid_account(test_client_json):
    """Test creating message with non-existent account raises 404"""
    chat_id = 1
    message_data = {
        "text": "test message",
        "account_id": 999,
        "chat_id": chat_id,
        "created_at": "2025-08-20 10:20:21.123456"
    }
    response = test_client_json.post(f"/chats/{chat_id}/messages", json=message_data)

    assert response.status_code == 404


def test_create_message_invalid_chat(test_client_json):
    """Test creating message in non-existent chat raises 404"""
    chat_id = 999
    message_data = {
        "text": "test message",
        "account_id": 1,
        "chat_id": chat_id,
        "created_at": "2025-08-20 10:20:21.123456"
    }
    response = test_client_json.post(f"/chats/{chat_id}/messages", json=message_data)

    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


def test_create_message_unauthorized(test_client_json):
    """Test creating message from account not in chat raises 401"""
    chat_id = 1
    message_data = {
        "text": "test message",
        "account_id": 11,
        "chat_id": chat_id,
        "created_at": "2025-08-20 10:20:21.123456"
    }
    response = test_client_json.post(f"/chats/{chat_id}/messages", json=message_data)

    assert response.status_code == 401


# @chat_router.patch("/{chat_id}/messages")
# def update_message(chat_id: int, message_id: int, update: MessageUpdate) -> Message:
# Update a message in a chat"""
def test_update_message_valid(test_client_json):
    """Test updating an existing message"""
    chat_id = 1
    message_id = 1

    update_data = {"text": "updated message", "account_id": 1, "chat_id": chat_id, "owner_id": 1}
    response = test_client_json.patch(
        f"/chats/{chat_id}/messages?message_id={message_id}", json=update_data
    )

    assert response.status_code == 200
    data = response.json()

    assert data["id"] == message_id
    assert data["text"] == "updated message"
    assert data["account_id"] == 1


def test_update_message_invalid_message_id(test_client_json):
    """Test updating non-existent message raises 404"""
    chat_id = 1
    message_id = 999

    update_data = {"text": "updated message", "account_id": 1, "chat_id": chat_id, "owner_id": 1}
    response = test_client_json.patch(
        f"/chats/{chat_id}/messages?message_id={message_id}", json=update_data
    )

    assert response.status_code == 404


def test_update_message_empty_text(test_client_json):
    """Test updating message with empty text raises 400"""
    chat_id = 1
    message_id = 1

    update_data = {"text": "   ", "account_id": 1, "chat_id": chat_id, "owner_id": 1}
    response = test_client_json.patch(
        f"/chats/{chat_id}/messages?message_id={message_id}", json=update_data
    )

    assert response.status_code == 400


# @chat_router.delete("/{chat_id}/messages")
# def delete_message(chat_id: int, message_id: int) -> None:
# Remove a message from a chat"""
def test_delete_message_valid(test_client_json):
    """Test deleting an existing message"""
    chat_id = 1
    message_id = 1

    response = test_client_json.delete(f"/chats/{chat_id}/messages?message_id={message_id}")

    assert response.status_code == 204


def test_delete_message_invalid_id(test_client_json):
    """Test deleting non-existent message raises 404"""
    chat_id = 1
    message_id = 999

    response = test_client_json.delete(f"/chats/{chat_id}/messages?message_id={message_id}")

    assert response.status_code == 404


def test_delete_message_verify_deletion(test_client_json):
    """Test that message is actually deleted"""
    chat_id = 1
    message_id = 2

    # Delete the message
    response = test_client_json.delete(f"/chats/{chat_id}/messages?message_id={message_id}")
    assert response.status_code == 204


# @chat_router.put("/{chat_id}/accounts")
# def add_account_to_chat(chat_id: int, account_id: int) -> None:
# Add an account to a chat"""
def test_add_account_to_chat_valid(test_client_json):
    """Test adding an account to a chat"""
    chat_id = 1
    account_id = 11

    response = test_client_json.put(f"/chats/{chat_id}/accounts?account_id={account_id}")

    assert response.status_code == 204


def test_add_account_to_chat_invalid_account(test_client_json):
    """Test adding non-existent account raises 404"""
    chat_id = 1
    account_id = 999

    response = test_client_json.put(f"/chats/{chat_id}/accounts?account_id={account_id}")

    assert response.status_code == 404


def test_add_account_to_chat_invalid_chat(test_client_json):
    """Test adding account to non-existent chat raises 404"""
    chat_id = 999
    account_id = 1

    response = test_client_json.put(f"/chats/{chat_id}/accounts?account_id={account_id}")

    assert response.status_code == 404
    assert response.json() == {
        "error": "entity_not_found",
        "message": "Not found: chat with id=999",
    }


def test_add_account_to_chat_verify_added(test_client_json):
    """Test that account is actually added to chat"""
    chat_id = 1
    account_id = 11

    # Add account to chat
    response = test_client_json.put(f"/chats/{chat_id}/accounts?account_id={account_id}")
    assert response.status_code == 204

    # Verify account is in chat
    response = test_client_json.get(f"/chats/{chat_id}/accounts?sort=id")
    assert response.status_code == 200

    accounts = response.json()["accounts"]
    account_ids = [acct["id"] for acct in accounts]
    assert account_id in account_ids


# @chat_router.delete("/{chat_id}/accounts")
# def remove_account_from_chat(chat_id: int, account_id: int) -> None:
# Remove an account from a chat"""
def test_remove_account_from_chat_valid(test_client_json):
    """Test removing an account from a chat"""
    chat_id = 1
    account_id = 2

    response = test_client_json.delete(f"/chats/{chat_id}/accounts?account_id={account_id}")

    assert response.status_code == 204


def test_remove_account_from_chat_invalid_account(test_client_json):
    """Test removing non-existent account raises 404"""
    chat_id = 1
    account_id = 999

    response = test_client_json.delete(f"/chats/{chat_id}/accounts?account_id={account_id}")

    assert response.status_code == 404


def test_remove_account_from_chat_owner(test_client_json):
    """Test removing chat owner raises 400"""
    chat_id = 1
    owner_id = 1

    response = test_client_json.delete(f"/chats/{chat_id}/accounts?account_id={owner_id}")

    assert response.status_code == 400


def test_remove_account_from_chat_verify_removed(test_client_json):
    """Test that account is actually removed from chat"""
    chat_id = 3
    account_id = 2

    # Remove account from chat
    response = test_client_json.delete(f"/chats/{chat_id}/accounts?account_id={account_id}")
    assert response.status_code == 204

    # Verify account is not in chat
    response = test_client_json.get(f"/chats/{chat_id}/accounts?sort=id")
    assert response.status_code == 200

    accounts = response.json()["accounts"]
    account_ids = [acct["id"] for acct in accounts]
    assert account_id not in account_ids
