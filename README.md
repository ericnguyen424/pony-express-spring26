# Pony Express -- Backend

Backend for Pony Express project.

- The RestAPI is built using the [FastAPI](https://fastapi.tiangolo.com/) framework.
- Database interactions are managed using the [SQLModel](https://sqlmodel.tiangolo.com/)
  library.

---

## Setup

This project uses [uv](https://docs.astral.sh/uv/) to manage python versions and packages.

### Install `uv`

- On macOS and Linux

  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh
  ```

- On Windows

  ```bash
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```

### Install a python version

Install and use Python 3.13 in the project.
See [uv: Install Python](https://docs.astral.sh/uv/guides/install-python/) for more
information.

```bash
# install python3.13
uv python install 3.13

# use python3.13 in current directory
uv python pin 3.13
```

### Build project virtual environment

Create a virtual environment for the project.
See [uv: Working on projects](https://docs.astral.sh/uv/guides/projects/) for more
information.

```bash
uv sync
```

*Note: The project was already initialized and a lockfile was already generated.
Every invocation of `uv run` will automatically sync the virtual environment with the
dependencies, so manual syncing is generally unnecessary.*

### Check

Verify that the installation of the python version and the project environment were
successful:

```bash
# check python version
uv run python --version                             # Python 3.13.3

# check location of project executable (macOS and Linux)
uv run which python                                 # /path/to/project/.venv/bin/python

# see installed python packages (macOS and Linux)
ls .venv/lib/python3.13/site-packages/
```

### IDE

Depending on your IDE, you may need to specify the Python interpreter to be the one
created by `uv`, located at `./.venv/bin/python`. See your IDE's documentation for
selecting a Python interpreter.

---

## Server

A web server is available via the [uvicorn](https://uvicorn.dev/) python package.
The `fastapi-cli` python package can auto-detect the FastAPI application and then
run `uvicorn`.

Use any of the following commands to run a local development server:

```bash
# using the fastapi-cli
uv run fastapi dev                                  # detect app and run on port 8000

# using uvicorn directly
uv run uvicorn app.main:app --reload                # run on port 8000
uv run uvicorn app.main:app --reload --port 8001    # run on specific port
```

With the local server running, you can

- Make HTTP requests against <http://127.0.0.1:8000> or <http://localhost:8000>
- See OpenAPI spec at <http://127.0.0.1:8000/openapi.json> or <http://localhost:8000/openapi.json>
- See the Swagger docs at <http://127.0.0.1:8000/docs> or <http://localhost:8000/docs>
- See the ReDoc docs at <http://127.0.0.1:8000/redoc> or <http://localhost:8000/redoc>

*Note: Don't forget to close the server when you are finished.*

---

## Linting / Formatting

Formatting and linting is done using [ruff](https://docs.astral.sh/ruff/).

### Linting

Use the following commands to lint your project:

```bash
uv run ruff check                                   # lint all files in project
uv run ruff check app/                              # lint all files in a directory
uv run ruff check app/main.py                       # lint a specific file
uv run ruff check --fix                             # lint all files and fix any fixable errors
```

See the [Linting documentation](https://docs.astral.sh/ruff/linter/) for more information.

### Formatting

Use the following commands to format your project:

```bash
uv run ruff format                                  # format all files in project
uv run ruff format --check                          # list files that need formatting
uv run ruff format app/                             # format all files in a directory
uv run ruff format app/main.py                      # format a specific file
```

See the [Formatting documentation](https://docs.astral.sh/ruff/formatter/) for more
information.

### IDE Setup

Ruff can be integrated with many IDE's for automatic linting and formatting.
See [Ruff: Editor setup](https://docs.astral.sh/ruff/editors/setup/) for setup
specific to your IDE.

---

## Tests

Testing is done using the [pytest](https://docs.pytest.org/en/stable/) package.

Use the following commands to run your test suite:

```bash
# run all tests
uv run pytest

# run tests with varying degrees of detail
uv run pytest -q                                  # less verbose (quiet)
uv run pytest -v                                  # more verbose
uv run pytest -vv                                 # extra verbose

# run tests with app coverage
uv run pytest --cov=app --cov-report=term-missing

# run subset of tests
uv run pytest tests/                              # runs tests in folder
uv run pytest tests/main_test.py                  # runs tests in a file
uv run pytest tests/main_test.py::test_status     # runs specific test
```

---

## Initialization

For documentation purposes, the following commands were used to create this backend
application:

```bash
# initialize the uv application
uv init --app --name pony-express-backend

# add dependencies
uv add "fastapi[standard]" "pydantic[email]" "pwdlib[argon2,bcrypt]" pydantic-settings uvicorn sqlmodel python-jose python-multipart

# add development dependencies
uv add pytest pytest-cov httpx ruff ipython --dev
```
