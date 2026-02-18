from sqlmodel import Session
from app.database import chats as chats_db
from app.database import memberships as memberships_db
from app.database import messages as messages_db


def test_db_get_chats_sorted_by_id(session: Session):
    chats = chats_db.get_chats(session, sort="id")
    assert len(chats) > 0
    for i in range(1, len(chats)):
        assert chats[i].id > chats[i - 1].id
    assert chats[0].id == 1
    assert chats[-1].id == chats[-1].id


def test_db_get_chats_sorted_by_name(session: Session):
    chats = chats_db.get_chats(session, sort="name")
    assert len(chats) > 0
    names = [chat.name for chat in chats]
    assert names == sorted(names)
    assert names[0] == "newt"
    assert names[-1] == names[-1]


def test_db_get_chat_valid_id(session: Session):
    chat = chats_db.get_chat(session, 4)
    assert chat is not None
    assert chat.id == 4
    assert chat.name == "newt"
    assert chat.owner_id == 8

    chat2 = chats_db.get_chat(session, 6)
    assert chat2 is not None
    assert chat2.id == 6
    assert chat2.name == "sensory apparatus"
    assert chat2.owner_id == 5


def test_db_get_chat_invalid_id(session: Session):
    chat = chats_db.get_chat(session, 999)
    assert chat is None


def test_db_get_accounts_by_chat_id_valid(session: Session):
    accounts = memberships_db.get_accounts_by_chat_id(session, 3, sort="id")
    assert accounts is not None
    assert len(accounts) == 3
    ids = [acct.id for acct in accounts]
    assert ids == sorted(ids)
    assert ids[0] == 2
    assert ids[-1] == 8

    accounts_name = memberships_db.get_accounts_by_chat_id(session, 3, sort="username")
    assert accounts_name is not None
    usernames = [acct.username for acct in accounts_name]
    assert usernames == sorted(usernames)
    assert usernames[0] == "bishop"
    assert usernames[-1] == "ripley"


def test_db_get_accounts_by_chat_id_invalid(session: Session):
    accounts = memberships_db.get_accounts_by_chat_id(session, 999)
    assert accounts is None


def test_db_get_messages_by_chat_id_valid(session: Session):
    messages = messages_db.get_messages_by_chat_id(session, 1)
    assert messages is not None
    assert len(messages) == 35
    timestamps = [msg.created_at for msg in messages]
    assert timestamps == sorted(timestamps)

    messages2 = messages_db.get_messages_by_chat_id(session, 6)
    assert messages2 is not None
    assert len(messages2) == 42
    timestamps2 = [msg.created_at for msg in messages2]
    assert timestamps2 == sorted(timestamps2)


def test_db_get_messages_by_chat_id_invalid(session: Session):
    messages = messages_db.get_messages_by_chat_id(session, 999)
    assert messages is None
