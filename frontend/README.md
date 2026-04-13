# Pony Express -- Frontend

Frontend for Pony Express project.

- The UI is built in [TypeScript](https://www.typescriptlang.org/) using the
  [React](https://react.dev/) library
- Routing is done via the [Tanstack Router](https://tanstack.com/router/latest)
  package
- Styling is done using the [TailWindCSS](https://tailwindcss.com/) framework
- Testing is done using the
  [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

---

## Setup

This project uses [Deno](https://deno.com/) as the TypeScript runtime.

### Install `deno`

- On macOS and Linux

  - Using Shell
    ```bash
    curl -fsSL https://deno.land/install.sh | sh
    ```
  - Using Homebrew
    ```bash
    brew install deno
    ```
  - Using Nix
    ```bash
    nix-shell -p deno
    ```
  - See
    [install documentation](https://docs.deno.com/runtime/getting_started/installation/)
    for other options

- On Windows
  - Using PowerShell
    ```powershell
    irm https://deno.land/install.ps1 | iex
    ```
  - See
    [install documentation](https://docs.deno.com/runtime/getting_started/installation/)
    for other options

### IDE

- Deno has a language server. See
  [setup documentation](https://docs.deno.com/runtime/getting_started/setup_your_environment/)
  for details on using the Deno language server in your IDE.

- TailWindCSS has a language server. See
  [setup documentation](https://tailwindcss.com/docs/editor-setup) for details
  on using the TailWindCSS language server in your IDE.

  - The language server is part of
    [tailwindcss-intellisense](https://github.com/tailwindlabs/tailwindcss-intellisense).
    You can install it
    - In the VSCode Marketplace
    - Via `homebrew` with `brew install tailwindcss-language-server`
    - Via `npm` with `npm install -g @tailwindcss/language-server`

---

## Server

A web server is available through Deno using [Vite](https://vite.dev/). Use
either of the following commands to run a local development server:

```bash
deno task dev
deno run dev
```

With the local server running, you can

- Visit <http://localhost:5173> in your browser to see your application

_Note: Don't forget to close the server when you are finished._

---

## Linting / Type-checking / Formatting

Deno contains tools for linting, type-checking, and formatting your code. See
[Linting and formatting](https://docs.deno.com/runtime/fundamentals/linting_and_formatting/)
introduction for more information.

### Linting

Use the following commands to lint your project:

```bash
deno lint                              # lint all files in your project
deno lint src/                         # lint all files in a directory
deno lint src/App.tsx                  # lint a specific file
deno lint --fix                        # lint all files and fix any fixable errors
```

See the
[Linting documentation](https://docs.deno.com/runtime/reference/cli/lint/) for
more information.

### Type-checking

Use the following commands to type-check your project:

```bash
deno check                             # type-check all files in your project
deno check src/                        # type-check all files in a directory
deno check src/App.tsx                 # type-check a specific file
```

See the
[Type-checking documentation](https://docs.deno.com/runtime/reference/cli/check/)
for more information.

### Formatting

Use the following commands to format your project:

```bash
deno fmt                               # format all files in your project
deno fmt --check                       # list files that need formatting
deno fmt src/                          # format all files in a directory
deno fmt src/App.tsx                   # format a specific file
```

---

## Tests

Testing is done via Deno. Use the following commands to test your project:

```bash
deno test                              # test all files in your project
deno test src/                         # test all files in a directory
deno test src/App.test.tsx             # test a specific file
```

See [Testing documentation](https://docs.deno.com/runtime/fundamentals/testing/)
for more information.

---

## Initialization

For documentation purposes, the following commands were used to create this
frontend application:

```bash
# initialize the react application using Deno and Vite
deno init --npm vite-extra@latest pony-express --template deno-react-ts

# add dependencies
deno add npm:tailwindcss npm:@tailwindcss/vite
deno add npm:@tanstack/react-router npm:@tanstack/router-plugin
deno add npm:@tanstack/react-query

# add development dependencies
deno add npm:jsdom npm:@testing-library/react npm:@testing-library/dom npm:@testing-library/user-event
```
