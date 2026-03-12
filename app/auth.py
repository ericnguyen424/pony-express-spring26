import argon2
from pwdlib.hashers.argon2 import Argon2Hasher
ARGON_HASHER = argon2.PasswordHasher()

def hash(password: str) -> str:
    """Hash a password using the argon2 algorithm.

    :param password: the password to hash
    :return: the hashed password
    """

    return ARGON_HASHER.hash(password)

def verify(password: str, hashed_password: str) -> bool:
    """Verify a password against a hashed password.

    This assumes the hashed_password was created using argon2.

    :param password: the password to check
    :param hashed_password: the hashed_password to compare
    :return: True if the argon2 hash of password matches the hashed_password
    """

    return ARGON_HASHER.verify(hashed_password, password)

