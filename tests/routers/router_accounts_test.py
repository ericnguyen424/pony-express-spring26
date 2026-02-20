# Retrieve the list of accounts default sorted by ID.
# Pass in 'username' if you wish to sort by usernames.
# get_accounts
def test_get_accounts_sorted_by_id(test_client, session):
    response = test_client.get("/accounts?sort=id")

    assert response.status_code == 200
    data = response.json()

    expected_count = 11
    metadata = data["metadata"]
    assert metadata == {"count": expected_count, "sort": "id"}

    accounts = data["accounts"]
    assert len(accounts) == expected_count

    for i in range(1, expected_count):
        assert accounts[i].get("id") > accounts[i - 1].get("id")

    assert accounts[0]["id"] == 1
    assert accounts[-1]["id"] == 11


def test_get_accounts_sorted_by_usernames(test_client):
    response = test_client.get("/accounts?sort=username")

    expected_count = 11
    assert response.status_code == 200
    data = response.json()

    metadata = data["metadata"]
    assert metadata == {"count": expected_count, "sort": "username"}

    accounts = data["accounts"]

    # usernames should be sorted alphabetically
    usernames = [acct["username"] for acct in accounts]
    assert usernames == sorted(usernames)

    assert usernames[0] == "admin"
    assert usernames[-1] == "terminator"


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
