# TestCloudProgramming

A minimal [Express](https://expressjs.com/) task-manager web app used to demonstrate a working Cloud Agent development environment.

## Stack

- Node.js (>= 20) + Express
- Vanilla HTML/CSS/JS frontend served from `public/`
- In-memory task store (resets on restart)

## Getting started

```bash
npm ci        # install dependencies
npm run dev   # start the dev server with auto-reload (http://localhost:3000)
```

Or run without watching:

```bash
npm start
```

## Tests

```bash
npm test
```

## API

| Method | Path              | Description              |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/health`     | Health check             |
| GET    | `/api/tasks`      | List all tasks           |
| POST   | `/api/tasks`      | Create a task (`title`)  |
| PATCH  | `/api/tasks/:id`  | Update `title` / `done`  |
| DELETE | `/api/tasks/:id`  | Delete a task            |

## Cloud Agent environment

The [`.cursor/environment.json`](.cursor/environment.json) file configures the Cloud Agent environment:

- `install` runs `npm ci` to install dependencies.
- A `dev-server` terminal runs `npm run dev`.
- Port `3000` is exposed.
