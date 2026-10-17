# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
# TaskFlow

TaskFlow is a React and TypeScript task dashboard backed by an Express REST API and MySQL. Tasks persist in MySQL and support create, list, status update, and delete operations.

## Requirements

- Node.js 20 or newer
- MySQL 8 or a compatible managed MySQL service

## Run locally

1. Create the local database and table by running `database/taskflow_database.sql` in MySQL. Both statements are idempotent and do not drop or replace existing data.
2. Copy `.env.example` to `.env` and `server/.env.example` to `server/.env`. Set the MySQL values in `server/.env`; do not commit either `.env` file.
3. Install dependencies with `npm ci` and `npm --prefix server ci`.
4. Start the API in one terminal with `npm --prefix server run dev`.
5. Start Vite in another terminal with `npm run dev` and open the URL it prints.

Run `npm run build` and `npm run lint` from the project root. `npm --prefix server test` runs the API integration test against the MySQL database configured in `server/.env`; it inserts a temporary test task and removes it afterward.

## Deploy

The recommended split is Railway for the Express service and managed MySQL, and Vercel for the Vite frontend. The local database is not used by either provider.

### Railway API and MySQL

1. Create a Railway project and provision a MySQL service.
2. Create a Node service from this repository with its root directory set to `server`. Use `npm ci` for install and `npm start` to run it.
3. Add these variables to the API service using the Railway MySQL service's connection values. Keep the password in Railway's secret environment-variable field:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `CORS_ORIGINS` set to the exact Vercel origin, with no trailing slash
4. In the managed MySQL database, select its provisioned database and run `database/schema.sql`. It only creates the table if it is missing; it does not delete or overwrite existing rows.
5. Configure the Railway health-check path as `/api/health`. Railway supplies `PORT` to the API service.

### Vercel frontend

1. Import the repository as a Vite project with the repository root as the project root.
2. Use `npm ci` for install, `npm run build` for build, and `dist` as the output directory.
3. Set `VITE_API_BASE_URL` to `https://<your-railway-api-domain>/api`.
4. Copy the resulting Vercel origin into the API's `CORS_ORIGINS` variable, then redeploy the API if needed.

After deployment, verify `https://<your-railway-api-domain>/api/health`, then test create, refresh, status update, and delete on the Vercel site. Do not consider deployment complete until the health response reports `database: true` and those operations work.

## Security notes

- `.env` files, dependencies, build output, and local caches are ignored by Git. Commit only the `.env.example` placeholders.
- Never put database passwords or production credentials in source, GitHub, or the frontend's `VITE_*` variables.
- TaskFlow currently has no authentication. A public deployment shares one task list and allows visitors to modify or delete tasks, so use demo data only.
- No GitHub repository has been created or pushed by this setup. Review the files and approve public repository creation and pushing before publishing.
    },
