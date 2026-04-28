# @accounts_router.get("/{account_id}")
# get_account(account_id: int) -> Account:
# Retrieve an account matching a given account_id.
# Returns 404 if not found.
def test_get_account_valid_id_1(test_client):
    account_id = 3
    response = test_client.get(f"/accounts/{account_id}")
    assert response.status_code == 200

    account = response.json()
    assert account["id"] == 3
    assert account["username"] == "bomb20"


def test_get_account_valid_id_2(test_client):
    account_id = 9
    response = test_client.get(f"/accounts/{account_id}")
    assert response.status_code == 200

    account = response.json()
    assert account["id"] == 9
    assert account["username"] == "sarah"


def test_get_account_invalid_id(test_client):
    invalid_id = 999
    response = test_client.get(f"/accounts/{invalid_id}")
    assert response.status_code == 404
