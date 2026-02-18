from sqlmodel import Session
from app.database import accounts as db_accounts


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
