from pydantic import BaseModel

class Account(BaseModel):
    id: int
    username: str

class AccountCollection(BaseModel):
    metadata: CollectionMetadata
    accounts: list[Account]