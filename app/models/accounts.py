from pydantic import BaseModel
from app.models.shared import CollectionMetadata


class Account(BaseModel):
    id: int
    username: str


class AccountCollection(BaseModel):
    metadata: CollectionMetadata
    accounts: list[Account]
