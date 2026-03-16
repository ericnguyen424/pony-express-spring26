import json
from collections.abc import Generator
from datetime import datetime
from pathlib import Path

import bcrypt
import pytest
from sqlmodel import Session, SQLModel, StaticPool, create_engine, select
from starlette.testclient import TestClient

from app.database import accounts as accounts_db
from app.database import memberships as memberships_db
from app.database.schema import Account, Chat, ChatMembership, Message
from app.dependencies import get_session
from app.main import app
from app.models.accounts import AccountCreate


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


@pytest.fixture
def test_client_json(session_json: Session) -> Generator[TestClient]:
  def get_test_session():
    yield session_json

  app.dependency_overrides[get_session] = get_test_session
  yield TestClient(app)
  app.dependency_overrides.clear()


def test_register_account(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  response = test_client_json.post(
    "/auth/registrations",
    data={
      "username": "Victor",
      "email": "victor@example.com",
      "password": "secure-pass-1",
    },
  )

  assert response.status_code == 201
  payload = response.json()
  assert set(payload.keys()) == {"id", "username", "email"}
  assert payload["username"] == "Victor"
  assert payload["email"] == "victor@example.com"

  account = accounts_db.find_by_username(session_json, "Victor")
  assert account is not None
  assert str(account.email) == "victor@example.com"

  duplicate_username = test_client_json.post(
    "/auth/registrations",
    data={
      "username": "Victor",
      "email": "victor2@example.com",
      "password": "secure-pass-2",
    },
  )
  assert duplicate_username.status_code == 422
  assert duplicate_username.json() == {
    "error": "value_not_allowed",
    "message": "Not allowed: account with username=Victor",
  }

  duplicate_email = test_client_json.post(
    "/auth/registrations",
    data={
      "username": "VictorTwo",
      "email": "victor@example.com",
      "password": "secure-pass-3",
    },
  )
  assert duplicate_email.status_code == 422
  assert duplicate_email.json() == {
    "error": "value_not_allowed",
    "message": "Not allowed: account with email=victor@example.com",
  }

  invalid_email = test_client_json.post(
    "/auth/registrations",
    data={
      "username": "InvalidEmailUser",
      "email": "not-an-email",
      "password": "secure-pass-4",
    },
  )
  assert invalid_email.status_code == 422
  assert "detail" in invalid_email.json()


def test_create_token(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  accounts_db.create(
    session_json,
    AccountCreate(
      username="token-user",
      email="token-user@example.com",
      password="token-pass",
    ),
  )

  response = test_client_json.post(
    "/auth/tokens",
    data={"username": "token-user", "password": "token-pass"},
  )
  assert response.status_code == 200
  payload = response.json()
  assert "access_token" in payload
  assert payload["access_token"]
  assert payload["token_type"] == "bearer"

  invalid_username = test_client_json.post(
    "/auth/tokens",
    data={"username": "does-not-exist", "password": "token-pass"},
  )
  assert invalid_username.status_code == 401
  assert invalid_username.json() == {
    "error": "invalid_credentials",
    "message": "Invalid credentials: invalid combination username and password",
  }

  invalid_password = test_client_json.post(
    "/auth/tokens",
    data={"username": "token-user", "password": "wrong-pass"},
  )
  assert invalid_password.status_code == 401
  assert invalid_password.json() == {
    "error": "invalid_credentials",
    "message": "Invalid credentials: invalid combination username and password",
  }


def test_create_token_upgrades_bcrypt_hash(
  test_client_json: TestClient,
  session_json: Session,
):
  bcrypt_hash = bcrypt.hashpw(b"bcrypt-pass", bcrypt.gensalt()).decode("utf-8")
  bcrypt_account = Account(
    username="bcrypt-user",
    email="bcrypt-user@example.com",
    hashed_password=bcrypt_hash,
  )
  session_json.add(bcrypt_account)
  session_json.commit()
  session_json.refresh(bcrypt_account)

  upgrade_response = test_client_json.post(
    "/auth/tokens",
    data={"username": "bcrypt-user", "password": "bcrypt-pass"},
  )
  assert upgrade_response.status_code == 200

  upgraded = accounts_db.find_by_username(session_json, "bcrypt-user")
  assert upgraded is not None
  assert upgraded.hashed_password.startswith("$argon2")


def test_login(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  accounts_db.create(
    session_json,
    AccountCreate(
      username="login-user",
      email="login-user@example.com",
      password="login-pass",
    ),
  )

  response = test_client_json.post(
    "/auth/logins",
    data={"username": "login-user", "password": "login-pass"},
  )
  assert response.status_code == 204
  assert response.content == b""

  token_cookie = response.cookies.get("pony_express_token")
  assert token_cookie is not None

  set_cookie_header = response.headers.get("set-cookie", "")
  assert "pony_express_token=" in set_cookie_header
  assert "HttpOnly" in set_cookie_header

  invalid_username = test_client_json.post(
    "/auth/logins",
    data={"username": "does-not-exist", "password": "login-pass"},
  )
  assert invalid_username.status_code == 401
  assert invalid_username.json() == {
    "error": "invalid_credentials",
    "message": "Invalid credentials: invalid combination username and password",
  }

  invalid_password = test_client_json.post(
    "/auth/logins",
    data={"username": "login-user", "password": "wrong-pass"},
  )
  assert invalid_password.status_code == 401
  assert invalid_password.json() == {
    "error": "invalid_credentials",
    "message": "Invalid credentials: invalid combination username and password",
  }


def test_login_upgrades_bcrypt_hash(
  test_client_json: TestClient,
  session_json: Session,
):
  bcrypt_hash = bcrypt.hashpw(b"login-bcrypt-pass", bcrypt.gensalt()).decode("utf-8")
  bcrypt_account = Account(
    username="login-bcrypt-user",
    email="login-bcrypt@example.com",
    hashed_password=bcrypt_hash,
  )
  session_json.add(bcrypt_account)
  session_json.commit()
  session_json.refresh(bcrypt_account)

  upgrade_response = test_client_json.post(
    "/auth/logins",
    data={"username": "login-bcrypt-user", "password": "login-bcrypt-pass"},
  )
  assert upgrade_response.status_code == 204

  upgraded = accounts_db.find_by_username(session_json, "login-bcrypt-user")
  assert upgraded is not None
  assert upgraded.hashed_password.startswith("$argon2")


def test_update_me_password_with_bearer_token(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  accounts_db.create(
    session_json,
    AccountCreate(
      username="pw-bearer-user",
      email="pw-bearer-user@example.com",
      password="old-pass-1",
    ),
  )

  token_response = test_client_json.post(
    "/auth/tokens",
    data={"username": "pw-bearer-user", "password": "old-pass-1"},
  )
  assert token_response.status_code == 200
  token = token_response.json()["access_token"]

  update_response = test_client_json.put(
    "/accounts/me/password",
    data={"old_password": "old-pass-1", "new_password": "new-pass-1"},
    headers={"Authorization": f"Bearer {token}"},
  )
  assert update_response.status_code == 204
  assert update_response.content == b""

  old_login = test_client_json.post(
    "/auth/tokens",
    data={"username": "pw-bearer-user", "password": "old-pass-1"},
  )
  assert old_login.status_code == 401

  new_login = test_client_json.post(
    "/auth/tokens",
    data={"username": "pw-bearer-user", "password": "new-pass-1"},
  )
  assert new_login.status_code == 200


def test_update_me_password_with_cookie_token(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  accounts_db.create(
    session_json,
    AccountCreate(
      username="pw-cookie-user",
      email="pw-cookie-user@example.com",
      password="old-pass-2",
    ),
  )

  login_response = test_client_json.post(
    "/auth/logins",
    data={"username": "pw-cookie-user", "password": "old-pass-2"},
  )
  assert login_response.status_code == 204

  update_response = test_client_json.put(
    "/accounts/me/password",
    data={"old_password": "old-pass-2", "new_password": "new-pass-2"},
  )
  assert update_response.status_code == 204
  assert update_response.content == b""

  new_login = test_client_json.post(
    "/auth/tokens",
    data={"username": "pw-cookie-user", "password": "new-pass-2"},
  )
  assert new_login.status_code == 200


def test_update_me_password_invalid_old_password(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  accounts_db.create(
    session_json,
    AccountCreate(
      username="pw-invalid-old-user",
      email="pw-invalid-old-user@example.com",
      password="actual-old-pass",
    ),
  )

  token_response = test_client_json.post(
    "/auth/tokens",
    data={"username": "pw-invalid-old-user", "password": "actual-old-pass"},
  )
  assert token_response.status_code == 200
  token = token_response.json()["access_token"]

  update_response = test_client_json.put(
    "/accounts/me/password",
    data={"old_password": "wrong-old-pass", "new_password": "new-pass-3"},
    headers={"Authorization": f"Bearer {token}"},
  )

  assert update_response.status_code == 401
  assert update_response.json() == {
    "error": "invalid_credentials",
    "message": "Invalid credentials: invalid combination username and password",
  }


def test_delete_me_with_bearer_token(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  owner = accounts_db.create(
    session_json,
    AccountCreate(
      username="delete-owner",
      email="delete-owner@example.com",
      password="owner-pass",
    ),
  )
  target = accounts_db.create(
    session_json,
    AccountCreate(
      username="delete-target",
      email="delete-target@example.com",
      password="target-pass",
    ),
  )

  chat = Chat(name="delete-me-chat", owner_id=owner.id)
  session_json.add(chat)
  session_json.commit()
  session_json.refresh(chat)

  memberships_db.create(session_json, target.id, chat.id)

  authored_message = Message(text="hello", account_id=target.id, chat_id=chat.id)
  session_json.add(authored_message)
  session_json.commit()
  session_json.refresh(authored_message)

  token_response = test_client_json.post(
    "/auth/tokens",
    data={"username": "delete-target", "password": "target-pass"},
  )
  assert token_response.status_code == 200
  token = token_response.json()["access_token"]

  delete_response = test_client_json.delete(
    "/accounts/me",
    headers={"Authorization": f"Bearer {token}"},
  )
  assert delete_response.status_code == 204
  assert delete_response.content == b""

  deleted_account = accounts_db.find_by_username(session_json, "delete-target")
  assert deleted_account is None

  membership = session_json.exec(
    select(ChatMembership).where(
      ChatMembership.account_id == target.id,
      ChatMembership.chat_id == chat.id,
    )
  ).first()
  assert membership is None

  updated_message = session_json.get(Message, authored_message.id)
  assert updated_message is not None
  assert updated_message.account_id is None


def test_delete_me_with_cookie_token_deletes_cookie(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  accounts_db.create(
    session_json,
    AccountCreate(
      username="delete-cookie-user",
      email="delete-cookie-user@example.com",
      password="cookie-pass",
    ),
  )

  login_response = test_client_json.post(
    "/auth/logins",
    data={"username": "delete-cookie-user", "password": "cookie-pass"},
  )
  assert login_response.status_code == 204

  delete_response = test_client_json.delete("/accounts/me")
  assert delete_response.status_code == 204
  assert delete_response.content == b""
  assert "pony_express_token=" in delete_response.headers.get("set-cookie", "")

  deleted_account = accounts_db.find_by_username(session_json, "delete-cookie-user")
  assert deleted_account is None


def test_delete_me_owner_not_allowed(
  test_client_json: TestClient,
  session_json: Session,
  stub_password_hashing,
):
  owner = accounts_db.create(
    session_json,
    AccountCreate(
      username="delete-owner-blocked",
      email="delete-owner-blocked@example.com",
      password="blocked-pass",
    ),
  )

  owned_chat = Chat(name="owned-chat", owner_id=owner.id)
  session_json.add(owned_chat)
  session_json.commit()

  token_response = test_client_json.post(
    "/auth/tokens",
    data={"username": "delete-owner-blocked", "password": "blocked-pass"},
  )
  assert token_response.status_code == 200
  token = token_response.json()["access_token"]

  delete_response = test_client_json.delete(
    "/accounts/me",
    headers={"Authorization": f"Bearer {token}"},
  )

  assert delete_response.status_code == 422
  assert delete_response.json() == {
    "error": "action_not_allowed",
    "message": "Action not allowed: deletion of chat owner",
  }


