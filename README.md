# TransitOps

TransitOps is a monorepo web application with a React SPA frontend and a Node.js/Express REST API backend, backed by PostgreSQL.

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL

### Installation
1. Clone the repository
2. Install all dependencies from root:
   ```bash
   npm run install:all
   ```
3. Set up the environment variables:
   - In `/backend`, edit `.env` and set your `DATABASE_URL` appropriately.
   - In `/frontend`, edit `.env` to point to the backend URL if different from default.

### Running Locally
To run both the frontend and backend concurrently:
```bash
npm run dev
```

- Frontend will be available at: http://localhost:5173 (or as per Vite's output)
- Backend will be available at: http://localhost:5000/api