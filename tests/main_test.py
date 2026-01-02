from fastapi.testclient import TestClient

from app.main import app


def test_get_status():
    """Test for `GET /status` route."""

    test_client = TestClient(app)
    response = test_client.get("/status")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
