from fastapi import FastAPI

app: FastAPI = FastAPI()

@app.get("/chats")
@app.get("/chats{chat_id}")
@app.get("/chats/{chat_id}/accounts")
@app.get("/chats/{chat_id}/messages")
