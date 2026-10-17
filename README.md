# TaskFlow

TaskFlow is a full-stack task manager built with React, TypeScript, Express, and MySQL. Create and edit tasks, organize them by project, set due dates and priorities, track progress, and find work with status filters and search.

## Features

- Persistent task creation, editing, status updates, and deletion
- MySQL storage for task title, project, priority, status, due date, and creation time
- Dashboard totals for open, completed, and overdue tasks
- Search by task or project and filter by task status
- Responsive layout for desktop and mobile
- Express health endpoint at `/api/health`

## Requirements

- Node.js 20 or newer
- MySQL 8 or a compatible managed MySQL service

## Run locally

1. Run `database/taskflow_database.sql` in MySQL to create `taskflow_db` and the tasks table. The script is idempotent and does not replace existing rows.
2. Copy `.env.example` to `.env` and `server/.env.example` to `server/.env`. Configure the database connection in `server/.env`; do not commit either `.env` file.
3. Install dependencies with `npm ci` and `npm --prefix server ci`.
4. Start the API in one terminal with `npm --prefix server run dev`.
5. Start the frontend in another terminal with `npm run dev`, then open the URL Vite prints.

Run `npm run build` and `npm run lint` from the project root. `npm --prefix server test` runs the API integration test against the MySQL database configured in `server/.env`; it inserts a temporary task and removes it afterward.

## API

- `GET /api/tasks` lists tasks
- `POST /api/tasks` creates a task
- `PUT /api/tasks/:id` updates a task
- `DELETE /api/tasks/:id` deletes a task
- `GET /api/health` checks the API and database connection

New tasks require a title, project, and valid `YYYY-MM-DD` due date. Priority defaults to `Medium` and status defaults to `To Do`.

## Deploy

The frontend can be hosted on Vercel, with the Express API and managed MySQL hosted on Railway.

For Railway, set the API service root to `server`, install with `npm ci`, and start with `npm start`. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` from the Railway MySQL service. Set `CORS_ORIGINS` to the exact deployed frontend origin. Run `database/schema.sql` in the managed database and set `/api/health` as the health-check path.

For Vercel, use `npm ci`, `npm run build`, and `dist` as the output directory. Set `VITE_API_BASE_URL` to `https://<your-railway-api-domain>/api`. After deployment, verify the health endpoint reports `database: true` and test task creation, editing, refresh, status changes, and deletion.

## Security

TaskFlow does not currently include authentication. A public deployment shares one task list and allows visitors to modify or delete tasks, so use demo data only. Never put database passwords or production credentials in source control or frontend `VITE_*` variables.
