from pydantic import BaseModel, Field, EmailStr
from app.models.shared import CollectionMetadata


class Account(BaseModel):
    id: int
    username: str


class AuthenticatedAccount(BaseModel):
    id: int
    username: str
    email: EmailStr


class AccountCollection(BaseModel):
    metadata: CollectionMetadata
    accounts: list[Account]

class AccountCreate(BaseModel):
    username: str = Field(description="Account Username")
    password: str = Field(description="Account Password")
    email: EmailStr = Field(description="Account email")

#TODO: need to add pydantic validation for email, password, and username 

class AccountUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        description="The updated username",
    )
    email: EmailStr | None = Field(
        default=None,
        description="The updated email",
    )
    password: str | None = Field(
        default=None,
        description="The updated password",
    )

class PasswordUpdate(AccountCreate):
    password: str = Field(description="Updated password")
