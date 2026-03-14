from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Literal


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
        return BadRequest(error=self.error, message=self.message)

    # returns json for error
    def response(self) -> JSONResponse:
        return JSONResponse(
            status_code=self.status_code,
            content=self.response_content().model_dump(),
        )


class EntityNotFoundException(BadRequestException):
    def __init__(self, entity_name: str, entity_id: int):
        super().__init__(
            status_code=404,
            error="entity_not_found",
            message=f"Unable to find {entity_name} with id= {entity_id}",
        )


class NonUniqueException(BadRequestException):
    def __init__(self, entity_name: str, entity_identifier: str):
        super().__init__(
            status_code=409,
            error="non_unique_identifier_found",
            message=f"There already exists a {entity_name} with identifier {entity_identifier}",
        )


class UnauthorizedException(BadRequestException):
    def __init__(self):
        super().__init__(
            status_code=401, error="unauthorized", message="You shall not pass!"
        )


class ChatNotFoundException(BadRequestException):
    def __init__(self, chat_id: int):
        super().__init__(
            status_code=404,
            error="entity_not_found",
            message=f"Not found: chat with id={chat_id}",
        )


class ChatMembershipRequiredException(BadRequestException):
    def __init__(self, account_id: int, chat_id: int):
        super().__init__(
            status_code=422,
            error="chat_membership_required",
            message=(
                "Chat membership required: account with id="
                f"{account_id} must be a member of chat with id={chat_id}"
            ),
        )


class ChatNameNotAllowedException(BadRequestException):
    def __init__(self, name: str):
        super().__init__(
            status_code=422,
            error="value_not_allowed",
            message=f"Not allowed: chat with name={name}",
        )

class AccountUnproccessableContentException(BadRequestException):
    def __init(self, name: str, param: str, value: str):
        super().__init__(
            status_code=422,
            error = "value_not_allowed",
            message = "Not allowed: account with {param}={value}}"
        )

class UnauthorizedAccessException(BadRequestException):
    def __init(self, name: str, param: str, value: str):
        super().__init__(
            status_code=401,
            error = "invalid_credentials",
            message = "Invalid credentials: invalid combination username and password"
        )


class NotAuthenticatedException(BadRequestException):
    def __init__(self, reason: Literal["not_provided", "expired", "invalid"]):
        message_by_reason = {
            "not_provided": "Not authenticated: access token not provided",
            "expired": "Not authenticated: access token expired",
            "invalid": "Not authenticated: access token invalid",
        }
        super().__init__(
            status_code=403,
            error="not_authenticated",
            message=message_by_reason[reason],
        )