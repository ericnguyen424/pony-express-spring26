# Pony Express

A full-stack group chat app. People can register, log in, create chats, add or remove members, and send, edit and delete messages. It has a FastAPI + SQLModel REST API and a React + TypeScript frontend, with cookie-based JWT authentication between them.

Built for a full-stack web development course at the University of Utah (Spring 2026).

## Features

- **Accounts:** register, log in and out, update your username or email, change your password, delete your account
- **Chats:** create, rename and delete chats; add and remove members; owner and member permissions
- **Messages:** send, edit and delete messages, with each message linked to its author and chat
- **Auth:** JWTs issued by the API and stored in an HTTP-only cookie (Bearer tokens also supported), with Argon2 password hashing and automatic upgrade of legacy bcrypt hashes on login
- **Tests:** pytest suite covering the database layer and every API router, run in CI on each pull request

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Python 3.13, FastAPI, SQLModel (SQLAlchemy + Pydantic), SQLite, python-jose, Argon2 |
| Frontend | React 19, TypeScript, TanStack Router, TanStack Query, Tailwind CSS, Vite, Deno |
| Tooling | uv, pytest + pytest-cov, Ruff, GitHub Actions |

## Architecture

```
React (Vite, :5173)  ──fetch, credentials: include──▶  FastAPI (:8000)
  TanStack Router: pages                                  routers/   HTTP endpoints, auth checks
  TanStack Query: server state + caching                  models/    request/response schemas
                                                          database/  queries via SQLModel
                                                          schema.py  tables ──▶ SQLite
```

The data model has four tables: `accounts`, `chats`, `messages`, and a `chat_memberships` join table for the many-to-many relationship between accounts and chats. Foreign keys use cascade rules so that deleting a chat removes its messages and memberships, while deleting an account keeps its messages with the author set to null.

## Running locally

**Prerequisites:** [uv](https://docs.astral.sh/uv/) and [Deno](https://deno.com/).

### Backend

```bash
uv sync                    # install Python 3.13 dependencies
uv run fastapi dev         # API at http://127.0.0.1:8000
```

Interactive API docs are served at <http://127.0.0.1:8000/docs>.

Set `PONY_EXPRESS_JWT_SECRET_KEY` to use your own signing key. Without it, a development default is used.

### Frontend

```bash
cd frontend
deno task dev              # app at http://localhost:5173
```

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/auth/registrations` | Create an account |
| POST | `/auth/logins` | Log in (sets the auth cookie) |
| DELETE | `/auth/logins` | Log out |
| POST | `/auth/tokens` | Get a bearer token |
| GET / PATCH / DELETE | `/accounts/me` | Read, update or delete your account |
| PUT | `/accounts/me/password` | Change your password |
| GET | `/accounts`, `/accounts/{id}` | List or look up accounts |
| GET / POST | `/chats` | List your chats or create one |
| GET / PUT / DELETE | `/chats/{id}` | Read, rename or delete a chat |
| GET / PUT / DELETE | `/chats/{id}/accounts` | List, add or remove members |
| GET / POST / PATCH / DELETE | `/chats/{id}/messages` | Read, send, edit or delete messages |

## Testing

```bash
uv run pytest --cov=app --cov-report=term-missing   # tests with coverage
uv run ruff check && uv run ruff format --check     # lint and format checks
```

## What I built

<!-- Edit this to match exactly what you wrote versus what the course provided. -->

- Designed the database schema and relationships, including cascade and restrict delete rules
- Implemented the REST API routers, request validation and custom error responses
- Built JWT authentication with HTTP-only cookies, Argon2 hashing and bcrypt-to-Argon2 migration
- Built the React frontend: login and registration, chat list, chat view with message editing, chat settings for managing members, and account settings
- Wrote the pytest suite for the database layer and API routes
