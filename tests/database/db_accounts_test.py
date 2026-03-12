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

def test_db_create_account(session: Session, test_account_id:int):
    # Create an account with username John, email: johndoe@gmail.com, random pass
        # validate it exists
    
    # Create an account with username John, email: ericdoe@gmail.com, random pass
        # expect an error 422 
    
    # Create an account with username Eric, email: johndoe@gmail.com, random pass
        # expect an error 422

def test_db_update_account(session: Session):
    # Create 2 accounts
        # user A: Eric - erictest@gmail.com
        # user B: Victor - victortest@gmail.com

    # change A's username to Victor - expect 422, unchanged account
    # change A's email to victortest@gmail.com - expect 422, unchanged account

    # change A's email to randomtest@gmail.com - expect change
    # change B's email to erictest@gmail.com, username to Gustavo - expect change

    # change A's username to Victor - expect change

def test_db_delete_account(session: Session):
    # create accounts A, B
    # make B owner of multiple chats

    # delete A, check for expected behavior
    # delete B, expect 422 error
    # delete all of B's chats, then delete B, check for expected behavior

    