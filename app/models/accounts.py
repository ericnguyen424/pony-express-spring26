from pydantic import BaseModel, Field, EmailStr
from app.models.shared import CollectionMetadata


class Account(BaseModel):
    id: int
    username: str


class AccountCollection(BaseModel):
    metadata: CollectionMetadata
    accounts: list[Account]

class AccountCreate(BaseModel):
    username: str = Field(description="Account Username")
    password: str = Field(description="Account Password")
    email: EmailStr = Field(description="Account email")

#TODO: need to add pydantic validation for email, password, and username 

class AccountUpdate(AccountCreate):
    username: str = Field(
        description="The updated username or the original username if unchanged",
    )
    email: str = Field(
        description="The updated email or the original email if unchanged",
    )

class PasswordUpdate(AccountCreate):
    password: str = Field(description="Updated password")
