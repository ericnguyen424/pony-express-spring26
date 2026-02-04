from pydantic import BaseModel
from app.models.shared import CollectionMetadata

class Chat(BaseModel):
    id: int
    name: str
    owner_id: int


class ChatCollection(BaseModel):
    metadata: CollectionMetadata
    chats: list[Chat]
