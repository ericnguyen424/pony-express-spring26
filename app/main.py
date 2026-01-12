from fastapi import FastAPI

app: FastAPI = FastAPI()


@app.get("/status")
def get_status() -> dict[str, str]:
    """Used to retrieve the status of the server"""
    return {"status": "ok"}
