from starlette.testclient import TestClient

from app.main import app


# @chat_router.get("")
# def get_chats(sort: Literal["id", "name"] = "id") -> ChatCollection:
# Retrieve the list of chats default sorted by ID.
# Pass in 'name' if you wish to sort by name."""
def test_get_chats_sorted_by_id():
    test_client = TestClient(app)
    response = test_client.get("/chats?sort=id")
    assert response.status_code == 200

    data = response.json()

    expected_count = 2
    metadata = data["metadata"]
    assert metadata == {"count": expected_count, "sort": "id"}

    chats = data["chats"]
    assert len(chats) == expected_count

    for i in range(1, expected_count):
        assert chats[i]["id"] > chats[i - 1]["id"]


def test_get_chats_sorted_by_name():
    test_client = TestClient(app)
    response = test_client.get("/chats?sort=name")
    assert response.status_code == 200

    data = response.json()
    chats = data["chats"]

    names = [chat["name"] for chat in chats]
    assert names == sorted(names)


# @chat_router.get("/{chat_id}")
# def get_chat(chat_id: int) -> Chat:
# Retrieve a chat matching a given chat_id.
# Returns 404 if not found.
def test_get_chat_valid_id():
    test_client = TestClient(app)

    chat_id = 1
    response = test_client.get(f"/chats/{chat_id}")
    assert response.status_code == 200

    chat = response.json()
    assert chat["id"] == 1
    assert chat["name"] == "nostromo"
    assert chat["owner_id"] == 3


def test_get_chat_invalid_id():
    test_client = TestClient(app)

    response = test_client.get("/chats/999")
    assert response.status_code == 404


# @chat_router.get("/{chat_id}/accounts")
# def get_chat_accounts(chat_id: int, sort: Literal["id", "username"] = "id") -> AccountCollection:
# Returns all accounts present in the corresponding chat_id"""
def test_get_chat_accounts_sorted_by_id():
    test_client = TestClient(app)

    response = test_client.get("/chats/1/accounts?sort=id")
    assert response.status_code == 200

    data = response.json()
    accounts = data["accounts"]

    ids = [acct["id"] for acct in accounts]
    assert ids == sorted(ids)


def test_get_chat_accounts_sorted_by_name():
    test_client = TestClient(app)

    response = test_client.get("/chats/1/accounts?sort=username")
    assert response.status_code == 200

    data = response.json()
    accounts = data["accounts"]

    usernames = [acct["username"] for acct in accounts]
    assert usernames == sorted(usernames)


# @chat_router.get("/{chat_id}/messages")
# def get_messages(chat_id: int) -> MessageCollection:
# Retrieve all messages matching a given chat_id."""
def test_get_messages_valid_id():
    test_client = TestClient(app)

    response = test_client.get("/chats/1/messages")
    assert response.status_code == 200

    data = response.json()
    messages = data["messages"]

    assert len(messages) > 0

    # messages should be sorted by created_at
    timestamps = [msg["created_at"] for msg in messages]
    assert timestamps == sorted(timestamps)


def test_get_messages_invalid_id():
    test_client = TestClient(app)

    response = test_client.get("/chats/999/messages")
    assert response.status_code == 404
