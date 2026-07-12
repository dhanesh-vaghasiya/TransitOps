# TransitOps Platform

TransitOps is an end-to-end transport operations platform with a React SPA frontend and a Node.js/Express REST API backend, backed by PostgreSQL and Prisma.

---

## Prerequisites

- Node.js 18+
- PostgreSQL 15+

---

## Backend Setup

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```
*(On Windows: `Copy-Item .env.example .env`)*

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/transitops"
PORT=5000
NODE_ENV=development
```

### Database Migration

Apply migrations and seed the database:

```bash
npm run db:deploy
npm run db:seed
```

### Start the backend

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
- API runs on `http://localhost:5000/api`

Backend runs at: `http://localhost:5000`

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
- Frontend app runs on `http://localhost:5173`

Frontend runs at: `http://localhost:5173`

---

## Database Commands

Run from the `backend/` folder:

| Command | Description |
|---|---|
| `npm run db:migrate` | Create a new migration after editing `schema.prisma` |
| `npm run db:deploy` | Apply committed migrations (use for setup & servers) |
| `npm run db:seed` | Insert seed/demo data |
| `npm run db:reset` | Drop, recreate, migrate, and seed the local database |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run prisma:generate` | Regenerate Prisma Client after schema changes |
