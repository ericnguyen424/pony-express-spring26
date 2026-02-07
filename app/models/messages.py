from pydantic import BaseModel
from datetime import datetime
from app.models.shared import CollectionMetadata


class Message(BaseModel):
    id: int
    text: str
    account_id: int
    chat_id: int
    created_at: datetime


class MessageCollection(BaseModel):
    metadata: CollectionMetadata
    messages: list[Message]
