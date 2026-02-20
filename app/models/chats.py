from pydantic import BaseModel, ConfigDict, Field
from app.models.shared import CollectionMetadata


class Chat(BaseModel):
    id: int = Field(description="The id of the chat")
    name: str = Field(description="The name of the chat")
    owner_id: int = Field(description="The chat owner's id")

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": 1,
                    "name": "Bone Chat",
                    "owner_id": 3,
                },
            ],
        },
    )


class ChatCollection(BaseModel):
    metadata: CollectionMetadata
    chats: list[Chat]

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "metadata": {"count": 1, "sort": "id"},
                    "chats": [
                        {
                            "id": 1,
                            "name": "Bone Chat",
                            "owner_id": 3,
                        },
                    ],
                }
            ]
        }
    )


class ChatCreate(BaseModel):
    name: str = Field(description="The name of the chat")
    owner_id: int = Field(description="The chat owner's id")


class ChatUpdate(ChatCreate):
    name: str = Field(
        description="The updated name or the original name if unchanged",
    )
    owner_id: int = Field(
        description="The updated owner id or the original owner id if unchanged",
    )
