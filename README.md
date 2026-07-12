# TransitOps Platform

TransitOps is an end-to-end transport operations platform with a React SPA frontend and a Node.js/Express REST API backend, backed by PostgreSQL and Prisma.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Git

## 1. Project Setup

Clone the repository and install dependencies from the root directory:

```bash
npm run install:all
```
*(Note: This runs `npm install` inside both the `frontend` and `backend` directories. We do not keep a `node_modules` folder in the root directory to ensure the separated environments remain clean).*

## 2. Environment Configuration

Copy the example environment file in the backend:

```bash
cd backend
cp .env.example .env
```
*(On Windows: `Copy-Item .env.example .env`)*

The `.env` file is pre-configured with the default database credentials for local development.

## 3. Database Setup

You need to create the database and user before running the server. Run the following SQL script in your PostgreSQL client (pgAdmin, DBeaver, or psql):

```sql
CREATE USER transitops_user WITH PASSWORD 'transitops_password';
ALTER USER transitops_user CREATEDB;
CREATE DATABASE transitops OWNER transitops_user;
```

## 4. Run Migrations & Seed Data

Once the database is created, navigate to the `backend` folder and apply the schema and demo data:

```bash
cd backend
npx prisma migrate dev
npm run db:seed
```

This step sets up the tables, SQL triggers, reporting views, and populates the database with the hackathon demo data (Vehicles, Drivers, Trips).

## 5. Running Locally

Because the frontend and backend are separate services, you should run them in two different terminal windows.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
- API runs on `http://localhost:5000/api`

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
- Frontend app runs on `http://localhost:5173`

---

### Database Management (Prisma Studio)
To easily view and edit data visually, you can start Prisma Studio from the backend folder:
```bash
cd backend
npm run db:studio
```
This opens a web UI at `http://localhost:5555`.
