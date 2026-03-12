"""
Database functionality for accounts table

"""

from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select
from app.database.schema import Account
from app.exceptions import EntityNotFoundException, AccountUnproccessableContentException
from app.models.accounts import AccountCreate, AccountUpdate
from app.auth import hash, verify

# Retrieve **all accounts**
def get_accounts(
    session: Session,
    sort: Literal["id", "username"] = "id",
) -> Sequence[Account]:
    """Retrieve all accounts from the database.

    Args:
        session (Session): the database session
        sort (str): the column by which to order the collection (default="id")
    Returns:
        Sequence[Account]: the sequence of accounts in the database
    """

    stmt = select(Account).order_by(sort)
    results = session.exec(stmt)
    return results.all()


# Retrieve **one account** by ID
def get_account(session: Session, account_id: int) -> Account | None:
    """Retrieve account from database by its id.

    Args:
        session (Session): the database session
        account_id (int): the id of the requested account
    Returns:
        Account: if an account with the id exists
        None: if no account with the id exists
    """

    return session.get(Account, account_id)


def find(session: Session, account_id: int) -> Account:
    """Retrieve account from db by its id.

    Args:
        session (Session): db session
        account_id (int): id of requested account

    Returns:
        Account with given id

    Raises EntityNotFoundException: if no such account exists
    """
    account = get_account(session, account_id)
    if account is None:
        raise EntityNotFoundException("Account", account_id)
    return account


def find_by_username(session: Session, username: str) -> Account | None:
    """Retrieve account from database by username.

    Args:
        session (Session): the database session
        username (str): the username to search for

    Returns:
        Account: if an account with the username exists
        None: if no account with the username exists
    """
    stmt = select(Account).where(Account.username == username)
    results = session.exec(stmt)
    return results.first()

def get_hashed_password(session: Session, account_id: int):
    """Retrieve hashed password from db

    Args: 
    session(Session): the db session
    account_id (int): id of account

    Returns:
        string of hashed password or none
    """

    account = get_account(session, account_id)
    return account.hashed_password

def find_by_email(session: Session, email: str) -> Account | None:
    """Retrieve account from database by email.

    Args:
        session (Session): the database session
        email (str): the email to search for

    Returns:
        Account: if an account with the email exists
        None: if no account with the email exists
    """
    stmt = select(Account).where(Account.email == email)
    results = session.exec(stmt)
    return results.first()

def create(session: Session, create: AccountCreate) -> Account:
    """Add new account to database
    
    Args:
        session (Session): the database session
        create (AccountCreate): the attributes for creating an account

        Returns:
            Newly created account

        Raises: 
            UnprocessableContentException: if username or email is in use
    """

    # Raise exception if account already exists (check username and email)
    if (find_by_email(create.email) is not None):
        AccountUnproccessableContentException("email", create.email)

    if (find_by_username(create.username) is not None):
        AccountUnproccessableContentException("username", create.username)

    account = Account(
        username = create.username,
        email = create.email,
        hashed_password=hash(create.password)
    )
    
    session.add(account)
    session.commit()
    session.refresh(account)

    return account

def update(session: Session, account_id: int, update: AccountUpdate) -> Account:
    """Update an account in the database

    Args:
        session(Session): the database session
        account_id: id of account to update
        update: params of updated account

    Returns:
        Updated account

    Raises:
        EntityNotFoundException - account_id doesn't exist
        UnprocessableContentException: if username or email is in use
    """

    account = find(session, account_id)
    
    if update.username is not None and account.username != update.username:
        existing_username = find_by_username(session, update.username)
        if existing_username is not None and existing_username.id != account.id:
            raise AccountUnproccessableContentException("username", update.username)
        account.username = update.username

    if update.email is not None and account.email != update.email:
        existing_email = find_by_email(session, str(update.email))
        if existing_email is not None and existing_email.id != account.id:
            raise AccountUnproccessableContentException("email", str(update.email))
        account.email = str(update.email)

    if update.password is not None and not verify(update.password, account.hashed_password):
        account.hashed_password = hash(update.password)
    
    session.add(account)
    session.commit()
    session.refresh(account)
    return account

def update_password(session: Session, account_id: int, update: AccountUpdate) -> Account:
    """Update an account in the database

    Args:
        session(Session): the database session
        account_id: id of account to update
        update: params of updated account

    Returns:
        Updated account

    Raises:
        EntityNotFoundException - account_id doesn't exist
    """

    account = find(session, account_id)

    if update.password is not None and not verify(update.password, account.hashed_password):
        account.hashed_password = hash(update.password)

    session.add(account)
    session.commit()
    session.refresh(account)
    return account

def delete_account(session: Session, account_id: int): 
    """Delete an account in the database

    Args:
        session(Session): the database session
        account_id: id of account to delete

    Returns: 
        None
    
    Raises: 
        EntityNotFoundException if account doesn't exist
        UnprocessableException if account 
    """
    account = find(session, account_id)
    session.delete(account)
    session.commit()

    #TODO: add a function to check if the user is the owner of any chats, 
    # then call it in this function
    # If user is owner of a chat, throw 422 UnprocessableContent with "Action not allowed: deletion of chat owner"