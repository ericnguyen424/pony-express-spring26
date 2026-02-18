from fastapi.responses import JSONResponse
from pydantic import BaseModel


# bad request entity
class BadRequest(BaseModel):
    error: str
    message: str

# bad request class 
class BadRequestException(Exception):
    def __init__(self, *, status_code: int = 400, error: str, message: str):
        self.status_code: int = status_code
        self.error: str = error
        self.message: str = message

    # returns error entity
    def response_content(self) -> BadRequest:
        return BadRequest(error = self.error, message = self.message)
    
    # returns json for error
    def response(self) -> JSONResponse:
        return JSONResponse(
            status_code = self.status_code,
            content = self.response_content().model_dump(),
        )
    
class EntityNotFoundException(BadRequestException):
    def __init__(self, entity_name: str, entity_id: int):
    
        super().__init__(
            status_code = 404,
            error = "entity_not_found",
            message=f"Unable to find {entity_name} with id= {entity_id}",
        )

class NonUniqueException(BadRequestException):
    def __init(self, entity_name: str, entity_identifier: str):
        super().__init__(
            status_code = 409,
            error = "non_unique_identifier_found",
            message=f"There already exists a {entity_name} with identifier {entity_identifier}"
        )