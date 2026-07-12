# TransitOps

TransitOps is a monorepo web application with a React SPA frontend and a Node.js/Express REST API backend, backed by PostgreSQL and Prisma.

## Prerequisites

Install these before starting:

- Node.js 18 or newer
- npm
- PostgreSQL 15 or newer
- Git

## Project Setup

Clone the repository and install dependencies from the project root:

```bash
npm run install:all
```

This installs dependencies for the root app, frontend, and backend.

## Environment Setup

Create your backend environment file:

```bash
cd backend
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env` and set your database URL:

```env
DATABASE_URL="postgresql://transitops_user:transitops_password@localhost:5432/transitops"
PORT=5000
```

Do not commit `backend/.env`. Each developer should keep their own local database credentials.

## PostgreSQL Setup

You need an empty PostgreSQL database before running Prisma commands.

### Linux/macOS

If you already have a PostgreSQL user, create the database and give that user database-create permission for Prisma development:

```bash
sudo -u postgres psql
```

Then run inside `psql`:

```sql
CREATE USER transitops_user WITH PASSWORD 'transitops_password';
ALTER USER transitops_user CREATEDB;
CREATE DATABASE transitops OWNER transitops_user;
\q
```

If the user already exists, run this instead:

```sql
ALTER USER transitops_user WITH PASSWORD 'transitops_password';
ALTER USER transitops_user CREATEDB;
CREATE DATABASE transitops OWNER transitops_user;
```

Then your `backend/.env` should contain:

```env
DATABASE_URL="postgresql://transitops_user:transitops_password@localhost:5432/transitops"
PORT=5000
```

### Windows

Install PostgreSQL from the official installer. During installation, remember the password you set for the `postgres` user.

Open **SQL Shell (psql)** from the Start Menu. Press Enter for the default server, database, port, and username unless your setup is different. Enter your PostgreSQL password when asked.

Run:

```sql
CREATE USER transitops_user WITH PASSWORD 'transitops_password';
ALTER USER transitops_user CREATEDB;
CREATE DATABASE transitops OWNER transitops_user;
\q
```

Then set `backend/.env`:

```env
DATABASE_URL="postgresql://transitops_user:transitops_password@localhost:5432/transitops"
PORT=5000
```

If you prefer pgAdmin, create a login role named `transitops_user`, enable **Can create databases**, then create a database named `transitops` owned by that user.

## Database Migration And Seed

Prisma is configured in `backend/prisma.config.ts`. The schema, migrations, and seed data are in `backend/src/prisma`.

For normal setup on a teammate's machine, run this from the project root:

```bash
npm run db:deploy
npm run db:seed
```

Or from the backend folder:

```bash
cd backend
npm run db:deploy
npm run db:seed
```

Use `db:deploy` for setup because it applies the committed migrations exactly as they are. It does not need Prisma's shadow database.

## Running Locally

From the project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Useful Commands

Run from the project root:

```bash
npm run prisma:generate  # generate Prisma Client
npm run db:deploy        # apply committed migrations, best for setup and servers
npm run db:seed          # insert/update demo seed data
npm run db:studio        # open Prisma Studio
npm run db:migrate       # create a new migration after editing schema.prisma
npm run db:reset         # drop local DB data, reapply migrations, and seed
```

## When To Use db:deploy vs db:migrate

Use `npm run db:deploy` when:

- You cloned the project for the first time
- You pulled migrations from Git
- You are setting up a teammate's machine
- You are deploying to a server

Use `npm run db:migrate` only when:

- You changed `backend/src/prisma/schema.prisma`
- You want Prisma to create a new migration file

`db:migrate` runs `prisma migrate dev`, which uses a temporary shadow database. Your PostgreSQL user needs the `CREATEDB` permission for that command.

## Fixing Common Prisma/PostgreSQL Errors

### P3014: Prisma could not create the shadow database

This happens when running `npm run db:migrate` and the database user does not have permission to create databases.

Fix it by granting `CREATEDB`:

```sql
ALTER USER transitops_user CREATEDB;
```

On Linux/macOS you can open `psql` as the postgres admin user:

```bash
sudo -u postgres psql
```

On Windows, open **SQL Shell (psql)** or pgAdmin as the `postgres` admin user, then run the SQL command above.

Alternative: create a dedicated shadow database and add it to `backend/.env`:

```env
SHADOW_DATABASE_URL="postgresql://transitops_user:transitops_password@localhost:5432/transitops_shadow"
```

Create that database first:

```sql
CREATE DATABASE transitops_shadow OWNER transitops_user;
```

### P3005: The database schema is not empty

This happens when the database already has old or unrelated tables.

Best fix: create a fresh empty database and update `DATABASE_URL`.

Only if you intentionally want to delete local data, run:

```bash
npm run db:reset
```

### Authentication failed

Check that the username and password in `backend/.env` match your PostgreSQL user:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/transitops"
```

If your password has special characters like `@`, `#`, `%`, or `/`, URL-encode it or choose a simpler local development password.

## Fresh Setup Checklist For Teammates

1. Install Node.js, npm, Git, and PostgreSQL.
2. Clone the repository.
3. Run `npm run install:all` from the project root.
4. Create PostgreSQL user `transitops_user` with `CREATEDB` permission.
5. Create empty database `transitops` owned by `transitops_user`.
6. Copy `backend/.env.example` to `backend/.env`.
7. Set `DATABASE_URL` in `backend/.env`.
8. Run `npm run db:deploy`.
9. Run `npm run db:seed`.
10. Run `npm run dev`.
