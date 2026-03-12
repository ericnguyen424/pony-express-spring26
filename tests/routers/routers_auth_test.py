
def test_register_account():
    # register a new account, expect 201 and JSON object with keys id, username, and email

    # check if account exists in db 

    # create an account w/ duplicate username, expect 422 and JSON response w/ { error: "value_not_allowed", message = "Not allowed: account with username=Victor"}

    # create an account w/ duplicate email, expect same errors as above

    # create an account w/ invalid email address, expect 422 & default FastAPI parameter validation

def test_create_token():
    # create token w/ username and password, expect 200 and JSON {access_token : JWT, token_type = "bearer"}

    # if account password was previously hashed using bcrypt algo, expect hashed_password is updated to use argon2

    # create token w/ nonexistent username, invalid password (separately) 
    #  and expect 401 and JSON response w/ {error = "invalid_credentials", message = "Invalid credentials: invalid combination username and password"}


def test_login():
  # create account w/ username & password
  # login, expect 204 response and no response body

  # expect that an access_token stored in cookie with key "pony_express_token" with JWT value

  # expect cookie is HTTP-only

  # if password previously hashed using bcrypt algo, expect hashed_password to be updated to argon2

  # try login with invalid username, invalid password (separately)
    # expect 401 & error and JSON response w/ {error = "invalid_credentials", message = "Invalid credentials: invalid combination username and password"}


