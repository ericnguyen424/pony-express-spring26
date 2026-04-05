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
        """Create a structured API exception with status code, error, and message."""

        self.status_code: int = status_code
        self.error: str = error
        self.message: str = message

    # returns error entity
    def response_content(self) -> BadRequest:
        """Build the serializable error payload for this exception."""

        return BadRequest(error=self.error, message=self.message)

    # returns json for error
    def response(self) -> JSONResponse:
        """Convert this exception into a JSON HTTP response."""

        return JSONResponse(
            status_code=self.status_code,
            content=self.response_content().model_dump(),
        )


class EntityNotFoundException(BadRequestException):
    def __init__(self, entity_name: str, entity_id: int):
        """Create a 404 exception for missing entities by name and id."""

        super().__init__(
            status_code=404,
            error="entity_not_found",
            message=f"Unable to find {entity_name} with id= {entity_id}",
        )


class NonUniqueException(BadRequestException):
    def __init__(self, entity_name: str, entity_identifier: str):
        """Create a 409 exception for duplicate entity identifiers."""

        super().__init__(
            status_code=409,
            error="non_unique_identifier_found",
            message=f"There already exists a {entity_name} with identifier {entity_identifier}",
        )


class UnauthorizedException(BadRequestException):
    def __init__(self):
        """Create a 401 unauthorized exception for protected resource access."""

        super().__init__(
            status_code=401, error="unauthorized", message="You shall not pass!"
        )


class ChatNotFoundException(BadRequestException):
    def __init__(self, chat_id: int):
        """Create a 404 exception for a missing chat id."""

        super().__init__(
            status_code=404,
            error="entity_not_found",
            message=f"Not found: chat with id={chat_id}",
        )


class ChatMembershipRequiredException(BadRequestException):
    def __init__(self, account_id: int, chat_id: int):
        """Create a 422 exception when account membership in chat is required."""

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
        """Create a 422 exception for disallowed or duplicate chat names."""

        super().__init__(
            status_code=422,
            error="value_not_allowed",
            message=f"Not allowed: chat with name={name}",
        )


class AccountUnproccessableContentException(BadRequestException):
    def __init__(self, param: str, value: str):
        """Create a 422 exception for invalid or duplicate account field values."""

        super().__init__(
            status_code=422,
            error="value_not_allowed",
            message=f"Not allowed: account with {param}={value}",
        )


class UnauthorizedAccessException(BadRequestException):
    def __init__(self):
        """Create a 401 exception for invalid username/password credentials."""

        super().__init__(
            status_code=401,
            error="invalid_credentials",
            message="Invalid credentials: invalid combination username and password",
        )


class NotAuthenticatedException(BadRequestException):
    def __init__(self, reason: Literal["not_provided", "expired", "invalid"]):
        """Create a 403 exception for missing, expired, or invalid access tokens."""

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


class ActionNotAllowedException(BadRequestException):
    def __init__(self):
        """Create a 422 exception for disallowed actions by business rules."""

        super().__init__(
            status_code=422,
            error="action_not_allowed",
            message="Action not allowed: deletion of chat owner",
        )
