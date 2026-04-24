from fastapi import FastAPI
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware


# Routers
from app.routers.accounts import accounts_router
from app.routers.chats import chat_router
from app.routers.auth import auth_router

# Database engine
from app.dependencies import initialize_database

from app.exceptions import BadRequestException


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Lifespan event for events to run on startup and shutdown."""

    initialize_database()
    yield


app: FastAPI = FastAPI(title="Pony Express API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(accounts_router)
app.include_router(chat_router)
app.include_router(auth_router)


@app.get("/status")
def get_status() -> dict[str, str]:
    """Used to retrieve the status of the server"""
    return {"status": "ok"}


@app.exception_handler(BadRequestException)
def handle_bad_requests(
    _request: Request,
    exception: BadRequestException,
) -> JSONResponse:
    """Convert custom bad request exceptions into JSON API responses."""

    return exception.response()
