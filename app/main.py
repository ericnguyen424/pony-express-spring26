from fastapi import FastAPI
from app.routers.accounts import accounts_router
from app.routers.chats import chat_router

app: FastAPI = FastAPI()


app.include_router(accounts_router)
app.include_router(chat_router)

@app.get("/status")
def get_status() -> dict[str, str]:
    """Used to retrieve the status of the server"""
    return {"status": "ok"}
