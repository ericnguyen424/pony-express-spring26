"""
Database functionality for chat memberships table

"""

from collections.abc import Sequence
from typing import Literal
from sqlmodel import Session, select, update
from app.database.schema import Account, ChatMembership, Chat, Message
from app.database.accounts import find as find_account
from app.database.chats import find as find_chat
from app.exceptions import EntityNotFoundException, BadRequestException

# Retrieve **accounts that belong to a specific chat**
def get_accounts_by_chat_id(
    session: Session, chat_id=int, sort: Literal["id", "username"] = "id"
) -> Sequence[Account] | None:
    """Retrieve all accounts that belong to a specific chat.

    Args:
        session (Session): the database session
        chat_id: chat id to retrieve from
        sort (str): the column by which to order the account collection (default="id")
    Returns:
        Sequence[Account]: the sequence of accounts in the chat or none
    """

    chat_exists = session.get(Chat, chat_id)
    if chat_exists is None:
        return None

    stmt = (
        select(Account)
        .join(ChatMembership)
        .where(ChatMembership.chat_id == chat_id)
        .order_by(sort)
    )

    results = session.exec(stmt)
    return results.all()

def create(session : Session, account_id: int, chat_id: int) -> ChatMembership:
    """ Add new ChatMembership to database

    Args:
        session (Session): DB Session
        account_id (int): id of account
        chat_id (int): id of chat
    
    Return: 
        ChatMembership

    Raises: 
        EntityNotFoundException if chat or account not found
    """

    find_account(session, account_id)
    find_chat(session, chat_id)

    membership = ChatMembership(account_id = account_id, chat_id = chat_id)
    session.add(membership)
    session.commit()
    session.refresh(membership)
    return membership

def delete(session: Session, account_id: int, chat_id: int) -> None:
    """Remove a chat membership from the database
    
    Args:
        session (Session): DB Session
        account_id (int): id of account
        chat_id (int): id of chat
    
    Return: 
        None

    Raises:
        EntityNotFoundException: if chat or account not found, or membership doesn't exist
        BadRequestException: if account is the owner of the chat
    """
    
    # verify existence
    find_account(session, account_id)
    chat = find_chat(session, chat_id)
    
    # owner can't delete membership
    if chat.owner_id == account_id:
        raise BadRequestException(
            error="forbidden_operation",
            message=f"Account with id {account_id} is the owner of chat {chat_id} and cannot delete their membership"
        )
    
    # find membership
    stmt = select(ChatMembership).where(
        ChatMembership.account_id == account_id,
        ChatMembership.chat_id == chat_id
    )
    membership = session.exec(stmt).first()
    
    if membership is None:
        raise EntityNotFoundException("membership", f"account_id={account_id}, chat_id={chat_id}")
    
    # update all messages authored by account to be null
    update_stmt = (
        update(Message)
        .where(Message.account_id == account_id, Message.chat_id == chat_id)
        .values(account_id=None)
    )
    session.exec(update_stmt)
    
    # delete the membership
    session.delete(membership)
    session.commit()