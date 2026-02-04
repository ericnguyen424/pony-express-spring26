from pydantic import BaseModel


class CollectionMetadata(BaseModel):
    count: int
    sort: str
