import argon2
import bcrypt
from argon2.exceptions import InvalidHashError, VerifyMismatchError, VerificationError

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

    try:
        return ARGON_HASHER.verify(hashed_password, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def is_bcrypt_hash(hashed_password: str) -> bool:
    """Return whether the given hash is bcrypt formatted."""

    return hashed_password.startswith(("$2a$", "$2b$", "$2y$"))


def verify_with_legacy_support(password: str, hashed_password: str) -> bool:
    """Verify password against argon2 hash with bcrypt backward compatibility."""

    if is_bcrypt_hash(hashed_password):
        try:
            return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
        except ValueError:
            return False

    return verify(password, hashed_password)
