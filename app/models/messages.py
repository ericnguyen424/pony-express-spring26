from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from app.models.shared import CollectionMetadata


class Message(BaseModel):
    id: int
    text: str
    account_id: int
    chat_id: int
    created_at: datetime

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "text": "Hello!",
                    "account_id": 3,
                    "chat_id": 4,
                    "created_at": "2025-08-20 10:20:21.123456"
                },
            ],
        },
    )


class MessageCollection(BaseModel):
    metadata: CollectionMetadata
    messages: list[Message]
    model_config = ConfigDict(

    json_schema_extra={
            "examples": [
                {
                    "metadata": {"count": 1, "sort": "id"},
                    "chats": [
                        {
                            "id": 1,
                            "text": "Hello!",
                            "account_id": 3,
                            "chat_id": 4,
                            "created_at": "2025-08-20 10:20:21.123456"
                        },
                    ],
                }
            ]
        }
    )

class MessageCreate(BaseModel):
    text: str = Field(description = "Message Text")
    account_id: int = Field(description = "ID of message creator")
    chat_id: int = Field(description = "ID of chat message created in")
    created_at: datetime = Field(description = "Datetime of creation")

class MessageUpdate(MessageCreate):
    text: str = Field(description = "Message Text")
    account_id: int = Field(description = "ID of message creator")
    chat_id: int = Field(description = "ID of chat message created in")
    created_at: datetime = Field(description = "Datetime of creation")
    